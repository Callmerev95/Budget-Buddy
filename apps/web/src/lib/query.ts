import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  profile: ["profile"] as const,
  summary: ["summary"] as const,
  transactions: ["transactions"] as const,
  rules: ["rules"] as const,
  occurrences: (month: string) => ["occurrences", month] as const,
  categories: ["categories"] as const,
  accounts: ["accounts"] as const,
};
