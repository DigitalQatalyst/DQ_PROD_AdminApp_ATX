/**
 * Seed Test Users Script
 * 
 * Creates test users in Supabase Auth with role/segment metadata.
 * Run with: npx tsx scripts/seed-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
  user_segment: string;
  organization_name: string;
}

const testUsers: TestUser[] = [
  {
    email: 'partner@test.com',
    password: 'test@123',
    name: 'Partner User',
    role: 'editor',
    user_segment: 'partner',
    organization_name: 'Partner Org',
  },
  {
    email: 'admin@test.com',
    password: 'test@123',
    name: 'Admin User',
    role: 'admin',
    user_segment: 'internal',
    organization_name: 'Admin Org',
  },
  {
    email: 'enterprise@test.com',
    password: 'test@123',
    name: 'Enterprise User',
    role: 'viewer',
    user_segment: 'customer',
    organization_name: 'Enterprise Org',
  },
];

async function seedUsers() {
  console.log('Starting user seeding...\n');

  for (const user of testUsers) {
    console.log(`\nProcessing: ${user.email}`);

    // Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

    if (existingUser) {
      console.log(`  User already exists: ${existingUser.id}`);

      // Update password and metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: user.password,
        user_metadata: {
          name: user.name,
          role: user.role,
          user_segment: user.user_segment,
          organization_name: user.organization_name,
        },
      });
      
      if (updateError) {
        console.error(`  Failed to update user:`, updateError);
      } else {
        console.log(`  Updated password and metadata`);
      }
    } else {
      // Create new auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
          user_segment: user.user_segment,
          organization_name: user.organization_name,
        },
      });

      if (authError) {
        console.error(`  Failed to create auth user:`, authError);
        continue;
      }

      console.log(`  Created auth user: ${authData.user.id}`);
      console.log(`  Metadata: role=${user.role}, segment=${user.user_segment}`);
    }
  }

  console.log('\n✅ User seeding complete!');
  console.log('\nTest credentials:');
  testUsers.forEach((u) => {
    console.log(`  ${u.email} / ${u.password} (${u.role}, ${u.user_segment})`);
  });
}

seedUsers().catch(console.error);
