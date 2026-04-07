import React, { useEffect, useMemo, useState } from "react";
import {
  LVEWorkspaceLayout,
  LVETab,
} from "../components/layout/LVEWorkspaceLayout";
import { User, ShieldAlert } from "lucide-react";
import {
  Account,
  AccountInput,
  AccountLifecycleStage,
  AccountService,
} from "../api/accounts/accountService";
import { ServiceRequestApi } from "../api/services/serviceRequestApi";
import { ServiceRequest } from "../modules/services/types";
import { ServiceRequestCard } from "../modules/services/components/ServiceRequestCard";
import Spinner from "../components/ui/Spinner";

const lifecycleOptions: AccountLifecycleStage[] = [
  "Prospect",
  "Active Customer",
  "Key Account",
  "At Risk",
  "Inactive",
  "Closed",
];

const emptyForm: AccountInput = {
  name: "",
  industry: "",
  website: "",
  phone: "",
  address: "",
  country: "",
  ownerName: "",
  lifecycleStage: "Prospect",
  accountTier: "",
};

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<AccountLifecycleStage | "all">(
    "all"
  );

  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<LVETab[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "contacts" | "services">("overview");
  const [form, setForm] = useState<AccountInput>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AccountService.listAccounts();
        setAccounts(data);
        if (data.length > 0) {
          openAccountWorkspace(data[0]);
        } else {
          setTabs([
            {
              id: "new-account",
              label: "New Account",
              isActive: true,
            },
          ]);
          setActiveAccountId(null);
          setIsEditing(false);
          setForm(emptyForm);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        !search ||
        acc.name.toLowerCase().includes(search.toLowerCase()) ||
        (acc.industry || "").toLowerCase().includes(search.toLowerCase());
      const matchesStage =
        stageFilter === "all" || acc.lifecycleStage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [accounts, search, stageFilter]);

  const activeAccount = useMemo(
    () => accounts.find((a) => a.id === activeAccountId) || null,
    [accounts, activeAccountId]
  );

  const duplicateNameWarning = useMemo(() => {
    if (!form.name.trim()) return null;
    const existing = accounts.find(
      (a) =>
        a.name.toLowerCase() === form.name.trim().toLowerCase() &&
        a.id !== activeAccountId
    );
    return existing ? `An account named "${existing.name}" already exists.` : null;
  }, [accounts, form.name, activeAccountId]);

  const ensureTabForAccount = (account: Account) => {
    setTabs((prev) => {
      const existing = prev.find((t) => t.id === account.id);
      const nextTabs = existing
        ? prev
        : [
            ...prev.filter((t) => t.id !== "new-account"),
            {
              id: account.id,
              label: `Account: ${account.name}`,
            },
          ];
      return nextTabs.map((t) => ({
        ...t,
        isActive: t.id === account.id,
      }));
    });
  };

  const openAccountWorkspace = (account: Account) => {
    setActiveAccountId(account.id);
    setIsEditing(true);
    setForm({
      name: account.name,
      industry: account.industry,
      website: account.website,
      phone: account.phone,
      address: account.address,
      country: account.country,
      ownerName: account.ownerName,
      lifecycleStage: account.lifecycleStage || "Prospect",
      accountTier: account.accountTier,
    });
    ensureTabForAccount(account);
  };

  const openNewAccountWorkspace = () => {
    setActiveAccountId(null);
    setIsEditing(false);
    setForm(emptyForm);
    setTabs((prev) =>
      [
        ...prev.filter((t) => t.id !== "new-account"),
        { id: "new-account", label: "New Account" },
      ].map((t) => ({ ...t, isActive: t.id === "new-account" }))
    );
  };

  const handleTabSelect = (tabId: string) => {
    if (tabId === "new-account") {
      openNewAccountWorkspace();
      return;
    }
    const account = accounts.find((a) => a.id === tabId);
    if (account) {
      openAccountWorkspace(account);
    }
  };

  const handleTabClose = (tabId: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (remaining.length === 0) {
        openNewAccountWorkspace();
        return [
          {
            id: "new-account",
            label: "New Account",
            isActive: true,
          },
        ];
      }
      if (prev.find((t) => t.id === tabId)?.isActive) {
        const next = remaining[remaining.length - 1];
        handleTabSelect(next.id);
        return remaining.map((t) => ({
          ...t,
          isActive: t.id === next.id,
        }));
      }
      return remaining;
    });
  };

  const handleFormChange = (
    field: keyof AccountInput,
    value: string | AccountLifecycleStage | undefined
  ) => {
    setFormError(null);
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Account name is required");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      let saved: Account;
      if (isEditing && activeAccount) {
        saved = await AccountService.updateAccount(activeAccount.id, form);
      } else {
        saved = await AccountService.createAccount(form);
      }
      setAccounts((prev) => {
        const existingIndex = prev.findIndex((a) => a.id === saved.id);
        if (existingIndex === -1) return [saved, ...prev];
        const copy = [...prev];
        copy[existingIndex] = saved;
        return copy;
      });
      openAccountWorkspace(saved);
    } catch (e: any) {
      setFormError(e?.message || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const menuPane = (
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
  );

  const listPane = (
    <div className="p-4 h-full flex flex-col text-xs text-slate-700">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase">
            Account Queue
          </div>
          <div className="text-[10px] text-slate-400">
            {filteredAccounts.length} account
            {filteredAccounts.length === 1 ? "" : "s"} in view
          </div>
        </div>
        <button
          type="button"
          onClick={openNewAccountWorkspace}
          className="inline-flex items-center rounded-md bg-indigo-600 text-white px-2.5 py-1.5 text-[11px] font-medium hover:bg-indigo-700"
        >
          + New Account
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or industry..."
          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={stageFilter}
          onChange={(e) =>
            setStageFilter(
              e.target.value === "all"
                ? "all"
                : (e.target.value as AccountLifecycleStage)
            )
          }
          className="rounded-md border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All stages</option>
          {lifecycleOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          Loading accounts...
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-amber-600 text-xs">
          {error}
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-slate-200 rounded-md bg-white">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Industry</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Lifecycle
                </th>
                <th className="px-3 py-2 text-left font-semibold">Owner</th>
                <th className="px-3 py-2 text-left font-semibold">Country</th>
                <th className="px-3 py-2 text-left font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-slate-400"
                  >
                    No accounts match the current filters.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isActive = acc.id === activeAccountId;
                  return (
                    <tr
                      key={acc.id}
                      className={`cursor-pointer border-b border-slate-100 ${
                        isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                      onClick={() => openAccountWorkspace(acc)}
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {acc.name}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {acc.industry || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {acc.lifecycleStage || "Prospect"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {acc.ownerName || "Unassigned"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {acc.country || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {new Date(acc.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const workPane = (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">
            {activeAccount ? "Account Workspace" : "Create Account"}
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {activeAccount ? activeAccount.name : "New Account"}
          </div>
        </div>
        {activeAccount && (
          <div className="text-[11px] text-slate-500">
            Last updated{" "}
            {new Date(activeAccount.updatedAt).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </div>
        )}
      </div>
      <div className="border-b border-slate-200 px-4 flex items-center bg-slate-50">
        {[
          { id: "overview", label: "Overview" },
          { id: "contacts", label: "Contacts" },
          { id: "services", label: "Services" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeSubTab === t.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-4 py-3 text-xs text-slate-700 space-y-4">
        {activeSubTab === "overview" && (
          <>
            {formError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-xs">
                {formError}
              </div>
            )}
            {duplicateNameWarning && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-[11px]">
                {duplicateNameWarning}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Account Name<span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Organization name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Industry
                  </label>
                  <input
                    value={form.industry || ""}
                    onChange={(e) =>
                      handleFormChange("industry", e.target.value || undefined)
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Banking, Technology"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Website
                  </label>
                  <input
                    value={form.website || ""}
                    onChange={(e) =>
                      handleFormChange("website", e.target.value || undefined)
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    value={form.phone || ""}
                    onChange={(e) =>
                      handleFormChange("phone", e.target.value || undefined)
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="+971..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    value={form.country || ""}
                    onChange={(e) =>
                      handleFormChange("country", e.target.value || undefined)
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. UAE"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={form.address || ""}
                    onChange={(e) =>
                      handleFormChange("address", e.target.value || undefined)
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
                    placeholder="Street, city"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Owner
                  </label>
                  <input
                    value={form.ownerName || ""}
                    onChange={(e) =>
                      handleFormChange("ownerName", e.target.value || undefined)
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Assigned account manager"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Lifecycle Stage
                    </label>
                    <select
                      value={form.lifecycleStage || "Prospect"}
                      onChange={(e) =>
                        handleFormChange(
                          "lifecycleStage",
                          e.target.value as AccountLifecycleStage
                        )
                      }
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {lifecycleOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Account Tier
                    </label>
                    <input
                      value={form.accountTier || ""}
                      onChange={(e) =>
                        handleFormChange("accountTier", e.target.value || undefined)
                      }
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Strategic, Standard"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSubTab === "contacts" && (
          <div className="py-20 text-center">
            <User className="mx-auto h-12 w-12 text-slate-200 mb-2" />
            <h3 className="text-sm font-medium text-slate-900">Contacts Workspace</h3>
            <p className="text-slate-500 mt-1">Contact management for this account is being modularized.</p>
          </div>
        )}

        {activeSubTab === "services" && (
            <AccountServicesTab accountId={activeAccountId} />
        )}
      </div>
      <div className="border-t border-slate-200 px-4 py-2 flex items-center justify-between bg-slate-50">
        <div className="text-[11px] text-slate-500">
          {activeAccount
            ? "Editing existing account record."
            : "Creating a new account record."}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openNewAccountWorkspace}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700 bg-white hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Account"}
          </button>
        </div>
      </div>
    </div>
  );

  const popPane = (
    <div className="p-4 text-xs text-slate-700 space-y-3">
      <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase mb-1">
        Context Pane
      </div>
      <p className="text-slate-500">
        This pane will host related context for the selected account — such as
        recent activities, linked contacts, open deals, or lifecycle insights.
      </p>
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
        <div className="text-[11px] font-semibold text-slate-800">
          Quick At-a-Glance
        </div>
        <div className="text-[11px] text-slate-600">
          Selected stage:{" "}
          <span className="font-medium">
            {form.lifecycleStage || "Prospect"}
          </span>
        </div>
        <div className="text-[11px] text-slate-600">
          Owner:{" "}
          <span className="font-medium">
            {form.ownerName || "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  );

  const activeTabs: LVETab[] =
    tabs.length === 0
      ? [
          {
            id: "new-account",
            label: "New Account",
            isActive: true,
          },
        ]
      : tabs;

  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Account Management"
        tenantLabel="Enterprise Admin"
        streamLabel="Accounts"
        tabs={activeTabs}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        menuPane={menuPane}
        listPane={listPane}
        workPane={workPane}
        popPane={popPane}
        footer={
          <span>
            MVP: List, view, and create accounts inside reusable LVE workspace.
          </span>
        }
      />
    </div>
  );
};

const AccountServicesTab: React.FC<{ accountId: string | null }> = ({ accountId }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await ServiceRequestApi.listServiceRequests();
        // Filter by accountId on frontend for now, or update API to support filter
        setRequests(data.filter(r => r.account_id === accountId));
      } catch (error) {
        console.error("Error loading account services:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accountId]);

  if (loading) return <div className="py-10 text-center text-slate-400">Loading services...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Service History</h4>
      </div>
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {requests.map(req => (
            <ServiceRequestCard 
                key={req.id} 
                request={req} 
                isSelected={false} 
                onClick={() => {}} 
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border rounded-lg border-dashed">
          <ShieldAlert className="mx-auto h-8 w-8 text-slate-200 mb-2" />
          <p className="text-slate-500 italic">No service requests found for this account.</p>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
