-- Migration: Add Service Forms and Enhanced Services Schema
-- Description: Adds service forms with dynamic fields and enhances services table with all required fields
-- Date: 2025-01-XX

-- ============================================
-- 1. Enhance mktplc_services table with new fields
-- ============================================

-- Add new columns to services table
ALTER TABLE IF EXISTS "public"."mktplc_services"
ADD COLUMN IF NOT EXISTS "business_stage" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "key_highlights" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "eligibility_requirements" TEXT,
ADD COLUMN IF NOT EXISTS "application_process" TEXT,
ADD COLUMN IF NOT EXISTS "required_documents" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "provider_name" TEXT,
ADD COLUMN IF NOT EXISTS "provider_year_established" INTEGER,
ADD COLUMN IF NOT EXISTS "provider_description" TEXT,
ADD COLUMN IF NOT EXISTS "provider_areas_of_expertise" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "provider_website" TEXT,
ADD COLUMN IF NOT EXISTS "provider_email" TEXT,
ADD COLUMN IF NOT EXISTS "provider_location" TEXT,
ADD COLUMN IF NOT EXISTS "provider_contact" TEXT,
ADD COLUMN IF NOT EXISTS "provider_services" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "service_amount" TEXT,
ADD COLUMN IF NOT EXISTS "service_processing_time" TEXT,
ADD COLUMN IF NOT EXISTS "service_eligibility" TEXT,
ADD COLUMN IF NOT EXISTS "service_interest_rates" TEXT;

-- Add check constraint for business_stage (only if table exists)
DO $$
BEGIN
    -- Check if table exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mktplc_services'
    ) THEN
        -- Check if constraint doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'services_business_stage_check'
        ) THEN
            ALTER TABLE "public"."mktplc_services"
            ADD CONSTRAINT "services_business_stage_check" CHECK (
                "business_stage" <@ ARRAY['startup', 'investor', 'expansion', 'sme', 'exporter', 'early stage']::TEXT[]
            );
        END IF;
    END IF;
END $$;

-- ============================================
-- 2. Create service_forms table
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."mktplc_service_forms" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "service_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "organization_id" UUID,
    
    CONSTRAINT "service_forms_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint only if mktplc_services table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mktplc_services'
    ) THEN
        -- Check if foreign key doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'mktplc_service_forms_service_id_fkey'
        ) THEN
            ALTER TABLE "public"."mktplc_service_forms"
            ADD CONSTRAINT "mktplc_service_forms_service_id_fkey" 
            FOREIGN KEY ("service_id") 
            REFERENCES "public"."mktplc_services"("id") 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_service_forms_service_id" ON "public"."mktplc_service_forms"("service_id");
CREATE INDEX IF NOT EXISTS "idx_service_forms_organization_id" ON "public"."mktplc_service_forms"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_service_forms_is_active" ON "public"."mktplc_service_forms"("is_active");

-- ============================================
-- 3. Create service_form_fields table (for dynamic fields)
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."mktplc_service_form_fields" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "form_id" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL DEFAULT 'text',
    "field_order" INTEGER DEFAULT 0,
    "is_required" BOOLEAN DEFAULT false,
    "placeholder" TEXT,
    "help_text" TEXT,
    "default_value" TEXT,
    "validation_rules" JSONB DEFAULT '{}',
    "options" JSONB DEFAULT '[]', -- For select, radio, checkbox fields
    "field_config" JSONB DEFAULT '{}', -- Additional field configuration
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT "service_form_fields_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "service_form_fields_type_check" CHECK (
        "field_type" IN (
            'text', 'textarea', 'email', 'number', 'tel', 'url', 
            'date', 'datetime', 'time', 'select', 'multiselect', 
            'radio', 'checkbox', 'file', 'boolean', 'rich_text'
        )
    )
);

-- Add foreign key constraint only if mktplc_service_forms table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mktplc_service_forms'
    ) THEN
        -- Check if foreign key doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'mktplc_service_form_fields_form_id_fkey'
        ) THEN
            ALTER TABLE "public"."mktplc_service_form_fields"
            ADD CONSTRAINT "mktplc_service_form_fields_form_id_fkey" 
            FOREIGN KEY ("form_id") 
            REFERENCES "public"."mktplc_service_forms"("id") 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_service_form_fields_form_id" ON "public"."mktplc_service_form_fields"("form_id");
CREATE INDEX IF NOT EXISTS "idx_service_form_fields_field_order" ON "public"."mktplc_service_form_fields"("form_id", "field_order");

-- ============================================
-- 4. Create service_form_submissions table (for storing form submissions)
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."mktplc_service_form_submissions" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "form_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "submission_data" JSONB NOT NULL DEFAULT '{}',
    "submitted_by" UUID,
    "submitted_at" TIMESTAMPTZ DEFAULT NOW(),
    "status" TEXT DEFAULT 'pending',
    "organization_id" UUID,
    
    CONSTRAINT "service_form_submissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "service_form_submissions_status_check" CHECK (
        "status" IN ('pending', 'reviewed', 'approved', 'rejected', 'archived')
    )
);

