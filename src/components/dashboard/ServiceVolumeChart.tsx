import React from 'react';

interface ServiceVolumeData {
  date: string;
  services: number;
  requests: number;
  completions: number;
}

interface ServiceVolumeChartProps {
  data?: ServiceVolumeData[];
}

const ServiceVolumeChart: React.FC<ServiceVolumeChartProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Volume</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalServices = data.reduce((sum, d) => sum + d.services, 0);
  const totalRequests = data.reduce((sum, d) => sum + d.requests, 0);
  const totalCompletions = data.reduce((sum, d) => sum + d.completions, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Volume Over Time</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalServices}</div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalRequests}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{totalCompletions}</div>
          <div className="text-sm text-gray-600">Completions</div>
        </div>
      </div>

      {/* Simple data visualization */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 mb-2">Last 7 days trend:</div>
        {data.slice(-7).map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-24">{new Date(item.date).toLocaleDateString()}</span>
            <div className="flex-1 flex gap-1">
              <div 
                className="bg-blue-500 h-6 rounded" 
                style={{ width: `${(item.services / Math.max(...data.map(d => d.services))) * 100}%` }}
                title={`Services: ${item.services}`}
              />
              <div 
                className="bg-green-500 h-6 rounded" 
                style={{ width: `${(item.requests / Math.max(...data.map(d => d.requests))) * 100}%` }}
                title={`Requests: ${item.requests}`}
              />
              <div 
                className="bg-purple-500 h-6 rounded" 
                style={{ width: `${(item.completions / Math.max(...data.map(d => d.completions))) * 100}%` }}
                title={`Completions: ${item.completions}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Services</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Requests</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Completions</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceVolumeChart;
