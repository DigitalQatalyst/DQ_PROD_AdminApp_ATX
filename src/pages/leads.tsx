import React from "react";
import {
  LVEWorkspaceLayout,
  LVETab,
} from "../components/layout/LVEWorkspaceLayout";

const defaultTabs: LVETab[] = [
  {
    id: "leads-home",
    label: "Leads Workspace",
    isActive: true,
  },
];

const LeadsPage: React.FC = () => {
  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Lead Management"
        tenantLabel="Demo Tenant"
        streamLabel="Leads Stream"
        tabs={defaultTabs}
        menuPane={
          <div className="p-4 space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase">
              Lead Pipeline
            </div>
            <ul className="space-y-1">
              <li className="rounded-md px-2 py-1 bg-accent text-foreground text-xs">
                All Leads
              </li>
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer">
                New Lead
              </li>
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer">
                Import Leads
              </li>
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer">
                Lead Conversion
              </li>
            </ul>
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mt-4">
              Lead Stages
            </div>
            <ul className="space-y-1">
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer">
                Qualified
              </li>
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer">
                Contacted
              </li>
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer">
                Opportunity
              </li>
            </ul>
          </div>
        }
        listPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase">
                Lead Queue
              </div>
              <span className="text-[10px] text-muted-foreground">
                MVP Placeholder
              </span>
            </div>
            <p className="text-muted-foreground mb-3">
              Lead list with lifecycle stages, activity timeline, and conversion
              workflow will be implemented here.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground">
                • Lead scoring and qualification
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Stage progression tracking
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Activity and follow-up management
              </div>
            </div>
          </div>
        }
        workPane={
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Lead Workspace
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a lead from the queue to view details, update stage, log
                activities, or convert to opportunity.
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">
                  Lead detail view, stage management, activity timeline, and
                  conversion forms will appear here.
                </p>
              </div>
            </div>
          </div>
        }
        popPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mb-2">
              Lead Context
            </div>
            <p className="text-muted-foreground mb-3">
              Lead activities, conversion history, and related opportunities.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground">
                • Activity Timeline
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Lead Source
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Conversion Tracking
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Related Opportunities
              </div>
            </div>
          </div>
        }
        footer={
          <span>
            Lead Management MVP - LVE workspace with lifecycle tracking
          </span>
        }
      />
    </div>
  );
};

export default LeadsPage;
