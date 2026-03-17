export interface MockWorkspaceField {
  label: string;
  value: string;
}

export interface MockWorkspaceSection {
  id: string;
  title: string;
  fields: MockWorkspaceField[];
}

export interface MockWorkspaceContextCard {
  id: string;
  title: string;
  items: MockWorkspaceField[];
}

export interface MockWorkspaceRecord {
  id: string;
  title: string;
  status: string;
  subtitle: string;
  summary: string;
  lastUpdated: string;
  detailSections: MockWorkspaceSection[];
  contextCards: MockWorkspaceContextCard[];
}

export interface MockWorkspaceActionConfig {
  id: string;
  label: string;
}

export interface MockWorkspaceModuleTabConfig {
  id: string;
  label: string;
  path: string;
}

export interface MockWorkspaceModuleData {
  moduleId: string;
  routePath: string;
  headerTitle: string;
  headerDescription: string;
  queueTitle: string;
  queueSubtitle: string;
  workspaceTitle: string;
  workspaceSubtitle: string;
  contextTitle: string;
  contextSubtitle: string;
  rootTabLabel: string;
  moduleActions: MockWorkspaceActionConfig[];
  recordActions: MockWorkspaceActionConfig[];
  records: MockWorkspaceRecord[];
}

export const mockWorkspaceModuleTabs: MockWorkspaceModuleTabConfig[] = [
  {
    id: "contacts",
    label: "Contacts",
    path: "/contacts",
  },
  {
    id: "leads",
    label: "Leads",
    path: "/leads",
  },
  {
    id: "accounts",
    label: "Accounts",
    path: "/accounts",
  },
];

const createWorkspaceCrudActions = (
  entityId: string,
  entityLabel: string,
): MockWorkspaceActionConfig[] => [
  { id: `new-${entityId}`, label: `New ${entityLabel}` },
  { id: `import-${entityId}`, label: "Import" },
  { id: `export-${entityId}`, label: "Export" },
];

const createRecordCrudActions = (
  entityId: string,
  extraActions: MockWorkspaceActionConfig[] = [],
): MockWorkspaceActionConfig[] => [
  { id: `edit-${entityId}`, label: "Edit" },
  ...extraActions,
  { id: `delete-${entityId}`, label: "Delete" },
];

