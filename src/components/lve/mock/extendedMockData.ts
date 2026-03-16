import { Lead, Contact, Account } from "./mockData";

// Extended Lead Data (30+ records for comprehensive testing)
export const extendedMockLeads: Lead[] = [
  // Existing leads
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
  },
  // Additional qualified leads
  {
    id: "lead-6",
    name: "Maria Rodriguez",
    email: "maria.r@globaltech.com",
    phone: "+1-555-0106",
    company: "GlobalTech Inc",
    status: "qualified",
    source: "Website",
    value: 35000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-12",
    lastActivity: "2024-01-20",
    notes: "Qualified through BANT criteria. Budget approved."
  },
  {
    id: "lead-7",
    name: "David Kim",
    email: "d.kim@financeplus.com",
    phone: "+1-555-0107",
    company: "FinancePlus",
    status: "qualified",
    source: "Referral",
    value: 42000,
    assignedTo: "David Brown",
    createdAt: "2024-01-08",
    lastActivity: "2024-01-19",
    notes: "Strong interest in premium features. Decision maker confirmed."
  },
  // Additional contacted leads
  {
    id: "lead-8",
    name: "Jennifer Lee",
    email: "j.lee@healthsys.com",
    phone: "+1-555-0108",
    company: "HealthSystems Corp",
    status: "contacted",
    source: "LinkedIn",
    value: 28000,
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-16",
    lastActivity: "2024-01-18",
    notes: "Initial contact made. Scheduling discovery call."
  },
  {
    id: "lead-9",
    name: "Michael Brown",
    email: "m.brown@retailmax.com",
    phone: "+1-555-0109",
    company: "RetailMax",
    status: "contacted",
    source: "Trade Show",
    value: 18000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-14",
    lastActivity: "2024-01-17",
    notes: "Met at trade show. Sent follow-up materials."
  },
  // Additional opportunity leads
  {
    id: "lead-10",
    name: "Sarah Thompson",
    email: "s.thompson@edutech.org",
    phone: "+1-555-0110",
    company: "EduTech Solutions",
    status: "opportunity",
    source: "Website",
    value: 65000,
    assignedTo: "David Brown",
    createdAt: "2024-01-06",
    lastActivity: "2024-01-21",
    notes: "Proposal submitted. Awaiting decision by month-end."
  },
  // Additional new leads
  {
    id: "lead-11",
    name: "Alex Johnson",
    email: "a.johnson@manufacturing.com",
    phone: "+1-555-0111",
    company: "Manufacturing Pro",
    status: "new",
    source: "Cold Call",
    value: 12000,
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-23",
    lastActivity: "2024-01-23",
    notes: "Just entered system. Needs initial qualification."
  },
  {
    id: "lead-12",
    name: "Rachel Green",
    email: "r.green@logistics.net",
    phone: "+1-555-0112",
    company: "Logistics Network",
    status: "new",
    source: "Website",
    value: 22000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-24",
    lastActivity: "2024-01-24",
    notes: "Downloaded whitepaper. High engagement score."
  },
  // Additional high-value leads
  {
    id: "lead-13",
    name: "Thomas Anderson",
    email: "t.anderson@bigcorp.com",
    phone: "+1-555-0113",
    company: "BigCorp Enterprises",
    status: "qualified",
    source: "Referral",
    value: 75000,
    assignedTo: "David Brown",
    createdAt: "2024-01-11",
    lastActivity: "2024-01-21",
    notes: "Enterprise deal. Multiple stakeholders involved."
  },
  {
    id: "lead-14",
    name: "Patricia Williams",
    email: "p.williams@megafinance.com",
    phone: "+1-555-0114",
    company: "MegaFinance Corp",
    status: "opportunity",
    source: "Trade Show",
    value: 95000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-09",
    lastActivity: "2024-01-20",
    notes: "Largest potential deal this quarter. CEO interested."
  },
  // Additional closed leads
  {
    id: "lead-15",
    name: "Kevin Martinez",
    email: "k.martinez@smalltech.com",
    phone: "+1-555-0115",
    company: "SmallTech Solutions",
    status: "closed",
    source: "Website",
    value: 15000,
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-03",
    lastActivity: "2024-01-18",
    notes: "Successfully closed. Implementation starting next month."
  },
  // Recent activity leads (last 7 days)
  {
    id: "lead-16",
    name: "Sandra Davis",
    email: "s.davis@recentcorp.com",
    phone: "+1-555-0116",
    company: "RecentCorp",
    status: "contacted",
    source: "LinkedIn",
    value: 32000,
    assignedTo: "David Brown",
    createdAt: "2024-01-20",
    lastActivity: "2024-01-24",
    notes: "Very recent engagement. Hot lead."
  },
  {
    id: "lead-17",
    name: "Mark Thompson",
    email: "m.thompson@activetech.com",
    phone: "+1-555-0117",
    company: "ActiveTech Inc",
    status: "qualified",
    source: "Cold Call",
    value: 38000,
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-19",
    lastActivity: "2024-01-24",
    notes: "Qualified yesterday. Moving fast through pipeline."
  }
];

