import React, { useMemo } from 'react';
import { Target, DollarSign, TrendingUp, Trophy } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { computeOpportunityStats } from '../utils/opportunityStats';
import { OpportunityKPICard } from '../components/OpportunityKPICard';
import { OpportunityStageBadge } from '../components/OpportunityStageBadge';
import { Opportunity, OpportunityStage } from '../types';

interface OpportunityDashboardProps {
  opportunities: Opportunity[];
  onOpportunityClick: (id: string) => void;
}

const STAGES: OpportunityStage[] = [
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

const PIE_COLORS = { won: '#22c55e', lost: '#ef4444' };

export const OpportunityDashboard: React.FC<OpportunityDashboardProps> = ({
  opportunities,
  onOpportunityClick,
}) => {
  const stats = useMemo(() => computeOpportunityStats(opportunities), [opportunities]);

  const stageChartData = useMemo(() =>
    STAGES.map((stage) => {
      const opps = opportunities.filter((o) => o.stage === stage);
      return {
        stage: stage === 'Needs Analysis' ? 'Needs\nAnalysis' : stage,
        count: opps.length,
        valueK: Math.round(opps.reduce((s, o) => s + o.dealValue, 0) / 1000),
      };
    }),
    [opportunities]
  );

  const pieData = [
    { name: 'Closed Won', value: stats.closedWonCount, color: PIE_COLORS.won },
    { name: 'Closed Lost', value: stats.closedLostCount, color: PIE_COLORS.lost },
  ];

  const noClosed = stats.closedWonCount === 0 && stats.closedLostCount === 0;

  const recentOpportunities = useMemo(
    () => [...opportunities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [opportunities]
  );

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OpportunityKPICard icon={Target} label="Total Open" value={stats.openCount} />
        <OpportunityKPICard icon={DollarSign} label="Total Pipeline Value" value={formatCurrency(stats.totalPipelineValue)} />
        <OpportunityKPICard icon={TrendingUp} label="Weighted Pipeline" value={formatCurrency(stats.weightedPipelineValue)} />
        <OpportunityKPICard icon={Trophy} label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart — Pipeline by Stage */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Pipeline by Stage</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" name="Count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="valueK" name="Value ($k)" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — Win / Loss */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Win / Loss Ratio</h3>
          {noClosed ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              No closed opportunities yet
            </div>
          ) : (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                    <span className="font-semibold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Opportunities</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                <th className="pb-3 pl-2">Title</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Stage</th>
                <th className="pb-3 text-right">Deal Value</th>
                <th className="pb-3 text-right pr-2">Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOpportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onOpportunityClick(opp.id)}
                >
                  <td className="py-3 pl-2">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">{opp.title}</div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{opp.companyName ?? '—'}</td>
                  <td className="py-3">
                    <OpportunityStageBadge stage={opp.stage} size="sm" />
                  </td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(opp.dealValue)}
                  </td>
                  <td className="py-3 text-right pr-2 text-sm text-gray-500">
                    {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
