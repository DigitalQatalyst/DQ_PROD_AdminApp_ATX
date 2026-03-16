import React from "react";
import { LVEWorkspaceConfig } from "../types";
import { Contact } from "../mock/mockData";
import { User, Phone, Mail, Building, Briefcase, Calendar, Plus, Edit, Trash2 } from "lucide-react";

export const contactsConfig: LVEWorkspaceConfig = {
  moduleId: "contacts",
  title: "Contact Management",
  
  tabs: [
    { id: "contacts-home", label: "All Contacts", isActive: true },
    { id: "contacts-active", label: "Active Contacts" },
  ],
  
  listPane: {
    columns: [
      {
        id: "name",
        label: "Name",
        field: "firstName",
        sortable: true,
        render: (value, record) => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{record.firstName} {record.lastName}</span>
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
        id: "title",
        label: "Title",
        field: "title",
        sortable: true,
      },
      {
        id: "status",
        label: "Status",
        field: "status",
        render: (value) => {
          const colors = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
            prospect: "bg-blue-100 text-blue-800",
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
              {value}
            </span>
          );
        },
      },
    ],
    filters: [
      {
        id: "status",
        label: "Status",
        field: "status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "prospect", label: "Prospect" },
        ],
      },
      {
        id: "department",
        label: "Department",
        field: "department",
        type: "select",
        options: [
          { value: "engineering", label: "Engineering" },
          { value: "product", label: "Product" },
          { value: "technology", label: "Technology" },
          { value: "sales", label: "Sales" },
          { value: "marketing", label: "Marketing" },
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
        id: "personal-info",
        title: "Personal Information",
        fields: [
          {
            id: "firstName",
            label: "First Name",
            field: "firstName",
            type: "text",
            required: true,
          },
          {
            id: "lastName",
            label: "Last Name",
            field: "lastName",
            type: "text",
            required: true,
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
        ],
      },
      {
        id: "professional-info",
        title: "Professional Information",
        collapsible: true,
        fields: [
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
          {
            id: "title",
            label: "Job Title",
            field: "title",
            type: "text",
            render: (value) => (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{value}</span>
              </div>
            ),
          },
          {
            id: "department",
            label: "Department",
            field: "department",
            type: "text",
          },
          {
            id: "status",
            label: "Status",
            field: "status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "prospect", label: "Prospect" },
            ],
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
            id: "lastContact",
            label: "Last Contact",
            field: "lastContact",
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
        label: "Edit Contact",
        icon: Edit,
        variant: "primary",
        onClick: (record) => console.log("Edit contact:", record),
      },
      {
        id: "email",
        label: "Send Email",
        icon: Mail,
        variant: "secondary",
        onClick: (record) => console.log("Email contact:", record),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "danger",
        onClick: (record) => console.log("Delete contact:", record),
      },
    ],
    config: {
      minWidth: 400,
    },
  },
  
  popPane: {
    sections: [
      {
        id: "contact-summary",
        title: "Contact Summary",
        fields: [
          {
            id: "status",
            label: "Status",
            field: "status",
            type: "text",
            render: (value) => (
              <span className="capitalize font-medium">{value}</span>
            ),
          },
          {
            id: "lastContact",
            label: "Last Contact",
            field: "lastContact",
            type: "date",
            render: (value) => new Date(value).toLocaleDateString(),
          },
        ],
      },
      {
        id: "recent-interactions",
        title: "Recent Interactions",
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
      id: "new-contact",
      label: "New Contact",
      icon: Plus,
      variant: "primary",
      onClick: () => console.log("Create new contact"),
    },
  ],
};