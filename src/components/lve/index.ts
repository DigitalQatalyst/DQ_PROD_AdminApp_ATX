// Core components
export { LVEWorkspace } from './LVEWorkspace';
export { LVEWorkspaceLayout } from './LVEWorkspaceLayout';

// Individual components
export { LVEHeader } from './components/LVEHeader';
export { LVETabsBar } from './components/LVETabsBar';
export { LVEListPane } from './components/LVEListPane';
export { LVEWorkPane } from './components/LVEWorkPane';
export { LVEPopPane } from './components/LVEPopPane';

// Types
export type {
  LVERecord,
  LVETab,
  LVEColumn,
  LVEFilter,
  LVEAction,
  LVEField,
  LVESection,
  LVEPaneConfig,
  LVEWorkspaceConfig,
  LVEWorkspaceProps,
  LVEWorkspaceState,
} from './types';

// Mock data and configs
export { mockLeads, mockContacts, mockAccounts } from './mock/mockData';
export type { Lead, Contact, Account } from './mock/mockData';
export { leadsConfig } from './configs/leadsConfig';
export { contactsConfig } from './configs/contactsConfig';
export { accountsConfig } from './configs/accountsConfig';