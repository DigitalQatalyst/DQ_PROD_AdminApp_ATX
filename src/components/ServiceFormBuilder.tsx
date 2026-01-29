import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  GripVerticalIcon,
  SaveIcon,
  XIcon,
  ArrowLeftIcon,
  EyeIcon,
  SettingsIcon
} from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { ServiceForm, ServiceFormField, Service } from '../types';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';

type FieldType = ServiceFormField['fieldType'];

const FIELD_TYPES: Array<{ value: FieldType; label: string; icon: string }> = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'textarea', label: 'Textarea', icon: '📄' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'tel', label: 'Phone', icon: '📞' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'datetime', label: 'Date & Time', icon: '🕐' },
  { value: 'time', label: 'Time', icon: '⏰' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'multiselect', label: 'Multi-Select', icon: '☑️' },
  { value: 'radio', label: 'Radio', icon: '🔘' },
  { value: 'checkbox', label: 'Checkbox', icon: '☐' },
  { value: 'file', label: 'File Upload', icon: '📎' },
  { value: 'boolean', label: 'Yes/No', icon: '✓' },
  { value: 'rich_text', label: 'Rich Text', icon: '📝' },
];

export const ServiceFormBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const { user } = useAuth();
  const isEditMode = !!formId && formId !== 'new';

  const { 
    data: forms, 
    loading: formsLoading,
    getById,
    create,
    update,
    refresh
  } = useCRUD<ServiceForm>('mktplc_service_forms');

  const { data: services, loading: servicesLoading, list: listServices } = useCRUD<Service>('mktplc_services');
  const { data: fields, list: listFields, create: createField, update: updateField, remove: removeField } = useCRUD<ServiceFormField>('mktplc_service_form_fields');
  const { isLoading: authLoading } = useAuth();

  // Load services on mount (after auth is ready)
  useEffect(() => {
    if (!authLoading) {
      listServices();
    }
  }, [authLoading]);

  const [formData, setFormData] = useState<Partial<ServiceForm>>({
    name: '',
    description: '',
    serviceId: '',
    isActive: true,
  });

  const [formFields, setFormFields] = useState<ServiceFormField[]>([]);
  const [selectedField, setSelectedField] = useState<ServiceFormField | null>(null);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; } | null>(null);

  // Load form data if editing
  useEffect(() => {
    const loadForm = async () => {
      if (!isEditMode) return;

      try {
        const form = await getById(formId);
        if (form) {
          // Map snake_case from DB to camelCase for UI
          setFormData({
            name: form.name,
            description: form.description,
            serviceId: form.serviceId || form.service_id,
            isActive: form.isActive ?? form.is_active ?? true,
          });

          // Load fields for this form
          await listFields({ form_id: { operator: 'eq', val: formId } });
        }
      } catch (err) {
        console.error('Error loading form:', err);
        setToast({ type: 'error', message: 'Failed to load form' });
      }
    };

    loadForm();
  }, [formId, isEditMode, getById, listFields]);

  // Update formFields when fields data changes
  useEffect(() => {
    if (fields && formId) {
      const formFieldsData = fields.filter(f => (f.formId || f.form_id) === formId);
      // Sort by field_order (snake_case from DB) or fieldOrder (camelCase)
      setFormFields(formFieldsData.sort((a, b) => (a.fieldOrder ?? a.field_order ?? 0) - (b.fieldOrder ?? b.field_order ?? 0)));
    }
  }, [fields, formId]);

  // Handle add field
  const handleAddField = async () => {
    if (!formData.serviceId) {
      setToast({ type: 'error', message: 'Please select a service first' });
      return;
    }

    if (!isEditMode) {
      setToast({ type: 'error', message: 'Please save the form first before adding fields' });
      return;
    }

    // Use snake_case for database
    const newField = {
      form_id: formId!,
      field_name: `field_${Date.now()}`,
      field_label: 'New Field',
      field_type: newFieldType,
      field_order: formFields.length,
      is_required: false,
      options: ['select', 'multiselect', 'radio'].includes(newFieldType) ? [] : undefined,
    };

    try {
      await createField(newField as any);
      await listFields({ form_id: { operator: 'eq', val: formId } });
      setShowAddFieldModal(false);
      setToast({ type: 'success', message: 'Field added successfully' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to add field' });
    }
  };

  // Handle update field
  const handleUpdateField = async (field: ServiceFormField) => {
    try {
      // Convert to snake_case for database
      const dbField = {
        field_name: field.fieldName,
        field_label: field.fieldLabel,
        field_type: field.fieldType,
        field_order: field.fieldOrder,
        is_required: field.isRequired,
        placeholder: field.placeholder,
        help_text: field.helpText,
        default_value: field.defaultValue,
        options: field.options,
      };
      await updateField(field.id, dbField as any);
      await listFields({ form_id: { operator: 'eq', val: formId } });
      setSelectedField(null);
      setToast({ type: 'success', message: 'Field updated successfully' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to update field' });
    }
  };

  // Handle delete field
  const handleDeleteField = async (fieldId: string) => {
    if (!window.confirm('Are you sure you want to delete this field?')) {
      return;
    }

    try {
      await removeField(fieldId);
      await listFields({ form_id: { operator: 'eq', val: formId } });
      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }
      setToast({ type: 'success', message: 'Field deleted successfully' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to delete field' });
    }
  };

  // Handle reorder fields
  const handleReorderFields = (fromIndex: number, toIndex: number) => {
    const newFields = [...formFields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    
    // Update field orders
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      fieldOrder: index,
    }));

    setFormFields(updatedFields);
    
    // Update all fields in database (use snake_case)
    Promise.all(
      updatedFields.map(field => updateField(field.id, { field_order: field.fieldOrder } as any))
    ).catch(err => {
      console.error('Error reordering fields:', err);
      setToast({ type: 'error', message: 'Failed to reorder fields' });
    });
  };

  // Handle save form
  const handleSaveForm = async () => {
    if (!formData.name || !formData.serviceId) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    // Convert to snake_case for database
    const dbData = {
      name: formData.name,
      description: formData.description,
      service_id: formData.serviceId,
      is_active: formData.isActive,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await update(formId, dbData as any);
        setToast({ type: 'success', message: 'Form updated successfully' });
      } else {
        const newForm = await create(dbData as any);
        setToast({ type: 'success', message: 'Form created successfully' });
        if (newForm) {
          navigate(`/service-form-builder/${newForm.id}`);
        }
      }
      await refresh();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save form' });
    } finally {
      setSubmitting(false);
    }
  };

  if (formsLoading || servicesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/service-forms')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Form' : 'Create Form'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Build dynamic forms for services
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveForm}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <SaveIcon size={20} />
            {submitting ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Form Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Form Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isEditMode}
                >
                  <option value="">Select a service</option>
                  {services?.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title || service.name || 'Untitled Service'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter form description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Add Field Button */}
          {isEditMode && (
            <Can I="create" a="ServiceFormField">
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon size={20} />
                Add Field
              </button>
            </Can>
          )}
        </div>

        {/* Center Panel - Fields List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Form Fields</h2>
            
            {formFields.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {isEditMode 
                    ? 'No fields yet. Click "Add Field" to get started.'
                    : 'Save the form first, then add fields.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {formFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedField?.id === field.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedField(field)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVerticalIcon className="text-gray-400" size={20} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.fieldLabel}</span>
                            {field.isRequired && (
                              <span className="text-xs text-red-600">*</span>
                            )}
                            <span className="text-xs text-gray-500">
                              ({FIELD_TYPES.find(t => t.value === field.fieldType)?.label})
                            </span>
                          </div>
                          {field.helpText && (
                            <div className="text-sm text-gray-500 mt-1">
                              {field.helpText}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Can I="update" a="ServiceFormField">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedField(field);
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <SettingsIcon size={16} />
                          </button>
                        </Can>
                        <Can I="delete" a="ServiceFormField">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(field.id);
                            }}
                            className="p-1 text-gray-600 hover:text-red-600"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </Can>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Field Editor Panel */}
          {selectedField && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Field Settings</h3>
                <button
                  onClick={() => setSelectedField(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <FieldEditor
                field={selectedField}
                onChange={(updatedField) => {
                  setSelectedField(updatedField);
                  setFormFields(formFields.map(f => 
                    f.id === updatedField.id ? updatedField : f
                  ));
                }}
                onSave={handleUpdateField}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Field</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FIELD_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setNewFieldType(type.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      newFieldType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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

// Field Editor Component
interface FieldEditorProps {
  field: ServiceFormField;
  onChange: (field: ServiceFormField) => void;
  onSave: (field: ServiceFormField) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onChange, onSave }) => {
  const [localField, setLocalField] = useState<ServiceFormField>(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const handleChange = (updates: Partial<ServiceFormField>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onChange(updated);
  };

  const handleSave = () => {
    onSave(localField);
  };

  const needsOptions = ['select', 'multiselect', 'radio'].includes(localField.fieldType);
  const options = (localField.options || []) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Field Label *
        </label>
        <input
          type="text"
          value={localField.fieldLabel}
          onChange={(e) => handleChange({ fieldLabel: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Field Name (Technical)
        </label>
        <input
          type="text"
          value={localField.fieldName}
          onChange={(e) => handleChange({ fieldName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., first_name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={localField.placeholder || ''}
          onChange={(e) => handleChange({ placeholder: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Help Text
        </label>
        <textarea
          value={localField.helpText || ''}
          onChange={(e) => handleChange({ helpText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Value
        </label>
        <input
          type="text"
          value={localField.defaultValue || ''}
          onChange={(e) => handleChange({ defaultValue: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {needsOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                    handleChange({ options: newOptions });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Option label"
                />
                <button
                  onClick={() => {
                    const newOptions = options.filter((_, i) => i !== index);
                    handleChange({ options: newOptions });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                handleChange({ options: [...options, { label: '', value: '' }] });
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={localField.isRequired}
            onChange={(e) => handleChange({ isRequired: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Required</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

