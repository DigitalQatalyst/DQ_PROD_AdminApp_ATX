const API_BASE_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:5000';

interface ApiCallConfig {
  endpoint: string;
  params: Record<string, string>;
  defaultValue: any;
  logPrefix: string;
}

export async function fetchApiData<T>(config: ApiCallConfig): Promise<T> {
  try {
    const queryString = new URLSearchParams(config.params).toString();
    const url = `${API_BASE_URL}${config.endpoint}?${queryString}`;
    console.log(`Dashboard - Calling ${config.logPrefix} API:`, url);
    
    const response = await fetch(url);
    const result = await response.json();
    const data = result.success ? result.data : config.defaultValue;
    
    console.log(`Dashboard - ${config.logPrefix} API success:`, data);
    return data;
  } catch (err) {
    console.error(`Dashboard - ${config.logPrefix} API failed:`, err);
    return config.defaultValue;
  }
}

export function normalizeTrend(trend: string): 'up' | 'down' | 'stable' {
  return (trend === 'up' || trend === 'down' || trend === 'stable') ? trend as 'up' | 'down' | 'stable' : 'stable';
}
