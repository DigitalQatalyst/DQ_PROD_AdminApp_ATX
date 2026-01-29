-- Migration: Setup Supabase Auth integration with existing auth tables
-- This creates a trigger to auto-create app user profiles when Supabase auth users sign up

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id uuid;
  new_user_id uuid;
  user_role text;
  user_segment text;
BEGIN
  -- Determine role and segment based on email
  IF NEW.email LIKE '%admin%' THEN
    user_role := 'admin';
    user_segment := 'staff';
  ELSIF NEW.email LIKE '%partner%' THEN
    user_role := 'editor';
    user_segment := 'partner';
  ELSIF NEW.email LIKE '%enterprise%' THEN
    user_role := 'viewer';
    user_segment := 'enterprise';
  ELSE
    user_role := 'viewer';
    user_segment := 'staff';
  END IF;

  -- Get or create default organization
  SELECT id INTO default_org_id FROM public.auth_organizations WHERE name = 'default' LIMIT 1;
  
  IF default_org_id IS NULL THEN
    INSERT INTO public.auth_organizations (name, display_name, is_active)
    VALUES ('default', 'Default Organization', true)
    RETURNING id INTO default_org_id;
  END IF;

  -- Create entry in auth_users table
  INSERT INTO public.auth_users (id, email, name, azure_oid, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.id::text, -- Use Supabase user ID as azure_oid for compatibility
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW()
  RETURNING id INTO new_user_id;

  -- Create user profile
  INSERT INTO public.auth_user_profiles (user_id, organization_id, role, user_segment, created_at, updated_at)
  VALUES (
    new_user_id,
    default_org_id,
    user_role,
    user_segment,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, organization_id) DO UPDATE SET
    role = EXCLUDED.role,
    user_segment = EXCLUDED.user_segment,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed test users (run this after creating users in Supabase Auth dashboard)
-- Note: You need to create users via Supabase Dashboard or API first, then this will link them
