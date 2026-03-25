/**
 * Contact Management Actions
 *
 * All mutations now go through the server-side ContactService.
 */

import { ContactService, ContactInput } from '../../api/contacts/contactService';
import type { Contact, ContactFormData } from './types';

/**
 * Create a new contact
 */
export async function createContact(
  data: ContactFormData
): Promise<{ data: Contact | null; error: string | null }> {
  try {
    const input: ContactInput = {
      ...data,
    };
    const created = await ContactService.createContact(input);
    return { data: created, error: null };
  } catch (error) {
    console.error('[Contacts] Error creating contact:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update an existing contact
 */
export async function updateContact(
  id: string,
  data: Partial<ContactFormData>
): Promise<{ data: Contact | null; error: string | null }> {
  try {
    const input: Partial<ContactInput> = {
      ...data,
    };
    const updated = await ContactService.updateContact(id, input);
    return { data: updated, error: null };
  } catch (error) {
    console.error('[Contacts] Error updating contact:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Soft delete a contact (set status to inactive)
 */
export async function deleteContact(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await ContactService.updateContact(id, { status: 'inactive' });
    return { success: true, error: null };
  } catch (error) {
    console.error('[Contacts] Error deleting contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check for duplicate email (non-blocking)
 * Note: Refactored to use listContacts for simple client-side check if backend doesn't support it
 */
export async function checkDuplicateEmail(
  email: string,
  excludeId?: string
): Promise<{ isDuplicate: boolean; error: string | null }> {
  try {
    const contacts = await ContactService.listContacts();
    const isDuplicate = contacts.some(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.id !== excludeId && c.status === 'active'
    );
    return { isDuplicate, error: null };
  } catch (error) {
    console.error('[Contacts] Error checking duplicate email:', error);
    return { isDuplicate: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Fetch a single contact by ID
 */
export async function fetchContact(
  id: string
): Promise<{ data: Contact | null; error: string | null }> {
  try {
    const contacts = await ContactService.listContacts();
    const contact = contacts.find((c) => c.id === id) || null;
    return { data: contact, error: null };
  } catch (error) {
    console.error('[Contacts] Error fetching contact:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
