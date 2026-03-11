import { useEffect } from 'react';
import { loadServiceMetrics, loadRiskMetrics, loadTrendData, loadEnterpriseMetrics } from '../utils/dataLoaders';
import { normalizeTrend } from '../utils/apiHelpers';

export function useEnterpriseData(
  globalFilters: any,
  getDateRangeFromFilter: (year?: string) => { startDate: string; endDate: string },
  getDateRangeForFilter: (year?: string) => { fromDate: string; toDate: string },
  setters: {
    setTotalServicesDeliveredData: (data: any) => void;
    setServiceDeliveryCompletionTime: (data: any) => void;
    setSlaComplianceRate: (data: any) => void;
    setPendingRequestsData: (data: any) => void;
    setErrorFailureRateData: (data: any) => void;
    setApplicationDropOffData: (data: any) => void;
    setEscalationRateData: (data: any) => void;
    setSlaBreachesData: (data: any) => void;
    setErrorRateTrendChartData: (data: any) => void;
    setPendingRequestsTrendChartData: (data: any) => void;
    setIncidentsByPriorityData: (data: any) => void;
    setIncidentsByStatusData: (data: any) => void;
    setRiskHeatmapData: (data: any) => void;
    setNetNewEnterprisesData: (data: any) => void;
    setEnterpriseActivationRateData: (data: any) => void;
    setAvgRequestsPerActiveData: (data: any) => void;
    setOnTimeSLAData: (data: any) => void;
    setRepeatedEnterpriseShareData: (data: any) => void;
    setEnterpriseSatisfactionScoreData: (data: any) => void;
    setEnterpriseDistributionByIndustryData: (data: any) => void;
    setEnterpriseDistributionByBusinessSizeData: (data: any) => void;
    setTopEnterprisesByVolumeData: (data: any) => void;
    setPortfolioSummaryData: (data: any) => void;
  }
) {
  useEffect(() => {
    const loadData = async () => {
      try {
        const year = globalFilters.year || new Date().getFullYear().toString();
        const { startDate, endDate } = getDateRangeFromFilter(year);
        const dateRangeParams = getDateRangeForFilter(year);
        const serviceCategory = globalFilters.serviceCategory !== 'all' ? globalFilters.serviceCategory : undefined;

        const { totalServicesData, completionTimeData, slaComplianceData } = await loadServiceMetrics(
          dateRangeParams,
          startDate,
          endDate,
          serviceCategory
        );

        const riskParams = {
          fromDate: dateRangeParams.fromDate,
          toDate: dateRangeParams.toDate,
          serviceCategory: globalFilters.serviceCategory
        };

        const { pendingRequestsKpiData, errorFailureRateKpiData, applicationDropOffKpiData, escalationRateKpiData, slaBreachesKpiData } = await loadRiskMetrics(riskParams);

        const trendParams = { startDate, endDate, serviceCategory: globalFilters.serviceCategory };
        const { errorRateTrendData, pendingRequestsTrendData, incidentsByPriorityApiData, incidentsByStatusApiData, riskHeatmapApiData } = await loadTrendData(trendParams);

        const [netNewData, activationRateData, avgRequestsData, onTimeSLADataResult, repeatedShareData, satisfactionScoreData, distributionByIndustryData, distributionByBusinessSizeData, topEnterprisesByVolumeData, portfolioSummaryData] = await loadEnterpriseMetrics(
          startDate,
          endDate,
          serviceCategory,
          globalFilters.enterpriseSize
        );

        setters.setTotalServicesDeliveredData(totalServicesData);
        setters.setServiceDeliveryCompletionTime({ ...completionTimeData, trend: normalizeTrend(completionTimeData.trend), target: 3.5 });
        setters.setSlaComplianceRate({ ...slaComplianceData, trend: normalizeTrend(slaComplianceData.trend), target: 95 });
        setters.setPendingRequestsData({ ...pendingRequestsKpiData, trend: normalizeTrend(pendingRequestsKpiData.trend) });
        setters.setErrorFailureRateData({ ...errorFailureRateKpiData, trend: normalizeTrend(errorFailureRateKpiData.trend) });
        setters.setApplicationDropOffData({ ...applicationDropOffKpiData, trend: normalizeTrend(applicationDropOffKpiData.trend) });
        setters.setEscalationRateData({ ...escalationRateKpiData, trend: normalizeTrend(escalationRateKpiData.trend) });
        setters.setSlaBreachesData({ ...slaBreachesKpiData, trend: normalizeTrend(slaBreachesKpiData.trend) });
        setters.setErrorRateTrendChartData(errorRateTrendData);
        setters.setPendingRequestsTrendChartData(pendingRequestsTrendData);
        setters.setIncidentsByPriorityData(incidentsByPriorityApiData);
        setters.setIncidentsByStatusData(incidentsByStatusApiData);
        setters.setRiskHeatmapData(riskHeatmapApiData);
        setters.setNetNewEnterprisesData({ ...netNewData, trend: normalizeTrend(netNewData.trend), enterprises: netNewData.enterprises || [] });
        setters.setEnterpriseActivationRateData({ ...activationRateData, trend: normalizeTrend(activationRateData.trend) });
        setters.setAvgRequestsPerActiveData(avgRequestsData);
        setters.setOnTimeSLAData(onTimeSLADataResult);
        setters.setRepeatedEnterpriseShareData(repeatedShareData);
        setters.setEnterpriseSatisfactionScoreData(satisfactionScoreData);
        setters.setEnterpriseDistributionByIndustryData(distributionByIndustryData);
        setters.setEnterpriseDistributionByBusinessSizeData(distributionByBusinessSizeData);
        setters.setTopEnterprisesByVolumeData(topEnterprisesByVolumeData);
        setters.setPortfolioSummaryData(portfolioSummaryData);
      } catch (error: any) {
        console.error('Failed to load enterprise data:', error);
        setters.setTotalServicesDeliveredData({ totalServicesDelivered: 0, trend: 'stable', trendValue: '0', target: 100 });
      }
    };

    loadData();
  }, [globalFilters.year, globalFilters.serviceCategory, globalFilters.businessSize, globalFilters.enterpriseSize, globalFilters.region]);
}
