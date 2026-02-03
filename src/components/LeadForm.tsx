import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadSource, LeadStage } from '../types';
import { Toast } from './ui/Toast';

type LeadFormProps = {
  leadId?: string;
};

const leadSources: LeadSource[] = ['Login', 'Enquiry', 'Manual'];
const leadStages: LeadStage[] = ['New', 'Qualifying', 'Qualified', 'Converted', 'Disqualified'];

export const LeadForm: React.FC<LeadFormProps> = ({ leadId }) => {
  const navigate = useNavigate();
  const { user, userSegment, role } = useAuth();
  const { create, update, getById } = useCRUD<Lead>('crm_leads');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingLead, setExistingLead] = useState<Lead | null>(null);

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    organization_name: '',
    source: 'Manual' as LeadSource,
    stage: 'New' as LeadStage,
    notes: '',
    disqualify_reason: ''
  });

  useEffect(() => {
    const loadLead = async () => {
      if (!leadId) return;
      setIsLoading(true);
      try {
        const lead = await getById(leadId);
        if (lead) {
          setExistingLead(lead);
          setFormData({
            contact_name: lead.contact_name || '',
            contact_email: lead.contact_email || '',
            contact_phone: lead.contact_phone || '',
            organization_name: lead.organization_name || '',
            source: lead.source || 'Manual',
            stage: lead.stage || 'New',
            notes: lead.notes || '',
            disqualify_reason: lead.disqualify_reason || ''
          });
        }
      } catch (error) {
        console.error('Failed to load lead:', error);
        setToast({ type: 'error', message: 'Failed to load lead data.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadLead();
  }, [leadId, getById]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.contact_email && !formData.contact_phone) {
      setToast({ type: 'error', message: 'Provide at least an email or phone number.' });
      return false;
    }
    if (formData.stage === 'Disqualified' && !formData.disqualify_reason.trim()) {
      setToast({ type: 'error', message: 'Disqualification reason is required.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (userSegment !== 'internal' || role !== 'admin') {
      setToast({ type: 'error', message: 'Only internal admins can manage leads.' });
      return;
    }
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const leadPayload: Partial<Lead> = {
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        organization_name: formData.organization_name || null,
        source: formData.source,
        stage: formData.stage,
        notes: formData.notes || null,
        disqualify_reason: formData.stage === 'Disqualified' ? formData.disqualify_reason : null,
        owner_id: existingLead?.owner_id || user?.id,
        owner_name: existingLead?.owner_name || user?.name,
        organization_id: null
      };

      if (leadId && existingLead) {
        await update(leadId, leadPayload);
        setToast({ type: 'success', message: 'Lead updated successfully.' });
      } else {
        await create(leadPayload);
        setToast({ type: 'success', message: 'Lead created successfully.' });
      }

      setTimeout(() => navigate('/lead-management'), 500);
    } catch (error) {
      console.error('Failed to save lead:', error);
      setToast({ type: 'error', message: 'Failed to save lead.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {leadId ? 'Edit Lead' : 'Create Lead'}
        </h1>
        <p className="text-sm text-gray-500">Capture and qualify new interest from internal sources.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact name</label>
            <input
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization</label>
            <input
              name="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              placeholder="Organization name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              placeholder="Phone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              {leadSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stage</label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              {leadStages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.stage === 'Disqualified' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Disqualification reason</label>
            <textarea
              name="disqualify_reason"
              value={formData.disqualify_reason}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Why is this lead disqualified?"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            rows={4}
            placeholder="Additional context or notes"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/lead-management')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
