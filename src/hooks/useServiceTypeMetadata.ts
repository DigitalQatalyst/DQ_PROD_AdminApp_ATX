import { useState, useEffect } from 'react';
import { fetchServiceTypeMetadata, ServiceTypeMetadata } from '../api/productServiceApi';

interface UseServiceTypeMetadataResult {
  serviceTypes: ServiceTypeMetadata[];
  loading: boolean;
  error: string | null;
}

export const useServiceTypeMetadata = (): UseServiceTypeMetadataResult => {
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getMetadata = async () => {
      try {
        const data = await fetchServiceTypeMetadata();
        if (isMounted) {
          // Add an 'All Sub-Services' option at the beginning
          setServiceTypes([{ value: 'all', label: 'All Sub-Services' }, ...data]);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  return { serviceTypes, loading, error };
};
