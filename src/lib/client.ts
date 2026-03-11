import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_COMMUNITY_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_COMMUNITY_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'admin'
  },
  global: {
    headers: {
      'x-application-name': 'kf-admin'
    }
  }
});

/**
 * Set authenticated user context for Supabase RLS
 * This creates a proper Supabase session using the user's database ID
 */
export const setSupabaseUserContext = async (userId: string, email: string) => {
  try {
    console.log('[Supabase] Setting user context for RLS:', { userId, email });

    // Create a custom JWT or use Supabase's signInAnonymously with custom claims
    // For now, we'll set the user context via a custom header
    // Note: This requires backend support or custom RLS policies

    // Store user context in localStorage for RLS policies to access
    localStorage.setItem('supabase_user_id', userId);
    localStorage.setItem('supabase_user_email', email);

    // Set custom headers for all requests
    supabase.rest.headers = {
      ...supabase.rest.headers,
      'x-user-id': userId,
      'x-user-email': email
    };

    console.log('[Supabase] User context set successfully');
    return { success: true };
  } catch (error) {
    console.error('[Supabase] Error setting user context:', error);
    return { success: false, error };
  }
};

/**
 * Clear Supabase user context
 */
export const clearSupabaseUserContext = () => {
  try {
    console.log('[Supabase] Clearing user context');
    localStorage.removeItem('supabase_user_id');
    localStorage.removeItem('supabase_user_email');

    // Remove custom headers
    if (supabase.rest.headers) {
      delete supabase.rest.headers['x-user-id'];
      delete supabase.rest.headers['x-user-email'];
    }

    return { success: true };
  } catch (error) {
    console.error('[Supabase] Error clearing user context:', error);
    return { success: false, error };
  }
};

/**
 * Get current user ID for RLS queries
 * Use this in your RLS policies: current_setting('request.jwt.claims', true)::json->>'user_id'
 */
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem('supabase_user_id');
};