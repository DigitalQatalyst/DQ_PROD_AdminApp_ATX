import React from 'react';
import KPICard from './KPICard';
import { useServiceDeliveryKPIs } from '../hooks/useServiceDeliveryKPIs';

interface ServiceDeliveryKPIGridProps {
  dashboardData: any;
  activeDashboardTab: string;
  activeSecondLayerTab: string;
  config: any;
  totalServicesDeliveredData: any;
  netNewEnterprisesData: any;
  serviceDeliveryCompletionTime: any;
  slaComplianceRate: any;
}

const ServiceDeliveryKPIGrid: React.FC<ServiceDeliveryKPIGridProps> = ({
  dashboardData,
  activeDashboardTab,
  activeSecondLayerTab,
  config,
  totalServicesDeliveredData,
  netNewEnterprisesData,
  serviceDeliveryCompletionTime,
  slaComplianceRate
}) => {
  const kpisToShow = useServiceDeliveryKPIs({
    dashboardData,
    activeDashboardTab,
    activeSecondLayerTab,
    config,
    totalServicesDeliveredData,
    netNewEnterprisesData,
    serviceDeliveryCompletionTime,
    slaComplianceRate
  });
  
  const kpiCount = kpisToShow.length;
  const gridCols = kpiCount === 1 ? 'grid-cols-1' :
                 kpiCount === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                 kpiCount === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                 kpiCount === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
                 kpiCount === 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5' :
                 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-4 mb-8 items-stretch`}>
      {kpisToShow.map((kpi: any, index: number) => (
        <KPICard
          key={`${kpi.title}-${kpi.value}-${index}`}
          title={kpi?.title}
          value={kpi?.value}
          unit={kpi?.unit}
          trend={kpi?.trend}
          trendValue={kpi?.trendValue}
          threshold={kpi?.threshold}
          description={kpi?.description}
          icon={kpi?.icon}
          sparklineData={kpi?.sparklineData}
          target={kpi?.target}
        />
      ))}
    </div>
  );
};

export default ServiceDeliveryKPIGrid;
