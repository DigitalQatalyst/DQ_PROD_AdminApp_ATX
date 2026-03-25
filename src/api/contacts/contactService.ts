import { Contact, ContactStatus } from "../../modules/contacts/types";

export interface ContactInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  organization_id?: string;
  vendor_id?: string;
  owner_id?: string;
  status?: ContactStatus;
  source?: string;
}

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: string;
  message?: string;
}

const APP_API_BASE =
  import.meta.env.VITE_APP_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

const BASE_URL = `${APP_API_BASE}/api/contacts`;

export class ContactService {
  static async listContacts(): Promise<Contact[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      throw new Error(`Failed to load contacts (${res.status})`);
    }
    const body: ApiResponse<Contact[]> = await res.json();
    return body.data || [];
  }

  static async createContact(input: ContactInput): Promise<Contact> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body: ApiResponse<Contact> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to create contact");
    }
    return body.data;
  }

  static async updateContact(id: string, input: Partial<ContactInput>): Promise<Contact> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body: ApiResponse<Contact> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to update contact");
    }
    return body.data;
  }
}
