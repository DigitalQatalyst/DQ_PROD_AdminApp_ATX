import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { API_BASE_URL } from '../../../api/analytics/config';

type DailyPoint = { date: string; avgHours: number };

interface AverageResponseTimeChartProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
  granularity?: 'day' | 'week' | 'month';
}

const AverageResponseTimeChart: React.FC<AverageResponseTimeChartProps> = ({ 
  startDate, 
  endDate, 
  serviceCategory = 'all',
  granularity = 'week'
}) => {
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = serviceCategory && serviceCategory !== 'all'
          ? `${API_BASE_URL}/api/analytics/avg-response-time-series?startDate=${startDate}&endDate=${endDate}&serviceCategory=${serviceCategory}&granularity=${granularity}`
          : `${API_BASE_URL}/api/analytics/avg-response-time-series?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          const formattedData = result.data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            avgHours: item.avgResponseTime
          }));
          setDailyData(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch average response time:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory, granularity]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
        <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
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
            label={{ value: 'Response Time (Hours)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#4b5563' } }}
            axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
            tick={{ fill: '#4b5563' }}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
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
          <Line 
            type="monotone" 
            dataKey="avgHours" 
            stroke="#14b8a6" 
            strokeWidth={3}
            dot={{ fill: '#14b8a6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
            name="Avg Response Time (hrs)" 
          >
            <LabelList dataKey="avgHours" position="top" formatter={(v) => `${v.toFixed(1)}h`} style={{ fontSize: 12, fill: '#374151' }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
  );
};

export default AverageResponseTimeChart;


