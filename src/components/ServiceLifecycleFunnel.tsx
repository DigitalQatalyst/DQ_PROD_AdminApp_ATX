import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/analytics/config';

interface ServiceLifecycleFunnelProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
}

const ServiceLifecycleFunnel: React.FC<ServiceLifecycleFunnelProps> = ({ 
  startDate, 
  endDate, 
  serviceCategory = 'all' 
}) => {
  const [data, setData] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = serviceCategory && serviceCategory !== 'all'
          ? `${API_BASE_URL}/api/analytics/service-lifecycle-funnel?startDate=${startDate}&endDate=${endDate}&serviceCategory=${serviceCategory}`
          : `${API_BASE_URL}/api/analytics/service-lifecycle-funnel?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch service lifecycle funnel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory]);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="space-y-1 mb-4">
          <h4 className="text-base font-medium text-foreground">Service Lifecycle Funnel</h4>
          <p className="text-xs text-muted-foreground">Track service requests through delivery stages</p>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#10b981'];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="space-y-1 mb-6">
        <h4 className="text-base font-medium text-foreground">Service Lifecycle Funnel</h4>
        <p className="text-xs text-muted-foreground">Track service requests through delivery stages</p>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{item.stage}</span>
              <span className="text-sm text-gray-600">
                {item.value.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
            <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 flex items-center justify-center"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: colors[index]
                }}
              >
                <span className="text-xs font-semibold text-white px-2">
                  {item.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Conversion Rate (Requested → Delivered):</span>
            <span className="font-semibold text-green-600">
              {data[data.length - 1].percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceLifecycleFunnel;
