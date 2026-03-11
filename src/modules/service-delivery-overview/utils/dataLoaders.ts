import { fetchApiData } from './apiHelpers';
import { getTotalServicesDelivered, getServiceDeliveryAvgCompletionTime, getSlaComplianceRate } from '../../../api/analytics/serviceDelivery';
import EnterprisesService from '../../../api/analytics/enterprises';

export async function loadServiceMetrics(dateRangeParams: any, startDate: string, endDate: string, serviceCategory?: string) {
  const [totalServicesData, completionTimeData, slaComplianceData] = await Promise.all([
    getTotalServicesDelivered(startDate, endDate, serviceCategory).catch(() => ({ totalServicesDelivered: 0, trend: 'stable', trendValue: '0', target: 100 })),
    getServiceDeliveryAvgCompletionTime({ fromDate: dateRangeParams.fromDate, toDate: dateRangeParams.toDate, serviceCategory }).catch(() => ({ value: '0.0', unit: 'days', trend: 'stable', trendValue: '0' })),
    getSlaComplianceRate({ fromDate: dateRangeParams.fromDate, toDate: dateRangeParams.toDate, serviceCategory }).catch(() => ({ value: '0.0', unit: '%', trend: 'stable', trendValue: '0' }))
  ]);

  return { totalServicesData, completionTimeData, slaComplianceData };
}

export async function loadRiskMetrics(params: Record<string, string>) {
  const [pendingRequestsKpiData, errorFailureRateKpiData, applicationDropOffKpiData, escalationRateKpiData, slaBreachesKpiData] = await Promise.all([
    fetchApiData({ endpoint: '/api/analytics/pending-requests', params, defaultValue: { value: '0', unit: 'requests', trend: 'stable', trendValue: '0', target: 100 }, logPrefix: 'pending requests' }),
    fetchApiData({ endpoint: '/api/analytics/error-failure-rate', params, defaultValue: { value: '0.0', unit: '%', trend: 'stable', trendValue: '0', target: 2 }, logPrefix: 'error/failure rate' }),
    fetchApiData({ endpoint: '/api/analytics/application-drop-off', params, defaultValue: { value: '0.0', unit: '%', trend: 'stable', trendValue: '0', target: 5 }, logPrefix: 'application drop-off' }),
    fetchApiData({ endpoint: '/api/analytics/escalation-rate', params, defaultValue: { value: '0.0', unit: '%', trend: 'stable', trendValue: '0', target: 2 }, logPrefix: 'escalation rate' }),
    fetchApiData({ endpoint: '/api/analytics/sla-breaches', params, defaultValue: { value: '0', unit: 'incidents', trend: 'stable', trendValue: '0', target: 10 }, logPrefix: 'SLA breaches' })
  ]);

  return { pendingRequestsKpiData, errorFailureRateKpiData, applicationDropOffKpiData, escalationRateKpiData, slaBreachesKpiData };
}

export async function loadTrendData(params: Record<string, string>) {
  const [errorRateTrendData, pendingRequestsTrendData, incidentsByPriorityApiData, incidentsByStatusApiData, riskHeatmapApiData] = await Promise.all([
    fetchApiData({ endpoint: '/api/analytics/error-rate-trend', params, defaultValue: [], logPrefix: 'error rate trend' }),
    fetchApiData({ endpoint: '/api/analytics/pending-requests-trend', params, defaultValue: [], logPrefix: 'pending requests trend' }),
    fetchApiData({ endpoint: '/api/analytics/incidents-by-priority', params, defaultValue: [], logPrefix: 'incidents by priority' }),
    fetchApiData({ endpoint: '/api/analytics/incidents-by-status', params, defaultValue: [], logPrefix: 'incidents by status' }),
    fetchApiData({ endpoint: '/api/analytics/risk-frequency-heatmap', params, defaultValue: [], logPrefix: 'risk frequency heatmap' })
  ]);

  return { errorRateTrendData, pendingRequestsTrendData, incidentsByPriorityApiData, incidentsByStatusApiData, riskHeatmapApiData };
}

export async function loadEnterpriseMetrics(startDate: string, endDate: string, serviceCategory?: string, enterpriseSize?: string) {
  const serviceCategoryFilter = serviceCategory !== 'all' ? serviceCategory : undefined;
  const enterpriseSizeFilter = enterpriseSize !== 'all' ? enterpriseSize : undefined;

  return await Promise.all([
    EnterprisesService.getNetNewEnterprises({ startDate, endDate, industry: serviceCategoryFilter, size: enterpriseSizeFilter }),
    EnterprisesService.getEnterpriseActivationRate({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getAvgRequestsPerActiveEnterprise({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getOnTimeSLARate({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getRepeatedEnterpriseShare({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getEnterpriseSatisfactionScore({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getEnterpriseDistributionByIndustry({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getEnterpriseDistributionByBusinessSize({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getTopEnterprisesByVolume({ startDate, endDate, serviceCategory: serviceCategoryFilter }),
    EnterprisesService.getPortfolioSummary({ startDate, endDate, serviceCategory: serviceCategoryFilter })
  ]);
}
