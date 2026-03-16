import React from "react";
import {
  LVEWorkspaceLayout,
  LVETab,
} from "../components/layout/LVEWorkspaceLayout";

const defaultTabs: LVETab[] = [
  {
    id: "accounts-home",
    label: "Accounts Workspace",
    isActive: true,
  },
];

const AccountsPage: React.FC = () => {
  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Account Management"
        tabs={defaultTabs}
        listPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase">
                Account List
              </div>
              <span className="text-[10px] text-muted-foreground">
                MVP Placeholder
              </span>
            </div>
            <p className="text-muted-foreground mb-3">
              Account list with search, filters, and account records will be
              implemented here.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground">
                • Account overview and details
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Associated contacts and opportunities
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Activity history and notes
              </div>
            </div>
          </div>
        }
        workPane={
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Account Workspace
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select an account from the list to view details with Overview,
                Contacts, Deals, Activity, and Notes tabs.
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Account detail tabs will include:
                </p>
                <div className="space-y-1 text-left">
                  <div className="text-[10px] text-muted-foreground">
                    • Overview - Account summary and key information
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    • Contacts - Associated contact records
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    • Deals - Related opportunities and deals
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    • Activity - Timeline and interaction history
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    • Notes - Account notes and documentation
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        popPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mb-2">
              Account Context
            </div>
            <p className="text-muted-foreground mb-3">
              Related activities, contacts, and opportunities without losing
              main workspace context.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground">
                • Recent Activities
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Key Contacts
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Open Opportunities
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Account Health
              </div>
            </div>
          </div>
        }
        footer="Account Management MVP - Integrated with global navigation"
      />
    </div>
  );
};

export default AccountsPage;
