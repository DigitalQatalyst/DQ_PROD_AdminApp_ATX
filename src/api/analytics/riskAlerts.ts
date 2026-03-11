export interface RiskAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
  timestamp: string;
  action?: string;
}

export const fetchRiskAlerts = async (serviceCategory?: string): Promise<RiskAlert[]> => {
  try {
    const baseUrl = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/analytics/risk-alerts${serviceCategory ? `?serviceCategory=${serviceCategory}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Risk alerts endpoint not available, using mock data');
      return [];
    }
    
    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.warn('Error fetching risk alerts, using mock data:', error);
    return [];
  }
};
