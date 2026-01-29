import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusIcon, TrashIcon, GripVerticalIcon, SaveIcon, XIcon, ArrowLeftIcon,
  ChevronDownIcon, ChevronUpIcon, CopyIcon, SettingsIcon, TypeIcon,
  ListIcon, CheckSquareIcon, CircleIcon, CalendarIcon, UploadIcon, ToggleLeftIcon
} from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Toast } from './ui/Toast';
import { AppLayout } from './AppLayout';

// Types
interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  question: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[]; // For multiple choice, checkboxes, dropdown
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

type QuestionType = 
  | 'short_text' 
  | 'long_text' 
  | 'multiple_choice' 
  | 'checkboxes' 
  | 'dropdown' 
  | 'date' 
  | 'time' 
  | 'file_upload' 
  | 'number'
  | 'email'
  | 'phone'
  | 'yes_no';

interface ServiceForm {
  id: string;
  service_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  sections?: FormSection[];
  created_at?: string;
  updated_at?: string;
}

interface Service {
  id: string;
  title?: string;
  name?: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: 'short_text', label: 'Short Answer', icon: <TypeIcon size={16} /> },
  { value: 'long_text', label: 'Paragraph', icon: <ListIcon size={16} /> },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: <CircleIcon size={16} /> },
  { value: 'checkboxes', label: 'Checkboxes', icon: <CheckSquareIcon size={16} /> },
  { value: 'dropdown', label: 'Dropdown', icon: <ChevronDownIcon size={16} /> },
  { value: 'date', label: 'Date', icon: <CalendarIcon size={16} /> },
  { value: 'file_upload', label: 'File Upload', icon: <UploadIcon size={16} /> },
  { value: 'number', label: 'Number', icon: <TypeIcon size={16} /> },
  { value: 'email', label: 'Email', icon: <TypeIcon size={16} /> },
  { value: 'yes_no', label: 'Yes/No', icon: <ToggleLeftIcon size={16} /> },
];

