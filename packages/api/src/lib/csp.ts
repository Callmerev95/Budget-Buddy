/**
 * Content Security Policy untuk production.
 *
 * Session Supabase disimpan di localStorage, jadi XSS berarti pengambilalihan
 * akun. CSP ketat adalah mitigasi utama: tidak ada script inline, tidak ada
 * eval, dan browser hanya boleh berbicara ke origin sendiri + Supabase.
 *
 * Modul ini murni (tanpa env, tanpa database) agar kebijakannya bisa diuji.
 */
export interface CspOptions {
  supabaseUrl: string;
}

export function buildCspDirectives(options: CspOptions): Record<string, string[]> {
  const supabaseHost = new URL(options.supabaseUrl).hostname;

  return {
    "default-src": ["'self'"],
    // Tanpa 'unsafe-inline' dan tanpa eval: satu-satunya script adalah
    // bundle Vite. Tidak ada inline script di index.html.
    "script-src": ["'self'"],
    // 'unsafe-inline' diperlukan karena framer-motion dan beberapa komponen
    // menulis gaya lewat atribut style saat runtime. Script tetap ketat.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    // Browser hanya memanggil API Supabase milik sendiri. Tanpa ini, login,
    // signup, dan refresh token diblokir browser.
    "connect-src": ["'self'", `https://${supabaseHost}`],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };
}
