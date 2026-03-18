/**
 * QuickCreateDialog Component
 *
 * Minimal popup for quickly creating a contact with just First Name, Last Name, and Email or Phone.
 * Follows the existing ConfirmDialog modal pattern.
 */

import React, { useState } from 'react';
import { XIcon, UserPlus } from 'lucide-react';
import { Input } from '../../../components/ui/InputComponent';
import Button from '../../../components/ui/ButtonComponent';
import { createContact } from '../actions';
import type { ContactFormData } from '../types';
import { EMPTY_CONTACT_FORM } from '../types';

interface QuickCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const QuickCreateDialog: React.FC<QuickCreateDialogProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSave =
    firstName.trim() && lastName.trim() && (email.trim() || phone.trim());

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    const data: ContactFormData = {
      ...EMPTY_CONTACT_FORM,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    const result = await createContact(data);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    // Reset and close
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSaving(false);
    onCreated();
    onClose();
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
          <div className="bg-white px-6 pt-6 pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Quick Create Contact
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <p className="text-xs text-gray-400">
                * Email or Phone is required
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
            <Button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full sm:w-auto sm:ml-3"
            >
              {saving ? 'Creating...' : 'Create Contact'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
