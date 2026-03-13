import { useState, useEffect, useMemo } from "react";
import KPICard from "./components/KPICard";
import EnterpriseOutcomesChart from "./components/EnterpriseOutcomesChart";
import OperationalMetricsChart from "./components/OperationalMetricsChart";
import RealTimeAlerts from "./components/RealTimeAlerts";
import FunnelChart from "./components/FunnelChart";
import HeatmapChart from "./components/HeatmapChart";
import RadarChart from "./components/RadarChart";
import DonutChart from "./components/DonutChart";
import ScatterPlot from "./components/ScatterPlot";
import DeliverySuccessCombo from "./components/DeliverySuccessCombo";
import TicketsStackedBar from "./components/TicketsStackedBar";
import TicketVolumeMA from "./components/TicketVolumeMA";
import CSATTrend from "./components/CSATTrend";
import FirstResponseTime from "./components/FirstResponseTime";
import ErrorRateHeatmap from "./components/ErrorRateHeatmap";
import GaugeChart from "./components/GaugeChart";
// New ShadCN UI chart components
import ClusteredBarChart from "./components/ClusteredBarChart";
import LineChartWithRange from "./components/LineChartWithRange";
import BarChartWithGradient from "./components/BarChartWithGradient";
import StackedBarChart from "./components/StackedBarChart";
import ComboLineChart from "./components/ComboLineChart";
import LineChartWithTrend from "./components/LineChartWithTrend";
import AlertPanel from "./components/AlertPanel";
import ChartTheme from "./components/ChartTheme";
import Icon from "../../components/ui/AppIcon";
import Button from "../../components/ui/ButtonComponent";
import Select from "../../components/ui/Select";
import DataService, { DashboardData } from "../../backend/lib/dataService";
import { fetchPartnerLeadAlerts } from "../../api/analytics/partnerAnalytics";
import ProductsService from "../../api/analytics/products";
import ProfilesService from "../../api/analytics/profiles";
import { API_BASE_URL } from "../../api/analytics/config";
import { useAuth } from "../../context/AuthContext";
import { evaluateAllMetrics, MetricsData } from "./utils/alertEvaluator";
// import DataService, { DashboardData } from '../../lib/dataService';

