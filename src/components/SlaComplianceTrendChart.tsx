import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Line } from 'recharts';
import { API_BASE_URL } from '../api/analytics/config';

interface SlaComplianceTrendChartProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
  granularity?: 'week' | 'month';
}

interface CompliancePoint {
  date: string;
  compliance: number;
  target: number;
}

const SlaComplianceTrendChart: React.FC<SlaComplianceTrendChartProps> = ({ 
  startDate, 
  endDate, 
  serviceCategory = 'all',
  granularity = 'month'
}) => {
  const [data, setData] = useState<CompliancePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = serviceCategory && serviceCategory !== 'all'
          ? `${API_BASE_URL}/api/analytics/sla-compliance-trend-series?startDate=${startDate}&endDate=${endDate}&serviceCategory=${serviceCategory}&granularity=${granularity}`
          : `${API_BASE_URL}/api/analytics/sla-compliance-trend-series?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          const formattedData = result.data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            compliance: item.compliance,
            target: item.target
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch SLA compliance trend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory, granularity]);

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
          <h4 className="text-base font-medium text-foreground">SLA Compliance Trend</h4>
          <p className="text-xs text-muted-foreground">Monthly SLA compliance rate showing adherence to service level agreements</p>
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
        <h4 className="text-base font-medium text-foreground">SLA Compliance Trend</h4>
        <p className="text-xs text-muted-foreground">Monthly SLA compliance rate showing adherence to service level agreements</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#4b5563"
            style={{ fontSize: '12px' }}
            axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
            tick={{ fill: '#4b5563' }}
            label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#4b5563' } }}
          />
          <YAxis 
            stroke="#4b5563"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            label={{ value: 'Compliance Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#4b5563' } }}
            axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
            tick={{ fill: '#4b5563' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: 'none',
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area 
            type="monotone" 
            dataKey="compliance" 
            stroke="#14b8a6" 
            strokeWidth={3}
            fill="url(#colorCompliance)"
            dot={{ fill: '#14b8a6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
            name="SLA Compliance"
          >
            <LabelList dataKey="compliance" position="top" formatter={(v: any) => `${v}%`} style={{ fontSize: 12, fill: '#374151' }} />
          </Area>
          <Line
            type="monotone"
            dataKey="target"
            stroke="#f97316"
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={false}
            name="Target (95%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SlaComplianceTrendChart;
