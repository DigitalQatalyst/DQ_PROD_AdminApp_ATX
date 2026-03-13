import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import EnterprisesService from '../../../api/analytics/enterprises';

interface AvgCompletionTimeByEnterpriseSizeChartProps {
  globalFilters: {
    year?: string;
    // dateRange removed - always uses year filter
    serviceCategory: string;
    enterpriseSize: string;
    region?: string;
    transactionType: string;
  };
}

const AvgCompletionTimeByEnterpriseSizeChart: React.FC<AvgCompletionTimeByEnterpriseSizeChartProps> = ({ globalFilters }) => {
  const [chartData, setChartData] = useState({
    categories: [] as string[],
    series: [] as Array<{ name: string; data: number[] }>
  });
  const [loading, setLoading] = useState(false);

  /**
   * Unified date resolution function - ALWAYS uses year filter
   * Matches the implementation in parent component for consistency
   */
  const getDateRangeFromFilter = (year?: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    // Always use year filter - default to current year if not provided
    const yearValue = year ? parseInt(year) : currentYear;
    
    // Always use year filter: Jan 1 to Dec 31 of the specified year (or current date if current year)
    let startDate: Date;
    let endDate: Date;
    
    startDate = startOfDay(new Date(yearValue, 0, 1));
    if (yearValue === currentYear) {
      // For current year, use today's date as end date
      endDate = endOfDay(now);
    } else if (yearValue > currentYear) {
      // For future years, use today's date (no future data)
      endDate = endOfDay(now);
    } else {
      // For past years, use Dec 31 of that year
      endDate = endOfDay(new Date(yearValue, 11, 31));
    }

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use unified date resolution - ALWAYS uses year filter
        const { startDate, endDate } = getDateRangeFromFilter(globalFilters.year);
        
        // Apply filters consistently - only include non-'all' values
        const data = await EnterprisesService.getAvgCompletionTimeByEnterpriseSize({
          startDate,
          endDate,
          serviceCategory: globalFilters.serviceCategory !== 'all' ? globalFilters.serviceCategory : undefined,
          enterpriseSize: globalFilters.enterpriseSize !== 'all' ? globalFilters.enterpriseSize : undefined,
          region: globalFilters.region !== 'all' ? globalFilters.region : undefined
        });
        setChartData(data);
      } catch (error) {
        console.error('Failed to load avg completion time by enterprise size:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [globalFilters.year, globalFilters.serviceCategory, globalFilters.enterpriseSize, globalFilters.region]);

  const hasData = chartData.categories.length > 0 && chartData.series.length > 0;

  const option = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          if (param.value > 0) {
            result += `${param.marker} ${param.seriesName}: ${param.value} days<br/>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: chartData.series.map(s => s.name),
      bottom: 0
    },
    grid: {
      left: '80px',
      right: '40px',
      top: '40px',
      bottom: '80px',
      containLabel: false
    },
    xAxis: {
      type: 'category' as const,
      data: chartData.categories,
      name: 'Month',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 500
      },
      axisLabel: {
        color: '#000000',
        fontSize: 11
      },
      axisLine: {
        show: true,
        lineStyle: { color: '#000000', width: 2 },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10]
      },
      axisTick: {
        show: true,
        lineStyle: { color: '#000000' }
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value' as const,
      name: 'Completion Time (days)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 500
      },
      axisLabel: {
        color: '#000000',
        fontSize: 11
      },
      axisLine: {
        show: true,
        lineStyle: { color: '#000000', width: 2 },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10]
      },
      axisTick: {
        show: true,
        lineStyle: { color: '#000000' }
      },
      splitLine: { show: false }
    },
    series: chartData.series.map((s, index) => ({
      name: s.name,
      type: 'bar' as const,
      stack: 'total',
      label: {
        show: true,
        position: 'inside' as const,
        formatter: (params: any) => params.value > 0 ? `${params.value}d` : ''
      },
      data: s.data,
      itemStyle: { color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index] }
    }))
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h5 className="text-lg font-medium text-foreground mb-1">Average Completion Time by Enterprise Size Over Time</h5>
      <p className="text-sm text-muted-foreground mb-4">Service completion duration segmented by enterprise size categories</p>
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm">No data available</p>
          </div>
        </div>
      ) : (
        <ReactECharts
          option={option}
          style={{ height: '300px', width: '100%' }}
        />
      )}
    </div>
  );
};

export default AvgCompletionTimeByEnterpriseSizeChart;