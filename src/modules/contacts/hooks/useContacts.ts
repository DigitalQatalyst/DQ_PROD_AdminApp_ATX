/**
 * useContacts Hook
 *
 * Fetches the contacts list with search, filter, and realtime subscription.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../../../lib/dbClient';
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
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>['channel']> | null>(null);

  const fetchContacts = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply owner filter
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    // Apply search filter (name or email)
    if (filters.search) {
      const term = `%${filters.search}%`;
      query = query.or(
        `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
      );
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error('[Contacts] Error fetching contacts:', fetchError);
      setError(fetchError.message);
    } else {
      setContacts((data as Contact[]) || []);
    }

    setLoading(false);
  }, [filters.search, filters.status, filters.owner_id]);

  // Initial fetch and re-fetch on filter changes
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Realtime subscription
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Clean up any previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('contacts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => {
          console.log('[Contacts] Realtime event:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newContact = payload.new as Contact;
            setContacts((prev) => [newContact, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Contact;
            setContacts((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setContacts((prev) => prev.filter((c) => c.id !== deleted.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return { contacts, loading, error, refetch: fetchContacts };
}