-- Add foreign key constraints only if referenced tables exist
DO $$
BEGIN
    -- Add foreign key to service_forms if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mktplc_service_forms'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'mktplc_service_form_submissions_form_id_fkey'
        ) THEN
            ALTER TABLE "public"."mktplc_service_form_submissions"
            ADD CONSTRAINT "mktplc_service_form_submissions_form_id_fkey" 
            FOREIGN KEY ("form_id") 
            REFERENCES "public"."mktplc_service_forms"("id") 
            ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key to mktplc_services if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mktplc_services'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'mktplc_service_form_submissions_service_id_fkey'
        ) THEN
            ALTER TABLE "public"."mktplc_service_form_submissions"
            ADD CONSTRAINT "mktplc_service_form_submissions_service_id_fkey" 
            FOREIGN KEY ("service_id") 
            REFERENCES "public"."mktplc_services"("id") 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_service_form_submissions_form_id" ON "public"."mktplc_service_form_submissions"("form_id");
CREATE INDEX IF NOT EXISTS "idx_service_form_submissions_service_id" ON "public"."mktplc_service_form_submissions"("service_id");
CREATE INDEX IF NOT EXISTS "idx_service_form_submissions_status" ON "public"."mktplc_service_form_submissions"("status");
CREATE INDEX IF NOT EXISTS "idx_service_form_submissions_submitted_at" ON "public"."mktplc_service_form_submissions"("submitted_at");

-- ============================================
-- 5. Enable Row Level Security
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_forms') THEN
        ALTER TABLE ONLY "public"."mktplc_service_forms" FORCE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_form_fields') THEN
        ALTER TABLE ONLY "public"."mktplc_service_form_fields" FORCE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_form_submissions') THEN
        ALTER TABLE ONLY "public"."mktplc_service_form_submissions" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- 6. Create RLS Policies
-- ============================================

-- Service Forms Policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_forms') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "service_forms_select_policy" ON "public"."mktplc_service_forms";
        DROP POLICY IF EXISTS "service_forms_insert_policy" ON "public"."mktplc_service_forms";
        DROP POLICY IF EXISTS "service_forms_update_policy" ON "public"."mktplc_service_forms";
        DROP POLICY IF EXISTS "service_forms_delete_policy" ON "public"."mktplc_service_forms";
        
        -- Create policies
        CREATE POLICY "service_forms_select_policy" ON "public"."mktplc_service_forms"
            FOR SELECT
            USING (
                organization_id IS NULL OR 
                organization_id = current_setting('app.current_organization_id', true)::UUID OR
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'approver', 'creator', 'contributor', 'viewer')
                )
            );

        CREATE POLICY "service_forms_insert_policy" ON "public"."mktplc_service_forms"
            FOR INSERT
            WITH CHECK (
                organization_id = current_setting('app.current_organization_id', true)::UUID AND
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'creator', 'contributor')
                )
            );

        CREATE POLICY "service_forms_update_policy" ON "public"."mktplc_service_forms"
            FOR UPDATE
            USING (
                organization_id = current_setting('app.current_organization_id', true)::UUID AND
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'creator', 'contributor')
                )
            );

        CREATE POLICY "service_forms_delete_policy" ON "public"."mktplc_service_forms"
            FOR DELETE
            USING (
                organization_id = current_setting('app.current_organization_id', true)::UUID AND
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Service Form Fields Policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_form_fields') THEN
        DROP POLICY IF EXISTS "service_form_fields_select_policy" ON "public"."mktplc_service_form_fields";
        DROP POLICY IF EXISTS "service_form_fields_insert_policy" ON "public"."mktplc_service_form_fields";
        DROP POLICY IF EXISTS "service_form_fields_update_policy" ON "public"."mktplc_service_form_fields";
        DROP POLICY IF EXISTS "service_form_fields_delete_policy" ON "public"."mktplc_service_form_fields";
        
        -- Create policies
        CREATE POLICY "service_form_fields_select_policy" ON "public"."mktplc_service_form_fields"
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM mktplc_service_forms sf
                    JOIN auth_user_profiles aup ON sf.organization_id = aup.organization_id
                    WHERE sf.id = form_id
                    AND aup.user_id = auth.uid()
                    AND (
                        sf.organization_id IS NULL OR 
                        sf.organization_id = current_setting('app.current_organization_id', true)::UUID OR
                        aup.role IN ('admin', 'approver', 'creator', 'contributor', 'viewer')
                    )
                )
            );

        CREATE POLICY "service_form_fields_insert_policy" ON "public"."mktplc_service_form_fields"
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM mktplc_service_forms sf
                    JOIN auth_user_profiles aup ON sf.organization_id = aup.organization_id
                    WHERE sf.id = form_id
                    AND aup.user_id = auth.uid()
                    AND sf.organization_id = current_setting('app.current_organization_id', true)::UUID
                    AND aup.role IN ('admin', 'creator', 'contributor')
                )
            );

        CREATE POLICY "service_form_fields_update_policy" ON "public"."mktplc_service_form_fields"
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM mktplc_service_forms sf
                    JOIN auth_user_profiles aup ON sf.organization_id = aup.organization_id
                    WHERE sf.id = form_id
                    AND aup.user_id = auth.uid()
                    AND sf.organization_id = current_setting('app.current_organization_id', true)::UUID
                    AND aup.role IN ('admin', 'creator', 'contributor')
                )
            );

        CREATE POLICY "service_form_fields_delete_policy" ON "public"."mktplc_service_form_fields"
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM mktplc_service_forms sf
                    JOIN auth_user_profiles aup ON sf.organization_id = aup.organization_id
                    WHERE sf.id = form_id
                    AND aup.user_id = auth.uid()
                    AND sf.organization_id = current_setting('app.current_organization_id', true)::UUID
                    AND aup.role = 'admin'
                )
            );
    END IF;
