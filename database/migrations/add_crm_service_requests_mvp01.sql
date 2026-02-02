-- Migration: Add CRM Service Requests (MVP01)
-- Description: Adds service request (opportunity) table for lead conversion
-- Date: 2026-01-30

-- ============================================
-- 1. Create crm_service_requests table
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."crm_service_requests" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "lead_id" UUID NOT NULL,
    "organization_id" UUID,
    "owner_id" UUID,
    "source" TEXT DEFAULT 'Manual'::TEXT,
    "status" TEXT DEFAULT 'Open'::TEXT,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}'::JSONB,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT "crm_service_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "crm_service_requests_status_check" CHECK (
        "status" IN ('Open', 'In Progress', 'Closed')
    )
);

ALTER TABLE "public"."crm_service_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE ONLY "public"."crm_service_requests" FORCE ROW LEVEL SECURITY;
ALTER TABLE "public"."crm_service_requests" OWNER TO "postgres";

COMMENT ON TABLE "public"."crm_service_requests" IS 'CRM service requests created from qualified leads';

-- ============================================
-- 2. Foreign keys
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'crm_leads'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_service_requests_lead_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_service_requests"
            ADD CONSTRAINT "crm_service_requests_lead_id_fkey"
            FOREIGN KEY ("lead_id")
            REFERENCES "public"."crm_leads"("id")
            ON DELETE CASCADE;
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'auth_organizations'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_service_requests_org_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_service_requests"
            ADD CONSTRAINT "crm_service_requests_org_id_fkey"
            FOREIGN KEY ("organization_id")
            REFERENCES "public"."auth_organizations"("id")
            ON DELETE SET NULL;
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'auth_users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_service_requests_owner_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_service_requests"
            ADD CONSTRAINT "crm_service_requests_owner_id_fkey"
            FOREIGN KEY ("owner_id")
            REFERENCES "public"."auth_users"("id")
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ============================================
-- 6. Grants (for Supabase API access)
-- ============================================

GRANT ALL ON TABLE "public"."crm_service_requests" TO "anon";
GRANT ALL ON TABLE "public"."crm_service_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_service_requests" TO "service_role";

-- ============================================
-- 3. Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_crm_service_requests_lead_id" ON "public"."crm_service_requests"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_crm_service_requests_owner_id" ON "public"."crm_service_requests"("owner_id");
CREATE INDEX IF NOT EXISTS "idx_crm_service_requests_status" ON "public"."crm_service_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_crm_service_requests_created_at" ON "public"."crm_service_requests"("created_at");

-- ============================================
-- 4. Updated_at trigger
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE TRIGGER "update_crm_service_requests_updated_at"
        BEFORE UPDATE ON "public"."crm_service_requests"
        FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
    END IF;
END $$;

-- ============================================
-- 5. RLS Policies (staff only)
-- ============================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "crm_service_requests_select_policy" ON "public"."crm_service_requests";
    DROP POLICY IF EXISTS "crm_service_requests_insert_policy" ON "public"."crm_service_requests";
    DROP POLICY IF EXISTS "crm_service_requests_update_policy" ON "public"."crm_service_requests";
    DROP POLICY IF EXISTS "crm_service_requests_delete_policy" ON "public"."crm_service_requests";
    DROP POLICY IF EXISTS "admin_override" ON "public"."crm_service_requests";

    CREATE POLICY "admin_override" ON "public"."crm_service_requests"
        USING (current_setting('request.jwt.claim.role'::TEXT, true) = 'service_role'::TEXT)
        WITH CHECK (true);

    CREATE POLICY "crm_service_requests_select_policy" ON "public"."crm_service_requests"
        FOR SELECT
        USING (public.is_staff_user());

    CREATE POLICY "crm_service_requests_insert_policy" ON "public"."crm_service_requests"
        FOR INSERT
        WITH CHECK (public.is_staff_user());

    CREATE POLICY "crm_service_requests_update_policy" ON "public"."crm_service_requests"
        FOR UPDATE
        USING (public.is_staff_user())
        WITH CHECK (public.is_staff_user());

    CREATE POLICY "crm_service_requests_delete_policy" ON "public"."crm_service_requests"
        FOR DELETE
        USING (public.is_staff_user());
END $$;
