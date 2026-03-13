import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { API_BASE_URL } from '../api/analytics/config';

interface EnterpriseEngagementTrendProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

interface MonthlyData {
  month: string;
  enterprises: number;
}

const EnterpriseEngagementTrend: React.FC<EnterpriseEngagementTrendProps> = ({ 
  startDate, 
  endDate, 
  serviceCategory = 'all'
}) => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = serviceCategory && serviceCategory !== 'all'
          ? `${API_BASE_URL}/api/analytics/enterprise-engagement-trend?startDate=${startDate}&endDate=${endDate}&serviceCategory=${serviceCategory}`
          : `${API_BASE_URL}/api/analytics/enterprise-engagement-trend?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch enterprise engagement trend:', error);
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
          <h4 className="text-base font-medium text-foreground">Enterprise Engagement Trend</h4>
          <p className="text-xs text-muted-foreground">Active enterprises engaging with services monthly</p>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="space-y-1 mb-4">
        <h4 className="text-base font-medium text-foreground">Enterprise Engagement Trend</h4>
        <p className="text-xs text-muted-foreground">Active enterprises engaging with services monthly</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#4b5563"
            style={{ fontSize: '12px' }}
            axisLine={{ stroke: '#4b5563' }}
            tick={{ fill: '#4b5563' }}
          />
          <YAxis 
            stroke="#4b5563"
            style={{ fontSize: '12px' }}
            label={{ value: 'Active Enterprises', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#4b5563' } }}
            axisLine={{ stroke: '#4b5563' }}
            tick={{ fill: '#4b5563' }}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="enterprises" 
            stroke="#06b6d4" 
            strokeWidth={3}
            dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
            name="Active Enterprises"
          >
            <LabelList dataKey="enterprises" position="top" style={{ fontSize: 12, fill: '#374151' }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnterpriseEngagementTrend;
