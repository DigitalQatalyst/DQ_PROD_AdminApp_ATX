/**
 * useContacts Hook
 *
 * Fetches the contacts list with search, filter, and realtime subscription.
 */

import { useState, useEffect, useCallback } from 'react';
import { ContactService } from '../../../api/contacts/contactService';
import type { Contact, ContactFilters } from '../types';

interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContacts(filters: ContactFilters): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ContactService.listContacts();
      
      // Apply local filters since the simple API might not support them yet
      let filtered = [...data];
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (filters.search) {
        const term = filters.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.first_name.toLowerCase().includes(term) || 
          c.last_name.toLowerCase().includes(term) || 
          c.email.toLowerCase().includes(term)
        );
      }

      setContacts(filtered);
    } catch (err) {
      console.error('[Contacts] Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, filters.owner_id]);

  // Initial fetch and re-fetch on filter changes
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Realtime subscription - disabled to match account pattern
  useEffect(() => {
    // Note: If you want to keep realtime, you'd need the API to support it 
    // or keep a direct Supabase connection just for listening.
  }, []);

  return { contacts, loading, error, refetch: fetchContacts };
}
