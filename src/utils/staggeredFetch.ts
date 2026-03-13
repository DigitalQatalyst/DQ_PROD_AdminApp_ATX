// Utility to stagger API requests to avoid rate limiting
export const staggeredFetch = async <T>(
  fetchFunctions: (() => Promise<T>)[],
  delayMs: number = 100
): Promise<T[]> => {
  const results: T[] = [];

  for (const fetchFn of fetchFunctions) {
    try {
      const result = await fetchFn();
      results.push(result);
      
      // Wait before next request
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      results.push(null as T);
    }
  }

  return results;
};

// Batch requests into groups
export const batchedFetch = async <T>(
  fetchFunctions: (() => Promise<T>)[],
  batchSize: number = 5,
  delayBetweenBatches: number = 500
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < fetchFunctions.length; i += batchSize) {
    const batch = fetchFunctions.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(fn => fn().catch(err => {
        console.error('Batch fetch error:', err);
        return null as T;
      }))
    );
    
    results.push(...batchResults);
    
    // Wait before next batch
    if (i + batchSize < fetchFunctions.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
};
