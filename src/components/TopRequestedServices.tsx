import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell } from 'recharts';
import { API_BASE_URL } from '../api/analytics/config';

interface TopRequestedServicesProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
  topN?: number;
}

interface ServiceData {
  service: string;
  total: number;
}

const TopRequestedServices: React.FC<TopRequestedServicesProps> = ({ 
  startDate, 
  endDate, 
  serviceCategory = 'all',
  topN = 10 
}) => {
  const [data, setData] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  console.log('[TopRequestedServices] Component props:', { startDate, endDate, serviceCategory, topN });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If 'all', fetch both financial and non-financial and combine
        if (serviceCategory === 'all') {
          const params1 = new URLSearchParams();
          params1.append('startDate', startDate);
          params1.append('endDate', endDate);
          params1.append('topN', topN.toString());
          params1.append('serviceCategory', 'financial');
          
          const params2 = new URLSearchParams();
          params2.append('startDate', startDate);
          params2.append('endDate', endDate);
          params2.append('topN', topN.toString());
          params2.append('serviceCategory', 'non-financial');
          
          const [response1, response2] = await Promise.all([
            fetch(`${API_BASE_URL}/api/analytics/top-requested-services?${params1.toString()}`),
            fetch(`${API_BASE_URL}/api/analytics/top-requested-services?${params2.toString()}`)
          ]);
          
          const [result1, result2] = await Promise.all([response1.json(), response2.json()]);
          
          // Combine and aggregate results
          const combined = new Map<string, number>();
          
          if (result1.success && result1.data) {
            result1.data.forEach((item: ServiceData) => {
              combined.set(item.service, (combined.get(item.service) || 0) + item.total);
            });
          }
          
          if (result2.success && result2.data) {
            result2.data.forEach((item: ServiceData) => {
              combined.set(item.service, (combined.get(item.service) || 0) + item.total);
            });
          }
          
          const aggregated = Array.from(combined.entries())
            .map(([service, total]) => ({ service, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, topN);
          
          setData(aggregated);
        } else {
          // Single category fetch
          const params = new URLSearchParams();
          params.append('startDate', startDate);
          params.append('endDate', endDate);
          params.append('topN', topN.toString());
          params.append('serviceCategory', serviceCategory || 'all');
          
          const url = `${API_BASE_URL}/api/analytics/top-requested-services?${params.toString()}`;
          console.log('[TopRequestedServices] Fetching from:', url);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error('[TopRequestedServices] Error response:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('[TopRequestedServices] Error body:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log('[TopRequestedServices] Response:', result);
          
          if (result.success && result.data) {
            console.log('[TopRequestedServices] Setting data:', result.data);
            setData(result.data);
          } else {
            console.warn('[TopRequestedServices] Response not successful or missing data:', result);
            setData([]);
          }
        }
      } catch (error) {
        console.error('[TopRequestedServices] Failed to fetch top requested services:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    } else {
      console.warn('[TopRequestedServices] Missing startDate or endDate:', { startDate, endDate });
      setLoading(false);
      setData([]);
    }
  }, [startDate, endDate, serviceCategory, topN]);

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
          <h4 className="text-base font-medium text-foreground">Top Requested Services</h4>
          <p className="text-xs text-muted-foreground">Most requested services across the marketplace</p>
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
        <h4 className="text-base font-medium text-foreground">Top Requested Services</h4>
        <p className="text-xs text-muted-foreground">Most requested services across the marketplace</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis 
            type="number" 
            stroke="#4b5563" 
            style={{ fontSize: '12px' }} 
            axisLine={{ stroke: '#4b5563' }} 
            tickLine={false} 
            tickFormatter={(v) => v?.toLocaleString()} 
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]} 
            label={{ value: 'Number of Requests', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#4b5563', fontWeight: 500 } }}
          />
          <YAxis 
            type="category" 
            dataKey="service" 
            stroke="#4b5563" 
            style={{ fontSize: '12px' }} 
            width={140} 
            tickLine={false} 
            angle={-15}
            tickFormatter={(v) => (v?.length > 18 ? v.slice(0, 18) + '…' : v)} 
            label={{ value: 'Service Name', angle: -90, position: 'insideLeft', offset: 50, style: { fontSize: '12px', fill: '#4b5563', fontWeight: 500 } }}
          />
          <Tooltip formatter={(v: any) => [v?.toLocaleString(), 'Requests']} contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }} cursor={false} />
          <Bar dataKey="total" name="Requests" radius={[0, 12, 12, 0]} onClick={(data, index) => setSelectedIndex(selectedIndex === index ? null : index)} cursor="pointer">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={selectedIndex === null || selectedIndex === index ? '#3b82f6' : '#d1d5db'}
                stroke={selectedIndex === index ? '#000' : 'none'}
                strokeWidth={selectedIndex === index ? 2 : 0}
              />
            ))}
            <LabelList dataKey="total" position="right" style={{ fontSize: 12, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopRequestedServices;
