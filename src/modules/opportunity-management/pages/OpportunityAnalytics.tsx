import React from 'react';
import { DollarSign, TrendingUp, Trophy, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import type { Opportunity } from '../types';
import { computeOpportunityStats, computeAvgSalesCycleDays } from '../utils/opportunityStats';
import { OpportunityKPICard } from '../components/OpportunityKPICard';

interface OpportunityAnalyticsProps {
  opportunities: Opportunity[];
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

const OPEN_STAGES = ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation'] as const;

export const OpportunityAnalytics: React.FC<OpportunityAnalyticsProps> = ({ opportunities }) => {
  const stats = computeOpportunityStats(opportunities);
  const avgSalesCycle = computeAvgSalesCycleDays(opportunities);

  const totalClosedWonValue = opportunities
    .filter(o => o.stage === 'Closed Won')
    .reduce((sum, o) => sum + o.dealValue, 0);

  // Pipeline by open stage
  const pipelineByStage = OPEN_STAGES.map(stage => ({
    stage,
    value: opportunities
      .filter(o => o.stage === stage)
      .reduce((sum, o) => sum + o.dealValue, 0),
  }));

  // Win/Loss pie data
  const winLossData = [
    { name: 'Closed Won', value: stats.closedWonCount, color: '#22c55e' },
    { name: 'Closed Lost', value: stats.closedLostCount, color: '#ef4444' },
  ];
  const hasClosedOpps = stats.closedWonCount > 0 || stats.closedLostCount > 0;

  // Monthly close forecast — next 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) };
  });

  const forecastData = months.map(({ year, month, label }) => {
    const closedWon = opportunities
      .filter(o => {
        if (o.stage !== 'Closed Won' || !o.wonAt) return false;
        const d = new Date(o.wonAt);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, o) => sum + o.dealValue, 0);

    const forecast = opportunities
      .filter(o => {
        if (['Closed Won', 'Closed Lost'].includes(o.stage) || !o.closeDate) return false;
        const d = new Date(o.closeDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, o) => sum + o.dealValue, 0);

    return { label, closedWon, forecast };
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OpportunityKPICard
          icon={DollarSign}
          label="Avg Deal Size"
          value={formatCurrency(stats.avgDealSize)}
        />
        <OpportunityKPICard
          icon={TrendingUp}
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
        />
        <OpportunityKPICard
          icon={Clock}
          label="Avg Sales Cycle"
          value={`${avgSalesCycle.toFixed(0)} days`}
        />
        <OpportunityKPICard
          icon={Trophy}
          label="Total Closed Value"
          value={formatCurrency(totalClosedWonValue)}
        />
      </div>

      {/* Chart Row 1 */}
      <div className="grid grid-cols-5 gap-4">
        {/* Pipeline by Stage — 3/5 */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Value by Stage</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineByStage} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11 }} width={60} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss Pie — 2/5 */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Closed Won vs Lost</h3>
          {hasClosedOpps ? (
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={winLossData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {winLossData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              No closed opportunities yet
            </div>
          )}
        </div>
      </div>

      {/* Chart Row 2 — Monthly Forecast */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Close Forecast (Next 6 Months)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={forecastData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11 }} width={60} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="closedWon" name="Closed Won" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="forecast" name="Forecast" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OpportunityAnalytics;