END $$;

-- Service Form Submissions Policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_form_submissions') THEN
        DROP POLICY IF EXISTS "service_form_submissions_select_policy" ON "public"."mktplc_service_form_submissions";
        DROP POLICY IF EXISTS "service_form_submissions_insert_policy" ON "public"."mktplc_service_form_submissions";
        DROP POLICY IF EXISTS "service_form_submissions_update_policy" ON "public"."mktplc_service_form_submissions";
        
        -- Create policies
        CREATE POLICY "service_form_submissions_select_policy" ON "public"."mktplc_service_form_submissions"
            FOR SELECT
            USING (
                organization_id IS NULL OR 
                organization_id = current_setting('app.current_organization_id', true)::UUID OR
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'approver', 'creator', 'contributor', 'viewer')
                )
            );

        CREATE POLICY "service_form_submissions_insert_policy" ON "public"."mktplc_service_form_submissions"
            FOR INSERT
            WITH CHECK (
                organization_id = current_setting('app.current_organization_id', true)::UUID OR
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'creator', 'contributor')
                )
            );

        CREATE POLICY "service_form_submissions_update_policy" ON "public"."mktplc_service_form_submissions"
            FOR UPDATE
            USING (
                organization_id = current_setting('app.current_organization_id', true)::UUID AND
                EXISTS (
                    SELECT 1 FROM auth_user_profiles
                    WHERE user_id = auth.uid()
                    AND role IN ('admin', 'approver', 'creator', 'contributor')
                )
            );
    END IF;
END $$;

-- ============================================
-- 7. Add comments
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_forms') THEN
        COMMENT ON TABLE "public"."mktplc_service_forms" IS 'Service forms tied to specific services';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_form_fields') THEN
        COMMENT ON TABLE "public"."mktplc_service_form_fields" IS 'Dynamic fields for service forms (CRM-style field builder)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_service_form_submissions') THEN
        COMMENT ON TABLE "public"."mktplc_service_form_submissions" IS 'Submissions for service forms';
    END IF;
    
    -- Add column comments only if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mktplc_services') THEN
        COMMENT ON COLUMN "public"."mktplc_services"."business_stage" IS 'Business stages: startup, investor, expansion, sme, exporter, early stage';
        COMMENT ON COLUMN "public"."mktplc_services"."key_highlights" IS 'Key highlights of the service';
        COMMENT ON COLUMN "public"."mktplc_services"."eligibility_requirements" IS 'Eligibility requirements text';
        COMMENT ON COLUMN "public"."mktplc_services"."application_process" IS 'Application process description';
        COMMENT ON COLUMN "public"."mktplc_services"."required_documents" IS 'Required documents array';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_name" IS 'Provider name';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_year_established" IS 'Provider year of establishment';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_description" IS 'Provider description';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_areas_of_expertise" IS 'Provider areas of expertise';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_website" IS 'Provider website URL';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_email" IS 'Provider email';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_location" IS 'Provider location';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_contact" IS 'Provider contact information';
        COMMENT ON COLUMN "public"."mktplc_services"."provider_services" IS 'Provider services list';
        COMMENT ON COLUMN "public"."mktplc_services"."service_amount" IS 'Service amount/cost';
        COMMENT ON COLUMN "public"."mktplc_services"."service_processing_time" IS 'Service processing time';
        COMMENT ON COLUMN "public"."mktplc_services"."service_eligibility" IS 'Service eligibility details';
        COMMENT ON COLUMN "public"."mktplc_services"."service_interest_rates" IS 'Service interest rates (for financial services)';
    END IF;
END $$;

