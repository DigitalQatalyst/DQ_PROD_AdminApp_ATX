import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { API_BASE_URL } from '../api/analytics/config';

interface ServiceVolumeTrendProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

interface MonthlyData {
  month: string;
  financial: number;
  nonFinancial: number;
}

const ServiceVolumeTrend: React.FC<ServiceVolumeTrendProps> = ({ startDate, endDate, serviceCategory = 'all' }) => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = serviceCategory && serviceCategory !== 'all'
          ? `${API_BASE_URL}/api/analytics/service-volume-trend?startDate=${startDate}&endDate=${endDate}&serviceCategory=${serviceCategory}`
          : `${API_BASE_URL}/api/analytics/service-volume-trend?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch service volume trend:', error);
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
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="space-y-1 mb-4">
          <h4 className="text-base font-medium text-foreground">Service Volume Trend by Service Type</h4>
          <p className="text-xs text-muted-foreground">Monthly volume split across Financial and Non-Financial services (Enterprise accounts only)</p>
        </div>
        <div className="flex items-center justify-center h-80 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  const showFinancial = !serviceCategory || serviceCategory === 'all' || serviceCategory === 'financial';
  const showNonFinancial = !serviceCategory || serviceCategory === 'all' || serviceCategory === 'non-financial';

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="space-y-1 mb-4">
        <h4 className="text-base font-medium text-foreground">Service Volume Trend by Service Type</h4>
        <p className="text-xs text-muted-foreground">Monthly volume split across Financial and Non-Financial services (Enterprise accounts only)</p>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorFinancial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorNonFinancial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#4b5563" 
            style={{ fontSize: '12px' }} 
            axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
            tick={{ fill: '#4b5563' }}
            label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#4b5563' } }}
          />
          <YAxis 
            stroke="#4b5563" 
            style={{ fontSize: '12px' }} 
            axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
            tick={{ fill: '#4b5563' }}
            tickFormatter={(v) => v?.toLocaleString()}
            label={{ value: 'Service Volume', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#4b5563' } }}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
            formatter={(value: any, name: any) => [value?.toLocaleString(), name]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {showFinancial && (
            <Area type="monotone" dataKey="financial" stroke="#10b981" strokeWidth={3} fill="url(#colorFinancial)" name="Financial">
              <LabelList dataKey="financial" position="top" style={{ fontSize: 12, fill: '#374151' }} />
            </Area>
          )}
          {showNonFinancial && (
            <Area type="monotone" dataKey="nonFinancial" stroke="#3b82f6" strokeWidth={3} fill="url(#colorNonFinancial)" name="Non-Financial">
              <LabelList dataKey="nonFinancial" position="top" style={{ fontSize: 12, fill: '#374151' }} />
            </Area>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceVolumeTrend;
