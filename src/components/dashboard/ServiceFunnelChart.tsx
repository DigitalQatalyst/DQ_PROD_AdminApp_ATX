import React from 'react';

interface ServiceFunnelData {
  stage: string;
  value: number;
  percentage: number;
}

interface ServiceFunnelChartProps {
  data?: ServiceFunnelData[];
}

const ServiceFunnelChart: React.FC<ServiceFunnelChartProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Funnel</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Funnel</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.stage}</span>
              <span className="text-sm text-gray-600">
                {item.value.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {item.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Conversion rate */}
      {data.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overall Conversion Rate:</span>
            <span className="font-semibold text-blue-600">
              {data[data.length - 1].percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFunnelChart;
