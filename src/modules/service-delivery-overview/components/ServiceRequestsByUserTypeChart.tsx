import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import EnterprisesService from '../../../api/analytics/enterprises';

interface ServiceRequestsByUserTypeChartProps {
  globalFilters: {
    year?: string;
    // dateRange removed - always uses year filter
    serviceCategory: string;
    enterpriseSize: string;
    region?: string;
    transactionType: string;
  };
}

const ServiceRequestsByUserTypeChart: React.FC<ServiceRequestsByUserTypeChartProps> = ({ globalFilters }) => {
  const [chartData, setChartData] = useState({
    categories: ['2024-01', '2024-02', '2024-03'],
    series: [
      { name: 'New Users', data: [45, 52, 48] },
      { name: 'Repeated Users', data: [78, 85, 92] }
    ]
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
        const data = await EnterprisesService.getServiceRequestsByUserType({
          startDate,
          endDate,
          serviceCategory: globalFilters.serviceCategory !== 'all' ? globalFilters.serviceCategory : undefined,
          enterpriseSize: globalFilters.enterpriseSize !== 'all' ? globalFilters.enterpriseSize : undefined,
          region: globalFilters.region !== 'all' ? globalFilters.region : undefined
        });
        setChartData(data);
      } catch (error) {
        console.error('Failed to load service requests by user type:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [globalFilters.year, globalFilters.serviceCategory, globalFilters.enterpriseSize, globalFilters.region]);

  const option = {
    tooltip: {
      trigger: 'axis'
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
      type: 'category',
      boundaryGap: false,
      data: chartData.categories,
      name: 'Month',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 500
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      },
      axisLine: {
        show: true,
        lineStyle: { color: '#9ca3af', width: 1 },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10]
      },
      axisTick: {
        show: true,
        lineStyle: { color: '#9ca3af' }
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Service Requests',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 500
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      },
      axisLine: {
        show: true,
        lineStyle: { color: '#9ca3af', width: 1 },
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10]
      },
      axisTick: {
        show: true,
        lineStyle: { color: '#9ca3af' }
      },
      splitLine: { show: false },
      max: function(value) { return value.max * 1.1; }
    },
    series: chartData.series.map(s => ({
      name: s.name,
      type: 'line',
      smooth: true,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      },
      data: s.data,
      itemStyle: { color: s.name === 'New Users' ? '#3b82f6' : '#10b981' }
    }))
  };

  return (
    <div className="mb-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <h5 className="text-lg font-medium text-foreground mb-1">Service Requests by New vs Repeated Users Over Time</h5>
        <p className="text-sm text-muted-foreground mb-4">
          Comparison of new enterprise requests versus repeat customer activity
        </p>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: '300px', width: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceRequestsByUserTypeChart;