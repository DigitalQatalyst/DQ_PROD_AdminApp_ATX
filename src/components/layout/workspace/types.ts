import { ReactNode } from "react";

/**
 * Module type determines the workspace behavior and available features.
 * - "record": Standard CRUD operations on individual records
 * - "workflow": Lifecycle-aware workflows with stage transitions (supports lifecycleActions)
 * - "parent-workspace": Supports inner tabs for nested workspaces (supports innerTabs)
 */
export type LVEWorkspaceModuleType = "record" | "workflow" | "parent-workspace";

/**
 * Visual variant for action buttons.
 * Maps to button component variants for consistent styling.
 */
export type LVEWorkspaceActionVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost";

/**
 * Action intent determines automatic behavior.
 * - "create": Opens create modal
 * - "edit": Opens edit modal for selected record
 * - "delete": Opens delete confirmation modal
 */
export type LVEWorkspaceActionIntent = "create" | "edit" | "delete";

/**
 * Context provided to action onClick handlers.
 * Contains information about the current module and selected record.
 */
export interface LVEActionContext<TRecord> {
  /** Unique identifier of the module where the action was triggered */
  moduleId: string;
  /** Currently selected record (undefined if no selection) */
  selectedRecord?: TRecord;
  /** ID of the currently selected record (undefined if no selection) */
  selectedRecordId?: string;
}

/**
 * Action definition for buttons in the workspace.
 * Actions can be placed in listActions, recordActions, lifecycleActions, or quickActions.
 */
export interface LVEActionDefinition<TRecord> {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the button */
  label: string;
  /** Optional icon component to display in the button */
  icon?: React.ComponentType<{ className?: string }>;
  /** Visual variant for the button (default: "default") */
  variant?: LVEWorkspaceActionVariant;
  /** Intent determines automatic behavior (opens modals for create/edit/delete) */
  intent?: LVEWorkspaceActionIntent;
  /** Whether the action button should be disabled */
  disabled?: boolean;
  /** Custom click handler (called if no intent is specified) */
  onClick?: (context: LVEActionContext<TRecord>) => void;
}

/**
 * Module metadata defines identity, routing, and type.
 * Required for all modules.
 */
export interface LVEModuleMetadata {
  /** Unique identifier for the module (used in storage keys and routing) */
  id: string;
  /** Display label for module tabs and headers */
  label: string;
  /** Singular form for labels (e.g., "Contact") */
  singularLabel: string;
  /** Plural form for labels (e.g., "Contacts") */
  pluralLabel: string;
  /** Base route for the module (e.g., "/contacts") */
  route: string;
  /** Icon component to display in module tabs and headers */
  icon: React.ComponentType<{ className?: string }>;
  /** Module type determines available features and behavior */
  moduleType: LVEWorkspaceModuleType;
}

/**
 * Menu registration controls module visibility and ordering in navigation.
 */
export interface LVEMenuRegistration {
  /** Display order in module tabs (lower numbers appear first) */
  order: number;
  /** Whether the module should appear in navigation (default: true) */
  visible?: boolean;
  /** User segments that can access this module (undefined = all segments) */
  requiredSegments?: string[];
}

/**
 * Column definition for the list pane.
 * Defines how a field is displayed in the record list.
 */
export interface LVEListColumn<TRecord> {
  /** Unique identifier for the column */
  id: string;
  /** Display label for the column header */
  label: string;
  /** Visual slot determines styling and position (default: "secondary") */
  slot?: "primary" | "secondary" | "meta" | "badge";
  /** Whether this column should be included in search (default: false) */
  searchable?: boolean;
  /** Render function that returns the column content for a record */
  render: (record: TRecord) => ReactNode;
}

/**
 * List preset for saved views or queues.
 * Structural placeholder for future filtering/sorting features.
 */
export interface LVEListPreset {
  /** Unique identifier for the preset */
  id: string;
  /** Display label for the preset */
  label: string;
}

/**
 * UI state configuration for the list pane.
 * Can be set in module config or overridden via runtime state prop.
 */
export interface LVEListStateConfig {
  /** Whether the list is loading (shows loading indicator) */
  isLoading?: boolean;
  /** Title to display when list is empty */
  emptyTitle?: string;
  /** Description to display when list is empty */
  emptyDescription?: string;
  /** Error message to display (shows error state) */
  errorMessage?: string;
}

