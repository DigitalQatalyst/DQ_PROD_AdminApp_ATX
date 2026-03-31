import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/ButtonComponent';
import { Opportunity, OpportunityStage, TeamMember } from '../types';

interface AddOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Opportunity, 'id' | 'activities' | 'createdAt'>) => void;
  teamMembers: TeamMember[];
  prefill?: Partial<Opportunity>;
}

const selectClass = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const inputClass = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

const defaultForm = {
  title: '',
  companyName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  stage: 'Qualification' as OpportunityStage,
  dealValue: 0,
  currency: 'USD',
  probability: 0,
  closeDate: '',
  assignedTo: '',
  description: '',
  tags: [] as string[],
  leadId: undefined as string | undefined,
};

export const AddOpportunityModal: React.FC<AddOpportunityModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  teamMembers,
  prefill,
}) => {
  const [formData, setFormData] = useState({ ...defaultForm });

  // Apply prefill whenever it changes or modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        ...defaultForm,
        assignedTo: prefill?.assignedTo ?? teamMembers[0]?.id ?? '',
        ...(prefill ? {
          title: prefill.title ?? '',
          companyName: prefill.companyName ?? '',
          contactName: prefill.contactName ?? '',
          contactEmail: prefill.contactEmail ?? '',
          contactPhone: prefill.contactPhone ?? '',
          stage: prefill.stage ?? 'Qualification',
          dealValue: prefill.dealValue ?? 0,
          currency: prefill.currency ?? 'USD',
          probability: prefill.probability ?? 0,
          closeDate: prefill.closeDate ?? '',
          description: prefill.description ?? '',
          tags: prefill.tags ?? [],
          leadId: prefill.leadId,
        } : {}),
      });
    }
  }, [open, prefill, teamMembers]);

  if (!open) return null;

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const setNum = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setFormData((prev) => ({ ...prev, [key]: Number(e.target.value) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      companyName: formData.companyName || undefined,
      contactName: formData.contactName || undefined,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      stage: formData.stage,
      dealValue: formData.dealValue,
      currency: formData.currency,
      probability: formData.probability,
      closeDate: formData.closeDate,
      assignedTo: formData.assignedTo,
      description: formData.description || undefined,
      tags: formData.tags,
      leadId: formData.leadId,
    });
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[600px] mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Opportunity</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <input
              required
              className={inputClass}
              value={formData.title}
              onChange={set('title')}
              placeholder="Opportunity title"
            />
          </div>

          {/* Company + Contact Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <input className={inputClass} value={formData.companyName} onChange={set('companyName')} placeholder="Acme Inc." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Contact Name</label>
              <input className={inputClass} value={formData.contactName} onChange={set('contactName')} placeholder="John Doe" />
            </div>
          </div>

          {/* Contact Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Contact Email</label>
              <input type="email" className={inputClass} value={formData.contactEmail} onChange={set('contactEmail')} placeholder="john@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Contact Phone</label>
              <input type="tel" className={inputClass} value={formData.contactPhone} onChange={set('contactPhone')} placeholder="+1 234 567 890" />
            </div>
          </div>

          {/* Stage + Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Stage</label>
              <select className={selectClass} value={formData.stage} onChange={set('stage')}>
                <option value="Qualification">Qualification</option>
                <option value="Needs Analysis">Needs Analysis</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <select className={selectClass} value={formData.assignedTo} onChange={set('assignedTo')}>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deal Value + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Deal Value</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={formData.dealValue || ''}
                onChange={setNum('dealValue')}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select className={selectClass} value={formData.currency} onChange={set('currency')}>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Probability + Close Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Probability (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={formData.probability || ''}
                onChange={setNum('probability')}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Close Date</label>
              <input type="date" className={inputClass} value={formData.closeDate} onChange={set('closeDate')} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={set('description')}
              placeholder="Any additional details..."
            />
          </div>

          {/* Hidden leadId */}
          {formData.leadId && (
            <input type="hidden" value={formData.leadId} />
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Create Opportunity</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
