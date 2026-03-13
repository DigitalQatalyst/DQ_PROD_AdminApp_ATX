/**
 * ContactDetail Component
 *
 * Right work window showing contact details with Overview / Activity / Notes tabs.
 * Shows EmptyState when no contact is selected.
 */

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Smartphone,
  Briefcase,
  Building2,
  User,
  Calendar,
  Edit3,
  Trash2,
  Clock,
  MessageCircle,
  FileText,
} from 'lucide-react';
import Button from '../../../components/ui/ButtonComponent';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { Contact } from '../types';

type TabId = 'overview' | 'activity' | 'notes';

interface ContactDetailProps {
  contact: Contact | null;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
  { id: 'activity', label: 'Activity', icon: <Clock className="h-4 w-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
];

export const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <EmptyState
          title="No contact selected"
          message="Select a contact from the list or create a new one"
          icon={<User className="w-12 h-12 text-gray-300" />}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(contact.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  const renderOverview = () => (
    <div className="p-6 space-y-6">
      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailField
          label="Email"
          value={contact.email}
          icon={<Mail className="h-4 w-4" />}
        />
        <DetailField
          label="Phone"
          value={contact.phone}
          icon={<Phone className="h-4 w-4" />}
        />
        <DetailField
          label="Mobile"
          value={contact.mobile}
          icon={<Smartphone className="h-4 w-4" />}
        />
        <DetailField
          label="Title"
          value={contact.title}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <DetailField
          label="Organization"
          value={contact.organization_id || '—'}
          icon={<Building2 className="h-4 w-4" />}
        />
        <DetailField
          label="Owner"
          value={contact.owner_id || '—'}
          icon={<User className="h-4 w-4" />}
        />
        <DetailField
          label="Source"
          value={contact.source || '—'}
          icon={<FileText className="h-4 w-4" />}
        />
        <DetailField
          label="Created"
          value={new Date(contact.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="p-6 flex flex-col items-center justify-center text-center py-16">
      <Clock className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">Activity Log</h3>
      <p className="text-xs text-gray-500 max-w-sm">
        Activity tracking for this contact will be available in a future update.
      </p>
    </div>
  );

  const renderNotes = () => (
    <div className="p-6 flex flex-col items-center justify-center text-center py-16">
      <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">Notes</h3>
      <p className="text-xs text-gray-500 max-w-sm">
        Notes for this contact will be available in a future update.
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {contact.first_name} {contact.last_name}
              </h2>
              <Badge
                variant={contact.status === 'active' ? 'success' : 'secondary'}
              >
                {contact.status}
              </Badge>
            </div>
            {contact.title && (
              <p className="text-sm text-gray-500 mt-1">{contact.title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-gray-100 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'activity' && renderActivity()}
        {activeTab === 'notes' && renderNotes()}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.first_name} ${contact.last_name}? This will mark the contact as inactive.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

/**
 * Helper component for field-value pairs in the detail view.
 */
const DetailField: React.FC<{
  label: string;
  value: string | null;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-400">{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);
