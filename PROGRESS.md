# Status workshop

| Fase | Status |
|---|---|
| 0 — Repo | Inisialisasi lokal. Repo tujuan `sandy-demo/AgenticSDLC` masih kosong; akun aktif tidak punya izin push. |
| 1 — Aplikasi dan CI | Lokal: 24 tes Vitest dan 3 tes Playwright lulus; workflow CI belum dijalankan di GitHub. |
| 2 — Baseline latihan | Belum. |
| 3 — Issue | Belum. |
| 4 — Customizations | Belum. |
| 5 — Agentic Workflows | Belum. |
| 6 — Tooling | Belum. |
| 7 — Repo GitHub | Belum. |
| 8 — Dry-run | Belum. |
| 9 — Situs workshop | Belum. |
| 10 — Org/EMU | Di luar pengerjaan otomatis; dilakukan pemilik tenant untuk S06 dan S14. |

## Keputusan

- Repo `sandy-demo/AgenticSDLC` adalah tujuan versi lengkap (`full`).
  Varian `bare` disiapkan terpisah tanpa membuat repo publik kedua.
- Runtime utama memakai Node 24 LTS karena Node 20 sudah berakhir masa dukungannya.
  Eksekusi awal diverifikasi di Node 26. Aplikasi hanya mendengarkan di `127.0.0.1`;
  pemilih peran bukan autentikasi dan SQLite di memori hanya berisi data fiktif.
- CSS tersedia lokal agar tidak bergantung pada CDN.
