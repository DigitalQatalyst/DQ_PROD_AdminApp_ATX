import React, { useState } from 'react';
import Icon from '../../../components/ui/AppIcon';
import KPIDetailModal from '../../../modules/ejp-transaction-dashboard/components/KPIDetailModal';

interface ExtendedKPICardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  description?: string;
  icon?: string;
  target?: string;
  error?: any;
  sparklineData?: number[];
  threshold?: 'excellent' | 'good' | 'normal' | 'warning' | 'critical';
  targetStatus?: 'achieved' | 'approaching' | 'on-track' | 'at-risk' | 'critical';
  isLoading?: boolean;
}

const KPICard: React.FC<ExtendedKPICardProps> = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendValue, 
  sparklineData = [], 
  threshold = 'normal',
  description,
  icon,
  target,
  targetStatus = 'on-track',
  isLoading = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
          <div className="text-sm text-gray-500 text-center py-2">Loading your data...</div>
        </div>
      </div>
    );
  }
  // Simplified indicator-based coloring: Green for good, Red for bad
  const getThresholdColor = () => {
    switch (threshold) {
      case 'excellent': case'good':
        return 'border-emerald-300 bg-white text-emerald-900';
      case 'warning': case'critical':
        return 'border-red-300 bg-white text-red-900';
      default:
        return 'border-gray-300 bg-white text-gray-900';
    }
  };

  const getTrendColor = () => {
    return trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  };

  const getIconBgColor = () => {
    switch (threshold) {
      case 'excellent': case'good':
        return 'bg-emerald-50 text-emerald-600';
      case 'warning': case'critical':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTargetStatusColor = () => {
    switch (targetStatus) {
      case 'achieved': case'approaching': case'on-track':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'at-risk': case'critical':
        return 'text-red-700 bg-red-50 border border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  const getTrendBadgeColor = () => {
    if (trend === 'up') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (trend === 'down') {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const generateSparklinePath = () => {
    if (!sparklineData?.length) return '';
    
    const width = 70;
    const height = 20;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    return sparklineData?.map((value, index) => {
        const x = (index / (sparklineData?.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })?.join(' ');
  };

  const getSparklineColor = () => {
    switch (threshold) {
      case 'excellent': case'good':
        return 'text-emerald-500';
      case 'warning': case'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <>
      <div 
        className={`p-6 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${getThresholdColor()}`}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)}
      >
      {/* Sparkline at top right */}
      {sparklineData?.length > 0 && (
        <div className="flex justify-end mb-2">
          <div className="w-[70px] h-5">
            <svg width="70" height="20" className="overflow-visible">
              {/* Main line */}
              <path
                d={generateSparklinePath()}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                className={`${getSparklineColor()}`}
              />
              
              {/* End point */}
              {sparklineData?.length > 0 && (
                <circle
                  cx="70"
                  cy={20 - ((sparklineData?.[sparklineData?.length - 1] - Math.min(...sparklineData)) / (Math.max(...sparklineData) - Math.min(...sparklineData) || 1)) * 20}
                  r="2"
                  className={`${getSparklineColor()}`}
                  fill="currentColor"
                />
              )}
            </svg>
          </div>
        </div>
      )}
      
      {/* Header with Icon and Title */}
      <div className="flex items-start gap-3 mb-4">
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor()} flex-shrink-0`}>
            <Icon name={icon} size={18} />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium text-sm leading-5">{title}</h3>
        </div>
      </div>
      {/* Main Value Display */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-600 font-medium">
              {unit}
            </span>
          )}
        </div>
        
        {/* Trend and Target Column */}
        <div className="space-y-2">
          {/* Trend Badge */}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTrendBadgeColor()}`}>
              <Icon 
                name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                size={12} 
              />
              <span>{trendValue}</span>
            </div>
          )}
          
          {/* Target Status Badge */}
          {target && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${getTargetStatusColor()}`}>
              Target: {target}
            </div>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 leading-4">
            {description}
          </p>
        )}
      </div>
    </div>

    <KPIDetailModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={title}
      value={value}
      unit={unit}
      description={description}
      trend={trend}
      trendValue={trendValue}
      target={target}
      sparklineData={sparklineData}
      icon={icon}
      threshold={threshold}
    />
    </>
  );
};

export default KPICard;