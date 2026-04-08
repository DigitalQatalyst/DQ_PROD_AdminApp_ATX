/**
 * useContactForm Hook
 *
 * Manages form state, validation, and dirty tracking for create + edit modes.
 */

import { useState, useCallback, useEffect } from 'react';
import type { ContactFormData, Contact } from '../types';
import { EMPTY_CONTACT_FORM } from '../types';
import { checkDuplicateEmail } from '../actions';

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  errors: FormErrors;
  isDirty: boolean;
  duplicateWarning: string | null;
  setField: (field: keyof ContactFormData, value: string) => void;
  validate: () => boolean;
  reset: (contact?: Contact | null) => void;
  checkEmailDuplicate: () => Promise<void>;
}

export function useContactForm(
  existingContact?: Contact | null
): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_CONTACT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Initialize form when existingContact changes
  useEffect(() => {
    if (existingContact) {
      setFormData({
        first_name: existingContact.first_name,
        last_name: existingContact.last_name,
        email: existingContact.email,
        phone: existingContact.phone || '',
        mobile: existingContact.mobile || '',
        title: existingContact.title || '',
        organization_id: existingContact.organization_id || '',
        vendor_id: existingContact.vendor_id || '',
        owner_id: existingContact.owner_id || '',
        status: existingContact.status,
        source: existingContact.source || '',
      });
      setIsDirty(false);
      setErrors({});
      setDuplicateWarning(null);
    }
  }, [existingContact]);

  const setField = useCallback(
    (field: keyof ContactFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
      // Clear error for the field being edited
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback((contact?: Contact | null) => {
    if (contact) {
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        title: contact.title || '',
        organization_id: contact.organization_id || '',
        vendor_id: contact.vendor_id || '',
        owner_id: contact.owner_id || '',
        status: contact.status,
        source: contact.source || '',
      });
    } else {
      setFormData(EMPTY_CONTACT_FORM);
    }
    setIsDirty(false);
    setErrors({});
    setDuplicateWarning(null);
  }, []);

  const checkEmailDuplicate = useCallback(async () => {
    if (!formData.email.trim()) {
      setDuplicateWarning(null);
      return;
    }

    const { isDuplicate } = await checkDuplicateEmail(
      formData.email,
      existingContact?.id
    );

    if (isDuplicate) {
      setDuplicateWarning(
        'A contact with this email already exists. You can still save.'
      );
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.email, existingContact?.id]);

  return {
    formData,
    errors,
    isDirty,
    duplicateWarning,
    setField,
    validate,
    reset,
    checkEmailDuplicate,
  };
}
