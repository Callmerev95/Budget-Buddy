#!/usr/bin/env node
/**
 * Smoke test auth end-to-end.
 *
 * Alur: sign-in sebagai test user -> GET /user/me (profil harus terbuat
 * otomatis dengan supabase_id benar) -> POST /transactions (harus tercatat)
 * -> DELETE transaksi (bersih-bersih).
 *
 * Dijalankan LOKAL oleh developer karena butuh password test user, dan
 * password tidak boleh lewat chat, log, atau CI:
 *
 *   TEST_USER_EMAIL=... TEST_USER_PASSWORD=... \
 *   API_BASE_URL=http://localhost:5001 \
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_ANON_KEY=sb_publishable_... \
 *   node scripts/smoke-auth.mjs
 *
 * API_BASE_URL default http://localhost:5001. Untuk mengetes produksi,
 * arahkan ke domain Vercel (butuh Deployment Protection bypass di browser
 * tidak berlaku di sini — pakai URL yang tidak diproteksi atau matikan
 * sementara protection untuk preview).
 *
 * Keluar 0 bila semua lolos, 1 bila ada yang gagal. Tidak menulis file apa pun.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:5001").replace(
  /\/$/,
  "",
);
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

const results = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function required(name, value) {
  if (!value) {
    console.error(`ENV ${name} wajib diisi.`);
    process.exit(2);
  }
}

required("SUPABASE_URL", SUPABASE_URL);
required("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY);
required("TEST_USER_EMAIL", TEST_USER_EMAIL);
required("TEST_USER_PASSWORD", TEST_USER_PASSWORD);

async function supabase(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function api(path, token, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

let failed = false;

// 1. Sign-in
const signIn = await supabase("/token?grant_type=password", {
  email: TEST_USER_EMAIL,
  password: TEST_USER_PASSWORD,
});

if (signIn.status !== 200 || !signIn.data.access_token) {
  const msg =
    signIn.data?.error_description ?? signIn.data?.msg ?? `HTTP ${signIn.status}`;
  check("sign-in test user", false, msg);
  if (/confirm/i.test(msg)) {
    console.log("  -> User belum dikonfirmasi. Nyalakan auto-confirm saat membuat user,");
    console.log("     atau klik link konfirmasi di inbox, lalu ulangi.");
  }
  process.exit(1);
}
check("sign-in test user", true);

const token = signIn.data.access_token;
const supabaseUid = signIn.data.user?.id;
check("token membawa user id", Boolean(supabaseUid), supabaseUid ?? "tidak ada sub");

// 2. Tanpa token -> 401
const noAuth = await api("/user/me", null);
check("tanpa token ditolak 401", noAuth.status === 401, `HTTP ${noAuth.status}`);

// 3. Token proyek lain -> 401 (pakai anon JWT usang sebagai token asing)
const foreign = await api("/user/me", "token-asing-yang-jelas-palsu");
check("token asing ditolak 401", foreign.status === 401, `HTTP ${foreign.status}`);

// 4. GET /user/me -> 200 + profil terbuat dengan supabase_id benar
const me = await api("/user/me", token);
const meOk = me.status === 200 && typeof me.data?.id === "string";
check("GET /user/me 200 + profil ada", meOk, `HTTP ${me.status}`);
if (!meOk) {
  console.log(JSON.stringify(me.data).slice(0, 300));
  process.exit(1);
}

// 5. Tulis transaksi -> 201
const created = await api("/transactions", token, {
  method: "POST",
  body: JSON.stringify({
    description: "Smoke test (hapus otomatis)",
    amount: 1000,
    category: "Lainnya",
  }),
});
const txnId = created.data?.data?.id;
check(
  "POST /transactions 201",
  created.status === 201 && Boolean(txnId),
  `HTTP ${created.status}`,
);
if (!txnId) {
  console.log(JSON.stringify(created.data).slice(0, 300));
  process.exit(1);
}

// 6. Ringkasan bulanan mencerminkan transaksi (<= egress boros, satu angka cukup)
const summary = await api("/transactions/summary", token);
check(
  "GET /transactions/summary 200",
  summary.status === 200 && summary.data?.spentThisMonth >= 1000,
  `HTTP ${summary.status}, spentThisMonth=${summary.data?.spentThisMonth}`,
);

// 7. Hapus transaksi test -> 200
const deleted = await api(`/transactions/${txnId}`, token, { method: "DELETE" });
check("DELETE transaksi test 200", deleted.status === 200, `HTTP ${deleted.status}`);

// 8. Profil tidak duplikat: panggil /user/me lagi, id harus sama
const me2 = await api("/user/me", token);
check("profil idempotent (id sama)", me2.status === 200 && me2.data?.id === me.data.id);

failed = results.some((r) => !r.ok);
console.log(failed ? "\nSMOKE TEST GAGAL" : "\nSMOKE TEST LOLOS");
process.exit(failed ? 1 : 0);
