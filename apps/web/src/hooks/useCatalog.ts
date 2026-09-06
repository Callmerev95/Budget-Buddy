import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, Category } from "@budget-buddy/shared";
import { api } from "../lib/api";
import { queryKeys } from "../lib/query";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () =>
      (await api.get<{ data: Account[] }>("/catalog/accounts")).data.data,
  });
}

export function useAddAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      type: "CASH" | "BANK" | "EWALLET";
      initialBalance: number;
    }) => (await api.post("/catalog/accounts", input)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () =>
      (await api.get<{ data: Category[] }>("/catalog/categories")).data.data,
    staleTime: 5 * 60_000,
  });
}

export interface BudgetRow {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  periodStart: string;
  periodEnd: string;
  category: { id: string; name: string; icon: string; color: string };
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: ["budgets", month],
    queryFn: async () =>
      (await api.get<{ data: BudgetRow[] }>("/catalog/budgets", { params: { month } }))
        .data.data,
  });
}

export function useAddBudget() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      categoryId: string;
      periodStart: string;
      periodEnd: string;
      amount: number;
    }) => (await api.post("/catalog/budgets", input)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/catalog/budgets/${id}`)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export interface GoalRow {
  id: string;
  name: string;
  target: number;
  saved: number;
  targetDate: string | null;
  createdAt: string;
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await api.get<{ data: GoalRow[] }>("/catalog/goals")).data.data,
  });
}

export function useAddGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; target: number; targetDate?: string }) =>
      (await api.post("/catalog/goals", input)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useAddGoalProgress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) =>
      (await api.patch(`/catalog/goals/${id}/progress`, { amount })).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["goals"] });
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
      void client.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export interface TrendPoint {
  periodKey: string;
  income: number;
  expense: number;
}

export function useTrend(months = 6) {
  return useQuery({
    queryKey: ["trend", months],
    queryFn: async () =>
      (await api.get<{ data: TrendPoint[] }>("/reports/monthly", { params: { months } }))
        .data.data,
  });
}

export function useDeleteGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/catalog/goals/${id}`)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/catalog/accounts/${id}`)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export interface CompareData {
  month: string;
  previousMonth: string;
  current: { income: number; expense: number };
  previous: { income: number; expense: number };
  deltas: Array<{ name: string; current: number; previous: number }>;
}

export function useCompare(month: string) {
  return useQuery({
    queryKey: ["compare", month],
    queryFn: async () =>
      (await api.get<{ data: CompareData }>("/reports/compare", { params: { month } }))
        .data.data,
  });
}
