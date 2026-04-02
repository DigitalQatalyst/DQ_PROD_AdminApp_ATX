/**
 * Property-Based Test Generators
 * 
 * This file provides fast-check generators for LVE workspace testing.
 * These generators create random but valid test data for property-based tests.
 */

import * as fc from 'fast-check';
import { User, Building2, Target, Mail, Activity, Globe } from 'lucide-react';
import {
  LVEWorkspaceModuleConfig,
  LVEWorkspaceModuleType,
  LVEActionDefinition,
  LVEListColumn,
  LVEWorkSection,
  LVEContextSection,
  LVECrudConfig,
  LVEWorkspaceRuntimeState,
  LVEModuleMetadata,
  LVEMenuRegistration,
  LVEWorkspaceTabRouteConfig,
  LVEListPaneConfig,
  LVEWorkWindowConfig,
  LVEPopPaneConfig,
  LVEActionVariant,
  LVEActionIntent,
  LVECrudFieldType,
  LVECrudFieldDefinition,
} from '../types';
import { ContactRecord, LeadRecord, AccountRecord } from '../moduleRegistry';

// ============================================================================
// Basic Generators
// ============================================================================

/**
 * Generate a random module type
 */
export const arbModuleType = (): fc.Arbitrary<LVEWorkspaceModuleType> =>
  fc.constantFrom<LVEWorkspaceModuleType>('record', 'workflow', 'parent-workspace');

/**
 * Generate a random action variant
 */
export const arbActionVariant = (): fc.Arbitrary<LVEActionVariant> =>
  fc.constantFrom<LVEActionVariant>('default', 'primary', 'secondary', 'outline', 'ghost');

/**
 * Generate a random action intent
 */
export const arbActionIntent = (): fc.Arbitrary<LVEActionIntent> =>
  fc.constantFrom<LVEActionIntent>('create', 'edit', 'delete');

/**
 * Generate a random CRUD field type
 */
export const arbCrudFieldType = (): fc.Arbitrary<LVECrudFieldType> =>
  fc.constantFrom<LVECrudFieldType>('text', 'email', 'tel', 'number', 'date', 'select', 'textarea');

/**
 * Generate a random icon component
 */
export const arbIconComponent = () =>
  fc.constantFrom(User, Building2, Target, Mail, Activity, Globe);

/**
 * Generate a random ID string
 */
export const arbId = () => fc.uuid();

/**
 * Generate a random label string
 */
export const arbLabel = () => fc.string({ minLength: 3, maxLength: 20 });

/**
 * Generate a random route path
 */
