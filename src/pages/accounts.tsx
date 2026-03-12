import React from "react";
import { LVEWorkspaceLayout, LVETab } from "../components/layout/LVEWorkspaceLayout";

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
        headerTitle="Account Management (LVE Shell)"
        tenantLabel="Demo Tenant"
        streamLabel="Accounts Stream"
        tabs={defaultTabs}
        menuPane={
          <div className="p-4 space-y-2 text-xs text-slate-700">
            <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase">
              Workspace Sections
            </div>
            <ul className="space-y-1">
              <li className="rounded-md px-2 py-1 bg-slate-100 text-slate-900 text-xs">
                Accounts
              </li>
              <li className="rounded-md px-2 py-1 text-slate-500">
                Contacts (coming soon)
              </li>
              <li className="rounded-md px-2 py-1 text-slate-500">
                Opportunities (coming soon)
              </li>
            </ul>
          </div>
        }
        listPane={
          <div className="p-4 text-xs text-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase">
                Account Queue
              </div>
              <span className="text-[10px] text-slate-400">
                Data wiring TBD
              </span>
            </div>
            <p className="text-slate-500">
              This pane will show the list of accounts, filters, and search
              once the Account Management MVP is enabled. For now it is a
              static placeholder illustrating the List area of the LVE layout.
            </p>
          </div>
        }
        workPane={undefined}
        popPane={
          <div className="p-4 text-xs text-slate-700">
            <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase mb-2">
              Context Pane
            </div>
            <p className="text-slate-500">
              Use this area to surface related activities, contact lists,
              opportunities, or configuration without losing the main
              workspace context.
            </p>
          </div>
        }
        footer={<span>LVE shell only — Account MVP wiring will be enabled later.</span>}
      />
    </div>
  );
};

export default AccountsPage;

