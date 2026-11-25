# Expense Claim App

Tulis kode dan nama simbol dalam Bahasa Inggris, UI dan error dalam Bahasa
Indonesia. Gunakan ES modules dan camelCase. Ikuti aturan yang diharapkan di
`docs/business-rules.md`; bug bisnis baseline hanya diperbaiki jika diminta.

- Route menangani HTTP; letakkan logika bisnis di `src/services/` dan gunakan
  prepared statements dari `src/db.js` untuk akses SQLite.
- Validasi input dan peran demo pada batas API. Error berbentuk `{ code, message }`.
- Catat metadata non-PII via `src/logger.js`; jangan catat isi klaim, lampiran,
  argumen hook, data pribadi, atau secret.
- Tambah tes untuk perubahan perilaku. Gunakan clock tetap agar tes lintas zona
  waktu stabil. Jalankan `npm test`; jalankan `npm run e2e` bila UI berubah.
- Perbarui `docs/api.md` bila kontrak berubah dan masukkan keputusan desain ke
  `docs/adr/`. Jangan mengubah screenshot atau hasil ukur agar cocok dengan cerita.
- Gunakan branch latihan dan draft PR. Jangan merge atau force-push. Jangan
  menaruh credential di kode atau memakai data produksi.
