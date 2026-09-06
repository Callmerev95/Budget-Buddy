import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Notification } from "@budget-buddy/shared";
import { api } from "../lib/api";
import { queryKeys } from "../lib/query";

interface NotificationPage {
  data: Notification[];
  unreadCount: number;
  nextCursor: string | null;
}

async function fetchPage(params: {
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
}): Promise<NotificationPage> {
  const res = await api.get<NotificationPage>("/notifications", { params });
  return res.data;
}

export function useNotifications(unreadOnly = false) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.notifications, { unreadOnly }] as const,
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      fetchPage({ unreadOnly, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/** Hitungan belum-dibaca untuk badge, polling ringan tiap menit. */
export function useUnreadCount() {
  const query = useQuery({
    queryKey: [...queryKeys.notifications, { unreadCount: true }] as const,
    queryFn: () => fetchPage({ limit: 1 }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  return { ...query, unreadCount: query.data?.unreadCount ?? 0 };
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.patch("/notifications/read-all")).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
