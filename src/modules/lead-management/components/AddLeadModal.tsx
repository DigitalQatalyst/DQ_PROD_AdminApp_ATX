import React, { useState } from 'react';
import Button from '../../../components/ui/ButtonComponent';
import { LeadSource, ServiceType, LeadPriority, TeamMember } from '../types';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  teamMembers: TeamMember[];
}

const selectClass = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const inputClass = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ open, onOpenChange, onSubmit, teamMembers }) => {
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '',
    source: 'Website Form' as LeadSource,
    service: 'DCO Assessment' as ServiceType,
    priority: 'Medium' as LeadPriority,
    assignedTo: '', notes: '',
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, status: 'New', tags: [] });
    onOpenChange(false);
    setFormData({ name: '', company: '', email: '', phone: '', source: 'Website Form', service: 'DCO Assessment', priority: 'Medium', assignedTo: 'tm1', notes: '' });
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[540px] mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input required className={inputClass} value={formData.name} onChange={set('name')} placeholder="John Doe" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Company *</label>
              <input required className={inputClass} value={formData.company} onChange={set('company')} placeholder="Acme Inc." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input type="email" required className={inputClass} value={formData.email} onChange={set('email')} placeholder="john@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" className={inputClass} value={formData.phone} onChange={set('phone')} placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Source</label>
              <select className={selectClass} value={formData.source} onChange={set('source')}>
                <optgroup label="Website Forms">
                  <option>Website Form</option><option>Service Request</option><option>Product Demo</option>
                  <option>Tour Request</option><option>Consultation</option><option>Newsletter</option>
                  <option>Whitepaper</option><option>Waitlist</option><option>Enquiry</option>
                </optgroup>
                <optgroup label="Other Channels">
                  <option>Email</option><option>Chatbot</option><option>Marketplace</option>
                  <option>Webinar</option><option>Referral</option>
                </optgroup>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Service Interest</label>
              <select className={selectClass} value={formData.service} onChange={set('service')}>
                <option>DCO Assessment</option><option>AI Strategy</option><option>DTMI Licensing</option>
                <option>Digital Transformation</option><option>Cloud Migration</option><option>Data Analytics</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select className={selectClass} value={formData.priority} onChange={set('priority')}>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <select className={selectClass} value={formData.assignedTo} onChange={set('assignedTo')}>
                {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Initial Notes</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.notes} onChange={set('notes')} placeholder="Any additional details..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Create Lead</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
