import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from './api-client';

/** App-wide TanStack Query client with sensible production defaults. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx); they won't succeed on retry.
        if (error instanceof ApiRequestError && error.status && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
