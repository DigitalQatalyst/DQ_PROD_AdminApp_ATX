import MockData, {
  ServiceAdoptionMetric,
  OnboardingActivationPoint,
  TimeToActivationPoint,
  DropoffPoint,
  HeatmapTaskPoint,
  Filters,
} from '../data/mock';
import {
  fetchPartnerCount,
  fetchActivationRate,
  fetchServiceUtilization,
  fetchEnquiryActivation,
  fetchDropoffRate,
  fetchPartnerLeadQualificationRate,
  fetchOpportunityWinRate,
  fetchPartnerChurnRetention,
  PartnerChurnRetentionPoint,
  fetchPartnerRepeatUsage,
  fetchPartnerActiveUserRate,
  PartnerActiveUserRatePoint,
} from '../../api/analytics';
import { fetchTimeToActivationForPartner, fetchAverageUsageForPartner, fetchRetentionRateForPartner, fetchEngagementSummaryForPartner } from '../../api/analytics/partnerAnalytics';

export interface DashboardData {
  serviceAdoptionMetrics: ServiceAdoptionMetric[];
  // onboardingActivation: OnboardingActivationPoint[];
  timeToActivation: TimeToActivationPoint[];
  dropoff: DropoffPoint[];
  onboardingTasksHeatmap: HeatmapTaskPoint[];
  servicePerformanceMetrics: ServiceAdoptionMetric[];
  enterpriseOutcomesMetrics: ServiceAdoptionMetric[];
  operationalMetrics: ServiceAdoptionMetric[];
  activeUserRate: { month: string; value: number; movingAverage: number }[];
  repeatUsage: { month: string; repeatUsers: number; firstTimeUsers: number }[];
  churnRetention: { month: string; retention: number; churn: number }[];
}

// Transform enquiry activation data for dashboard
function transformEnquiryActivationData(data: any[]): OnboardingActivationPoint[] {
  return data.map((item) => {
    const totalEnquiries = item.enquiries || 0;
    const totalActivations = item.activations || 0;
    const inquiryRate = totalEnquiries > 0 ? 100 : 0;
    const activationRate = totalEnquiries > 0 ? Math.round((totalActivations / totalEnquiries) * 100) : 0;
    
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    const formattedMonth = `${monthName} ${year}`;
    
    return {
      month: formattedMonth,
      inquiry: inquiryRate,
      activation: activationRate,
      inquiryCount: totalEnquiries,
      activationCount: totalActivations
    };
  });
}

// Transform drop-off rate data for dashboard
function transformDropoffData(data: any[]): DropoffPoint[] {
  const transformed = data.map((item) => {
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    const formattedMonth = `${monthName} ${year}`;
    
    return {
      month: formattedMonth,
      value: item.value || item.dropoffRate || 0
    };
  });
  return transformed;
}

function transformChurnRetentionData(points: PartnerChurnRetentionPoint[]): { month: string; retention: number; churn: number }[] {
  return points.map((point) => ({
    month: point.label || new Date(point.periodStart).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    retention: point.retentionRate ?? 0,
    churn: point.churnRate ?? 0,
  }));
}

function transformActiveUserData(points: PartnerActiveUserRatePoint[]): { month: string; value: number; movingAverage: number }[] {
  const series = points.map((point) => ({
    month: point.label || new Date(point.periodStart).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    value: point.rate ?? 0,
  }));

  return series.map((item, idx, arr) => {
    const window = arr.slice(Math.max(0, idx - 2), idx + 1);
    const movingAverage = window.length
      ? window.reduce((sum, current) => sum + current.value, 0) / window.length
      : item.value;
    return {
      month: item.month,
      value: Math.round(item.value * 100) / 100,
      movingAverage: Math.round(movingAverage * 100) / 100,
    };
  });
}

