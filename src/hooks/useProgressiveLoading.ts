import { useState, useEffect } from 'react';

interface LoadingPriority {
  critical: string[];    // Load immediately
  high: string[];        // Load after critical
  medium: string[];      // Load after high
  low: string[];         // Load last
}

export const useProgressiveLoading = (
  fetchFunctions: Record<string, () => Promise<any>>,
  priorities: LoadingPriority
) => {
  const [loadedData, setLoadedData] = useState<Record<string, any>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error>>({});

  useEffect(() => {
    const loadData = async () => {
      // Load critical data first
      await loadBatch(priorities.critical);
      
      // Then high priority
      await loadBatch(priorities.high);
      
      // Then medium priority
      await loadBatch(priorities.medium);
      
      // Finally low priority
      await loadBatch(priorities.low);
    };

    const loadBatch = async (keys: string[]) => {
      const promises = keys.map(async (key) => {
        if (!fetchFunctions[key]) return;
        
        setLoadingStates(prev => ({ ...prev, [key]: true }));
        
        try {
          const data = await fetchFunctions[key]();
          setLoadedData(prev => ({ ...prev, [key]: data }));
        } catch (error) {
          setErrors(prev => ({ ...prev, [key]: error as Error }));
        } finally {
          setLoadingStates(prev => ({ ...prev, [key]: false }));
        }
      });

      await Promise.all(promises);
    };

    loadData();
  }, []);

  return { loadedData, loadingStates, errors };
};
