import { Lead, TeamMember, DashboardStats } from '../types';

export const teamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Sarah Al-Rashid', role: 'Sales Director', email: 'sarah@digitalqatalyst.com', initials: 'SA', color: 'bg-blue-500' },
  { id: 'tm2', name: 'Omar Hassan', role: 'Account Executive', email: 'omar@digitalqatalyst.com', initials: 'OH', color: 'bg-green-500' },
  { id: 'tm3', name: 'Priya Sharma', role: 'Marketing Lead', email: 'priya@digitalqatalyst.com', initials: 'PS', color: 'bg-purple-500' },
  { id: 'tm4', name: 'James Chen', role: 'Solutions Architect', email: 'james@digitalqatalyst.com', initials: 'JC', color: 'bg-orange-500' },
  { id: 'tm5', name: 'Fatima Al-Sayed', role: 'Business Dev Manager', email: 'fatima@digitalqatalyst.com', initials: 'FA', color: 'bg-pink-500' },
  { id: 'tm6', name: 'David Kim', role: 'Customer Success', email: 'david@digitalqatalyst.com', initials: 'DK', color: 'bg-teal-500' },
];

export const allTags = [
  'DCO Assessment', 'AI Strategy', 'Enterprise Client', 'SMB', 'Government',
  'High Priority', 'Follow Up', 'DTMI Licensing', 'Webinar Attendee',
  'Partner Referral', 'Decision Maker', 'Technical Buyer', 'Budget Approved',
  'Q1 Target', 'Upsell Opportunity',
];

const act = (
  desc: string,
  type: 'note' | 'email' | 'call' | 'status_change' | 'meeting' | 'task',
  user: string,
  ts: string
) => ({
  id: `a${ts.replace(/\D/g, '')}${Math.random().toString(36).slice(2, 5)}`,
  type,
  description: desc,
  timestamp: ts,
  user,
});

