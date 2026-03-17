import React, { useState } from 'react';
import { FileText, Clock, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { LeadPriorityBadge } from '../components/LeadPriorityBadge';
import { Lead, FormType } from '../types';

interface LeadFormSubmissionsProps {
  leads: Lead[];
  onLeadClick: (id: string) => void;
}

const formTypeLabels: Record<string, { label: string; color: string }> = {
  'service-request': { label: 'Service Request', color: 'bg-blue-100 text-blue-700' },
  'product-demo': { label: 'Product Demo', color: 'bg-purple-100 text-purple-700' },
  'tour-request': { label: 'Tour Request', color: 'bg-amber-100 text-amber-700' },
  consultation: { label: 'Consultation', color: 'bg-green-100 text-green-700' },
  waitlist: { label: 'Waitlist', color: 'bg-orange-100 text-orange-700' },
  enquiry: { label: 'Enquiry', color: 'bg-gray-100 text-gray-700' },
};

const getFormDetails = (lead: Lead) => {
  switch (lead.formType) {
    case 'service-request':
      return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex flex-col"><span className="text-gray-500 text-xs">Budget</span><span className="font-medium text-gray-900">{lead.budget || 'Not specified'}</span></div>
          <div className="flex flex-col"><span className="text-gray-500 text-xs">Timeline</span><span className="font-medium text-gray-900">{lead.projectTimeline || 'Not specified'}</span></div>
        </div>
      );
    case 'product-demo':
    case 'waitlist':
      return (
        <div className="flex flex-col text-sm">
          <span className="text-gray-500 text-xs">Product Interest</span>
          <span className="font-medium text-gray-900">{lead.productName} <span className="text-gray-400">({lead.productCode})</span></span>
        </div>
      );
    case 'tour-request':
      return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex flex-col"><span className="text-gray-500 text-xs">Group Size</span><span className="font-medium text-gray-900">{lead.groupSize}</span></div>
          <div className="flex flex-col"><span className="text-gray-500 text-xs">Preferred Time</span><span className="font-medium text-gray-900">{lead.preferredDate} • {lead.preferredTime}</span></div>
        </div>
      );
    case 'consultation':
      return (
        <div className="flex flex-col text-sm">
          <span className="text-gray-500 text-xs">Sector Interest</span>
          <span className="font-medium text-gray-900">{lead.sector}</span>
        </div>
      );
    case 'enquiry':
      return (
        <div className="flex flex-col text-sm">
          <span className="text-gray-500 text-xs">Enquiry Type</span>
          <span className="font-medium text-gray-900">{lead.enquiryType}</span>
        </div>
      );
    default: return null;
  }
};

export const LeadFormSubmissions: React.FC<LeadFormSubmissionsProps> = ({ leads, onLeadClick }) => {
  const [activeTab, setActiveTab] = useState<FormType | 'All'>('All');
  const formLeads = leads.filter((l) => l.formType && l.formType !== 'newsletter' && l.formType !== 'whitepaper');
  const filteredLeads = activeTab === 'All' ? formLeads : formLeads.filter((l) => l.formType === activeTab);

  const totalSubmissions = formLeads.length;
  const highPriority = formLeads.filter((l) => l.priority === 'High').length;
  const pendingFollowUp = formLeads.filter((l) => l.status === 'New').length;
  const thisWeek = formLeads.filter((l) => {
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const tabs = [
    { id: 'All' as const, label: 'All', count: formLeads.length },
    { id: 'service-request' as FormType, label: 'Service Requests', count: formLeads.filter((l) => l.formType === 'service-request').length },
    { id: 'product-demo' as FormType, label: 'Demos', count: formLeads.filter((l) => l.formType === 'product-demo').length },
    { id: 'tour-request' as FormType, label: 'Tours', count: formLeads.filter((l) => l.formType === 'tour-request').length },
    { id: 'consultation' as FormType, label: 'Consultations', count: formLeads.filter((l) => l.formType === 'consultation').length },
    { id: 'waitlist' as FormType, label: 'Waitlist', count: formLeads.filter((l) => l.formType === 'waitlist').length },
    { id: 'enquiry' as FormType, label: 'Enquiries', count: formLeads.filter((l) => l.formType === 'enquiry').length },
  ];

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: 'Total Submissions', value: totalSubmissions, icon: FileText, color: 'border-l-slate-900', iconBg: 'bg-blue-50 text-slate-900' },
          { label: 'High Priority', value: highPriority, icon: AlertCircle, color: 'border-l-red-500', iconBg: 'bg-red-50 text-red-600' },
          { label: 'Pending Follow-up', value: pendingFollowUp, icon: Clock, color: 'border-l-amber-500', iconBg: 'bg-amber-50 text-amber-600' },
          { label: 'This Week', value: thisWeek, icon: Calendar, color: 'border-l-green-500', iconBg: 'bg-green-50 text-green-600' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className={cn('bg-white border border-l-4 rounded-xl p-4 flex items-center gap-4', color)}>
            <div className={cn('p-3 rounded-full', iconBg)}><Icon className="w-5 h-5" /></div>
            <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 flex-shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200')}>
            {tab.label}
            <span className={cn('px-1.5 py-0.5 rounded-full text-xs', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm">Try selecting a different category</p>
          </div>
        ) : filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white border border-gray-200 rounded-xl p-0 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onLeadClick(lead.id)}>
            <div className="p-5 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <div className="flex items-center gap-4 min-w-[250px]">
                <Avatar className="h-10 w-10 border border-gray-100">
                  <AvatarFallback className="bg-slate-900 text-white text-sm">
                    {lead.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">{lead.name}</h3>
                    {lead.formType && formTypeLabels[lead.formType] && (
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', formTypeLabels[lead.formType].color)}>
                        {formTypeLabels[lead.formType].label}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-xs text-gray-500">
                    <span>{lead.company || 'No Company'}</span>
                    <span>{lead.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 border-l border-gray-100 pl-6 min-h-[40px] flex items-center">{getFormDetails(lead)}</div>
              <div className="flex flex-col items-end gap-2 min-w-[200px]">
                <div className="flex items-center gap-2">
                  {lead.priority && <LeadPriorityBadge priority={lead.priority} />}
                  <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100">Route: {lead.suggestedRouting}</span>
                  {lead.followUpSla && (
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{lead.followUpSla}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
