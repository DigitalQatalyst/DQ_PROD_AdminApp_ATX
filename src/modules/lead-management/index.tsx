import React, { useState } from 'react';
import {
  LayoutDashboard, Users, GitBranch, BarChart2, FileText, Mail, Settings, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCRM } from './hooks/useCRM';
import { LeadDashboard } from './pages/LeadDashboard';
import { LeadInbox } from './pages/LeadInbox';
import { LeadPipeline } from './pages/LeadPipeline';
import { LeadAnalytics } from './pages/LeadAnalytics';
import { LeadFormSubmissions } from './pages/LeadFormSubmissions';
import { LeadEmailList } from './pages/LeadEmailList';
import { LeadDetail } from './pages/LeadDetail';
import { AddLeadModal } from './components/AddLeadModal';
import { ViewType } from './types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'leads', label: 'All Leads', icon: <Users className="w-4 h-4" /> },
  { id: 'pipeline', label: 'Pipeline', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'form-submissions', label: 'Form Submissions', icon: <FileText className="w-4 h-4" /> },
  { id: 'email-list', label: 'Email Outreach', icon: <Mail className="w-4 h-4" /> },
];

const LeadManagementModule: React.FC = () => {
  const crm = useCRM();
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const renderView = () => {
    if (crm.activeView === 'lead-detail' && crm.selectedLead) {
      return (
        <LeadDetail
          lead={crm.selectedLead}
          teamMembers={crm.teamMembers}
          onBack={crm.navigateBack}
          onStatusChange={crm.updateLeadStatus}
          onAssign={crm.assignLead}
          onAddNote={crm.addNote}
          onAddTag={crm.addTag}
          onRemoveTag={crm.removeTag}
          onDelete={crm.deleteLead}
          onUpdate={crm.updateLead}
        />
      );
    }

    switch (crm.activeView) {
      case 'dashboard':
        return (
          <LeadDashboard
            leads={crm.leads}
            onLeadClick={(id) => crm.navigateToLead(id, 'dashboard')}
          />
        );
      case 'leads':
        return (
          <LeadInbox
            leads={crm.filteredLeads}
            filters={crm.filters}
            setFilters={crm.setFilters}
            onLeadClick={(id) => crm.navigateToLead(id, 'leads')}
            selectedIds={crm.selectedLeadIds}
            onToggleSelect={crm.toggleLeadSelection}
            onSelectAll={crm.selectAllLeads}
            teamMembers={crm.teamMembers}
            onBulkUpdateStatus={crm.bulkUpdateStatus}
            onBulkAssign={crm.bulkAssign}
            onBulkAddTag={crm.bulkAddTag}
            onBulkDelete={crm.bulkDelete}
          />
        );
      case 'pipeline':
        return (
          <LeadPipeline
            leads={crm.leads}
            teamMembers={crm.teamMembers}
            onLeadClick={(id) => crm.navigateToLead(id, 'pipeline')}
            onUpdateStatus={crm.updateLeadStatus}
          />
        );
      case 'analytics':
        return <LeadAnalytics leads={crm.leads} />;
      case 'form-submissions':
        return (
          <LeadFormSubmissions
            leads={crm.leads}
            onLeadClick={(id) => crm.navigateToLead(id, 'form-submissions')}
          />
        );
      case 'email-list':
        return (
          <LeadEmailList
            leads={crm.leads}
            teamMembers={crm.teamMembers}
            onLeadClick={(id) => crm.navigateToLead(id, 'email-list')}
          />
        );
      default:
        return null;
    }
  };

  const activeNavId = crm.activeView === 'lead-detail' ? crm.previousView : crm.activeView;

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-white border-r border-gray-200 transition-all duration-200 flex-shrink-0',
          crm.sidebarOpen ? 'w-56' : 'w-14'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100">
          {crm.sidebarOpen && (
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CRM</span>
          )}
          <button
            onClick={() => crm.setSidebarOpen(!crm.sidebarOpen)}
            className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {crm.sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Add Lead Button */}
        <div className="px-2 py-3 border-b border-gray-100">
          <button
            onClick={() => setAddLeadOpen(true)}
            className={cn(
              'flex items-center gap-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium',
              crm.sidebarOpen ? 'px-3 py-2' : 'justify-center p-2'
            )}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {crm.sidebarOpen && <span>Add Lead</span>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => crm.setActiveView(item.id)}
              className={cn(
                'flex items-center gap-3 w-full rounded-lg text-sm transition-colors',
                crm.sidebarOpen ? 'px-3 py-2' : 'justify-center p-2',
                activeNavId === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              title={!crm.sidebarOpen ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {crm.sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Settings */}
        <div className="px-2 py-3 border-t border-gray-100">
          <button
            className={cn(
              'flex items-center gap-3 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors',
              crm.sidebarOpen ? 'px-3 py-2' : 'justify-center p-2'
            )}
            title={!crm.sidebarOpen ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {crm.sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {renderView()}
      </main>

      {/* Add Lead Modal */}
      {addLeadOpen && (
        <AddLeadModal
          open={addLeadOpen}
          onOpenChange={(open) => setAddLeadOpen(open)}
          onSubmit={(lead) => { crm.addLead(lead); setAddLeadOpen(false); }}
          teamMembers={crm.teamMembers}
        />
      )}
    </div>
  );
};

export default LeadManagementModule;
