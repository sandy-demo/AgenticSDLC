---
name: new-endpoint
description: Menambah endpoint Expense Claim dengan kontrak, validasi, service, tes, logging, dan dokumentasi.
---
# Tambah endpoint

1. Tulis method, path, status, input, dan output di `docs/api.md`.
2. Tentukan peran yang boleh memanggil route. Validasi nilai sebelum query.
3. Tulis service; akses SQLite hanya lewat prepared statements di `src/db.js`.
4. Route memanggil service dan mengirim hasil. Pakai logger untuk metadata
   non-PII seperti ID klaim. Gunakan format error yang sudah ada.
5. Uji jalur sukses dan kegagalan di `tests/unit/`; jalankan `npm test`.

Contoh: [route](templates/route.js), [service](templates/service.js), [tes](templates/test.js).
