import { LVERecord } from "../types";

// Lead Record Type
export interface Lead extends LVERecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'closed';
  source: string;
  value: number;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  notes: string;
}

// Contact Record Type
export interface Contact extends LVERecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  department: string;
  status: 'active' | 'inactive' | 'prospect';
  createdAt: string;
  lastContact: string;
  notes: string;
}

// Account Record Type
export interface Account extends LVERecord {
  id: string;
  name: string;
  type: 'prospect' | 'customer' | 'partner';
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  revenue: number;
  website: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'churned';
  owner: string;
  createdAt: string;
  lastActivity: string;
  notes: string;
}

// Mock Leads Data
export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "John Smith",
    email: "john.smith@techcorp.com",
    phone: "+1-555-0101",
    company: "TechCorp Solutions",
    status: "qualified",
    source: "Website",
    value: 25000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-15",
    lastActivity: "2024-01-20",
    notes: "Interested in enterprise package. Follow up next week."
  },
  {
    id: "lead-2",
    name: "Emily Davis",
    email: "emily.davis@innovate.io",
    phone: "+1-555-0102",
    company: "Innovate Labs",
    status: "contacted",
    source: "LinkedIn",
    value: 15000,
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-18",
    lastActivity: "2024-01-19",
    notes: "Requested demo for next month."
  },
  {
    id: "lead-3",
    name: "Robert Chen",
    email: "r.chen@startupx.com",
    phone: "+1-555-0103",
    company: "StartupX",
    status: "new",
    source: "Referral",
    value: 8000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-22",
    lastActivity: "2024-01-22",
    notes: "New lead from partner referral program."
  },
  {
    id: "lead-4",
    name: "Lisa Anderson",
    email: "lisa.a@megacorp.com",
    phone: "+1-555-0104",
    company: "MegaCorp Industries",
    status: "opportunity",
    source: "Trade Show",
    value: 50000,
    assignedTo: "David Brown",
    createdAt: "2024-01-10",
    lastActivity: "2024-01-21",
    notes: "Ready to move forward with proposal."
  },
  {
    id: "lead-5",
    name: "James Wilson",
    email: "james.w@smallbiz.net",
    phone: "+1-555-0105",
    company: "Small Business Co",
    status: "closed",
    source: "Cold Call",
    value: 5000,
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-05",
    lastActivity: "2024-01-15",
    notes: "Deal closed successfully."
  }
];

// Mock Contacts Data
export const mockContacts: Contact[] = [
  {
    id: "contact-1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@techcorp.com",
    phone: "+1-555-0201",
    company: "TechCorp Solutions",
    title: "VP of Engineering",
    department: "Engineering",
    status: "active",
    createdAt: "2023-12-01",
    lastContact: "2024-01-20",
    notes: "Key technical decision maker."
  },
  {
    id: "contact-2",
    firstName: "Bob",
    lastName: "Martinez",
    email: "bob.martinez@innovate.io",
    phone: "+1-555-0202",
    company: "Innovate Labs",
    title: "Product Manager",
    department: "Product",
    status: "active",
    createdAt: "2023-11-15",
    lastContact: "2024-01-18",
    notes: "Evaluating our platform for Q2 rollout."
  },
  {
    id: "contact-3",
    firstName: "Carol",
    lastName: "Thompson",
    email: "carol.t@startupx.com",
    phone: "+1-555-0203",
    company: "StartupX",
    title: "CTO",
    department: "Technology",
    status: "prospect",
    createdAt: "2024-01-10",
    lastContact: "2024-01-22",
    notes: "Interested in technical integration."
  }
];

// Mock Accounts Data
export const mockAccounts: Account[] = [
  {
    id: "account-1",
    name: "TechCorp Solutions",
    type: "customer",
    industry: "Technology",
    size: "large",
    revenue: 2500000,
    website: "https://techcorp.com",
    phone: "+1-555-0301",
    address: "123 Tech Street, San Francisco, CA 94105",
    status: "active",
    owner: "Sarah Johnson",
    createdAt: "2023-06-01",
    lastActivity: "2024-01-20",
    notes: "Strategic customer with expansion potential."
  },
  {
    id: "account-2",
    name: "Innovate Labs",
    type: "prospect",
    industry: "Research",
    size: "medium",
    revenue: 850000,
    website: "https://innovate.io",
    phone: "+1-555-0302",
    address: "456 Innovation Ave, Austin, TX 78701",
    status: "active",
    owner: "Mike Wilson",
    createdAt: "2023-11-01",
    lastActivity: "2024-01-19",
    notes: "Evaluating our solution for Q2 implementation."
  },
  {
    id: "account-3",
    name: "StartupX",
    type: "prospect",
    industry: "Software",
    size: "small",
    revenue: 150000,
    website: "https://startupx.com",
    phone: "+1-555-0303",
    address: "789 Startup Blvd, Seattle, WA 98101",
    status: "active",
    owner: "David Brown",
    createdAt: "2024-01-01",
    lastActivity: "2024-01-22",
    notes: "Early stage startup with growth potential."
  }
];