export const arbRoutePath = () =>
  fc.string({ minLength: 3, maxLength: 15 }).map(s => `/${s.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);

// ============================================================================
// Record Generators
// ============================================================================

/**
 * Generate a random ContactRecord
 */
export const arbContactRecord = (): fc.Arbitrary<ContactRecord> =>
  fc.record({
    id: arbId(),
    firstName: fc.string({ minLength: 2, maxLength: 15 }),
    lastName: fc.string({ minLength: 2, maxLength: 15 }),
    title: fc.string({ minLength: 5, maxLength: 30 }),
    organization: fc.string({ minLength: 5, maxLength: 30 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    mobile: fc.string({ minLength: 10, maxLength: 15 }),
    owner: fc.string({ minLength: 5, maxLength: 20 }),
    status: fc.constantFrom('Active', 'Inactive', 'Pending'),
    createdAt: fc.date().map(d => d.toISOString()),
    relatedSummaries: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 5 }),
  });

/**
 * Generate a random LeadRecord
 */
export const arbLeadRecord = (): fc.Arbitrary<LeadRecord> =>
  fc.record({
    id: arbId(),
    firstName: fc.string({ minLength: 2, maxLength: 15 }),
    lastName: fc.string({ minLength: 2, maxLength: 15 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    company: fc.string({ minLength: 5, maxLength: 30 }),
    source: fc.constantFrom('Website', 'Referral', 'Cold Call', 'Event'),
    stage: fc.constantFrom('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'),
    status: fc.constantFrom('Open', 'Converted', 'Lost'),
    owner: fc.string({ minLength: 5, maxLength: 20 }),
    score: fc.integer({ min: 0, max: 100 }),
    tags: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { maxLength: 5 }),
    createdAt: fc.date().map(d => d.toISOString()),
    activitySummary: fc.string({ minLength: 20, maxLength: 100 }),
    notesSummary: fc.string({ minLength: 20, maxLength: 100 }),
  });

/**
 * Generate a random AccountRecord
 */
export const arbAccountRecord = (): fc.Arbitrary<AccountRecord> =>
  fc.record({
    id: arbId(),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    industry: fc.constantFrom('Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'),
    website: fc.webUrl(),
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    address: fc.string({ minLength: 10, maxLength: 50 }),
    country: fc.constantFrom('USA', 'Canada', 'UK', 'Germany', 'France'),
    owner: fc.string({ minLength: 5, maxLength: 20 }),
    lifecycleStage: fc.constantFrom('Lead', 'Opportunity', 'Customer', 'Partner'),
    accountTier: fc.constantFrom('Enterprise', 'Mid-Market', 'SMB'),
    tags: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { maxLength: 5 }),
    createdAt: fc.date().map(d => d.toISOString()),
    contactsCount: fc.integer({ min: 0, max: 50 }),
    dealsCount: fc.integer({ min: 0, max: 20 }),
    activitySummary: fc.string({ minLength: 20, maxLength: 100 }),
    notesSummary: fc.string({ minLength: 20, maxLength: 100 }),
    contacts: fc.array(
      fc.record({
        name: fc.string({ minLength: 5, maxLength: 30 }),
        role: fc.string({ minLength: 5, maxLength: 20 }),
      }),
      { maxLength: 10 }
    ),
    deals: fc.array(
      fc.record({
        name: fc.string({ minLength: 5, maxLength: 30 }),
        stage: fc.constantFrom('Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'),
      }),
      { maxLength: 10 }
    ),
    activities: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 10 }),
    notes: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { maxLength: 10 }),
  });

/**
 * Generate a generic record with an ID
 */
export const arbGenericRecord = () =>
  fc.record({
    id: arbId(),
    name: fc.string({ minLength: 3, maxLength: 30 }),
    status: fc.constantFrom('Active', 'Inactive', 'Pending'),
  });

// ============================================================================
// Configuration Component Generators
// ============================================================================

/**
 * Generate module metadata
 */
export const arbModuleMetadata = (): fc.Arbitrary<LVEModuleMetadata> =>
  fc.record({
    id: arbId(),
    label: arbLabel(),
    singularLabel: arbLabel(),
    pluralLabel: arbLabel(),
    route: arbRoutePath(),
    icon: arbIconComponent(),
    moduleType: arbModuleType(),
  });

/**
 * Generate menu registration
 */
export const arbMenuRegistration = (): fc.Arbitrary<LVEMenuRegistration> =>
  fc.record({
    order: fc.integer({ min: 0, max: 100 }),
    visible: fc.boolean(),
    requiredSegments: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 15 }), { maxLength: 5 })),
  });

/**
 * Generate route configuration
 */
export const arbRouteConfig = (): fc.Arbitrary<LVEWorkspaceTabRouteConfig> =>
  fc.record({
    base: arbRoutePath(),
    record: fc.constant((recordId: string) => `/records/${recordId}`),
  });

/**
 * Generate an action definition
 */
export const arbActionDefinition = <TRecord>(): fc.Arbitrary<LVEActionDefinition<TRecord>> =>
  fc.record({
    id: arbId(),
    label: arbLabel(),
    icon: fc.option(arbIconComponent()),
    variant: fc.option(arbActionVariant()),
    intent: fc.option(arbActionIntent()),
    disabled: fc.boolean(),
    onClick: fc.option(fc.constant(() => {})),
  });

/**
 * Generate a list column
 */
export const arbListColumn = <TRecord>(): fc.Arbitrary<LVEListColumn<TRecord>> =>
  fc.record({
    id: arbId(),
    label: arbLabel(),
    slot: fc.option(fc.constantFrom('primary', 'secondary', 'meta', 'badge')),
    searchable: fc.boolean(),
    render: fc.constant((record: TRecord) => String((record as any).id || 'N/A')),
  });

/**
 * Generate a CRUD field definition
 */
export const arbCrudFieldDefinition = <TRecord>(): fc.Arbitrary<LVECrudFieldDefinition<TRecord>> =>
  fc.record({
    id: arbId(),
    name: fc.string({ minLength: 3, maxLength: 20 }),
    label: arbLabel(),
    type: fc.option(arbCrudFieldType()),
    placeholder: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    description: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
    required: fc.boolean(),
    rows: fc.option(fc.integer({ min: 2, max: 10 })),
    colSpan: fc.option(fc.constantFrom(1, 2)),
    defaultValue: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
    options: fc.option(
      fc.array(
        fc.record({
          label: arbLabel(),
          value: fc.string({ minLength: 1, maxLength: 20 }),
        }),
        { minLength: 1, maxLength: 10 }
      )
    ),
    getValue: fc.option(fc.constant((record: TRecord) => String((record as any).id || ''))),
  });

/**
 * Generate CRUD configuration
 */
export const arbCrudConfig = <TRecord>(): fc.Arbitrary<LVECrudConfig<TRecord>> =>
  fc.record({
    create: fc.option(
      fc.record({
        title: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
        description: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
        submitLabel: fc.option(fc.string({ minLength: 3, maxLength: 15 })),
        fields: fc.array(arbCrudFieldDefinition<TRecord>(), { minLength: 1, maxLength: 5 }),
        createRecord: fc.constant((values: Record<string, string>, context: { records: TRecord[] }) => {
          return { id: 'new-' + Date.now(), ...values } as unknown as TRecord;
        }),
      })
    ),
    edit: fc.option(
      fc.record({
        title: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
        description: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
        submitLabel: fc.option(fc.string({ minLength: 3, maxLength: 15 })),
        fields: fc.array(arbCrudFieldDefinition<TRecord>(), { minLength: 1, maxLength: 5 }),
        updateRecord: fc.constant((record: TRecord, values: Record<string, string>) => {
          return { ...record, ...values };
        }),
      })
    ),
    delete: fc.option(
      fc.record({
        title: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
        description: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
        confirmLabel: fc.option(fc.string({ minLength: 3, maxLength: 15 })),
      })
    ),
  });

// ============================================================================
// Pane Configuration Generators
// ============================================================================

/**
 * Generate list pane configuration
 */
export const arbListPaneConfig = <TRecord>(): fc.Arbitrary<LVEListPaneConfig<TRecord>> =>
  fc.record({
    records: fc.constant([]),
    getRecordId: fc.constant((record: TRecord) => (record as any).id || 'unknown'),
    getRecordLabel: fc.constant((record: TRecord) => (record as any).name || 'Unknown'),
    columns: fc.array(arbListColumn<TRecord>(), { minLength: 1, maxLength: 5 }),
    resultCountLabel: fc.option(fc.constant((count: number) => `${count} items`)),
    viewPresets: fc.option(fc.array(fc.record({ id: arbId(), label: arbLabel() }), { maxLength: 3 })),
    queuePresets: fc.option(fc.array(fc.record({ id: arbId(), label: arbLabel() }), { maxLength: 3 })),
    bulkActions: fc.option(fc.array(arbActionDefinition<TRecord>(), { maxLength: 3 })),
    listActions: fc.option(fc.array(arbActionDefinition<TRecord>(), { maxLength: 3 })),
    searchPlaceholder: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    filterTriggerLabel: fc.option(arbLabel()),
    sortTriggerLabel: fc.option(arbLabel()),
    viewsTriggerLabel: fc.option(arbLabel()),
    getSearchText: fc.option(fc.constant((record: TRecord) => String((record as any).name || ''))),
    isLoading: fc.boolean(),
    emptyTitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    emptyDescription: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
    errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
  });

/**
 * Generate work window configuration
 */
export const arbWorkWindowConfig = <TRecord>(): fc.Arbitrary<LVEWorkWindowConfig<TRecord>> =>
  fc.record({
    title: arbLabel(),
    subtitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    getSelectedRecordTitle: fc.option(fc.constant((record: TRecord) => String((record as any).name || 'Record'))),
    getSelectedRecordSubtitle: fc.option(fc.constant((record: TRecord) => String((record as any).status || ''))),
    getSelectedRecordMeta: fc.option(fc.constant((record: TRecord) => String((record as any).createdAt || ''))),
    getSections: fc.constant((record: TRecord) => []),
    innerTabs: fc.option(
      fc.array(
        fc.record({
          id: arbId(),
          label: arbLabel(),
          getSections: fc.constant((record: TRecord) => []),
        }),
        { minLength: 1, maxLength: 3 }
      )
    ),
    moduleActions: fc.option(fc.array(arbActionDefinition<TRecord>(), { maxLength: 3 })),
    recordActions: fc.option(fc.array(arbActionDefinition<TRecord>(), { maxLength: 3 })),
    lifecycleActions: fc.option(fc.array(arbActionDefinition<TRecord>(), { maxLength: 3 })),
    mode: fc.option(fc.constantFrom('create', 'edit', 'detail')),
    isLoading: fc.boolean(),
    emptyTitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    emptyDescription: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
    errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
  });

/**
 * Generate pop pane configuration
 */
export const arbPopPaneConfig = <TRecord>(): fc.Arbitrary<LVEPopPaneConfig<TRecord>> =>
  fc.record({
    title: arbLabel(),
    subtitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    getSections: fc.constant((record: TRecord) => []),
    quickActions: fc.option(fc.array(arbActionDefinition<TRecord>(), { maxLength: 3 })),
    collapsible: fc.boolean(),
    defaultCollapsed: fc.boolean(),
    isLoading: fc.boolean(),
    emptyTitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
    emptyDescription: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
    errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
  });

// ============================================================================
// Module Configuration Generator
// ============================================================================

/**
 * Generate a complete module configuration
 */
export const arbModuleConfig = <TRecord>(): fc.Arbitrary<LVEWorkspaceModuleConfig<TRecord>> =>
  fc.record({
    metadata: arbModuleMetadata(),
    menu: arbMenuRegistration(),
    routes: arbRouteConfig(),
    tabs: fc.option(
      fc.record({
        routeBacked: fc.boolean(),
        persist: fc.boolean(),
        supportDirtyState: fc.boolean(),
        moduleTabLabel: fc.option(arbLabel()),
        recordTabLabel: fc.option(arbLabel()),
      })
    ),
    listPane: arbListPaneConfig<TRecord>(),
    workWindow: arbWorkWindowConfig<TRecord>(),
    popPane: arbPopPaneConfig<TRecord>(),
    crud: fc.option(arbCrudConfig<TRecord>()),
    listPaneOverride: fc.option(fc.constant(() => null)),
    workPaneOverride: fc.option(fc.constant(() => null)),
    popPaneOverride: fc.option(fc.constant(() => null)),
  });

// ============================================================================
// Runtime State Generators
// ============================================================================

/**
 * Generate runtime state for workspace
 */
export const arbRuntimeState = (): fc.Arbitrary<LVEWorkspaceRuntimeState> =>
  fc.record({
    listPane: fc.option(
      fc.record({
        isLoading: fc.boolean(),
        emptyTitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
        emptyDescription: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
        errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
      })
    ),
    workWindow: fc.option(
      fc.record({
        mode: fc.option(fc.constantFrom('create', 'edit', 'detail')),
        isLoading: fc.boolean(),
        emptyTitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
        emptyDescription: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
        errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
      })
    ),
    popPane: fc.option(
      fc.record({
        collapsible: fc.boolean(),
        defaultCollapsed: fc.boolean(),
        isLoading: fc.boolean(),
        emptyTitle: fc.option(fc.string({ minLength: 5, maxLength: 30 })),
        emptyDescription: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
        errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
      })
    ),
  });

// ============================================================================
// CRUD Operation Generators
// ============================================================================

/**
 * Generate CRUD operation context for create
 */
export const arbCreateContext = <TRecord>(records: TRecord[]) =>
  fc.record({
    moduleId: arbId(),
    values: fc.dictionary(fc.string({ minLength: 3, maxLength: 15 }), fc.string({ minLength: 1, maxLength: 30 })),
    records: fc.constant(records),
  });

/**
 * Generate CRUD operation context for update
 */
export const arbUpdateContext = <TRecord>(record: TRecord, records: TRecord[]) =>
  fc.record({
    moduleId: arbId(),
    record: fc.constant(record),
    recordId: fc.constant((record as any).id || 'unknown'),
    values: fc.dictionary(fc.string({ minLength: 3, maxLength: 15 }), fc.string({ minLength: 1, maxLength: 30 })),
    records: fc.constant(records),
  });

/**
 * Generate CRUD operation context for delete
 */
export const arbDeleteContext = <TRecord>(record: TRecord, records: TRecord[]) =>
  fc.record({
    moduleId: arbId(),
    record: fc.constant(record),
    recordId: fc.constant((record as any).id || 'unknown'),
    records: fc.constant(records),
  });
