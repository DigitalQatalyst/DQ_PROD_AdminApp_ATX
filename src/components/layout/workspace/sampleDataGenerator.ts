/**
 * Sample Data Generator for LVE Workspace Modules
 * 
 * Generates sample records to test pagination (20 records per page)
 * Run this to populate modules with 50+ records for testing
 */

import type { ContactRecord, LeadRecord, AccountRecord } from "./moduleRegistry";

const firstNames = [
  "Jennifer", "Marcus", "Ava", "Samuel", "Grace", "Oliver", "Nadia", "Peter",
  "Sophia", "James", "Emma", "William", "Isabella", "Michael", "Mia", "David",
  "Charlotte", "Joseph", "Amelia", "Daniel", "Harper", "Matthew", "Evelyn",
  "Christopher", "Abigail", "Andrew", "Emily", "Joshua", "Elizabeth", "Ryan",
  "Sofia", "Nicholas", "Avery", "Alexander", "Ella", "Jonathan", "Scarlett",
  "Benjamin", "Grace", "Jacob", "Chloe", "Ethan", "Victoria", "Logan", "Madison",
  "Nathan", "Luna", "Caleb", "Aria", "Tyler", "Layla"
];

const lastNames = [
  "Lee", "Njoroge", "Patel", "Otieno", "Mwangi", "Grant", "Santos", "Wallace",
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green"
];

const companies = [
  "HealthSystems Corp", "EastBridge Capital", "Nova Retail Group", "Transit Works",
  "Meridian Logistics", "FieldGrid Energy", "Horizon Care", "Atlas Manufacturing",
  "Northstar Health", "TechVision Inc", "Global Solutions", "Innovate Labs",
  "Summit Partners", "Apex Industries", "Quantum Systems", "Nexus Group",
  "Pinnacle Corp", "Velocity Tech", "Catalyst Ventures", "Fusion Dynamics",
  "Zenith Enterprises", "Momentum Inc", "Vanguard Solutions", "Precision Works",
  "Synergy Group", "Elevate Systems", "Cornerstone Partners", "Frontier Tech",
  "Horizon Ventures", "Keystone Industries", "Lighthouse Group", "Milestone Corp",
  "Odyssey Solutions", "Paramount Systems", "Quest Technologies", "Radiant Group",
  "Stellar Enterprises", "Titan Industries", "Unity Partners", "Vertex Solutions",
  "Wavelength Tech", "Xcel Group", "Yield Systems", "Zephyr Ventures"
];

const titles = [
  "Director of Partnerships", "Chief of Staff", "VP Product Operations",
  "Procurement Lead", "Transformation Lead", "Operations Director", "Program Owner",
  "Executive Sponsor", "Chief Technology Officer", "VP Engineering", "Head of Sales",
  "Marketing Director", "Product Manager", "Senior Analyst", "Account Executive",
  "Solutions Architect", "Business Development Manager", "Customer Success Lead",
  "Finance Director", "HR Manager", "Operations Manager", "Strategy Consultant"
];

const owners = ["Amina Hassan", "David Kariuki", "Lydia Okafor"];

const statuses = ["Active", "Prospect", "Inactive"];
const leadStages = ["New", "Contacted", "Qualified", "Opportunity"];
const leadStatuses = ["Open", "Nurturing", "Paused", "Closed"];
const sources = ["Partner Referral", "Website Inquiry", "Industry Event", "Targeted Campaign", "Inbound", "Cold Outreach"];
const tags = ["enterprise", "multisite", "inbound", "discovery", "healthcare", "procurement", "campaign", "manufacturing", "expansion", "partner"];

