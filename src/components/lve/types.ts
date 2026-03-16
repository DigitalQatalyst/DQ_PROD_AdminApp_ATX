// Core LVE Workspace Types
export interface LVERecord {
  id: string;
  [key: string]: any;
}

export interface LVETab {
  id: string;
  label: string;
  isActive?: boolean;
  isDirty?: boolean;
  canClose?: boolean;
}

export interface LVEColumn {
  id: string;
  label: string;
  field: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: LVERecord) => React.ReactNode;
}

export interface LVEFilter {
  id: string;
  label: string;
  field: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  value?: any;
}

export interface LVEAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick: (record?: LVERecord) => void;
}

export interface LVEField {
  id: string;
  label: string;
  field: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'boolean';
  required?: boolean;
  readonly?: boolean;
  options?: { value: string; label: string }[];
  render?: (value: any, record: LVERecord) => React.ReactNode;
}

export interface LVESection {
  id: string;
  title: string;
  fields: LVEField[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface LVEPaneConfig {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface LVEWorkspaceConfig {
  // Module identification
  moduleId: string;
  title: string;
  
  // Tabs configuration
  tabs?: LVETab[];
  
  // List pane configuration
  listPane: {
    columns: LVEColumn[];
    filters?: LVEFilter[];
    searchable?: boolean;
    sortable?: boolean;
    selectable?: boolean;
    config?: LVEPaneConfig;
  };
  
  // Work pane configuration
  workPane: {
    sections: LVESection[];
    actions?: LVEAction[];
    config?: LVEPaneConfig;
  };
  
  // Pop pane configuration
  popPane?: {
    sections: LVESection[];
    config?: LVEPaneConfig;
  };
  
  // Global actions
  globalActions?: LVEAction[];
}

export interface LVEWorkspaceProps<T extends LVERecord = LVERecord> {
  // Configuration
  config: LVEWorkspaceConfig;
  
  // Data
  records: T[];
  selectedRecord?: T;
  
  // State
  loading?: boolean;
  error?: string;
  
  // Handlers
  onRecordSelect?: (record: T) => void;
  onRecordUpdate?: (record: T) => void;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  
  // Override props (escape hatches)
  overrides?: {
    listPane?: React.ReactNode;
    workPane?: React.ReactNode;
    popPane?: React.ReactNode;
    header?: React.ReactNode;
    tabsBar?: React.ReactNode;
  };
}

export interface LVEWorkspaceState {
  selectedRecordId?: string;
  activeTabId?: string;
  filters: Record<string, any>;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  collapsedPanes: string[];
  collapsedSections: string[];
}