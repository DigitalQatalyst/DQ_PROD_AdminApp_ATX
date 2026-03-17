import React, { useMemo } from 'react';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';
import { monthlyLeadData, conversionByService, winLossData } from '../data/mockData';
import { Lead } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface LeadAnalyticsProps {
  leads: Lead[];
}

export const LeadAnalytics: React.FC<LeadAnalyticsProps> = ({ leads }) => {
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1; });
    const colors: Record<string, string> = {
      'Website Form': '#3B82F6', Email: '#8B5CF6', Chatbot: '#22C55E', Marketplace: '#F97316',
      Webinar: '#EC4899', Referral: '#14B8A6', 'Service Request': '#2563EB', 'Product Demo': '#7C3AED',
      'Tour Request': '#D97706', Consultation: '#059669', Newsletter: '#0EA5E9', Whitepaper: '#4F46E5',
      Waitlist: '#E11D48', Enquiry: '#64748B',
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] || '#6B7280' })).sort((a, b) => b.value - a.value);
  }, [leads]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
    const colors: Record<string, string> = { New: '#3B82F6', Qualified: '#8B5CF6', Contacted: '#EAB308', 'Proposal Sent': '#F97316', Converted: '#22C55E', Lost: '#EF4444' };
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] || '#6B7280' }));
  }, [leads]);

  const priorityData = useMemo(() => {
    return [
      { name: 'High', value: leads.filter((l) => l.priority === 'High').length, color: '#EF4444' },
      { name: 'Medium', value: leads.filter((l) => l.priority === 'Medium').length, color: '#F59E0B' },
      { name: 'Low', value: leads.filter((l) => l.priority === 'Low').length, color: '#6B7280' },
      { name: 'Unscored', value: leads.filter((l) => !l.priority).length, color: '#D1D5DB' },
    ].filter((d) => d.value > 0);
  }, [leads]);

  const totalLeads = leads.length;
  const converted = leads.filter((l) => l.status === 'Converted').length;
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0';
  const formSubmissions = leads.filter((l) => l.formType).length;
  const highPriority = leads.filter((l) => l.priority === 'High').length;

  const statCards = [
    { icon: Users, label: 'Total Leads', value: totalLeads, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: TrendingUp, label: 'Conversion Rate', value: `${convRate}%`, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { icon: Zap, label: 'Form Submissions', value: formSubmissions, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: Target, label: 'High Priority', value: highPriority, bg: 'bg-red-50', iconColor: 'text-red-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Analytics Overview</h2>
        <select className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
          <option>Last 6 Months</option><option>Last 30 Days</option><option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, bg, iconColor }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${bg}`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
            <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Lead Acquisition Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyLeadData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#030F35" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#030F35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#030F35" fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Win / Loss Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLossData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="wins" fill="#10B981" name="Won Deals" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" fill="#EF4444" name="Lost Deals" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Conversion Rate by Service</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionByService} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" unit="%" />
                <YAxis dataKey="service" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#F97316" radius={[0, 4, 4, 0]} barSize={24} name="Conversion Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Lead Sources</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {sourceData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600 truncate">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name}</span>
                <span className="ml-auto font-medium text-gray-900 flex-shrink-0">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Priority Distribution</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip /><Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Pipeline Status</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip />
                <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]} barSize={32}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