// Streaming version - returns data progressively as it arrives
export async function fetchDashboardDataStreaming(
  filters?: Filters,
  options?: { partnerId?: string },
  onProgress?: (partialData: Partial<DashboardData>) => void
): Promise<DashboardData> {
  const partnerId = options?.partnerId || import.meta.env.VITE_PARTNER_ACCOUNT_ID;
  
  // Initialize with empty data
  const result: DashboardData = {
    serviceAdoptionMetrics: [],
    onboardingActivation: [],
    timeToActivation: [],
    dropoff: [],
    onboardingTasksHeatmap: [],
    servicePerformanceMetrics: [],
    enterpriseOutcomesMetrics: [],
    operationalMetrics: [],
    activeUserRate: [],
    repeatUsage: [],
    churnRetention: [],
  };

  // Fetch service adoption metrics first (highest priority)
  try {
    const [engagementSummaryData, averageUsageData, retentionRateData, partnerData, leadQualificationData] = await Promise.all([
      partnerId ? fetchEngagementSummaryForPartner(partnerId, filters).catch(() => null) : null,
      partnerId ? fetchAverageUsageForPartner(partnerId, filters).catch(() => null) : null,
      partnerId ? fetchRetentionRateForPartner(partnerId, filters?.subServiceType, filters).catch(() => null) : null,
      fetchPartnerCount().catch(() => ({ count: 0, target: 0 })),
      fetchPartnerLeadQualificationRate(filters).catch(() => ({ qualificationRate: 0 }))
    ]);

    result.serviceAdoptionMetrics = [
      { title: 'Total Engaged Enterprises', icon: 'Users', unit: '', trend: 'up', trendValue: '+5%', threshold: 'good', description: 'Enterprises that used or interacted with your services.', sparklineData: [], target: String(engagementSummaryData?.target ?? 0), value: String(engagementSummaryData?.distinctEnterprisesEngaged ?? 0) },
      { title: 'Activation Rate', icon: 'TrendingUp', unit: '%', trend: 'up', trendValue: '+2%', threshold: 'good', description: 'Percentage of your requests that were accepted.', sparklineData: [], target: `${Math.max(0, leadQualificationData.qualificationRate - 5)}`, value: `${leadQualificationData.qualificationRate}` },
      { title: 'Average Usage per Enterprise', icon: 'Activity', unit: 'requests', trend: 'up', trendValue: '+0.5', threshold: 'good', description: 'Average number of service requests received per enterprise.', sparklineData: [], target: averageUsageData?.targetCoveragePct ? `${averageUsageData.targetCoveragePct}%` : '0', value: averageUsageData?.averageUsage ?? 0 },
      { title: 'Enterprise Retention Rate', icon: 'Shield', unit: '%', trend: 'stable', trendValue: '0%', threshold: 'good', description: 'Percent of enterprises that returned for another service after their first completed case.', sparklineData: [], target: retentionRateData?.target ? `${retentionRateData.target}` : '0', value: retentionRateData?.retentionRate ?? 0 }
    ];
    
    onProgress?.({ serviceAdoptionMetrics: result.serviceAdoptionMetrics });
  } catch (error) {
    console.error('Failed to fetch service adoption metrics:', error);
  }

  // Fetch charts data (second priority)
  try {
    const [ttaData, dropoffRateData, rawEnquiryData] = await Promise.all([
      partnerId ? fetchTimeToActivationForPartner(partnerId, 'day', 7, filters).catch(() => []) : [],
      fetchDropoffRate(filters).catch(() => []),
      fetchEnquiryActivation(filters).catch(() => [])
    ]);

    result.timeToActivation = ttaData;
    result.dropoff = transformDropoffData(dropoffRateData);
    result.onboardingActivation = transformEnquiryActivationData(rawEnquiryData);
    
    onProgress?.({ 
      timeToActivation: result.timeToActivation,
      dropoff: result.dropoff,
      onboardingActivation: result.onboardingActivation
    });
  } catch (error) {
    console.error('Failed to fetch charts data:', error);
  }

  // Fetch additional metrics (third priority)
  if (partnerId) {
    try {
      const [churnData, repeatData, activeData] = await Promise.all([
        fetchPartnerChurnRetention({ partnerId, period: 'day', days: 7 }, filters?.subServiceType, filters).catch(() => []),
        fetchPartnerRepeatUsage(partnerId, filters?.subServiceType, filters).catch(() => []),
        fetchPartnerActiveUserRate(partnerId, filters?.subServiceType, filters).catch(() => [])
      ]);

      result.churnRetention = transformChurnRetentionData(churnData);
      result.repeatUsage = repeatData.map((point) => ({ month: point.label, repeatUsers: point.repeatUsers, firstTimeUsers: point.firstTimeUsers }));
      result.activeUserRate = transformActiveUserData(activeData);
      
      onProgress?.({ 
        churnRetention: result.churnRetention,
        repeatUsage: result.repeatUsage,
        activeUserRate: result.activeUserRate
      });
    } catch (error) {
      console.error('Failed to fetch additional metrics:', error);
    }
  }

  return result;
}

