/**
 * Federated Authentication with Direct Supabase Integration
 *
 * Flow:
 * 1) Receive Azure ID token; extract oid + email
 * 2) Query Supabase (service role) for auth_users/auth_user_profiles
 * 3) Return app authorization context
 */

export interface UserAuthorizationContext {
  user_id: string;
  organization_id: string;
  organization_name?: string;
  role: string;
  user_segment: string;
  email: string;
  name?: string;
}

export function extractAzureOidFromToken(token: string): {
  oid: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  upn?: string;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT token format');
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    // Log ALL claims for debugging
    console.log('🔍 ALL Azure Token Claims:', payload);
    console.log('🔍 Available claim keys:', Object.keys(payload));

    const oid = payload.oid || payload.sub;
    const email = payload.email || payload.preferred_username || payload.upn || payload.unique_name || payload.signInNames?.[0]?.value || '';
    const name = payload.name || payload.displayName;
    const given_name = payload.given_name || payload.givenName;
    const family_name = payload.family_name || payload.familyName || payload.surname;
    const upn = payload.upn;

    if (!oid) throw new Error('Token missing required claim: oid');

    console.log('📋 Extracted user details from token:', {
      oid,
      email,
      name,
      given_name,
      family_name,
      upn
    });

    // Warn if email looks like it's using OID as username
    if (email.includes(oid)) {
      console.warn('⚠️ Email claim appears to be using Azure OID as username. This usually means:');
      console.warn('   1. The user is a guest/external user in Azure AD');
      console.warn('   2. The email claim is not properly configured in Azure B2C');
      console.warn('   3. Check Azure B2C User Flow to ensure email is included in token claims');
      console.warn('   Available claims in token:', Object.keys(payload).join(', '));
    }

    return { oid, email, name, given_name, family_name, upn };
  } catch (e) {
    console.error('Failed to extract Azure OID from token:', e);
    throw new Error('Invalid Azure token');
  }
}

async function createAdminSupabaseClient() {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  let supabaseKey = (
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();

  console.log('ENV check (Supabase):', {
    url: supabaseUrl,
    service_role_present: !!supabaseKey,
    anon_present: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    service_role_preview: supabaseKey ? supabaseKey.slice(0, 8) + '…' : 'null'
  });

  if (!supabaseUrl || !supabaseKey) {
    throw {
      error: 'invalid_api_key',
      message: 'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY for the new project.'
    };
  }
  if (supabaseKey.length < 60) {
    throw {
      error: 'invalid_api_key',
      message: 'Supabase service role key looks invalid or truncated. Double-check your .env values.'
    };
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getUserAuthorizationFromSupabase(
  azureOid: string,
  email: string,
  userDetails?: {
    name?: string;
    given_name?: string;
    family_name?: string;
    upn?: string;
  }
): Promise<UserAuthorizationContext> {
  try {
    const supabase = await createAdminSupabaseClient();
    console.log('Looking up user by azure_oid:', azureOid);

    const { data: user, error: userError } = await supabase
      .from('auth_users')
      .select('id, email, name, azure_oid')
      .eq('azure_oid', azureOid)
      .single();

    console.log('User query result:', { user, userError });

    if (userError || !user) {
      const msg = (userError as any)?.message || '';
      if (msg.includes('Invalid API key') || (userError as any)?.code === '401') {
        throw {
          error: 'invalid_api_key',
          message: 'Invalid Supabase API key. Double-check VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY point to the new project.',
          email,
          user_details: {
            name: userDetails?.name,
            email: email,
            given_name: userDetails?.given_name,
            family_name: userDetails?.family_name,
            upn: userDetails?.upn,
            azure_oid: azureOid
          }
        };
      }
      throw {
        error: 'user_not_provisioned',
        message: 'Your account has not been provisioned. Please contact your administrator to request access.',
        email,
        user_details: {
          name: userDetails?.name || `${userDetails?.given_name || ''} ${userDetails?.family_name || ''}`.trim() || 'Unknown',
          email: email,
          given_name: userDetails?.given_name,
          family_name: userDetails?.family_name,
          upn: userDetails?.upn,
          azure_oid: azureOid
        }
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('auth_user_profiles')
      .select('organization_id, role, user_segment')
      .eq('user_id', user.id)
      .single();

    console.log('Profile query result:', { profile, profileError });

    if (!profile || !profile.organization_id || !profile.role || !profile.user_segment) {
      throw {
        error: 'incomplete_profile',
        message: 'Your user profile is incomplete. Please contact your administrator.'
      };
    }

    let organizationName: string | null = null;
    if (profile.organization_id) {
      const { data: org } = await supabase
        .from('auth_organizations')
        .select('name, display_name')
        .eq('id', profile.organization_id)
        .single();
      organizationName = (org?.display_name as string) || (org?.name as string) || null;
    }

    console.log('User authorization loaded:', {
      user_id: user.id,
      organization_id: profile.organization_id,
      organization_name: organizationName,
      role: profile.role,
      user_segment: profile.user_segment
    });

    // Normalize role and user_segment to lowercase for consistent RBAC
    const normalizedRole = profile.role.toLowerCase().trim();
    const normalizedSegment = profile.user_segment.toLowerCase().trim();

    console.log('Normalized authorization:', {
      role: normalizedRole,
      user_segment: normalizedSegment
    });

    return {
      user_id: user.id,
      organization_id: profile.organization_id,
      organization_name: organizationName || undefined,
      role: normalizedRole,
      user_segment: normalizedSegment,
      email: user.email || email,
      name: user.name
    };
  } catch (error) {
    console.error('Failed to get user authorization from Supabase:', error);
    throw error;
  }
}

export async function exchangeAzureTokenForAuthorization(azureToken: string): Promise<UserAuthorizationContext> {
  console.log('Processing Azure token for authorization...');
  const { oid, email, name, given_name, family_name, upn } = extractAzureOidFromToken(azureToken);
  console.log('Azure identity extracted:', { oid, email, name, given_name, family_name, upn });
  const authContext = await getUserAuthorizationFromSupabase(oid, email, { name, given_name, family_name, upn });
  console.log('Authorization context loaded:', authContext);
  return authContext;
}

