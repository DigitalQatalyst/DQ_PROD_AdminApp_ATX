import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { API_BASE_URL } from '../api/analytics/config';

interface SatisfactionScoreOverTimeProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

interface MonthlyData {
  month: string;
  satisfactionScore: number;
  repeatUsageRate: number;
  activeEnterprises: number;
  repeatedEnterprises: number;
}

const SatisfactionScoreOverTime: React.FC<SatisfactionScoreOverTimeProps> = ({
  startDate,
  endDate,
  serviceCategory = 'all'
}) => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching satisfaction score with:', { startDate, endDate, serviceCategory });
        const response = await fetch(
          `${API_BASE_URL}/api/analytics/satisfaction-score-over-time?startDate=${startDate}&endDate=${endDate}&serviceCategory=${serviceCategory}`
        );
        const result = await response.json();
        console.log('Satisfaction score API response:', result);
        if (result.success && result.data) {
          setData(result.data);
          console.log('Data set to:', result.data);
        } else {
          console.error('API returned success=false or no data:', result);
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch satisfaction score over time:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory]);

  const chartOptions = {
    title: {
      text: 'Satisfaction Score Over Time',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        const monthData = data.data;
        return `
          <strong>${data.name}</strong><br/>
          Satisfaction Score: ${monthData.satisfactionScore}/5.0<br/>
          Repeat Usage Rate: ${monthData.repeatUsageRate}%<br/>
          Active Enterprises: ${monthData.activeEnterprises}<br/>
          Repeated Enterprises: ${monthData.repeatedEnterprises}
        `;
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.month),
      axisLabel: { 
        rotate: 45,
        color: '#666'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333',
          width: 2
        },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10]
      },
      axisTick: {
        show: true,
        lineStyle: {
          width: 2
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Score',
      min: 0,
      max: 5,
      axisLabel: { 
        formatter: '{value}',
        color: '#666'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333',
          width: 2
        },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10]
      },
      axisTick: {
        show: true,
        lineStyle: {
          width: 2
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Satisfaction Score',
        type: 'line',
        data: data.map(d => ({
          value: d.satisfactionScore,
          satisfactionScore: d.satisfactionScore,
          repeatUsageRate: d.repeatUsageRate,
          activeEnterprises: d.activeEnterprises,
          repeatedEnterprises: d.repeatedEnterprises
        })),
        smooth: true,
        lineStyle: { width: 3, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        },
        markLine: {
          data: [
            { yAxis: 4, name: 'Strong Satisfaction', lineStyle: { color: '#10b981', type: 'dashed' } },
            { yAxis: 3, name: 'Average', lineStyle: { color: '#f59e0b', type: 'dashed' } }
          ],
          label: { position: 'end', formatter: '{b}' }
        }
      }
    ],
    grid: { left: '10%', right: '10%', bottom: '15%', top: '15%' }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Satisfaction Score Over Time</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p>No data available for the selected period</p>
            <p className="text-sm mt-2">Try adjusting your date range or filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Behavior-based satisfaction score derived from enterprise repeat usage patterns. 
          Higher scores indicate stronger satisfaction and trust.
        </p>
      </div>
      <ReactECharts option={chartOptions} style={{ height: '400px' }} />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="font-semibold text-blue-600">Current Score</div>
          <div className="text-2xl font-bold">{data[data.length - 1]?.satisfactionScore || 'N/A'}</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="font-semibold text-green-600">Repeat Rate</div>
          <div className="text-2xl font-bold">{data[data.length - 1]?.repeatUsageRate || 'N/A'}%</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <div className="font-semibold text-purple-600">Active</div>
          <div className="text-2xl font-bold">{data[data.length - 1]?.activeEnterprises || 'N/A'}</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded">
          <div className="font-semibold text-orange-600">Repeated</div>
          <div className="text-2xl font-bold">{data[data.length - 1]?.repeatedEnterprises || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionScoreOverTime;
