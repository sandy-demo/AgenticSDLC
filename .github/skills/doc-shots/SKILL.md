---
name: doc-shots
description: Mengambil bukti visual skenario Expense Claim dengan nama file yang konsisten dan tanpa data sensitif.
---
# Ambil bukti demo

Periksa nama file di `scripts/scenarios.json` dan jalankan `npm run shots -- S04`
untuk UI lokal. Untuk GitHub dan VS Code, pakai hanya sesi workshop yang sudah
diizinkan dan data fiktif. Jangan tangkap token, browser profile, atau akun lain.
Simpan di `docs/screenshots/`. Gunakan nama persis; tulis sumber dan kondisi
yang terlihat di `docs/BEFORE-AFTER.md`. Jangan menggambar ulang layar yang
belum ada. Jalankan `npm run site:build` setelah menambah screenshot yang aman.