/**
 * Complete configuration for the list pane.
 * Defines how records are displayed, searched, and interacted with.
 */
export interface LVEListPaneConfig<TRecord> extends LVEListStateConfig {
  /** Array of records to display (can be overridden by records prop) */
  records: TRecord[];
  /** Function to extract unique ID from a record */
  getRecordId: (record: TRecord) => string;
  /** Function to extract display label from a record */
  getRecordLabel: (record: TRecord) => string;
  /** Column definitions for the list display */
  columns: LVEListColumn<TRecord>[];
  /** Custom function to format the result count label */
  resultCountLabel?: (count: number) => string;
  /** View presets for saved views (structural placeholder) */
  viewPresets?: LVEListPreset[];
  /** Queue presets for saved queues (structural placeholder) */
  queuePresets?: LVEListPreset[];
  /** Actions that operate on multiple selected records */
  bulkActions?: LVEActionDefinition<TRecord>[];
  /** Actions that appear in the list header (e.g., "New Contact") */
  listActions?: LVEActionDefinition<TRecord>[];
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Label for the filter dropdown trigger */
  filterTriggerLabel?: string;
  /** Label for the sort dropdown trigger */
  sortTriggerLabel?: string;
  /** Label for the views dropdown trigger */
  viewsTriggerLabel?: string;
  /** Function to extract searchable text from a record */
  getSearchText?: (record: TRecord) => string;
}

/**
 * Field definition for work window sections.
 * Defines a single field to display in a section.
 */
export interface LVESectionField<TRecord> {
  /** Unique identifier for the field */
  id: string;
  /** Display label for the field */
  label: string;
  /** Render function that returns the field content */
  render: (record: TRecord) => ReactNode;
}

/**
 * Field type for CRUD forms.
 * Determines the input component and validation.
 */
export type LVECrudFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "textarea";

/**
 * Option for select field in CRUD forms.
 */
export interface LVECrudFieldOption {
  /** Display label for the option */
  label: string;
  /** Value to be submitted when option is selected */
  value: string;
}

/**
 * Field definition for CRUD forms (create/edit modals).
 * Defines a single form field with validation and behavior.
 */
export interface LVECrudFieldDefinition<TRecord> {
  /** Unique identifier for the field */
  id: string;
  /** Form field name (used in values object) */
  name: string;
  /** Display label for the field */
  label: string;
  /** Input type (default: "text") */
  type?: LVECrudFieldType;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Help text displayed below the input */
  description?: string;
  /** Whether the field is required for form submission */
  required?: boolean;
  /** Number of rows for textarea fields */
  rows?: number;
  /** Column span in form grid (1 or 2, default: 1) */
  colSpan?: 1 | 2;
  /** Default value for create forms */
  defaultValue?: string;
  /** Options for select fields */
  options?: LVECrudFieldOption[];
  /** Function to extract current value from record (for edit forms) */
  getValue?: (record: TRecord) => string;
}

/**
 * Configuration for the create modal and operation.
 * Defines form fields and local record creation logic.
 */
export interface LVECrudCreateConfig<TRecord> {
  /** Modal title (default: "Create {singularLabel}") */
  title?: string;
  /** Modal description text */
  description?: string;
  /** Submit button label (default: "Create") */
  submitLabel?: string;
  /** Form field definitions */
  fields: LVECrudFieldDefinition<TRecord>[];
  /** 
   * Local record creation function (fallback if onCreateRecord not provided).
   * Should return a new record with temporary ID.
   */
  createRecord: (
    values: Record<string, string>,
    context: { records: TRecord[] },
  ) => TRecord;
}

/**
 * Configuration for the edit modal and operation.
 * Defines form fields and local record update logic.
 */
export interface LVECrudEditConfig<TRecord> {
  /** Modal title (default: "Edit {singularLabel}") - can be function for dynamic titles */
  title?: string | ((record: TRecord) => string);
  /** Modal description text - can be function for dynamic descriptions */
  description?: string | ((record: TRecord) => string);
  /** Submit button label (default: "Save") */
  submitLabel?: string;
  /** Form field definitions */
  fields: LVECrudFieldDefinition<TRecord>[];
  /** 
   * Local record update function (fallback if onUpdateRecord not provided).
   * Should return the updated record.
   */
  updateRecord: (record: TRecord, values: Record<string, string>) => TRecord;
}

