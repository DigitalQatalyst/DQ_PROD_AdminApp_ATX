-- Clean up existing data to avoid conflicts on re-seed
TRUNCATE TABLE public.user_profiles CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.organisations CASCADE;

-- SEED ORGANIZATIONS
INSERT INTO public.organisations (id, name, display_name, description, status, settings)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'acme-corp', 'Acme Corporation', 'Global technology leader', 'active', '{"theme": "dark", "allow_invites": true}'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'startup-inc', 'Startup Inc', 'Agile startup in fintech', 'active', '{"theme": "light"}'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'inactive-ltd', 'Inactive Ltd', 'Former partner', 'inactive', '{}');

-- SEED USERS
INSERT INTO public.users (id, email, name, role, organisation_id, avatar_url, phone, is_active)
VALUES
    -- Acme Corp Users
    ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'admin@acme.com', 'Alice Admin', 'admin', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', '+1234567890', true),
    ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380102', 'bob@acme.com', 'Bob Builder', 'editor', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', '+1234567891', true),
    
    -- Startup Inc Users
    ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 'carol@startup.com', 'Carol CEO', 'admin', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', '+1234567892', true),
    ('40eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'dave@startup.com', 'Dave Dev', 'viewer', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave', NULL, true);

-- SEED USER PROFILES
INSERT INTO public.user_profiles (user_id, organisation_id, organisation_name, customer_type, user_role, profile_data)
VALUES
    ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Corporation', 'Enterprise', 'Administrator', '{"department": "IT", "job_title": "CTO"}'),
    ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Corporation', 'Enterprise', 'Editor', '{"department": "Engineering", "job_title": "Senior Engineer"}'),
    ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Startup Inc', 'Startup', 'CEO', '{"bio": "Founder and CEO"}'),
    ('40eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Startup Inc', 'Startup', 'Developer', '{"skills": ["React", "Node.js"]}');

-- SEED TAXONOMIES (Assuming tables exist from prior migrations)
-- Insert a few categories if not exists
INSERT INTO public.taxonomies (id, label, key, kind, position)
VALUES 
    ('50eebc99-9c0b-4ef8-bb6d-6bb9bd380301', 'Development', 'development', 'Domain', 1),
    ('60eebc99-9c0b-4ef8-bb6d-6bb9bd380302', 'Design', 'design', 'Domain', 2),
    ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380303', 'Marketing', 'marketing', 'Domain', 3)
ON CONFLICT DO NOTHING;

-- SEED CONTENT (Articles, Toolkits)
INSERT INTO public.cnt_contents (id, title, slug, content_type, summary, status, visibility, published_at, metadata)
VALUES
    -- Article
    ('80eebc99-9c0b-4ef8-bb6d-6bb9bd380401', 'The Future of AI in Web Dev', 'future-ai-web-dev', 'Article', 'Exploring how AI agents are changing coding.', 'Published', 'Public', NOW(), 
     '{"author": "Alice Admin", "read_time": "5 min", "body_json": {}}'),

    -- Toolkit
    ('90eebc99-9c0b-4ef8-bb6d-6bb9bd380402', 'Startup Launchpad Toolkit', 'startup-launchpad', 'Toolkit', 'Everything you need to start your business.', 'Published', 'Public', NOW(),
     jsonb_build_object(
        'version', '1.0.0',
        'requirements', '[{"label": "Node.js", "value": "v18+"}]',
        'highlights', '[{"title": "Business Plan Template"}]',
        'attachments', '[{"name": "checklist.pdf", "url": "https://example.com/checklist.pdf"}]'
     ));

-- Note: Associate content with taxonomies if mapping table exists (e.g. cnt_contents_taxonomies)
INSERT INTO public.cnt_contents_taxonomies (content_id, taxonomy_id)
VALUES
    ('80eebc99-9c0b-4ef8-bb6d-6bb9bd380401', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380301'), -- Article -> Development
    ('90eebc99-9c0b-4ef8-bb6d-6bb9bd380402', '70eebc99-9c0b-4ef8-bb6d-6bb9bd380303')  -- Toolkit -> Marketing
ON CONFLICT DO NOTHING;

-- SEED SUPPORT TICKETS
INSERT INTO public.support_tickets (id, subject, description, status, priority, category, user_id, organization_id, created_at)
VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380501', 'Login issues', 'Cannot login to the dashboard from mobile.', 'open', 'high', 'technical', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 days'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380502', 'Billing question', 'Clarification on invoice #1234.', 'resolved', 'medium', 'billing', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW() - INTERVAL '5 days'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380503', 'Feature request: Dark mode', 'Please add dark mode.', 'pending_customer', 'low', 'feature_request', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '1 week');

-- SEED ACTIVITY LOGS
INSERT INTO public.activity_logs (id, user_id, action, entity_type, entity_id, details, organization_id, created_at)
VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380601', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'login', 'auth', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', '{"method": "password"}', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '1 hour'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380602', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'create', 'content', '80eebc99-9c0b-4ef8-bb6d-6bb9bd380401', '{"title": "The Future of AI"}', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '30 mins'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380603', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 'create', 'ticket', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380502', '{"subject": "Billing question"}', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW() - INTERVAL '5 days');

-- SEED LEAVE BALANCES
INSERT INTO public.leave_balances (user_id, year, annual_total, annual_used, sick_total, sick_used, personal_total, personal_used)
VALUES
    ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 2026, 30, 5, 14, 2, 5, 0), -- Admin
    ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 2026, 25, 10, 10, 0, 3, 1)  -- Viewer
ON CONFLICT DO NOTHING;

-- SEED LEAVE REQUESTS
INSERT INTO public.leave_requests (id, user_id, leave_type, start_date, end_date, reason, status, created_at)
VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380701', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'annual', NOW() + INTERVAL '1 month', NOW() + INTERVAL '1 month' + INTERVAL '5 days', 'Summer vacation', 'pending', NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380702', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'sick', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '2 days', 'Flu', 'approved', NOW() - INTERVAL '2 months');

-- SEED EMPLOYEE HUB CONTENT
INSERT INTO public.cnt_contents (id, title, slug, content_type, summary, status, visibility, published_at, metadata)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380801', 'Employee Handbook 2026', 'employee-handbook-2026', 'Policy', 'The complete guide to working at Digital Qatalyst.', 'Published', 'Public', NOW(), '{}'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380802', 'Remote Work Policy', 'remote-work-policy', 'Policy', 'Guidelines for working from home.', 'Published', 'Public', NOW(), '{}'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380803', 'IT Equipment Request Form', 'it-equipment-request', 'Form', 'Request laptops, monitors, or other hardware.', 'Published', 'Public', NOW(), '{"link": "#"}'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380804', 'Learning & Development Catalog', 'l-and-d-catalog', 'Resource', 'Browse available courses and certifications.', 'Published', 'Public', NOW(), '{}')
ON CONFLICT DO NOTHING;