// Extended Contact Data (20+ records)
export const extendedMockContacts: Contact[] = [
  // Existing contacts
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
  },
  // Additional active contacts
  {
    id: "contact-4",
    firstName: "Daniel",
    lastName: "Wilson",
    email: "d.wilson@globaltech.com",
    phone: "+1-555-0204",
    company: "GlobalTech Inc",
    title: "Director of Operations",
    department: "Operations",
    status: "active",
    createdAt: "2023-10-05",
    lastContact: "2024-01-19",
    notes: "Regular check-ins. Very satisfied with service."
  },
  {
    id: "contact-5",
    firstName: "Emma",
    lastName: "Davis",
    email: "e.davis@financeplus.com",
    phone: "+1-555-0205",
    company: "FinancePlus",
    title: "CFO",
    department: "Finance",
    status: "active",
    createdAt: "2023-09-20",
    lastContact: "2024-01-17",
    notes: "Budget approver. Excellent relationship."
  },
  // Additional prospect contacts
  {
    id: "contact-6",
    firstName: "Frank",
    lastName: "Miller",
    email: "f.miller@healthsys.com",
    phone: "+1-555-0206",
    company: "HealthSystems Corp",
    title: "IT Director",
    department: "Technology",
    status: "prospect",
    createdAt: "2024-01-12",
    lastContact: "2024-01-16",
    notes: "Evaluating multiple vendors. Price sensitive."
  },
  {
    id: "contact-7",
    firstName: "Grace",
    lastName: "Lee",
    email: "g.lee@retailmax.com",
    phone: "+1-555-0207",
    company: "RetailMax",
    title: "VP of Marketing",
    department: "Marketing",
    status: "prospect",
    createdAt: "2024-01-08",
    lastContact: "2024-01-14",
    notes: "Interested in marketing automation features."
  },
  // Additional inactive contacts
  {
    id: "contact-8",
    firstName: "Henry",
    lastName: "Brown",
    email: "h.brown@oldcorp.com",
    phone: "+1-555-0208",
    company: "OldCorp Industries",
    title: "General Manager",
    department: "Operations",
    status: "inactive",
    createdAt: "2023-06-15",
    lastContact: "2023-12-10",
    notes: "Contract ended. Moved to competitor."
  },
  // Additional recent contacts
  {
    id: "contact-9",
    firstName: "Isabella",
    lastName: "Garcia",
    email: "i.garcia@newtech.com",
    phone: "+1-555-0209",
    company: "NewTech Innovations",
    title: "Product Owner",
    department: "Product",
    status: "active",
    createdAt: "2024-01-18",
    lastContact: "2024-01-24",
    notes: "Very recent contact. High engagement."
  },
  {
    id: "contact-10",
    firstName: "William",
    lastName: "Jones",
    email: "w.jones@freshstart.com",
    phone: "+1-555-0210",
    company: "FreshStart Corp",
    title: "VP of Sales",
    department: "Sales",
    status: "prospect",
    createdAt: "2024-01-22",
    lastContact: "2024-01-24",
    notes: "New prospect. Interested in our solution."
  },
  // Additional active contacts
  {
    id: "contact-11",
    firstName: "Sophia",
    lastName: "Martinez",
    email: "s.martinez@established.com",
    phone: "+1-555-0211",
    company: "Established Enterprises",
    title: "Chief Technology Officer",
    department: "Technology",
    status: "active",
    createdAt: "2023-08-15",
    lastContact: "2024-01-16",
    notes: "Long-term customer. Very satisfied with service."
  },
  {
    id: "contact-12",
    firstName: "James",
    lastName: "Taylor",
    email: "j.taylor@loyalcorp.com",
    phone: "+1-555-0212",
    company: "LoyalCorp",
    title: "Director of IT",
    department: "Technology",
    status: "active",
    createdAt: "2023-05-10",
    lastContact: "2024-01-12",
    notes: "Excellent relationship. Potential for expansion."
  }
];

