/**
 * ContactForm Component
 *
 * Shared form for create and edit modes.
 * Uses existing Input, Select, and Button components.
 */

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/InputComponent';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/ButtonComponent';
import { useContactForm } from '../hooks/useContactForm';
import type { Contact, ContactFormData } from '../types';

interface ContactFormProps {
  contact?: Contact | null;
  prefill?: Partial<ContactFormData>;
  onSave: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  prefill,
  onSave,
  onCancel,
  saving = false,
}) => {
  const {
    formData,
    errors,
    isDirty,
    duplicateWarning,
    setField,
    validate,
    reset,
    checkEmailDuplicate,
  } = useContactForm(contact);

  // Apply prefill values on mount
  useEffect(() => {
    if (prefill && !contact) {
      Object.entries(prefill).forEach(([key, value]) => {
        if (value) setField(key as keyof ContactFormData, value);
      });
    }
  }, [prefill, contact, setField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {contact ? 'Edit Contact' : 'New Contact'}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              reset(contact);
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={saving || (!isDirty && !!contact)}>
            {saving ? 'Saving...' : contact ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {duplicateWarning}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
            placeholder="First name"
            className={errors.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && (
            <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
            placeholder="Last name"
            className={errors.last_name ? 'border-red-500' : ''}
          />
          {errors.last_name && (
            <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={checkEmailDuplicate}
            placeholder="email@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="Phone number"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile
          </label>
          <Input
            value={formData.mobile}
            onChange={(e) => setField('mobile', e.target.value)}
            placeholder="Mobile number"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Job title"
          />
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
          <Input
            value={formData.organization_id}
            onChange={(e) => setField('organization_id', e.target.value)}
            placeholder="Organization ID"
          />
        </div>

        {/* Owner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <Input
            value={formData.owner_id}
            onChange={(e) => setField('owner_id', e.target.value)}
            placeholder="Owner ID"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={(val) => setField('status', val as string)}
          />
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <Input
            value={formData.source}
            onChange={(e) => setField('source', e.target.value)}
            placeholder="e.g. Website, Referral"
          />
        </div>
      </div>
    </form>
  );
};
