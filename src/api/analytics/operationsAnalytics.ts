import { API_BASE_URL } from './config';

// Types for operations analytics
export interface StaffMetrics {
  totalActiveStaff: number;
  totalActiveStaffChange: number;
  avgResponseTime: string;
  avgResponseTimeChange: number;
  systemUptime: string;
  systemUptimeChange: number;
  activeAlerts: number;
}

export interface ServiceVolumeData {
  date: string;
  services: number;
  requests: number;
  completions: number;
}

export interface ServiceFunnelData {
  stage: string;
  value: number;
  percentage: number;
}

export interface StageCycleTimeData {
  stage: string;
  avgTime: number;
  target: number;
}

export interface EfficiencyMatrixData {
  service: string;
  metric: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
}

export interface AlertData {
  id: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

export interface InsightData {
  id: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

/**
 * Fetch staff KPI metrics
 */
export async function fetchStaffMetrics(): Promise<StaffMetrics> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/staff-metrics`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching staff metrics:', error);
    // Return mock data as fallback
    return {
      totalActiveStaff: 1234,
      totalActiveStaffChange: 12.5,
      avgResponseTime: '2m 45s',
      avgResponseTimeChange: -5.2,
      systemUptime: '99.9%',
      systemUptimeChange: 0.3,
      activeAlerts: 3
    };
  }
}

/**
 * Fetch service volume data over time
 */
export async function fetchServiceVolumeData(
  dateRange = 'last-30-days'
): Promise<ServiceVolumeData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/service-volume?dateRange=${dateRange}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching service volume data:', error);
    // Return mock data as fallback
    return generateMockServiceVolumeData();
  }
}

/**
 * Fetch service funnel data
 */
export async function fetchServiceFunnelData(): Promise<ServiceFunnelData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/service-funnel`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching service funnel data:', error);
    return [
      { stage: 'Requests Received', value: 1000, percentage: 100 },
      { stage: 'In Progress', value: 750, percentage: 75 },
      { stage: 'Under Review', value: 500, percentage: 50 },
      { stage: 'Approved', value: 350, percentage: 35 },
      { stage: 'Completed', value: 280, percentage: 28 }
    ];
  }
}

/**
 * Fetch stage cycle time data
 */
export async function fetchStageCycleTimeData(): Promise<StageCycleTimeData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/stage-cycle-time`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stage cycle time data:', error);
    return [
      { stage: 'Initial Review', avgTime: 2.5, target: 2.0 },
      { stage: 'Processing', avgTime: 4.8, target: 4.0 },
      { stage: 'Approval', avgTime: 1.5, target: 1.0 },
      { stage: 'Completion', avgTime: 3.2, target: 3.0 }
    ];
  }
}

/**
 * Fetch efficiency matrix data
 */
export async function fetchEfficiencyMatrixData(): Promise<EfficiencyMatrixData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/efficiency-matrix`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching efficiency matrix data:', error);
    return generateMockEfficiencyMatrix();
  }
}

/**
 * Fetch real-time alerts
 */
export async function fetchRealTimeAlerts(): Promise<AlertData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/alerts`);
    const data = await response.json();
    return data.map((alert: any) => ({
      ...alert,
      timestamp: new Date(alert.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [
      {
        id: 1,
        message: 'High response time detected in Service A',
        severity: 'warning',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 2,
        message: 'System maintenance scheduled for tonight',
        severity: 'info',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 3,
        message: 'New user registration spike detected',
        severity: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
  }
}

/**
 * Fetch AI-powered insights
 */
export async function fetchAIInsights(): Promise<InsightData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/operations/ai-insights`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return [
      {
        id: 1,
        title: 'Peak Usage Hours',
        description: 'System usage peaks between 2-4 PM. Consider scaling resources during these hours.',
        impact: 'high',
        category: 'Performance'
      },
      {
        id: 2,
        title: 'Service Optimization',
        description: 'Service B has 20% longer processing time. Review workflow for optimization opportunities.',
        impact: 'medium',
        category: 'Efficiency'
      },
      {
        id: 3,
        title: 'User Engagement',
        description: 'User engagement increased by 15% after recent UI updates.',
        impact: 'medium',
        category: 'User Experience'
      },
      {
        id: 4,
        title: 'Staff Allocation',
        description: 'Consider redistributing staff during low-traffic hours to improve response times.',
        impact: 'high',
        category: 'Resource Management'
      }
    ];
  }
}

// Helper functions for mock data generation
function generateMockServiceVolumeData(): ServiceVolumeData[] {
  const data: ServiceVolumeData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      services: Math.floor(Math.random() * 50) + 100,
      requests: Math.floor(Math.random() * 100) + 200,
      completions: Math.floor(Math.random() * 80) + 150
    });
  }
  
  return data;
}

function generateMockEfficiencyMatrix(): EfficiencyMatrixData[] {
  const services = ['Service A', 'Service B', 'Service C', 'Service D'];
  const metrics = ['Response Time', 'Completion Rate', 'Quality Score', 'User Satisfaction'];
  const data: EfficiencyMatrixData[] = [];
  
  services.forEach(service => {
    metrics.forEach(metric => {
      const value = Math.random() * 100;
      let status: 'good' | 'warning' | 'critical';
      
      if (value >= 80) status = 'good';
      else if (value >= 60) status = 'warning';
      else status = 'critical';
      
      data.push({ service, metric, value, status });
    });
  });
  
  return data;
}
