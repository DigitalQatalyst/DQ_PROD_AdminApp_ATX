import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface StackedBarChartDataPoint {
  month: string;
  repeatUsers: number;
  firstTimeUsers: number;
}

export interface StackedBarChartProps {
  data: StackedBarChartDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  ariaDescription?: string;
}

/**
 * StackedBarChart - ShadCN UI styled stacked bar chart
 * Shows first-time vs repeat users per month with consistent theming
 */
const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  title = 'Repeat Usage Rate',
  description,
  height = 'h-80',
  className,
  showLegend = true,
  showLabels = true,
  ariaDescription = 'Stacked bars showing monthly first-time and repeat users, total usage, and proportion of repeats.',
}) => {
  const months = data.map((item) => item.month);
  const repeatData = data.map((item) => item.repeatUsers);
  const firstTimeData = data.map((item) => item.firstTimeUsers);

  const option = {
    ...ChartTheme.getEChartsOption(),
    aria: {
      enabled: true,
      label: {
        description: ariaDescription,
      },
    },
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        const month = params[0].axisValue;
        const repeat = params.find((p: any) => p.seriesName === 'Repeat Users');
        const firstTime = params.find((p: any) => p.seriesName === 'First-Time Users');
        const total = repeat?.value + firstTime?.value;
        const repeatPct = ((repeat?.value / total) * 100).toFixed(1);
        return `${month}<br/>
          Total: ${total} enterprises<br/>
          Repeat Users: ${repeat?.value} (${repeatPct}%)<br/>
          First-Time Users: ${firstTime?.value}`;
      },
    },
    legend: showLegend
      ? {
          data: ['Repeat Users', 'First-Time Users'],
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
      name: 'Number of Enterprises',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: ChartTheme.base.neutralGray,
        fontSize: 12,
        fontWeight: 'bold',
      },
      position: 'left',
      axisLabel: {
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
        name: 'Repeat Users',
        type: 'bar',
        stack: 'usage',
        data: repeatData,
        barWidth: '10%',
        itemStyle: {
          color: ChartTheme.base.secondaryTeal,
        },
        label: showLabels
          ? {
              show: true,
              position: 'inside',
              formatter: '{c}',
              fontSize: 10,
              color: '#ffffff',
            }
          : undefined,
      },
      {
        name: 'First-Time Users',
        type: 'bar',
        stack: 'usage',
        data: firstTimeData,
        barWidth: '10%',
        itemStyle: {
          color: ChartTheme.base.primaryBlue,
        },
        label: showLabels
          ? {
              show: true,
              position: 'inside',
              formatter: '{c}',
              fontSize: 10,
              color: '#ffffff',
            }
          : undefined,
      },
    ],
    grid: {
      left: '12%',
      right: '4%',
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

export default StackedBarChart;

