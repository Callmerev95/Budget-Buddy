# ADR-0007: Notifikasi in-app di samping push

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

Awalnya satu-satunya notifikasi adalah push (web-push) yang dikirim langsung
dari controller transaksi. Ketergantungan: push butuh subscription aktif,
browser terbuka, serta service worker — tidak bisa diandalkan sebagai satu
pengalaman "pusat notifikasi". Juga ada ketergantungan melingkar controller.

## Keputusan

- **Dua saluran paralel**:
  1. In-app: tabel `Notification` (type, title, body, readAt) —
     notification center di UI, polling via endpoint paginated. Ini adalah
     sumber kebenaran yang dibaca pengguna.
  2. Push: fire-and-forget; `sendPushNotification` memakai `web-push`,
     menolak silent kalau `webPushEnabled` mati, dan menghapus subscription
     yang mati (404/410) saja.
- Dikemas sebagai util kecil yang *tidak boleh menggagalkan request utama*:
  `recordNotification` dan `sendPushNotification` selalu dipanggil `void`
  (dan menangkap error sendiri).
- Dipisah ke `lib/notifications.ts` + `lib/push.ts` untuk memutus siklus
  impor auth↔transaction.
- `NotificationType` di-shared: `BILL_DUE`, `PAYMENT_RECEIVED`,
  `TRANSACTION_RECORDED`.

## Konsekuensi

- Penguna yang membuka app selalu melihat riwayat, tidak peduli subscription.
- Push tetap menambah nilai (badge, tindakan) tanpa memblokir response.
- Entropi: semua jalur peristiwa yang menghasilkan notifikasi punya dua
  pemanggilan berdampingan — redudansi itu diresmikan, jangan dihapus
  satu saluran tanpa menimbang yang lain.
- Ambigu "unread" terselesaikan: `readAt` per baris, `unreadCount` di
  response list.