import { API_BASE_URL } from './config';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ServicePerformanceAlert {
  id: string;
  metric: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  value: number;
  unit?: string;
  target?: number;
  comparison?: {
    previous?: number;
    label?: string;
  };
  timestamp: string;
}

export async function fetchServicePerformanceAlerts(
  debug = false,
  context?: string,
  startDate?: string,
  endDate?: string,
  serviceCategory?: string
): Promise<ServicePerformanceAlert[]> {
  const params = new URLSearchParams();
  if (debug) params.set('debug', 'true');
  if (context) params.set('context', context);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (serviceCategory) params.set('serviceCategory', serviceCategory);
  
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/analytics/real-time-alerts${query ? `?${query}` : ''}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch service performance alerts');
  }

  return (result.data || []) as ServicePerformanceAlert[];
}
