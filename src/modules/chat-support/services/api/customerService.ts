import { supabase, getCurrentUserId } from '../../../../lib/client';
import type { CustomerUser } from './types';

/**
 * Fetches customers from communities.users_local table
 * These are customers who have logged in to the customer app
 */
export const getCustomers = async (_organizationId?: string): Promise<CustomerUser[]> => {
    try {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
            console.warn('[CustomerService] No current user ID, returning empty list');
            return [];
        }

        // Query from communities schema
        // @ts-ignore - communities schema not in generated types
        const { data, error } = await supabase
            .schema('communities')
            .from('users_local')
            .select('id, email, username, avatar_url, external_id')
            .neq('id', currentUserId);

        if (error) {
            console.error('[CustomerService] Error fetching customers from communities:', error);
            return [];
        }

        // Map communities.users_local to CustomerUser
        // IMPORTANT: external_id from communities matches id in auth_users
        const customers: CustomerUser[] = (data || [])
            .filter((user: any) => user.external_id) // Only include users with external_id (synced to auth_users)
            .map((user: any) => ({
                id: user.external_id, // Use external_id as the main id (matches auth_users.id)
                username: user.username || user.email?.split('@')[0] || 'Customer',
                name: user.username,
                avatar_url: user.avatar_url || null,
                email: user.email || null,
                azureId: user.external_id,
            }));

        console.log('[CustomerService] Fetched customers from communities.users_local:', customers.length);
        return customers;
    } catch (err) {
        console.error('[CustomerService] Exception fetching customers:', err);
        return [];
    }
};

/**
 * Syncs a customer from communities.users_local to admin.auth_users
 * Called when a partner selects a customer to chat with
 * This ensures the customer exists in auth_users for FK constraints
 * Uses a database function with SECURITY DEFINER for elevated permissions
 */
export const syncCustomerToAuthUsers = async (customer: CustomerUser): Promise<void> => {
    try {
        console.log('[CustomerService] Syncing customer to auth_users:', customer.id);

        // Call the database function to sync customer
        // @ts-ignore - custom RPC function not in generated types
        const { data, error } = await supabase.rpc('sync_customer_for_chat', {
            p_customer_id: customer.id,
            p_email: customer.email,
            p_name: customer.username || customer.name,
            p_azure_oid: customer.azureId || null
        });

        if (error) {
            console.error('[CustomerService] Failed to sync customer to auth_users:', error);
            throw error;
        }

        // Check for application-level error in response
        const result = data as unknown as { success: boolean; error?: string } | null;
        if (result && !result.success) {
            console.error('[CustomerService] Sync function returned error:', result.error);
            throw new Error(result.error || 'Unknown sync error');
        }

        console.log('[CustomerService] Customer synced successfully:', customer.id);
    } catch (err) {
        console.error('[CustomerService] Exception syncing customer:', err);
        throw err;
    }
};

/**
 * Resolves a customer to their auth_users ID
 * Used when creating a conversation with a selected customer
 */
export const resolveCustomerUserId = async (customer: { id?: string | null; azureId?: string | null }): Promise<string> => {
    // If we already have the ID, return it
    if (customer.id) {
        return customer.id;
    }

    // Otherwise, look up by azure_oid
    const azureId = customer.azureId;
    if (!azureId) {
        throw new Error('[CustomerService] Customer has no id or azureId');
    }

    // @ts-ignore - auth_users table not in generated types
    const { data, error } = await supabase
        .from('auth_users')
        .select('id')
        .eq('azure_oid', azureId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    // @ts-ignore
    if (data?.id) {
        // @ts-ignore
        return data.id as string;
    }

    throw new Error(`[CustomerService] Customer not found in auth_users for azureId=${azureId}`);
};

