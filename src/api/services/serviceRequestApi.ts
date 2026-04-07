import { ServiceRequest, ServiceRequestActivity, CreateServiceRequestInput, UpdateServiceRequestInput } from "../../modules/services/types";

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: string;
  message?: string;
}

const APP_API_BASE =
  import.meta.env.VITE_APP_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

const BASE_URL = `${APP_API_BASE}/api/service-requests`;

export class ServiceRequestApi {
  static async listServiceRequests(): Promise<ServiceRequest[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      throw new Error(`Failed to load service requests (${res.status})`);
    }
    const body: ApiResponse<ServiceRequest[]> = await res.json();
    return body.data || [];
  }

  static async getServiceRequest(id: string): Promise<ServiceRequest> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to load service request (${res.status})`);
    }
    const body: ApiResponse<ServiceRequest> = await res.json();
    if (!body.data) throw new Error("Service request data missing");
    return body.data;
  }

  static async createServiceRequest(input: CreateServiceRequestInput): Promise<ServiceRequest> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body: ApiResponse<ServiceRequest> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to create service request");
    }
    return body.data;
  }

  static async updateServiceRequest(id: string, input: UpdateServiceRequestInput): Promise<ServiceRequest> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body: ApiResponse<ServiceRequest> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to update service request");
    }
    return body.data;
  }

  static async listActivities(serviceRequestId: string): Promise<ServiceRequestActivity[]> {
    const res = await fetch(`${BASE_URL}/${serviceRequestId}/activities`);
    if (!res.ok) {
      throw new Error(`Failed to load activities (${res.status})`);
    }
    const body: ApiResponse<ServiceRequestActivity[]> = await res.json();
    return body.data || [];
  }

  static async logActivity(serviceRequestId: string, data: any): Promise<ServiceRequestActivity> {
    const res = await fetch(`${BASE_URL}/${serviceRequestId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body: ApiResponse<ServiceRequestActivity> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to log activity");
    }
    return body.data;
  }
}
