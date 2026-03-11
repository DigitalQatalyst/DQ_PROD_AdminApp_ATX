import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/analytics/config';

interface ProviderRetentionResponse {
  success: boolean;
  data: {
    retentionRate: number;
    trend: string;
    trendValue: string;
    sparklineData: number[];
    target: number;
  };
}

export const useProviderRetention = () => {
  const [data, setData] = useState<ProviderRetentionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetentionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/analytics/provider-retention-kpi`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch retention data');
      } finally {
        setLoading(false);
      }
    };

    fetchRetentionData();
  }, []);

  return {
    retentionRate: data?.data?.retentionRate ?? 0,
    trend: data?.data?.trend ?? 'neutral',
    trendValue: data?.data?.trendValue ?? '+0.0%',
    sparklineData: data?.data?.sparklineData ?? [],
    target: data?.data?.target ?? 85,
    loading,
    error
  };
};