export const ServiceFormBuilderNew: React.FC = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const isEditMode = !!formId && formId !== 'new';
  const { user, isLoading: authLoading } = useAuth();

  const { data: services, list: listServices } = useCRUD<Service>('mktplc_services');
  const { getById, create, update } = useCRUD<ServiceForm>('mktplc_service_forms');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sections, setSections] = useState<FormSection[]>([
    { id: 'section-1', title: 'Section 1', description: '', order: 0, questions: [] }
  ]);
  const [activeSection, setActiveSection] = useState<string>('section-1');
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    if (!authLoading) {
      listServices();
    }
  }, [authLoading]);

  // Load form if editing
  useEffect(() => {
    const loadForm = async () => {
      if (!isEditMode) return;
      setLoading(true);
      try {
        const form = await getById(formId);
        if (form) {
          setFormName(form.name);
          setFormDescription(form.description || '');
          setServiceId(form.service_id);
          setIsActive(form.is_active);
          if (form.sections && form.sections.length > 0) {
            setSections(form.sections);
            setActiveSection(form.sections[0].id);
          }
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load form' });
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [formId, isEditMode]);

  // Section handlers
  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      order: sections.length,
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      setToast({ type: 'error', message: 'Form must have at least one section' });
      return;
    }
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections(newSections);
    if (activeSection === sectionId) {
      setActiveSection(newSections[0].id);
    }
  };

  const duplicateSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const newSection: FormSection = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      order: sections.length,
      questions: section.questions.map(q => ({ ...q, id: `q-${Date.now()}-${Math.random()}` }))
    };
    setSections([...sections, newSection]);
  };

  // Question handlers
  const addQuestion = (sectionId: string, type: QuestionType) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newQuestion: FormQuestion = {
      id: `q-${Date.now()}`,
      sectionId,
      type,
      question: 'Untitled Question',
      required: false,
      order: section.questions.length,
      options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(type) ? ['Option 1'] : undefined
    };

    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: [...s.questions, newQuestion] }
        : s
    ));
    setActiveQuestion(newQuestion.id);
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<FormQuestion>) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q) }
        : s
    ));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
        : s
    ));
    if (activeQuestion === questionId) {
      setActiveQuestion(null);
    }
  };

  const duplicateQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!section || !question) return;

    const newQuestion: FormQuestion = {
      ...question,
      id: `q-${Date.now()}`,
      order: section.questions.length
    };

    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: [...s.questions, newQuestion] }
        : s
    ));
  };

  // Option handlers for multiple choice questions
  const addOption = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    updateQuestion(sectionId, questionId, {
      options: [...question.options, `Option ${question.options.length + 1}`]
    });
  };

  const updateOption = (sectionId: string, questionId: string, index: number, value: string) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const newOptions = [...question.options];
    newOptions[index] = value;
    updateQuestion(sectionId, questionId, { options: newOptions });
  };

  const deleteOption = (sectionId: string, questionId: string, index: number) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!question?.options || question.options.length <= 1) return;

    updateQuestion(sectionId, questionId, {
      options: question.options.filter((_, i) => i !== index)
    });
  };

  // Save form
  const handleSave = async () => {
    if (!formName || !serviceId) {
      setToast({ type: 'error', message: 'Please fill in form name and select a service' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = {
        name: formName,
        description: formDescription || null,
        service_id: serviceId,
        is_active: isActive,
        sections: sections // JSONB column - Supabase handles the conversion
      };
      
      console.log('Saving form data:', formData);

      if (isEditMode) {
        await update(formId, formData);
        setToast({ type: 'success', message: 'Form updated successfully' });
      } else {
        const newForm = await create(formData);
        setToast({ type: 'success', message: 'Form created successfully' });
        if (newForm) {
          navigate(`/service-form-builder/${newForm.id}`);
        }
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save form' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout activeSection="service-forms">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <AppLayout activeSection="service-forms">
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/service-forms')} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeftIcon size={20} />
                </button>
                <div>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Untitled Form"
                    className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded"
                  />
                  Active
                </label>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <SaveIcon size={18} />
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - Sections */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Sections</h3>
                  <button
                    onClick={addSection}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <PlusIcon size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{section.title}</span>
                        <span className="text-xs text-gray-500">{section.questions.length} Q</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service selector */}
                <div className="mt-6 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select service...</option>
                    {services?.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.title || service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Main content - Form builder */}
            <div className="col-span-9">
              {currentSection && (
                <div className="space-y-4">
                  {/* Section header */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={currentSection.title}
                          onChange={(e) => updateSection(currentSection.id, { title: e.target.value })}
                          className="text-xl font-semibold w-full bg-transparent border-none focus:outline-none focus:ring-0 mb-2"
                          placeholder="Section Title"
                        />
                        <input
                          type="text"
                          value={currentSection.description || ''}
                          onChange={(e) => updateSection(currentSection.id, { description: e.target.value })}
                          className="text-sm text-gray-600 w-full bg-transparent border-none focus:outline-none focus:ring-0"
                          placeholder="Section description (optional)"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateSection(currentSection.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                          title="Duplicate section"
                        >
                          <CopyIcon size={18} />
                        </button>
                        <button
                          onClick={() => deleteSection(currentSection.id)}
                          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded"
                          title="Delete section"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  {currentSection.questions.map((question, qIndex) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isActive={activeQuestion === question.id}
                      onClick={() => setActiveQuestion(question.id)}
                      onUpdate={(updates) => updateQuestion(currentSection.id, question.id, updates)}
                      onDelete={() => deleteQuestion(currentSection.id, question.id)}
                      onDuplicate={() => duplicateQuestion(currentSection.id, question.id)}
                      onAddOption={() => addOption(currentSection.id, question.id)}
                      onUpdateOption={(index, value) => updateOption(currentSection.id, question.id, index, value)}
                      onDeleteOption={(index) => deleteOption(currentSection.id, question.id, index)}
                    />
                  ))}

                  {/* Add question button */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600 mr-2">Add question:</span>
                      {QUESTION_TYPES.map(type => (
                        <button
                          key={type.value}
                          onClick={() => addQuestion(currentSection.id, type.value)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </AppLayout>
  );
};

// Question Card Component
interface QuestionCardProps {
  question: FormQuestion;
  isActive: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<FormQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, value: string) => void;
  onDeleteOption: (index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question, isActive, onClick, onUpdate, onDelete, onDuplicate,
  onAddOption, onUpdateOption, onDeleteOption
}) => {
  const hasOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type);
  const typeInfo = QUESTION_TYPES.find(t => t.value === question.type);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {/* Question input */}
          <input
            type="text"
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            className="text-base font-medium w-full bg-transparent border-none focus:outline-none focus:ring-0 mb-2"
            placeholder="Question"
          />
          
          {/* Description */}
          {isActive && (
            <input
              type="text"
              value={question.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="text-sm text-gray-500 w-full bg-transparent border-none focus:outline-none focus:ring-0 mb-4"
              placeholder="Description (optional)"
            />
          )}

          {/* Options for multiple choice / checkboxes / dropdown */}
          {hasOptions && question.options && (
            <div className="space-y-2 mt-4">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  {question.type === 'multiple_choice' && <CircleIcon size={16} className="text-gray-400" />}
                  {question.type === 'checkboxes' && <CheckSquareIcon size={16} className="text-gray-400" />}
                  {question.type === 'dropdown' && <span className="text-gray-400 text-sm">{index + 1}.</span>}
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => onUpdateOption(index, e.target.value)}
                    className="flex-1 px-2 py-1 border-b border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  {question.options!.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteOption(index); }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); onAddOption(); }}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                + Add option
              </button>
            </div>
          )}

          {/* Preview for other types */}
          {!hasOptions && (
            <div className="mt-4">
              {question.type === 'short_text' && (
                <div className="border-b border-gray-300 py-2 text-gray-400 text-sm">Short answer text</div>
              )}
              {question.type === 'long_text' && (
                <div className="border border-gray-300 rounded p-2 text-gray-400 text-sm h-20">Long answer text</div>
              )}
              {question.type === 'date' && (
                <div className="border border-gray-300 rounded px-3 py-2 text-gray-400 text-sm w-48">MM/DD/YYYY</div>
              )}
              {question.type === 'file_upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-400 text-sm">
                  Click to upload file
                </div>
              )}
              {question.type === 'number' && (
                <div className="border-b border-gray-300 py-2 text-gray-400 text-sm w-32">Number</div>
              )}
              {question.type === 'email' && (
                <div className="border-b border-gray-300 py-2 text-gray-400 text-sm">email@example.com</div>
              )}
              {question.type === 'yes_no' && (
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" disabled className="text-blue-600" />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" disabled className="text-blue-600" />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <div className="flex flex-col items-center gap-2 border-l pl-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              {typeInfo?.icon}
              <span>{typeInfo?.label}</span>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded text-blue-600"
              />
              Required
            </label>
            <div className="flex gap-1 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                title="Duplicate"
              >
                <CopyIcon size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded"
                title="Delete"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceFormBuilderNew;
