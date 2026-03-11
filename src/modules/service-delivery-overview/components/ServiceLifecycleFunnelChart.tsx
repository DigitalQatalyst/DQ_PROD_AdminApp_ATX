import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, Cell, LabelList } from 'recharts';
import { API_BASE_URL } from '../../../api/analytics/config';

type LifecycleStage = {
  name: string;
  value: number;
  fill: string;
  description?: string;
};

interface ServiceLifecycleFunnelChartProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

const ServiceLifecycleFunnelChart: React.FC<ServiceLifecycleFunnelChartProps> = ({ startDate, endDate, serviceCategory = 'all' }) => {
  const [lifecycleData, setLifecycleData] = useState<LifecycleStage[]>([]);
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
          const colors = ['#93c5fd', '#60a5fa', '#3b82f6', '#10b981'];
          const descriptions = [
            'Total requests initiated',
            'Requests currently being processed',
            'Requests completed by providers',
            'Requests delivered to enterprises'
          ];
          setLifecycleData(result.data.map((item: any, index: number) => ({
            name: item.stage,
            value: item.value,
            fill: colors[index],
            description: descriptions[index]
          })));
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
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!lifecycleData || lifecycleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0]?.payload as LifecycleStage;
      return (
        <div className="bg-white p-3 border border-border rounded-md shadow-sm">
          <div className="text-sm font-semibold text-card-foreground">{d?.name}</div>
          {d?.description && (
            <div className="text-xs text-muted-foreground mb-1">{d?.description}</div>
          )}
          <div className="text-base font-bold text-primary">{d?.value?.toLocaleString()}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
        <FunnelChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <Tooltip content={renderTooltip} />
          <Funnel dataKey="value" data={lifecycleData} isAnimationActive animationDuration={700}>
            {lifecycleData.map((s, i) => (
              <Cell key={`stage-${i}`} fill={s.fill} />
            ))}
            <LabelList 
              dataKey="name" 
              position="right" 
              offset={10}
              style={{ fontSize: 16, fill: '#000', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }} 
            />
            <LabelList 
              dataKey="value" 
              position="center" 
              formatter={(v) => v?.toLocaleString?.() || v}
              style={{ fontSize: 16, fill: '#000', fontWeight: 700, fontFamily: 'system-ui, -apple-system, sans-serif' }} 
            />
          </Funnel>
          <text x="50%" y="95%" textAnchor="middle" style={{ fontSize: '12px', fill: '#0a0b0c' }}>Service Lifecycle Stage</text>
        </FunnelChart>
      </ResponsiveContainer>
  );
};

export default ServiceLifecycleFunnelChart;


