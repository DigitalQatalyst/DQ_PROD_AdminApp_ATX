import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  description?: string;
  icon?: React.ReactNode | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  target?: string;
  error?: any;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, description, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {change !== undefined && (
        <div className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  );
};

export default KPICard;
