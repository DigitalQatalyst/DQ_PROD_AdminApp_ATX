dbClient.ts:24   POST https://xlmmogtszqltophjpocy.supabase.co/rest/v1/partners?columns=%22name%22%2C%22description%22%2C%22year_established%22%2C%22website%22%2C%22email%22%2C%22phone%22%2C%22location%22%2C%22areas_of_expertise%22%2C%22logo_url%22%2C%22is_active%22%2C%22created_at%22%2C%22updated_at%22%2C%22organization_id%22%2C%22created_by%22&select=* 401 (Unauthorized)
fetchWithNoStore @ dbClient.ts:24
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
__awaiter8 @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:114
logger.ts:59  ❌ Error creating partners: Error: new row violates row-level security policy for table "partners"
    at useCRUD.ts:363:31
    at async handleSubmit (PartnersPage.tsx:120:7)