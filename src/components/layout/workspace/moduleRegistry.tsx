import { Activity, Building2, Globe, Mail, Target, User } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { StatusBadge } from "../../ui/StatusBadge";
import {
  LVECrudConfig,
  LVECrudFieldDefinition,
  LVEWorkspaceModuleConfig,
} from "./types";
import {
  generateContactRecords,
  generateLeadRecords,
  generateAccountRecords,
} from "./sampleDataGenerator";

export interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  mobile: string;
  owner: string;
  status: string;
  createdAt: string;
  relatedSummaries: string[];
}

export interface LeadRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  stage: string;
  status: string;
  owner: string;
  score: number;
  tags: string[];
  createdAt: string;
  activitySummary: string;
  notesSummary: string;
}

interface AccountContactSummary {
  name: string;
  role: string;
}

interface AccountDealSummary {
  name: string;
  stage: string;
}

export interface AccountRecord {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  country: string;
  owner: string;
  lifecycleStage: string;
  accountTier: string;
  tags: string[];
  createdAt: string;
  contactsCount: number;
  dealsCount: number;
  activitySummary: string;
  notesSummary: string;
  contacts: AccountContactSummary[];
  deals: AccountDealSummary[];
  activities: string[];
  notes: string[];
}

const createActionLogger = (label: string) => () => {
  console.log(`[LVE Action] ${label}`);
};

const renderTags = (tags: string[]) => (
  <div className="flex flex-wrap gap-1">
    {tags.map((tag) => (
      <Badge
        key={tag}
        variant="outline"
        className="border-border bg-background text-[10px] text-muted-foreground"
      >
        {tag}
      </Badge>
    ))}
  </div>
);

const getNextRecordId = <TRecord extends { id: string }>(
  records: TRecord[],
  prefix: string,
) => {
  const maxId = records.reduce((highest, record) => {
    const numericValue = Number.parseInt(
      record.id.replace(`${prefix}-`, ""),
      10,
    );
    return Number.isNaN(numericValue)
      ? highest
      : Math.max(highest, numericValue);
  }, 0);

  return `${prefix}-${maxId + 1}`;
};

const splitCommaSeparatedValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const contactStatusOptions = [
  { label: "Active", value: "Active" },
  { label: "Prospect", value: "Prospect" },
  { label: "Inactive", value: "Inactive" },
];

const leadStageOptions = [
  { label: "New", value: "New" },
  { label: "Contacted", value: "Contacted" },
  { label: "Qualified", value: "Qualified" },
  { label: "Opportunity", value: "Opportunity" },
];

const leadStatusOptions = [
  { label: "Open", value: "Open" },
  { label: "Nurturing", value: "Nurturing" },
  { label: "Paused", value: "Paused" },
  { label: "Closed", value: "Closed" },
];

const accountLifecycleOptions = [
  { label: "Prospect", value: "Prospect" },
  { label: "Customer", value: "Customer" },
  { label: "Partner", value: "Partner" },
];

const accountTierOptions = [
  { label: "Tier 1", value: "Tier 1" },
  { label: "Tier 2", value: "Tier 2" },
  { label: "Tier 3", value: "Tier 3" },
];

const contactCrudFields: LVECrudFieldDefinition<ContactRecord>[] = [
  { id: "first-name", name: "firstName", label: "First Name", required: true },
  { id: "last-name", name: "lastName", label: "Last Name", required: true },
  { id: "title", name: "title", label: "Title", required: true },
  {
    id: "organization",
    name: "organization",
    label: "Organization",
    required: true,
  },
  { id: "email", name: "email", label: "Email", type: "email", required: true },
  { id: "phone", name: "phone", label: "Phone", type: "tel" },
  { id: "mobile", name: "mobile", label: "Mobile", type: "tel" },
  { id: "owner", name: "owner", label: "Owner", required: true },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: contactStatusOptions,
  },
];

