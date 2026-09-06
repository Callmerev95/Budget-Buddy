/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Shell offline: navigasi yang gagal jaringan disajikan index.html dari cache.
const navigationRoute = new NavigationRoute(async ({ request, url }) => {
  void request;
  // Jangan intersep API dan file statis ber-hash.
  if (url.pathname.startsWith("/api/")) return Response.error();
  try {
    const cached = await caches.match("/index.html", { ignoreSearch: true });
    if (cached) return cached;
  } catch {
    // Abaikan, jatuh ke fetch jaringan di bawah.
  }
  return fetch("/index.html");
});
registerRoute(navigationRoute);

interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  let data: PushPayload = {
    title: "Budget Buddy",
    body: "Ada update baru untuk keuanganmu!",
    url: "/dashboard",
  };

  try {
    if (event.data) data = { ...data, ...(event.data.json() as PushPayload) };
  } catch {
    if (event.data) data.body = event.data.text();
  }

  const title = data.title ?? "Budget Buddy";
  const tag = `reminder-${title.replace(/\s+/g, "-").toLowerCase()}`;

  // `vibrate` dan `renotify` bagian dari spec Web Notification, tapi belum
  // ada di lib DOM TypeScript — ditambahkan via perluasan tipe.
  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag,
    data: { url: data.url ?? "/dashboard" },
  } as NotificationOptions & { vibrate: number[]; renotify: boolean };
  options.vibrate = [150, 50, 150];
  options.renotify = true;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | null)?.url ?? "/dashboard";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window" });
      for (const client of windows) {
        if (
          "focus" in client &&
          (client as WindowClient).url.includes(self.location.origin)
        ) {
          await (client as WindowClient).focus();
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(url);
    })(),
  );
});
