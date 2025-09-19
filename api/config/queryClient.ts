import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error: any) => {
        console.error("❌ [React Query] Global Mutation Error:", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
        });
      },
    },
  },
});