const leadCrudFields: LVECrudFieldDefinition<LeadRecord>[] = [
  { id: "first-name", name: "firstName", label: "First Name", required: true },
  { id: "last-name", name: "lastName", label: "Last Name", required: true },
  { id: "email", name: "email", label: "Email", type: "email", required: true },
  { id: "phone", name: "phone", label: "Phone", type: "tel" },
  { id: "company", name: "company", label: "Company", required: true },
  { id: "source", name: "source", label: "Source", required: true },
  { id: "owner", name: "owner", label: "Owner", required: true },
  {
    id: "stage",
    name: "stage",
    label: "Stage",
    type: "select",
    required: true,
    options: leadStageOptions,
  },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: leadStatusOptions,
  },
  {
    id: "score",
    name: "score",
    label: "Score",
    type: "number",
    defaultValue: "50",
  },
  {
    id: "tags",
    name: "tags",
    label: "Tags",
    placeholder: "Comma-separated tags",
    getValue: (record) => record.tags.join(", "),
  },
];

const accountCrudFields: LVECrudFieldDefinition<AccountRecord>[] = [
  { id: "name", name: "name", label: "Account Name", required: true },
  { id: "industry", name: "industry", label: "Industry", required: true },
  { id: "website", name: "website", label: "Website" },
  { id: "phone", name: "phone", label: "Phone", type: "tel" },
  { id: "owner", name: "owner", label: "Owner", required: true },
  { id: "country", name: "country", label: "Country", required: true },
  {
    id: "lifecycle",
    name: "lifecycleStage",
    label: "Lifecycle",
    type: "select",
    required: true,
    options: accountLifecycleOptions,
  },
  {
    id: "tier",
    name: "accountTier",
    label: "Account Tier",
    type: "select",
    required: true,
    options: accountTierOptions,
  },
  {
    id: "address",
    name: "address",
    label: "Address",
    colSpan: 2,
    required: true,
  },
  {
    id: "tags",
    name: "tags",
    label: "Tags",
    placeholder: "Comma-separated tags",
    getValue: (record) => record.tags.join(", "),
  },
];

const contactsRecords: ContactRecord[] = generateContactRecords(50);

const leadsRecords: LeadRecord[] = generateLeadRecords(50);

const accountsRecords: AccountRecord[] = generateAccountRecords(50);

const contactsCrudConfig: LVECrudConfig<ContactRecord> = {
  create: {
    title: "Create Contact",
    description: "Create a contact without leaving the queue.",
    submitLabel: "Create Contact",
    fields: contactCrudFields,
    createRecord: (values, context) => ({
      id: getNextRecordId(context.records as ContactRecord[], "contact"),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      title: values.title.trim(),
      organization: values.organization.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      mobile: values.mobile.trim(),
      owner: values.owner.trim(),
      status: values.status.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      relatedSummaries: ["Created from contact workspace."],
    }),
  },
  edit: {
    title: (record) => `Edit ${record.firstName} ${record.lastName}`,
    description:
      "Update contact details while keeping the queue and workspace in place.",
    submitLabel: "Save Contact",
    fields: contactCrudFields,
    updateRecord: (record, values) => ({
      ...record,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      title: values.title.trim(),
      organization: values.organization.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      mobile: values.mobile.trim(),
      owner: values.owner.trim(),
      status: values.status.trim(),
    }),
  },
  delete: {
    title: (record) => `Delete ${record.firstName} ${record.lastName}?`,
    description: (record) =>
      `This contact will be removed from the ${record.organization} workspace queue.`,
    confirmLabel: "Delete Contact",
  },
};

const leadsCrudConfig: LVECrudConfig<LeadRecord> = {
  create: {
    title: "Create Lead",
    description: "Capture a lead and open it directly in a workspace tab.",
    submitLabel: "Create Lead",
    fields: leadCrudFields,
    createRecord: (values, context) => ({
      id: getNextRecordId(context.records as LeadRecord[], "lead"),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      source: values.source.trim(),
      stage: values.stage.trim(),
      status: values.status.trim(),
      owner: values.owner.trim(),
      score: Number(values.score || "0"),
      tags: splitCommaSeparatedValues(values.tags),
      createdAt: new Date().toISOString().slice(0, 10),
      activitySummary: "Created from the lead workspace.",
      notesSummary: "No notes yet.",
    }),
  },
  edit: {
    title: (record) => `Edit ${record.firstName} ${record.lastName}`,
    description: "Update lifecycle-aware lead details in place.",
    submitLabel: "Save Lead",
    fields: leadCrudFields,
    updateRecord: (record, values) => ({
      ...record,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      source: values.source.trim(),
      stage: values.stage.trim(),
      status: values.status.trim(),
      owner: values.owner.trim(),
      score: Number(values.score || "0"),
      tags: splitCommaSeparatedValues(values.tags),
    }),
  },
  delete: {
    title: (record) => `Delete ${record.firstName} ${record.lastName}?`,
    description: (record) =>
      `This lead and its current ${record.stage.toLowerCase()} workflow context will be removed.`,
    confirmLabel: "Delete Lead",
  },
};

