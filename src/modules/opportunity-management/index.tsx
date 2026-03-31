import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, GitBranch, BarChart2, Settings, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCRMOpportunity } from './hooks/useCRMOpportunity';
import { OpportunityDashboard } from './pages/OpportunityDashboard';
import { OpportunityList } from './pages/OpportunityList';
import { OpportunityPipeline } from './pages/OpportunityPipeline';
import { OpportunityAnalytics } from './pages/OpportunityAnalytics';
import { OpportunityDetail } from './pages/OpportunityDetail';
import { AddOpportunityModal } from './components/AddOpportunityModal';
import { OpportunityViewType } from './types';

interface NavItem {
  id: OpportunityViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'opportunities', label: 'All Deals', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'pipeline', label: 'Pipeline', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
];

const OpportunityManagement: React.FC = () => {
  const crm = useCRMOpportunity();
  const [addOpportunityOpen, setAddOpportunityOpen] = useState(false);

  const handleAddTag = (id: string, tag: string) => {
    const opp = crm.opportunities.find((o) => o.id === id);
    if (!opp) return;
    const tags = opp.tags.includes(tag) ? opp.tags : [...opp.tags, tag];
    crm.updateOpportunity(id, { tags });
  };

  const handleRemoveTag = (id: string, tag: string) => {
    const opp = crm.opportunities.find((o) => o.id === id);
    if (!opp) return;
    crm.updateOpportunity(id, { tags: opp.tags.filter((t) => t !== tag) });
  };

  const renderView = () => {
    if (crm.opportunitiesLoading) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Loading opportunities...
        </div>
      );
    }

    if (crm.activeView === 'opportunity-detail' && crm.selectedOpportunity) {
      return (
        <OpportunityDetail
          opportunity={crm.selectedOpportunity}
          teamMembers={crm.teamMembers}
          onBack={crm.navigateBack}
          onStageChange={crm.updateOpportunityStage}
          onAssign={crm.assignOpportunity}
          onAddNote={crm.addNote}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onDelete={crm.deleteOpportunity}
          onUpdate={crm.updateOpportunity}
          usingMock={crm.usingMock}
        />
      );
    }

    switch (crm.activeView) {
      case 'dashboard':
        return (
          <OpportunityDashboard
            opportunities={crm.opportunities}
            onOpportunityClick={(id) => crm.navigateToOpportunity(id, 'dashboard')}
          />
        );
      case 'opportunities':
        return (
          <OpportunityList
            opportunities={crm.filteredOpportunities}
            filters={crm.filters}
            setFilters={crm.setFilters}
            onOpportunityClick={(id) => crm.navigateToOpportunity(id, 'opportunities')}
            selectedIds={crm.selectedOpportunityIds}
            onToggleSelect={crm.toggleOpportunitySelection}
            onSelectAll={crm.selectAllOpportunities}
            teamMembers={crm.teamMembers}
            onBulkUpdateStage={crm.bulkUpdateStage}
            onBulkAssign={crm.bulkAssign}
            onBulkDelete={crm.bulkDelete}
          />
        );
      case 'pipeline':
        return (
          <OpportunityPipeline
            opportunities={crm.opportunities}
            teamMembers={crm.teamMembers}
            onOpportunityClick={(id) => crm.navigateToOpportunity(id, 'pipeline')}
            onUpdateStage={crm.updateOpportunityStage}
          />
        );
      case 'analytics':
        return <OpportunityAnalytics opportunities={crm.opportunities} />;
      default:
        return null;
    }
  };

  const activeNavId = crm.activeView === 'opportunity-detail' ? crm.previousView : crm.activeView;

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-pane-menu border-r border-border transition-all duration-200 flex-shrink-0',
          crm.sidebarOpen ? 'w-56' : 'w-14'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-border">
          {crm.sidebarOpen && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CRM</span>
          )}
          <button
            onClick={() => crm.setSidebarOpen(!crm.sidebarOpen)}
            className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {crm.sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Add Opportunity Button */}
        <div className="px-2 py-3 border-b border-border">
          <button
            onClick={() => setAddOpportunityOpen(true)}
            className={cn(
              'flex items-center gap-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium',
              crm.sidebarOpen ? 'px-3 py-2' : 'justify-center p-2'
            )}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {crm.sidebarOpen && <span>Add Opportunity</span>}
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
        <div className="px-2 py-3 border-t border-border">
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
      <main className="flex-1 overflow-auto min-w-0 flex flex-col">
      <div className="flex-1 overflow-auto min-h-0">
          {renderView()}
        </div>
      </main>

      {/* Add Opportunity Modal */}
      {addOpportunityOpen && (
        <AddOpportunityModal
          open={addOpportunityOpen}
          onOpenChange={(open) => setAddOpportunityOpen(open)}
          onSubmit={(data) => { crm.addOpportunity(data); setAddOpportunityOpen(false); }}
          teamMembers={crm.teamMembers}
        />
      )}
    </div>
  );
};

export default OpportunityManagement;
