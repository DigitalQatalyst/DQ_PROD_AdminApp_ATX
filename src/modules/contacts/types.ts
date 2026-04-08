/**
 * Contact Management Types
 */

export type ContactStatus = 'active' | 'inactive';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  organization_id: string | null;
  vendor_id: string | null;
  owner_id: string | null;
  status: ContactStatus;
  source: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (optional)
  organisation_name?: string;
  owner_name?: string;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  title: string;
  organization_id: string;
  vendor_id: string;
  owner_id: string;
  status: ContactStatus;
  source: string;
}

export interface ContactFilters {
  search: string;
  status: ContactStatus | 'all';
  owner_id: string;
}

export const EMPTY_CONTACT_FORM: ContactFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  mobile: '',
  title: '',
  organization_id: '',
  vendor_id: '',
  owner_id: '',
  status: 'active',
  source: '',
};