const accountsCrudConfig: LVECrudConfig<AccountRecord> = {
  create: {
    title: "Create Account",
    description: "Create a parent workspace record and open it immediately.",
    submitLabel: "Create Account",
    fields: accountCrudFields,
    createRecord: (values, context) => ({
      id: getNextRecordId(context.records as AccountRecord[], "account"),
      name: values.name.trim(),
      industry: values.industry.trim(),
      website: values.website.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      country: values.country.trim(),
      owner: values.owner.trim(),
      lifecycleStage: values.lifecycleStage.trim(),
      accountTier: values.accountTier.trim(),
      tags: splitCommaSeparatedValues(values.tags),
      createdAt: new Date().toISOString().slice(0, 10),
      contactsCount: 0,
      dealsCount: 0,
      activitySummary: "Created from the account workspace.",
      notesSummary: "No notes yet.",
      contacts: [],
      deals: [],
      activities: [],
      notes: [],
    }),
  },
  edit: {
    title: (record) => `Edit ${record.name}`,
    description: "Update account details without leaving the parent workspace.",
    submitLabel: "Save Account",
    fields: accountCrudFields,
    updateRecord: (record, values) => ({
      ...record,
      name: values.name.trim(),
      industry: values.industry.trim(),
      website: values.website.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      country: values.country.trim(),
      owner: values.owner.trim(),
      lifecycleStage: values.lifecycleStage.trim(),
      accountTier: values.accountTier.trim(),
      tags: splitCommaSeparatedValues(values.tags),
    }),
  },
  delete: {
    title: (record) => `Delete ${record.name}?`,
    description: (record) =>
      `This account and its ${record.contactsCount} contact links will be removed from the workspace.`,
    confirmLabel: "Delete Account",
  },
};

