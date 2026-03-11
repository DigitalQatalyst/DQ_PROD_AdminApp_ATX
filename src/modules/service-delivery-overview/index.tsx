/**
 * Service Delivery Overview Dashboard
 *
 * UNIFIED FILTER SYSTEM:
 * ======================
 * This dashboard uses a unified filter system that ALWAYS uses the 'year' filter
 * for consistent date resolution across all tabs and components.
 *
 * Date Filter Logic:
 * - ALWAYS uses year filter (Jan 1 - Dec 31 of that year, or current date if current year)
 * - Date Range filter has been completely removed from the UI
 * - Year filter defaults to current year if not specified
 *
 * Filter Application Pattern:
 * - All filters follow the pattern: `filter !== 'all' ? filter : undefined`
 * - This ensures 'all' values are not sent to APIs, allowing backend to return aggregated data
 *
 * Tabs and Filter Usage:
 * 1. Service Delivery Performance: Uses year, serviceCategory, enterpriseSize, region
 * 2. Service Provider Performance: Uses year, serviceCategory, businessSize (ALL KPIs NOW REACTIVE)
 * 3. Enterprise Usage & Impact: Uses year, serviceCategory, enterpriseSize, region
 *
 * All components now reactively update when filters change, ensuring consistent data aggregation.
 */

import React, { useState, useEffect, useMemo } from "react";
import KPICard from "./components/KPICard";
import ServiceLifecycleFunnelChart from "./components/ServiceLifecycleFunnelChart";
import AverageResponseTimeChart from "./components/AverageResponseTimeChart";
import EfficiencyMatrixHeatmap from "./components/EfficiencyMatrixHeatmap";
import RealTimeAlerts from "./components/RealTimeAlerts";
import ServiceRequestsByUserTypeChart from "./components/ServiceRequestsByUserTypeChart";
import EnterpriseDropOffRateChart from "./components/EnterpriseDropOffRateChart";
import AvgCompletionTimeByEnterpriseSizeChart from "./components/AvgCompletionTimeByEnterpriseSizeChart";
import SatisfactionScoreOverTime from "../../components/SatisfactionScoreOverTime";
import ServiceVolumeTrend from "../../components/ServiceVolumeTrend";
import TopRequestedServices from "../../components/TopRequestedServices";
import EnterpriseEngagementTrend from "../../components/EnterpriseEngagementTrend";
import SlaComplianceTrendChart from "../../components/SlaComplianceTrendChart";
import RiskHeatmapGrid from "./components/RiskHeatmapGrid";
import ServiceDeliveryKPIGrid from "./components/ServiceDeliveryKPIGrid";
import { useServiceDeliveryKPIs } from "./hooks/useServiceDeliveryKPIs";
import { useEnterpriseData } from "./hooks/useEnterpriseData";
import ReactECharts from "echarts-for-react";
import Icon from "../../components/ui/AppIcon";
import Button from "../../components/ui/ButtonComponent";
import Select from "../../components/ui/Select";
import IncidentsService from "../../api/analytics/incidents";
import AccountsService, {
  ProviderBenchmarkData,
} from "../../api/analytics/accounts";
import EnterprisesService from "../../api/analytics/enterprises";
import ServicesService from "../../api/analytics/services";
import { useProviderRetention } from "../../hooks/useProviderRetention";
import {
  getTotalServicesDelivered,
  getServiceDeliveryAvgCompletionTime,
  getSlaComplianceRate,
} from "../../api/analytics/serviceDelivery";
import DataService from "../../backend/lib/dataService";
import { Filters, DateRangeOption } from "../../backend/data/mock";

interface ProviderCompletionTimeData {
  provider: string;
  avgCompletionTime: number;
  target: number;
  fullName?: string;
}
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  LabelList,
} from "recharts";

const MIN_SERVICE_PROVIDER_DATE = new Date("2025-01-01T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const addDaysUtc = (date: Date, days: number) =>
  new Date(date.getTime() + days * DAY_MS);

const clampStartDate = (date: Date) =>
  date.getTime() < MIN_SERVICE_PROVIDER_DATE.getTime()
    ? new Date(MIN_SERVICE_PROVIDER_DATE)
    : date;

// Legacy function kept for backward compatibility - now uses unified date resolution
// This function is deprecated in favor of the unified getDateRangeForFilter(year, dateRange)

/**
 * Unified date resolution function - ALWAYS uses year filter
 * Year filter is the primary and only date filter mechanism
 *
 * @param year - Year filter (e.g., "2025") - REQUIRED, always used
 * @param dateRange - DEPRECATED - kept for backward compatibility but not used
 * @returns Object with startDate, endDate for API calls
 */
const getDateRangeFromFilter = (year?: string, dateRange?: string) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  // Always use year filter - default to current year if not provided
  const yearValue = year ? parseInt(year) : currentYear;

  // Always use year filter: Jan 1 to Dec 31 of the specified year (or current date if current year)
  const startDate = new Date(yearValue, 0, 1).toISOString().split("T")[0];
  let endDate: string;

  if (yearValue === currentYear) {
    // For current year, use today's date as end date
    endDate = now.toISOString().split("T")[0];
  } else if (yearValue > currentYear) {
    // For future years, use today's date (no future data)
    endDate = now.toISOString().split("T")[0];
  } else {
    // For past years, use Dec 31 of that year
    endDate = new Date(yearValue, 11, 31).toISOString().split("T")[0];
  }

  return {
    startDate,
    endDate,
    dateRange: `year-${yearValue}`, // For logging/debugging purposes
  };
};

/**
 * Unified date resolution for ISO format (used by some APIs)
 * Returns ISO date strings with time component
 * Always uses year filter - dateRange parameter is deprecated
 */
const getDateRangeForFilter = (year?: string, dateRange?: string) => {
  const { startDate, endDate } = getDateRangeFromFilter(year, dateRange);
  // Ensure we use full day range: start of day to end of day
  const startOfDay = new Date(startDate + "T00:00:00.000Z").toISOString();
  const endOfDay = new Date(endDate + "T23:59:59.999Z").toISOString();
  return {
    fromDate: startOfDay,
    toDate: endOfDay,
  };
};

