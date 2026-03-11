import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";
import Icon from "../../../components/ui/AppIcon";
import Button from "../../../components/ui/ButtonComponent";

const ServiceVolumeChart = ({
  timePeriod = "week",
  serviceCategory = "all",
  partnerType = "all",
}) => {
  const [chartView, setChartView] = useState("volume"); // volume, efficiency, comparison

  // Mock data for partner service delivery volume
  const volumeData = [
    {
      period: "Jan",
      financialServices: 485,
      nonFinancialServices: 342,
      total: 827,
      slaCompliance: 94.2,
      avgProcessingTime: 4.1,
      partnerEfficiency: 87.3,
    },
    {
      period: "Feb",
      financialServices: 523,
      nonFinancialServices: 389,
      total: 912,
      slaCompliance: 95.1,
      avgProcessingTime: 3.8,
      partnerEfficiency: 89.1,
    },
    {
      period: "Mar",
      financialServices: 612,
      nonFinancialServices: 445,
      total: 1057,
      slaCompliance: 93.8,
      avgProcessingTime: 4.3,
      partnerEfficiency: 86.7,
    },
    {
      period: "Apr",
      financialServices: 578,
      nonFinancialServices: 467,
      total: 1045,
      slaCompliance: 96.4,
      avgProcessingTime: 3.5,
      partnerEfficiency: 91.2,
    },
    {
      period: "May",
      financialServices: 641,
      nonFinancialServices: 523,
      total: 1164,
      slaCompliance: 97.1,
      avgProcessingTime: 3.2,
      partnerEfficiency: 93.8,
    },
    {
      period: "Jun",
      financialServices: 695,
      nonFinancialServices: 578,
      total: 1273,
      slaCompliance: 96.8,
      avgProcessingTime: 3.4,
      partnerEfficiency: 92.5,
    },
  ];

  // Partner performance comparison data
  const partnerComparisonData = [
    {
      partner: "ADCB",
      type: "Financial",
      services: 127,
      efficiency: 98.5,
      satisfaction: 4.8,
    },
    {
      partner: "Flat6Labs",
      type: "Capability",
      services: 89,
      efficiency: 97.8,
      satisfaction: 4.7,
    },
    {
      partner: "ADCCI",
      type: "Capability",
      services: 156,
      efficiency: 96.9,
      satisfaction: 4.6,
    },
    {
      partner: "FAB",
      type: "Financial",
      services: 134,
      efficiency: 95.2,
      satisfaction: 4.5,
    },
    {
      partner: "AUB",
      type: "Capability",
      services: 78,
      efficiency: 94.6,
      satisfaction: 4.4,
    },
    {
      partner: "RAKBANK",
      type: "Financial",
      services: 92,
      efficiency: 93.8,
      satisfaction: 4.3,
    },
  ];

  const formatTooltipValue = (value, name) => {
    if (name === "slaCompliance" || name === "partnerEfficiency") {
      return [
        `${value}%`,
        name
          ?.replace(/([A-Z])/g, " $1")
          ?.replace(/^./, (str) => str?.toUpperCase()),
      ];
    }
    if (name === "avgProcessingTime") {
      return [`${value} days`, "Avg Processing Time"];
    }
    return [
      value?.toLocaleString(),
      name
        ?.replace(/([A-Z])/g, " $1")
        ?.replace(/^./, (str) => str?.toUpperCase()),
    ];
  };

  const getPartnerTypeColor = (type) => {
    return type === "Financial" ? "#10b981" : "#3b82f6";
  };

  const renderVolumeChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={volumeData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="financialGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="nonFinancialGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => value?.toLocaleString()}
        />
        <Tooltip
          formatter={formatTooltipValue}
          labelStyle={{ color: "#374151", fontWeight: "bold" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Area
          type="monotone"
          dataKey="financialServices"
          stackId="1"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#financialGradient)"
          name="Financial Services"
        >
          <LabelList
            dataKey="financialServices"
            position="top"
            style={{ fontSize: 12, fill: "#374151" }}
          />
        </Area>
        <Area
          type="monotone"
          dataKey="nonFinancialServices"
          stackId="1"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#nonFinancialGradient)"
          name="Non-Financial Services"
        >
          <LabelList
            dataKey="nonFinancialServices"
            position="top"
            style={{ fontSize: 12, fill: "#374151" }}
          />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderEfficiencyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={volumeData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} domain={[80, 100]} />
        <Tooltip
          formatter={formatTooltipValue}
          labelStyle={{ color: "#374151", fontWeight: "bold" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Line
          type="monotone"
          dataKey="slaCompliance"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ r: 6, fill: "#10b981" }}
          name="SLA Compliance"
        >
          <LabelList
            dataKey="slaCompliance"
            position="top"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 12, fill: "#374151" }}
          />
        </Line>
        <Line
          type="monotone"
          dataKey="partnerEfficiency"
          stroke="#f59e0b"
          strokeWidth={3}
          dot={{ r: 6, fill: "#f59e0b" }}
          name="Partner Efficiency"
        >
          <LabelList
            dataKey="partnerEfficiency"
            position="top"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 12, fill: "#374151" }}
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );

  const renderComparisonChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={partnerComparisonData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="partner"
          stroke="#6b7280"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          formatter={(value, name) => [
            name === "efficiency"
              ? `${value}%`
              : name === "satisfaction"
                ? `${value}/5.0`
                : value?.toLocaleString(),
            name?.charAt(0)?.toUpperCase() + name?.slice(1),
          ]}
          labelStyle={{ color: "#374151", fontWeight: "bold" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Bar dataKey="efficiency" name="Efficiency Score">
          {partnerComparisonData?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getPartnerTypeColor(entry?.type)}
            />
          ))}
          <LabelList
            dataKey="efficiency"
            position="top"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 12, fill: "#374151" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const getChartTitle = () => {
    switch (chartView) {
      case "volume":
        return "Service Provider Delivery Volume";
      case "efficiency":
        return "Partner Performance Metrics";
      case "comparison":
        return "Top Partner Performance Comparison";
      default:
        return "Service Analytics";
    }
  };

  const getChartDescription = () => {
    switch (chartView) {
      case "volume":
        return "Monthly service delivery volume across financial and non-financial partners";
      case "efficiency":
        return "SLA compliance and efficiency trends across partner network";
      case "comparison":
        return "Comparative performance analysis of top-performing partners";
      default:
        return "Service delivery analytics";
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-card-foreground truncate">
            {getChartTitle()}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {getChartDescription()}
          </p>
        </div>

        {/* Chart View Controls */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg overflow-x-auto scrollbar-hide">
          <Button
            variant={chartView === "volume" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartView("volume")}
            className="px-3 py-1 text-xs whitespace-nowrap"
          >
            Volume
          </Button>
          <Button
            variant={chartView === "efficiency" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartView("efficiency")}
            className="px-3 py-1 text-xs whitespace-nowrap"
          >
            Efficiency
          </Button>
          <Button
            variant={chartView === "comparison" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartView("comparison")}
            className="px-3 py-1 text-xs whitespace-nowrap"
          >
            Partners
          </Button>
        </div>
      </div>

      {/* Chart Legend and Stats with Horizontal Scroll - MOVED TO TOP */}
      <div className="overflow-x-auto scrollbar-hide mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border min-w-fit">
          {chartView === "volume" && (
            <div className="flex items-center gap-6 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">
                  Financial Services
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">
                  Non-Financial Services
                </span>
              </div>
            </div>
          )}

          {chartView === "efficiency" && (
            <div className="flex items-center gap-6 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">
                  SLA Compliance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">
                  Partner Efficiency
                </span>
              </div>
            </div>
          )}

          {chartView === "comparison" && (
            <div className="flex items-center gap-6 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">
                  Financial Partners
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">
                  Capability Partners
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={14} className="flex-shrink-0" />
              <span>+12.3% vs last period</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Users" size={14} className="flex-shrink-0" />
              <span>247 active partners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Content with Scroll */}
      <div className="overflow-hidden">
        <div className="min-h-[400px] overflow-x-auto scrollbar-hide">
          {chartView === "volume" && renderVolumeChart()}
          {chartView === "efficiency" && renderEfficiencyChart()}
          {chartView === "comparison" && renderComparisonChart()}
        </div>
      </div>
    </div>
  );
};

export default ServiceVolumeChart;
