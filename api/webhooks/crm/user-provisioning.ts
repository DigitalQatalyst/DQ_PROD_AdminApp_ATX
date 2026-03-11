/**
 * Vercel Serverless Function: CRM User Provisioning Webhook
 * 
 * This serverless function handles webhook notifications from Microsoft Dynamics 365 CRM
 * URL: /api/webhooks/crm/user-provisioning
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface CRMUserWebhookPayload {
    azure_oid?: string;
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
    updated_at?: string;
    event_type?: 'user.created' | 'user.updated' | 'user.deleted';
    timestamp?: string;
}

function verifyWebhookSignature(body: any, signature: string | undefined, secret: string): boolean {
    if (!signature) return false;

    const payload = JSON.stringify(body);
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

async function handleUserCreated(payload: CRMUserWebhookPayload) {
    console.log('👤 Creating new user in Supabase:', payload.azure_oid);

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

            if (createOrgError) {
                throw new Error(`Failed to create organization: ${createOrgError.message}`);
            }

            organizationId = newOrg.id;
            console.log('✅ Created new organization:', organizationId);
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

        if (userError || !newUser) {
            throw new Error(`Failed to create user: ${userError?.message || 'Unknown error'}`);
        }

        userId = newUser.id;
    }

    console.log('✅ User created/updated in auth_users:', userId);

    // 3. Create or update user profile
    const { data: existingProfile } = await supabaseAdmin
        .from('auth_user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

    if (existingProfile) {
        const { error: profileError } = await supabaseAdmin
            .from('auth_user_profiles')
            .update({
                organization_id: organizationId,
                role: payload.role || 'viewer',
                user_segment: payload.user_segment || 'partner',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (profileError) {
            throw new Error(`Failed to update user profile: ${profileError.message}`);
        }
    } else {
        const { error: profileError } = await supabaseAdmin
            .from('auth_user_profiles')
            .insert({
                user_id: userId,
                organization_id: organizationId,
                role: payload.role || 'viewer',
                user_segment: payload.user_segment || 'partner',
                created_at: payload.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
    }

    console.log('✅ User profile created/updated');
    console.log('🎉 User provisioning completed');
}

async function handleUserUpdated(payload: CRMUserWebhookPayload) {
    const { data: user, error: userError } = await supabaseAdmin
        .from('auth_users')
        .select('id')
        .eq('azure_oid', payload.azure_oid)
        .single();

    if (userError || !user) {
        await handleUserCreated(payload);
        return;
    }

    const userName = payload.full_name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim();

    await supabaseAdmin
        .from('auth_users')
        .update({
            email: payload.email,
            name: userName,
            phone: payload.phone,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    if (payload.role || payload.user_segment) {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (payload.role) updateData.role = payload.role;
        if (payload.user_segment) updateData.user_segment = payload.user_segment;

        await supabaseAdmin
            .from('auth_user_profiles')
            .update(updateData)
            .eq('user_id', user.id);
    }

    console.log('✅ User updated successfully');
}

async function handleUserDeleted(payload: CRMUserWebhookPayload) {
    const { error } = await supabaseAdmin
        .from('auth_users')
        .update({
            is_active: false,
            updated_at: new Date().toISOString()
        })
        .eq('azure_oid', payload.azure_oid);

    if (error) {
        throw new Error(`Failed to deactivate user: ${error.message}`);
    }

    console.log('✅ User deactivated successfully');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('📨 CRM Webhook received');

        // Verify webhook signature
        const webhookSecret = process.env.CRM_WEBHOOK_SECRET;
        if (webhookSecret) {
            const signature = req.headers['x-webhook-signature'] as string;
            const isValid = verifyWebhookSignature(req.body, signature, webhookSecret);

            if (!isValid) {
                console.error('❌ Invalid webhook signature');
                return res.status(401).json({
                    error: 'unauthorized',
                    message: 'Invalid webhook signature'
                });
            }
            console.log('✅ Webhook signature verified');
        }

        const payload: CRMUserWebhookPayload = req.body;

        if (!payload.azure_oid) {
            return res.status(400).json({
                error: 'bad_request',
                message: 'Missing required field: azure_oid'
            });
        }

        // Handle different event types
        switch (payload.event_type) {
            case 'user.created':
                await handleUserCreated(payload);
                break;
            case 'user.updated':
                await handleUserUpdated(payload);
                break;
            case 'user.deleted':
                await handleUserDeleted(payload);
                break;
            default:
                await handleUserCreated(payload);
        }

        return res.status(200).json({
            status: 'success',
            message: 'User provisioning completed',
            user_id: payload.azure_oid
        });

    } catch (error) {
        console.error('❌ CRM webhook error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            error: 'internal_server_error',
            message: errorMessage
        });
    }
}