export const contactsModuleMockData: MockWorkspaceModuleData = {
  moduleId: "contacts",
  routePath: "/contacts",
  headerTitle: "Contact Management",
  headerDescription:
    "Mock workspace data for validating queue navigation, tabbed record work, and supporting context before live APIs.",
  queueTitle: "Contacts Queue",
  queueSubtitle:
    "Contacts remain visible while the active workspace stays open in tabs.",
  workspaceTitle: "Contact Workspace",
  workspaceSubtitle:
    "Module and record actions are surfaced here so the sidebar stays focused on modules.",
  contextTitle: "Related Contact Context",
  contextSubtitle:
    "Use this supporting pane for relationship history, ownership, and recent touchpoints.",
  rootTabLabel: "All Contacts",
  moduleActions: createWorkspaceCrudActions("contact", "Contact"),
  recordActions: createRecordCrudActions("contact"),
  records: [
    {
      id: "contact-101",
      title: "Jennifer Lee",
      status: "Active",
      subtitle: "Director of Partnerships, HealthSystems Corp",
      summary: "Owns the evaluation stream for partnership tooling and quarterly reporting.",
      lastUpdated: "2026-03-14 09:20",
      detailSections: [
        {
          id: "profile",
          title: "Profile",
          fields: [
            { label: "Email", value: "jennifer.lee@healthsystems.example" },
            { label: "Phone", value: "+1 202 555 0188" },
            { label: "Department", value: "Partnerships" },
          ],
        },
        {
          id: "engagement",
          title: "Engagement",
          fields: [
            { label: "Last Contact", value: "2026-03-13" },
            { label: "Owner", value: "Amina Hassan" },
            { label: "Next Step", value: "Share revised proposal deck" },
          ],
        },
      ],
      contextCards: [
        {
          id: "account",
          title: "Associated Account",
          items: [
            { label: "Account", value: "HealthSystems Corp" },
            { label: "Relationship", value: "Strategic prospect" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-13", value: "Discovery call completed" },
            { label: "2026-03-10", value: "Requirements document received" },
          ],
        },
      ],
    },
    {
      id: "contact-102",
      title: "Marcus Njoroge",
      status: "Prospect",
      subtitle: "Chief of Staff, EastBridge Capital",
      summary: "Introduced through partner channel and evaluating executive reporting workflows.",
      lastUpdated: "2026-03-12 14:05",
      detailSections: [
        {
          id: "profile",
          title: "Profile",
          fields: [
            { label: "Email", value: "marcus.njoroge@eastbridge.example" },
            { label: "Phone", value: "+1 646 555 0194" },
            { label: "Department", value: "Executive Office" },
          ],
        },
        {
          id: "engagement",
          title: "Engagement",
          fields: [
            { label: "Last Contact", value: "2026-03-12" },
            { label: "Owner", value: "David Kariuki" },
            { label: "Next Step", value: "Confirm stakeholder workshop" },
          ],
        },
      ],
      contextCards: [
        {
          id: "account",
          title: "Associated Account",
          items: [
            { label: "Account", value: "EastBridge Capital" },
            { label: "Segment", value: "Financial services" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-12", value: "Intro call logged" },
            { label: "2026-03-11", value: "Partner referral accepted" },
          ],
        },
      ],
    },
    {
      id: "contact-103",
      title: "Ava Patel",
      status: "Active",
      subtitle: "VP Product Operations, Nova Retail Group",
      summary: "Active champion for workflow rollout across two regional business units.",
      lastUpdated: "2026-03-11 17:40",
      detailSections: [
        {
          id: "profile",
          title: "Profile",
          fields: [
            { label: "Email", value: "ava.patel@novaretail.example" },
            { label: "Phone", value: "+1 415 555 0113" },
            { label: "Department", value: "Product Operations" },
          ],
        },
        {
          id: "engagement",
          title: "Engagement",
          fields: [
            { label: "Last Contact", value: "2026-03-11" },
            { label: "Owner", value: "Lydia Okafor" },
            { label: "Next Step", value: "Review implementation milestones" },
          ],
        },
      ],
      contextCards: [
        {
          id: "account",
          title: "Associated Account",
          items: [
            { label: "Account", value: "Nova Retail Group" },
            { label: "Plan", value: "Expansion motion" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-11", value: "Rollout review scheduled" },
            { label: "2026-03-08", value: "Success metrics shared" },
          ],
        },
      ],
    },
    {
      id: "contact-104",
      title: "Samuel Otieno",
      status: "Inactive",
      subtitle: "Procurement Lead, Transit Works",
      summary: "Dormant contact retained for reactivation during next budgeting cycle.",
      lastUpdated: "2026-02-28 08:10",
      detailSections: [
        {
          id: "profile",
          title: "Profile",
          fields: [
            { label: "Email", value: "samuel.otieno@transitworks.example" },
            { label: "Phone", value: "+1 312 555 0147" },
            { label: "Department", value: "Procurement" },
          ],
        },
        {
          id: "engagement",
          title: "Engagement",
          fields: [
            { label: "Last Contact", value: "2026-02-20" },
            { label: "Owner", value: "Amina Hassan" },
            { label: "Next Step", value: "Re-engage in Q2 planning cycle" },
          ],
        },
      ],
      contextCards: [
        {
          id: "account",
          title: "Associated Account",
          items: [
            { label: "Account", value: "Transit Works" },
            { label: "Opportunity", value: "Paused" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-02-20", value: "Budget hold communicated" },
            { label: "2026-02-05", value: "Pricing summary sent" },
          ],
        },
      ],
    },
  ],
};

export const leadsModuleMockData: MockWorkspaceModuleData = {
  moduleId: "leads",
  routePath: "/leads",
  headerTitle: "Lead Management",
  headerDescription:
    "Mock lead queue for validating non-destructive record switching and action placement before APIs are connected.",
  queueTitle: "Leads Queue",
  queueSubtitle:
    "Leads stay visible while active opportunities open inside the workspace.",
  workspaceTitle: "Lead Workspace",
  workspaceSubtitle:
    "Lead conversion and progression actions live in the work header, not the sidebar.",
  contextTitle: "Lead Context",
  contextSubtitle:
    "Surface opportunity history, risk notes, and related context in a supporting pane.",
  rootTabLabel: "All Leads",
  moduleActions: createWorkspaceCrudActions("lead", "Lead"),
  recordActions: createRecordCrudActions("lead", [
    { id: "convert-lead", label: "Convert" },
  ]),
  records: [
    {
      id: "lead-201",
      title: "Grace Mwangi",
      status: "Qualified",
      subtitle: "Digital transformation lead, Meridian Logistics",
      summary: "Qualified opportunity with a multi-site rollout requirement and clear budget approval.",
      lastUpdated: "2026-03-15 10:45",
      detailSections: [
        {
          id: "lead-profile",
          title: "Lead Profile",
          fields: [
            { label: "Email", value: "grace.mwangi@meridianlogistics.example" },
            { label: "Source", value: "Partner referral" },
            { label: "Estimated Value", value: "$86,000" },
          ],
        },
        {
          id: "lead-workflow",
          title: "Workflow",
          fields: [
            { label: "Owner", value: "David Kariuki" },
            { label: "Stage", value: "Qualified" },
            { label: "Next Step", value: "Submit commercial proposal" },
          ],
        },
      ],
      contextCards: [
        {
          id: "timeline",
          title: "Recent Timeline",
          items: [
            { label: "2026-03-15", value: "Qualification approved" },
            { label: "2026-03-13", value: "Stakeholder map completed" },
          ],
        },
        {
          id: "risks",
          title: "Risk Notes",
          items: [
            { label: "Security", value: "Needs vendor questionnaire" },
            { label: "Procurement", value: "Target review in 2 weeks" },
          ],
        },
      ],
    },
    {
      id: "lead-202",
      title: "Oliver Grant",
      status: "Contacted",
      subtitle: "Operations director, FieldGrid Energy",
      summary: "Initial outreach landed well and discovery session is being scheduled.",
      lastUpdated: "2026-03-14 15:10",
      detailSections: [
        {
          id: "lead-profile",
          title: "Lead Profile",
          fields: [
            { label: "Email", value: "oliver.grant@fieldgrid.example" },
            { label: "Source", value: "Website inquiry" },
            { label: "Estimated Value", value: "$42,000" },
          ],
        },
        {
          id: "lead-workflow",
          title: "Workflow",
          fields: [
            { label: "Owner", value: "Lydia Okafor" },
            { label: "Stage", value: "Contacted" },
            { label: "Next Step", value: "Lock discovery workshop date" },
          ],
        },
      ],
      contextCards: [
        {
          id: "timeline",
          title: "Recent Timeline",
          items: [
            { label: "2026-03-14", value: "Follow-up note added" },
            { label: "2026-03-12", value: "Inbound form assigned" },
          ],
        },
        {
          id: "risks",
          title: "Risk Notes",
          items: [
            { label: "Competition", value: "Comparing two vendors" },
            { label: "Timing", value: "Needs Q2 start" },
          ],
        },
      ],
    },
    {
      id: "lead-203",
      title: "Nadia Santos",
      status: "Opportunity",
      subtitle: "Regional head of operations, Horizon Care",
      summary: "Commercial review in progress with procurement and legal already involved.",
      lastUpdated: "2026-03-13 11:35",
      detailSections: [
        {
          id: "lead-profile",
          title: "Lead Profile",
          fields: [
            { label: "Email", value: "nadia.santos@horizoncare.example" },
            { label: "Source", value: "Industry event" },
            { label: "Estimated Value", value: "$128,000" },
          ],
        },
        {
          id: "lead-workflow",
          title: "Workflow",
          fields: [
            { label: "Owner", value: "Amina Hassan" },
            { label: "Stage", value: "Opportunity" },
            { label: "Next Step", value: "Finalize commercial redlines" },
          ],
        },
      ],
      contextCards: [
        {
          id: "timeline",
          title: "Recent Timeline",
          items: [
            { label: "2026-03-13", value: "Proposal revision requested" },
            { label: "2026-03-09", value: "Security review passed" },
          ],
        },
        {
          id: "risks",
          title: "Risk Notes",
          items: [
            { label: "Legal", value: "Data residency clause open" },
            { label: "Approvals", value: "CFO sign-off pending" },
          ],
        },
      ],
    },
    {
      id: "lead-204",
      title: "Peter Wallace",
      status: "New",
      subtitle: "Commercial director, Atlas Manufacturing",
      summary: "Fresh lead from campaign with high fit score but no contact yet established.",
      lastUpdated: "2026-03-16 08:50",
      detailSections: [
        {
          id: "lead-profile",
          title: "Lead Profile",
          fields: [
            { label: "Email", value: "peter.wallace@atlasmfg.example" },
            { label: "Source", value: "Targeted campaign" },
            { label: "Estimated Value", value: "$58,000" },
          ],
        },
        {
          id: "lead-workflow",
          title: "Workflow",
          fields: [
            { label: "Owner", value: "David Kariuki" },
            { label: "Stage", value: "New" },
            { label: "Next Step", value: "Initiate first outreach" },
          ],
        },
      ],
      contextCards: [
        {
          id: "timeline",
          title: "Recent Timeline",
          items: [
            { label: "2026-03-16", value: "Lead created from campaign" },
            { label: "2026-03-16", value: "Assigned to regional owner" },
          ],
        },
        {
          id: "risks",
          title: "Risk Notes",
          items: [
            { label: "Contactability", value: "No reply yet" },
            { label: "Qualification", value: "Needs discovery" },
          ],
        },
      ],
    },
  ],
};

export const accountsModuleMockData: MockWorkspaceModuleData = {
  moduleId: "accounts",
  routePath: "/accounts",
  headerTitle: "Account Management",
  headerDescription:
    "Mock account data for validating long-lived workspaces, context pane collapse, and multi-record tabs.",
  queueTitle: "Accounts Queue",
  queueSubtitle:
    "Keep the account queue present while account work remains active in the workspace.",
  workspaceTitle: "Account Workspace",
  workspaceSubtitle:
    "Account-level actions stay in the work header, while related context remains in the pop pane.",
  contextTitle: "Account Context",
  contextSubtitle:
    "Use this pane for health, relationships, and recent account movement.",
  rootTabLabel: "All Accounts",
  moduleActions: createWorkspaceCrudActions("account", "Account"),
  recordActions: createRecordCrudActions("account"),
  records: [
    {
      id: "account-301",
      title: "Northstar Health",
      status: "Customer",
      subtitle: "Enterprise healthcare network",
      summary: "Active enterprise customer expanding into a second regional operating group.",
      lastUpdated: "2026-03-15 13:15",
      detailSections: [
        {
          id: "account-profile",
          title: "Account Profile",
          fields: [
            { label: "Industry", value: "Healthcare" },
            { label: "Owner", value: "Lydia Okafor" },
            { label: "Annual Revenue", value: "$7.4M" },
          ],
        },
        {
          id: "account-health",
          title: "Account Health",
          fields: [
            { label: "Status", value: "Healthy" },
            { label: "Renewal", value: "2026-08-30" },
            { label: "Next Step", value: "Scope expansion workshop" },
          ],
        },
      ],
      contextCards: [
        {
          id: "contacts",
          title: "Key Contacts",
          items: [
            { label: "Executive Sponsor", value: "Jennifer Lee" },
            { label: "Program Owner", value: "Ava Patel" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-15", value: "Expansion review completed" },
            { label: "2026-03-07", value: "Quarterly health check shared" },
          ],
        },
      ],
    },
    {
      id: "account-302",
      title: "Meridian Logistics",
      status: "Prospect",
      subtitle: "Regional logistics operator",
      summary: "Large prospect with cross-border operations and active procurement motion.",
      lastUpdated: "2026-03-14 16:20",
      detailSections: [
        {
          id: "account-profile",
          title: "Account Profile",
          fields: [
            { label: "Industry", value: "Logistics" },
            { label: "Owner", value: "David Kariuki" },
            { label: "Annual Revenue", value: "$3.1M" },
          ],
        },
        {
          id: "account-health",
          title: "Account Health",
          fields: [
            { label: "Status", value: "Evaluation" },
            { label: "Renewal", value: "Not applicable" },
            { label: "Next Step", value: "Commercial proposal review" },
          ],
        },
      ],
      contextCards: [
        {
          id: "contacts",
          title: "Key Contacts",
          items: [
            { label: "Champion", value: "Grace Mwangi" },
            { label: "Procurement", value: "Open" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-14", value: "Discovery notes uploaded" },
            { label: "2026-03-10", value: "Security questions received" },
          ],
        },
      ],
    },
    {
      id: "account-303",
      title: "EastBridge Capital",
      status: "Partner",
      subtitle: "Advisory and capital network",
      summary: "Partner account supporting referrals and executive introductions into target segments.",
      lastUpdated: "2026-03-10 12:00",
      detailSections: [
        {
          id: "account-profile",
          title: "Account Profile",
          fields: [
            { label: "Industry", value: "Financial Services" },
            { label: "Owner", value: "Amina Hassan" },
            { label: "Annual Revenue", value: "$1.8M" },
          ],
        },
        {
          id: "account-health",
          title: "Account Health",
          fields: [
            { label: "Status", value: "Strategic partner" },
            { label: "Renewal", value: "2026-12-15" },
            { label: "Next Step", value: "Plan partner pipeline review" },
          ],
        },
      ],
      contextCards: [
        {
          id: "contacts",
          title: "Key Contacts",
          items: [
            { label: "Primary Contact", value: "Marcus Njoroge" },
            { label: "Partner Lead", value: "Amina Hassan" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-10", value: "Referral review completed" },
            { label: "2026-03-03", value: "Partner metrics shared" },
          ],
        },
      ],
    },
    {
      id: "account-304",
      title: "Nova Retail Group",
      status: "Customer",
      subtitle: "Retail and commerce operator",
      summary: "Growth-stage customer preparing to onboard additional regional operations teams.",
      lastUpdated: "2026-03-09 09:45",
      detailSections: [
        {
          id: "account-profile",
          title: "Account Profile",
          fields: [
            { label: "Industry", value: "Retail" },
            { label: "Owner", value: "Lydia Okafor" },
            { label: "Annual Revenue", value: "$4.6M" },
          ],
        },
        {
          id: "account-health",
          title: "Account Health",
          fields: [
            { label: "Status", value: "Expansion planning" },
            { label: "Renewal", value: "2027-01-20" },
            { label: "Next Step", value: "Define second-phase rollout" },
          ],
        },
      ],
      contextCards: [
        {
          id: "contacts",
          title: "Key Contacts",
          items: [
            { label: "Program Owner", value: "Ava Patel" },
            { label: "Success Lead", value: "Lydia Okafor" },
          ],
        },
        {
          id: "activity",
          title: "Recent Activity",
          items: [
            { label: "2026-03-09", value: "Expansion scope drafted" },
            { label: "2026-03-01", value: "Usage review completed" },
          ],
        },
      ],
    },
  ],
};
