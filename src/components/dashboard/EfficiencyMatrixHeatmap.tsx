import React from 'react';

interface EfficiencyMatrixData {
  service: string;
  metric: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
}

interface EfficiencyMatrixHeatmapProps {
  data?: EfficiencyMatrixData[];
}

const EfficiencyMatrixHeatmap: React.FC<EfficiencyMatrixHeatmapProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Matrix</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Get unique services and metrics
  const services = [...new Set(data.map(d => d.service))];
  const metrics = [...new Set(data.map(d => d.metric))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getCellData = (service: string, metric: string) => {
    return data.find(d => d.service === service && d.metric === metric);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Matrix Heatmap</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-gray-700 border-b-2 border-gray-200">
                Service / Metric
              </th>
              {metrics.map((metric, index) => (
                <th key={index} className="p-2 text-center text-sm font-medium text-gray-700 border-b-2 border-gray-200">
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((service, serviceIndex) => (
              <tr key={serviceIndex} className="border-b border-gray-100">
                <td className="p-2 text-sm font-medium text-gray-700">
                  {service}
                </td>
                {metrics.map((metric, metricIndex) => {
                  const cellData = getCellData(service, metric);
                  return (
                    <td key={metricIndex} className="p-2">
                      {cellData ? (
                        <div
                          className={`text-center py-2 px-3 rounded-md ${getStatusColor(cellData.status)}`}
                          title={`${cellData.value.toFixed(1)}%`}
                        >
                          <div className="text-sm font-semibold">
                            {cellData.value.toFixed(0)}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 px-3 text-gray-400">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Good (≥80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Warning (60-79%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Critical (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyMatrixHeatmap;
