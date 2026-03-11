/**
 * Vercel Serverless Function: CRM User Provisioning Webhook
 * 
 * URL: /api/crm-webhook
 * Method: POST
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabase client — created safely to avoid module-level crashes
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: any;
try {
    if (SUPABASE_URL && SUPABASE_KEY) {
        supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }
} catch (e) {
    console.error('Failed to initialize Supabase client:', e);
}

interface CRMPayload {
    azure_oid?: string;
    azure_id?: string;   // CRM may send this instead of azure_oid
    azure_sub?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
    organization_id?: string;
    organization_name?: string;
    role?: string;
    user_segment?: string;
    crm_user_id?: string;
    created_at?: string;
    event_type?: 'user.created' | 'user.updated' | 'user.deleted';
}

async function provisionUser(payload: CRMPayload) {
    const crmRoleMap: Record<string, string> = {
        '123950000': 'admin',
        '123950001': 'approver',
        '123950002': 'editor',
        '123950003': 'viewer',
    };

    if (payload.role) {
        const roleValue = payload.role.toString().trim();
        payload.role = crmRoleMap[roleValue] || roleValue;
        // Final fallback: if still not a valid role, default to viewer
        const allowedRoles = ['admin', 'editor', 'approver', 'viewer'];
        if (!allowedRoles.includes(payload.role)) {
            console.log('Unknown role value:', roleValue, '- defaulting to viewer');
            payload.role = 'viewer';
        }
    } else {
        payload.role = 'viewer';
    }

    const allowedSegments = ['internal', 'partner', 'customer', 'advisor'];
    if (payload.user_segment) {
        payload.user_segment = payload.user_segment.toLowerCase().trim();
        if (!allowedSegments.includes(payload.user_segment)) {
            console.log('Unknown user_segment:', payload.user_segment, '- defaulting to partner');
            payload.user_segment = 'partner';
        }
    } else {
        payload.user_segment = 'partner';
    }

    console.log('Mapped user_segment:', payload.user_segment);

    // 1. Find or create organization
    let organizationId: string;

    if (payload.organization_id) {
        organizationId = payload.organization_id;
    } else if (payload.organization_name) {
        const { data: org, error: orgError } = await supabaseAdmin
            .from('auth_organizations')
            .select('id')
            .eq('name', payload.organization_name)
            .single();

        if (orgError && orgError.code !== 'PGRST116') {
            throw new Error(`Failed to lookup organization: ${orgError.message}`);
        }

        if (org) {
            organizationId = org.id;
        } else {
            const { data: newOrg, error: createOrgError } = await supabaseAdmin
                .from('auth_organizations')
                .insert({
                    name: payload.organization_name,
                    display_name: payload.organization_name,
                    status: 'Active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (createOrgError) throw new Error(`Failed to create organization: ${createOrgError.message}`);
            organizationId = newOrg.id;
        }
    } else {
        throw new Error('Missing organization information');
    }

    // 2. Check if user exists
    const { data: existingUser } = await supabaseAdmin
        .from('auth_users')
        .select('id')
        .eq('azure_oid', payload.azure_oid)
        .single();

    const userName = payload.full_name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim();
    let userId: string;

    if (existingUser) {
        await supabaseAdmin
            .from('auth_users')
            .update({
                azure_sub: payload.azure_sub,
                email: payload.email || `${payload.azure_oid}@unknown.com`,
                name: userName || 'Unknown User',
                phone: payload.phone,
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id);
        userId = existingUser.id;
    } else {
        const { data: newUser, error: userError } = await supabaseAdmin
            .from('auth_users')
            .insert({
                azure_oid: payload.azure_oid,
                azure_sub: payload.azure_sub,
                email: payload.email || `${payload.azure_oid}@unknown.com`,
                name: userName || 'Unknown User',
                phone: payload.phone,
                is_active: true,
                created_at: payload.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (userError || !newUser) throw new Error(`Failed to create user: ${userError?.message}`);
        userId = newUser.id;
    }

    // 3. Create or update user profile
    const { data: existingProfile } = await supabaseAdmin
        .from('auth_user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

    if (existingProfile) {
        const { error } = await supabaseAdmin
            .from('auth_user_profiles')
            .update({
                organization_id: organizationId,
                role: payload.role || 'viewer',
                user_segment: payload.user_segment || 'partner',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        if (error) throw new Error(`Failed to update profile: ${error.message}`);
    } else {
        const { error } = await supabaseAdmin
            .from('auth_user_profiles')
            .insert({
                user_id: userId,
                organization_id: organizationId,
                role: payload.role || 'viewer',
                user_segment: payload.user_segment || 'partner',
                created_at: payload.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        if (error) throw new Error(`Failed to create profile: ${error.message}`);
    }

    return userId;
}

async function deactivateUser(azureOid: string) {
    const { error } = await supabaseAdmin
        .from('auth_users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('azure_oid', azureOid);
    if (error) throw new Error(`Failed to deactivate user: ${error.message}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('CRM Webhook received:', req.method);
        console.log('Payload:', JSON.stringify(req.body));
        console.log('Supabase configured:', !!supabaseAdmin);

        if (!supabaseAdmin) {
            return res.status(500).json({
                error: 'configuration_error',
                message: 'Supabase not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
            });
        }

        const payload: CRMPayload = req.body;

        // Accept both azure_id (from CRM) and azure_oid
        if (payload.azure_id && !payload.azure_oid) {
            payload.azure_oid = payload.azure_id;
        }

        if (!payload.azure_oid) {
            return res.status(400).json({ error: 'bad_request', message: 'Missing required field: azure_oid or azure_id' });
        }

        switch (payload.event_type) {
            case 'user.deleted':
                await deactivateUser(payload.azure_oid);
                break;
            case 'user.updated':
            case 'user.created':
            default:
                await provisionUser(payload);
        }

        return res.status(200).json({
            status: 'success',
            message: 'User provisioning completed',
            user_id: payload.azure_oid
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ CRM webhook error:', msg);
        return res.status(500).json({ error: 'internal_server_error', message: msg });
    }
}
