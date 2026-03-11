import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import EnterprisesService from '../api/analytics/enterprises';

interface EnterpriseDistributionByBusinessSizeProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

const EnterpriseDistributionByBusinessSize: React.FC<EnterpriseDistributionByBusinessSizeProps> = ({
  startDate,
  endDate,
  serviceCategory
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await EnterprisesService.getEnterpriseDistributionByBusinessSize({
          startDate,
          endDate,
          serviceCategory
        });
        console.log('Fetched result:', result);
        console.log('Result type:', typeof result);
        console.log('Is array:', Array.isArray(result));
        console.log('Result length:', result?.length);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch enterprise distribution by business size:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Distribution by Business Size</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        let total = 0;
        params.forEach((param: any) => {
          total += param.value;
          result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
        });
        result += `<strong>Total: ${total}</strong>`;
        return result;
      }
    },
    legend: {
      data: ['B2B', 'B2C', 'B2G', 'Hybrid'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((item: any) => item.businessSize)
    },
    yAxis: {
      type: 'value',
      name: 'Number of Enterprises'
    },
    series: [
      {
        name: 'B2B',
        type: 'bar',
        stack: 'total',
        data: data.map((item: any) => item.B2B || 0),
        itemStyle: { color: '#3b82f6' },
        label: { show: false }
      },
      {
        name: 'B2C',
        type: 'bar',
        stack: 'total',
        data: data.map((item: any) => item.B2C || 0),
        itemStyle: { color: '#10b981' },
        label: { show: false }
      },
      {
        name: 'B2G',
        type: 'bar',
        stack: 'total',
        data: data.map((item: any) => item.B2G || 0),
        itemStyle: { color: '#f59e0b' },
        label: { show: false }
      },
      {
        name: 'Hybrid',
        type: 'bar',
        stack: 'total',
        data: data.map((item: any) => item.Hybrid || 0),
        itemStyle: { color: '#ef4444' },
        label: { show: false }
      }
    ]
  };

  console.log('Rendering with data:', data);
  console.log('Data length:', data?.length);
  console.log('Chart option:', option);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Distribution by Business Size</h3>
      
      {!data || data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available (length: {data?.length})
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: '400px' }} notMerge={true} lazyUpdate={true} />
      )}
    </div>
  );
};

export default EnterpriseDistributionByBusinessSize;