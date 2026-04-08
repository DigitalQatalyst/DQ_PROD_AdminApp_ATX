/**
 * ContactList Component
 *
 * Left sidebar list pane with search, filters, skeleton loading, and new contact button.
 */

import React from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { Input } from '../../../components/ui/InputComponent';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/ButtonComponent';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ContactCard } from './ContactCard';
import type { Contact, ContactFilters } from '../types';

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  filters: ContactFilters;
  selectedContactId: string | null;
  onFiltersChange: (filters: ContactFilters) => void;
  onSelectContact: (contact: Contact) => void;
  onNewContact: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  loading,
  filters,
  selectedContactId,
  onFiltersChange,
  onSelectContact,
  onNewContact,
}) => {
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Contacts</h2>
          <Button size="sm" onClick={onNewContact}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Status Filter */}
        <Select
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(val) =>
            onFiltersChange({
              ...filters,
              status: val as ContactFilters['status'],
            })
          }
          placeholder="Filter by status"
          className="text-sm"
        />
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <SkeletonLoader variant="card" count={5} />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            title="No contacts found"
            message={
              filters.search || filters.status !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first contact to get started'
            }
            icon={<Users className="w-12 h-12 text-gray-300" />}
            actionLabel="New Contact"
            onAction={onNewContact}
          />
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isSelected={selectedContactId === contact.id}
              onClick={() => onSelectContact(contact)}
            />
          ))
        )}
      </div>

      {/* Footer count */}
      {!loading && contacts.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-xs text-gray-500 text-center">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
