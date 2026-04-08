/**
 * Contact Management Actions
 *
 * All mutations go through these functions.
 * Uses getSupabaseClient() following the existing codebase pattern.
 */

import { getSupabaseClient } from '../../lib/dbClient';
import type { Contact, ContactFormData } from './types';

/**
 * Create a new contact
 */
export async function createContact(
  data: ContactFormData
): Promise<{ data: Contact | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not available' };

  const insertData: Record<string, unknown> = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    status: data.status || 'active',
  };

  // Only include optional fields if they have values
  if (data.phone) insertData.phone = data.phone;
  if (data.mobile) insertData.mobile = data.mobile;
  if (data.title) insertData.title = data.title;
  if (data.organization_id) insertData.organization_id = data.organization_id;
  if (data.vendor_id) insertData.vendor_id = data.vendor_id;
  if (data.owner_id) insertData.owner_id = data.owner_id;
  if (data.source) insertData.source = data.source;

  const { data: created, error } = await supabase
    .from('contacts')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[Contacts] Error creating contact:', error);
    return { data: null, error: error.message };
  }

  return { data: created as Contact, error: null };
}

/**
 * Update an existing contact
 */
export async function updateContact(
  id: string,
  data: Partial<ContactFormData>
): Promise<{ data: Contact | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not available' };

  const { data: updated, error } = await supabase
    .from('contacts')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Contacts] Error updating contact:', error);
    return { data: null, error: error.message };
  }

  return { data: updated as Contact, error: null };
}

/**
 * Soft delete a contact (set status to inactive)
 */
export async function deleteContact(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not available' };

  const { error } = await supabase
    .from('contacts')
    .update({ status: 'inactive' })
    .eq('id', id);

  if (error) {
    console.error('[Contacts] Error deleting contact:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Check for duplicate email (non-blocking)
 */
export async function checkDuplicateEmail(
  email: string,
  excludeId?: string
): Promise<{ isDuplicate: boolean; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { isDuplicate: false, error: 'Supabase client not available' };

  let query = supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('email', email)
    .eq('status', 'active');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Contacts] Error checking duplicate email:', error);
    return { isDuplicate: false, error: error.message };
  }

  return { isDuplicate: (data?.length ?? 0) > 0, error: null };
}

/**
 * Fetch a single contact by ID
 */
export async function fetchContact(
  id: string
): Promise<{ data: Contact | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Supabase client not available' };

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Contacts] Error fetching contact:', error);
    return { data: null, error: error.message };
  }

  return { data: data as Contact, error: null };
}