// Current implementation uses mock generators; swap to real CRM functions later
export async function fetchDashboardData(filters?: Filters, options?: { partnerId?: string }): Promise<DashboardData> {
  // Fetch real partner analytics data
  const [partnerData, utilizationData, leadQualificationData, winRateData, dropoffRateData] = await Promise.all([
    fetchPartnerCount(),
    fetchServiceUtilization(),
    fetchPartnerLeadQualificationRate(filters),
    fetchOpportunityWinRate(),
    fetchDropoffRate(filters)
  ]);
  
  // Default metric structure
  const defaultMetrics = [
    { title: 'Total Engaged Enterprises', icon: 'Users', unit: '', trend: 'up', trendValue: '+5%', threshold: 'good', description: 'Enterprises that used or interacted with your services.', sparklineData: [], target: '0' },
    { title: 'Activation Rate', icon: 'TrendingUp', unit: '%', trend: 'up', trendValue: '+2%', threshold: 'good', description: 'Percentage of your requests that were accepted.', sparklineData: [], target: '0%' },
    { title: 'Average Usage per Enterprise', icon: 'Activity', unit: 'requests', trend: 'up', trendValue: '+0.5', threshold: 'good', description: 'Average number of service requests received per enterprise.', sparklineData: [], target: '0' },
    { title: 'Enterprise Retention Rate', icon: 'Shield', unit: '%', trend: 'stable', trendValue: '0%', threshold: 'good', description: 'Percent of enterprises that returned for another service after their first completed case.', sparklineData: [], target: '0%' }
  ];
  
  // Fetch partner analytics data for KPI tiles
  const partnerId = options?.partnerId || import.meta.env.VITE_PARTNER_ACCOUNT_ID;
  let engagementSummaryData = null;
  let averageUsageData = null;
  let retentionRateData = null;
  try {
    if (partnerId) {
      engagementSummaryData = await fetchEngagementSummaryForPartner(partnerId, filters);
      averageUsageData = await fetchAverageUsageForPartner(partnerId, filters);
      retentionRateData = await fetchRetentionRateForPartner(partnerId, filters?.subServiceType, filters);
    }
  } catch (error) {
    console.error('Failed to fetch partner analytics data:', error);
  }
  
  const serviceAdoptionMetrics = [
    {
      ...defaultMetrics[0],
      value: String(engagementSummaryData?.distinctEnterprisesEngaged ?? engagementSummaryData?.count ?? partnerData.count ?? 0),
      target: String(engagementSummaryData?.target ?? partnerData.target ?? 0),
    },
    {
      ...defaultMetrics[1],
      value: `${leadQualificationData.qualificationRate}`,
      trendValue: leadQualificationData.qualificationRate > 0 ? '+2%' : '0%',
      target: `${Math.max(0, leadQualificationData.qualificationRate - 5)}`,
    },
    {
      ...defaultMetrics[2],
      value: averageUsageData?.averageUsage !== undefined ? averageUsageData.averageUsage : 0,
      target: averageUsageData?.targetCoveragePct ? `${averageUsageData.targetCoveragePct}%` : '0',
    },
    {
      ...defaultMetrics[3],
      value: retentionRateData?.retentionRate !== undefined ? retentionRateData.retentionRate : 0,
      target: retentionRateData?.target ? `${retentionRateData.target}` : '0',
    }
  ];

  // Fetch and transform enquiry activation data
  const rawEnquiryData = await fetchEnquiryActivation(filters);
  const enquiryActivationData = transformEnquiryActivationData(rawEnquiryData);
  
  // Use filtered enquiry activation data if available, otherwise show empty data for filtered periods
  const enquiryActivationForGraph = enquiryActivationData.length > 0 ? enquiryActivationData : [{
    month: 'No Data',
    inquiry: 0,
    activation: 0,
    inquiryCount: 0,
    activationCount: 0
  }];
  
  // Fetch and transform drop-off rate data
  const dropoffData = transformDropoffData(dropoffRateData);

  // Fetch time to activation data
  let ttaData = [];
  try {
    const timeToActivationData = await fetchTimeToActivationForPartner(partnerId, 'day', 7, filters);
    ttaData = timeToActivationData;
  } catch (error) {
    console.error('Failed to fetch time to activation data:', error);
  }

  // Fetch churn & retention data per partner (fallback to mock series if unavailable)
  let churnRetention = [];
  let repeatUsage = [];
  let activeUserRate = [];
  if (partnerId) {
    try {
      const churnData = await fetchPartnerChurnRetention({
        partnerId,
        period: 'day',
        days: 7,
      }, filters?.subServiceType, filters);
      churnRetention = transformChurnRetentionData(churnData);
    } catch (error) {
      console.error('Failed to fetch churn retention metrics:', error);
    }

    try {
      const repeatData = await fetchPartnerRepeatUsage(partnerId, filters?.subServiceType, filters);
      repeatUsage = repeatData.map((point) => ({
        month: point.label,
        repeatUsers: point.repeatUsers,
        firstTimeUsers: point.firstTimeUsers,
      }));
    } catch (error) {
      console.error('Failed to fetch repeat usage metrics:', error);
    }

    try {
      const activeData = await fetchPartnerActiveUserRate(partnerId, filters?.subServiceType, filters);
      activeUserRate = transformActiveUserData(activeData);
    } catch (error) {
      console.error('Failed to fetch active user rate metrics:', error);
    }
  }

  
  return {
    serviceAdoptionMetrics,
    onboardingActivation: enquiryActivationForGraph,
    timeToActivation: ttaData,
    dropoff: dropoffData,
    onboardingTasksHeatmap: [],
    servicePerformanceMetrics: [],
    enterpriseOutcomesMetrics: [],
    operationalMetrics: [],
    activeUserRate,
    repeatUsage,
    churnRetention,
  };
}

export const DataService = { fetchDashboardData, fetchDashboardDataStreaming };
export default DataService;


