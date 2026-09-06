import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/query";

export interface Occurrence {
  id: string;
  ruleId: string;
  periodKey: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "SKIPPED";
  transactionId: string | null;
  notifiedAt: string | null;
  rule: { id: string; name: string; amount: number };
}

export function useOccurrences(month: string) {
  return useQuery({
    queryKey: queryKeys.occurrences(month),
    queryFn: async () =>
      (await api.get<{ data: Occurrence[] }>("/recurring", { params: { month } })).data
        .data,
  });
}

export function usePayOccurrence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/recurring/${id}/pay`)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["occurrences"] });
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
      void client.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useSkipOccurrence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/recurring/${id}/skip`)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["occurrences"] });
    },
  });
}
