import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed requests once
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes (prevents immediate refetch)
      gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes (garbage collection)
      refetchOnWindowFocus: false, // Don't refetch when window is focused (optional, often preferred)
    },
  },
});
