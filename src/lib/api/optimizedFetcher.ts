import { useCallback } from 'react';

// Cache for GET requests
const requestCache = new Map<string, Promise<any>>();

interface FetchOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  timeout?: number;
}

export async function optimizedFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    useCache = true,
    cacheKey = url,
    timeout = 10000, // 10 seconds default timeout
    ...fetchOptions
  } = options;

  // Check cache first for GET requests
  if (useCache && fetchOptions.method === undefined || fetchOptions.method === 'GET') {
    const cachedResponse = requestCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Create a promise that will reject after the timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);
  });

  // Create the actual fetch promise
  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  })();

  // Cache the promise for GET requests
  if (useCache && (fetchOptions.method === undefined || fetchOptions.method === 'GET')) {
    requestCache.set(cacheKey, fetchPromise);
  }

  // Race between the fetch and the timeout
  return Promise.race([fetchPromise, timeoutPromise]);
}

// Utility function to clear cache
export function clearCache(key?: string) {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
}

// Hook version for React components
export function useOptimizedFetch() {
  const fetchWithCache = useCallback(
    async <T = any>(url: string, options: FetchOptions = {}): Promise<T> => {
      return optimizedFetch<T>(url, options);
    },
    []
  );

  return {
    fetch: fetchWithCache,
    clearCache,
  };
}
