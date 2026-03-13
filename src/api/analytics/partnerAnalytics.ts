import { API_BASE_URL } from './config';

export type ChurnRetentionPeriod = 'month' | 'quarter';

export async function fetchPartnerCount() {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/accounts/partners/count?${query}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data.success ? { count: data.count, target: data.target } : { count: 0, target: 0 };
}

export async function fetchActivationRate() {
  const [partnerResponse, wonResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/accounts/partners/count`),
    fetch(`${API_BASE_URL}/api/opportunities/partners/won/count`)
  ]);
  const partnerData = await partnerResponse.json();
  const wonData = await wonResponse.json();
  
  const totalPartners = partnerData.success ? partnerData.count : 0;
  const wonCount = wonData.success ? wonData.count : 0;
  const rate = totalPartners > 0 ? Math.round((wonCount / totalPartners) * 100) : 0;
  const target = Math.round(rate * 0.94);
  
  return { count: wonCount, rate, target };
}

export async function fetchServiceUtilization() {
  const response = await fetch(`${API_BASE_URL}/api/opportunities/partners/service-utilization`);
  const data = await response.json();
  const percentage = data.success ? data.percentage : 0;
  const target = Math.round(percentage * 0.85);
  return { percentage, target };
}

export async function fetchEnquiryActivation(filters?: any) {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/incidents/partners/enquiry-activation?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success || !result.data) return [];
  
  return result.data.map((item: any) => ({
    month: item.month,
    enquiries: item.enquiries || 0,
    activations: item.activations || 0,
  }));
}

export async function fetchDropoffRate(filters?: any) {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/incidents/partners/dropoff-rate?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success || !result.data) return [];
  
  return result.data.map((item: any) => ({
    month: item.month,
    value: item.value || 0,
    total: item.total || 0,
    cancelled: item.cancelled || 0,
  }));
}

export async function fetchOpportunityWinRate(filters?: any) {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/opportunities/win-rate?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success) return { won: 0, total: 0, winRate: 0 };
  
  return {
    won: result.won || 0,
    total: result.total || 0,
    winRate: result.winRate || 0,
  };
}

export async function fetchPartnerLeadQualificationRate(filters?: any) {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/leads/partners/qualification-rate?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success) return { qualified: 0, total: 0, qualificationRate: 0 };
  
  return {
    qualified: result.qualified || 0,
    total: result.total || 0,
    qualificationRate: result.qualificationRate || 0,
  };
}

export async function fetchPartnerLeadAlerts() {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/leads/partners/alerts?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success || !result.data) return [];
  
  return result.data;
}

export interface PartnerChurnRetentionParams {
  partnerId: string;
  period?: ChurnRetentionPeriod;
  months?: number;
  days?: number;
  asOfDate?: string;
  caseTypes?: number[];
}

export interface PartnerChurnRetentionPoint {
  periodStart: string;
  periodEnd: string;
  label: string;
  previousActive: number;
  retained: number;
  churned: number;
  retentionRate: number;
  churnRate: number;
}

export async function fetchPartnerChurnRetention(
  _params: PartnerChurnRetentionParams, subServiceType?: string, filters?: any): Promise<PartnerChurnRetentionPoint[]> {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const queryParams = new URLSearchParams();
  queryParams.set('azureId', azureId);
  if (filters?.year) queryParams.set('year', filters.year);
  if (filters?.serviceCategory) queryParams.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) queryParams.set('region', filters.region);
  if (filters?.enterpriseSize) queryParams.set('enterpriseSize', filters.enterpriseSize);
  if (subServiceType && subServiceType !== 'all') queryParams.set('subServiceType', subServiceType);

  const query = queryParams.toString();
  const url = `${API_BASE_URL}/api/analytics/churn-retention?${query}`;

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch churn retention metrics');
  }

  return result.data ?? [];
}

export interface PartnerRepeatUsagePoint {
  periodStart: string;
  periodEnd: string;
  label: string;
  firstTimeUsers: number;
  repeatUsers: number;
}

export async function fetchPartnerRepeatUsage(_partnerId?: string, subServiceType?: string, filters?: any): Promise<PartnerRepeatUsagePoint[]> {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (subServiceType && subServiceType !== 'all') {
    params.set('subServiceType', subServiceType);
  }
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/analytics/repeat-usage?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch repeat usage metrics');
  }

  return result.data ?? [];
}

export interface PartnerActiveUserRatePoint {
  periodStart: string;
  periodEnd: string;
  label: string;
  activeCount: number;
  engagedCount: number;
  rate: number;
}

export async function fetchPartnerActiveUserRate(subServiceType?: string, filters?: any): Promise<PartnerActiveUserRatePoint[]> {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (subServiceType && subServiceType !== 'all') {
    params.set('subServiceType', subServiceType);
  }
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/analytics/active-user-rate?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch active user rate metrics');
  }

  return result.data ?? [];
}

export async function fetchTimeToActivationForPartner(_partnerId?: string, period = 'day', days = 7, filters?: any) {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  params.set('period', period);
  params.set('days', days.toString());
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/analytics/time-to-activation?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch time to activation data');
  }
  
  return result.data ?? [];
}

export async function fetchAverageUsageForPartner(filters?: any) {
  // Get Azure ID from localStorage
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }
  
  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/analytics/average-usage?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch average usage data');
  }
  
  return result.data ?? {};
}

export async function fetchRetentionRateForPartner(_partnerId?: string, subServiceType?: string, filters?: any) {
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }

  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (subServiceType && subServiceType !== 'all') {
    params.set('subServiceType', subServiceType);
  }
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/analytics/retention-rate?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch retention rate data');
  }
  
  return result.data ?? {};
}

export async function fetchEngagementSummaryForPartner(_partnerId?: string, filters?: any) {
  // Get Azure ID from localStorage (stored during Azure authentication)
  const azureUserInfo = localStorage.getItem('azure_user_info');
  let azureId = null;
  
  if (azureUserInfo) {
    const userInfo = JSON.parse(azureUserInfo);
    azureId = userInfo.localAccountId || userInfo.homeAccountId;
  }
  
  // Fallback: try to get from user_id if azure_user_info not available
  if (!azureId) {
    azureId = localStorage.getItem('user_id');
  }
  
  if (!azureId) {
    throw new Error('Azure ID not found. Please login again.');
  }
  
  const params = new URLSearchParams();
  params.set('azureId', azureId);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.serviceCategory) params.set('serviceCategory', filters.serviceCategory);
  if (filters?.subServiceType && filters.subServiceType !== 'all') params.set('subServiceType', filters.subServiceType);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.enterpriseSize) params.set('enterpriseSize', filters.enterpriseSize);
  
  const query = params.toString();
  const url = `${API_BASE_URL}/api/analytics/engagement-summary?${query}`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch engagement summary data');
  }
  
  return result.data ?? {};
}
