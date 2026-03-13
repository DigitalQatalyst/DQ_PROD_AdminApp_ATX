import React, { useState } from "react";
import { LVEWorkspaceLayout, LVETab } from "../components/layout/LVEWorkspaceLayout";
import { Users, UserPlus, Clock, CheckCircle, Filter } from "lucide-react";

// Mock lead data - replace with actual API calls
interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string;
  createdAt: string;
  assignedTo?: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    status: "new",
    source: "Website",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    company: "Tech Solutions",
    status: "contacted",
    source: "Referral",
    createdAt: "2024-01-14",
    assignedTo: "Sarah Johnson",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    company: "Global Industries",
    status: "qualified",
    source: "LinkedIn",
    createdAt: "2024-01-13",
    assignedTo: "Mike Chen",
  },
];

const defaultTabs: LVETab[] = [
  {
    id: "leads-home",
    label: "Lead Management",
    isActive: true,
  },
];

const LeadManagementPage: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "contacted":
        return "bg-yellow-100 text-yellow-700";
      case "qualified":
        return "bg-green-100 text-green-700";
      case "converted":
        return "bg-emerald-100 text-emerald-700";
      case "lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredLeads =
    filterStatus === "all"
      ? mockLeads
      : mockLeads.filter((lead) => lead.status === filterStatus);

  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Lead Management"
        tenantLabel="Demo Tenant"
        streamLabel="Leads Stream"
        tabs={defaultTabs}
        menuPane={
          <div className="p-4 space-y-4">
            <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase mb-3">
              Lead Views
            </div>
            <ul className="space-y-1">
              <li
                className="rounded-md px-3 py-2 bg-slate-100 text-slate-900 text-xs cursor-pointer hover:bg-slate-200 flex items-center gap-2"
                onClick={() => setFilterStatus("all")}
              >
                <Users size={14} />
                All Leads ({mockLeads.length})
              </li>
              <li
                className="rounded-md px-3 py-2 text-slate-600 text-xs cursor-pointer hover:bg-slate-100 flex items-center gap-2"
                onClick={() => setFilterStatus("new")}
              >
                <UserPlus size={14} />
                New Leads ({mockLeads.filter((l) => l.status === "new").length})
              </li>
              <li
                className="rounded-md px-3 py-2 text-slate-600 text-xs cursor-pointer hover:bg-slate-100 flex items-center gap-2"
                onClick={() => setFilterStatus("contacted")}
              >
                <Clock size={14} />
                Contacted ({mockLeads.filter((l) => l.status === "contacted").length})
              </li>
              <li
                className="rounded-md px-3 py-2 text-slate-600 text-xs cursor-pointer hover:bg-slate-100 flex items-center gap-2"
                onClick={() => setFilterStatus("qualified")}
              >
                <CheckCircle size={14} />
                Qualified ({mockLeads.filter((l) => l.status === "qualified").length})
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-200">
              <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase mb-3">
                Quick Actions
              </div>
              <button className="w-full px-3 py-2 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2">
                <UserPlus size={14} />
                Add New Lead
              </button>
            </div>
          </div>
        }
        listPane={
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-slate-900 text-sm">
                  Lead Queue
                </div>
                <button className="text-slate-500 hover:text-slate-700">
                  <Filter size={16} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedLead?.id === lead.id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {lead.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-[10px] font-medium rounded-full ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{lead.source}</span>
                    <span>•</span>
                    <span>{lead.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        workPane={
          selectedLead ? (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">
                      {selectedLead.name}
                    </h2>
                    <p className="text-sm text-slate-500">{selectedLead.company}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      selectedLead.status
                    )}`}
                  >
                    {selectedLead.status}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 w-24">Email:</span>
                      <span className="text-slate-900">{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 w-24">Company:</span>
                      <span className="text-slate-900">{selectedLead.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 w-24">Source:</span>
                      <span className="text-slate-900">{selectedLead.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 w-24">Created:</span>
                      <span className="text-slate-900">{selectedLead.createdAt}</span>
                    </div>
                    {selectedLead.assignedTo && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500 w-24">Assigned to:</span>
                        <span className="text-slate-900">{selectedLead.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                      Contact Lead
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-md hover:bg-slate-50">
                      Assign
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-md hover:bg-slate-50">
                      Edit
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Notes
                  </h3>
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    placeholder="Add notes about this lead..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center px-6 py-8">
              <div className="text-center max-w-sm">
                <div className="mb-3 text-3xl">👤</div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">
                  No Lead Selected
                </h2>
                <p className="text-xs text-slate-500">
                  Select a lead from the list to view details and take actions.
                </p>
              </div>
            </div>
          )
        }
        popPane={
          <div className="p-4">
            <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase mb-3">
              Lead Activity
            </div>
            {selectedLead ? (
              <div className="space-y-3">
                <div className="text-xs">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">Lead created</p>
                      <p className="text-slate-500">{selectedLead.createdAt}</p>
                    </div>
                  </div>
                  {selectedLead.status !== "new" && (
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-slate-900 font-medium">Status updated</p>
                        <p className="text-slate-500">to {selectedLead.status}</p>
                      </div>
                    </div>
                  )}
                  {selectedLead.assignedTo && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-slate-900 font-medium">Assigned</p>
                        <p className="text-slate-500">to {selectedLead.assignedTo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Select a lead to view activity timeline and related information.
              </p>
            )}
          </div>
        }
        footer={<span>Lead Management Workspace • {filteredLeads.length} leads shown</span>}
      />
    </div>
  );
};

export default LeadManagementPage;
