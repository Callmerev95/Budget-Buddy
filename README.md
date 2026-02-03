# 💸 BUDGETBUDDY (Multi-User SaaS)

> **The Next Gen Financial Framework** — Solusi manajemen keuangan cerdas untuk menguasai arus kas harian dengan presisi tinggi dan antarmuka premium.

---

## 🎭 Vision & Philosophy

Budget Buddy bukan sekadar aplikasi pencatat. Ia lahir dari filosofi kemudahan dan keamanan, dirancang khusus agar Anda bisa fokus merencanakan masa depan tanpa pusing memikirkan angka-angka yang rumit.

## 🛠️ Tech Stack & Architecture

Project ini menggunakan arsitektur Monorepo yang terbagi menjadi `client`, `server`, dan `shared` untuk efisiensi maksimal.

### **Frontend** (Vite + React)

- **Core**: React, React Router DOM, TypeScript.
- **State & Data**: Zustand & TanStack Query.
- **UI/UX**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Visualization**: Recharts.

### **Backend** (Node.js + Express)

- **Runtime**: Node.js via TSX (TypeScript Execution).
- **Database & ORM**: PostgreSQL via Prisma ORM & Supabase SDK.
- **Auth**: JSON Web Token (JWT).
- **Services**: Node-Cron (Task Scheduling) & Web Push Notifications.

### **Shared**

- **Validation**: Zod (Shared schemas antara Frontend & Backend).

## ✨ Key Features

- **Progressive Web App (PWA)**: Aplikasi dapat di-instal langsung di homescreen Android maupun iOS tanpa melalui App Store, lengkap dengan dukungan offline.
- **Smart Daily Allowance**: Kalkulasi jatah jajan harian otomatis berdasarkan sisa saldo dan rencana keuangan bulanan.
- **Fixed Expense Control**: Manajemen pengeluaran tetap untuk memastikan tagihan rutin selalu terkontrol.
- **Live Analytics**: Visualisasi grafik keuangan yang interaktif menggunakan Recharts.
- **Real-time Push Notifications**: Notifikasi pengingat penting langsung ke browser Anda.
- **Advanced Auth**: Sistem registrasi, login, hingga reset password via email.

## 🛡️ Coding Standards

Kami menerapkan standar kualitas kode yang ketat:

- **Zero Any Policy**: Penggunaan tipe `any` pada parameter fungsi dilarang keras demi menjamin _type-safety_ dan stabilitas jangka panjang.
- **Shared Schemas**: Validasi data terpusat menggunakan Zod untuk konsistensi antara UI dan API.
- **Linting**: Konsistensi penulisan kode dipantau melalui ESLint.

## 🚀 Getting Started

Ikuti langkah-langkah di bawah ini untuk menjalankan project di lingkungan lokal.

### **1. Clone Repository**

git clone [https://github.com/callmerev95/budget-buddy.git]
cd budget-buddy

### 2. Setup Backend (Server)

1. **Masuk ke folder server**: `cd server`
2. **Install dependensi**: `npm install`
3. **Duplikat file `.env.example` menjadi `.env`** dan isi kredensial (Database URL, JWT Secret, VAPID Keys).
4. **Jalankan migrasi database**: `npx prisma migrate dev`
5. **Jalankan server**: `npm run dev`

### 3. Setup Frontend (Client)

1. **Buka terminal baru dan masuk ke folder client**: `cd client`
2. **Install dependensi**: `npm install`
3. **Jalankan aplikasi**: `npm run dev`

### 4. Web Push Setup (Optional)

Jika ingin mengaktifkan notifikasi:

- **Generate VAPID keys** di folder server: `npx web-push generate-vapid-keys`
- **Masukkan hasilnya ke `.env` server** dan sesuaikan Public Key di `Dashboard.tsx` pada client.

---

## 📑 Versioning

- **Current Version**: `v1.0.0-stable`
- **Next Roadmap**: Implementasi Dark/Light Mode Toggle.

## 👨‍💻 Crafted by

**REV** — _Crafted with passion to help you manage your financial journey._

---

© 2026 Budget Buddy Framework.
