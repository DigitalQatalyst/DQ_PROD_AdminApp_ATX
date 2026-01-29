import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { AppLayout } from './AppLayout';

interface Partner {
  id: string;
  name: string;
  description?: string;
  location?: string;
}

const SERVICE_TYPES = ['Business', 'Financial'] as const;
const BUSINESS_CATEGORIES = ['Advisory', 'Consulting', 'Technology', 'Research', 'Export'];
const FINANCIAL_CATEGORIES = ['Direct Financing', 'Investment', 'Export Trade Financing', 'Loans'];
const BUSINESS_STAGES = ['Startup', 'Growth', 'Expansion', 'SME', 'Exporter', 'Early Stage'];

export const ServiceFormWizard: React.FC<{ serviceId?: string }> = ({ serviceId }) => {
  const navigate = useNavigate();
  const { create, update, getById, loading } = useCRUD<any>('mktplc_services');
  const { data: partnersData, list: listPartners } = useCRUD<Partner>('partners');
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_type: 'Business' as 'Business' | 'Financial',
    categories: [] as string[],
    business_stage: [] as string[],
    key_highlights: [] as string[],
    eligibility_requirements: [] as string[],
    application_process: [] as string[],
    partner_id: '',
    service_amount: '',
    service_processing_time: '',
    service_eligibility: '',
  });

  // Get categories based on service type
  const availableCategories = formData.service_type === 'Financial' ? FINANCIAL_CATEGORIES : BUSINESS_CATEGORIES;

  const [inputValues, setInputValues] = useState({
    highlight: '',
    eligibility: '',
    process: '',
  });

  useEffect(() => {
    loadPartners();
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadPartners = async () => {
    await listPartners();
  };

  // Update partners when data changes
  useEffect(() => {
    if (partnersData) setPartners(partnersData);
  }, [partnersData]);

  const loadService = async () => {
    if (!serviceId) return;
    const service = await getById(serviceId);
    if (service) {
      setFormData({
        name: service.title || service.name || '',
        description: service.description || '',
        service_type: service.service_type || 'Business',
        categories: service.categories || (service.category ? [service.category] : []),
        business_stage: service.business_stage || [],
        key_highlights: service.key_highlights || [],
        eligibility_requirements: Array.isArray(service.eligibility_requirements) 
          ? service.eligibility_requirements 
          : (service.eligibility_requirements?.split('\n').filter(Boolean) || []),
        application_process: Array.isArray(service.application_process)
          ? service.application_process
          : (service.application_process?.split('\n').filter(Boolean) || []),
        partner_id: service.partner_id || '',
        service_amount: service.service_amount || service.fee || '',
        service_processing_time: service.service_processing_time || service.processing_time || '',
        service_eligibility: service.service_eligibility || '',
      });
    }
  };

  const addListItem = (field: 'key_highlights' | 'eligibility_requirements' | 'application_process', inputKey: 'highlight' | 'eligibility' | 'process') => {
    const value = inputValues[inputKey].trim();
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      setInputValues(prev => ({ ...prev, [inputKey]: '' }));
    }
  };

  const removeListItem = (field: 'key_highlights' | 'eligibility_requirements' | 'application_process', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleServiceTypeChange = (type: 'Business' | 'Financial') => {
    setFormData(prev => ({
      ...prev,
      service_type: type,
      categories: [] // Reset categories when type changes
    }));
  };

  const toggleBusinessStage = (stage: string) => {
    setFormData(prev => ({
      ...prev,
      business_stage: prev.business_stage.includes(stage)
        ? prev.business_stage.filter(s => s !== stage)
        : [...prev.business_stage, stage]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Service name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setSubmitting(true);

    const serviceData = {
      title: formData.name,
      name: formData.name,
      description: formData.description,
      service_type: formData.service_type,
      category: formData.categories[0] || (formData.service_type === 'Financial' ? 'Direct Financing' : 'Advisory'),
      categories: formData.categories,
      business_stage: formData.business_stage,
      key_highlights: formData.key_highlights,
      eligibility_requirements: formData.eligibility_requirements,
      application_process: formData.application_process,
      partner_id: formData.partner_id || null,
      service_amount: formData.service_amount,
      service_processing_time: formData.service_processing_time,
      service_eligibility: formData.service_eligibility,
      status: 'Draft',
      is_active: true,
    };

    try {
      if (serviceId) {
        await update(serviceId, serviceData);
        setSuccess('Service updated successfully!');
      } else {
        await create(serviceData);
        setSuccess('Service created successfully!');
      }
      setTimeout(() => navigate('/service-management'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && serviceId) {
    return (
      <AppLayout activeSection="service-management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeSection="service-management">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {serviceId ? 'Edit Service' : 'Create New Service'}
          </h1>
          <p className="text-gray-600">Fill in the details below to {serviceId ? 'update' : 'create'} a service</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the service..."
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Type *</h2>
            <div className="flex gap-4">
              {SERVICE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleServiceTypeChange(type)}
                  className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                    formData.service_type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formData.service_type === type && <CheckIcon className="w-5 h-5 inline mr-2" />}
                  <span className="font-medium">{type} Service</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categories * <span className="text-sm font-normal text-gray-500">({formData.service_type} Service)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.categories.includes(category)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formData.categories.includes(category) && <CheckIcon className="w-4 h-4 inline mr-1" />}
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Business Stage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Business Stages</h2>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_STAGES.map(stage => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => toggleBusinessStage(stage)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.business_stage.includes(stage)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formData.business_stage.includes(stage) && <CheckIcon className="w-4 h-4 inline mr-1" />}
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Key Highlights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Highlights</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputValues.highlight}
                onChange={(e) => setInputValues(prev => ({ ...prev, highlight: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('key_highlights', 'highlight'))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add a key highlight"
              />
              <button
                type="button"
                onClick={() => addListItem('key_highlights', 'highlight')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.key_highlights.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{item}</span>
                  <button type="button" onClick={() => removeListItem('key_highlights', item)} className="text-gray-400 hover:text-red-600">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Requirements</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputValues.eligibility}
                onChange={(e) => setInputValues(prev => ({ ...prev, eligibility: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('eligibility_requirements', 'eligibility'))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add eligibility requirement"
              />
              <button
                type="button"
                onClick={() => addListItem('eligibility_requirements', 'eligibility')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.eligibility_requirements.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{item}</span>
                  <button type="button" onClick={() => removeListItem('eligibility_requirements', item)} className="text-gray-400 hover:text-red-600">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Process</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputValues.process}
                onChange={(e) => setInputValues(prev => ({ ...prev, process: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('application_process', 'process'))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add application step"
              />
              <button
                type="button"
                onClick={() => addListItem('application_process', 'process')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.application_process.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </span>
                    {item}
                  </span>
                  <button type="button" onClick={() => removeListItem('application_process', item)} className="text-gray-400 hover:text-red-600">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Provider</h2>
            {partners.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-3">No partners available.</p>
                <button
                  type="button"
                  onClick={() => navigate('/partners')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create a partner first →
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={formData.partner_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, partner_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Select a provider (optional)</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Amount/Cost</label>
                <input
                  type="text"
                  value={formData.service_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_amount: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Free, QAR 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
                <input
                  type="text"
                  value={formData.service_processing_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_processing_time: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2-3 business days"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Eligibility Notes</label>
              <textarea
                rows={3}
                value={formData.service_eligibility}
                onChange={(e) => setFormData(prev => ({ ...prev, service_eligibility: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional eligibility information..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/service-management')}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : (serviceId ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default ServiceFormWizard;
