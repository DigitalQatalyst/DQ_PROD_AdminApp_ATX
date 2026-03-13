/**
 * Contacts Module — Main LVE Workspace
 *
 * Split layout: left ContactList + right ContactDetail / ContactForm.
 * State machine: idle → viewing → creating → editing
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useContacts } from './hooks/useContacts';
import { createContact, updateContact, deleteContact } from './actions';
import { ContactList } from './components/ContactList';
import { ContactDetail } from './components/ContactDetail';
import { ContactForm } from './components/ContactForm';
import { QuickCreateDialog } from './components/QuickCreateDialog';
import { Toast } from '../../components/ui/Toast';
import type { Contact, ContactFilters, ContactFormData } from './types';

type ViewMode = 'idle' | 'viewing' | 'creating' | 'editing';

interface ContactsModuleProps {
  /** Pre-fill values when creating a contact from another module */
  prefill?: Partial<ContactFormData>;
}

const ContactsModule: React.FC<ContactsModuleProps> = ({ prefill }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('idle');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    status: 'all',
    owner_id: '',
  });

  const { contacts, loading, refetch } = useContacts(filters);

  // Debounced search
  const handleFiltersChange = useCallback((newFilters: ContactFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setViewMode('viewing');
  }, []);

  const handleNewContact = useCallback(() => {
    setSelectedContact(null);
    setViewMode('creating');
  }, []);

  const handleEdit = useCallback(() => {
    setViewMode('editing');
  }, []);

  const handleCancel = useCallback(() => {
    if (selectedContact) {
      setViewMode('viewing');
    } else {
      setViewMode('idle');
    }
  }, [selectedContact]);

  const handleSave = useCallback(
    async (data: ContactFormData) => {
      setSaving(true);
      try {
        if (viewMode === 'editing' && selectedContact) {
          const result = await updateContact(selectedContact.id, data);
          if (result.error) {
            setToast({ type: 'error', message: result.error });
          } else {
            setToast({ type: 'success', message: 'Contact updated successfully' });
            setSelectedContact(result.data);
            setViewMode('viewing');
          }
        } else {
          const result = await createContact(data);
          if (result.error) {
            setToast({ type: 'error', message: result.error });
          } else {
            setToast({ type: 'success', message: 'Contact created successfully' });
            setSelectedContact(result.data);
            setViewMode('viewing');
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
        setToast({ type: 'error', message: result.error });
      } else {
        setToast({ type: 'success', message: 'Contact deleted successfully' });
        setSelectedContact(null);
        setViewMode('idle');
      }
    },
    []
  );

  const handleQuickCreated = useCallback(() => {
    setToast({ type: 'success', message: 'Contact created via quick create' });
    refetch();
  }, [refetch]);

  // Merge external prefill with any in-component navigation
  const activePrefill = useMemo(() => {
    if (viewMode === 'creating' && prefill) return prefill;
    return undefined;
  }, [viewMode, prefill]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Left List Pane */}
      <ContactList
        contacts={contacts}
        loading={loading}
        filters={filters}
        selectedContactId={selectedContact?.id || null}
        onFiltersChange={handleFiltersChange}
        onSelectContact={handleSelectContact}
        onNewContact={handleNewContact}
      />

      {/* Right Work Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'creating' || viewMode === 'editing' ? (
          <ContactForm
            contact={viewMode === 'editing' ? selectedContact : undefined}
            prefill={activePrefill}
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

      {/* Quick Create Dialog */}
      <QuickCreateDialog
        isOpen={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        onCreated={handleQuickCreated}
      />

      {/* Toast Notification */}
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

export default ContactsModule;
export { QuickCreateDialog };