// Extended Account Data (15+ records)
export const extendedMockAccounts: Account[] = [
  // Existing accounts
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
  },
  // Additional customer accounts
  {
    id: "account-4",
    name: "GlobalTech Inc",
    type: "customer",
    industry: "Technology",
    size: "enterprise",
    revenue: 5200000,
    website: "https://globaltech.com",
    phone: "+1-555-0304",
    address: "100 Global Plaza, New York, NY 10001",
    status: "active",
    owner: "Sarah Johnson",
    createdAt: "2023-03-15",
    lastActivity: "2024-01-21",
    notes: "Largest customer. Multi-year contract."
  },
  {
    id: "account-5",
    name: "FinancePlus",
    type: "customer",
    industry: "Financial Services",
    size: "large",
    revenue: 3100000,
    website: "https://financeplus.com",
    phone: "+1-555-0305",
    address: "200 Finance Center, Chicago, IL 60601",
    status: "active",
    owner: "David Brown",
    createdAt: "2023-08-10",
    lastActivity: "2024-01-18",
    notes: "High-value customer. Excellent payment history."
  },
  // Additional prospect accounts
  {
    id: "account-6",
    name: "HealthSystems Corp",
    type: "prospect",
    industry: "Healthcare",
    size: "large",
    revenue: 1800000,
    website: "https://healthsystems.com",
    phone: "+1-555-0306",
    address: "300 Medical Drive, Boston, MA 02101",
    status: "active",
    owner: "Mike Wilson",
    createdAt: "2024-01-05",
    lastActivity: "2024-01-16",
    notes: "Healthcare compliance requirements. Long sales cycle."
  },
  {
    id: "account-7",
    name: "RetailMax",
    type: "prospect",
    industry: "Retail",
    size: "medium",
    revenue: 950000,
    website: "https://retailmax.com",
    phone: "+1-555-0307",
    address: "400 Retail Row, Dallas, TX 75201",
    status: "active",
    owner: "Sarah Johnson",
    createdAt: "2023-12-20",
    lastActivity: "2024-01-14",
    notes: "Seasonal business. Peak activity Q4."
  },
  // Additional partner accounts
  {
    id: "account-8",
    name: "Integration Partners LLC",
    type: "partner",
    industry: "Technology",
    size: "medium",
    revenue: 750000,
    website: "https://integrationpartners.com",
    phone: "+1-555-0308",
    address: "500 Partner Plaza, Denver, CO 80201",
    status: "active",
    owner: "David Brown",
    createdAt: "2023-07-01",
    lastActivity: "2024-01-15",
    notes: "Strategic integration partner. Joint go-to-market."
  },
  // High-value accounts
  {
    id: "account-9",
    name: "Enterprise Solutions Group",
    type: "customer",
    industry: "Consulting",
    size: "enterprise",
    revenue: 8500000,
    website: "https://enterprisesolutions.com",
    phone: "+1-555-0309",
    address: "600 Enterprise Way, Los Angeles, CA 90210",
    status: "active",
    owner: "Sarah Johnson",
    createdAt: "2023-01-15",
    lastActivity: "2024-01-20",
    notes: "Highest revenue account. Multiple divisions using our platform."
  },
  // Recently active accounts
  {
    id: "account-10",
    name: "QuickStart Technologies",
    type: "customer",
    industry: "Technology",
    size: "small",
    revenue: 320000,
    website: "https://quickstart.tech",
    phone: "+1-555-0310",
    address: "700 Quick Lane, Portland, OR 97201",
    status: "active",
    owner: "Mike Wilson",
    createdAt: "2024-01-20",
    lastActivity: "2024-01-24",
    notes: "New customer. Onboarding in progress."
  },
  // Additional enterprise accounts
  {
    id: "account-11",
    name: "MegaCorp International",
    type: "customer",
    industry: "Manufacturing",
    size: "enterprise",
    revenue: 12000000,
    website: "https://megacorp.com",
    phone: "+1-555-0311",
    address: "800 Corporate Blvd, Detroit, MI 48201",
    status: "active",
    owner: "David Brown",
    createdAt: "2022-11-01",
    lastActivity: "2024-01-19",
    notes: "Largest enterprise customer. Multi-division deployment."
  },
  // Additional recent activity
  {
    id: "account-12",
    name: "ActiveBusiness Solutions",
    type: "prospect",
    industry: "Consulting",
    size: "medium",
    revenue: 1200000,
    website: "https://activebusiness.com",
    phone: "+1-555-0312",
    address: "900 Business Park, Phoenix, AZ 85001",
    status: "active",
    owner: "Sarah Johnson",
    createdAt: "2024-01-21",
    lastActivity: "2024-01-24",
    notes: "Very recent prospect. High potential."
  },
  // Additional large accounts
  {
    id: "account-13",
    name: "LargeCorp Industries",
    type: "customer",
    industry: "Energy",
    size: "large",
    revenue: 4500000,
    website: "https://largecorp.com",
    phone: "+1-555-0313",
    address: "1000 Energy Plaza, Houston, TX 77001",
    status: "active",
    owner: "Mike Wilson",
    createdAt: "2023-04-15",
    lastActivity: "2024-01-17",
    notes: "Large energy sector customer. Stable revenue."
  }
];

