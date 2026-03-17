import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LVEWorkspace } from "../components/lve/LVEWorkspace";
import { leadsConfig } from "../components/lve/configs/leadsConfig";
import { contactsConfig } from "../components/lve/configs/contactsConfig";
import { accountsConfig } from "../components/lve/configs/accountsConfig";
import { Lead, Contact, Account } from "../components/lve/mock/mockData";
import {
  extendedMockLeads,
  extendedMockContacts,
  extendedMockAccounts,
  getFilteredData,
} from "../components/lve/mock/extendedMockData";
import Button from "../components/ui/ButtonComponent";

type ModuleType = "leads" | "contacts" | "accounts";
type FilterType = string;

const LVEDemoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeModule, setActiveModule] = useState<ModuleType>("leads");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string>();
  const [selectedContactId, setSelectedContactId] = useState<string>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();

  // Read URL parameters on mount and when they change
  useEffect(() => {
    const module = searchParams.get("module") as ModuleType;
    const filter = searchParams.get("filter") as FilterType;

    if (module && ["leads", "contacts", "accounts"].includes(module)) {
      setActiveModule(module);
    }

    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  // Update URL when module or filter changes
  const updateParams = (module: ModuleType, filter: FilterType = "all") => {
    setActiveModule(module);
    setActiveFilter(filter);
    setSearchParams({ module, filter });
  };

  // Get filtered data based on active module and filter
  const getActiveData = () => {
    switch (activeModule) {
      case "leads":
        const leadFilter =
          getFilteredData.leads[
            activeFilter as keyof typeof getFilteredData.leads
          ];
        return leadFilter ? leadFilter() : extendedMockLeads;
      case "contacts":
        const contactFilter =
          getFilteredData.contacts[
            activeFilter as keyof typeof getFilteredData.contacts
          ];
        return contactFilter ? contactFilter() : extendedMockContacts;
      case "accounts":
        const accountFilter =
          getFilteredData.accounts[
            activeFilter as keyof typeof getFilteredData.accounts
          ];
        return accountFilter ? accountFilter() : extendedMockAccounts;
      default:
        return [];
    }
  };

  const activeData = getActiveData();

  const renderModule = () => {
    switch (activeModule) {
      case "leads":
        return (
          <LVEWorkspace<Lead>
            config={leadsConfig}
            records={activeData as Lead[]}
            selectedRecord={(activeData as Lead[]).find(
              (l) => l.id === selectedLeadId,
            )}
            onRecordSelect={(lead) => setSelectedLeadId(lead.id)}
            onRecordClear={() => setSelectedLeadId(undefined)}
            onRecordUpdate={(lead) => console.log("Update lead:", lead)}
            onTabSelect={(tabId) => console.log("Tab selected:", tabId)}
            onTabClose={(tabId) => console.log("Tab closed:", tabId)}
            onFilterChange={(filters) =>
              console.log("Filters changed:", filters)
            }
            onSort={(field, direction) =>
              console.log("Sort:", field, direction)
            }
          />
        );

      case "contacts":
        return (
          <LVEWorkspace<Contact>
            config={contactsConfig}
            records={activeData as Contact[]}
            selectedRecord={(activeData as Contact[]).find(
              (c) => c.id === selectedContactId,
            )}
            onRecordSelect={(contact) => setSelectedContactId(contact.id)}
            onRecordClear={() => setSelectedContactId(undefined)}
            onRecordUpdate={(contact) =>
              console.log("Update contact:", contact)
            }
            onTabSelect={(tabId) => console.log("Tab selected:", tabId)}
            onTabClose={(tabId) => console.log("Tab closed:", tabId)}
            onFilterChange={(filters) =>
              console.log("Filters changed:", filters)
            }
            onSort={(field, direction) =>
              console.log("Sort:", field, direction)
            }
          />
        );

      case "accounts":
        return (
          <LVEWorkspace<Account>
            config={accountsConfig}
            records={activeData as Account[]}
            selectedRecord={(activeData as Account[]).find(
              (a) => a.id === selectedAccountId,
            )}
            onRecordSelect={(account) => setSelectedAccountId(account.id)}
            onRecordClear={() => setSelectedAccountId(undefined)}
            onRecordUpdate={(account) =>
              console.log("Update account:", account)
            }
            onTabSelect={(tabId) => console.log("Tab selected:", tabId)}
            onTabClose={(tabId) => console.log("Tab closed:", tabId)}
            onFilterChange={(filters) =>
              console.log("Filters changed:", filters)
            }
            onSort={(field, direction) =>
              console.log("Sort:", field, direction)
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      {/*
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">LVE Workspace Demo</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={activeModule === "leads" ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateParams("leads", "all")}
            >
              Leads ({extendedMockLeads.length})
            </Button>
            <Button
              variant={activeModule === "contacts" ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateParams("contacts", "all")}
            >
              Contacts ({extendedMockContacts.length})
            </Button>
            <Button
              variant={activeModule === "accounts" ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateParams("accounts", "all")}
            >
              Accounts ({extendedMockAccounts.length})
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Active Filter:{" "}
            <span className="font-medium capitalize">{activeFilter}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Showing: <span className="font-medium">{activeData.length}</span>{" "}
            records
          </p>
          {activeFilter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams(activeModule, "all")}
            >
              Clear Filter
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Switch between modules to test the config-driven LVE workspace system.
          Use the sidebar menu actions to apply different filters.
        </p>
      </div>
      */}

      {/* Active Module */}
      <div className="min-h-0 flex-1 overflow-hidden">{renderModule()}</div>
    </div>
  );
};

export default LVEDemoPage;
