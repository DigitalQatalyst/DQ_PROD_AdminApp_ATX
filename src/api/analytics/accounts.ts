import { API_BASE_URL } from './config';

export interface ProviderRequestsData {
  provider: string;
  fullName: string;
  total: number;
  completed: number;
}

export interface ProviderCompletionTimeData {
  provider: string;
  fullName: string;
  avgCompletionTime: number;
  target: number;
}

export interface ProviderSlaBreachData {
  provider: string;
  fullName: string;
  breachRate: number;
}

export interface SlaComplianceTrendData {
  month: string;
  compliance: number;
  target: number;
}

export interface ProviderBenchmarkData {
  provider: string;
  sla: number;
  responseTime: number;
  quality: number;
  retention: number;
  capacity: number;
  index: number;
  rank: number;
  caseCount?: number;
}

export interface ProviderPerformanceFilters {
  fromDate?: string;
  toDate?: string;
  serviceCategory?: string;
  businessSize?: string;
  year?: string;
}

class AccountsService {
  static async getSlaComplianceTrend(filters?: ProviderPerformanceFilters): Promise<SlaComplianceTrendData[]> {
    try {
      const params = new URLSearchParams();
      params.set('months', '6');
      params.set('kpis', 'First Response By KPI,Resolve By KPI');
      if (filters?.fromDate) params.set('fromDate', filters.fromDate);
      if (filters?.toDate) params.set('toDate', filters.toDate);
      if (filters?.serviceCategory && filters.serviceCategory !== 'all') {
        params.set('serviceType', filters.serviceCategory);
      }
      if (filters?.businessSize && filters.businessSize !== 'all') {
        params.set('businessSize', filters.businessSize);
      }
      const query = params.toString();
      const url = `${API_BASE_URL}/api/analytics/sla-compliance/trend?${query}`;
      console.log('[AccountsService] getSlaComplianceTrend - Calling:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('[AccountsService] getSlaComplianceTrend - Error response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[AccountsService] getSlaComplianceTrend - Response:', result);
      
      // Transform API response to expected format
      return result.data.map((item: any) => ({
        month: item.month,
        compliance: item.compliance,
        target: item.target
      }));
    } catch (error) {
      console.error('Failed to fetch SLA compliance trend:', error);
      // Return mock data as fallback
      return [
        { month: 'Jan', compliance: 88.5, target: 95 },
        { month: 'Feb', compliance: 89.2, target: 95 },
        { month: 'Mar', compliance: 90.1, target: 95 },
        { month: 'Apr', compliance: 89.8, target: 95 },
        { month: 'May', compliance: 90.5, target: 95 },
        { month: 'Jun', compliance: 90.7, target: 95 }
      ];
    }
  }

  static async getProviderSlaBreachRate(filters?: ProviderPerformanceFilters): Promise<ProviderSlaBreachData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.serviceCategory && filters.serviceCategory !== 'all') {
        params.append('serviceType', filters.serviceCategory);
      }
      if (filters?.businessSize && filters.businessSize !== 'all') {
        params.append('businessSize', filters.businessSize);
      }
      if (filters?.year && /^\d{4}$/.test(filters.year)) {
        params.append('year', filters.year);
      }
      const query = params.toString();
      const url = `${API_BASE_URL}/api/slakpi/providers/breach-rate${query ? `?${query}` : ''}`;
      console.log('[AccountsService] getProviderSlaBreachRate - Calling:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('[AccountsService] getProviderSlaBreachRate - Error response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[AccountsService] getProviderSlaBreachRate - Response:', result);
      
      // Transform API response to expected format
      return result.data.map((item: any) => ({
        provider: item.name || 'Unknown Provider',
        fullName: item.name || 'Unknown Provider',
        breachRate: item.breachRate || 0
      }));
    } catch (error) {
      console.error('Failed to fetch provider SLA breach rate:', error);
      // Return mock data as fallback
      return [
        { provider: 'ADCB', fullName: 'Abu Dhabi Commercial Bank', breachRate: 6.2 },
        { provider: 'FAB', fullName: 'First Abu Dhabi Bank', breachRate: 8.5 },
        { provider: 'RAKBANK', fullName: 'RAK Bank', breachRate: 12.3 },
        { provider: 'ADCCI', fullName: 'Abu Dhabi Chamber of Commerce', breachRate: 7.1 },
        { provider: 'Flat6Labs', fullName: 'Flat6Labs Accelerator', breachRate: 9.8 }
      ];
    }
  }

  static async getProviderCompletionTime(filters?: ProviderPerformanceFilters): Promise<ProviderCompletionTimeData[]> {
    try {
      const params = new URLSearchParams();
      const fmt = (v?: string) => (v ? v.split('T')[0] : undefined);
      if (fmt(filters?.fromDate)) params.append('fromDate', fmt(filters?.fromDate)!);
      if (fmt(filters?.toDate)) params.append('toDate', fmt(filters?.toDate)!);
      if (filters?.serviceCategory && filters.serviceCategory !== 'all') {
        params.append('serviceType', filters.serviceCategory);
      }
      if (filters?.businessSize && filters.businessSize !== 'all') {
        params.append('businessSize', filters.businessSize);
      }
      if (filters?.year && /^\d{4}$/.test(filters.year)) {
        params.append('year', filters.year);
      }
      const query = params.toString();
      const url = `${API_BASE_URL}/api/accounts/providers/completion-time${query ? `?${query}` : ''}`;
      console.log('[AccountsService] getProviderCompletionTime - Calling:', url);
      const response = await fetch(url);

      if (!response.ok) {
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch {
          bodyText = 'unable to read body';
        }
        let parsed: any = null;
        try {
          parsed = bodyText ? JSON.parse(bodyText) : null;
        } catch {
          parsed = null;
        }
        const apiMessage = parsed?.message || parsed?.error || '';
        throw new Error(
          `Completion time request failed ${response.status} ${response.statusText} | url=${response.url} | body=${bodyText || 'empty'} | apiMessage=${apiMessage}`
        );
      }

      const result = await response.json();
      console.log('[AccountsService] getProviderCompletionTime - Response:', result);
      
      // Transform API response to expected format
      return result.data.providers.map((item: any) => ({
        provider: item.name || 'Unknown Provider',
        fullName: item.name || 'Unknown Provider',
        avgCompletionTime: item.avgCompletionDays || 0,
        target: item.targetBenchmark || 5
      }));
    } catch (error) {
      console.error('[AccountsService] Failed to fetch provider completion time:', error);
      // Return mock data as fallback
      return [
        { provider: 'ADCB', fullName: 'Abu Dhabi Commercial Bank', avgCompletionTime: 3.2, target: 5 },
        { provider: 'FAB', fullName: 'First Abu Dhabi Bank', avgCompletionTime: 3.8, target: 5 },
        { provider: 'RAKBANK', fullName: 'RAK Bank', avgCompletionTime: 4.5, target: 5 },
        { provider: 'ADCCI', fullName: 'Abu Dhabi Chamber of Commerce', avgCompletionTime: 3.5, target: 5 },
        { provider: 'Flat6Labs', fullName: 'Flat6Labs Accelerator', avgCompletionTime: 4.1, target: 5 }
      ];
    }
  }

  static async getProviderRequestsTracking(filters?: ProviderPerformanceFilters): Promise<ProviderRequestsData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.serviceCategory && filters.serviceCategory !== 'all') params.append('serviceType', filters.serviceCategory);
      if (filters?.businessSize && filters.businessSize !== 'all') params.append('businessSize', filters.businessSize);

      if (filters?.year && /^\d{4}$/.test(filters.year)) {
        params.append('year', filters.year);
      }
      const query = params.toString();
      const url = `${API_BASE_URL}/api/accounts/providers/requests-tracking${query ? `?${query}` : ''}`;
      console.log('[AccountsService] getProviderRequestsTracking - Calling:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('[AccountsService] getProviderRequestsTracking - Error response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[AccountsService] getProviderRequestsTracking - Response:', result);
      
      const transformedData = result.data.map((item: any) => ({
        provider: (item.providerName || item.name || 'Unknown').split(' ')[0],
        fullName: item.providerName || item.name || 'Unknown Provider',
        total: item.received || 0,
        completed: item.completed || 0
      }));
      
      return transformedData.sort((a, b) => b.total - a.total);
    } catch (error) {
      console.error('Failed to fetch provider requests tracking:', error);
      return [
        { provider: 'ADCB', fullName: 'Abu Dhabi Commercial Bank', total: 620, completed: 580 },
        { provider: 'FAB', fullName: 'First Abu Dhabi Bank', total: 540, completed: 500 },
        { provider: 'RAKBANK', fullName: 'RAK Bank', total: 410, completed: 372 },
        { provider: 'ADCCI', fullName: 'Abu Dhabi Chamber of Commerce', total: 680, completed: 642 },
        { provider: 'Flat6Labs', fullName: 'Flat6Labs Accelerator', total: 360, completed: 330 }
      ];
    }
  }

  static async getProviderBenchmarkSummary(filters?: ProviderPerformanceFilters): Promise<ProviderBenchmarkData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.serviceCategory && filters.serviceCategory !== 'all') {
        params.append('serviceType', filters.serviceCategory);
      }
      if (filters?.businessSize && filters.businessSize !== 'all') {
        params.append('businessSize', filters.businessSize);
      }
      if (filters?.year && /^\d{4}$/.test(filters.year)) {
        params.append('year', filters.year);
      }
      const query = params.toString();
      const url = `${API_BASE_URL}/api/accounts/providers/benchmark-summary${query ? `?${query}` : ''}`;
      console.log('[AccountsService] getProviderBenchmarkSummary - Calling:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('[AccountsService] getProviderBenchmarkSummary - Error response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[AccountsService] getProviderBenchmarkSummary - Response:', result);
      
      // Transform API response to expected format
      return result.data.map((item: any) => ({
        provider: item.providerName || 'Unknown Provider',
        sla: item.slaPercent || 0,
        responseTime: item.avgResponseHrs || 0,
        quality: 0, // Not provided in API response
        retention: 0, // Not provided in API response
        capacity: item.caseCount || 0,
        index: item.index || 0,
        rank: 0 // Calculate rank based on index
      })).sort((a, b) => b.index - a.index).map((item, index) => ({ ...item, rank: index + 1 }));
    } catch (error) {
      console.error('Failed to fetch provider benchmark summary:', error);
      // Return mock data as fallback
      return [
        { provider: 'ADCB', sla: 93.8, responseTime: 2.1, quality: 4.7, retention: 94.2, capacity: 82, index: 92.5, rank: 1 },
        { provider: 'FAB', sla: 91.5, responseTime: 2.4, quality: 4.5, retention: 91.8, capacity: 78, index: 89.2, rank: 2 },
        { provider: 'ADCCI', sla: 92.9, responseTime: 2.2, quality: 4.6, retention: 93.5, capacity: 85, index: 91.8, rank: 3 },
        { provider: 'AUB', sla: 87.6, responseTime: 3.1, quality: 4.2, retention: 88.3, capacity: 71, index: 84.1, rank: 6 },
        { provider: 'RAKBANK', sla: 87.7, responseTime: 2.9, quality: 4.3, retention: 89.2, capacity: 74, index: 85.3, rank: 5 },
        { provider: 'Flat6Labs', sla: 90.2, responseTime: 2.5, quality: 4.4, retention: 90.5, capacity: 76, index: 87.8, rank: 4 },
        { provider: 'EDB', sla: 94.1, responseTime: 2.0, quality: 4.8, retention: 95.0, capacity: 80, index: 93.2, rank: 1 }
      ];
    }
  }

  static async getProviderRetentionKpi(filters?: ProviderPerformanceFilters): Promise<{
    retentionRate: number;
    trend: string;
    trendValue: string;
    sparklineData: number[];
    target: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.set('fromDate', filters.fromDate);
      if (filters?.toDate) params.set('toDate', filters.toDate);
      if (filters?.serviceCategory && filters.serviceCategory !== 'all') {
        params.set('serviceType', filters.serviceCategory);
      }
      const query = params.toString();
      const url = `${API_BASE_URL}/api/analytics/provider-retention-kpi${query ? `?${query}` : ''}`;
      console.log('[AccountsService] getProviderRetentionKpi - Calling:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('[AccountsService] getProviderRetentionKpi - Error response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[AccountsService] getProviderRetentionKpi - Response:', result);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch provider retention KPI:', error);
      // Return mock data as fallback
      return {
        retentionRate: 92.5,
        trend: 'up',
        trendValue: '+1.2%',
        sparklineData: [88, 89, 90, 91, 92, 92, 93],
        target: 85
      };
    }
  }
}

export default AccountsService;
