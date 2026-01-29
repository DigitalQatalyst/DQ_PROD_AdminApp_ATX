import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon, SaveIcon, XIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Service } from '../types';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';

type BusinessStage = 'startup' | 'investor' | 'expansion' | 'sme' | 'exporter' | 'early stage';

interface EnhancedServiceFormData {
  // Basic Information
  title: string;
  description: string;
  category: string;
  serviceType: 'Financial' | 'Business';
  
  // Business Stage
  businessStage: BusinessStage[];
  
  // Key Highlights
  keyHighlights: string[];
  
  // Eligibility & Application
  eligibilityRequirements: string;
  applicationProcess: string;
  requiredDocuments: string[];
  
  // Provider Details
  providerName: string;
  providerYearEstablished: number | '';
  providerDescription: string;
  providerAreasOfExpertise: string[];
  providerWebsite: string;
  providerEmail: string;
  providerLocation: string;
  providerContact: string;
  providerServices: string[];
  
  // Service Details
  serviceAmount: string;
  serviceProcessingTime: string;
  serviceEligibility: string;
  serviceInterestRates: string;
}

export const EnhancedServiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, userSegment } = useAuth();
  const isEditMode = !!serviceId;

  // Enterprise users cannot create or edit services
  useEffect(() => {
    if (userSegment === 'customer') {
      navigate('/service-management');
    }
  }, [userSegment, navigate]);

  const { getById, create, update, loading } = useCRUD<Service>('mktplc_services');

  const [formData, setFormData] = useState<EnhancedServiceFormData>({
    title: '',
    description: '',
    category: '',
    serviceType: 'Business',
    businessStage: [],
    keyHighlights: [],
    eligibilityRequirements: '',
    applicationProcess: '',
    requiredDocuments: [],
    providerName: '',
    providerYearEstablished: '',
    providerDescription: '',
    providerAreasOfExpertise: [],
    providerWebsite: '',
    providerEmail: '',
    providerLocation: '',
    providerContact: '',
    providerServices: [],
    serviceAmount: '',
    serviceProcessingTime: '',
    serviceEligibility: '',
    serviceInterestRates: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('basic');

  // Load service data if editing
  useEffect(() => {
    const loadService = async () => {
      if (!isEditMode || !serviceId) return;

      try {
        const service = await getById(serviceId);
        if (service) {
          setFormData({
            title: service.title || '',
            description: service.description || '',
            category: service.category || '',
            serviceType: (service.type === 'Financial' ? 'Financial' : 'Business') as 'Financial' | 'Business',
            businessStage: (service.businessStage || []) as BusinessStage[],
            keyHighlights: service.keyHighlights || [],
            eligibilityRequirements: service.eligibilityRequirements || '',
            applicationProcess: service.applicationProcess || '',
            requiredDocuments: service.requiredDocuments || [],
            providerName: service.providerName || '',
            providerYearEstablished: service.providerYearEstablished || '',
            providerDescription: service.providerDescription || '',
            providerAreasOfExpertise: service.providerAreasOfExpertise || [],
            providerWebsite: service.providerWebsite || '',
            providerEmail: service.providerEmail || '',
            providerLocation: service.providerLocation || '',
            providerContact: service.providerContact || '',
            providerServices: service.providerServices || [],
            serviceAmount: service.serviceAmount || '',
            serviceProcessingTime: service.serviceProcessingTime || '',
            serviceEligibility: service.serviceEligibility || '',
            serviceInterestRates: service.serviceInterestRates || '',
          });
        }
      } catch (err) {
        console.error('Error loading service:', err);
        setToast({ type: 'error', message: 'Failed to load service' });
      }
    };

    loadService();
  }, [serviceId, isEditMode, getById]);

  // Handle input changes
  const handleChange = (field: keyof EnhancedServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle array field additions
  const handleAddArrayItem = (field: 'keyHighlights' | 'requiredDocuments' | 'providerAreasOfExpertise' | 'providerServices') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field: 'keyHighlights' | 'requiredDocuments' | 'providerAreasOfExpertise' | 'providerServices', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleUpdateArrayItem = (field: 'keyHighlights' | 'requiredDocuments' | 'providerAreasOfExpertise' | 'providerServices', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Handle business stage toggle
  const handleBusinessStageToggle = (stage: BusinessStage) => {
    setFormData(prev => ({
      ...prev,
      businessStage: prev.businessStage.includes(stage)
        ? prev.businessStage.filter(s => s !== stage)
        : [...prev.businessStage, stage]
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.providerName.trim()) {
      newErrors.providerName = 'Provider name is required';
    }

    if (formData.providerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.providerEmail)) {
      newErrors.providerEmail = 'Invalid email format';
    }

    if (formData.providerWebsite && !/^https?:\/\/.+/.test(formData.providerWebsite)) {
      newErrors.providerWebsite = 'Invalid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ type: 'error', message: 'Please fix the errors in the form' });
      return;
    }

    setSubmitting(true);
    try {
      const serviceData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.serviceType,
        business_stage: formData.businessStage,
        key_highlights: formData.keyHighlights.filter(h => h.trim()),
        eligibility_requirements: formData.eligibilityRequirements,
        application_process: formData.applicationProcess,
        required_documents: formData.requiredDocuments.filter(d => d.trim()),
        provider_name: formData.providerName,
        provider_year_established: formData.providerYearEstablished || null,
        provider_description: formData.providerDescription,
        provider_areas_of_expertise: formData.providerAreasOfExpertise.filter(a => a.trim()),
        provider_website: formData.providerWebsite,
        provider_email: formData.providerEmail,
        provider_location: formData.providerLocation,
        provider_contact: formData.providerContact,
        provider_services: formData.providerServices.filter(s => s.trim()),
        service_amount: formData.serviceAmount,
        service_processing_time: formData.serviceProcessingTime,
        service_eligibility: formData.serviceEligibility,
        service_interest_rates: formData.serviceInterestRates,
        status: 'Draft',
      };

      if (isEditMode && serviceId) {
        await update(serviceId, serviceData);
        setToast({ type: 'success', message: 'Service updated successfully!' });
      } else {
        await create(serviceData);
        setToast({ type: 'success', message: 'Service created successfully!' });
      }

      setTimeout(() => {
        navigate('/service-management');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving service:', err);
      setToast({ type: 'error', message: err.message || 'Failed to save service' });
    } finally {
      setSubmitting(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'business', label: 'Business Stage & Highlights' },
    { id: 'eligibility', label: 'Eligibility & Application' },
    { id: 'provider', label: 'Provider Details' },
    { id: 'service', label: 'Service Details' },
  ];

  if (loading) {
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
            onClick={() => navigate('/service-management')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Service' : 'Create Service'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update service information' : 'Add a new service to the marketplace'}
            </p>
          </div>
        </div>
        <Can I="create" a="Service">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <SaveIcon size={20} />
            {submitting ? 'Saving...' : isEditMode ? 'Update Service' : 'Create Service'}
          </button>
        </Can>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter service title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Financial">Financial Services</option>
                  <option value="Business">Business Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Advisory, Consulting"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter detailed description of the service"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Business Stage & Highlights Section */}
        {activeSection === 'business' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Business Stage & Highlights</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Business Stage *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(['startup', 'investor', 'expansion', 'sme', 'exporter', 'early stage'] as BusinessStage[]).map(stage => (
                  <label key={stage} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.businessStage.includes(stage)}
                      onChange={() => handleBusinessStageToggle(stage)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm capitalize">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Highlights
              </label>
              <div className="space-y-2">
                {formData.keyHighlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => handleUpdateArrayItem('keyHighlights', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter key highlight"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem('keyHighlights', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddArrayItem('keyHighlights')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <PlusIcon size={18} />
                  Add Highlight
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility & Application Section */}
        {activeSection === 'eligibility' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Eligibility & Application</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eligibility Requirements
              </label>
              <textarea
                value={formData.eligibilityRequirements}
                onChange={(e) => handleChange('eligibilityRequirements', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the eligibility requirements for this service"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Process
              </label>
              <textarea
                value={formData.applicationProcess}
                onChange={(e) => handleChange('applicationProcess', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the application process step by step"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Documents
              </label>
              <div className="space-y-2">
                {formData.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={doc}
                      onChange={(e) => handleUpdateArrayItem('requiredDocuments', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter required document"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem('requiredDocuments', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddArrayItem('requiredDocuments')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <PlusIcon size={18} />
                  Add Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Provider Details Section */}
        {activeSection === 'provider' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Provider Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  value={formData.providerName}
                  onChange={(e) => handleChange('providerName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.providerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter provider name"
                />
                {errors.providerName && <p className="text-red-500 text-sm mt-1">{errors.providerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Establishment
                </label>
                <input
                  type="number"
                  value={formData.providerYearEstablished}
                  onChange={(e) => handleChange('providerYearEstablished', e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Description
                </label>
                <textarea
                  value={formData.providerDescription}
                  onChange={(e) => handleChange('providerDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the provider organization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.providerWebsite}
                  onChange={(e) => handleChange('providerWebsite', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.providerWebsite ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {errors.providerWebsite && <p className="text-red-500 text-sm mt-1">{errors.providerWebsite}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.providerEmail}
                  onChange={(e) => handleChange('providerEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.providerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contact@provider.com"
                />
                {errors.providerEmail && <p className="text-red-500 text-sm mt-1">{errors.providerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.providerLocation}
                  onChange={(e) => handleChange('providerLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.providerContact}
                  onChange={(e) => handleChange('providerContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number or contact info"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas of Expertise
                </label>
                <div className="space-y-2">
                  {formData.providerAreasOfExpertise.map((area, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => handleUpdateArrayItem('providerAreasOfExpertise', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter area of expertise"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('providerAreasOfExpertise', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem('providerAreasOfExpertise')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <PlusIcon size={18} />
                    Add Area of Expertise
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Services
                </label>
                <div className="space-y-2">
                  {formData.providerServices.map((service, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => handleUpdateArrayItem('providerServices', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter service offered"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('providerServices', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem('providerServices')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <PlusIcon size={18} />
                    Add Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Details Section */}
        {activeSection === 'service' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Service Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Amount
                </label>
                <input
                  type="text"
                  value={formData.serviceAmount}
                  onChange={(e) => handleChange('serviceAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., $1,000 - $5,000 or Free"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Time
                </label>
                <input
                  type="text"
                  value={formData.serviceProcessingTime}
                  onChange={(e) => handleChange('serviceProcessingTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5-7 business days"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Eligibility
                </label>
                <textarea
                  value={formData.serviceEligibility}
                  onChange={(e) => handleChange('serviceEligibility', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe who is eligible for this service"
                />
              </div>

              {formData.serviceType === 'Financial' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rates
                  </label>
                  <input
                    type="text"
                    value={formData.serviceInterestRates}
                    onChange={(e) => handleChange('serviceInterestRates', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.5% - 5% APR"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/service-management')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <Can I="create" a="Service">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <SaveIcon size={20} />
              {submitting ? 'Saving...' : isEditMode ? 'Update Service' : 'Create Service'}
            </button>
          </Can>
        </div>
      </form>

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