/**
 * Configuration for the delete confirmation modal.
 * Defines confirmation dialog text.
 */
export interface LVECrudDeleteConfig<TRecord> {
  /** Modal title (default: "Delete {singularLabel}?") - can be function for dynamic titles */
  title?: string | ((record: TRecord) => string);
  /** Modal description text - can be function for dynamic descriptions */
  description?: string | ((record: TRecord) => string);
  /** Confirm button label (default: "Delete") */
  confirmLabel?: string;
}

/**
 * Complete CRUD configuration for a module.
 * All operations are optional - only define what you need.
 */
export interface LVECrudConfig<TRecord> {
  /** Create operation configuration */
  create?: LVECrudCreateConfig<TRecord>;
  /** Edit operation configuration */
  edit?: LVECrudEditConfig<TRecord>;
  /** Delete operation configuration */
  delete?: LVECrudDeleteConfig<TRecord>;
}

/**
 * Context provided to the onCreateRecord handler when creating a new record.
 */
export interface LVECreateRecordHandlerContext<TRecord> {
  /** Unique identifier of the module creating the record */
  moduleId: string;
  /** Form field values from the create modal */
  values: Record<string, string>;
  /** Current list of records in the module (for duplicate checking, etc.) */
  records: TRecord[];
}

/**
 * Context provided to the onUpdateRecord handler when updating an existing record.
 */
export interface LVEUpdateRecordHandlerContext<TRecord> {
  /** Unique identifier of the module updating the record */
  moduleId: string;
  /** The original record being updated */
  record: TRecord;
  /** The ID of the record being updated */
  recordId: string;
  /** Form field values from the edit modal */
  values: Record<string, string>;
  /** Current list of records in the module */
  records: TRecord[];
}

/**
 * Context provided to the onDeleteRecord handler when deleting a record.
 */
export interface LVEDeleteRecordHandlerContext<TRecord> {
  /** Unique identifier of the module deleting the record */
  moduleId: string;
  /** The record being deleted */
  record: TRecord;
  /** The ID of the record being deleted */
  recordId: string;
  /** Current list of records in the module */
  records: TRecord[];
}

/**
 * Section definition for the work window.
 * Groups related fields together with a title.
 */
export interface LVEWorkSection<TRecord> {
  /** Unique identifier for the section */
  id: string;
  /** Display title for the section */
  title: string;
  /** Number of columns for field layout (default: 1) */
  columns?: 1 | 2 | 3;
  /** Fields to display in this section */
  fields: LVESectionField<TRecord>[];
}

/**
 * Inner tab definition for parent-workspace modules.
 * Allows nested workspaces within the work window (e.g., Contacts tab in Accounts).
 */
export interface LVEInnerWorkspaceTab<TRecord> {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Function that returns sections to display when this tab is active */
  getSections: (record: TRecord) => LVEWorkSection<TRecord>[];
}

/**
 * UI state configuration for the work window.
 * Can be set in module config or overridden via runtime state prop.
 */
export interface LVEWorkWindowStateConfig {
  /** Current mode of the work window */
  mode?: "create" | "edit" | "detail";
  /** Whether the work window is loading (shows loading indicator) */
  isLoading?: boolean;
  /** Title to display when no record is selected */
  emptyTitle?: string;
  /** Description to display when no record is selected */
  emptyDescription?: string;
  /** Error message to display (shows error state) */
  errorMessage?: string;
}

/**
 * Complete configuration for the work window.
 * Defines the main workspace content area.
 */
export interface LVEWorkWindowConfig<TRecord> extends LVEWorkWindowStateConfig {
  /** Static title for the work window */
  title: string;
  /** Static subtitle for the work window */
  subtitle?: string;
  /** Function to generate dynamic title from selected record */
  getSelectedRecordTitle?: (record: TRecord) => ReactNode;
  /** Function to generate dynamic subtitle from selected record */
  getSelectedRecordSubtitle?: (record: TRecord) => ReactNode;
  /** Function to generate metadata display from selected record */
  getSelectedRecordMeta?: (record: TRecord) => ReactNode;
  /** Function that returns sections to display for a record */
  getSections: (record: TRecord) => LVEWorkSection<TRecord>[];
  /** Inner tabs for parent-workspace modules (e.g., Contacts/Deals/Activities in Accounts) */
  innerTabs?: LVEInnerWorkspaceTab<TRecord>[];
  /** Module-level actions (appear in header, not record-specific) */
  moduleActions?: LVEActionDefinition<TRecord>[];
  /** Record-specific actions (appear in header when record is selected) */
  recordActions?: LVEActionDefinition<TRecord>[];
  /** Lifecycle actions for workflow modules (e.g., "Qualify Lead", "Send Proposal") */
  lifecycleActions?: LVEActionDefinition<TRecord>[];
}

