/**
 * Supabase Service Role Client
 * 
 * Provides a Supabase client with service role permissions for administrative operations
 * like creating users, organizations, and user profiles.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Check environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Log configuration (without exposing full key)
console.log('🔧 Supabase Admin Client Configuration:');
console.log('   URL:', SUPABASE_URL || '❌ NOT SET');
console.log('   Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ NOT SET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('⚠️ WARNING: Supabase credentials not properly configured!');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Or: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
