'use client';

import { QueryClient, QueryClientProvider as ReactQueryProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMemo } from 'react';

// Cache time constants (in milliseconds)
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME,
            gcTime: CACHE_TIME, // cacheTime was renamed to gcTime in v5
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: (failureCount, error: any) => {
              // Don't retry for 4xx errors except 401/403
              if (error?.response?.status >= 400 && error?.response?.status < 500 && 
                  error?.response?.status !== 401 && error?.response?.status !== 403) {
                return false;
              }
              return failureCount < 2; // Retry once for other errors
            },
            retryDelay: (attemptIndex) => 
              Math.min(RETRY_DELAY * Math.pow(2, attemptIndex), MAX_RETRY_DELAY),
            onError: (error: any) => {
              console.error('Query error:', error);
              // Add error reporting here (e.g., Sentry, LogRocket)
            },
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry for 4xx errors
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              return failureCount < 3; // Retry up to 3 times for other errors
            },
            retryDelay: (attemptIndex) => 
              Math.min(RETRY_DELAY * Math.pow(2, attemptIndex), MAX_RETRY_DELAY),
            onError: (error: any) => {
              console.error('Mutation error:', error);
              // Add error reporting here
            },
          },
        },
      }),
    []
  );

  return (
    <ReactQueryProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </ReactQueryProvider>
  );
}
