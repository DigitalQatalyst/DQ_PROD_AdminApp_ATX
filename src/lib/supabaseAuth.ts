/**
 * Supabase Authentication Module
 * 
 * Provides email/password authentication using Supabase Auth.
 * Role and segment are derived from user metadata or email patterns.
 * 
 * This works directly with Supabase Auth (auth.users) without requiring
 * custom tables in the public schema.
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for auth
// persistSession: false to disable auto-login from previous session
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export interface AppUserProfile {
  user_id: string;
  email: string;
  name?: string;
  organization_id: string;
  organization_name?: string;
  role: string;
  user_segment: string;
}

/**
 * Derive role and segment from email or user metadata
 * This maps test users to their appropriate roles
 */
function deriveRoleAndSegment(email: string, userMetadata?: Record<string, any>): { role: string; user_segment: string } {
  // Check user metadata first (set during user creation)
  if (userMetadata?.role && userMetadata?.user_segment) {
    return {
      role: userMetadata.role,
      user_segment: userMetadata.user_segment,
    };
  }

  // Derive from email patterns for test users
  const emailLower = email.toLowerCase();
  
  if (emailLower.includes('admin')) {
    return { role: 'admin', user_segment: 'internal' };
  }
  if (emailLower.includes('partner')) {
    return { role: 'editor', user_segment: 'partner' };
  }
  if (emailLower.includes('enterprise')) {
    return { role: 'viewer', user_segment: 'customer' };
  }
  
  // Default fallback
  return { role: 'viewer', user_segment: 'customer' };
}

/**
 * Build user profile from Supabase Auth user
 */
function buildProfileFromUser(user: User): AppUserProfile {
  const { role, user_segment } = deriveRoleAndSegment(
    user.email || '',
    user.user_metadata
  );

  // Use user metadata for org info, or derive from email domain
  const emailDomain = user.email?.split('@')[1]?.split('.')[0] || 'default';
  const organizationName = user.user_metadata?.organization_name || 
                          user.user_metadata?.organisationName ||
                          emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1);

  return {
    user_id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    organization_id: user.user_metadata?.organization_id || user.id,
    organization_name: organizationName,
    role,
    user_segment,
  };
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<{
  user: User | null;
  session: Session | null;
  profile: AppUserProfile | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, profile: null, error };
    }

    if (!data.user) {
      return { user: null, session: null, profile: null, error: new Error('No user returned') };
    }

    // Build profile from Supabase Auth user data
    const profile = buildProfileFromUser(data.user);

    return {
      user: data.user,
      session: data.session,
      profile,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      profile: null,
      error: err instanceof Error ? err : new Error('Sign in failed'),
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  metadata?: { name?: string; role?: string; user_segment?: string; organization_name?: string }
): Promise<{
  user: User | null;
  session: Session | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error('Sign up failed'),
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    // Clear local storage items used by the app
    localStorage.removeItem('azure_user_info');
    localStorage.removeItem('azure_customer_type');
    localStorage.removeItem('azure_user_role');
    localStorage.removeItem('azure_organisation_name');
    localStorage.removeItem('platform_admin_user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_segment');
    localStorage.removeItem('user_organization_id');
    localStorage.removeItem('user_role');
    
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Sign out failed') };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Fetch user profile - builds from Supabase Auth user data
 */
export async function fetchUserProfile(userId?: string): Promise<AppUserProfile | null> {
  const user = await getCurrentUser();
  
  if (!user) return null;
  if (userId && user.id !== userId) return null;

  return buildProfileFromUser(user);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Store user profile in localStorage for app compatibility
 */
export function storeUserProfileLocally(profile: AppUserProfile) {
  localStorage.setItem('azure_user_info', JSON.stringify({
    id: profile.user_id,
    email: profile.email,
    name: profile.name,
    organization_id: profile.organization_id,
  }));
  localStorage.setItem('azure_customer_type', profile.user_segment);
  localStorage.setItem('azure_user_role', profile.role);
  localStorage.setItem('azure_organisation_name', profile.organization_name || '');
  localStorage.setItem('user_id', profile.user_id);
  localStorage.setItem('user_segment', profile.user_segment);
  localStorage.setItem('user_role', profile.role);
  localStorage.setItem('user_organization_id', profile.organization_id);
  localStorage.setItem('platform_admin_user', JSON.stringify({
    id: profile.user_id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    organization_id: profile.organization_id,
  }));
}
