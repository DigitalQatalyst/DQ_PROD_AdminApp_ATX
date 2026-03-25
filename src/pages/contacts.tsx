import React, { useState, useCallback } from "react";
import {
  LVEWorkspaceLayout,
  LVETab,
} from "../components/layout/LVEWorkspaceLayout";

// Module internal logic
import { useContacts } from "../modules/contacts/hooks/useContacts";
import { createContact, updateContact, deleteContact } from "../modules/contacts/actions";
import { ContactList } from "../modules/contacts/components/ContactList";
import { ContactDetail } from "../modules/contacts/components/ContactDetail";
import { ContactForm } from "../modules/contacts/components/ContactForm";
import { QuickCreateDialog } from "../modules/contacts/components/QuickCreateDialog";
import { Toast } from "../components/ui/Toast";
import type { Contact, ContactFilters, ContactFormData } from "../modules/contacts/types";

type ViewMode = "idle" | "viewing" | "creating" | "editing";

const defaultTabs: LVETab[] = [
  {
    id: "contacts-home",
    label: "Contacts Workspace",
    isActive: true,
  },
];

const ContactsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [filters, setFilters] = useState<ContactFilters>({
    search: "",
    status: "all",
    owner_id: "",
  });

  const { contacts, loading, refetch } = useContacts(filters);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: ContactFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setViewMode("viewing");
  }, []);

  const handleNewContact = useCallback(() => {
    setSelectedContact(null);
    setViewMode("creating");
  }, []);

  const handleEdit = useCallback(() => {
    setViewMode("editing");
  }, []);

  const handleCancel = useCallback(() => {
    if (selectedContact) {
      setViewMode("viewing");
    } else {
      setViewMode("idle");
    }
  }, [selectedContact]);

  const handleSave = useCallback(
    async (data: ContactFormData) => {
      setSaving(true);
      try {
        if (viewMode === "editing" && selectedContact) {
          const result = await updateContact(selectedContact.id, data);
          if (result.error) {
            setToast({ type: "error", message: result.error });
          } else {
            setToast({ type: "success", message: "Contact updated successfully" });
            setSelectedContact(result.data);
            setViewMode("viewing");
          }
        } else {
          const result = await createContact(data);
          if (result.error) {
            setToast({ type: "error", message: result.error });
          } else {
            setToast({ type: "success", message: "Contact created successfully" });
            setSelectedContact(result.data);
            setViewMode("viewing");
          }
        }
      } finally {
        setSaving(false);
      }
    },
    [viewMode, selectedContact]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteContact(id);
      if (result.error) {
        setToast({ type: "error", message: result.error });
      } else {
        setToast({ type: "success", message: "Contact deleted successfully" });
        setSelectedContact(null);
        setViewMode("idle");
      }
    },
    []
  );

  const handleQuickCreated = useCallback(() => {
    setToast({ type: "success", message: "Contact created via quick create" });
    refetch();
    setShowQuickCreate(false);
  }, [refetch]);

  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Contact Management"
        tenantLabel="Demo Tenant"
        streamLabel="Contacts Stream"
        tabs={defaultTabs}
        menuPane={
          <div className="p-4 space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase">
              Contact Actions
            </div>
            <ul className="space-y-1">
              <li
                className={`rounded-md px-2 py-1 cursor-pointer transition-colors ${
                  viewMode === 'idle' && !filters.search && filters.status === 'all'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
                onClick={() => {
                  setFilters({ search: "", status: "all", owner_id: "" });
                  setViewMode("idle");
                  setSelectedContact(null);
                }}
              >
                All Contacts
              </li>
              <li
                className={`rounded-md px-2 py-1 cursor-pointer transition-colors ${
                  viewMode === 'creating'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
                onClick={handleNewContact}
              >
                New Contact
              </li>
              <li
                className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer"
                onClick={() => setShowQuickCreate(true)}
              >
                Quick Create
              </li>
              <li className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/30 cursor-not-allowed opacity-50">
                Import Contacts
              </li>
            </ul>
          </div>
        }
        listPane={
          <ContactList
            contacts={contacts}
            loading={loading}
            filters={filters}
            selectedContactId={selectedContact?.id || null}
            onFiltersChange={handleFiltersChange}
            onSelectContact={handleSelectContact}
            onNewContact={handleNewContact}
          />
        }
        workPane={
          <div className="h-full overflow-y-auto">
            {viewMode === "creating" || viewMode === "editing" ? (
              <ContactForm
                contact={viewMode === "editing" ? selectedContact : undefined}
                onSave={handleSave}
                onCancel={handleCancel}
                saving={saving}
              />
            ) : (
              <ContactDetail
                contact={selectedContact}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        }
        popPane={
          <div className="p-4 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mb-2">
              Related Context
            </div>
            {selectedContact ? (
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Real-time activity and associated accounts for{" "}
                  <span className="text-foreground font-medium">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </span>{" "}
                  will appear here in the next update.
                </p>
                <div className="space-y-2 border-l border-border pl-3 ml-1">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Recent Activities
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Associated Accounts
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Contact Timeline
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Select a contact to view contextual details.
              </p>
            )}
          </div>
        }
        footer={
          <span>Contact Management — Enterprise Edition</span>
        }
      />

      {/* Overlays */}
      <QuickCreateDialog
        isOpen={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        onCreated={handleQuickCreated}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ContactsPage;
