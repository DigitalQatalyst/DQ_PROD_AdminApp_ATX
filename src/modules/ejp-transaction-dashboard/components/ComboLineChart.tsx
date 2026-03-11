import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface ComboLineChartDataPoint {
  month: string;
  retention: number;
  churn: number;
}

export interface ComboLineChartProps {
  data: ComboLineChartDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  ariaDescription?: string;
}

/**
 * ComboLineChart - ShadCN UI styled dual-axis combo chart
 * Shows Retention Rate and Churn Rate as two independent line series on separate Y-axes
 */
const ComboLineChart: React.FC<ComboLineChartProps> = ({
  data,
  title = 'Churn & Retention Over Time',
  description,
  height = 'h-96',
  className,
  showLegend = true,
  showLabels = true,
  ariaDescription = 'Dual-axis view of monthly churn and retention rates with moving averages.',
}) => {
  const months = data.map((item) => item.month);
  const retentionData = data.map((item) => item.retention);
  const churnData = data.map((item) => item.churn);

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
        type: 'cross',
      },
      formatter: function (params: any) {
        const month = params[0].axisValue;
        const retention = params.find((p: any) => p.seriesName === 'Retention Rate');
        const churn = params.find((p: any) => p.seriesName === 'Churn Rate');
        return `${month}<br/>
          ${retention?.seriesName}: ${retention?.value}%<br/>
          ${churn?.seriesName}: ${churn?.value}%`;
      },
    },
    legend: showLegend
      ? {
          data: ['Retention Rate', 'Churn Rate'],
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
    yAxis: [
      {
        type: 'value',
        name: 'Retention Rate (%)',
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
      {
        type: 'value',
        name: 'Churn Rate (%)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: ChartTheme.base.neutralGray,
          fontSize: 12,
          fontWeight: 'bold',
        },
        min: 0,
        max: 20,
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
          color: ChartTheme.base.neutralGray,
          inside: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Retention Rate',
        type: 'line',
        yAxisIndex: 0,
        data: retentionData,
        lineStyle: {
          color: ChartTheme.performance.excellent,
          width: 3,
        },
        itemStyle: {
          color: ChartTheme.performance.excellent,
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 10,
              color: ChartTheme.base.textAxis,
              fontWeight: 'bold',
            }
          : undefined,
      },
      {
        name: 'Churn Rate',
        type: 'line',
        yAxisIndex: 1,
        data: churnData,
        lineStyle: {
          color: ChartTheme.performance.critical,
          width: 2,
        },
        itemStyle: {
          color: ChartTheme.performance.critical,
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        label: showLabels
          ? {
              show: true,
              position: 'bottom',
              formatter: '{c}%',
              fontSize: 10,
              color: ChartTheme.base.textAxis,
              fontWeight: 'bold',
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

export default ComboLineChart;

