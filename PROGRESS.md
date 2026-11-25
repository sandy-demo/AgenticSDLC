# Status workshop

| Fase | Status |
|---|---|
| 0 — Repo | Inisialisasi lokal. Repo tujuan `sandy-demo/AgenticSDLC` masih kosong; akun aktif tidak punya izin push. |
| 1 — Aplikasi dan CI | Lokal: 24 tes Vitest dan 3 tes Playwright lulus; workflow CI belum dijalankan di GitHub. |
| 2 — Baseline latihan | Bug bisnis dan masalah DX ada di baseline; kegagalan CI hanya pada branch latihan. S10 dan sebagian S09/S14 memakai simulasi yang tidak menjalankan aksi berisiko. |
| 3 — Issue | 15 skenario, 16 template siap seed (S07 dipecah); pembuatan issue live menunggu izin tulis. |
| 4 — Customizations | 7 profil, 2 skill, setup steps, dan hook tersedia. Fixture deny lulus di lokal; pemilih agent dan hook cloud belum diverifikasi. |
| 5 — Agentic Workflows | Ketiga workflow lolos kompilasi strict dengan gh-aw v1.2.2. Tidak ada run GitHub. Default nonaktif sampai pemilik mengizinkan. |
| 6 — Tooling | Script demo, screenshot, reset lokal, metrik, bare, dan task VS Code tersedia. |
| 7 — Repo GitHub | Tag baseline dan branch latihan disiapkan lokal. Draft PR, CodeQL, protection, template dan Pages menunggu akses. |
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
- S04 mempertahankan field tanggal di baseline agar bug bisa dicoba nyata: perbaikan menolak tanggal masa depan, bukan menambahkan field. S08 mengikuti batas `≥ 1.000.000` di templat aturan bisnis.
- S03 tidak menghapus validasi input. S07 memakai adapter callback fiktif, bukan paket rentan. S09 mempertahankan audit trail dan tidak menulis data pribadi ke log. S10 memakai simulasi alert; tidak ada SQL injection atau dependensi yang sengaja dibuat rentan.
- Workflow AI hanya untuk pemicu latihan dan `AGENTIC_WORKSHOP_LIVE`; tidak ada jadwal yang otomatis menghabiskan kredit.
- Reset tidak menghapus PR/issue atau menulis ulang `main`. Demo cloud dipisah dari fixture lokal.
- Ekspor `bare` meniadakan customizations dan workflow cloud, tetapi tetap memuat panduan offline.