export const contactsModule: LVEWorkspaceModuleConfig<ContactRecord> = {
  metadata: {
    id: "contacts",
    label: "Contacts",
    singularLabel: "Contact",
    pluralLabel: "Contacts",
    route: "/contacts",
    icon: User,
    moduleType: "record",
  },
  menu: {
    order: 10,
    visible: true,
    requiredSegments: ["internal"],
  },
  routes: {
    base: "/contacts",
    record: (recordId) => `/contacts/${recordId}`,
  },
  tabs: {
    routeBacked: true,
    persist: true,
    supportDirtyState: true,
    moduleTabLabel: "Modules",
    recordTabLabel: "Workspaces",
  },
  crud: contactsCrudConfig,
  listPane: {
    records: contactsRecords,
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => `${record.firstName} ${record.lastName}`,
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        searchable: true,
        render: (record) => `${record.firstName} ${record.lastName}`,
      },
      {
        id: "role",
        label: "Title",
        slot: "secondary",
        searchable: true,
        render: (record) => `${record.title}, ${record.organization}`,
      },
      {
        id: "status",
        label: "Status",
        slot: "badge",
        searchable: true,
        render: (record) => <StatusBadge status={record.status} />,
      },
    ],
    searchPlaceholder: "Search contacts",
    filterTriggerLabel: "Filters",
    sortTriggerLabel: "Sort",
    viewsTriggerLabel: "Views",
    viewPresets: [
      { id: "all", label: "All Contacts" },
      { id: "active", label: "Active" },
    ],
    queuePresets: [{ id: "recent", label: "Recently Added" }],
    resultCountLabel: (count) => `${count} contacts`,
  },
  workWindow: {
    title: "Contact Workspace",
    subtitle:
      "Create, review, and edit contact records without leaving the queue.",
    emptyTitle: "Contact Workspace",
    emptyDescription: "Select a contact to open a record-bound workspace tab.",
    moduleActions: [
      { id: "new-contact", label: "New Contact", intent: "create" },
    ],
    recordActions: [
      { id: "edit-contact", label: "Edit", intent: "edit" },
      {
        id: "delete-contact",
        label: "Delete",
        variant: "outline",
        intent: "delete",
      },
    ],
    getSelectedRecordTitle: (record) =>
      `${record.firstName} ${record.lastName}`,
    getSelectedRecordSubtitle: (record) =>
      `${record.title} at ${record.organization}`,
    getSelectedRecordMeta: (record) => (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Mail className="h-3.5 w-3.5" />
        {record.email}
      </div>
    ),
    getSections: (record) => [
      {
        id: "profile",
        title: "Profile",
        columns: 2,
        fields: [
          { id: "email", label: "Email", render: () => record.email },
          { id: "phone", label: "Phone", render: () => record.phone },
          { id: "mobile", label: "Mobile", render: () => record.mobile },
          { id: "owner", label: "Owner", render: () => record.owner },
          { id: "status", label: "Status", render: () => record.status },
          { id: "created", label: "Created", render: () => record.createdAt },
        ],
      },
      {
        id: "entry-points",
        title: "Create From Context",
        fields: [
          {
            id: "contexts",
            label: "Supported Entry Points",
            render: () =>
              "Contacts module, account context, vendor context, application context, and global quick create.",
          },
        ],
      },
    ],
  },
  popPane: {
    title: "Contact Context",
    subtitle:
      "Relationship summaries and recent linked context stay visible here.",
    collapsible: true,
    defaultCollapsed: false,
    quickActions: [
      {
        id: "contact-note",
        label: "Add Note",
        onClick: createActionLogger("contacts.context.add-note"),
      },
    ],
    emptyTitle: "No Contact Context",
    emptyDescription: "Select a contact to view related context.",
    getSections: (record) => [
      {
        id: "relationships",
        title: "Related Summaries",
        items: record.relatedSummaries.map((summary, index) => ({
          id: `summary-${index + 1}`,
          label: `Summary ${index + 1}`,
          render: () => summary,
        })),
      },
    ],
  },
};

