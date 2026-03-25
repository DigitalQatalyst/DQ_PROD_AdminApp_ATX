/**
 * Service Management Types
 */

export type ServiceRequestStatus = 
  | 'raised' 
  | 'triaged' 
  | 'in_progress' 
  | 'pending' 
  | 'resolved' 
  | 'closed' 
  | 'escalated';

export type ServiceRequestType = 'incident' | 'change' | 'request' | 'problem';

export type ServiceRequestPriority = 'low' | 'medium' | 'high' | 'critical';

export type ActivityType = 
  | 'note' 
  | 'status_change' 
  | 'assignment' 
  | 'escalation' 
  | 'resolution' 
  | 'system_trigger';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  type: ServiceRequestType;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  account_id: string | null;
  contact_id: string | null;
  lead_id: string | null;
  owner_id: string | null;
  resolved_by: string | null;
  sla_due_at: string | null;
  resolution_summary: string | null;
  lessons_learned: string | null;
  is_automated_trigger: boolean;
  recurrence_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  account_name?: string;
  contact_name?: string;
  owner_name?: string;
}

export interface ServiceRequestActivity {
  id: string;
  service_request_id: string;
  type: ActivityType;
  description: string;
  previous_status: ServiceRequestStatus | null;
  new_status: ServiceRequestStatus | null;
  created_by: string | null;
  created_at: string;
  metadata: any | null;
  // Joined fields
  creator_name?: string;
}

export interface ServiceRequestFilters {
  search: string;
  status: ServiceRequestStatus | 'all';
  type: ServiceRequestType | 'all';
  priority: ServiceRequestPriority | 'all';
  ownerId: string;
  accountId?: string;
}

export interface CreateServiceRequestInput {
  title: string;
  description?: string;
  type: ServiceRequestType;
  priority?: ServiceRequestPriority;
  account_id?: string;
  contact_id?: string;
  lead_id?: string;
  owner_id?: string;
  sla_due_at?: string;
  is_automated_trigger?: boolean;
}

export interface UpdateServiceRequestInput extends Partial<CreateServiceRequestInput> {
  status?: ServiceRequestStatus;
  resolution_summary?: string;
  lessons_learned?: string;
  resolved_by?: string;
  recurrence_count?: number;
}

export const EMPTY_SERVICE_REQUEST_FILTERS: ServiceRequestFilters = {
  search: '',
  status: 'all',
  type: 'all',
  priority: 'all',
  ownerId: '',
};
