import { QueryClient } from '@tanstack/react-query';

// Create a client
const STALE_TIME = 1000 * 60 * 5; // 5 minutes

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default queryClient;