export const leadsModule: LVEWorkspaceModuleConfig<LeadRecord> = {
  metadata: {
    id: "leads",
    label: "Leads",
    singularLabel: "Lead",
    pluralLabel: "Leads",
    route: "/leads",
    icon: Target,
    moduleType: "workflow",
  },
  menu: {
    order: 20,
    visible: true,
    requiredSegments: ["internal"],
  },
  routes: {
    base: "/leads",
    record: (recordId) => `/leads/${recordId}`,
  },
  tabs: {
    routeBacked: true,
    persist: true,
    supportDirtyState: true,
    moduleTabLabel: "Modules",
    recordTabLabel: "Workspaces",
  },
  crud: leadsCrudConfig,
  listPane: {
    records: leadsRecords,
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => `${record.firstName} ${record.lastName}`,
    columns: [
      {
        id: "name",
        label: "Lead",
        slot: "primary",
        searchable: true,
        render: (record) => `${record.firstName} ${record.lastName}`,
      },
      {
        id: "company",
        label: "Company",
        slot: "secondary",
        searchable: true,
        render: (record) => `${record.company} · ${record.stage}`,
      },
      {
        id: "score",
        label: "Score",
        slot: "meta",
        render: (record) => `Score ${record.score}`,
      },
      {
        id: "status",
        label: "Status",
        slot: "badge",
        searchable: true,
        render: (record) => <StatusBadge status={record.stage} />,
      },
    ],
    searchPlaceholder: "Search leads",
    filterTriggerLabel: "Stage",
    sortTriggerLabel: "Priority",
    viewsTriggerLabel: "Queues",
    viewPresets: [
      { id: "qualified", label: "Qualified" },
      { id: "open", label: "Open Pipeline" },
    ],
    queuePresets: [{ id: "high-score", label: "High Score" }],
    resultCountLabel: (count) => `${count} leads`,
  },
  workWindow: {
    title: "Lead Workspace",
    subtitle:
      "Lifecycle-aware lead work stays in the main window while the queue remains visible.",
    emptyTitle: "Lead Workspace",
    emptyDescription: "Select a lead to open a lifecycle-aware workspace tab.",
    moduleActions: [{ id: "new-lead", label: "New Lead", intent: "create" }],
    recordActions: [
      { id: "edit-lead", label: "Edit", intent: "edit" },
      {
        id: "delete-lead",
        label: "Delete",
        variant: "outline",
        intent: "delete",
      },
    ],
    lifecycleActions: [
      {
        id: "convert-lead",
        label: "Convert",
        onClick: createActionLogger("leads.convert"),
      },
      {
        id: "advance-stage",
        label: "Advance Stage",
        onClick: createActionLogger("leads.advance-stage"),
      },
    ],
    getSelectedRecordTitle: (record) =>
      `${record.firstName} ${record.lastName}`,
    getSelectedRecordSubtitle: (record) =>
      `${record.company} · ${record.stage}`,
    getSelectedRecordMeta: (record) => (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        Lead score {record.score}
      </div>
    ),
    getSections: (record) => [
      {
        id: "lead-profile",
        title: "Lead Profile",
        columns: 2,
        fields: [
          { id: "email", label: "Email", render: () => record.email },
          { id: "phone", label: "Phone", render: () => record.phone },
          { id: "company", label: "Company", render: () => record.company },
          { id: "owner", label: "Owner", render: () => record.owner },
          { id: "source", label: "Source", render: () => record.source },
          { id: "created", label: "Created", render: () => record.createdAt },
        ],
      },
      {
        id: "workflow",
        title: "Workflow",
        columns: 2,
        fields: [
          { id: "stage", label: "Stage", render: () => record.stage },
          { id: "status", label: "Status", render: () => record.status },
          { id: "score", label: "Score", render: () => record.score },
          { id: "tags", label: "Tags", render: () => renderTags(record.tags) },
        ],
      },
    ],
  },
  popPane: {
    title: "Lead Context",
    subtitle:
      "Activity summaries and notes stay adjacent to the lead workflow.",
    collapsible: true,
    defaultCollapsed: false,
    quickActions: [
      {
        id: "lead-note",
        label: "Add Note",
        onClick: createActionLogger("leads.context.add-note"),
      },
    ],
    emptyTitle: "No Lead Context",
    emptyDescription: "Select a lead to view activity and notes context.",
    getSections: (record) => [
      {
        id: "activity",
        title: "Activity Summary",
        items: [
          {
            id: "activity-summary",
            label: "Recent Activity",
            render: () => record.activitySummary,
          },
        ],
      },
      {
        id: "notes",
        title: "Notes Summary",
        items: [
          {
            id: "notes-summary",
            label: "Notes",
            render: () => record.notesSummary,
          },
        ],
      },
    ],
  },
};

