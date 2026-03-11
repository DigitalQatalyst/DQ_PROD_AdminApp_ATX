import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Bar } from 'recharts';
import Icon from '../../../components/ui/AppIcon';
import Select from '../../../components/ui/Select';

const StageCycleTimeChart = ({ serviceCategory = 'all', partnerType = 'all' }) => {
  const [partnerFilter, setPartnerFilter] = useState('all');

  // Stage cycle-time data with box plot statistics (in days)
  const stageCycleData = [
    {
      stage: 'Request',
      min: 0.1,
      q1: 0.3,
      median: 0.5,
      q3: 0.8,
      max: 1.2,
      mean: 0.6,
      outliers: [1.5, 1.8],
      description: 'Time from service request submission to initial acknowledgment',
      sampleSize: 3420,
      // Partner type breakdown for filtering
      financial: { min: 0.2, q1: 0.4, median: 0.6, q3: 0.9, max: 1.3, mean: 0.7 },
      capability: { min: 0.1, q1: 0.2, median: 0.4, q3: 0.7, max: 1.1, mean: 0.5 }
    },
    {
      stage: 'Screening',
      min: 1.2,
      q1: 2.1,
      median: 3.2,
      q3: 4.8,
      max: 6.5,
      mean: 3.4,
      outliers: [8.2, 9.1, 12.3],
      description: 'Partner assessment and eligibility verification process',
      sampleSize: 3285,
      financial: { min: 2.1, q1: 3.2, median: 4.5, q3: 6.1, max: 8.2, mean: 4.8 },
      capability: { min: 0.8, q1: 1.5, median: 2.1, q3: 3.2, max: 4.8, mean: 2.4 }
    },
    {
      stage: 'Delivery',
      min: 3.5,
      q1: 5.8,
      median: 8.2,
      q3: 12.1,
      max: 18.5,
      mean: 9.1,
      outliers: [22.3, 25.7, 31.2],
      description: 'Active service delivery and implementation phase',
      sampleSize: 2934,
      financial: { min: 5.2, q1: 8.1, median: 12.3, q3: 16.8, max: 24.1, mean: 13.2 },
      capability: { min: 2.1, q1: 3.8, median: 5.5, q3: 8.2, max: 12.8, mean: 6.1 }
    },
    {
      stage: 'Follow-up',
      min: 0.5,
      q1: 1.2,
      median: 2.1,
      q3: 3.5,
      max: 5.2,
      mean: 2.4,
      outliers: [6.8, 8.1],
      description: 'Post-delivery support and satisfaction confirmation',
      sampleSize: 2789,
      financial: { min: 0.8, q1: 1.5, median: 2.5, q3: 4.1, max: 6.2, mean: 2.9 },
      capability: { min: 0.3, q1: 0.8, median: 1.5, q3: 2.8, max: 4.1, mean: 1.8 }
    }
  ];

  const partnerFilterOptions = [
    { value: 'all', label: 'All Partners' },
    { value: 'financial', label: 'Financial Partners' },
    { value: 'capability', label: 'Capability Partners' }
  ];

  // Get filtered data based on partner type
  const getFilteredData = () => {
    if (partnerFilter === 'all') {
      return stageCycleData;
    }

    return stageCycleData?.map(stage => ({
      ...stage,
      ...stage?.[partnerFilter],
      originalData: {
        min: stage?.min,
        q1: stage?.q1,
        median: stage?.median,
        q3: stage?.q3,
        max: stage?.max,
        mean: stage?.mean
      }
    }));
  };

  const filteredData = getFilteredData();

  // Transform data for chart rendering - create box plot using bars
  const chartData = filteredData?.map(stage => ({
    name: stage?.stage,
    median: stage?.median,
    q1: stage?.q1,
    q3: stage?.q3,
    min: stage?.min,
    max: stage?.max,
    mean: stage?.mean,
    iqr: stage?.q3 - stage?.q1, // IQR for bar height
    lowerWhisker: stage?.q1 - stage?.min, // Lower whisker
    upperWhisker: stage?.max - stage?.q3, // Upper whisker
    outliers: stage?.outliers || [],
    description: stage?.description,
    sampleSize: stage?.sampleSize
  }));

  // Custom shape for rendering box plot elements
  const CustomBoxPlot = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const centerX = x + width / 2;
    const boxWidth = width * 0.6;
    const boxLeft = centerX - boxWidth / 2;
    
    return (
      <g>
        {/* Whiskers - vertical lines */}
        <line
          x1={centerX}
          y1={y - (payload?.upperWhisker || 0) * 8} // Scale factor for visibility
          x2={centerX}
          y2={y}
          stroke="#0d9488"
          strokeWidth={2}
        />
        <line
          x1={centerX}
          y1={y + height}
          x2={centerX}
          y2={y + height + (payload?.lowerWhisker || 0) * 8}
          stroke="#0d9488"
          strokeWidth={2}
        />
        
        {/* Box (IQR) */}
        <rect
          x={boxLeft}
          y={y}
          width={boxWidth}
          height={height}
          fill="#99f6e4"
          stroke="#14b8a6"
          strokeWidth={2}
          rx={2}
        />
        
        {/* Median line */}
        <line
          x1={boxLeft}
          y1={y + height * 0.5}
          x2={boxLeft + boxWidth}
          y2={y + height * 0.5}
          stroke="#0f766e"
          strokeWidth={3}
        />
        
        {/* Mean dot */}
        <circle
          cx={centerX}
          cy={y + height * 0.3}
          r={4}
          fill="#14b8a6"
          stroke="#ffffff"
          strokeWidth={2}
        />
      </g>
    );
  };

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = stageCycleData?.find(d => d?.stage === label);
      const displayData = partnerFilter === 'all' ? data : { ...data, ...data?.[partnerFilter] };
      
      return (
        <div className="bg-white p-4 border border-border rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-card-foreground mb-2">{label} Stage</p>
          <p className="text-xs text-muted-foreground mb-3">{data?.description}</p>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-medium">{displayData?.min}d</span>
              <span className="text-muted-foreground">Q1:</span>
              <span className="font-medium">{displayData?.q1}d</span>
              <span className="text-muted-foreground">Median:</span>
              <span className="font-medium text-primary">{displayData?.median}d</span>
              <span className="text-muted-foreground">Q3:</span>
              <span className="font-medium">{displayData?.q3}d</span>
              <span className="text-muted-foreground">Max:</span>
              <span className="font-medium">{displayData?.max}d</span>
              <span className="text-red-600">Mean:</span>
              <span className="font-medium text-red-600">{displayData?.mean}d</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sample Size:</span>
              <span>{data?.sampleSize?.toLocaleString()}</span>
            </div>
            {data?.outliers?.length > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Outliers:</span>
                <span>{data?.outliers?.length} detected</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getBottleneckAnalysis = () => {
    const deliveryStage = filteredData?.find(s => s?.stage === 'Delivery');
    const screeningStage = filteredData?.find(s => s?.stage === 'Screening');
    
    let bottleneck = 'None identified';
    let bottleneckColor = 'text-green-600';
    
    if (deliveryStage?.median > 15) {
      bottleneck = 'Delivery Stage (Long Implementation)';
      bottleneckColor = 'text-red-600';
    } else if (screeningStage?.median > 5) {
      bottleneck = 'Screening Stage (Slow Verification)';
      bottleneckColor = 'text-amber-600';
    }
    
    return { bottleneck, bottleneckColor };
  };

  const { bottleneck, bottleneckColor } = getBottleneckAnalysis();

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-card-foreground">Stage Cycle-Time Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Box plots showing median, IQR, and outliers for each service delivery stage
          </p>
        </div>
        
        {/* Partner Filter */}
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={14} className="text-muted-foreground" />
          <Select
            value={partnerFilter}
            onChange={setPartnerFilter}
            options={partnerFilterOptions}
            className="min-w-36"
          />
        </div>
      </div>

      {/* Box Plot Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[0, 35]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={renderCustomTooltip} />

            {/* Use Bar to represent IQR box */}
            <Bar
              dataKey="iqr"
              fill="#99f6e4"
              stroke="#14b8a6"
              strokeWidth={2}
              shape={CustomBoxPlot}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Simplified Visual Legend with actual colored elements */}
      <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-teal-200 border border-teal-500 rounded-sm"></div>
          <span>IQR (25th-75th percentile)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-700"></div>
          <span>Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          <span>Mean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-600"></div>
          <span>Whiskers (Min/Max)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500 border-dashed"></div>
          <span>Target SLA (8 days)</span>
        </div>
      </div>

      {/* Bottleneck Analysis */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" size={16} className="text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-card-foreground mb-1">Bottleneck Analysis</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current bottleneck:</span>
              <span className={`text-sm font-medium ${bottleneckColor}`}>{bottleneck}</span>
            </div>
            {partnerFilter !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2">
                Analysis filtered for {partnerFilterOptions?.find(opt => opt?.value === partnerFilter)?.label}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={14} />
          <span>Avg total cycle time: 14.3 days</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="TrendingDown" size={14} />
          <span>-2.1 days vs last month</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Target" size={14} />
          <span>78% within SLA targets</span>
        </div>
      </div>
    </div>
  );
};

export default StageCycleTimeChart;