/**
 * Context section definition for the pop pane.
 * Groups related contextual information with optional actions.
 */
export interface LVEContextSection<TRecord> {
  /** Unique identifier for the section */
  id: string;
  /** Display title for the section */
  title: string;
  /** Items to display in this section */
  items: LVESectionField<TRecord>[];
  /** Optional actions specific to this section */
  actions?: LVEActionDefinition<TRecord>[];
}

/**
 * UI state configuration for the pop pane.
 * Can be set in module config or overridden via runtime state prop.
 */
export interface LVEPopPaneStateConfig {
  /** Whether the pop pane can be collapsed (default: true) */
  collapsible?: boolean;
  /** Whether the pop pane starts collapsed (default: false) */
  defaultCollapsed?: boolean;
  /** Whether the pop pane is loading (shows loading indicator) */
  isLoading?: boolean;
  /** Title to display when no record is selected */
  emptyTitle?: string;
  /** Description to display when no record is selected */
  emptyDescription?: string;
  /** Error message to display (shows error state) */
  errorMessage?: string;
}

/**
 * Complete configuration for the pop pane (context pane).
 * Defines the contextual information sidebar.
 */
export interface LVEPopPaneConfig<TRecord> extends LVEPopPaneStateConfig {
  /** Static title for the pop pane */
  title: string;
  /** Static subtitle for the pop pane */
  subtitle?: string;
  /** Function that returns context sections to display for a record */
  getSections: (record: TRecord) => LVEContextSection<TRecord>[];
  /** Quick actions that appear at the top of the pop pane */
  quickActions?: LVEActionDefinition<TRecord>[];
}

/**
 * Route configuration for the workspace.
 * Defines base and record routes for navigation.
 */
export interface LVEWorkspaceTabRouteConfig {
  /** Base route for the module (e.g., "/contacts") */
  base: string;
  /** Function that generates record route from ID (e.g., (id) => `/contacts/${id}`) */
  record: (recordId: string) => string;
}

/**
 * Tab behavior configuration.
 * Controls tab persistence, routing, and dirty state support.
 */
export interface LVEWorkspaceTabsConfig {
  /** Whether tabs are backed by routes (default: true) */
  routeBacked?: boolean;
  /** Whether tab state persists to session storage (default: true) */
  persist?: boolean;
  /** Whether to show dirty indicators on modified tabs (default: false) */
  supportDirtyState?: boolean;
  /** Label for the module tabs section (default: "Modules") */
  moduleTabLabel?: string;
  /** Label for the record tabs section (default: "Records") */
  recordTabLabel?: string;
}

/**
 * Props passed to pane override functions (listPaneOverride, workPaneOverride, popPaneOverride).
 * Provides complete context for custom pane implementations.
 */
export interface LVEWorkspaceOverrideProps<TRecord> {
  /** Complete module configuration with runtime state merged */
  module: LVEWorkspaceModuleConfig<TRecord>;
  /** Records after search/filter applied */
  filteredRecords: TRecord[];
  /** Currently selected record (undefined if no selection) */
  selectedRecord?: TRecord;
  /** ID of the currently selected record (undefined if no selection) */
  selectedRecordId?: string;
  /** Current search query string */
  searchQuery: string;
  /** Function to update the search query */
  setSearchQuery: (value: string) => void;
  /** Function to select a record (triggers navigation) */
  onSelectRecord: (record: TRecord) => void;
}

/**
 * Runtime UI state for dynamic control of loading, error, and empty states.
 * Merged with module config at render time without mutating the original config.
 * Runtime state values take precedence over config values.
 */
