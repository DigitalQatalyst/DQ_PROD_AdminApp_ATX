import { getSupabaseClient } from './dbClient';

export type EnquiryLeadInput = {
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  organization_name?: string;
  notes?: string;
};

const normalize = (value?: string) => (value || '').trim().toLowerCase();

export async function createEnquiryLead(input: EnquiryLeadInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const email = normalize(input.contact_email);
  const phone = normalize(input.contact_phone);
  if (!email && !phone) {
    throw new Error('Email or phone is required');
  }

  const dedupKey = `${email || 'no-email'}|${phone || 'no-phone'}`;

  const { data, error } = await supabase
    .from('crm_leads')
    .upsert(
      {
        contact_name: input.contact_name || null,
        contact_email: input.contact_email || null,
        contact_phone: input.contact_phone || null,
        organization_name: input.organization_name || null,
        notes: input.notes || null,
        source: 'Enquiry',
        stage: 'New',
        dedup_key: dedupKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'dedup_key' }
    )
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
