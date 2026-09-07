import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  FixedExpense,
  MonthlySummary,
  Transaction,
  UserProfile,
} from "@budget-buddy/shared";
import { api } from "../lib/api";
import { queryClient, queryKeys } from "../lib/query";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => (await api.get<UserProfile>("/user/me")).data,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: async () => (await api.get<MonthlySummary>("/transactions/summary")).data,
  });
}

interface TransactionPage {
  data: Transaction[];
  nextCursor: string | null;
}

export function useTransactions() {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions,
    queryFn: async ({ pageParam }: { pageParam: string | null }) =>
      (
        await api.get<TransactionPage>("/transactions", {
          params: { limit: 50, ...(pageParam ? { cursor: pageParam } : {}) },
        })
      ).data,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useRules() {
  return useQuery({
    queryKey: queryKeys.rules,
    queryFn: async () =>
      (await api.get<{ data: FixedExpense[] }>("/fixed-expenses")).data.data,
  });
}

function invalidateAll() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
  void queryClient.invalidateQueries({ queryKey: queryKeys.summary });
  void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
  void queryClient.invalidateQueries({ queryKey: queryKeys.rules });
  void queryClient.invalidateQueries({ queryKey: ["occurrences"] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
}

export function useAddTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      description: string;
      amount: number;
      category: string;
      type?: "INCOME" | "EXPENSE";
      accountId?: string;
    }) => (await api.post("/transactions", input)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
      void client.invalidateQueries({ queryKey: queryKeys.summary });
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useTransfer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description?: string;
    }) => (await api.post("/transactions/transfer", input)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
      void client.invalidateQueries({ queryKey: queryKeys.summary });
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
      void client.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useDeleteTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/transactions/${id}`)).data,
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: queryKeys.transactions });
      const previous = client.getQueryData(queryKeys.transactions);
      client.setQueriesData<{ pages: TransactionPage[] }>(
        { queryKey: queryKeys.transactions },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((txn) => txn.id !== id),
            })),
          },
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous)
        client.setQueryData(queryKeys.transactions, context.previous);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
      void client.invalidateQueries({ queryKey: queryKeys.summary });
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useSavePlan() {
  return useMutation({
    mutationFn: async (input: {
      monthlyIncome: number;
      savingsTarget: number;
      isPercentTarget: boolean;
    }) => (await api.patch("/user/financial-plan", input)).data,
    onSuccess: () => invalidateAll(),
  });
}

export function useAddRule() {
  return useMutation({
    mutationFn: async (input: { name: string; amount: number; dueDate: number }) =>
      (await api.post("/fixed-expenses", input)).data,
    onSuccess: () => invalidateAll(),
  });
}

export function useDeleteRule() {
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/fixed-expenses/${id}`)).data,
    onSuccess: () => invalidateAll(),
  });
}

export function usePayRule() {
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/fixed-expenses/${id}/pay`)).data,
    onSuccess: () => invalidateAll(),
  });
}
