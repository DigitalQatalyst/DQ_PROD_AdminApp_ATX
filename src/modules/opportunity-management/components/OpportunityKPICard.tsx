import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface OpportunityKPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
}

export const OpportunityKPICard: React.FC<OpportunityKPICardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel = 'vs last month',
}) => {
  const isPositive = trend !== undefined && trend >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}% {trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