const industries = ["Healthcare", "Logistics", "Financial Services", "Retail", "Technology", "Manufacturing", "Energy", "Education"];
const lifecycleStages = ["Prospect", "Customer", "Partner"];
const accountTiers = ["Tier 1", "Tier 2", "Tier 3"];
const countries = ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia"];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateEmail(firstName: string, lastName: string, company: string): string {
  const domain = company.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.example`;
}

function generatePhone(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const last4 = Math.floor(Math.random() * 9000) + 1000;
  return `+1 ${area} 555 ${last4.toString().padStart(4, "0")}`;
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export function generateContactRecords(count: number, startId: number = 101): ContactRecord[] {
  const records: ContactRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const organization = randomItem(companies);
    const title = randomItem(titles);
    
    records.push({
      id: `contact-${startId + i}`,
      firstName,
      lastName,
      title,
      organization,
      email: generateEmail(firstName, lastName, organization),
      phone: generatePhone(),
      mobile: generatePhone(),
      owner: randomItem(owners),
      status: randomItem(statuses),
      createdAt: generateDate(Math.floor(Math.random() * 90)),
      relatedSummaries: [
        `Strategic account: ${organization}`,
        `Created from ${randomItem(["account", "vendor", "application"])} context`,
        randomItem(["Partner referral relationship", "Direct outreach", "Event connection"])
      ],
    });
  }
  
  return records;
}

export function generateLeadRecords(count: number, startId: number = 201): LeadRecord[] {
  const records: LeadRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const company = randomItem(companies);
    const stage = randomItem(leadStages);
    
    records.push({
      id: `lead-${startId + i}`,
      firstName,
      lastName,
      email: generateEmail(firstName, lastName, company),
      phone: generatePhone(),
      company,
      source: randomItem(sources),
      stage,
      status: randomItem(leadStatuses),
      owner: randomItem(owners),
      score: Math.floor(Math.random() * 50) + 50, // 50-100
      tags: randomItems(tags, Math.floor(Math.random() * 3) + 1),
      createdAt: generateDate(Math.floor(Math.random() * 60)),
      activitySummary: `${stage} stage activity in progress. ${randomItem(["Discovery scheduled", "Proposal sent", "Follow-up pending", "Meeting completed"])}.`,
      notesSummary: `${randomItem(["Needs commercial proposal", "Awaiting security review", "Budget approved", "Decision pending"])} before next step.`,
    });
  }
  
  return records;
}

export function generateAccountRecords(count: number, startId: number = 301): AccountRecord[] {
  const records: AccountRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = randomItem(companies);
    const industry = randomItem(industries);
    const contactsCount = Math.floor(Math.random() * 8) + 1;
    const dealsCount = Math.floor(Math.random() * 4);
    
    records.push({
      id: `account-${startId + i}`,
      name,
      industry,
      website: `${name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.example`,
      phone: generatePhone(),
      address: `${Math.floor(Math.random() * 999) + 1} ${randomItem(["Main", "Market", "Park", "Harbor", "Capital"])} ${randomItem(["Street", "Avenue", "Way", "Drive"])}`,
      country: randomItem(countries),
      owner: randomItem(owners),
      lifecycleStage: randomItem(lifecycleStages),
      accountTier: randomItem(accountTiers),
      tags: randomItems(tags, Math.floor(Math.random() * 3) + 1),
      createdAt: generateDate(Math.floor(Math.random() * 120)),
      contactsCount,
      dealsCount,
      activitySummary: `${randomItem(["Expansion", "Onboarding", "Review", "Planning"])} ${randomItem(["completed", "in progress", "scheduled", "pending"])}.`,
      notesSummary: `${randomItem(["Quarterly review", "Success metrics", "Stakeholder mapping", "Renewal discussion"])} ${randomItem(["needed", "completed", "scheduled"])}.`,
      contacts: Array.from({ length: Math.min(contactsCount, 3) }, () => ({
        name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        role: randomItem(["Executive Sponsor", "Program Owner", "Technical Lead", "Primary Contact"])
      })),
      deals: Array.from({ length: dealsCount }, () => ({
        name: `${randomItem(["Regional", "Enterprise", "Strategic", "Expansion"])} ${randomItem(["Rollout", "Implementation", "Partnership", "Program"])}`,
        stage: randomItem(["Discovery", "Proposal", "Negotiation", "Closed"])
      })),
      activities: [
        `${generateDate(5)} ${randomItem(["Review completed", "Meeting held", "Proposal sent", "Follow-up scheduled"])}`,
        `${generateDate(15)} ${randomItem(["Quarterly check-in", "Success review", "Planning session", "Strategy call"])}`
      ],
      notes: [
        `${randomItem(["Expansion opportunity", "Renewal upcoming", "Training needed", "Integration pending"])} for next quarter.`,
        `Account ${randomItem(["health score", "engagement", "adoption", "satisfaction"])} is ${randomItem(["strong", "moderate", "needs attention"])}.`
      ],
    });
  }
  
  return records;
}

// Generate all sample data
export function generateAllSampleData() {
  return {
    contacts: generateContactRecords(50),
    leads: generateLeadRecords(50),
    accounts: generateAccountRecords(50),
  };
}

// Helper to log sample data for copying into moduleRegistry
export function logSampleDataForCopy() {
  const data = generateAllSampleData();
  
  console.log("=== CONTACTS (50 records) ===");
  console.log(JSON.stringify(data.contacts, null, 2));
  
  console.log("\n=== LEADS (50 records) ===");
  console.log(JSON.stringify(data.leads, null, 2));
  
  console.log("\n=== ACCOUNTS (50 records) ===");
  console.log(JSON.stringify(data.accounts, null, 2));
  
  return data;
}
