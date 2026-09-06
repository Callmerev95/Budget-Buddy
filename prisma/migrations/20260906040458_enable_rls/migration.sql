-- Aktifkan Row Level Security di semua tabel aplikasi.
--
-- Aplikasi mengakses database hanya lewat Prisma sebagai role `prisma`
-- (bypassrls), sehingga RLS tidak menghalangi query aplikasi. RLS di sini
-- adalah lapis kedua yang menutup akses PostgREST (Data API): tanpa policy,
-- RLS menolak semua akses anon/authenticated.
-- Lapis pertama adalah pencabutan grant (migration lock_down_data_api di
-- Supabase) plus Data API yang dimatikan di dashboard.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FixedExpense" ENABLE ROW LEVEL SECURITY;