export interface LVEWorkspaceRuntimeState {
  /** Runtime state overrides for the list pane */
  listPane?: Partial<LVEListStateConfig>;
  /** Runtime state overrides for the work window */
  workWindow?: Partial<LVEWorkWindowStateConfig>;
  /** Runtime state overrides for the pop pane */
  popPane?: Partial<LVEPopPaneStateConfig>;
}

/**
 * Props for the LVEWorkspace component.
 * The main entry point for using the workspace framework.
 * 
 * @example
 * ```tsx
 * <LVEWorkspace
 *   module={contactsModule}
 *   records={apiRecords}
 *   state={{ listPane: { isLoading } }}
 *   onCreateRecord={async ({ values }) => api.create(values)}
 *   onUpdateRecord={async ({ recordId, values }) => api.update(recordId, values)}
 *   onDeleteRecord={async ({ recordId }) => api.delete(recordId)}
 *   persistLocalRecords={false}
 * />
 * ```
 */
export interface LVEWorkspaceProps<TRecord> {
  /** Static module configuration (required) */
  module: LVEWorkspaceModuleConfig<TRecord>;
  /** Controlled record dataset from API (optional, recommended for API-backed modules) */
  records?: TRecord[];
  /** Runtime UI state for loading/error/empty states (optional, recommended) */
  state?: LVEWorkspaceRuntimeState;
  /** Whether to persist records to localStorage (default: false when records provided) */
  persistLocalRecords?: boolean;
  /** API handler for record creation (optional, recommended) */
  onCreateRecord?: (
    context: LVECreateRecordHandlerContext<TRecord>,
  ) => Promise<TRecord> | TRecord;
  /** API handler for record updates (optional, recommended) */
  onUpdateRecord?: (
    context: LVEUpdateRecordHandlerContext<TRecord>,
  ) => Promise<TRecord> | TRecord;
  /** API handler for record deletion (optional, recommended) */
  onDeleteRecord?: (
    context: LVEDeleteRecordHandlerContext<TRecord>,
  ) => Promise<void> | void;
}

/**
 * Complete module configuration for the workspace.
 * Defines all structure, behavior, and appearance for a module.
 * 
 * This is the core configuration object that drives the entire workspace.
 * It should be static and declarative - all dynamic behavior should be
 * handled through the records, state, and CRUD handler props.
 * 
 * @example
 * ```tsx
 * const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
 *   metadata: {
 *     id: "contacts",
 *     label: "Contacts",
 *     singularLabel: "Contact",
 *     pluralLabel: "Contacts",
 *     route: "/contacts",
 *     icon: Users,
 *     moduleType: "record",
 *   },
 *   menu: {
 *     order: 10,
 *     visible: true,
 *   },
 *   routes: {
 *     base: "/contacts",
 *     record: (recordId) => `/contacts/${recordId}`,
 *   },
 *   listPane: { ... },
 *   workWindow: { ... },
 *   popPane: { ... },
 *   crud: { ... },
 * };
 * ```
 */
export interface LVEWorkspaceModuleConfig<TRecord> {
  /** Module identity, routing, and type */
  metadata: LVEModuleMetadata;
  /** Menu registration and visibility */
  menu: LVEMenuRegistration;
  /** Route configuration for navigation */
  routes: LVEWorkspaceTabRouteConfig;
  /** Tab behavior configuration (optional) */
  tabs?: LVEWorkspaceTabsConfig;
  /** List pane configuration (required) */
  listPane: LVEListPaneConfig<TRecord>;
  /** Work window configuration (required) */
  workWindow: LVEWorkWindowConfig<TRecord>;
  /** Pop pane configuration (required) */
  popPane: LVEPopPaneConfig<TRecord>;
  /** CRUD operation configuration (optional) */
  crud?: LVECrudConfig<TRecord>;
  /** Custom list pane renderer (optional, use only when config is insufficient) */
  listPaneOverride?: (props: LVEWorkspaceOverrideProps<TRecord>) => ReactNode;
  /** Custom work pane renderer (optional, use only when config is insufficient) */
  workPaneOverride?: (props: LVEWorkspaceOverrideProps<TRecord>) => ReactNode;
  /** Custom pop pane renderer (optional, use only when config is insufficient) */
  popPaneOverride?: (props: LVEWorkspaceOverrideProps<TRecord>) => ReactNode;
}
