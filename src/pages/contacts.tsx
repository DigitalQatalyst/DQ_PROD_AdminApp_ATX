import React from "react";
import {
  LVEWorkspaceLayout,
  LVETab,
} from "../components/layout/LVEWorkspaceLayout";

const defaultTabs: LVETab[] = [
  {
    id: "contacts-home",
    label: "Contacts Workspace",
    isActive: true,
  },
];

const ContactsPage: React.FC = () => {
  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Contact Management"
        tabs={defaultTabs}
        listPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase">
                Contact List
              </div>
              <span className="text-[10px] text-muted-foreground">
                MVP Placeholder
              </span>
            </div>
            <p className="text-muted-foreground">
              Contact list view with search, filters, and contact records will
              be implemented here. This follows the LVE workspace pattern for
              contact management.
            </p>
          </div>
        }
        workPane={
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Contact Workspace
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a contact from the list to view details, edit
                information, or create a new contact record.
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">
                  Contact detail view, edit forms, and related activities will
                  appear in this workspace area.
                </p>
              </div>
            </div>
          </div>
        }
        popPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mb-2">
              Related Context
            </div>
            <p className="text-muted-foreground mb-3">
              Related accounts, activities, and contact history will appear
              here.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground">
                • Recent Activities
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Associated Accounts
              </div>
              <div className="text-[10px] text-muted-foreground">
                • Contact Timeline
              </div>
            </div>
          </div>
        }
        footer="Contact Management MVP - Integrated with global navigation"
      />
    </div>
  );
};

export default ContactsPage;