const EJPTransactionDashboard = () => {
  const { user } = useAuth();
  const defaultPartnerId = import.meta.env.VITE_DEFAULT_PARTNER_ACCOUNT_ID as
    | string
    | undefined;
  const resolvedPartnerId =
    (user?.organization_id || defaultPartnerId || "").trim() || undefined;
  const [activeTab, setActiveTab] = useState("service-adoption");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [alerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "High Drop-off Rate",
      message: "Requests drop-off rate increased to 18%",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: "medium",
    },
    {
      id: 2,
      type: "info",
      title: "Activation Spike",
      message: "Service activation rate reached 85%",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      severity: "low",
    },
  ]);

  // Global filters
  const currentYear = new Date().getFullYear();
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: String(currentYear),
    serviceCategory: "all",
    subServiceType: "all",
    region: "all",
    enterpriseSize: "all",
  });

  // Data loaded via DataService (replaces hardcoded arrays)
  const [loadedData, setLoadedData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    serviceAdoption: true,
    charts: true,
    performance: true,
  });
  // Product data for filtering
  const [serviceTypeOptions, setServiceTypeOptions] = useState([
    { value: "all", label: "All Types" },
    { value: "financial", label: "Financial" },
    { value: "non-financial", label: "Non Financial" },
  ]);
  const [subServiceTypeOptions, setSubServiceTypeOptions] = useState([
    { value: "all", label: "All Sub-Services" },
  ]);
  const [regionOptions, setRegionOptions] = useState([
    { value: "all", label: "All Regions" },
  ]);
  const [enterpriseSizeOptions, setEnterpriseSizeOptions] = useState([
    { value: "all", label: "All Sizes" },
  ]);
  // Uptime trend controls
  const [uptimePeriod, setUptimePeriod] = useState("7d");
  // Lead alerts
  const [leadAlerts, setLeadAlerts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const year = parseInt(globalFilters.dateRange);
    const isValidYear = !isNaN(year) && year >= 2000 && year <= 2100;

    const serviceFilters = {
      dateRange: isValidYear ? ("custom" as any) : globalFilters.dateRange,
      customStart: isValidYear ? `${year}-01-01` : undefined,
      customEnd: isValidYear ? `${year}-12-31` : undefined,
      year: isValidYear ? String(year) : undefined,
      serviceCategory: globalFilters.serviceCategory as any,
      subServiceType: globalFilters.subServiceType as any,
      region: globalFilters.region as any,
      enterpriseSize: (globalFilters.enterpriseSize as any).replace(
        /\s.*/,
        "",
      ) as any,
    } as any;

    // Initialize with empty data immediately
    const initialData: DashboardData = {
      serviceAdoptionMetrics: [],
      servicePerformanceMetrics: [],
      enterpriseOutcomesMetrics: [],
      operationalMetrics: [],
      timeToActivation: [],
      dropoff: [],
      churnRetention: [],
      repeatUsage: null,
      activeUserRate: null,
    };

    if (isMounted) {
      setLoadedData(initialData);
      setIsLoading(false);
    }

    // Fetch data with progressive updates
    DataService.fetchDashboardDataStreaming(
      serviceFilters,
      { partnerId: resolvedPartnerId },
      (partialData) => {
        // Update UI as each section completes
        if (isMounted) {
          setLoadedData((prev) => ({ ...prev!, ...partialData }));

          // Update loading states
          if (partialData.serviceAdoptionMetrics) {
            setLoadingStates((prev) => ({ ...prev, serviceAdoption: false }));
          }
          if (partialData.timeToActivation || partialData.dropoff) {
            setLoadingStates((prev) => ({ ...prev, charts: false }));
          }
          if (partialData.churnRetention || partialData.repeatUsage) {
            setLoadingStates((prev) => ({ ...prev, performance: false }));
          }
        }
      },
    )
      .then((finalData) => {
        if (isMounted) {
          setLoadedData(finalData);
          setLoadingStates({
            serviceAdoption: false,
            charts: false,
            performance: false,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        if (isMounted) {
          setLoadingStates({
            serviceAdoption: false,
            charts: false,
            performance: false,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [globalFilters]);

  useEffect(() => {
    fetchPartnerLeadAlerts()
      .then((data) => {
        const mapped = data.map((alert: any) => ({
          title: alert.title,
          date: alert.timestamp,
          context: alert.description,
          severity: alert.severity.toLowerCase(),
        }));
        setLeadAlerts(mapped);
      })
      .catch((err) => console.error("Failed to load alerts:", err));
  }, []);

  // Load service types, sub-service types, regions, and enterprise sizes on component mount
  useEffect(() => {
    ProductsService.getServiceTypes().then(setServiceTypeOptions);
    ProductsService.getSubServiceTypes().then(setSubServiceTypeOptions);
    ProductsService.getRegions().then(setRegionOptions);
    ProfilesService.getBusinessSizes().then(setEnterpriseSizeOptions);
  }, []);

  // Apply filters to loaded datasets (Service Type / Sub-Service Type)
  const filteredData = loadedData;

  // Tab configuration
  const dashboardTabs = [
    {
      id: "service-adoption",
      label: "Service Adoption & Reach",
      icon: "Users",
    },
    {
      id: "service-performance",
      label: "Service Performance & Delivery Quality",
      icon: "Target",
    },
    {
      id: "enterprise-outcomes",
      label: "Enterprise Outcomes & Impact",
      icon: "TrendingUp",
    },
    {
      id: "operational-risk",
      label: "Operational & Risk Metrics",
      icon: "AlertTriangle",
    },
  ];

  // Filter options
  const filterOptions = {
    dateRange: Array.from({ length: 10 }, (_, i) => {
      const year = currentYear - i;
      return { value: String(year), label: String(year) };
    }),
    serviceCategory: serviceTypeOptions,
    subServiceType: subServiceTypeOptions,
    region: regionOptions,
    enterpriseSize: enterpriseSizeOptions,
  };

  // Update global filters
  const updateGlobalFilter = async (filterKey: string, value: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilters({
      dateRange: String(currentYear),
      serviceCategory: "all",
      subServiceType: "all",
      region: "all",
      enterpriseSize: "all",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      globalFilters.dateRange !== String(currentYear) ||
      globalFilters.serviceCategory !== "all" ||
      globalFilters.subServiceType !== "all" ||
      globalFilters.region !== "all" ||
      globalFilters.enterpriseSize !== "all"
    );
  };

  // Get filter label for display
  const getFilterLabel = (filterKey: string, value: string) => {
    const options = filterOptions[filterKey as keyof typeof filterOptions];
    const option = options?.find((opt: any) => opt.value === value);
    return option?.label || value;
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Service Adoption & Reach Metrics (1-4) - Based on Table Metrics
  const serviceAdoptionMetrics = loadedData?.serviceAdoptionMetrics ?? [];

  // Service Performance & Delivery Quality Metrics (7-11) - Based on Table Metrics
  const servicePerformanceMetrics = loadedData?.servicePerformanceMetrics ?? [];

  // Enterprise Outcomes & Impact Metrics (12-14, 19-24) - Based on Table Metrics
  const enterpriseOutcomesMetrics = loadedData?.enterpriseOutcomesMetrics ?? [];

  // Operational & Risk Metrics (15-18) - Based on Table Metrics
  const operationalMetrics = loadedData?.operationalMetrics ?? [];

  // Calculate metrics for alert evaluation and generate alerts
  const generatedAlerts = useMemo(() => {
    const activationMetric = serviceAdoptionMetrics.find(
      (m) => m.title === "Activation Rate",
    );
    const activationRateValue = activationMetric
      ? typeof activationMetric.value === "string"
        ? parseFloat(activationMetric.value)
        : activationMetric.value
      : 0;
    const activationRateSparkline = activationMetric?.sparklineData ?? [];
    const activationRatePrevious =
      activationRateSparkline.length > 1
        ? activationRateSparkline[activationRateSparkline.length - 2]
        : activationRateValue;
    const activationRateTarget = activationMetric?.target
      ? parseFloat(activationMetric.target.replace("%", ""))
      : undefined;

    const timeToActivationData = filteredData?.timeToActivation ?? [];
    const timeToActivationCurrent =
      timeToActivationData.length > 0
        ? timeToActivationData[timeToActivationData.length - 1].avg
        : 0;
    const timeToActivationPrevious =
      timeToActivationData.length > 1
        ? timeToActivationData[timeToActivationData.length - 2].avg
        : timeToActivationCurrent;
    const timeToActivationHistory = timeToActivationData.map((d) => d.avg);

    const dropoffData = filteredData?.dropoff ?? [];
    const dropoffCurrent =
      dropoffData.length > 0 ? dropoffData[dropoffData.length - 1].value : 0;
    const dropoffPrevious =
      dropoffData.length > 1
        ? dropoffData[dropoffData.length - 2].value
        : dropoffCurrent;
    const dropoffTarget = 10; // Default target of 10%

    const metricsForAlerts: MetricsData = {
      activationRate: {
        current: activationRateValue,
        previous: activationRatePrevious,
        target: activationRateTarget,
        history: activationRateSparkline,
      },
      timeToActivation: {
        current: timeToActivationCurrent,
        previous: timeToActivationPrevious,
        history: timeToActivationHistory,
      },
      dropOffRate: {
        current: dropoffCurrent,
        previous: dropoffPrevious,
        target: dropoffTarget,
      },
    };

    return evaluateAllMetrics(metricsForAlerts);
  }, [
    serviceAdoptionMetrics,
    filteredData?.timeToActivation,
    filteredData?.dropoff,
  ]);

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <div className="px-4 sm:px-6 pt-4 pb-4 bg-card border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              Service Provider Operations Dashboard (EJP Transactions)
            </h1>
            <p className="text-sm text-muted-foreground">
              Track and analyze service provider operations for EJP Transactions
              with real-time metrics, service requests insights, performance
              indicators, and enterprise outcomes for strategic decision-making.
            </p>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isRealTimeActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isRealTimeActive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
              />
              <span>{isRealTimeActive ? "Live" : "Paused"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="bg-card border-b border-border">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-center">
            {dashboardTabs.map((tab, index) => {
              // First tab is active, last three are TBU
              const isTbu = index >= 1; // Last three tabs (index 1, 2, 3)
              return (
                <button
                  key={tab.id}
                  disabled={isTbu}
                  onClick={() => !isTbu && setActiveTab(tab.id)}
                  className={`relative flex-1 px-3 sm:px-8 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isTbu
                      ? "text-muted-foreground bg-muted cursor-not-allowed border-b-2 border-transparent"
                      : activeTab === tab.id
                        ? "text-primary bg-primary/10 border-b-2 border-primary"
                        : "text-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                  tabIndex={isTbu ? -1 : 0}
                  role="tab"
                  aria-disabled={isTbu}
                  aria-selected={!isTbu && activeTab === tab.id}
                  aria-controls={`dashboard-${tab.id}`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Icon name={tab.icon} size={14} />
                    {isTbu ? (
                      <span>TBU</span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">
                          {tab.label.split(" ")[0]}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-6 pt-4 pb-20">
        {/* Show Coming Soon for last three tabs, normal content for first tab */}
        {activeTab === "service-performance" ||
        activeTab === "enterprise-outcomes" ||
        activeTab === "operational-risk" ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Settings" size={48} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're working hard to bring you comprehensive analytics and
                insights for this section of the Service Provider Operations
                Dashboard.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-lg mx-auto">
                <p className="text-sm text-primary">
                  This section will include detailed metrics and visualizations
                  for{" "}
                  {activeTab === "service-performance"
                    ? "Service Performance & Delivery Quality"
                    : activeTab === "enterprise-outcomes"
                      ? "Enterprise Outcomes & Impact"
                      : "Operational & Risk Metrics"}
                  .
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Global Filters */}
            <div className="mb-10">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          name="Calendar"
                          size={16}
                          className="text-blue-600"
                        />
                        <span className="text-sm font-medium text-foreground">
                          Date Range
                        </span>
                      </div>
                      <Select
                        value={globalFilters.dateRange}
                        onChange={(value) =>
                          updateGlobalFilter("dateRange", String(value))
                        }
                        options={filterOptions.dateRange}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          name="Filter"
                          size={16}
                          className="text-green-600"
                        />
                        <span className="text-sm font-medium text-foreground">
                          Service Type
                        </span>
                      </div>
                      <Select
                        value={globalFilters.serviceCategory}
                        onChange={(value) =>
                          updateGlobalFilter("serviceCategory", String(value))
                        }
                        options={filterOptions.serviceCategory}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          name="Building"
                          size={16}
                          className="text-indigo-600"
                        />
                        <span className="text-sm font-medium text-foreground">
                          Enterprise Size
                        </span>
                      </div>
                      <Select
                        value={globalFilters.enterpriseSize}
                        onChange={(value) =>
                          updateGlobalFilter("enterpriseSize", String(value))
                        }
                        options={filterOptions.enterpriseSize}
                        className="w-full"
                      />
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
                          <span className="text-sm font-medium text-foreground">
                            Active Filters:
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-xs"
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          Clear All
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {globalFilters.dateRange !== String(currentYear) && (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                            <Icon
                              name="Calendar"
                              size={12}
                              className="text-blue-600"
                            />
                            <span className="text-xs font-medium text-blue-800">
                              {getFilterLabel(
                                "dateRange",
                                globalFilters.dateRange,
                              )}
                            </span>
                            <button
                              onClick={() =>
                                updateGlobalFilter(
                                  "dateRange",
                                  String(currentYear),
                                )
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Icon name="X" size={10} />
                            </button>
                          </div>
                        )}

                        {globalFilters.serviceCategory !== "all" && (
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
                                updateGlobalFilter("serviceCategory", "all")
                              }
                              className="text-green-600 hover:text-green-800"
                            >
                              <Icon name="X" size={10} />
                            </button>
                          </div>
                        )}

                        {globalFilters.enterpriseSize !== "all" && (
                          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                            <Icon
                              name="Building"
                              size={12}
                              className="text-indigo-600"
                            />
                            <span className="text-xs font-medium text-indigo-800">
                              {getFilterLabel(
                                "enterpriseSize",
                                globalFilters.enterpriseSize,
                              )}
                            </span>
                            <button
                              onClick={() =>
                                updateGlobalFilter("enterpriseSize", "all")
                              }
                              className="text-indigo-600 hover:text-indigo-800"
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

            {/* Dashboard Content - Service Adoption & Reach */}
            {activeTab === "service-adoption" && (
              <div className="space-y-8">
                {/* Service Adoption Section - Show skeleton or data */}
                {loadingStates.serviceAdoption ? (
                  <>
                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: ChartTheme.base.primaryBlue }}
                      ></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Service Adoption & Reach Headlines
                        </h3>
                        <p className="text-sm text-gray-500">
                          Key metrics tracking total engaged enterprises,
                          activation rates, usage patterns, and retention across
                          EJP Transaction services
                        </p>
                      </div>
                    </div>

                    {/* Skeleton for KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px]"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Service Requests and Activation Performance Section */}
                    <div className="mt-12">
                      <div className="flex items-center gap-4 mb-8">
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{
                            backgroundColor: ChartTheme.base.primaryBlue,
                          }}
                        ></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Service Requests and Activation Performance
                          </h3>
                          <p className="text-sm text-gray-500">
                            Service activation and requests performance metrics
                            showing conversion rates and enterprise engagement
                          </p>
                        </div>
                      </div>

                      {/* Top Section - Clustered Bar Chart + Alert Panel Skeletons */}
                      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 mb-8">
                        <div className="xl:col-span-5 bg-white border border-gray-200 rounded-xl p-6 h-80 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 h-80 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                      </div>

                      {/* Middle Section - Two Charts Skeletons */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-64 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-64 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service Usage and Loyalty Section */}
                    <div className="mt-12">
                      <div className="flex items-center gap-4 mb-8">
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{
                            backgroundColor: ChartTheme.base.primaryBlue,
                          }}
                        ></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Service Usage and Loyalty
                          </h3>
                          <p className="text-sm text-gray-500">
                            Enterprise usage patterns, frequency analysis, and
                            retention metrics across different service
                            categories
                          </p>
                        </div>
                      </div>

                      {/* Row 1 - Two Charts Skeletons */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-80 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-80 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-600 text-center">
                            Please wait, loading your data in a few...
                          </p>
                        </div>
                      </div>

                      {/* Row 2 - Churn & Retention Skeleton */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 h-96 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-sm text-gray-600 text-center">
                          Please wait, loading your data in a few...
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: ChartTheme.base.primaryBlue }}
                      ></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Service Adoption & Reach Headlines
                        </h3>
                        <p className="text-sm text-gray-500">
                          Key metrics tracking total engaged enterprises,
                          activation rates, usage patterns, and retention across
                          EJP Transaction services
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {serviceAdoptionMetrics.map((metric, index) => (
                        <KPICard
                          key={index}
                          title={metric.title}
                          value={metric.value}
                          unit={metric.unit}
                          trend={metric.trend}
                          trendValue={metric.trendValue}
                          threshold={metric.threshold}
                          description={metric.description}
                          icon={metric.icon}
                          sparklineData={metric.sparklineData}
                          target={metric.target}
                        />
                      ))}
                    </div>

                    {/* Service Requests and Activation Performance Section */}
                    <div className="mt-12">
                      <div className="flex items-center gap-4 mb-8">
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{
                            backgroundColor: ChartTheme.base.primaryBlue,
                          }}
                        ></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Service Requests and Activation Performance
                          </h3>
                          <p className="text-sm text-gray-500">
                            Service activation and requests performance metrics
                            showing conversion rates and enterprise engagement
                          </p>
                        </div>
                      </div>

                      {/* Top Section - Clustered Bar Chart + Alert Panel */}
                      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 mb-8">
                        {/* Clustered Bar Chart */}
                        <div className="xl:col-span-5">
                          <ClusteredBarChart
                            title="Requests & Activation"
                            description="Shows how many enterprises requested service vs. how many activated successfully."
                            data={
                              (filteredData?.onboardingActivation as any) ?? []
                            }
                            height="h-80"
                          />
                        </div>

                        {/* Alert Panel */}
                        <div className="xl:col-span-2">
                          <AlertPanel
                            title="Alerts"
                            description="Real-time alerts for critical changes in requests and activation metrics with severity indicators."
                            alerts={
                              generatedAlerts.length > 0
                                ? generatedAlerts
                                : [
                                    {
                                      title: "No alerts",
                                      date: new Date().toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" },
                                      ),
                                      context:
                                        "All metrics are within expected ranges",
                                      severity: "low",
                                      description:
                                        "All service adoption and activation metrics are performing within their target thresholds. No immediate action required.",
                                    },
                                  ]
                            }
                          />
                        </div>
                      </div>

                      {/* Middle Section - Two Charts */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        {/* Time to Activation Line Chart */}
                        <LineChartWithRange
                          title="Time to Activation"
                          description="Average number of days it takes for your service requests to become activated."
                          data={filteredData?.timeToActivation ?? []}
                          height="h-64"
                          insightText="Lowest in Aug: 1.3d; Sep up to 2.1d (+0.8d)"
                          insightMonth="Aug"
                        />

                        {/* Drop-off Rate During Requests Bar Chart */}
                        <BarChartWithGradient
                          title="Drop-off Rate During Requests"
                          description="Percentage of activated requests that were later cancelled."
                          data={filteredData?.dropoff ?? []}
                          height="h-64"
                          thresholds={{ low: 10, moderate: 15 }}
                        />
                      </div>
                    </div>

                    {/* Service Usage and Loyalty Section */}
                    <div className="mt-12">
                      <div className="flex items-center gap-4 mb-8">
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{
                            backgroundColor: ChartTheme.base.primaryBlue,
                          }}
                        ></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Service Usage and Loyalty
                          </h3>
                          <p className="text-sm text-gray-500">
                            Enterprise usage patterns, frequency analysis, and
                            retention metrics across different service
                            categories
                          </p>
                        </div>
                      </div>

                      {/* Row 1 - Two Charts Side by Side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart A - Active User Rate */}
                        <LineChartWithTrend
                          title="Active User Rate"
                          description="Percent of enterprises actively using your services this period."
                          data={filteredData?.activeUserRate ?? []}
                          height="h-80"
                          ariaDescription="Monthly active user rate with bars and 3-month trendline."
                        />

                        {/* Chart B - Repeat Usage Rate */}
                        <StackedBarChart
                          title="Repeat Usage Rate"
                          description="Number of repeat users vs first-time users — indicates loyalty and repeat value."
                          data={filteredData?.repeatUsage ?? []}
                          height="h-80"
                          ariaDescription="Stacked bars showing monthly first-time and repeat users, total usage, and proportion of repeats."
                        />
                      </div>

                      {/* Row 2 - Churn & Retention Over Time */}
                      <ComboLineChart
                        title="Churn & Retention Over Time"
                        description="Shows how many enterprises return vs. how many switch to other providers after their first completed case."
                        data={filteredData?.churnRetention ?? []}
                        height="h-96"
                        ariaDescription="Dual-axis view of monthly churn and retention rates with moving averages."
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {false && activeTab === "service-performance" && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Service Performance & Delivery Quality
                </h3>
                <p className="text-sm text-gray-500">
                  Service delivery performance metrics: SLA compliance,
                  resolution time, success rate, and customer satisfaction for
                  EJP Transactions
                </p>
              </div>
            </div>

            {/* KPI headline grid - Service Delivery KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="SLA Compliance Rate"
                value="98.5"
                unit="%"
                trend="up"
                trendValue="+0.8%"
                threshold="excellent"
                description="Percentage of services delivered within the agreed SLA."
                icon="CheckCircle"
                sparklineData={[97.2, 97.5, 97.8, 98.0, 98.2, 98.5]}
                target="≥ 98%"
              />
              <KPICard
                title="Average Resolution Time"
                value="2.2"
                unit="hours"
                trend="down"
                trendValue="-0.3"
                threshold="excellent"
                description="Average time to resolve service-related issues."
                icon="Clock"
                sparklineData={[2.8, 2.7, 2.6, 2.5, 2.4, 2.2]}
                target="≤ 2.5 hours"
              />
              <KPICard
                title="Service Success Rate"
                value="99.2"
                unit="%"
                trend="up"
                trendValue="+0.5%"
                threshold="excellent"
                description="Percentage of successful service transactions out of all service requests."
                icon="Target"
                sparklineData={[98.2, 98.4, 98.6, 98.8, 99.0, 99.2]}
                target="≥ 99%"
              />
              <KPICard
                title="Customer Satisfaction Index (CSAT)"
                value="91.3"
                unit="%"
                trend="up"
                trendValue="+1.5%"
                threshold="excellent"
                description="Average satisfaction score from enterprise feedback after service completion."
                icon="ThumbsUp"
                sparklineData={[88.5, 89.0, 89.5, 90.0, 90.5, 91.3]}
                target="≥ 90%"
              />
            </div>

            {/* Section: Service Efficiency & Response Time */}
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-12 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Service Efficiency & Response Time
                  </h3>
                  <p className="text-sm text-gray-500">
                    Speed and responsiveness: delivery time, ticket resolution,
                    first-time resolution, and escalations.
                  </p>
                </div>
              </div>

              {/* Top Section - Delivery Success Combo Chart + Alert Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 mb-8">
                {/* Delivery Success Combo Chart */}
                <div className="xl:col-span-5">
                  <DeliverySuccessCombo
                    data={[
                      { month: "Jan", avgDeliveryDays: 3.2, successRate: 99.7 },
                      { month: "Feb", avgDeliveryDays: 3.0, successRate: 99.5 },
                      { month: "Mar", avgDeliveryDays: 3.1, successRate: 99.6 },
                      { month: "Apr", avgDeliveryDays: 3.4, successRate: 99.8 },
                      { month: "May", avgDeliveryDays: 3.5, successRate: 99.7 },
                      { month: "Jun", avgDeliveryDays: 3.0, successRate: 99.6 },
                    ]}
                  />
                </div>

                {/* Performance Monitoring Alert Panel */}
                <div className="xl:col-span-2">
                  <AlertPanel
                    title="Alerts"
                    description="Real-time alerts for changes in service response time, ticket resolution, and first-time resolution rate, with severity indicators."
                    alerts={[
                      // High Priority Alerts (Top)
                      {
                        title: "Response Time Exceeded SLA Target by 0.5 hours",
                        date: "Oct 22",
                        context:
                          "Response time exceeded the SLA by 0.5 hours, reaching 3.2 hours. Potential SLA breach.",
                        severity: "high",
                      },
                      {
                        title:
                          "High-Priority Ticket Resolution Time Increased by 25%",
                        date: "Oct 21",
                        context:
                          "High-priority ticket resolution time increased by 25%, reaching 3.1 hours, exceeding the target.",
                        severity: "high",
                      },
                      {
                        title: "Advisory Service FTR Dropped to 85%",
                        date: "Oct 23",
                        context:
                          "First-time resolution rate (FTR) for Advisory service dropped below target, falling to 85%.",
                        severity: "high",
                      },
                      // Medium Priority Alerts (Middle)
                      {
                        title: "SLA Compliance Dropped 2% Below Target",
                        date: "Oct 19",
                        context:
                          "SLA compliance dropped from 98% to 96%, impacting response times.",
                        severity: "medium",
                      },
                      {
                        title:
                          "Medium Priority Ticket Resolution Dropped by 10%",
                        date: "Oct 18",
                        context:
                          "Medium-priority tickets saw a 10% drop in resolution rate, requiring attention.",
                        severity: "medium",
                      },
                      {
                        title:
                          "First-Time Resolution Rate for Training Dropped to 88%",
                        date: "Oct 20",
                        context:
                          "Training service FTR decreased from 90% to 88%, slightly below target.",
                        severity: "medium",
                      },
                      // Low Priority Alerts (Bottom)
                      {
                        title: "SLA Compliance Maintained at 98%",
                        date: "Oct 25",
                        context:
                          "SLA compliance remained at 98%, indicating consistent performance.",
                        severity: "low",
                      },
                      {
                        title:
                          "Low Priority Tickets Resolved Within Target Time",
                        date: "Oct 22",
                        context:
                          "Low-priority tickets resolved on time, within the target 1.5 hours.",
                        severity: "low",
                      },
                      {
                        title: "Non-Financial Service FTR Maintained at 95%",
                        date: "Oct 24",
                        context:
                          "Non-financial service maintained a high FTR rate of 95%.",
                        severity: "low",
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Tickets Stacked Bar Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
                <TicketsStackedBar
                  data={[
                    { month: "Jan", volume: 156, resolved: 130 },
                    { month: "Feb", volume: 140, resolved: 120 },
                    { month: "Mar", volume: 130, resolved: 125 },
                    { month: "Apr", volume: 120, resolved: 110 },
                    { month: "May", volume: 150, resolved: 115 },
                    { month: "Jun", volume: 160, resolved: 140 },
                  ]}
                />
              </div>

              {/* Average Time to First Response */}
              <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
                <FirstResponseTime
                  data={[
                    { serviceType: "Financial", avgHours: 3.1 },
                    { serviceType: "Non-Financial", avgHours: 2.8 },
                    { serviceType: "Advisory", avgHours: 3.5 },
                    { serviceType: "Training", avgHours: 3.2 },
                  ]}
                  targetHours={4}
                  title="Service Response Time Analysis"
                  description="Average time from service request creation to first response by service team."
                  height="h-80"
                />
              </div>
            </div>

            {/* Section: Service Quality & Reliability */}
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-12 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Service Quality & Reliability
                  </h3>
                  <p className="text-sm text-gray-500">
                    Service delivery performance and partner quality: compliance
                    rates, rework tracking, fulfilment accuracy, resolution
                    timeliness, and customer satisfaction.
                  </p>
                </div>
              </div>

              {/* Service Delivery Visualizations */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <TicketVolumeMA
                  data={[
                    { date: "2025-10-01", high: 22, medium: 45, low: 30 },
                    { date: "2025-10-02", high: 18, medium: 48, low: 28 },
                    { date: "2025-10-03", high: 25, medium: 41, low: 27 },
                    { date: "2025-10-04", high: 21, medium: 39, low: 26 },
                    { date: "2025-10-05", high: 27, medium: 50, low: 34 },
                    { date: "2025-10-06", high: 23, medium: 47, low: 31 },
                    { date: "2025-10-07", high: 24, medium: 44, low: 29 },
                    { date: "2025-10-08", high: 26, medium: 46, low: 30 },
                    { date: "2025-10-09", high: 20, medium: 42, low: 26 },
                    { date: "2025-10-10", high: 19, medium: 40, low: 25 },
                    { date: "2025-10-11", high: 22, medium: 43, low: 24 },
                    { date: "2025-10-12", high: 24, medium: 41, low: 26 },
                    { date: "2025-10-13", high: 29, medium: 49, low: 31 },
                    { date: "2025-10-14", high: 28, medium: 47, low: 29 },
                  ]}
                />
                <ErrorRateHeatmap
                  data={[
                    { service: "Financial", region: "Global", errorRate: 1.2 },
                    {
                      service: "Non-Financial",
                      region: "Global",
                      errorRate: 1.4,
                    },
                    { service: "Advisory", region: "Global", errorRate: 1.1 },
                    { service: "Training", region: "Global", errorRate: 0.9 },
                    { service: "Financial", region: "MENA", errorRate: 0.8 },
                    {
                      service: "Non-Financial",
                      region: "MENA",
                      errorRate: 0.9,
                    },
                    { service: "Advisory", region: "MENA", errorRate: 0.7 },
                    { service: "Training", region: "MENA", errorRate: 0.6 },
                    { service: "Financial", region: "GCC", errorRate: 0.5 },
                    { service: "Non-Financial", region: "GCC", errorRate: 0.6 },
                    { service: "Advisory", region: "GCC", errorRate: 0.4 },
                    { service: "Training", region: "GCC", errorRate: 0.3 },
                    { service: "Financial", region: "UAE", errorRate: 0.3 },
                    { service: "Non-Financial", region: "UAE", errorRate: 0.4 },
                    { service: "Advisory", region: "UAE", errorRate: 0.2 },
                    { service: "Training", region: "UAE", errorRate: 0.1 },
                  ]}
                  title="Error Rate by Service & Region"
                  description="Error rates across services and regions with clear thresholds and outlier highlighting."
                  height="h-96"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                <CSATTrend
                  data={[
                    { period: "W1", csatPct: 88, responses: 85 },
                    { period: "W2", csatPct: 91, responses: 92 },
                    { period: "W3", csatPct: 89, responses: 78 },
                    { period: "W4", csatPct: 92, responses: 95 },
                    { period: "W5", csatPct: 90, responses: 88 },
                    { period: "W6", csatPct: 93, responses: 102 },
                    { period: "W7", csatPct: 89, responses: 82 },
                    { period: "W8", csatPct: 94, responses: 108 },
                  ]}
                  csatTarget={90}
                  csatBandLow={85}
                  csatBandHigh={95}
                />
              </div>
            </div>
          </div>
        )}

        {false && activeTab === "enterprise-outcomes" && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-purple-500"></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Enterprise Outcomes & Impact
                </h3>
                <p className="text-sm text-gray-500">
                  Impact metrics measuring customer satisfaction, revenue
                  generation via EJP channels, and return on investment for
                  service operations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {enterpriseOutcomesMetrics.map((metric, index) => (
                <KPICard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  unit={metric.unit}
                  trend={metric.trend}
                  trendValue={metric.trendValue}
                  threshold={metric.threshold}
                  description={metric.description}
                  icon={metric.icon}
                  sparklineData={metric.sparklineData}
                  target={metric.target}
                />
              ))}
            </div>

            {/* Enhanced Enterprise Outcomes Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarChart
                title="Digital Transformation Score"
                description="Multi-dimensional assessment of digital transformation maturity across key capability areas"
                data={[
                  { metric: "Digital Adoption", value: 85, maxValue: 100 },
                  { metric: "Process Automation", value: 78, maxValue: 100 },
                  { metric: "Data Analytics", value: 92, maxValue: 100 },
                  { metric: "Cloud Integration", value: 88, maxValue: 100 },
                  { metric: "Security Compliance", value: 95, maxValue: 100 },
                  { metric: "User Experience", value: 82, maxValue: 100 },
                ]}
              />

              <DonutChart
                title="Revenue Distribution by Channel"
                description="Breakdown of total revenue generated across different sales and partner channels"
                data={[
                  {
                    label: "EJP Channel",
                    value: 2450000,
                    color: "#3b82f6",
                    percentage: 65,
                  },
                  {
                    label: "Direct Sales",
                    value: 980000,
                    color: "#10b981",
                    percentage: 26,
                  },
                  {
                    label: "Partner Channel",
                    value: 350000,
                    color: "#f59e0b",
                    percentage: 9,
                  },
                ]}
                centerText="£3.78M"
                centerSubtext="Total Revenue"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnterpriseOutcomesChart
                data={{
                  csatScore: 4.6,
                  engagementRate: 88,
                  revenueGenerated: 3780000,
                  serviceROI: 120,
                }}
                description="Comprehensive analytics tracking customer satisfaction, engagement, revenue impact, and return on investment"
              />

              <ScatterPlot
                title="Customer Satisfaction vs Revenue Impact"
                xAxisLabel="CSAT Score"
                yAxisLabel="Revenue Growth (%)"
                data={[
                  { x: 4.2, y: 12, label: "Financial Services" },
                  { x: 4.6, y: 18, label: "Non-Financial Services" },
                  { x: 4.4, y: 15, label: "Advisory Services" },
                  { x: 4.8, y: 22, label: "Training Services" },
                  { x: 4.5, y: 16, label: "Support Services" },
                  { x: 4.7, y: 20, label: "Consulting Services" },
                ]}
              />
            </div>
          </div>
        )}

        {false && activeTab === "operational-risk" && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Operational & Risk Metrics
                </h3>
                <p className="text-sm text-gray-500">
                  Operational metrics tracking support ticket volume, resolution
                  times, escalation rates, and risk management for EJP
                  Transaction services
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {operationalMetrics.map((metric, index) => (
                <KPICard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  unit={metric.unit}
                  trend={metric.trend}
                  trendValue={metric.trendValue}
                  threshold={metric.threshold}
                  description={metric.description}
                  icon={metric.icon}
                  sparklineData={metric.sparklineData}
                  target={metric.target}
                />
              ))}
            </div>

            {/* Enhanced Operational Risk Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FunnelChart
                title="Ticket Resolution Funnel"
                description="Visualizes the progressive reduction of support tickets through resolution stages, highlighting conversion rates"
                data={[
                  {
                    stage: "Tickets Received",
                    value: 156,
                    percentage: 100,
                    color: "#3b82f6",
                  },
                  {
                    stage: "First Response",
                    value: 142,
                    percentage: 91,
                    color: "#10b981",
                  },
                  {
                    stage: "In Progress",
                    value: 128,
                    percentage: 82,
                    color: "#f59e0b",
                  },
                  {
                    stage: "Resolved",
                    value: 118,
                    percentage: 76,
                    color: "#ef4444",
                  },
                ]}
              />

              <GaugeChart
                title="First-Time Resolution Rate"
                value={75.6}
                maxValue={100}
                unit="%"
                thresholds={{ warning: 70, critical: 85 }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OperationalMetricsChart
                data={
                  {
                    supportVolume: 156,
                    resolutionTime: 2.1,
                    slaBreaches: 4,
                    riskAlerts: 7,
                  } as any
                }
                description="Comprehensive operational metrics tracking support volume, resolution times, SLA compliance, and risk alerts"
              />

              <HeatmapChart
                title="SLA Breach Risk by Service & Region"
                xAxisLabel="Service Category"
                yAxisLabel="Region"
                data={[
                  { x: "Financial", y: "UAE", value: 0.2 },
                  { x: "Financial", y: "GCC", value: 0.4 },
                  { x: "Financial", y: "MENA", value: 0.8 },
                  { x: "Financial", y: "Global", value: 1.2 },
                  { x: "Non-Financial", y: "UAE", value: 0.3 },
                  { x: "Non-Financial", y: "GCC", value: 0.5 },
                  { x: "Non-Financial", y: "MENA", value: 0.9 },
                  { x: "Non-Financial", y: "Global", value: 1.4 },
                  { x: "Advisory", y: "UAE", value: 0.1 },
                  { x: "Advisory", y: "GCC", value: 0.3 },
                  { x: "Advisory", y: "MENA", value: 0.6 },
                  { x: "Advisory", y: "Global", value: 1.0 },
                  { x: "Training", y: "UAE", value: 0.0 },
                  { x: "Training", y: "GCC", value: 0.2 },
                  { x: "Training", y: "MENA", value: 0.5 },
                  { x: "Training", y: "Global", value: 0.8 },
                ]}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EJPTransactionDashboard;