export const initialLeads: Lead[] = [
  {
    id: 'l1', name: 'Ahmad Al-Mansoori', email: 'ahmad@techcorp.ae', phone: '+971 50 123 4567',
    company: 'TechCorp UAE', source: 'Website Form', service: 'DCO Assessment', status: 'Qualified',
    score: 87, assignedTo: 'tm1', tags: ['Enterprise Client', 'DCO Assessment', 'Decision Maker'],
    createdAt: '2025-02-01T09:00:00Z', notes: 'Interested in full DCO assessment for their Dubai operations',
    activities: [
      act('Lead created from website form submission', 'note', 'System', '2025-02-01T09:00:00Z'),
      act('Initial discovery call - interested in digital transformation roadmap', 'call', 'Sarah Al-Rashid', '2025-02-03T14:30:00Z'),
      act('Status changed from New to Qualified', 'status_change', 'Sarah Al-Rashid', '2025-02-03T15:00:00Z'),
    ],
  },
  {
    id: 'l2', name: 'Lisa Thompson', email: 'lisa@globalfinance.com', phone: '+1 212 555 0198',
    company: 'Global Finance Inc', source: 'Webinar', service: 'AI Strategy', status: 'Contacted',
    score: 72, assignedTo: 'tm2', tags: ['AI Strategy', 'Enterprise Client', 'Webinar Attendee'],
    createdAt: '2025-02-02T11:30:00Z', notes: 'Attended AI Strategy webinar, asked detailed questions',
    activities: [
      act('Lead created from webinar attendance', 'note', 'System', '2025-02-02T11:30:00Z'),
      act('Welcome email sent', 'email', 'System', '2025-02-02T11:35:00Z'),
    ],
  },
  {
    id: 'l3', name: 'Mohammed Al-Fahad', email: 'mfahad@govtech.sa', phone: '+966 55 987 6543',
    company: 'GovTech Saudi', source: 'Referral', service: 'Digital Transformation', status: 'Proposal Sent',
    score: 93, assignedTo: 'tm1', tags: ['Government', 'High Priority', 'Budget Approved', 'Decision Maker'],
    createdAt: '2025-01-28T08:15:00Z', notes: 'Referred by Minister of Digital Affairs. Large-scale DT project.',
    activities: [
      act('Lead created from referral', 'note', 'System', '2025-01-28T08:15:00Z'),
      act('Demo scheduled for Feb 10', 'meeting', 'James Chen', '2025-02-05T10:00:00Z'),
    ],
  },
  {
    id: 'l4', name: 'Emma Wilson', email: 'emma@startupx.io', phone: '+44 20 7946 0958',
    company: 'StartupX', source: 'Chatbot', service: 'Cloud Migration', status: 'New',
    score: 45, assignedTo: 'tm3', tags: ['SMB', 'Follow Up'],
    createdAt: '2025-02-08T16:45:00Z', notes: 'Small startup looking for cloud migration support',
    activities: [act('Lead created from chatbot', 'note', 'System', '2025-02-08T16:45:00Z')],
  },
  {
    id: 'l5', name: 'Raj Patel', email: 'raj@innovateind.com', phone: '+91 98 7654 3210',
    company: 'Innovate India', source: 'Marketplace', service: 'Data Analytics', status: 'Qualified',
    score: 68, assignedTo: 'tm4', tags: ['Enterprise Client', 'Technical Buyer'],
    createdAt: '2025-02-05T13:20:00Z', notes: 'Found us on marketplace, needs advanced analytics platform',
    activities: [act('Lead created from marketplace', 'note', 'System', '2025-02-05T13:20:00Z')],
  },
  {
    id: 'l6', name: 'Noura Al-Thani', email: 'noura@qatarenergy.qa', phone: '+974 44 123 456',
    company: 'Qatar Energy Solutions', source: 'Website Form', service: 'DTMI Licensing', status: 'Contacted',
    score: 81, assignedTo: 'tm5', tags: ['Enterprise Client', 'DTMI Licensing', 'Q1 Target'],
    createdAt: '2025-02-03T10:00:00Z', notes: 'Interested in DTMI licensing for internal use',
    activities: [act('Lead created from website form', 'note', 'System', '2025-02-03T10:00:00Z')],
  },
  {
    id: 'l7', name: 'Carlos Rodriguez', email: 'carlos@latamtech.mx', phone: '+52 55 1234 5678',
    company: 'LatAm Tech', source: 'Email', service: 'AI Strategy', status: 'New',
    score: 55, assignedTo: 'tm2', tags: ['Follow Up', 'AI Strategy'],
    createdAt: '2025-02-09T07:30:00Z', notes: 'Emailed requesting AI strategy consultation',
    activities: [act('Lead created from email', 'note', 'System', '2025-02-09T07:30:00Z')],
  },
  {
    id: 'l8', name: 'Yuki Tanaka', email: 'yuki@tokyoai.jp', phone: '+81 3 1234 5678',
    company: 'Tokyo AI Labs', source: 'Referral', service: 'AI Strategy', status: 'Proposal Sent',
    score: 89, assignedTo: 'tm4', tags: ['Enterprise Client', 'AI Strategy', 'Partner Referral', 'High Priority'],
    createdAt: '2025-01-25T14:00:00Z', notes: 'Referred by partner. Advanced AI implementation project.',
    activities: [act('Lead created from referral', 'note', 'System', '2025-01-25T14:00:00Z')],
  },
  {
    id: 'l9', name: 'Hans Mueller', email: 'hans@deutscheind.de', phone: '+49 30 1234 5678',
    company: 'Deutsche Industrie', source: 'Website Form', service: 'Cloud Migration', status: 'Converted',
    score: 95, assignedTo: 'tm5', tags: ['Enterprise Client', 'Budget Approved', 'Decision Maker'],
    createdAt: '2025-01-15T11:00:00Z', notes: 'Successfully converted. Cloud migration project starting March.',
    activities: [
      act('Lead created from website form', 'note', 'System', '2025-01-15T11:00:00Z'),
      act('Status changed to Converted', 'status_change', 'Fatima Al-Sayed', '2025-02-01T09:00:00Z'),
    ],
  },
  {
    id: 'l10', name: 'Chen Wei', email: 'chen@shanghaitech.cn', phone: '+86 21 1234 5678',
    company: 'Shanghai Tech Group', source: 'Email', service: 'DTMI Licensing', status: 'Lost',
    score: 42, assignedTo: 'tm2', tags: ['Enterprise Client'],
    createdAt: '2025-01-20T06:00:00Z', notes: 'Lost to competitor. Budget constraints cited.',
    activities: [act('Lead created from email', 'note', 'System', '2025-01-20T06:00:00Z')],
  },
  {
    id: 'f1', name: 'John Doe', email: 'john@acmecorp.com', phone: '+971 50 123 4567',
    company: 'Acme Corporation', source: 'Service Request', service: 'Digital Transformation', status: 'New',
    score: 85, assignedTo: 'tm1', tags: ['High Value', 'Service Request'],
    createdAt: '2025-02-12T09:00:00Z', notes: 'Submitted service request for digital transformation.',
    activities: [act('Service request form submitted', 'note', 'System', '2025-02-12T09:00:00Z')],
    formType: 'service-request', priority: 'High', jobTitle: 'CTO', industry: 'Technology',
    companySize: '201-1000', projectTimeline: 'Short-term (1-3 months)', budget: '$100,000-$250,000',
    suggestedRouting: 'Sales Team', followUpSla: '24-48 hours',
    message: 'We need to modernize our legacy systems urgently.',
  },
  {
    id: 'f2', name: 'Sarah Smith', email: 'sarah@techgiants.com', phone: '+1 415 555 0123',
    company: 'Tech Giants', source: 'Product Demo', service: 'Digital Transformation', status: 'New',
    score: 88, assignedTo: 'tm2', tags: ['Demo Request', 'DTMP'],
    createdAt: '2025-02-12T10:30:00Z', notes: 'Requested demo for DTMP platform.',
    activities: [act('Product demo request submitted', 'note', 'System', '2025-02-12T10:30:00Z')],
    formType: 'product-demo', priority: 'High', productName: 'Digital Transformation Management Platform',
    productCode: 'DTMP', suggestedRouting: 'Product Specialists', followUpSla: '24 hours',
  },
  {
    id: 'f3', name: 'Michael Brown', email: 'michael@startuphub.ke', phone: '+254 712 345 678',
    company: 'Startup Hub Kenya', source: 'Tour Request', service: 'DCO Assessment', status: 'New',
    score: 60, assignedTo: 'tm3', tags: ['Studio Tour', 'Nairobi'],
    createdAt: '2025-02-11T14:00:00Z', notes: 'Wants to visit the Nairobi studio.',
    activities: [act('Tour request form submitted', 'note', 'System', '2025-02-11T14:00:00Z')],
    formType: 'tour-request', priority: 'Medium', groupSize: '6-10 people',
    preferredDate: '2025-03-15', preferredTime: 'Morning (9:00 AM - 12:00 PM)',
    suggestedRouting: 'Operations Team', followUpSla: '24 hours',
    message: 'We are a group of developers interested in your facilities.',
  },
  {
    id: 'f4', name: 'Emily Davis', email: 'emily@retail40.com', phone: '+44 20 7123 4567',
    company: 'Retail 4.0 Ltd', source: 'Consultation', service: 'Digital Transformation', status: 'New',
    score: 75, assignedTo: 'tm5', tags: ['Consultation', 'Retail'],
    createdAt: '2025-02-11T16:45:00Z', notes: 'Requested consultation on Retail 4.0.',
    activities: [act('Consultation request submitted', 'note', 'System', '2025-02-11T16:45:00Z')],
    formType: 'consultation', priority: 'High', sector: 'Retail 4.0',
    suggestedRouting: 'Business Development', followUpSla: '24-48 hours',
    message: 'Looking to implement smart retail solutions.',
  },
];

