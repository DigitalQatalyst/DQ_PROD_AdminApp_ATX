import { useMemo } from 'react';

interface KPIData {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  threshold: string;
  description: string;
  icon: string;
  sparklineData: number[];
  target: number | string;
}

interface UseServiceDeliveryKPIsProps {
  dashboardData: any;
  activeDashboardTab: string;
  activeSecondLayerTab: string;
  config: any;
  totalServicesDeliveredData: any;
  netNewEnterprisesData: any;
  serviceDeliveryCompletionTime: any;
  slaComplianceRate: any;
}

export const useServiceDeliveryKPIs = ({
  dashboardData,
  activeDashboardTab,
  activeSecondLayerTab,
  config,
  totalServicesDeliveredData,
  netNewEnterprisesData,
  serviceDeliveryCompletionTime,
  slaComplianceRate
}: UseServiceDeliveryKPIsProps): KPIData[] => {
  return useMemo(() => {
    const currentData = (dashboardData as any)[activeDashboardTab]?.[activeSecondLayerTab] || 
                       (dashboardData as any)[activeDashboardTab] || 
                       config?.kpis || [];
    let kpisToShow = currentData.kpis || currentData || [];
    
    const netNewEnterprisesKpi = {
      title: 'Net New Enterprises',
      value: netNewEnterprisesData.netNewEnterprises.toString(),
      unit: 'enterprises',
      trend: netNewEnterprisesData.trend,
      trendValue: netNewEnterprisesData.trendValue,
      threshold: netNewEnterprisesData.netNewEnterprises >= netNewEnterprisesData.target ? 'excellent' : 'good',
      description: 'New enterprises onboarded in the selected period',
      icon: 'Building',
      sparklineData: [100, 105, 110, 115, 120, netNewEnterprisesData.netNewEnterprises],
      target: netNewEnterprisesData.target
    };
    
    if (kpisToShow.length > 0) {
      kpisToShow = [...kpisToShow];
      kpisToShow[0] = {
        title: 'Total Services Delivered',
        value: totalServicesDeliveredData.totalServicesDelivered.toString(),
        unit: 'services',
        trend: totalServicesDeliveredData.trend,
        trendValue: totalServicesDeliveredData.trendValue,
        threshold: totalServicesDeliveredData.totalServicesDelivered >= totalServicesDeliveredData.target ? 'excellent' : 'good',
        description: 'Total number of services delivered to enterprises',
        icon: 'CheckCircle',
        sparklineData: [8, 9, 10, 11, 10, totalServicesDeliveredData.totalServicesDelivered],
        target: totalServicesDeliveredData.target
      };
      if (kpisToShow.length > 1) {
        kpisToShow[1] = netNewEnterprisesKpi;
      } else {
        kpisToShow.push(netNewEnterprisesKpi);
      }
      if (kpisToShow.length > 2) {
        kpisToShow[2] = {
          title: 'Avg Completion Time',
          value: serviceDeliveryCompletionTime.value,
          unit: serviceDeliveryCompletionTime.unit,
          trend: serviceDeliveryCompletionTime.trend,
          trendValue: serviceDeliveryCompletionTime.trendValue,
          threshold: parseFloat(serviceDeliveryCompletionTime.value) <= serviceDeliveryCompletionTime.target ? 'excellent' : 'good',
          description: 'Average service completion time',
          icon: 'Clock',
          sparklineData: [2.8, 2.9, 3.0, 3.1, 3.15, parseFloat(serviceDeliveryCompletionTime.value)],
          target: serviceDeliveryCompletionTime.target
        };
      }
      if (kpisToShow.length > 3) {
        kpisToShow[3] = {
          title: 'SLA Compliance Rate',
          value: slaComplianceRate.value,
          unit: slaComplianceRate.unit,
          trend: slaComplianceRate.trend,
          trendValue: slaComplianceRate.trendValue,
          threshold: parseFloat(slaComplianceRate.value) >= slaComplianceRate.target ? 'excellent' : 'good',
          description: 'Percentage of services meeting SLA requirements',
          icon: 'Target',
          sparklineData: [98.5, 98.8, 99.0, 99.1, 99.2, parseFloat(slaComplianceRate.value)],
          target: slaComplianceRate.target
        };
      }
    } else {
      kpisToShow = [
        {
          title: 'Total Services Delivered',
          value: totalServicesDeliveredData.totalServicesDelivered.toString(),
          unit: 'services',
          trend: totalServicesDeliveredData.trend,
          trendValue: totalServicesDeliveredData.trendValue,
          threshold: totalServicesDeliveredData.totalServicesDelivered >= totalServicesDeliveredData.target ? 'excellent' : 'good',
          description: 'Total number of services delivered to enterprises',
          icon: 'CheckCircle',
          sparklineData: [8, 9, 10, 11, 10, totalServicesDeliveredData.totalServicesDelivered],
          target: totalServicesDeliveredData.target
        },
        netNewEnterprisesKpi,
        {
          title: 'Avg Completion Time',
          value: serviceDeliveryCompletionTime.value,
          unit: serviceDeliveryCompletionTime.unit,
          trend: serviceDeliveryCompletionTime.trend,
          trendValue: serviceDeliveryCompletionTime.trendValue,
          threshold: parseFloat(serviceDeliveryCompletionTime.value) <= serviceDeliveryCompletionTime.target ? 'excellent' : 'good',
          description: 'Average service completion time',
          icon: 'Clock',
          sparklineData: [2.8, 2.9, 3.0, 3.1, 3.15, parseFloat(serviceDeliveryCompletionTime.value)],
          target: serviceDeliveryCompletionTime.target
        },
        {
          title: 'SLA Compliance Rate',
          value: slaComplianceRate.value,
          unit: slaComplianceRate.unit,
          trend: slaComplianceRate.trend,
          trendValue: slaComplianceRate.trendValue,
          threshold: parseFloat(slaComplianceRate.value) >= slaComplianceRate.target ? 'excellent' : 'good',
          description: 'Percentage of services meeting SLA requirements',
          icon: 'Target',
          sparklineData: [98.5, 98.8, 99.0, 99.1, 99.2, parseFloat(slaComplianceRate.value)],
          target: slaComplianceRate.target
        }
      ];
    }
    
    return kpisToShow;
  }, [dashboardData, activeDashboardTab, activeSecondLayerTab, config, totalServicesDeliveredData, netNewEnterprisesData, serviceDeliveryCompletionTime, slaComplianceRate]);
};