export const accountsModule: LVEWorkspaceModuleConfig<AccountRecord> = {
  metadata: {
    id: "accounts",
    label: "Accounts",
    singularLabel: "Account",
    pluralLabel: "Accounts",
    route: "/accounts",
    icon: Building2,
    moduleType: "parent-workspace",
  },
  menu: {
    order: 30,
    visible: true,
    requiredSegments: ["internal"],
  },
  routes: {
    base: "/accounts",
    record: (recordId) => `/accounts/${recordId}`,
  },
  tabs: {
    routeBacked: true,
    persist: true,
    supportDirtyState: true,
    moduleTabLabel: "Modules",
    recordTabLabel: "Workspaces",
  },
  crud: accountsCrudConfig,
  listPane: {
    records: accountsRecords,
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => record.name,
    columns: [
      {
        id: "name",
        label: "Account",
        slot: "primary",
        searchable: true,
        render: (record) => record.name,
      },
      {
        id: "industry",
        label: "Industry",
        slot: "secondary",
        searchable: true,
        render: (record) => `${record.industry} · ${record.country}`,
      },
      {
        id: "tier",
        label: "Tier",
        slot: "meta",
        render: (record) => record.accountTier,
      },
      {
        id: "stage",
        label: "Lifecycle",
        slot: "badge",
        searchable: true,
        render: (record) => <StatusBadge status={record.lifecycleStage} />,
      },
    ],
    searchPlaceholder: "Search accounts",
    filterTriggerLabel: "Tier",
    sortTriggerLabel: "Lifecycle",
    viewsTriggerLabel: "Views",
    viewPresets: [
      { id: "customers", label: "Customers" },
      { id: "partners", label: "Partners" },
    ],
    queuePresets: [{ id: "expansion", label: "Expansion Accounts" }],
    resultCountLabel: (count) => `${count} accounts`,
  },
  workWindow: {
    title: "Account Workspace",
    subtitle:
      "Parent workspaces can hold nested detail tabs without changing shell markup.",
    emptyTitle: "Account Workspace",
    emptyDescription:
      "Select an account to open a parent workspace with inner tabs.",
    moduleActions: [
      { id: "new-account", label: "New Account", intent: "create" },
    ],
    recordActions: [
      { id: "edit-account", label: "Edit", intent: "edit" },
      {
        id: "delete-account",
        label: "Delete",
        variant: "outline",
        intent: "delete",
      },
    ],
    getSelectedRecordTitle: (record) => record.name,
    getSelectedRecordSubtitle: (record) =>
      `${record.industry} · ${record.lifecycleStage}`,
    getSelectedRecordMeta: (record) => (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        {record.website}
      </div>
    ),
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        columns: 2,
        fields: [
          { id: "website", label: "Website", render: () => record.website },
          { id: "phone", label: "Phone", render: () => record.phone },
          { id: "owner", label: "Owner", render: () => record.owner },
          { id: "country", label: "Country", render: () => record.country },
          { id: "tier", label: "Tier", render: () => record.accountTier },
          { id: "created", label: "Created", render: () => record.createdAt },
        ],
      },
    ],
    innerTabs: [
      {
        id: "overview",
        label: "Overview",
        getSections: (record) => [
          {
            id: "overview-core",
            title: "Overview",
            columns: 2,
            fields: [
              { id: "website", label: "Website", render: () => record.website },
              { id: "phone", label: "Phone", render: () => record.phone },
              { id: "address", label: "Address", render: () => record.address },
              {
                id: "tags",
                label: "Tags",
                render: () => renderTags(record.tags),
              },
            ],
          },
        ],
      },
      {
        id: "contacts",
        label: "Contacts",
        getSections: (record) => [
          {
            id: "contacts-section",
            title: "Related Contacts",
            fields: record.contacts.map((contact, index) => ({
              id: `contact-${index + 1}`,
              label: contact.name,
              render: () => contact.role,
            })),
          },
        ],
      },
      {
        id: "deals",
        label: "Deals",
        getSections: (record) => [
          {
            id: "deals-section",
            title: "Open Deals",
            fields: record.deals.map((deal, index) => ({
              id: `deal-${index + 1}`,
              label: deal.name,
              render: () => deal.stage,
            })),
          },
        ],
      },
      {
        id: "activity",
        label: "Activity",
        getSections: (record) => [
          {
            id: "activity-section",
            title: "Recent Activity",
            fields: record.activities.map((activity, index) => ({
              id: `activity-${index + 1}`,
              label: `Activity ${index + 1}`,
              render: () => activity,
            })),
          },
        ],
      },
      {
        id: "notes",
        label: "Notes",
        getSections: (record) => [
          {
            id: "notes-section",
            title: "Notes",
            fields: record.notes.map((note, index) => ({
              id: `note-${index + 1}`,
              label: `Note ${index + 1}`,
              render: () => note,
            })),
          },
        ],
      },
    ],
  },
  popPane: {
    title: "Account Context",
    subtitle:
      "Relationship-heavy context remains visible while the account workspace stays open.",
    collapsible: true,
    defaultCollapsed: false,
    quickActions: [
      {
        id: "account-contact",
        label: "New Contact",
        onClick: createActionLogger("accounts.context.new-contact"),
      },
    ],
    emptyTitle: "No Account Context",
    emptyDescription:
      "Select an account to view context cards and recent linked summaries.",
    getSections: (record) => [
      {
        id: "summary",
        title: "Account Summary",
        items: [
          {
            id: "activity",
            label: "Activity",
            render: () => record.activitySummary,
          },
          { id: "notes", label: "Notes", render: () => record.notesSummary },
        ],
      },
      {
        id: "counts",
        title: "Relationship Counts",
        items: [
          {
            id: "contacts",
            label: "Contacts",
            render: () => record.contactsCount,
          },
          { id: "deals", label: "Deals", render: () => record.dealsCount },
          { id: "location", label: "Location", render: () => record.country },
        ],
      },
    ],
  },
};

