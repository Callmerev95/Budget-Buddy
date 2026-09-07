import { useState } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import type { Notification } from "@budget-buddy/shared";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import { PageHeader } from "../components/ui/PageHeader";
import { Tabs } from "../components/ui/Tabs";
import { Card, EmptyState, SectionHeader, Skeleton } from "../components/ui/Primitives";
import { Button } from "../components/ui/Button";
import { toErrorMessage } from "../lib/api";
import { formatRelative } from "../lib/format";

const TYPE_META: Record<Notification["type"], { label: string; className: string }> = {
  BILL_DUE: { label: "Tagihan", className: "bg-warning/10 text-warning" },
  PAYMENT_RECEIVED: { label: "Pembayaran", className: "bg-income/10 text-income" },
  TRANSACTION_RECORDED: { label: "Transaksi", className: "bg-accent/10 text-accent" },
};

function NotificationRow({
  item,
  onOpen,
}: {
  item: Notification;
  onOpen: (id: string) => void;
}) {
  const meta = TYPE_META[item.type];
  const unread = item.readAt === null;

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      aria-label={`${item.title}${unread ? ", belum dibaca" : ""}`}
      className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-2/60"
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${meta.className}`}
      >
        <BellRing size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`text-[15px] ${unread ? "font-semibold" : "font-medium"}`}>
            {item.title}
          </span>
          {unread && (
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-accent"
            />
          )}
        </span>
        <span className="mt-0.5 block truncate text-sm text-muted">{item.body}</span>
        <span className="mt-1 block text-[13px] text-muted">
          {meta.label} · {formatRelative(item.createdAt)}
        </span>
      </span>
    </button>
  );
}

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = useNotifications(unreadOnly);
  const markRead = useMarkNotificationRead();
  const markAllApi = useMarkAllNotificationsRead();

  const pages = query.data?.pages ?? [];
  const items = pages.flatMap((page) => page.data);
  const unreadCount = pages[0]?.unreadCount ?? 0;

  const open = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menandai notifikasi."));
    }
  };

  const markAllRead = async () => {
    try {
      await markAllApi.mutateAsync();
      toast.success("Semua ditandai dibaca.");
    } catch (err) {
      toast.error(toErrorMessage(err, "Gagal menandai notifikasi."));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifikasi"
        subtitle={
          unreadCount > 0 ? `${unreadCount} belum dibaca.` : "Semua sudah dibaca."
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              loading={markAllApi.isPending}
              onClick={() => void markAllRead()}
            >
              <CheckCheck size={15} aria-hidden="true" /> Tandai semua
            </Button>
          ) : undefined
        }
      />

      <Tabs
        label="Filter notifikasi"
        value={unreadOnly ? "unread" : "all"}
        onChange={(v) => setUnreadOnly(v === "unread")}
        options={[
          { value: "all", label: "Semua" },
          { value: "unread", label: "Belum dibaca" },
        ]}
      />

      <section>
        <SectionHeader title={unreadOnly ? "Belum dibaca" : "Terbaru"} />
        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : query.isError ? (
          <EmptyState
            title="Gagal memuat notifikasi"
            action={
              <Button size="sm" onClick={() => void query.refetch()}>
                Coba lagi
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={unreadOnly ? "Tidak ada yang belum dibaca" : "Belum ada notifikasi"}
            description={
              unreadOnly
                ? "Semua sudah dibaca. Santai."
                : "Pengingat tagihan, konfirmasi bayar, dan tanda terima akan muncul di sini."
            }
          />
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            {items.map((item) => (
              <NotificationRow key={item.id} item={item} onOpen={(id) => void open(id)} />
            ))}
          </Card>
        )}
        {query.hasNextPage && (
          <Button
            variant="secondary"
            className="mt-4 w-full"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            Muat lebih banyak
          </Button>
        )}
      </section>
    </div>
  );
}
