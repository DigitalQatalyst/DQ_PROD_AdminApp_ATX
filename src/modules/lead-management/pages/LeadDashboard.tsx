import React from 'react';
import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { LeadKPICard } from '../components/LeadKPICard';
import { LeadStatusBadge } from '../components/LeadStatusBadge';
import { LeadScoreBadge } from '../components/LeadScoreBadge';
import { dashboardStats, monthlyLeadData, leadsBySource, conversionByService } from '../data/mockData';
import { Lead } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

interface LeadDashboardProps {
  leads: Lead[];
  onLeadClick: (id: string) => void;
}

export const LeadDashboard: React.FC<LeadDashboardProps> = ({ leads, onLeadClick }) => {
  const recentLeads = leads.slice(0, 5);
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeadKPICard icon={Users} label="Total Leads" value={dashboardStats.totalLeads} trend={dashboardStats.totalLeadsTrend} />
        <LeadKPICard icon={TrendingUp} label="Conversion Rate" value={`${dashboardStats.conversionRate}%`} trend={dashboardStats.conversionTrend} />
        <LeadKPICard icon={Clock} label="Avg Response Time" value={dashboardStats.avgResponseTime} trend={dashboardStats.responseTrend} trendLabel="vs last week" />
        <LeadKPICard icon={DollarSign} label="Pipeline Value" value={`${(dashboardStats.pipelineValue / 1000000).toFixed(1)}M`} trend={dashboardStats.pipelineTrend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Lead Volume Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyLeadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="leads" stroke="#030F35" strokeWidth={3} dot={{ r: 4, fill: '#030F35', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="converted" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Leads by Source</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadsBySource} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {leadsBySource.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {leadsBySource.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600 truncate">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name}</span>
                <span className="ml-auto font-medium text-gray-900 flex-shrink-0">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversion by Service</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={conversionByService}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="service" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#030F35" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Leads</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right pr-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onLeadClick(lead.id)}>
                    <td className="py-3 pl-2">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.company}</div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{lead.service}</td>
                    <td className="py-3"><LeadStatusBadge status={lead.status} /></td>
                    <td className="py-3"><LeadScoreBadge score={lead.score} /></td>
                    <td className="py-3 text-right pr-2 text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