export const lveModules = [
  contactsModule,
  leadsModule,
  accountsModule,
] as const;

/**
 * Validates a module configuration at runtime
 * Logs warnings for incomplete or invalid configurations
 */
const validateModuleConfig = <TRecord extends { id: string }>(
  module: LVEWorkspaceModuleConfig<TRecord>,
): boolean => {
  let isValid = true;
  const moduleId = module.metadata?.id || "unknown";

  // Validate metadata
  if (!module.metadata) {
    console.warn(
      `[Module Validation] Module "${moduleId}" is missing metadata`,
    );
    isValid = false;
  } else {
    if (!module.metadata.id) {
      console.warn(`[Module Validation] Module is missing metadata.id`);
      isValid = false;
    }
    if (!module.metadata.label) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing metadata.label`,
      );
      isValid = false;
    }
    if (!module.metadata.route) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing metadata.route`,
      );
      isValid = false;
    }
    if (!module.metadata.moduleType) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing metadata.moduleType`,
      );
      isValid = false;
    } else if (
      !["record", "workflow", "parent-workspace"].includes(
        module.metadata.moduleType,
      )
    ) {
      console.warn(
        `[Module Validation] Module "${moduleId}" has invalid moduleType: "${module.metadata.moduleType}". ` +
          `Must be "record", "workflow", or "parent-workspace"`,
      );
      isValid = false;
    }
  }

  // Validate menu
  if (!module.menu) {
    console.warn(
      `[Module Validation] Module "${moduleId}" is missing menu configuration`,
    );
    isValid = false;
  } else {
    if (typeof module.menu.order !== "number") {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing menu.order`,
      );
      isValid = false;
    }
  }

  // Validate routes
  if (!module.routes) {
    console.warn(
      `[Module Validation] Module "${moduleId}" is missing routes configuration`,
    );
    isValid = false;
  } else {
    if (!module.routes.base) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing routes.base`,
      );
      isValid = false;
    }
    if (!module.routes.record) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing routes.record`,
      );
      isValid = false;
    }
  }

  // Validate listPane
  if (!module.listPane) {
    console.warn(
      `[Module Validation] Module "${moduleId}" is missing listPane configuration`,
    );
    isValid = false;
  } else {
    if (!module.listPane.getRecordId) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing listPane.getRecordId`,
      );
      isValid = false;
    }
    if (!module.listPane.getRecordLabel) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing listPane.getRecordLabel`,
      );
      isValid = false;
    }
    if (!module.listPane.columns || module.listPane.columns.length === 0) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing listPane.columns`,
      );
      isValid = false;
    }
  }

  // Validate workWindow
  if (!module.workWindow) {
    console.warn(
      `[Module Validation] Module "${moduleId}" is missing workWindow configuration`,
    );
    isValid = false;
  } else {
    if (!module.workWindow.getSections) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing workWindow.getSections`,
      );
      isValid = false;
    }
  }

  // Validate popPane
  if (!module.popPane) {
    console.warn(
      `[Module Validation] Module "${moduleId}" is missing popPane configuration`,
    );
    isValid = false;
  } else {
    if (!module.popPane.getSections) {
      console.warn(
        `[Module Validation] Module "${moduleId}" is missing popPane.getSections`,
      );
      isValid = false;
    }
  }

  return isValid;
};

// Validate all modules at module load time
if (typeof window !== "undefined") {
  lveModules.forEach((module) => {
    validateModuleConfig(module);
  });
}

export const lveModuleRegistry = Object.fromEntries(
  lveModules.map((module) => [module.metadata.id, module]),
) as Record<string, (typeof lveModules)[number]>;

export const getLveModulesForSegment = (userSegment: string | null) =>
  lveModules
    .filter((module) => {
      if (module.menu.visible === false) {
        return false;
      }

      if (
        !module.menu.requiredSegments ||
        module.menu.requiredSegments.length === 0
      ) {
        return true;
      }

      return userSegment
        ? module.menu.requiredSegments.includes(userSegment)
        : false;
    })
    .sort((left, right) => left.menu.order - right.menu.order);
