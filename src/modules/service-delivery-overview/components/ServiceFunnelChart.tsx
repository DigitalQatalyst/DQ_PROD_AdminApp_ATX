import React, { useState } from "react";
import {
  FunnelChart,
  Funnel,
  Cell,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  LabelList,
} from "recharts";
import Icon from "../../../components/ui/AppIcon";
import Button from "../../../components/ui/ButtonComponent";

const ServiceFunnelChart = ({
  serviceCategory = "all",
  partnerType = "all",
}) => {
  const [viewMode, setViewMode] = useState("funnel"); // funnel, breakdown

  // Partner service delivery funnel data
  const funnelData = [
    {
      name: "Service Requests Received",
      value: 3420,
      fill: "#99f6e4",
      description:
        "Total service requests from SMEs across all partner categories",
    },
    {
      name: "Partner Assignments",
      value: 3285,
      fill: "#5eead4",
      description:
        "Requests successfully matched and assigned to qualified partners",
    },
    {
      name: "Service Initiation",
      value: 3127,
      fill: "#2dd4bf",
      description: "Partners initiated service delivery process with SMEs",
    },
    {
      name: "In Progress",
      value: 2934,
      fill: "#14b8a6",
      description: "Active service delivery in progress across partner network",
    },
    {
      name: "Quality Review",
      value: 2847,
      fill: "#0d9488",
      description: "Services completed and under quality assurance review",
    },
    {
      name: "Successfully Delivered",
      value: 2789,
      fill: "#0f766e",
      description:
        "Services successfully delivered meeting SLA and quality standards",
    },
  ];

  // Service category breakdown data
  const categoryBreakdownData = [
    {
      name: "Financing & Loans",
      value: 789,
      fill: "#10b981",
      partnerType: "Financial",
      avgSLA: "7.2 days",
      partners: 12,
    },
    {
      name: "Credit Enablement",
      value: 456,
      fill: "#059669",
      partnerType: "Financial",
      avgSLA: "5.8 days",
      partners: 8,
    },
    {
      name: "Advisory & Mentorship",
      value: 634,
      fill: "#3b82f6",
      partnerType: "Capability",
      avgSLA: "2.1 days",
      partners: 18,
    },
    {
      name: "Training & Capacity",
      value: 423,
      fill: "#2563eb",
      partnerType: "Capability",
      avgSLA: "5.3 days",
      partners: 15,
    },
    {
      name: "Market Access",
      value: 287,
      fill: "#1d4ed8",
      partnerType: "Capability",
      avgSLA: "4.7 days",
      partners: 9,
    },
    {
      name: "Equity/Investment",
      value: 123,
      fill: "#1e40af",
      partnerType: "Financial",
      avgSLA: "12.5 days",
      partners: 5,
    },
    {
      name: "Specialist Clinics",
      value: 167,
      fill: "#1e3a8a",
      partnerType: "Capability",
      avgSLA: "1.8 days",
      partners: 22,
    },
  ];

  const calculateConversionRate = (current, previous) => {
    if (!previous) return 100;
    return ((current / previous) * 100)?.toFixed(1);
  };

  const getDropoffRate = (current, previous) => {
    if (!previous) return 0;
    return (((previous - current) / previous) * 100)?.toFixed(1);
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-white p-4 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-card-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {data?.description}
          </p>
          <p className="text-lg font-bold text-primary">
            {data?.value?.toLocaleString()}
          </p>
          {data?.partnerType && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Partner Type: {data?.partnerType}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg SLA: {data?.avgSLA}
              </p>
              <p className="text-xs text-muted-foreground">
                Active Partners: {data?.partners}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderFunnelView = () => (
    <div className="space-y-6">
      {/* Funnel Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Tooltip content={renderCustomTooltip} />
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive
            animationDuration={800}
          >
            {funnelData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry?.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 12, fill: "#374151" }}
              formatter={(v) => v?.toLocaleString?.() || v}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Target" size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-card-foreground">
              Overall Conversion
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">81.5%</span>
            <span className="text-sm text-muted-foreground">
              Request to Delivery
            </span>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Clock" size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-card-foreground">
              Avg Processing Time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">5.2</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="AlertTriangle" size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-card-foreground">
              Drop-off Rate
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">18.5%</span>
            <span className="text-sm text-muted-foreground">
              Total Requests
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBreakdownView = () => (
    <div className="space-y-6">
      {/* Legend moved to top of breakdown view */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-border min-w-fit">
          <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
            Service Categories:
          </span>
          {categoryBreakdownData?.slice(0, 4)?.map((category, index) => (
            <div
              key={index}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category?.fill }}
              ></div>
              <span className="text-xs text-muted-foreground">
                {category?.name}
              </span>
            </div>
          ))}
          {categoryBreakdownData?.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{categoryBreakdownData?.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Service Category Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryBreakdownData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
          >
            {categoryBreakdownData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry?.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="outside"
              style={{ fontSize: 12, fill: "#374151" }}
              formatter={(v) => v?.toLocaleString?.() || v}
            />
          </Pie>
          <Tooltip content={renderCustomTooltip} />
        </PieChart>
      </ResponsiveContainer>

      {/* Service Category Details */}
      <div className="space-y-3">
        {categoryBreakdownData?.map((category, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category?.fill }}
              ></div>
              <div>
                <span className="text-sm font-medium text-card-foreground">
                  {category?.name}
                </span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{category?.partnerType} Partners</span>
                  <span>•</span>
                  <span>{category?.partners} Active</span>
                  <span>•</span>
                  <span>Avg SLA: {category?.avgSLA}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-card-foreground">
                {category?.value?.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">services</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-card-foreground">
            {viewMode === "funnel"
              ? "Partner Service Delivery Funnel"
              : "Service Category Breakdown"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === "funnel"
              ? "End-to-end service delivery flow across partner network"
              : "Distribution of services by category and partner type"}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "funnel" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("funnel")}
            className="px-3 py-1 text-xs"
          >
            Funnel
          </Button>
          <Button
            variant={viewMode === "breakdown" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("breakdown")}
            className="px-3 py-1 text-xs"
          >
            Breakdown
          </Button>
        </div>
      </div>

      {/* Chart Content */}
      {viewMode === "funnel" ? renderFunnelView() : renderBreakdownView()}
    </div>
  );
};

export default ServiceFunnelChart;