const EJPOperationsDashboard = () => {
  // Tab navigation state
  const [activeSegmentTab] = useState("operations-internal");
  const [activeDashboardTab, setActiveDashboardTab] = useState("operations");
  const [activeSecondLayerTab, setActiveSecondLayerTab] = useState(
    "service-delivery-performance",
  );

  // Dynamic dashboard state
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Performance KPI data
  const [performanceKPIs, setPerformanceKPIs] = useState({
    avgResponseTime: {
      value: "2.3",
      unit: "hrs",
      trend: "down",
      trendValue: "-0.5",
    },
    avgCompletionTime: {
      value: "3.8",
      unit: "days",
      trend: "down",
      trendValue: "-0.3",
    },
    slaCompliance: {
      value: "91.2",
      unit: "%",
      trend: "up",
      trendValue: "+1.5%",
    },
  });

  // Provider retention API integration
  const {
    retentionRate: _retentionRate,
    trend: _trend,
    trendValue: _trendValue,
    sparklineData: _sparklineData,
    target: _target,
    loading: retentionLoading,
    error: retentionError,
  } = useProviderRetention();

  // Net New Enterprises data
  const [netNewEnterprisesData, setNetNewEnterprisesData] = useState<{
    netNewEnterprises: number;
    trend: "up" | "down" | "stable";
    trendValue: string;
    target: number;
    enterprises: { id: string; name: string; createdOn: string }[];
  }>({
    netNewEnterprises: 0,
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0%",
    target: 0,
    enterprises: [],
  });

  // Enterprise Activation Rate data
  const [enterpriseActivationRateData, setEnterpriseActivationRateData] =
    useState({
      activationRate: 0,
      eligibleEnterprises: 0,
      activatedEnterprises: 0,
      trend: "stable" as "up" | "down" | "stable",
      trendValue: "0%",
      target: 0,
    });

  // Provider requests data
  const [providerRequestsData, setProviderRequestsData] = useState([]);

  // Provider completion time data
  const [providerCompletionTimeData, setProviderCompletionTimeData] = useState<
    ProviderCompletionTimeData[]
  >([]);

  // Provider SLA breach rate data
  const [providerSlaBreachData, setProviderSlaBreachData] = useState([]);

  // Bar chart selection states
  const [selectedRequestsBarIndex, setSelectedRequestsBarIndex] = useState<number | null>(null);
  const [selectedCompletionBarIndex, setSelectedCompletionBarIndex] = useState<number | null>(null);
  const [selectedSlaBreachBarIndex, setSelectedSlaBreachBarIndex] = useState<number | null>(null);
  const [selectedPendingRequestsBarIndex, setSelectedPendingRequestsBarIndex] = useState<number | null>(null);

  // SLA compliance trend data
  const [slaComplianceTrendData, setSlaComplianceTrendData] = useState([]);
  // Provider retention KPI data
  const [providerRetentionKpi, setProviderRetentionKpi] = useState({
    retentionRate: 0,
    trend: "stable",
    trendValue: "0%",
    sparklineData: [],
    target: 0,
  });
  // Core state management
  const [globalFilters, setGlobalFilters] = useState<
    Filters & {
      year: string;
      businessSize: string;
      enterpriseSize: string;
      transactionType: string;
    }
  >({
    year: new Date().getFullYear().toString(),
    dateRange: "this-year" as DateRangeOption,
    serviceCategory: "all",
    businessSize: "all",
    enterpriseSize: "all",
    transactionType: "all",
    subServiceType: "all",
    region: "all",
  });

  /**
   * Resolved filters with unified date resolution
   * ALWAYS uses year filter - dateRange is no longer used
   */
  const resolvedFilters = useMemo(() => {
    // Always use year filter - default to current year if not set
    const year = globalFilters.year || new Date().getFullYear().toString();
    const dateParams = getDateRangeForFilter(year);

    return {
      fromDate: dateParams.fromDate,
      toDate: dateParams.toDate,
      startDate: dateParams.fromDate.split("T")[0],
      endDate: dateParams.toDate.split("T")[0],
      serviceType:
        globalFilters.serviceCategory !== "all"
          ? globalFilters.serviceCategory
          : undefined,
      serviceCategory:
        globalFilters.serviceCategory !== "all"
          ? globalFilters.serviceCategory
          : undefined,
      businessSize:
        globalFilters.businessSize !== "all"
          ? globalFilters.businessSize
          : undefined,
      enterpriseSize:
        globalFilters.enterpriseSize !== "all"
          ? globalFilters.enterpriseSize
          : undefined,
      region: globalFilters.region !== "all" ? globalFilters.region : undefined,
      year: year,
    };
  }, [globalFilters]);

  const [isRealTimeActive, setIsRealTimeActive] = useState(true);

  // Analytics layer configuration
  const analyticsLayers = [
    {
      id: "descriptive",
      label: "Descriptive – What Happened",
      color: "blue",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "diagnostic",
      label: "Diagnostic – Why It Happened",
      color: "amber",
      borderColor: "border-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      id: "predictive",
      label: "Predictive – What's Next",
      color: "green",
      borderColor: "border-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "prescriptive",
      label: "Prescriptive – What To Do",
      color: "purple",
      borderColor: "border-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      id: "cognitive",
      label: "Cognitive – AI In Action",
      color: "teal",
      borderColor: "border-teal-500",
      bgColor: "bg-teal-50",
    },
  ];

  // Provider Benchmark Summary Table Data
  const [providerBenchmarkData, setProviderBenchmarkData] = useState<
    ProviderBenchmarkData[]
  >([]);

  // Filter options
  const globalFilterOptions = {
    dateRange: [
      { value: "today", label: "Today" },
      { value: "yesterday", label: "Yesterday" },
      { value: "this-week", label: "This Week" },
      { value: "last-week", label: "Last Week" },
      { value: "this-month", label: "This Month" },
      { value: "last-month", label: "Last Month" },
      { value: "this-quarter", label: "This Quarter" },
      { value: "this-year", label: "This Year" },
    ],

    year: [
      // Generate years from current year down to 2020 (newest to oldest)
      ...Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => ({
        value: String(new Date().getFullYear() - i),
        label: String(new Date().getFullYear() - i),
      })),
    ],

    serviceCategory: [
      { value: "all", label: "All" },
      { value: "financial", label: "Financial" },
      { value: "non-financial", label: "Non financial" },
    ],

    businessSize: [
      { value: "all", label: "All Business Sizes" },
      { value: "123950000", label: "Micro (1-10 employees)" },
      { value: "123950001", label: "Small (11-50 employees)" },
      { value: "123950002", label: "Medium (51-250 employees)" },
      { value: "123950003", label: "Large (>250 employees)" },
    ],

    enterpriseSize: [
      { value: "all", label: "All Sizes" },
      { value: "micro", label: "Micro (1-5 employees)" },
      { value: "small", label: "Small (6-50 employees)" },
      { value: "medium", label: "Medium (51-250 employees)" },
      { value: "large", label: "Large (250+ employees)" },
    ],

    transactionType: [
      { value: "all", label: "All Types" },
      { value: "financial", label: "Financial Services" },
      { value: "non-financial", label: "Non-Financial Services" },
      { value: "advisory", label: "Advisory Services" },
      { value: "training", label: "Training Services" },
    ],
  };

  // Contextual filter options

  // Layer data configurations
  const layerConfigurations = {
    descriptive: {
      title: "EJP Operations Performance",
      kpis: [
        {
          title: "Total Services Delivered",
          value: "13,470",
          unit: "services",
          trend: "up",
          trendValue: "+149",
          threshold: "excellent",
          description: "Total number of services delivered to enterprises",
          icon: "CheckCircle",
          sparklineData: [12000, 12500, 13000, 13200, 13350, 13470],
          target: 18000,
        },
        {
          title: "Active Enterprises Engaged",
          value: "1,450",
          unit: "enterprises",
          trend: "up",
          trendValue: "+11",
          threshold: "excellent",
          description: "Number of active enterprises engaged",
          icon: "Building",
          sparklineData: [1400, 1410, 1420, 1430, 1440, 1450],
          target: 1500,
        },
        {
          title: "Avg Completion Time",
          value: "3.2",
          unit: "days",
          trend: "up",
          trendValue: "+0.3 days",
          threshold: "good",
          description: "Average service completion time",
          icon: "Clock",
          sparklineData: [2.8, 2.9, 3.0, 3.1, 3.15, 3.2],
          target: 3.5,
        },
        {
          title: "SLA Compliance Rate",
          value: "99.3",
          unit: "%",
          trend: "up",
          trendValue: "+0.5%",
          threshold: "excellent",
          description: "Percentage of services meeting SLA requirements",
          icon: "Target",
          sparklineData: [98.5, 98.8, 99.0, 99.1, 99.2, 99.3],
          target: 95,
        },
      ],

      mainVisual: "EJP Transaction Performance Over Time",
      alertsTitle: "Current SLA Breaches and Service Issues",
      insights: [
        "Provider & Partner Performance – SLA Compliance and Quality Benchmarking",
        "Service Delivery Funnel – Application to Completion Flow",
        "Enterprise Outcomes & Impact – Growth and Satisfaction Analysis",
        "Comparative Insights – Cross-Enterprise and Service Delivery Performance",
      ],

      summary:
        "EJP Operations performance metrics showing transaction delivery efficiency, enterprise engagement, and provider performance across the platform.",
    },
    diagnostic: {
      title: "Root Cause Highlights",
      kpis: [
        {
          title: "Root Cause Contribution",
          value: "34.2",
          unit: "% impact",
          trend: "stable",
          trendValue: "±0.1%",
          threshold: "warning",
          description: "Primary factor contributing to performance issues",
          icon: "AlertTriangle",
          sparklineData: [32, 33, 34, 35, 34.5, 34.2],
          target: 25,
        },
        {
          title: "Delay Impact",
          value: "2.3",
          unit: "days avg",
          trend: "up",
          trendValue: "+0.4 days",
          threshold: "critical",
          description: "Average delay caused by identified bottlenecks",
          icon: "Clock",
          sparklineData: [1.5, 1.8, 2.0, 2.1, 2.2, 2.3],
          target: 1.0,
        },
        {
          title: "Partner Variance",
          value: "15.8",
          unit: "% deviation",
          trend: "down",
          trendValue: "-2.1%",
          threshold: "good",
          description: "Performance variation across partner network",
          icon: "BarChart3",
          sparklineData: [20, 19, 18, 17, 16.5, 15.8],
          target: 10,
        },
        {
          title: "Service Deviation",
          value: "8.7",
          unit: "% variance",
          trend: "stable",
          trendValue: "±0.2%",
          threshold: "good",
          description: "Variation from expected service standards",
          icon: "Target",
          sparklineData: [9.2, 9.0, 8.8, 8.9, 8.8, 8.7],
          target: 5,
        },
      ],

      mainVisual: "Factors Influencing Service Outcomes",
      alertsTitle: "Top Contributors to Performance Drop",
      insights: [
        "Correlation Matrix – Metric Relationships",
        "Process Drill-Down – Queue to Resolution Stages",
        "Cause-Effect Flow Map – Delay Propagation Across Processes",
        "Issue Theme Summary – Frequent Operational Problems",
      ],

      summary: "Why KPIs shifted and which factors drive the variation.",
    },
    predictive: {
      title: "Forecast Highlights",
      kpis: [
        {
          title: "Next-Period SLA",
          value: "94.8",
          unit: "% predicted",
          trend: "down",
          trendValue: "-1.4%",
          threshold: "warning",
          description: "Forecasted SLA achievement for next period",
          icon: "TrendingDown",
          sparklineData: [96.2, 95.8, 95.4, 95.0, 94.9, 94.8],
          target: 96,
        },
        {
          title: "Predicted Resolution Time",
          value: "4.6",
          unit: "days forecast",
          trend: "up",
          trendValue: "+0.4 days",
          threshold: "warning",
          description: "Expected average resolution time",
          icon: "Clock",
          sparklineData: [4.2, 4.3, 4.4, 4.5, 4.55, 4.6],
          target: 4.0,
        },
        {
          title: "Expected Cost",
          value: "£132",
          unit: "predicted",
          trend: "up",
          trendValue: "+£8",
          threshold: "warning",
          description: "Forecasted cost per service delivery",
          icon: "PoundSterling",
          sparklineData: [124, 126, 128, 130, 131, 132],
          target: 125,
        },
        {
          title: "Partner Risk Index",
          value: "23.4",
          unit: "/100 risk",
          trend: "up",
          trendValue: "+3.2",
          threshold: "critical",
          description: "Predicted risk level across partner network",
          icon: "AlertTriangle",
          sparklineData: [18, 19, 20, 21.5, 22.8, 23.4],
          target: 15,
        },
      ],

      mainVisual: "Projected Service Performance with Confidence Range",
      alertsTitle: "Expected Risks and Early Warnings",
      insights: [
        "Risk Heatmap – Likelihood vs Impact by Partner",
        "Forecast Distribution – Range of Possible Outcomes",
        "Model Explainability – Key Predictors Driving Forecast",
        "Timeline Slider – View Forecast Evolution by Horizon",
      ],

      summary: "What's likely to happen next and where attention is needed.",
    },
    prescriptive: {
      title: "Optimization Highlights",
      kpis: [
        {
          title: "Recommended Actions",
          value: "7",
          unit: "priority items",
          trend: "stable",
          trendValue: "±0",
          threshold: "good",
          description: "High-impact optimization actions identified",
          icon: "Target",
          sparklineData: [8, 7, 7, 8, 7, 7],
          target: 5,
        },
        {
          title: "Efficiency Gain %",
          value: "12.3",
          unit: "% improvement",
          trend: "up",
          trendValue: "+2.1%",
          threshold: "excellent",
          description: "Expected efficiency improvement from recommendations",
          icon: "TrendingUp",
          sparklineData: [8, 9, 10, 11, 11.8, 12.3],
          target: 15,
        },
        {
          title: "Cost Savings",
          value: "£245K",
          unit: "annual",
          trend: "up",
          trendValue: "+£45K",
          threshold: "excellent",
          description: "Projected annual cost savings",
          icon: "PoundSterling",
          sparklineData: [180, 200, 215, 225, 235, 245],
          target: 300,
        },
        {
          title: "Projected SLA Improvement %",
          value: "3.2",
          unit: "% points",
          trend: "up",
          trendValue: "+0.8%",
          threshold: "excellent",
          description: "Expected SLA performance improvement",
          icon: "ArrowUp",
          sparklineData: [2.1, 2.4, 2.7, 2.9, 3.0, 3.2],
          target: 4.0,
        },
      ],

      mainVisual: "Scenario Simulator – Adjust Resources to Test Impact",
      alertsTitle: "High-Priority Actions and Opportunities",
      insights: [
        "Optimization Flow – Resource Reallocation Effect",
        "ROI Matrix – Value vs Effort of Scenarios",
        "Decision Path – Best Actions by Goal",
        "Implementation Timeline – Planned Execution Schedule",
      ],

      summary:
        "Recommended next steps and expected impact on service efficiency.",
    },
    cognitive: {
      title: "AI Performance Overview",
      kpis: [
        {
          title: "Active AI Decisions",
          value: "142",
          unit: "live decisions",
          trend: "up",
          trendValue: "+23",
          threshold: "excellent",
          description: "AI decisions currently being executed",
          icon: "Brain",
          sparklineData: [98, 110, 125, 132, 138, 142],
          target: 150,
        },
        {
          title: "Automation Success %",
          value: "89.6",
          unit: "% success",
          trend: "up",
          trendValue: "+1.4%",
          threshold: "excellent",
          description: "Success rate of automated decisions",
          icon: "CheckCircle",
          sparklineData: [86, 87, 88, 88.5, 89.2, 89.6],
          target: 92,
        },
        {
          title: "Learning Cycles",
          value: "34",
          unit: "completed",
          trend: "up",
          trendValue: "+8",
          threshold: "excellent",
          description: "AI model learning cycles completed",
          icon: "RefreshCw",
          sparklineData: [20, 24, 28, 30, 32, 34],
          target: 40,
        },
        {
          title: "Approval Rate %",
          value: "94.2",
          unit: "% approved",
          trend: "up",
          trendValue: "+2.1%",
          threshold: "excellent",
          description: "User approval rate for AI recommendations",
          icon: "ThumbsUp",
          sparklineData: [90, 91, 92, 93, 93.8, 94.2],
          target: 95,
        },
      ],

      mainVisual: "AI Decision Timeline – Actions and Rationale",
      alertsTitle: "Live AI Actions and Execution Status",
      insights: [
        "Decision Graph – How AI Derived Recommendations",
        "Feedback Loop – User Approvals Over Time",
        "Network Map – System Adjustments Across Partners",
        "Sentiment Monitor – User Perception of AI Decisions",
      ],

      summary: "How AI agents execute and refine decisions autonomously.",
    },
  };

  // Tab configuration

  const dashboardTabsConfig = {
    "operations-internal": [
      { id: "market", label: "Market" },
      { id: "strategic", label: "Strategic" },
      { id: "operations", label: "Operations" },
    ],
  };

  const secondLayerTabsConfig = [
    {
      id: "service-delivery-performance",
      label: "Service Delivery Performance",
    },
    {
      id: "service-provider-performance",
      label: "Service Provider Performance",
    },
    { id: "enterprise-usage-impact", label: "Enterprise Usage & Impact" },
    { id: "risk-layer", label: "Risk Layer" },
  ];

  // Handle tab navigation with keyboard support

  // Update dashboard tab when segment changes
  useEffect(() => {
    const dashboardTabs =
      dashboardTabsConfig[activeSegmentTab as keyof typeof dashboardTabsConfig];
    if (
      dashboardTabs?.length > 0 &&
      !dashboardTabs?.find(
        (tab: { id: string; label: string }) => tab?.id === activeDashboardTab,
      )
    ) {
      setActiveDashboardTab(dashboardTabs?.[0]?.id);
    }
  }, [activeSegmentTab, activeDashboardTab]);

  // Update global filters
  const updateGlobalFilter = (filterKey: string, value: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Dynamic data fetching using real DataService
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Use real DataService that handles filters including year
      const realData = await DataService.fetchDashboardData({
        dateRange: globalFilters.dateRange,
        serviceCategory: globalFilters.serviceCategory,
        subServiceType: globalFilters.subServiceType,
        region: globalFilters.region,
        enterpriseSize: globalFilters.enterpriseSize,
      });
      setDashboardData(realData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load performance KPIs and provider data from API - NOW REACTIVE TO ALL FILTERS
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        // Use unified date resolution - ALWAYS uses year filter
        const year = globalFilters.year || new Date().getFullYear().toString();
        const dateRangeParams = getDateRangeForFilter(year);

        // Standardized filter payload - only include non-'all' values
        const filterPayload = {
          fromDate: dateRangeParams.fromDate,
          toDate: dateRangeParams.toDate,
          serviceCategory:
            globalFilters.serviceCategory !== "all"
              ? globalFilters.serviceCategory
              : undefined,
          businessSize:
            globalFilters.businessSize !== "all"
              ? globalFilters.businessSize
              : undefined,
          enterpriseSize:
            globalFilters.enterpriseSize !== "all"
              ? globalFilters.enterpriseSize
              : undefined,
          region:
            globalFilters.region !== "all" ? globalFilters.region : undefined,
          year: globalFilters.year,
        };

        const incidentFilters = {
          fromDate: dateRangeParams.fromDate,
          toDate: dateRangeParams.toDate,
          serviceType:
            globalFilters.serviceCategory !== "all"
              ? globalFilters.serviceCategory
              : undefined,
          businessSize:
            globalFilters.businessSize !== "all"
              ? globalFilters.businessSize
              : undefined,
          year: globalFilters.year,
        };

        // All API calls now use filters - making KPIs reactive to filter changes
        const [
          responseTime,
          completionTime,
          providerRequests,
          providerCompletionTime,
          providerSlaBreachRate,
          slaComplianceTrend,
          benchmarkSummary,
          retentionKpi,
        ] = await Promise.all([
          IncidentsService.getAvgResponseTime(incidentFilters),
          getServiceDeliveryAvgCompletionTime({
            fromDate: dateRangeParams.fromDate,
            toDate: dateRangeParams.toDate,
            serviceCategory:
              globalFilters.serviceCategory !== "all"
                ? globalFilters.serviceCategory
                : undefined,
          }),
          AccountsService.getProviderRequestsTracking(filterPayload),
          AccountsService.getProviderCompletionTime(filterPayload), // Now passes filters
          AccountsService.getProviderSlaBreachRate(filterPayload), // Now passes filters
          AccountsService.getSlaComplianceTrend(filterPayload),
          AccountsService.getProviderBenchmarkSummary(filterPayload), // Now passes filters
          AccountsService.getProviderRetentionKpi(filterPayload),
        ]);

        const latestCompliance =
          slaComplianceTrend[slaComplianceTrend.length - 1];
        const previousCompliance =
          slaComplianceTrend.length > 1
            ? slaComplianceTrend[slaComplianceTrend.length - 2]
            : undefined;
        const complianceValue = latestCompliance?.compliance ?? 0;
        const complianceDelta =
          latestCompliance && previousCompliance
            ? latestCompliance.compliance - previousCompliance.compliance
            : 0;
        const complianceTrend =
          complianceDelta > 0 ? "up" : complianceDelta < 0 ? "down" : "neutral";
        const complianceTrendValue =
          latestCompliance && previousCompliance
            ? `${complianceDelta >= 0 ? "+" : ""}${complianceDelta.toFixed(1)}%`
            : "0%";

        setPerformanceKPIs({
          avgResponseTime: responseTime,
          avgCompletionTime: completionTime,
          slaCompliance: {
            value: complianceValue.toFixed(1),
            unit: "%",
            trend: complianceTrend,
            trendValue: complianceTrendValue,
          },
        });

        setProviderRequestsData(providerRequests);
        setProviderCompletionTimeData(providerCompletionTime as any);
        setProviderSlaBreachData(providerSlaBreachRate);
        setSlaComplianceTrendData(slaComplianceTrend);
        setProviderBenchmarkData(benchmarkSummary);
        setProviderRetentionKpi(retentionKpi);
      } catch (error) {
        console.error("Failed to load performance data:", error);
      }
    };

    loadPerformanceData();
  }, [
    globalFilters.year,
    globalFilters.serviceCategory,
    globalFilters.businessSize,
    globalFilters.enterpriseSize,
    globalFilters.region,
  ]);

  // Load services dropdown options
  useEffect(() => {
    const loadServicesOptions = async () => {
      setIsLoading(true);
      try {
        await ServicesService.getServicesDropdown();
        // Handle services options if needed
      } catch (error) {
        console.error("Failed to load services options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServicesOptions();
  }, []);

  // Average Requests per Active Enterprise data
  const [avgRequestsPerActiveData, setAvgRequestsPerActiveData] = useState<{
    avgRequestsPerActive: number;
    totalRequests?: number;
    requestsInPeriod?: number;
    activeEnterprises: number;
    trend: "up" | "down" | "stable";
    trendValue: string;
    target: number;
  }>({
    avgRequestsPerActive: 0,
    totalRequests: 0,
    activeEnterprises: 0,
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 0,
  });

  // On-time SLA Rate data
  const [onTimeSLAData, setOnTimeSLAData] = useState({
    onTimeSLARate: 0,
    onTimeDelivered: 0,
    totalDelivered: 0,
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0%",
    target: 0,
  });

  // Repeated Enterprise Share data
  const [repeatedEnterpriseShareData, setRepeatedEnterpriseShareData] =
    useState({
      repeatedEnterpriseShare: 0,
      activeEnterprises: 0,
      repeatedEnterprises: 0,
      trend: "stable" as "up" | "down" | "stable",
      trendValue: "0%",
      target: 0,
    });

  // Enterprise Satisfaction Score data
  const [enterpriseSatisfactionScoreData, setEnterpriseSatisfactionScoreData] =
    useState({
      satisfactionScore: 0,
      repeatUsageRate: 0,
      activeEnterprises: 0,
      repeatedEnterprises: 0,
      trend: "stable" as "up" | "down" | "stable",
      trendValue: "0",
      target: 0,
    });

  // Enterprise Distribution by Industry data
  const [
    enterpriseDistributionByIndustryData,
    setEnterpriseDistributionByIndustryData,
  ] = useState([]);

  // Enterprise Distribution by Business Size data
  const [
    enterpriseDistributionByBusinessSizeData,
    setEnterpriseDistributionByBusinessSizeData,
  ] = useState([]);

  // Top Enterprises by Volume data
  const [topEnterprisesByVolumeData, setTopEnterprisesByVolumeData] = useState(
    [],
  );

  // Portfolio Summary data
  const [portfolioSummaryData, setPortfolioSummaryData] = useState([]);

  // Total Services Delivered data
  const [totalServicesDeliveredData, setTotalServicesDeliveredData] = useState({
    totalServicesDelivered: 0,
    trend: "up" as "up" | "down" | "stable",
    trendValue: "+0",
    target: 100,
  });

  // Service Delivery Avg Completion Time data
  const [serviceDeliveryCompletionTime, setServiceDeliveryCompletionTime] =
    useState({
      value: "0.0",
      unit: "days",
      trend: "stable" as "up" | "down" | "stable",
      trendValue: "0",
      target: 3.5,
    });

  // SLA Compliance Rate data
  const [slaComplianceRate, setSlaComplianceRate] = useState({
    value: "0.0",
    unit: "%",
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 95,
  });

  // Pending Requests KPI data
  const [pendingRequestsData, setPendingRequestsData] = useState({
    value: "0",
    unit: "requests",
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 100,
  });

  const [errorFailureRateData, setErrorFailureRateData] = useState({
    value: "0.0",
    unit: "%",
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 2,
  });

  const [applicationDropOffData, setApplicationDropOffData] = useState({
    value: "0.0",
    unit: "%",
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 5,
  });

  const [escalationRateData, setEscalationRateData] = useState({
    value: "0.0",
    unit: "%",
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 2,
  });

  const [slaBreachesData, setSlaBreachesData] = useState({
    value: "0",
    unit: "incidents",
    trend: "stable" as "up" | "down" | "stable",
    trendValue: "0",
    target: 10,
  });

  const [errorRateTrendChartData, setErrorRateTrendChartData] = useState<
    Array<{
      month: string;
      errorRate: number;
      lostCount: number;
      totalCount: number;
    }>
  >([]);

  const [pendingRequestsTrendChartData, setPendingRequestsTrendChartData] =
    useState<
      Array<{
        month: string;
        requests: number;
      }>
    >([]);

  const [incidentsByPriorityData, setIncidentsByPriorityData] = useState<
    Array<{
      priority: string;
      incidents: number;
      fill: string;
    }>
  >([]);

  const [selectedPriorityIndex, setSelectedPriorityIndex] = useState<
    number | null
  >(null);

  const [incidentsByStatusData, setIncidentsByStatusData] = useState<
    Array<{
      type: string;
      value: number;
      fill: string;
    }>
  >([]);

  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(
    null,
  );

  const [selectedEnterpriseIndex, setSelectedEnterpriseIndex] = useState<number | null>(null);
  const [selectedIndustryIndex, setSelectedIndustryIndex] = useState<number | null>(null);

  const [riskHeatmapData, setRiskHeatmapData] = useState<
    Array<{
      region: string;
      timeSlot: string;
      count: number;
    }>
  >([]);

  // Load Net New Enterprises, Enterprise Activation Rate, and Average Requests per Active Enterprise data
  useEnterpriseData(
    globalFilters,
    getDateRangeFromFilter,
    getDateRangeForFilter,
    {
      setTotalServicesDeliveredData,
      setServiceDeliveryCompletionTime,
      setSlaComplianceRate,
      setPendingRequestsData,
      setErrorFailureRateData,
      setApplicationDropOffData,
      setEscalationRateData,
      setSlaBreachesData,
      setErrorRateTrendChartData,
      setPendingRequestsTrendChartData,
      setIncidentsByPriorityData,
      setIncidentsByStatusData,
      setRiskHeatmapData,
      setNetNewEnterprisesData,
      setEnterpriseActivationRateData,
      setAvgRequestsPerActiveData,
      setOnTimeSLAData,
      setRepeatedEnterpriseShareData,
      setEnterpriseSatisfactionScoreData,
      setEnterpriseDistributionByIndustryData,
      setEnterpriseDistributionByBusinessSizeData,
      setTopEnterprisesByVolumeData,
      setPortfolioSummaryData,
    },
  );

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [activeDashboardTab, activeSecondLayerTab, globalFilters]);

  // Clear all filters - reset to defaults
  const clearAllFilters = () => {
    setGlobalFilters({
      year: new Date().getFullYear().toString(),
      dateRange: "this-year", // Kept for backward compatibility but not used
      serviceCategory: "all",
      businessSize: "all",
      enterpriseSize: "all",
      transactionType: "all",
      subServiceType: "all",
      region: "all",
    });
  };

  // Get filter label for display
  const getFilterLabel = (filterKey: string, value: string) => {
    const options =
      globalFilterOptions[filterKey as keyof typeof globalFilterOptions];
    const option = options?.find((opt: any) => opt.value === value);
    return option?.label || value;
  };

  // Check if any filters are active (not default values)
  // Year filter is considered active if not current year
  const hasActiveFilters = () => {
    const currentYear = new Date().getFullYear().toString();

    return (
      globalFilters.year !== currentYear ||
      globalFilters.serviceCategory !== "all" ||
      globalFilters.businessSize !== "all" ||
      globalFilters.enterpriseSize !== "all" ||
      globalFilters.region !== "all"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <main className="pb-12 w-full">
        {/* Show Service Delivery content only when that dashboard is active */}
        {(() => {
          // Dynamic content based on tab selections
          if (activeDashboardTab === "operations") {
            return (
              <>
                {/* Page Header */}
                <div className="bg-white border-b border-gray-200">
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                          EJP Operations Insight
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                          Tracks enterprise activity, service delivery, and
                          operational performance across EJP.
                        </p>
                      </div>

                      {/* Real-time Status */}
                      <div className="flex items-center gap-3">
                        {isLoading && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Updating...</span>
                          </div>
                        )}
                        <button
                          onClick={() => setIsRealTimeActive(!isRealTimeActive)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isRealTimeActive
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${isRealTimeActive ? "bg-blue-500 animate-pulse" : "bg-gray-400"}`}
                          />
                          <span>{isRealTimeActive ? "Live" : "Paused"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔹 Second Layer Tabs - Only show when Operations is selected */}
                {activeDashboardTab === "operations" && (
                  <div className="bg-white border-b border-gray-200 mb-8">
                    <div className="mx-auto px-4">
                      <div className="flex items-center justify-between">
                        {secondLayerTabsConfig.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSecondLayerTab(tab.id)}
                            className={`px-8 py-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                              activeSecondLayerTab === tab.id
                                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-500"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content */}
                <div className="w-full mx-auto px-4">
                  <div className="space-y-8">
                    {(() => {
                      const layer = analyticsLayers?.find(
                        (l) => l?.id === "descriptive",
                      );
                      const config = layerConfigurations?.["descriptive"];

                      if (!layer || !config) return null;

                      const renderServiceDeliveryPerformance = () => (
                        <div className="mb-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div
                              className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                            ></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Service Delivery Performance Headlines
                              </h3>
                              <p className="text-sm text-gray-500">
                                High-level KPI snapshot of current service
                                delivery performance
                              </p>
                            </div>
                          </div>
                          <ServiceDeliveryKPIGrid
                            dashboardData={dashboardData}
                            activeDashboardTab={activeDashboardTab}
                            activeSecondLayerTab={activeSecondLayerTab}
                            config={config}
                            totalServicesDeliveredData={
                              totalServicesDeliveredData
                            }
                            netNewEnterprisesData={netNewEnterprisesData}
                            serviceDeliveryCompletionTime={
                              serviceDeliveryCompletionTime
                            }
                            slaComplianceRate={slaComplianceRate}
                          />

                          {/* Section 1: Service Volume & Engagement */}
                          <div className="space-y-6">
                            {/* Section Header */}
                            <div className="flex items-center gap-4 mb-4">
                              <div
                                className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                              ></div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  Service Volume & Engagement
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Service trends, category distribution and
                                  enterprise engagement
                                </p>
                              </div>
                            </div>

                            {/* Row 1: Service Volume Trend by Service Type (60%) + Real-time Alerts (40%) */}
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                              {/* Left: Service Volume Trend by Service Type (3/5 = 60%) */}
                              <div className="xl:col-span-3">
                                <ServiceVolumeTrend
                                  startDate={
                                    getDateRangeFromFilter(globalFilters.year)
                                      .startDate
                                  }
                                  endDate={
                                    getDateRangeFromFilter(globalFilters.year)
                                      .endDate
                                  }
                                  serviceCategory={
                                    globalFilters.serviceCategory !== "all"
                                      ? globalFilters.serviceCategory
                                      : undefined
                                  }
                                />
                              </div>
                              {/* Right: Real-time Alerts (2/5 = 40%) */}
                              <div className="xl:col-span-2">
                                <div className="h-[448px]">
                                  <RealTimeAlerts description="Critical incidents and anomalies in current service delivery operations" />
                                </div>
                              </div>
                            </div>

                            {/* Row 2: Top Requested Services (50%) + Enterprise Engagement Trend (50%) */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                              {/* Left: Top Requested Services (50%) */}
                              <TopRequestedServices
                                startDate={
                                  getDateRangeFromFilter(globalFilters.year)
                                    .startDate
                                }
                                endDate={
                                  getDateRangeFromFilter(globalFilters.year)
                                    .endDate
                                }
                                serviceCategory={
                                  globalFilters.serviceCategory !== "all"
                                    ? globalFilters.serviceCategory
                                    : "all"
                                }
                                topN={10}
                              />

                              {/* Right: Enterprise Engagement Trend (50%) */}
                              <EnterpriseEngagementTrend
                                startDate={
                                  getDateRangeFromFilter(globalFilters.year)
                                    .startDate
                                }
                                endDate={
                                  getDateRangeFromFilter(globalFilters.year)
                                    .endDate
                                }
                                serviceCategory={
                                  globalFilters.serviceCategory !== "all"
                                    ? globalFilters.serviceCategory
                                    : undefined
                                }
                              />
                            </div>
                          </div>

                          {/* Full Width Sections */}
                          <div className="grid grid-cols-1 gap-6 mt-6">
                            {/* Section: Service Lifecycle & Response */}
                            <div className="flex items-center gap-4 mb-2">
                              <div
                                className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                              ></div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  Service Lifecycle & Response
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Lifecycle funnel and response time tracking
                                </p>
                              </div>
                            </div>

                            {/* Split into two separate cards: left and right */}
                            <div className="grid grid-cols-2 gap-6">
                              {/* Left Card: Service Lifecycle Funnel */}
                              <div className="bg-white border border-border rounded-xl p-6">
                                <div className="space-y-1 mb-4">
                                  <h4 className="text-base font-medium text-foreground">
                                    Service Lifecycle Funnel
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Service progression from request → in
                                    progress → completed → delivered
                                  </p>
                                </div>
                                <ServiceLifecycleFunnelChart
                                  startDate={
                                    getDateRangeFromFilter(globalFilters.year)
                                      .startDate
                                  }
                                  endDate={
                                    getDateRangeFromFilter(globalFilters.year)
                                      .endDate
                                  }
                                  serviceCategory={
                                    globalFilters.serviceCategory !== "all"
                                      ? globalFilters.serviceCategory
                                      : undefined
                                  }
                                />
                              </div>

                              {/* Right Card: Average Response Time */}
                              <div className="bg-white border border-border rounded-xl p-6">
                                <div className="space-y-1 mb-4">
                                  <h4 className="text-base font-medium text-foreground">
                                    Average Response Time
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Average time from initial request to first
                                    provider response
                                  </p>
                                </div>
                                <AverageResponseTimeChart
                                  startDate={
                                    getDateRangeFromFilter(globalFilters.year)
                                      .startDate
                                  }
                                  endDate={
                                    getDateRangeFromFilter(globalFilters.year)
                                      .endDate
                                  }
                                  serviceCategory={
                                    globalFilters.serviceCategory !== "all"
                                      ? globalFilters.serviceCategory
                                      : undefined
                                  }
                                  granularity="week"
                                />
                              </div>
                            </div>

                            {/* Section: SLA Compliance */}
                            <div className="flex items-center gap-4 mb-2">
                              <div
                                className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                              ></div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  SLA Compliance
                                </h3>
                                <p className="text-sm text-gray-500">
                                  SLA compliance tracking over time
                                </p>
                              </div>
                            </div>

                            {/* SLA Compliance Trend */}
                            <SlaComplianceTrendChart
                              startDate={
                                getDateRangeFromFilter(globalFilters.year)
                                  .startDate
                              }
                              endDate={
                                getDateRangeFromFilter(globalFilters.year)
                                  .endDate
                              }
                              serviceCategory={
                                globalFilters.serviceCategory !== "all"
                                  ? globalFilters.serviceCategory
                                  : undefined
                              }
                              granularity="month"
                            />
                          </div>
                        </div>
                      );

                      const renderServiceProviderPerformance = () => (
                        <div className="mb-10">
                          <div className="flex items-center gap-4 mb-8">
                            <div
                              className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                            ></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Performance Headlines
                              </h3>
                              <p className="text-sm text-gray-500">
                                Concise snapshot of provider performance KPIs
                              </p>
                            </div>
                          </div>

                          {/* KPI Cards - 4 Key Metrics */}
                          <div className="grid grid-cols-4 gap-4 mb-8">
                            <KPICard
                              title="Avg. Response Time"
                              value={performanceKPIs.avgResponseTime.value}
                              unit={performanceKPIs.avgResponseTime.unit}
                              trend={
                                performanceKPIs.avgResponseTime.trend as
                                  | "up"
                                  | "down"
                                  | "stable"
                                  | undefined
                              }
                              trendValue={
                                performanceKPIs.avgResponseTime.trendValue
                              }
                              sparklineData={[
                                3.2,
                                3.0,
                                2.8,
                                2.6,
                                2.5,
                                2.4,
                                parseFloat(
                                  performanceKPIs.avgResponseTime.value,
                                ),
                              ]}
                              threshold="excellent"
                              description="Average time for provider to respond"
                              icon="Clock"
                              target="Target: <4h"
                            />
                            <KPICard
                              title="Avg. Completion Time"
                              value={performanceKPIs.avgCompletionTime.value}
                              unit={performanceKPIs.avgCompletionTime.unit}
                              trend={
                                performanceKPIs.avgCompletionTime.trend as
                                  | "up"
                                  | "down"
                                  | "stable"
                                  | undefined
                              }
                              trendValue={
                                performanceKPIs.avgCompletionTime.trendValue
                              }
                              sparklineData={[
                                4.5,
                                4.3,
                                4.1,
                                4.0,
                                3.9,
                                3.9,
                                parseFloat(
                                  performanceKPIs.avgCompletionTime.value,
                                ),
                              ]}
                              threshold="excellent"
                              description="Average time to complete requests"
                              icon="CheckCircle"
                              target="Target: <5 days"
                            />
                            <KPICard
                              title="SLA Compliance"
                              value={performanceKPIs.slaCompliance.value}
                              unit={performanceKPIs.slaCompliance.unit}
                              trend={
                                performanceKPIs.slaCompliance.trend as
                                  | "up"
                                  | "down"
                                  | "stable"
                                  | undefined
                              }
                              trendValue={
                                performanceKPIs.slaCompliance.trendValue
                              }
                              sparklineData={slaComplianceTrendData.map(
                                (point) => point.compliance,
                              )}
                              threshold="excellent"
                              description="Average SLA compliance across providers"
                              icon="Shield"
                              target="Target: >90%"
                            />
                            <KPICard
                              title="Retention Rate"
                              value={providerRetentionKpi.retentionRate.toString()}
                              unit="%"
                              trend={
                                providerRetentionKpi.trend as
                                  | "up"
                                  | "down"
                                  | "stable"
                                  | undefined
                              }
                              trendValue={providerRetentionKpi.trendValue}
                              sparklineData={
                                retentionLoading
                                  ? []
                                  : providerRetentionKpi.sparklineData
                              }
                              threshold="excellent"
                              description="Percentage of retained service providers"
                              icon="Users"
                              target={`Target: >${providerRetentionKpi.target}%`}
                              error={retentionError}
                            />
                          </div>

                          {/* Section 1: Service Delivery & Efficiency */}
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                            ></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Service Delivery & Efficiency
                              </h3>
                              <p className="text-sm text-gray-500">
                                How efficiently providers deliver services
                              </p>
                            </div>
                          </div>

                        {/* Row 1: Bar Chart + Alert Panel */}
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch mb-6">
                          {/* Requests Completed by Provider (Top 10) - 3/5 width */}
                          <div className="xl:col-span-3">
                            <div className="bg-white border border-border rounded-xl p-6 h-full">
                              <div className="space-y-1 mb-4">
                                <h4 className="text-base font-medium text-foreground">Requests Received and Completed by Provider (Top 10)</h4>
                                <p className="text-xs text-muted-foreground">Compares total requests received vs completed per provider</p>
                              </div>
                              <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={providerRequestsData} barGap={4} barCategoryGap="20%" margin={{ bottom: 60, left: 10, right: 10 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                  <XAxis
                                    dataKey="provider"
                                    stroke="#4b5563"
                                    strokeWidth={1}
                                    style={{ fontSize: '10px' }}
                                    tick={{ fill: '#000000' }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                  />
                                  <YAxis
                                    stroke="#4b5563"
                                    strokeWidth={1}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: '#000000' }}
                                  />
                                  <Tooltip
                                    shared={false}
                                    cursor={false}
                                    contentStyle={{
                                      backgroundColor: '#fff',
                                      border: 'none',
                                      borderRadius: '12px',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                      fontSize: '12px'
                                    }}
                                    labelFormatter={(label, payload) => {
                                      const data = payload?.[0]?.payload;
                                      return data?.fullName || label;
                                    }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                  <Bar dataKey="total" name="Requests Received" fill="#3b82f6" radius={[12,12,0,0]} maxBarSize={60} onClick={(data, index) => setSelectedRequestsBarIndex(selectedRequestsBarIndex === index ? null : index)} cursor="pointer">
                                    <LabelList dataKey="total" position="top" style={{ fontSize: 12, fill: '#374151', textAnchor: 'middle' }} formatter={(v: any) => v} />
                                    {providerRequestsData.map((entry, index) => (
                                      <Cell key={`cell-total-${index}`} fill="#3b82f6" opacity={selectedRequestsBarIndex === null || selectedRequestsBarIndex === index ? 1 : 0.3} stroke={selectedRequestsBarIndex === index ? '#000' : 'none'} strokeWidth={selectedRequestsBarIndex === index ? 2 : 0} />
                                    ))}
                                  </Bar>
                                  <Bar dataKey="completed" name="Requests Completed" fill="#14b8a6" radius={[12,12,0,0]} maxBarSize={60} onClick={(data, index) => setSelectedRequestsBarIndex(selectedRequestsBarIndex === index ? null : index)} cursor="pointer">
                                    <LabelList dataKey="completed" position="top" style={{ fontSize: 12, fill: '#374151', textAnchor: 'middle' }} />
                                    {providerRequestsData.map((entry, index) => (
                                      <Cell key={`cell-completed-${index}`} fill="#14b8a6" opacity={selectedRequestsBarIndex === null || selectedRequestsBarIndex === index ? 1 : 0.3} stroke={selectedRequestsBarIndex === index ? '#000' : 'none'} strokeWidth={selectedRequestsBarIndex === index ? 2 : 0} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                            {/* Alerts Sidebar - 2/5 width with fixed height */}
                            <div className="xl:col-span-2">
                              <div className="h-[450px]">
                                <RealTimeAlerts description="Provider quality issues, capacity constraints, and regional service gaps" />
                              </div>
                            </div>
                          </div>

                        {/* Row 2: Completion Time by Provider - Full Width */}
                        <div className="mb-6">
                          <div className="bg-white border border-border rounded-xl p-6">
                            <div className="space-y-1 mb-4">
                              <h4 className="text-base font-medium text-foreground">Completion Time by Provider</h4>
                              <p className="text-xs text-muted-foreground">Average completion time per provider with 5-day target benchmark</p>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                              <ComposedChart data={providerCompletionTimeData} margin={{ left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                <XAxis 
                                  dataKey="provider" 
                                  stroke="#9ca3af" 
                                  strokeWidth={1}
                                  style={{ fontSize: '9px' }}
                                  tick={{ fill: '#6b7280' }}
                                  axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                  tickLine={{ stroke: '#9ca3af' }}
                                  height={80}
                                  interval={0}
                                  angle={-45}
                                  textAnchor="end"
                                  label={{ value: 'Service Providers', position: 'insideBottom', offset: -10, style: { fontSize: '12px', fill: '#6b7280', fontWeight: 500 } }}
                                />
                                <YAxis 
                                  stroke="#9ca3af" 
                                  strokeWidth={1}
                                  style={{ fontSize: '12px' }} 
                                  tick={{ fill: '#6b7280' }}
                                  label={{ value: 'Completion Time (days)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: '12px', fill: '#6b7280', fontWeight: 500, textAnchor: 'middle' } }}
                                  axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                  tickLine={{ stroke: '#9ca3af' }}
                                  domain={[0, 6]}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                                    fontSize: '12px' 
                                  }}
                                  labelFormatter={(label, payload) => {
                                    const recordWithName = payload?.find(item => item?.payload?.fullName);
                                    return recordWithName?.payload?.fullName || label;
                                  }}
                                  formatter={(value, name) => {
                                    if (name === 'Avg Completion Time') {
                                      return [`${value} days`, 'Avg Completion Time'];
                                    }
                                    if (name === 'Target (5 Days)') {
                                      return [`${value} days`, 'Target (5 Days)'];
                                    }
                                    return [value, name];
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar 
                                  dataKey="avgCompletionTime" 
                                  name="Avg Completion Time" 
                                  fill="#14b8a6" 
                                  radius={[12,12,0,0]}
                                  barSize={60}
                                  onClick={(data, index) => setSelectedCompletionBarIndex(selectedCompletionBarIndex === index ? null : index)}
                                  cursor="pointer"
                                >
                                  <LabelList dataKey="avgCompletionTime" position="top" formatter={(v: any) => `${v}d`} style={{ fontSize: 12, fill: '#374151' }} />
                                  {providerCompletionTimeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#14b8a6" opacity={selectedCompletionBarIndex === null || selectedCompletionBarIndex === index ? 1 : 0.3} stroke={selectedCompletionBarIndex === index ? '#000' : 'none'} strokeWidth={selectedCompletionBarIndex === index ? 2 : 0} />
                                  ))}
                                </Bar>
                                <Line
                                  type="monotone"
                                  dataKey="target"
                                  name="Target (5 Days)"
                                  stroke="#f97316"
                                  strokeDasharray="6 4"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                          {/* Section 2: Reliability & SLA Tracking */}
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                            ></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Reliability & SLA Tracking
                              </h3>
                              <p className="text-sm text-gray-500">
                                Monitor reliability and SLA trends before
                                benchmarking
                              </p>
                            </div>
                          </div>

                        {/* Row: SLA Compliance Trend + SLA Breach Rate */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          {/* SLA Compliance Trend (All Providers) */}
                          <div className="bg-white border border-border rounded-xl p-6">
                            <div className="space-y-1 mb-4">
                              <h4 className="text-base font-medium text-foreground">SLA Compliance Trend (All Providers)</h4>
                              <p className="text-xs text-muted-foreground">Monthly SLA compliance rate across all service providers</p>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                              <LineChart data={slaComplianceTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="#9ca3af" 
                                  strokeWidth={1}
                                  style={{ fontSize: '12px' }}
                                  tick={{ fill: '#6b7280' }}
                                  axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                  tickLine={{ stroke: '#9ca3af' }}
                                  label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#6b7280', fontWeight: 500 } }}
                                />
                                <YAxis 
                                  stroke="#9ca3af" 
                                  strokeWidth={1}
                                  style={{ fontSize: '12px' }}
                                  tick={{ fill: '#6b7280' }}
                                  domain={[85, 95]}
                                  label={{ value: 'Compliance (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280', fontWeight: 500 } }}
                                  axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                  tickLine={{ stroke: '#9ca3af' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                                    fontSize: '12px' 
                                  }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line 
                                  type="monotone" 
                                  dataKey="compliance" 
                                  stroke="#14b8a6" 
                                  strokeWidth={3}
                                  dot={{ fill: '#14b8a6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                                  name="SLA Compliance"
                                >
                                  <LabelList dataKey="compliance" position="top" formatter={(v: any) => `${v}%`} style={{ fontSize: 12, fill: '#374151' }} />
                                </Line>
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* SLA Breach Rate by Provider */}
                          <div className="bg-white border border-border rounded-xl p-6">
                            <div className="space-y-1 mb-4">
                              <h4 className="text-base font-medium text-foreground">SLA Breach Rate by Provider (%)</h4>
                              <p className="text-xs text-muted-foreground">Percentage of SLA breaches showing recurring issues per provider</p>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={providerSlaBreachData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                <XAxis 
                                  tick={false}
                                  stroke="#4b5563" 
                                  style={{ fontSize: '12px' }}
                                  axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
                                  label={{ value: 'Service Providers', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#4b5563' } }}
                                />
                                <YAxis 
                                  stroke="#4b5563" 
                                  style={{ fontSize: '12px' }}
                                  label={{ value: 'Breach Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#4b5563' } }}
                                  axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
                                  tick={{ fill: '#4b5563' }}
                                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                                />
                                <Tooltip
                                  cursor={false}
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                                    fontSize: '12px' 
                                  }}
                                  labelFormatter={(label, payload) => {
                                    const data = payload?.[0]?.payload;
                                    return data?.provider || 'Provider';
                                  }}
                                />
                                <Bar dataKey="breachRate" name="Breach Rate" fill="#ef4444" radius={[12,12,0,0]} onClick={(data, index) => setSelectedSlaBreachBarIndex(selectedSlaBreachBarIndex === index ? null : index)} cursor="pointer">
                                  <LabelList dataKey="breachRate" position="top" formatter={(v: any) => `${v}%`} style={{ fontSize: 12, fill: '#374151' }} />
                                  {providerSlaBreachData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#ef4444" opacity={selectedSlaBreachBarIndex === null || selectedSlaBreachBarIndex === index ? 1 : 0.3} stroke={selectedSlaBreachBarIndex === index ? '#000' : 'none'} strokeWidth={selectedSlaBreachBarIndex === index ? 2 : 0} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                          {/* Section 3: Provider Benchmarking */}
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                            ></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Provider Benchmarking
                              </h3>
                              <p className="text-sm text-gray-500">
                                Compare overall performance using a composite
                                index
                              </p>
                            </div>
                          </div>

                          {/* Row 1: Performance Matrix Heatmap */}
                          <div className="mb-6">
                            <div className="min-h-[400px]">
                              <EfficiencyMatrixHeatmap
                                benchmarkType={
                                  globalFilters?.serviceCategory !== "all"
                                    ? globalFilters?.serviceCategory
                                    : undefined
                                }
                                businessSize={
                                  globalFilters?.businessSize !== "all"
                                    ? globalFilters?.businessSize
                                    : undefined
                                }
                                fromDate={resolvedFilters.fromDate}
                                toDate={resolvedFilters.toDate}
                                year={globalFilters.year}
                              />
                            </div>
                          </div>

                          {/* Row 2: Provider Benchmark Summary Table */}
                          <div className="mb-6">
                            <div className="bg-white border border-border rounded-xl p-6">
                              <div className="space-y-1 mb-4">
                                <h4 className="text-base font-medium text-foreground">
                                  Provider Benchmark Summary (Top 15)
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Performance comparison showing SLA compliance,
                                  response time, case volume, and overall index
                                </p>
                              </div>
                              <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        Provider
                                      </th>
                                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        SLA %
                                      </th>
                                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Response Time (hrs)
                                      </th>
                                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Cases
                                      </th>
                                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Index
                                      </th>
                                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Rank
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {providerBenchmarkData
                                      .sort((a, b) => b.index - a.index)
                                      .slice(0, 15)
                                      .map((provider, index) => {
                                        const isTop3 = index < 3;
                                        const isBottom3 =
                                          index >=
                                          Math.min(
                                            15,
                                            providerBenchmarkData.length,
                                          ) -
                                            3;
                                        const rowClass = isTop3
                                          ? "bg-emerald-50 border-l-4 border-emerald-500"
                                          : isBottom3
                                            ? "bg-red-50 border-l-4 border-red-500"
                                            : "hover:bg-gray-50";

                                        return (
                                          <tr
                                            key={provider.provider}
                                            className={`border-b border-gray-100 ${rowClass}`}
                                          >
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                              {provider.provider}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">
                                              {provider.sla}%
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">
                                              {provider.responseTime}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">
                                              {provider.capacity}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                  isTop3
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : isBottom3
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {provider.index}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              <span
                                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                  isTop3
                                                    ? "bg-emerald-500 text-white"
                                                    : isBottom3
                                                      ? "bg-red-500 text-white"
                                                      : "bg-gray-500 text-white"
                                                }`}
                                              >
                                                {provider.rank}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                const renderEnterpriseUsageImpact = () => (
                      <div className="mb-10">
                        {/* Headlines Section */}
                        <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                          <div className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}></div>
                          <div className="flex-1">
                              <h4 className="text-xl font-light text-foreground mb-2">Enterprise Activity Headlines</h4>
                            <p className="text-sm text-muted-foreground">
                                Core metrics summarizing enterprise activity, service delivery efficiency, and satisfaction.
                            </p>
                          </div>
                        </div>
                        
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <KPICard
                              title="Net New Enterprises"
                              value={netNewEnterprisesData.netNewEnterprises.toString()}
                              unit=""
                            trend={netNewEnterprisesData.trend}
                              trendValue={netNewEnterprisesData.trendValue}
                              sparklineData={[100, 105, 110, 115, 120, netNewEnterprisesData.netNewEnterprises]}
                              threshold={netNewEnterprisesData.netNewEnterprises >= netNewEnterprisesData.target ? "excellent" : "good"}
                              description="New enterprises added this period"
                              icon="Building"
                              target={netNewEnterprisesData.target.toString()}
                              isLoading={netNewEnterprisesData.netNewEnterprises === 0 && isLoading}
                          />
                          <KPICard
                              title="Enterprise Activation Rate"
                              value={enterpriseActivationRateData.activationRate.toString()}
                            unit="%"
                            trend={enterpriseActivationRateData.trend}
                              trendValue={enterpriseActivationRateData.trendValue}
                              sparklineData={[72, 73, 74, 75, 77, enterpriseActivationRateData.activationRate]}
                              threshold={enterpriseActivationRateData.activationRate >= enterpriseActivationRateData.target ? "excellent" : "good"}
                              description="Percentage of enterprises that activated services"
                              icon="Zap"
                              target={`${enterpriseActivationRateData.target}%`}
                              isLoading={enterpriseActivationRateData.activationRate === 0 && isLoading}
                          />
                          <KPICard
                              title="On-time SLA Rate"
                              value={onTimeSLAData.onTimeSLARate.toString()}
                            unit="%"
                            trend={onTimeSLAData.trend}
                              trendValue={onTimeSLAData.trendValue}
                              sparklineData={[90, 91, 92, 93, 94, onTimeSLAData.onTimeSLARate]}
                            threshold={onTimeSLAData.onTimeSLARate >= onTimeSLAData.target ? "excellent" : "good"}
                              description={`${onTimeSLAData.onTimeDelivered} on-time / ${onTimeSLAData.totalDelivered} total delivered`}
                              icon="Clock"
                              target={`${onTimeSLAData.target}%`}
                              isLoading={onTimeSLAData.onTimeSLARate === 0 && isLoading}
                          />
                          <KPICard
                              title="Average Requests per Active Enterprise"
                              value={avgRequestsPerActiveData.avgRequestsPerActive.toString()}
                            unit="requests"
                            trend={avgRequestsPerActiveData.trend}
                              trendValue={avgRequestsPerActiveData.trendValue}
                              sparklineData={[6.2, 6.3, 6.4, 6.5, 6.6, avgRequestsPerActiveData.avgRequestsPerActive]}
                            threshold={avgRequestsPerActiveData.avgRequestsPerActive >= avgRequestsPerActiveData.target ? "excellent" : "good"}
                              description={`${avgRequestsPerActiveData.totalRequests || avgRequestsPerActiveData.requestsInPeriod || 0} total requests / ${avgRequestsPerActiveData.activeEnterprises} active enterprises`}
                              icon="BarChart"
                              target={avgRequestsPerActiveData.target.toString()}
                              isLoading={avgRequestsPerActiveData.avgRequestsPerActive === 0 && isLoading}
                          />
                          <KPICard
                              title="Repeat Enterprise Share"
                              value={repeatedEnterpriseShareData.repeatedEnterpriseShare.toString()}
                            unit="%"
                            trend={repeatedEnterpriseShareData.trend}
                              trendValue={repeatedEnterpriseShareData.trendValue}
                              sparklineData={[58, 59, 60, 61, 62, repeatedEnterpriseShareData.repeatedEnterpriseShare]}
                            threshold={repeatedEnterpriseShareData.repeatedEnterpriseShare >= repeatedEnterpriseShareData.target ? "excellent" : "good"}
                              description={`${repeatedEnterpriseShareData.repeatedEnterprises} repeated / ${repeatedEnterpriseShareData.activeEnterprises} active enterprises`}
                              icon="Repeat"
                              target={`${repeatedEnterpriseShareData.target}%`}
                              isLoading={repeatedEnterpriseShareData.repeatedEnterpriseShare === 0 && isLoading}
                          />
                          <KPICard
                              title="Enterprise Satisfaction Score"
                              value={enterpriseSatisfactionScoreData.satisfactionScore.toString()}
                              unit="/5.0"
                            trend={enterpriseSatisfactionScoreData.trend}
                              trendValue={enterpriseSatisfactionScoreData.trendValue}
                              sparklineData={[4.2, 4.3, 4.4, 4.5, 4.5, enterpriseSatisfactionScoreData.satisfactionScore]}
                              threshold={enterpriseSatisfactionScoreData.satisfactionScore >= enterpriseSatisfactionScoreData.target ? "excellent" : "good"}
                              description={`Based on ${enterpriseSatisfactionScoreData.activeEnterprises} active enterprises (${enterpriseSatisfactionScoreData.repeatedEnterprises} repeated)`}
                              icon="MessageSquare"
                              target={enterpriseSatisfactionScoreData.target.toString()}
                              isLoading={enterpriseSatisfactionScoreData.satisfactionScore === 0 && isLoading}
                            />
                          </div>
                              </div>
                              
                        {/* Enterprise Portfolio Composition Section */}
                        <div className="mb-12">
                          <div className="flex items-center gap-4 mb-8">
                                <div className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}></div>
                                <div className="flex-1">
                              <h4 className="text-xl font-light text-foreground mb-2">Enterprise Portfolio Composition</h4>
                              <p className="text-sm text-muted-foreground">
                                Explore the distribution and makeup of enterprises by sector, region, and engagement level.
                              </p>
                                </div>
                                      </div>
                                      
                          {/* Row 1: Enterprise Distribution by Industry (60%) + Real-time Alerts (40%) */}
                          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
                            {/* Left: Enterprise Distribution by Industry (3/5 = 60%) */}
                            <div className="xl:col-span-3">
                              <div className="bg-white border border-border rounded-xl p-6 h-[448px] flex flex-col">
                                <h5 className="text-lg font-medium text-foreground mb-1">Enterprise Distribution by Industry</h5>
                                <p className="text-sm text-muted-foreground mb-4">Number of enterprises across different industry sectors</p>
                                <ReactECharts
                                  option={{
                                    tooltip: {
                                      trigger: 'item'
                                    },
                                    grid: {
                                      left: '80px',
                                      right: '40px',
                                      top: '40px',
                                      bottom: '100px',
                                      containLabel: false
                                    },
                                    xAxis: {
                                      type: 'category',
                                      data: enterpriseDistributionByIndustryData.map(item => item.industry),
                                      name: 'Industry Sector',
                                      nameLocation: 'middle',
                                      nameGap: 85,
                                      nameTextStyle: {
                                        color: '#6b7280',
                                        fontSize: 12,
                                        fontWeight: 600
                                      },
                                      axisLabel: {
                                        rotate: -45,
                                        interval: 0,
                                        color: '#6b7280',
                                        fontSize: 11,
                                        formatter: function(value) {
                                          const words = value.split(' ');
                                          return words.length > 2 ? words.slice(0, 2).join(' ') + '...' : value;
                                        }
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
                                    yAxis: {
                                      type: 'value',
                                      name: 'Number of Enterprises',
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
                                    series: [{
                                      name: 'Enterprises',
                                      type: 'bar',
                                      label: {
                                        show: true,
                                        position: 'top',
                                        formatter: '{c}'
                                      },
                                      data: enterpriseDistributionByIndustryData.map((item, index) => ({
                                        value: item.count,
                                        itemStyle: { 
                                          color: item.fill,
                                          opacity: selectedIndustryIndex === null || selectedIndustryIndex === index ? 1 : 0.3,
                                          borderColor: selectedIndustryIndex === index ? '#000' : 'none',
                                          borderWidth: selectedIndustryIndex === index ? 2 : 0
                                        }
                                      }))
                                    }]
                                  }}
                                  style={{ flexGrow: 1, width: '100%', minHeight: 0 }}
                                  onEvents={{
                                    click: (params: any) => {
                                      if (params.componentType === 'series') {
                                        setSelectedIndustryIndex(selectedIndustryIndex === params.dataIndex ? null : params.dataIndex);
                                      }
                                    }
                                  }}
                                />
                                          </div>
                            </div>
                            {/* Right: Real-time Alerts (2/5 = 40%) */}
                            <div className="xl:col-span-2">
                              <div className="h-[448px]">
                                <RealTimeAlerts 
                                  description="Alerts on enterprise drop-off rates, repeat usage, and satisfaction scores"
                                  context="enterprise-impact"
                                  startDate={getDateRangeFromFilter(globalFilters.year).startDate}
                                  endDate={getDateRangeFromFilter(globalFilters.year).endDate}
                                  serviceCategory={globalFilters.serviceCategory !== 'all' ? globalFilters.serviceCategory : undefined}
                                />
                          </div>
                          </div>
                        </div>

                          {/* Row 2: Enterprise Distribution by Business Stage (50%) + Top 10 Enterprises by Service Request Volume (50%) */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Enterprise Distribution by Business Size */}
                            <div className="bg-white border border-border rounded-xl p-6">
                              <h5 className="text-lg font-medium text-foreground mb-1">Enterprise Distribution by Business Size</h5>
                              <p className="text-sm text-muted-foreground mb-4">Breakdown of enterprises by their business size and category</p>
                              <ReactECharts
                                option={{
                                  tooltip: {
                                    trigger: 'item'
                                  },
                                  legend: {
                                    data: ['B2B', 'B2C', 'B2G', 'Hybrid'],
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
                                    data: enterpriseDistributionByBusinessSizeData.map(item => item.businessSize),
                                    name: 'Business Size',
                                    nameLocation: 'middle',
                                    nameGap: 30,
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
                                  yAxis: {
                                    type: 'value',
                                    name: 'Number of Enterprises',
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
                                  series: [
                                    {
                                      name: 'B2B',
                                      type: 'bar',
                                      stack: 'total',
                                      data: enterpriseDistributionByBusinessSizeData.map(item => item.B2B || 0),
                                      itemStyle: { color: '#3b82f6' },
                                      label: { show: false }
                                    },
                                    {
                                      name: 'B2C',
                                      type: 'bar',
                                      stack: 'total',
                                      data: enterpriseDistributionByBusinessSizeData.map(item => item.B2C || 0),
                                      itemStyle: { color: '#10b981' },
                                      label: { show: false }
                                    },
                                    {
                                      name: 'B2G',
                                      type: 'bar',
                                      stack: 'total',
                                      data: enterpriseDistributionByBusinessSizeData.map(item => item.B2G || 0),
                                      itemStyle: { color: '#f59e0b' },
                                      label: { show: false }
                                    },
                                    {
                                      name: 'Hybrid',
                                      type: 'bar',
                                      stack: 'total',
                                      data: enterpriseDistributionByBusinessSizeData.map(item => item.Hybrid || 0),
                                      itemStyle: { color: '#ef4444' },
                                      label: { show: false }
                                    }
                                  ]
                                }}
                                style={{ height: '350px', width: '100%' }}
                              />
                          </div>
                          
                            {/* Top 10 Enterprises by Service Request Volume */}
                            <div className="bg-white border border-border rounded-xl p-6">
                              <h5 className="text-lg font-medium text-foreground mb-1">Top 10 Enterprises by Service Request Volume</h5>
                              <p className="text-sm text-muted-foreground mb-4">Leading enterprises ranked by total service requests</p>
                              <ReactECharts
                                option={{
                                  tooltip: {
                                    trigger: 'axis',
                                    axisPointer: { type: 'none' }
                                  },
                                  grid: {
                                    left: '35%',
                                    right: '10%',
                                    top: '10%',
                                    bottom: '15%',
                                    containLabel: false
                                  },
                                  xAxis: {
                                    type: 'value',
                                    name: 'Service Request Volume',
                                    nameLocation: 'middle',
                                    nameGap: 30,
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
                                  yAxis: {
                                    type: 'category',
                                    name: 'Enterprise Name',
                                    nameLocation: 'middle',
                                    nameGap: 80,
                                    nameTextStyle: {
                                      color: '#6b7280',
                                      fontSize: 12,
                                      fontWeight: 500
                                    },
                                    axisLabel: {
                                      fontSize: 10,
                                      interval: 0,
                                      color: '#6b7280',
                                      width: 120,
                                      overflow: 'truncate',
                                      formatter: function(value) {
                                        return value.length > 15 ? value.substring(0, 15) + '...' : value;
                                      }
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
                                    data: topEnterprisesByVolumeData.map(item => item.enterpriseName).reverse()
                                  },
                                  series: [{
                                    name: 'Volume',
                                    type: 'bar',
                                    label: {
                                      show: true,
                                      position: 'right',
                                      formatter: '{c}'
                                    },
                                    data: topEnterprisesByVolumeData.map((item, index) => ({
                                      value: item.volume,
                                      itemStyle: {
                                        color: selectedEnterpriseIndex === null || selectedEnterpriseIndex === (topEnterprisesByVolumeData.length - 1 - index) ? '#10b981' : '#d1d5db',
                                        borderColor: selectedEnterpriseIndex === (topEnterprisesByVolumeData.length - 1 - index) ? '#000' : 'none',
                                        borderWidth: selectedEnterpriseIndex === (topEnterprisesByVolumeData.length - 1 - index) ? 2 : 0
                                      }
                                    })).reverse()
                                  }]
                                }}
                                style={{ height: '350px', width: '100%' }}
                                onEvents={{
                                  click: (params: any) => {
                                    if (params.componentType === 'series') {
                                      setSelectedEnterpriseIndex(selectedEnterpriseIndex === params.dataIndex ? null : params.dataIndex);
                                    }
                                  }
                                }}
                              />
                              </div>
                            </div>
                          </div>

                          {/* Portfolio Summary Table */}
                          <div className="bg-white border border-border rounded-xl p-6">
                            <h5 className="text-lg font-medium text-foreground mb-4">
                              Portfolio Summary
                            </h5>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                                      Enterprise Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                                      Industry
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                                      Region
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                                      SLA %
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                                      Satisfaction
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                                      Active Services
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {portfolioSummaryData.map(
                                    (enterprise, index) => (
                                      <tr
                                        key={index}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                      >
                                        <td className="py-3 px-4 text-sm text-foreground">
                                          {enterprise.enterpriseName}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                          {enterprise.industry}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                          {enterprise.region}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-foreground font-medium">
                                          {enterprise.slaPercentage}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-foreground font-medium">
                                          {enterprise.satisfaction}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-foreground">
                                          {enterprise.activeServices}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Enterprise Engagement Trends Section */}
                          <div className="mb-12">
                            <div className="flex items-center gap-4 mb-8">
                              <div
                                className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                              ></div>
                              <div className="flex-1">
                                <h4 className="text-xl font-light text-foreground mb-2">
                                  Enterprise Engagement Trends
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Track service demand, utilization, and
                                  engagement changes over time.
                                </p>
                              </div>
                            </div>

                            {/* Row 1: Service Requests by New vs Repeated Users Over Time - Full Width */}
                            <ServiceRequestsByUserTypeChart
                              globalFilters={globalFilters}
                            />

                            {/* Row 2: Enterprise Drop off Rate Over Time (50%) + Average Completion Time by Enterprise Size Over Time (50%) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                              {/* Enterprise Drop off Rate Over Time */}
                              <EnterpriseDropOffRateChart
                                globalFilters={globalFilters}
                              />

                              {/* Average Completion Time by Enterprise Size Over Time */}
                              <AvgCompletionTimeByEnterpriseSizeChart
                                globalFilters={globalFilters}
                              />
                            </div>
                          </div>

                          {/* Enterprise Satisfaction & Feedback Section */}
                          <div className="mb-12">
                            <div className="flex items-center gap-4 mb-8">
                              <div
                                className={`w-1 h-12 rounded-full bg-${layer?.color}-500`}
                              ></div>
                              <div className="flex-1">
                                <h4 className="text-xl font-light text-foreground mb-2">
                                  Enterprise Satisfaction & Feedback
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Measure enterprise satisfaction and capture
                                  insights from feedback across service
                                  categories.
                                </p>
                              </div>
                            </div>

                            {/* Satisfaction Score Over Time */}
                            <SatisfactionScoreOverTime
                              startDate={
                                getDateRangeFromFilter(globalFilters.year)
                                  .startDate
                              }
                              endDate={
                                getDateRangeFromFilter(globalFilters.year)
                                  .endDate
                              }
                              serviceCategory={
                                globalFilters.serviceCategory !== "all"
                                  ? globalFilters.serviceCategory
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                      );

                      const renderRiskLayer = () => (
                        <div className="mb-10">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-1 h-12 rounded-full bg-red-500"></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Risk Layer
                              </h3>
                              <p className="text-sm text-gray-500">
                                SLA breaches, delays, failures, and critical
                                alerts grouped by type and severity
                              </p>
                            </div>
                          </div>

                          {/* KPI Cards */}
                          <div className="grid grid-cols-5 gap-4 mb-8">
                            <KPICard
                              title="SLA Breaches"
                              value={slaBreachesData.value}
                              unit={slaBreachesData.unit}
                              trend={slaBreachesData.trend}
                              trendValue={slaBreachesData.trendValue}
                              sparklineData={[
                                15,
                                17,
                                19,
                                20,
                                21,
                                22,
                                parseInt(slaBreachesData.value) || 0,
                              ]}
                              threshold={
                                parseInt(slaBreachesData.value) <=
                                slaBreachesData.target
                                  ? "excellent"
                                  : "critical"
                              }
                              description="Total SLA breach incidents"
                              icon="AlertTriangle"
                              target={`Target: <${slaBreachesData.target}`}
                            />
                            <KPICard
                              title="Pending Requests"
                              value={pendingRequestsData.value}
                              unit={pendingRequestsData.unit}
                              trend={pendingRequestsData.trend}
                              trendValue={pendingRequestsData.trendValue}
                              sparklineData={[
                                170,
                                165,
                                160,
                                158,
                                155,
                                158,
                                parseInt(pendingRequestsData.value) || 0,
                              ]}
                              threshold={
                                parseInt(pendingRequestsData.value) <=
                                pendingRequestsData.target
                                  ? "excellent"
                                  : "warning"
                              }
                              description="Current backlog of pending requests"
                              icon="Clock"
                              target={`Target: <${pendingRequestsData.target}`}
                            />
                            <KPICard
                              title="Error/Failure Rate"
                              value={errorFailureRateData.value}
                              unit={errorFailureRateData.unit}
                              trend={errorFailureRateData.trend}
                              trendValue={errorFailureRateData.trendValue}
                              sparklineData={[
                                3.5,
                                3.3,
                                3.1,
                                3.0,
                                2.9,
                                2.9,
                                parseFloat(errorFailureRateData.value) || 0,
                              ]}
                              threshold={
                                parseFloat(errorFailureRateData.value) <=
                                errorFailureRateData.target
                                  ? "excellent"
                                  : "warning"
                              }
                              description="Percentage of failed transactions"
                              icon="XCircle"
                              target={`Target: <${errorFailureRateData.target}`}
                            />
                            <KPICard
                              title="Application Drop-off"
                              value={applicationDropOffData.value}
                              unit={applicationDropOffData.unit}
                              trend={applicationDropOffData.trend}
                              trendValue={applicationDropOffData.trendValue}
                              sparklineData={[
                                7.0,
                                7.2,
                                7.5,
                                7.8,
                                8.0,
                                8.3,
                                parseFloat(applicationDropOffData.value) || 0,
                              ]}
                              threshold={
                                parseFloat(applicationDropOffData.value) <=
                                applicationDropOffData.target
                                  ? "excellent"
                                  : "critical"
                              }
                              description="Application abandonment rate"
                              icon="LogOut"
                              target={`Target: <${applicationDropOffData.target}`}
                            />
                            <KPICard
                              title="Escalation Rate"
                              value={escalationRateData.value}
                              unit={escalationRateData.unit}
                              trend={escalationRateData.trend}
                              trendValue={escalationRateData.trendValue}
                              sparklineData={[
                                2.5,
                                2.7,
                                2.8,
                                2.9,
                                3.0,
                                3.1,
                                parseFloat(escalationRateData.value) || 0,
                              ]}
                              threshold={
                                parseFloat(escalationRateData.value) <=
                                escalationRateData.target
                                  ? "excellent"
                                  : "critical"
                              }
                              description="Percentage of escalated issues"
                              icon="ArrowUpRight"
                              target={`Target: <${escalationRateData.target}`}
                            />
                          </div>

                          {/* Section: Risk Trends */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-1 h-12 rounded-full bg-red-500"></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Risk Trends
                              </h3>
                              <p className="text-sm text-gray-500">
                                Error rates and backlog over time
                              </p>
                            </div>
                          </div>
                          {/* Section 1: Risk Trends with Sidebar */}
                          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* Main Content Area - 8/12 width */}
                            <div className="xl:col-span-8">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Error Rate Trend */}
                                <div className="bg-white border border-border rounded-xl p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-base font-medium text-foreground">
                                      Error Rate Trend
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Monthly breakdown of lost opportunities
                                    </p>
                                  </div>
                                  <ResponsiveContainer
                                    width="100%"
                                    height={280}
                                  >
                                    <LineChart data={errorRateTrendChartData}>
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f3f4f6"
                                        vertical={false}
                                      />
                                      <XAxis
                                        dataKey="month"
                                        stroke="#9ca3af"
                                        style={{ fontSize: "12px" }}
                                        tick={{ fill: "#6b7280" }}
                                      />
                                      <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: "12px" }}
                                        tick={{ fill: "#6b7280" }}
                                        label={{
                                          value: "Error Rate (%)",
                                          angle: -90,
                                          position: "insideLeft",
                                          style: {
                                            fontSize: "12px",
                                            fill: "#6b7280",
                                          },
                                        }}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: "#fff",
                                          border: "1px solid #e5e7eb",
                                          borderRadius: "8px",
                                          fontSize: "12px",
                                        }}
                                        formatter={(
                                          value: any,
                                          name: string,
                                        ) => {
                                          if (name === "errorRate")
                                            return [`${value}%`, "Error Rate"];
                                          return [value, name];
                                        }}
                                        labelFormatter={(label, payload) => {
                                          const data = payload?.[0]?.payload;
                                          if (data) {
                                            return `${label} - Lost: ${data.lostCount} / Total: ${data.totalCount}`;
                                          }
                                          return label;
                                        }}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="errorRate"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={{
                                          fill: "#ef4444",
                                          r: 5,
                                          strokeWidth: 2,
                                          stroke: "#fff",
                                        }}
                                        activeDot={{
                                          r: 7,
                                          strokeWidth: 2,
                                          stroke: "#fff",
                                        }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                  {errorRateTrendChartData.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground mt-4">
                                      No data available for the selected period
                                    </div>
                                  )}
                                </div>

                                {/* Pending Requests Trend */}
                                <div className="bg-white border border-border rounded-xl p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-base font-medium text-foreground">
                                      Pending Requests Trend
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Monthly count of open opportunities
                                    </p>
                                  </div>
                                <ResponsiveContainer width="100%" height={280}>
                                  <BarChart data={pendingRequestsTrendChartData} barSize={30}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis
                                      dataKey="month"
                                      stroke="#9ca3af"
                                      style={{ fontSize: '12px' }}
                                      tick={{ fill: '#6b7280' }}
                                    />
                                    <YAxis
                                      stroke="#9ca3af"
                                      style={{ fontSize: '12px' }}
                                      tick={{ fill: '#000000' }}
                                      label={{ value: 'Pending Requests', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#000000' } }}
                                      domain={[0, 'dataMax']}
                                    />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                      }}
                                      cursor={false}
                                    />
                                    <Bar dataKey="requests" fill="#f87171" radius={[8, 8, 0, 0]} isAnimationActive={false} onClick={(data, index) => setSelectedPendingRequestsBarIndex(selectedPendingRequestsBarIndex === index ? null : index)} cursor="pointer">
                                      {pendingRequestsTrendChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#f87171" opacity={selectedPendingRequestsBarIndex === null || selectedPendingRequestsBarIndex === index ? 1 : 0.3} stroke={selectedPendingRequestsBarIndex === index ? '#000' : 'none'} strokeWidth={selectedPendingRequestsBarIndex === index ? 2 : 0} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                                {pendingRequestsTrendChartData.length === 0 && (
                                  <div className="text-center text-sm text-muted-foreground mt-4">
                                    No data available for the selected period
                                  </div>
                                )}
                                </div>
                              </div>
                            </div>

                            {/* Alerts Sidebar - 4/12 width with max height */}
                            <div className="xl:col-span-4">
                              <div className="max-h-[480px] overflow-hidden">
                                <RealTimeAlerts
                                  description="Critical failures, high-severity incidents, and escalation-required alerts"
                                  useRiskAlerts={true}
                                  serviceCategory={
                                    globalFilters.serviceCategory
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Full Width Sections */}
                          <div className="grid grid-cols-1 gap-6 mt-6">
                            {/* Section: Incidents & Types */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-1 h-12 rounded-full bg-red-500"></div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  Incidents & Types
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Category counts and alert type distribution
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Incidents by Priority (Bar) */}
                              <div className="bg-white border border-border rounded-xl p-6">
                                <div className="space-y-1 mb-4">
                                  <h4 className="text-base font-medium text-foreground">
                                    Incidents by Priority
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Distribution of incidents by severity level
                                  </p>
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                  <BarChart
                                    data={incidentsByPriorityData}
                                    barCategoryGap="5%"
                                  >
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      stroke="#f3f4f6"
                                      vertical={false}
                                    />
                                    <XAxis
                                      dataKey="priority"
                                      stroke="#9ca3af"
                                      style={{ fontSize: "12px" }}
                                      tick={{ fill: "#6b7280" }}
                                      label={{
                                        value: "Priority Level",
                                        position: "insideBottom",
                                        offset: -5,
                                        style: {
                                          fontSize: "12px",
                                          fill: "#6b7280",
                                        },
                                      }}
                                    />
                                    <YAxis
                                      stroke="#9ca3af"
                                      style={{ fontSize: "12px" }}
                                      tick={{ fill: "#6b7280" }}
                                      label={{
                                        value: "Number of Incidents",
                                        angle: -90,
                                        position: "insideLeft",
                                        style: {
                                          fontSize: "12px",
                                          fill: "#6b7280",
                                        },
                                      }}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "none",
                                        borderRadius: "12px",
                                        boxShadow:
                                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                        fontSize: "12px",
                                      }}
                                      cursor={false}
                                    />
                                    <Bar
                                      dataKey="incidents"
                                      name="Incidents"
                                      radius={[12, 12, 0, 0]}
                                      maxBarSize={80}
                                      onClick={(data, index) =>
                                        setSelectedPriorityIndex(
                                          selectedPriorityIndex === index
                                            ? null
                                            : index,
                                        )
                                      }
                                      cursor="pointer"
                                    >
                                      {incidentsByPriorityData.map(
                                        (entry, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            opacity={
                                              selectedPriorityIndex === null ||
                                              selectedPriorityIndex === index
                                                ? 1
                                                : 0.4
                                            }
                                            stroke={
                                              selectedPriorityIndex === index
                                                ? "#000"
                                                : "none"
                                            }
                                            strokeWidth={
                                              selectedPriorityIndex === index
                                                ? 2
                                                : 0
                                            }
                                          />
                                        ),
                                      )}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                                {incidentsByPriorityData.length === 0 && (
                                  <div className="text-center text-sm text-muted-foreground mt-4">
                                    No data available for the selected period
                                  </div>
                                )}
                              </div>

                              {/* Incidents by Status (Pie) */}
                              <div className="bg-white border border-border rounded-xl p-6">
                                <div className="space-y-1 mb-4">
                                  <h4 className="text-base font-medium text-foreground">
                                    Incidents by Status
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Current state of incidents (Active,
                                    Resolved, Canceled)
                                  </p>
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                  <PieChart>
                                    <Pie
                                      data={incidentsByStatusData}
                                      dataKey="value"
                                      nameKey="type"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={90}
                                      onClick={(data, index) =>
                                        setSelectedStatusIndex(
                                          selectedStatusIndex === index
                                            ? null
                                            : index,
                                        )
                                      }
                                      cursor="pointer"
                                    >
                                      {incidentsByStatusData.map(
                                        (entry, index) => (
                                          <Cell
                                            key={`status-${index}`}
                                            fill={entry.fill}
                                            opacity={
                                              selectedStatusIndex === null ||
                                              selectedStatusIndex === index
                                                ? 1
                                                : 0.3
                                            }
                                            stroke={
                                              selectedStatusIndex === index
                                                ? "#000"
                                                : "none"
                                            }
                                            strokeWidth={
                                              selectedStatusIndex === index
                                                ? 2
                                                : 0
                                            }
                                          />
                                        ),
                                      )}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "none",
                                        borderRadius: "12px",
                                        boxShadow:
                                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                        fontSize: "12px",
                                      }}
                                      formatter={(value, name) => [
                                        value,
                                        `${name} Incidents`,
                                      ]}
                                    />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                                {incidentsByStatusData.length === 0 && (
                                  <div className="text-center text-sm text-muted-foreground mt-4">
                                    No data available for the selected period
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Section: Frequency by Region & Time */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-1 h-12 rounded-full bg-red-500"></div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  Frequency by Region & Time
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Heatmap of incident density across regions and
                                  hours
                                </p>
                              </div>
                            </div>
                            {/* Risk Frequency Heatmap (Regions x Time) - one column full width */}
                            <div className="bg-white border border-border rounded-xl p-6">
                              <div className="space-y-1 mb-4">
                                <h4 className="text-base font-medium text-foreground">
                                  Risk Frequency Heatmap
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Incident density across regions and time slots
                                </p>
                              </div>
                              <RiskHeatmapGrid data={riskHeatmapData} />
                            </div>
                          </div>
                        </div>
                      );

                      return (
                        <div>
                          {/* Global Filters */}
                          <div className="mb-8">
                            <div className="bg-white border border-border rounded-xl p-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Year Filter - PRIMARY AND ONLY DATE FILTER */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        name="Calendar"
                                        size={16}
                                        className="text-blue-600"
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        Year
                                      </span>
                                    </div>
                                    <div className="relative">
                                      <Select
                                        value={
                                          globalFilters?.year ||
                                          new Date().getFullYear().toString()
                                        }
                                        onChange={(value) => {
                                          const yearValue = String(value);
                                          updateGlobalFilter("year", yearValue);
                                        }}
                                        options={globalFilterOptions?.year}
                                        className="w-full"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        name="Filter"
                                        size={16}
                                        className="text-green-600"
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        Service Category
                                      </span>
                                    </div>
                                    <div className="relative">
                                      <Select
                                        value={globalFilters?.serviceCategory}
                                        onChange={(value) =>
                                          updateGlobalFilter(
                                            "serviceCategory",
                                            String(value),
                                          )
                                        }
                                        options={
                                          globalFilterOptions?.serviceCategory
                                        }
                                        className="w-full"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        name="Users"
                                        size={16}
                                        className="text-purple-600"
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        Business Size
                                      </span>
                                    </div>
                                    <div className="relative">
                                      <Select
                                        value={globalFilters?.businessSize}
                                        onChange={(value) =>
                                          updateGlobalFilter(
                                            "businessSize",
                                            String(value),
                                          )
                                        }
                                        options={
                                          globalFilterOptions?.businessSize
                                        }
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Active Filter Tags */}
                                {hasActiveFilters() && (
                                  <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <Icon
                                          name="Tag"
                                          size={14}
                                          className="text-gray-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                          Active Filters:
                                        </span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="text-xs"
                                      >
                                        <Icon
                                          name="X"
                                          size={14}
                                          className="mr-1"
                                        />
                                        Clear All
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {/* Show Year filter tag if not current year */}
                                      {globalFilters.year !==
                                        new Date().getFullYear().toString() && (
                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                                          <Icon
                                            name="Calendar"
                                            size={12}
                                            className="text-blue-600"
                                          />
                                          <span className="text-xs font-medium text-blue-800">
                                            Year:{" "}
                                            {getFilterLabel(
                                              "year",
                                              globalFilters.year,
                                            )}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateGlobalFilter(
                                                "year",
                                                new Date()
                                                  .getFullYear()
                                                  .toString() as any,
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            <Icon name="X" size={10} />
                                          </button>
                                        </div>
                                      )}

                                      {globalFilters.serviceCategory !==
                                        "all" && (
                                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                                          <Icon
                                            name="Filter"
                                            size={12}
                                            className="text-green-600"
                                          />
                                          <span className="text-xs font-medium text-green-800">
                                            {getFilterLabel(
                                              "serviceCategory",
                                              globalFilters.serviceCategory,
                                            )}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateGlobalFilter(
                                                "serviceCategory",
                                                "all" as any,
                                              )
                                            }
                                            className="text-green-600 hover:text-green-800"
                                          >
                                            <Icon name="X" size={10} />
                                          </button>
                                        </div>
                                      )}

                                      {globalFilters.businessSize !== "all" && (
                                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
                                          <Icon
                                            name="Users"
                                            size={12}
                                            className="text-purple-600"
                                          />
                                          <span className="text-xs font-medium text-purple-800">
                                            {getFilterLabel(
                                              "businessSize",
                                              globalFilters.businessSize,
                                            )}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateGlobalFilter(
                                                "businessSize",
                                                "all",
                                              )
                                            }
                                            className="text-purple-600 hover:text-purple-800"
                                          >
                                            <Icon name="X" size={10} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {activeSecondLayerTab ===
                            "service-delivery-performance" &&
                            renderServiceDeliveryPerformance()}
                          {activeSecondLayerTab ===
                            "service-provider-performance" &&
                            renderServiceProviderPerformance()}
                          {activeSecondLayerTab === "enterprise-usage-impact" &&
                            renderEnterpriseUsageImpact()}
                          {activeSecondLayerTab === "risk-layer" &&
                            renderRiskLayer()}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            );
          } else if (
            activeDashboardTab === "operations" &&
            activeSecondLayerTab === "dashboard-2"
          ) {
            return (
              /* Dashboard 2 Dynamic Content */
              <div className="text-center py-20">
                <Icon
                  name="Construction"
                  size={64}
                  className="text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Dashboard 2 - Provider Analytics
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Advanced provider performance analytics and insights.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} />
                    <span>Active Tab: Operations</span>
                  </div>
                  <span className="mx-2">•</span>
                  <div className="flex items-center gap-2">
                    <Icon name="Layout" size={16} />
                    <span>Selected Dashboard: Dashboard 2</span>
                  </div>
                </div>
              </div>
            );
          } else if (activeDashboardTab === "market") {
            return (
              /* Market Dashboard Dynamic Content */
              <div className="text-center py-20">
                <Icon
                  name="TrendingUp"
                  size={64}
                  className="text-green-500 mx-auto mb-4"
                />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Market Analytics Dashboard
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Market penetration, growth trends, and competitive analysis.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={16} />
                    <span>Active Tab: Market</span>
                  </div>
                </div>
              </div>
            );
          } else if (activeDashboardTab === "strategic") {
            return (
              /* Strategic Dashboard Dynamic Content */
              <div className="text-center py-20">
                <Icon
                  name="Target"
                  size={64}
                  className="text-purple-500 mx-auto mb-4"
                />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Strategic Planning Dashboard
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Strategic goals, long-term planning, and organizational
                  objectives.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="Target" size={16} />
                    <span>Active Tab: Strategic</span>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              /* Default Placeholder */
              <div className="text-center py-20">
                <Icon
                  name="Construction"
                  size={64}
                  className="text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Dashboard Under Development
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The "{activeDashboardTab}" dashboard is currently being
                  developed.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} />
                    <span>Active Tab: {activeDashboardTab}</span>
                  </div>
                </div>
              </div>
            );
          }
        })()}
      </main>
    </div>
  );
};

export default EJPOperationsDashboard;
