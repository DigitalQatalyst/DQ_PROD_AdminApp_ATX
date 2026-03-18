export type AccountLifecycleStage =
  | "Prospect"
  | "Active Customer"
  | "Key Account"
  | "At Risk"
  | "Inactive"
  | "Closed";

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  country?: string;
  ownerName?: string;
  lifecycleStage?: AccountLifecycleStage;
  accountTier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountInput {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  country?: string;
  ownerName?: string;
  lifecycleStage?: AccountLifecycleStage;
  accountTier?: string;
}

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: string;
  message?: string;
}

// Base URL for the core app API (Express server), not the analytics API.
// Configure VITE_APP_API_URL in your .env, e.g. http://localhost:3001 for local dev.
const APP_API_BASE =
  import.meta.env.VITE_APP_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

const BASE_URL = `${APP_API_BASE}/api/accounts`;

export class AccountService {
  static async listAccounts(): Promise<Account[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      throw new Error(`Failed to load accounts (${res.status})`);
    }
    const body: ApiResponse<Account[]> = await res.json();
    return body.data || [];
  }

  static async createAccount(input: AccountInput): Promise<Account> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body: ApiResponse<Account> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to create account");
    }
    return body.data;
  }

  static async updateAccount(id: string, input: Partial<AccountInput>): Promise<Account> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body: ApiResponse<Account> = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      throw new Error(body.message || "Failed to update account");
    }
    return body.data;
  }
}