export const dashboardStats: DashboardStats = {
  totalLeads: 14,
  conversionRate: 7.1,
  avgResponseTime: '2.4h',
  pipelineValue: 2450000,
  totalLeadsTrend: 12.5,
  conversionTrend: 3.2,
  responseTrend: -15.0,
  pipelineTrend: 8.7,
};

export const monthlyLeadData = [
  { month: 'Sep', leads: 18, converted: 3 },
  { month: 'Oct', leads: 22, converted: 4 },
  { month: 'Nov', leads: 19, converted: 3 },
  { month: 'Dec', leads: 28, converted: 5 },
  { month: 'Jan', leads: 31, converted: 6 },
  { month: 'Feb', leads: 14, converted: 1 },
];

export const leadsBySource = [
  { name: 'Website Form', value: 3, color: '#3B82F6' },
  { name: 'Webinar', value: 1, color: '#EC4899' },
  { name: 'Referral', value: 2, color: '#14B8A6' },
  { name: 'Email', value: 2, color: '#8B5CF6' },
  { name: 'Chatbot', value: 1, color: '#22C55E' },
  { name: 'Marketplace', value: 1, color: '#F97316' },
  { name: 'Service Request', value: 1, color: '#2563EB' },
  { name: 'Product Demo', value: 1, color: '#7C3AED' },
  { name: 'Consultation', value: 1, color: '#059669' },
  { name: 'Tour Request', value: 1, color: '#D97706' },
];

