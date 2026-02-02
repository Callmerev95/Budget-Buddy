/**
 * Service Worker: Mengelola push notification di sisi client.
 * Mendukung Unique Tagging agar notifikasi tidak menumpuk berantakan.
 */
self.addEventListener("push", (event) => {
  let data = {
    title: "Budget Buddy",
    body: "Ada update baru untuk keuanganmu!",
    url: "/",
  };

  // 1. Parsing data JSON dari server push service
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  // 2. Konfigurasi Notifikasi
  const options = {
    body: data.body,
    icon: "/bb.png",
    badge: "/bb.png",
    vibrate: [150, 50, 150],
    // UNIQUE TAGGING: Menghasilkan ID unik per kategori tagihan
    // Contoh: 'reminder-tagihan-wifi' tidak akan menimpa 'reminder-tagihan-netflix'
    tag: `reminder-${data.title.replace(/\s+/g, "-").toLowerCase()}`,
    renotify: true, // Bergetar kembali jika notif dengan tag yang sama diperbarui
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/**
 * Listener: Menangani aksi ketika user mengklik banner notifikasi.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Tutup banner setelah diklik

  // Arahkan user ke URL yang dikirim dalam data (default ke Dashboard)
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    }),
  );
});
