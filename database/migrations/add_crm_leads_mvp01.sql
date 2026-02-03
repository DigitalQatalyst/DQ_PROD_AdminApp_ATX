-- Migration: Add CRM Leads (MVP01)
-- Description: Introduces lead management table and RLS policies
-- Date: 2026-01-29

-- ============================================
-- 1. Create crm_leads table
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."crm_leads" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "organization_name" TEXT,
    "organization_id" UUID,
    "related_user_id" UUID,
    "owner_id" UUID,
    "owner_name" TEXT,
    "source" TEXT DEFAULT 'Manual'::TEXT,
    "stage" TEXT DEFAULT 'New'::TEXT,
    "dedup_key" TEXT,
    "disqualify_reason" TEXT,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}'::JSONB,
    "qualified_at" TIMESTAMPTZ,
    "converted_at" TIMESTAMPTZ,
    "service_request_id" UUID,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "crm_leads_source_check" CHECK (
        "source" IN ('Login', 'Enquiry', 'Manual')
    ),
    CONSTRAINT "crm_leads_stage_check" CHECK (
        "stage" IN ('New', 'Qualifying', 'Qualified', 'Converted', 'Disqualified')
    )
);

ALTER TABLE "public"."crm_leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE ONLY "public"."crm_leads" FORCE ROW LEVEL SECURITY;
ALTER TABLE "public"."crm_leads" OWNER TO "postgres";

COMMENT ON TABLE "public"."crm_leads" IS 'CRM leads captured from login, enquiry, or manual entry';

-- ============================================
-- 2. Add foreign keys (only if referenced tables exist)
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'auth_users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_related_user_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_leads"
            ADD CONSTRAINT "crm_leads_related_user_id_fkey"
            FOREIGN KEY ("related_user_id")
            REFERENCES "public"."auth_users"("id")
            ON DELETE SET NULL;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_owner_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_leads"
            ADD CONSTRAINT "crm_leads_owner_id_fkey"
            FOREIGN KEY ("owner_id")
            REFERENCES "public"."auth_users"("id")
            ON DELETE SET NULL;
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'auth_organizations'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_organization_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_leads"
            ADD CONSTRAINT "crm_leads_organization_id_fkey"
            FOREIGN KEY ("organization_id")
            REFERENCES "public"."auth_organizations"("id")
            ON DELETE SET NULL;
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'crm_service_requests'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_service_request_id_fkey'
        ) THEN
            ALTER TABLE "public"."crm_leads"
            ADD CONSTRAINT "crm_leads_service_request_id_fkey"
            FOREIGN KEY ("service_request_id")
            REFERENCES "public"."crm_service_requests"("id")
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ============================================
-- 6. Grants (for Supabase API access)
-- ============================================

GRANT ALL ON TABLE "public"."crm_leads" TO "anon";
GRANT ALL ON TABLE "public"."crm_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_leads" TO "service_role";

-- ============================================
-- 3. Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_crm_leads_stage" ON "public"."crm_leads"("stage");
CREATE INDEX IF NOT EXISTS "idx_crm_leads_source" ON "public"."crm_leads"("source");
CREATE INDEX IF NOT EXISTS "idx_crm_leads_owner_id" ON "public"."crm_leads"("owner_id");
CREATE INDEX IF NOT EXISTS "idx_crm_leads_org_id" ON "public"."crm_leads"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_crm_leads_created_at" ON "public"."crm_leads"("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_crm_leads_enquiry_dedup"
  ON "public"."crm_leads"(dedup_key)
  WHERE source = 'Enquiry';

-- ============================================
-- 4. Updated_at trigger
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE TRIGGER "update_crm_leads_updated_at"
        BEFORE UPDATE ON "public"."crm_leads"
        FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
    END IF;
END $$;

-- ============================================
-- 5. RLS Policies (staff only)
-- ============================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "crm_leads_select_policy" ON "public"."crm_leads";
    DROP POLICY IF EXISTS "crm_leads_insert_policy" ON "public"."crm_leads";
    DROP POLICY IF EXISTS "crm_leads_update_policy" ON "public"."crm_leads";
    DROP POLICY IF EXISTS "crm_leads_delete_policy" ON "public"."crm_leads";
    DROP POLICY IF EXISTS "crm_leads_enquiry_insert_policy" ON "public"."crm_leads";
    DROP POLICY IF EXISTS "crm_leads_enquiry_update_policy" ON "public"."crm_leads";
    DROP POLICY IF EXISTS "admin_override" ON "public"."crm_leads";

    CREATE POLICY "admin_override" ON "public"."crm_leads"
        USING (current_setting('request.jwt.claim.role'::TEXT, true) = 'service_role'::TEXT)
        WITH CHECK (true);

    CREATE POLICY "crm_leads_select_policy" ON "public"."crm_leads"
        FOR SELECT
        USING (public.is_staff_user());

    CREATE POLICY "crm_leads_insert_policy" ON "public"."crm_leads"
        FOR INSERT
        WITH CHECK (public.is_staff_user());

    CREATE POLICY "crm_leads_update_policy" ON "public"."crm_leads"
        FOR UPDATE
        USING (public.is_staff_user())
        WITH CHECK (public.is_staff_user());

    -- Public enquiry ingestion (limited to Enquiry source)
    BEGIN
        CREATE POLICY "crm_leads_enquiry_insert_policy" ON "public"."crm_leads"
            FOR INSERT
            WITH CHECK (source = 'Enquiry');
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        CREATE POLICY "crm_leads_enquiry_update_policy" ON "public"."crm_leads"
            FOR UPDATE
            USING (source = 'Enquiry')
            WITH CHECK (source = 'Enquiry');
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    CREATE POLICY "crm_leads_delete_policy" ON "public"."crm_leads"
        FOR DELETE
        USING (public.is_staff_user());
END $$;
