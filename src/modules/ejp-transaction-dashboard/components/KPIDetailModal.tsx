import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  target?: string;
  sparklineData?: number[];
  icon?: string;
  threshold?: 'excellent' | 'good' | 'normal' | 'warning' | 'critical';
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  unit,
  description,
  trend,
  trendValue,
  target,
  sparklineData = [],
  icon,
  threshold = 'normal'
}) => {
  if (!isOpen) return null;

  const getThresholdInfo = () => {
    switch (threshold) {
      case 'excellent':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excellent Performance' };
      case 'good':
        return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good Performance' };
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Needs Attention' };
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Normal' };
    }
  };

  const thresholdInfo = getThresholdInfo();

  const generateDetailedSparkline = () => {
    if (!sparklineData?.length) return '';
    
    const width = 400;
    const height = 120;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    return sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start gap-4 flex-1">
            {icon && (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${thresholdInfo.bg} ${thresholdInfo.color}`}>
                <Icon name={icon} size={24} />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${thresholdInfo.bg} ${thresholdInfo.color}`}>
                {thresholdInfo.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Value */}
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-light text-gray-900">{value}</span>
              {unit && <span className="text-xl text-gray-600 font-medium">{unit}</span>}
            </div>
            {description && (
              <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto">{description}</p>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {trend && trendValue && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={16} className={trend === 'up' ? 'text-emerald-600' : 'text-red-600'} />
                  <span className="text-xs font-medium text-gray-500">Trend</span>
                </div>
                <p className={`text-lg font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trendValue}
                </p>
              </div>
            )}

            {target && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Target" size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-500">Target</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{target}</p>
              </div>
            )}
          </div>

          {/* Historical Trend Chart */}
          {sparklineData?.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Historical Trend</h3>
              <div className="w-full h-32 flex items-center justify-center">
                <svg width="400" height="120" className="overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* Main line */}
                  <path
                    d={generateDetailedSparkline()}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                  />
                  
                  {/* Data points */}
                  {sparklineData.map((value, index) => {
                    const max = Math.max(...sparklineData);
                    const min = Math.min(...sparklineData);
                    const range = max - min || 1;
                    const x = (index / (sparklineData.length - 1)) * 400;
                    const y = 120 - ((value - min) / range) * 120;
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Period Start</span>
                <span>Current</span>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">About This Metric</h4>
                <p className="text-xs text-blue-800">
                  This KPI tracks {title.toLowerCase()} and provides insights into performance trends. 
                  {target && ` The target is set at ${target}.`}
                  {trend && trendValue && ` Current trend shows ${trend === 'up' ? 'an increase' : 'a decrease'} of ${trendValue}.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIDetailModal;
