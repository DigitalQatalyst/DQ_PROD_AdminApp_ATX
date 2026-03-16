import React from "react";
import { LVEWorkspaceConfig } from "../types";
import { Account } from "../mock/mockData";
import { Building, Globe, Phone, MapPin, DollarSign, Calendar, Plus, Edit, Trash2, Users } from "lucide-react";

export const accountsConfig: LVEWorkspaceConfig = {
  moduleId: "accounts",
  title: "Account Management",
  
  tabs: [
    { id: "accounts-home", label: "All Accounts", isActive: true },
    { id: "accounts-customers", label: "Customers" },
    { id: "accounts-prospects", label: "Prospects", isDirty: true },
  ],
  
  listPane: {
    columns: [
      {
        id: "name",
        label: "Account Name",
        field: "name",
        sortable: true,
        render: (value, record) => (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{value}</span>
          </div>
        ),
      },
      {
        id: "type",
        label: "Type",
        field: "type",
        sortable: true,
        render: (value) => {
          const colors = {
            prospect: "bg-blue-100 text-blue-800",
            customer: "bg-green-100 text-green-800",
            partner: "bg-purple-100 text-purple-800",
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
              {value}
            </span>
          );
        },
      },
      {
        id: "industry",
        label: "Industry",
        field: "industry",
        sortable: true,
      },
      {
        id: "revenue",
        label: "Revenue",
        field: "revenue",
        sortable: true,
        render: (value) => `$${value.toLocaleString()}`,
      },
    ],
    filters: [
      {
        id: "type",
        label: "Account Type",
        field: "type",
        type: "select",
        options: [
          { value: "prospect", label: "Prospect" },
          { value: "customer", label: "Customer" },
          { value: "partner", label: "Partner" },
        ],
      },
      {
        id: "size",
        label: "Company Size",
        field: "size",
        type: "select",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "enterprise", label: "Enterprise" },
        ],
      },
      {
        id: "status",
        label: "Status",
        field: "status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "churned", label: "Churned" },
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
            label: "Account Name",
            field: "name",
            type: "text",
            required: true,
            render: (value) => <span className="font-medium text-lg">{value}</span>,
          },
          {
            id: "type",
            label: "Account Type",
            field: "type",
            type: "select",
            options: [
              { value: "prospect", label: "Prospect" },
              { value: "customer", label: "Customer" },
              { value: "partner", label: "Partner" },
            ],
          },
          {
            id: "industry",
            label: "Industry",
            field: "industry",
            type: "text",
          },
          {
            id: "size",
            label: "Company Size",
            field: "size",
            type: "select",
            options: [
              { value: "small", label: "Small (1-50)" },
              { value: "medium", label: "Medium (51-200)" },
              { value: "large", label: "Large (201-1000)" },
              { value: "enterprise", label: "Enterprise (1000+)" },
            ],
          },
        ],
      },
      {
        id: "contact-info",
        title: "Contact Information",
        collapsible: true,
        fields: [
          {
            id: "website",
            label: "Website",
            field: "website",
            type: "text",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
            id: "address",
            label: "Address",
            field: "address",
            type: "textarea",
            render: (value) => (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{value}</span>
              </div>
            ),
          },
        ],
      },
      {
        id: "business-info",
        title: "Business Information",
        collapsible: true,
        fields: [
          {
            id: "revenue",
            label: "Annual Revenue",
            field: "revenue",
            type: "text",
            render: (value) => (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">${value.toLocaleString()}</span>
              </div>
            ),
          },
          {
            id: "status",
            label: "Status",
            field: "status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "churned", label: "Churned" },
            ],
          },
          {
            id: "owner",
            label: "Account Owner",
            field: "owner",
            type: "text",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{value}</span>
              </div>
            ),
          },
        ],
      },
      {
        id: "activity-info",
        title: "Activity Information",
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
        label: "Edit Account",
        icon: Edit,
        variant: "primary",
        onClick: (record) => console.log("Edit account:", record),
      },
      {
        id: "contacts",
        label: "View Contacts",
        icon: Users,
        variant: "secondary",
        onClick: (record) => console.log("View contacts for:", record),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "danger",
        onClick: (record) => console.log("Delete account:", record),
      },
    ],
    config: {
      minWidth: 400,
    },
  },
  
  popPane: {
    sections: [
      {
        id: "account-summary",
        title: "Account Summary",
        fields: [
          {
            id: "type",
            label: "Type",
            field: "type",
            type: "text",
            render: (value) => (
              <span className="capitalize font-medium">{value}</span>
            ),
          },
          {
            id: "revenue",
            label: "Revenue",
            field: "revenue",
            type: "text",
            render: (value) => `$${value.toLocaleString()}`,
          },
          {
            id: "lastActivity",
            label: "Last Activity",
            field: "lastActivity",
            type: "date",
            render: (value) => new Date(value).toLocaleDateString(),
          },
        ],
      },
      {
        id: "key-metrics",
        title: "Key Metrics",
        collapsible: true,
        fields: [
          {
            id: "size",
            label: "Company Size",
            field: "size",
            type: "text",
            render: (value) => (
              <span className="capitalize">{value}</span>
            ),
          },
          {
            id: "industry",
            label: "Industry",
            field: "industry",
            type: "text",
          },
        ],
      },
      {
        id: "recent-notes",
        title: "Recent Notes",
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
      id: "new-account",
      label: "New Account",
      icon: Plus,
      variant: "primary",
      onClick: () => console.log("Create new account"),
    },
  ],
};