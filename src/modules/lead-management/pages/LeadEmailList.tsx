import React, { useState } from 'react';
import { Mail, Search, Download, Users, TrendingUp, Clock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { LeadStatusBadge } from '../components/LeadStatusBadge';
import { Lead, TeamMember } from '../types';

interface LeadEmailListProps {
  leads: Lead[];
  teamMembers: TeamMember[];
  onLeadClick: (id: string) => void;
}

type EmailFilter = 'All' | 'newsletter' | 'whitepaper';

export const LeadEmailList: React.FC<LeadEmailListProps> = ({
  leads,
  teamMembers: _teamMembers,
  onLeadClick,
}) => {
  const [activeTab, setActiveTab] = useState<EmailFilter>('All');
  const [search, setSearch] = useState('');

  const emailLeads = leads.filter(
    (l) => l.formType === 'newsletter' || l.formType === 'whitepaper'
  );

  const filtered = emailLeads.filter((l) => {
    const matchesTab = activeTab === 'All' || l.formType === activeTab;
    const matchesSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const newsletterCount = emailLeads.filter((l) => l.formType === 'newsletter').length;
  const whitepaperCount = emailLeads.filter((l) => l.formType === 'whitepaper').length;
  const convertedCount = emailLeads.filter((l) => l.status === 'Converted').length;

  const tabs: { id: EmailFilter; label: string; count: number }[] = [
    { id: 'All', label: 'All Subscribers', count: emailLeads.length },
    { id: 'newsletter', label: 'Newsletter', count: newsletterCount },
    { id: 'whitepaper', label: 'Whitepaper', count: whitepaperCount },
  ];

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: 'Total Subscribers', value: emailLeads.length, icon: Users, color: 'border-l-slate-900', iconBg: 'bg-blue-50 text-slate-900' },
          { label: 'Newsletter', value: newsletterCount, icon: Mail, color: 'border-l-indigo-500', iconBg: 'bg-indigo-50 text-indigo-600' },
          { label: 'Whitepaper Downloads', value: whitepaperCount, icon: Download, color: 'border-l-purple-500', iconBg: 'bg-purple-50 text-purple-600' },
          { label: 'Converted', value: convertedCount, icon: TrendingUp, color: 'border-l-green-500', iconBg: 'bg-green-50 text-green-600' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className={cn('bg-white border border-l-4 rounded-xl p-4 flex items-center gap-4', color)}>
            <div className={cn('p-3 rounded-full', iconBg)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              {tab.label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-xs',
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Mail className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No subscribers found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onLeadClick(lead.id)}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group flex items-center gap-4"
            >
              <Avatar className="h-10 w-10 border border-gray-100 flex-shrink-0">
                <AvatarFallback className="bg-slate-900 text-white text-sm">
                  {lead.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors truncate">
                    {lead.name}
                  </span>
                  <span className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full',
                    lead.formType === 'newsletter'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-purple-100 text-purple-700'
                  )}>
                    {lead.formType === 'newsletter' ? 'Newsletter' : 'Whitepaper'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                  <span>{lead.email}</span>
                  {lead.company && <span className="text-gray-400"> {lead.company}</span>}
                  {lead.whitepaperTitle && (
                    <span className="text-gray-400 italic truncate max-w-xs">"{lead.whitepaperTitle}"</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <LeadStatusBadge status={lead.status} />
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};