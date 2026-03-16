import React from "react";
import { LVEWorkspaceConfig } from "../types";
import { Lead } from "../mock/mockData";
import { User, Phone, Mail, Building, DollarSign, Calendar, Plus, Edit, Trash2 } from "lucide-react";

export const leadsConfig: LVEWorkspaceConfig = {
  moduleId: "leads",
  title: "Lead Management",
  
  tabs: [
    { id: "leads-home", label: "All Leads", isActive: true },
    { id: "leads-qualified", label: "Qualified Leads", isDirty: true },
  ],
  
  listPane: {
    columns: [
      {
        id: "name",
        label: "Name",
        field: "name",
        sortable: true,
        render: (value, record) => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{value}</span>
          </div>
        ),
      },
      {
        id: "company",
        label: "Company",
        field: "company",
        sortable: true,
      },
      {
        id: "status",
        label: "Status",
        field: "status",
        render: (value) => {
          const colors = {
            new: "bg-blue-100 text-blue-800",
            contacted: "bg-yellow-100 text-yellow-800",
            qualified: "bg-green-100 text-green-800",
            opportunity: "bg-purple-100 text-purple-800",
            closed: "bg-gray-100 text-gray-800",
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
              {value}
            </span>
          );
        },
      },
      {
        id: "value",
        label: "Value",
        field: "value",
        sortable: true,
        render: (value) => `$${value.toLocaleString()}`,
      },
    ],
    filters: [
      {
        id: "status",
        label: "Status",
        field: "status",
        type: "select",
        options: [
          { value: "new", label: "New" },
          { value: "contacted", label: "Contacted" },
          { value: "qualified", label: "Qualified" },
          { value: "opportunity", label: "Opportunity" },
          { value: "closed", label: "Closed" },
        ],
      },
      {
        id: "source",
        label: "Source",
        field: "source",
        type: "select",
        options: [
          { value: "website", label: "Website" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "referral", label: "Referral" },
          { value: "trade-show", label: "Trade Show" },
          { value: "cold-call", label: "Cold Call" },
        ],
      },
    ],
    searchable: true,
    sortable: true,
    selectable: true,
    config: {
      width: 350,
      minWidth: 300,
      maxWidth: 500,
    },
  },
  
  workPane: {
    sections: [
      {
        id: "basic-info",
        title: "Basic Information",
        fields: [
          {
            id: "name",
            label: "Full Name",
            field: "name",
            type: "text",
            required: true,
            render: (value) => <span className="font-medium">{value}</span>,
          },
          {
            id: "email",
            label: "Email",
            field: "email",
            type: "email",
            required: true,
            render: (value) => (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${value}`} className="text-primary hover:underline">
                  {value}
                </a>
              </div>
            ),
          },
          {
            id: "phone",
            label: "Phone",
            field: "phone",
            type: "phone",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${value}`} className="text-primary hover:underline">
                  {value}
                </a>
              </div>
            ),
          },
          {
            id: "company",
            label: "Company",
            field: "company",
            type: "text",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{value}</span>
              </div>
            ),
          },
        ],
      },
      {
        id: "lead-details",
        title: "Lead Details",
        collapsible: true,
        fields: [
          {
            id: "status",
            label: "Status",
            field: "status",
            type: "select",
            options: [
              { value: "new", label: "New" },
              { value: "contacted", label: "Contacted" },
              { value: "qualified", label: "Qualified" },
              { value: "opportunity", label: "Opportunity" },
              { value: "closed", label: "Closed" },
            ],
          },
          {
            id: "source",
            label: "Source",
            field: "source",
            type: "text",
          },
          {
            id: "value",
            label: "Estimated Value",
            field: "value",
            type: "text",
            render: (value) => (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">${value.toLocaleString()}</span>
              </div>
            ),
          },
          {
            id: "assignedTo",
            label: "Assigned To",
            field: "assignedTo",
            type: "text",
          },
        ],
      },
      {
        id: "activity",
        title: "Activity",
        collapsible: true,
        fields: [
          {
            id: "createdAt",
            label: "Created",
            field: "createdAt",
            type: "date",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(value).toLocaleDateString()}</span>
              </div>
            ),
          },
          {
            id: "lastActivity",
            label: "Last Activity",
            field: "lastActivity",
            type: "date",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(value).toLocaleDateString()}</span>
              </div>
            ),
          },
          {
            id: "notes",
            label: "Notes",
            field: "notes",
            type: "textarea",
          },
        ],
      },
    ],
    actions: [
      {
        id: "edit",
        label: "Edit Lead",
        icon: Edit,
        variant: "primary",
        onClick: (record) => console.log("Edit lead:", record),
      },
      {
        id: "convert",
        label: "Convert to Opportunity",
        variant: "secondary",
        onClick: (record) => console.log("Convert lead:", record),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "danger",
        onClick: (record) => console.log("Delete lead:", record),
      },
    ],
    config: {
      minWidth: 400,
    },
  },
  
  popPane: {
    sections: [
      {
        id: "quick-actions",
        title: "Quick Actions",
        fields: [
          {
            id: "lastActivity",
            label: "Last Activity",
            field: "lastActivity",
            type: "date",
            render: (value) => new Date(value).toLocaleDateString(),
          },
          {
            id: "status",
            label: "Current Status",
            field: "status",
            type: "text",
            render: (value) => (
              <span className="capitalize font-medium">{value}</span>
            ),
          },
        ],
      },
      {
        id: "timeline",
        title: "Recent Activity",
        collapsible: true,
        fields: [
          {
            id: "notes",
            label: "Latest Notes",
            field: "notes",
            type: "textarea",
          },
        ],
      },
    ],
    config: {
      width: 300,
      collapsible: true,
    },
  },
  
  globalActions: [
    {
      id: "new-lead",
      label: "New Lead",
      icon: Plus,
      variant: "primary",
      onClick: () => console.log("Create new lead"),
    },
  ],
};