# ADR-0009: Tema CSS-variable + ThemeProvider

- **Status:** Diadopsi
- **Tanggal:** 2026-09

## Konteks

UI perlu mode terang/gelap/sistem, konsistensi warna, dan aksesibilitas
(fokus terlihat, rasio kontras). Versi awal mem-prop-drilling warna dan
punya nilai hex tersebar di komponen, sehingga mengganti tema hampir tak
mungkin.

## Keputusan

- **Design token di `styles/tokens.css`** sebagai triplet RGB per variabel
  (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`,
  `--accent`, `--on-accent`, `--income`, `--expense`, `--warning`) + radius
  + shadow. Triplet RGB dipilih agar memakai opacity-modifier Tailwind
  (`bg-surface/50`).
- `tailwind.config.js` memetakan token → nama kelas (`bg-surface`,
  `text-muted`, `border-border`, ...); primer modifier tanpa token berarti
  kelas peta-ke-token.
- **Prinsip**: warna hanya untuk makna — netral (bg/surface) tidak pernah
  berwarna; accent untuk aksi; income/expense/warning untuk semantik uang.
- Mode gelap via class `dark` di `<html>`, diatur `ThemeProvider`
  (context). Tiga mode: `light | dark | system`.

## Konsekuensi

- Migrasi palet = ubah satu file token (`tokens.css`); ini basis untuk
  rombak visual Fundex (ADR-0010) dan refactor Tailwind yang kini hanya
  referensi token.
- Tidak ada hex mentah dalam komponen. `:focus-visible` outline 2px accent.
- `prefers-reduced-motion` ditaati (media query global).
- Risiko disadari: token ditulis dalam bentuk triplet berarti `var(--accent)`
  tidak bisa dipakai di non-CSS (mis. stroke SVG inline) tanpa helper — ini
  diterima demi alpha-modifier Tailwind.