// Data filtering functions for menu actions
export const getFilteredData = {
  // Lead filters
  leads: {
    all: () => extendedMockLeads,
    qualified: () => extendedMockLeads.filter(lead => lead.status === 'qualified'),
    contacted: () => extendedMockLeads.filter(lead => lead.status === 'contacted'),
    opportunity: () => extendedMockLeads.filter(lead => lead.status === 'opportunity'),
    new: () => extendedMockLeads.filter(lead => lead.status === 'new'),
    closed: () => extendedMockLeads.filter(lead => lead.status === 'closed'),
    highValue: () => extendedMockLeads.filter(lead => lead.value >= 30000),
    recent: () => extendedMockLeads.filter(lead => {
      const lastActivity = new Date(lead.lastActivity);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActivity >= weekAgo;
    })
  },
  
  // Contact filters
  contacts: {
    all: () => extendedMockContacts,
    active: () => extendedMockContacts.filter(contact => contact.status === 'active'),
    inactive: () => extendedMockContacts.filter(contact => contact.status === 'inactive'),
    prospects: () => extendedMockContacts.filter(contact => contact.status === 'prospect'),
    recent: () => extendedMockContacts.filter(contact => {
      const lastContact = new Date(contact.lastContact);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastContact >= weekAgo;
    })
  },
  
  // Account filters
  accounts: {
    all: () => extendedMockAccounts,
    customers: () => extendedMockAccounts.filter(account => account.type === 'customer'),
    prospects: () => extendedMockAccounts.filter(account => account.type === 'prospect'),
    partners: () => extendedMockAccounts.filter(account => account.type === 'partner'),
    active: () => extendedMockAccounts.filter(account => account.status === 'active'),
    highValue: () => extendedMockAccounts.filter(account => account.revenue >= 2000000),
    recent: () => extendedMockAccounts.filter(account => {
      const lastActivity = new Date(account.lastActivity);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActivity >= weekAgo;
    }),
    enterprise: () => extendedMockAccounts.filter(account => account.size === 'enterprise'),
    large: () => extendedMockAccounts.filter(account => account.size === 'large')
  }
};