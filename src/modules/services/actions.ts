/**
 * Service Management Actions
 * 
 * Logic for service request lifecycle transitions and activity logging.
 */

import { ServiceRequestApi } from "../../api/services/serviceRequestApi";
import { 
  ServiceRequest, 
  CreateServiceRequestInput, 
  UpdateServiceRequestInput,
  ServiceRequestStatus,
  ActivityType
} from "./types";

/**
 * Helper to log an activity record
 */
export async function logActivity(
  serviceRequestId: string, 
  type: ActivityType, 
  description: string, 
  metadata: any = {}
) {
  try {
    return await ServiceRequestApi.logActivity(serviceRequestId, {
      type,
      description,
      metadata
    });
  } catch (error) {
    console.error('[Services] Error logging activity:', error);
    // Non-blocking for primary operation
  }
}

/**
 * Create a new service request
 */
export async function createServiceRequest(
  input: CreateServiceRequestInput
): Promise<{ data: ServiceRequest | null; error: string | null }> {
  try {
    const created = await ServiceRequestApi.createServiceRequest(input);
    
    // Log initial activity
    await logActivity(
      created.id, 
      'note', 
      'Service request created'
    );
    
    return { data: created, error: null };
  } catch (error) {
    console.error('[Services] Error creating service request:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update an existing service request
 */
export async function updateServiceRequest(
  id: string,
  input: UpdateServiceRequestInput,
  currentStatus?: ServiceRequestStatus
): Promise<{ data: ServiceRequest | null; error: string | null }> {
  try {
    // Sanitize input to only include valid update fields (prevent joined fields from breaking Supabase)
    const sanitizedInput: UpdateServiceRequestInput = {
      title: input.title,
      description: input.description,
      type: input.type,
      priority: input.priority,
      status: input.status,
      account_id: input.account_id,
      contact_id: input.contact_id,
      lead_id: input.lead_id,
      owner_id: input.owner_id,
      sla_due_at: input.sla_due_at,
      resolution_summary: input.resolution_summary,
      lessons_learned: input.lessons_learned,
      resolved_by: input.resolved_by,
      recurrence_count: input.recurrence_count,
    };

    // Remove undefined fields
    Object.keys(sanitizedInput).forEach(key => 
      (sanitizedInput as any)[key] === undefined && delete (sanitizedInput as any)[key]
    );

    const updated = await ServiceRequestApi.updateServiceRequest(id, sanitizedInput);
    
    // If status changed, log it
    if (input.status && input.status !== currentStatus) {
      await logActivity(
        id, 
        'status_change', 
        `Status changed from ${currentStatus || 'unknown'} to ${input.status}`,
        { previous_status: currentStatus, new_status: input.status }
      );
    }
    
    return { data: updated, error: null };
  } catch (error) {
    console.error('[Services] Error updating service request:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Escalate a service request
 */
export async function escalateServiceRequest(
  id: string,
  reason: string,
  currentRecurrenceCount: number = 0
): Promise<{ data: ServiceRequest | null; error: string | null }> {
  try {
    await ServiceRequestApi.updateServiceRequest(id, {
      status: 'escalated',
    });
    
    // In a real scenario, recurrence_count might be handled by the backend trigger,
    // but the prompt says "Increments recurrence_count" in the action.
    // However, our backend route is generic. I'll pass the incremented count.
    const finalUpdate = await ServiceRequestApi.updateServiceRequest(id, {
        recurrence_count: currentRecurrenceCount + 1
    });

    await logActivity(
      id, 
      'escalation', 
      `Request escalated: ${reason}`,
      { reason }
    );
    
    return { data: finalUpdate, error: null };
  } catch (error) {
    console.error('[Services] Error escalating service request:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Close a service request
 */
export async function closeServiceRequest(
  id: string,
  resolution_summary: string,
  lessons_learned?: string
): Promise<{ data: ServiceRequest | null; error: string | null }> {
  try {
    const updated = await ServiceRequestApi.updateServiceRequest(id, {
      status: 'closed',
      resolution_summary,
      lessons_learned
    });
    
    await logActivity(
      id, 
      'resolution', 
      'Service request closed'
    );
    
    return { data: updated, error: null };
  } catch (error) {
    console.error('[Services] Error closing service request:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Soft delete a service request
 */
export async function deleteServiceRequest(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await ServiceRequestApi.updateServiceRequest(id, {
      status: 'closed',
      resolution_summary: 'Deleted by administrator'
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('[Services] Error deleting service request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