export const conversionByService = [
  { service: 'DCO Assessment', leads: 2, converted: 0, rate: 0 },
  { service: 'AI Strategy', leads: 3, converted: 0, rate: 0 },
  { service: 'DTMI Licensing', leads: 2, converted: 0, rate: 0 },
  { service: 'Digital Transform.', leads: 5, converted: 1, rate: 20 },
  { service: 'Cloud Migration', leads: 2, converted: 1, rate: 50 },
  { service: 'Data Analytics', leads: 1, converted: 0, rate: 0 },
];

export const winLossData = [
  { month: 'Sep', wins: 3, losses: 1 },
  { month: 'Oct', wins: 4, losses: 2 },
  { month: 'Nov', wins: 3, losses: 1 },
  { month: 'Dec', wins: 5, losses: 2 },
  { month: 'Jan', wins: 6, losses: 2 },
  { month: 'Feb', wins: 1, losses: 1 },
];

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export const notificationSettings: NotificationSetting[] = [
  { id: 'n1', label: 'New Lead Alert', description: 'Get notified when a new lead is created', enabled: true },
  { id: 'n2', label: 'Status Change', description: 'Notify when a lead status changes', enabled: true },
  { id: 'n3', label: 'High Score Lead', description: 'Alert when a lead score exceeds 80', enabled: true },
  { id: 'n4', label: 'Unassigned Lead', description: 'Remind when leads remain unassigned for 24h', enabled: false },
  { id: 'n5', label: 'Conversion Event', description: 'Celebrate when a lead converts', enabled: true },
];

export const automationRules: AutomationRule[] = [
  { id: 'r1', name: 'Auto-qualify high score leads', trigger: 'score > 80', action: 'set status = Qualified', enabled: true },
  { id: 'r2', name: 'Assign form submissions', trigger: 'source = Service Request', action: 'assign to Sales Team', enabled: true },
  { id: 'r3', name: 'Tag enterprise leads', trigger: 'companySize = 1000+', action: 'add tag = Enterprise Client', enabled: false },
  { id: 'r4', name: 'Follow-up reminder', trigger: 'status = Contacted AND 3 days no activity', action: 'create follow-up task', enabled: true },
];
