/**
 * Lead Management Module Types
 * Self-contained types for the CRM lead management feature.
 * These extend the domain model used in the prototype.
 */

export type LeadSource =
  | 'Website Form'
  | 'Email'
  | 'Chatbot'
  | 'Marketplace'
  | 'Webinar'
  | 'Referral'
  | 'Service Request'
  | 'Product Demo'
  | 'Tour Request'
  | 'Consultation'
  | 'Newsletter'
  | 'Whitepaper'
  | 'Waitlist'
  | 'Enquiry'
  | 'DMA'
  | 'Account Signup';

export type LeadStatus =
  | 'New'
  | 'Qualified'
  | 'Contacted'
  | 'Proposal Sent'
  | 'Converted'
  | 'Lost';

export type ServiceType =
  | 'DCO Assessment'
  | 'AI Strategy'
  | 'DTMI Licensing'
  | 'Digital Transformation'
  | 'Cloud Migration'
  | 'Data Analytics';

export type ActivityType =
  | 'call'
  | 'email'
  | 'note'
  | 'status_change'
  | 'meeting'
  | 'task'
  | 'assignment'
  | 'tag_change';

export type FormType =
  | 'service-request'
  | 'product-demo'
  | 'tour-request'
  | 'consultation'
  | 'newsletter'
  | 'whitepaper'
  | 'waitlist'
  | 'enquiry'
  | 'dma'
  | 'account-signup';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export type ViewType =
  | 'dashboard'
  | 'leads'
  | 'pipeline'
  | 'lead-detail'
  | 'analytics'
  | 'settings'
  | 'form-submissions'
  | 'email-list';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  user: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  service: ServiceType;
  status: LeadStatus;
  score: number;
  assignedTo: string;
  tags: string[];
  createdAt: string;
  notes: string;
  activities: Activity[];
  // Extended fields for Form Submissions
  priority?: LeadPriority;
  formType?: FormType;
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  projectTimeline?: string;
  budget?: string;
  productName?: string;
  productCode?: string;
  sector?: string;
  enquiryType?: string;
  groupSize?: string;
  preferredDate?: string;
  preferredTime?: string;
  whitepaperTitle?: string;
  suggestedRouting?: string;
  followUpSla?: string;
  formSubmittedAt?: string;
  message?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
}

export interface DashboardStats {
  totalLeads: number;
  conversionRate: number;
  avgResponseTime: string;
  pipelineValue: number;
  totalLeadsTrend: number;
  conversionTrend: number;
  responseTrend: number;
  pipelineTrend: number;
}

export interface FilterState {
  status: LeadStatus | 'All';
  source: LeadSource | 'All';
  assignedTo: string;
  scoreMin: number;
  scoreMax: number;
  search: string;
  formType: FormType | 'All';
}
