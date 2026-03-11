import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';
import { cn } from '../../../utils/cn';

export interface ClusteredBarChartDataPoint {
  month: string;
  inquiry: number;
  activation: number;
  inquiryCount: number;
  activationCount: number;
}

export interface ClusteredBarChartProps {
  data: ClusteredBarChartDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
}

/**
 * ClusteredBarChart - ShadCN UI styled clustered bar chart component
 * Displays Onboarding % and Activation % side by side with consistent theming
 */
const ClusteredBarChart: React.FC<ClusteredBarChartProps> = ({
  data,
  title = 'Onboarding & Activation',
  description,
  height = 'h-80',
  className,
  showLegend = true,
  showLabels = true,
}) => {
  const months = data.map((item) => item.month);
  const inquiryData = data.map((item) => ({ value: item.inquiry, count: item.inquiryCount }));
  const activationData = data.map((item) => ({ value: item.activation, count: item.activationCount }));

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'item',
      formatter: function (params: any) {
        const month = params.name;
        const seriesName = params.seriesName;
        const value = params.value;
        const count = params.data.count;
        return `${month}<br/>${seriesName}: ${value}% (${count})`;
      },
    },
    legend: showLegend
      ? {
          data: ['Inquiry %', 'Activation %'],
          bottom: 0,
        }
      : undefined,
    xAxis: {
      type: 'category',
      data: months,
      name: 'Month',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: ChartTheme.base.neutralGray,
        fontSize: 12,
        fontWeight: 'bold',
      },
      axisLabel: {
        color: ChartTheme.base.neutralGray,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333333',
          width: 3,
        },
        symbol: ['none', 'arrow'],
        symbolSize: [10, 12],
      },
      axisTick: {
        show: true,
        lineStyle: {
          width: 2,
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Percentage (%)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: ChartTheme.base.neutralGray,
        fontSize: 12,
        fontWeight: 'bold',
      },
      min: 0,
      max: 100,
      position: 'left',
      axisLabel: {
        formatter: '{value}%',
        color: ChartTheme.base.neutralGray,
        inside: false,
      },
      axisLine: {
        show: true,
        onZero: false,
        lineStyle: {
          color: '#333333',
          width: 3,
        },
        symbol: ['none', 'arrow'],
        symbolSize: [10, 12],
      },
      axisTick: {
        show: true,
        inside: false,
        lineStyle: {
          width: 2,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Inquiry %',
        type: 'bar',
        data: inquiryData,
        barWidth: '10%',
        itemStyle: {
          color: ChartTheme.base.primaryBlue,
        },
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                const value = params.value;
                const count = params.data.count;
                return `${value}% (${count})`;
              },
              fontSize: 10,
              color: ChartTheme.base.textAxis,
            }
          : undefined,
      },
      {
        name: 'Activation %',
        type: 'bar',
        data: activationData,
        barWidth: '10%',
        itemStyle: {
          color: ChartTheme.base.secondaryTeal,
        },
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                const value = params.value;
                const count = params.data.count;
                return `${value}% (${count})`;
              },
              fontSize: 10,
              color: ChartTheme.base.textAxis,
            }
          : undefined,
      },
    ],
    grid: {
      left: '10%',
      right: '5%',
      bottom: showLegend ? '20%' : '15%',
      top: '10%',
      containLabel: true,
    },
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default ClusteredBarChart;

