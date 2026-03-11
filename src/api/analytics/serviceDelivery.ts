import { API_BASE_URL } from './config';

export interface ServiceDeliveryFilters {
  fromDate: string;
  toDate: string;
  serviceCategory?: string;
}

export const getTotalServicesDelivered = async (
  startDate: string,
  endDate: string,
  serviceCategory?: string
) => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(serviceCategory && serviceCategory !== 'all' && { serviceCategory })
    });

    const response = await fetch(`${API_BASE_URL}/api/analytics/total-services-delivered?${params}`);
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to fetch total services delivered');
  } catch (error) {
    console.error('Error fetching total services delivered:', error);
    return {
      totalServicesDelivered: 0,
      trend: 'stable',
      trendValue: '0',
      target: 100
    };
  }
};

export const getSlaComplianceRate = async (filters: ServiceDeliveryFilters) => {
  try {
    const params = new URLSearchParams({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      ...(filters.serviceCategory && filters.serviceCategory !== 'all' && { serviceCategory: filters.serviceCategory })
    });

    const response = await fetch(`${API_BASE_URL}/api/analytics/sla-compliance-rate?${params}`);
    const result = await response.json();

    if (result.success && result.data !== undefined) {
      return {
        value: result.data.slaPercentage.toFixed(1),
        unit: '%',
        trend: 'stable',
        trendValue: '0',
        count: result.data.totalCount
      };
    }

    throw new Error('Failed to fetch SLA compliance rate');
  } catch (error) {
    console.error('Error fetching SLA compliance rate:', error);
    return {
      value: '0.0',
      unit: '%',
      trend: 'stable',
      trendValue: '0',
      count: 0
    };
  }
};

export const getServiceDeliveryAvgCompletionTime = async (filters: ServiceDeliveryFilters) => {
  try {
    const params = new URLSearchParams({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      ...(filters.serviceCategory && filters.serviceCategory !== 'all' && { serviceCategory: filters.serviceCategory })
    });

    const response = await fetch(`${API_BASE_URL}/api/analytics/service-delivery-avg-completion-time?${params}`);
    const result = await response.json();

    if (result.success && result.data !== undefined) {
      return {
        value: result.data.avgCompletionTimeDays.toFixed(1),
        unit: 'days',
        trend: 'stable',
        trendValue: '0',
        count: result.data.count
      };
    }

    throw new Error('Failed to fetch completion time');
  } catch (error) {
    console.error('Error fetching service delivery avg completion time:', error);
    return {
      value: '0.0',
      unit: 'days',
      trend: 'stable',
      trendValue: '0',
      count: 0
    };
  }
};
