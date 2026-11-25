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
| 8 — Dry-run | S04 menghasilkan HTTP 201 → 400 dan foto lokal. Coverage S08, sumber S09/S12, dan fixture S14 diperiksa lokal. S10 simulasi dan S15 baru baseline; bukti GitHub ditandai belum ada. |
| 9 — Situs workshop | 22 halaman offline, 15 skenario, 13 diagram, dan 8 tangkapan lokal. Playwright lulus; Lighthouse Accessibility 100 di empat halaman yang diperiksa. Pages belum live. |
| 10 — Org/EMU | Di luar pengerjaan otomatis; dilakukan pemilik tenant untuk S06 dan S14. |

## Keputusan

- Repo `sandy-demo/AgenticSDLC` adalah tujuan versi lengkap (`full`).
  Varian `bare` disiapkan terpisah tanpa membuat repo publik kedua.
- Runtime utama memakai Node 24 LTS karena Node 20 sudah berakhir masa dukungannya.
  Instalasi bersih dan tes unit diverifikasi di Node 24; tes browser di Node 26. Aplikasi hanya mendengarkan di `127.0.0.1`;
  pemilih peran bukan autentikasi dan SQLite di memori hanya berisi data fiktif.
- CSS tersedia lokal agar tidak bergantung pada CDN.
- S04 mempertahankan field tanggal di baseline agar bug bisa dicoba nyata: perbaikan menolak tanggal masa depan, bukan menambahkan field. S08 mengikuti batas `≥ 1.000.000` di templat aturan bisnis.
- S03 tidak menghapus validasi input. S07 memakai adapter callback fiktif, bukan paket rentan. S09 mempertahankan audit trail dan tidak menulis data pribadi ke log. S10 memakai simulasi alert; tidak ada SQL injection atau dependensi yang sengaja dibuat rentan.
- Workflow AI hanya untuk pemicu latihan dan `AGENTIC_WORKSHOP_LIVE`; tidak ada jadwal yang otomatis menghabiskan kredit.
- Reset tidak menghapus PR/issue atau menulis ulang `main`. Demo cloud dipisah dari fixture lokal.
- Ekspor `bare` meniadakan customizations dan workflow cloud, tetapi tetap memuat panduan offline.
- Chart tanpa pengukuran GitHub tampil sebagai “belum ada data”; tidak ada angka, alert, atau screenshot rekaan yang disajikan sebagai hasil uji.

## Dry-run 1 — 2026-11-25

### Pre-flight (5 cek)

1. `gh` aktif sebagai `sandy-demo` dengan scope `repo` dan `workflow`.
2. [CI run 45567707475, percobaan 2](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45567707475) lulus. `gh workflow run ci.yml` ditolak (422: tidak ada `workflow_dispatch`); gunakan `gh run rerun` dan `gh run watch` untuk run yang sudah ada.
3. Secret `COPILOT_GITHUB_TOKEN` tidak ada, CodeQL berstatus `not-configured`, dan `AGENTIC_WORKSHOP_LIVE` belum diatur; bagian agent live tidak dijalankan. gh-aw belum dipasang di CLI ini, sehingga workflow tidak dikompilasi ulang.
4. Tag `v0-baseline` dan keenam branch latihan ada di remote. Default branch adalah `demo/workshop`, tanpa proteksi; `main` remote dan draft PR stock belum ada. Sesi browser yang masuk akun tidak dipakai; hanya dua halaman Actions publik dipotret.
5. Bukti hanya dikumpulkan di `evidence/dry-run-1`, dari `main` lokal (commit yang sama dengan `demo/workshop`). Tidak ada merge atau perubahan pada baseline. Template `sandy-demo/expense-app-full` tidak ditemukan oleh API, jadi sinkronisasi belum bisa diverifikasi.

### Yang sudah diverifikasi

- 15 pemeriksaan lokal dijalankan berurutan. S06 khusus organisasi tetap **manual/org**; yang diuji hanya tombol baseline.
- 16 tangkapan asli (aplikasi dan dua ringkasan Actions; termasuk versi beranotasi), plus 15 render hasil pemeriksaan lokal. Lihat [bukti dan asal setiap tangkapan](docs/BEFORE-AFTER.md) serta [daftar layar pending](docs/screenshots/_missing.json).
- S04: tanggal besok HTTP 201 → 400, hari ini tetap 201. S08: coverage baris aktual 100% → 100% pada dua suite dengan fokus berbeda; tes tepat Rp1.000.000 sengaja gagal. S15: baseline IDR berhasil, bukan hasil multi-currency.
- [Metrik per skenario](docs/metrics.json): waktu cek lokal terukur. Durasi PR/revisi, komentar, angka alert dan premium requests tetap `null`. Endpoint usage mengembalikan 404.

### Yang masih perlu dilakukan untuk jalur cloud

1. Buka [Fine-grained tokens](https://github.com/settings/personal-access-tokens/new) pada akun latihan dan pilih **Generate new token**.
2. Batasi masa berlaku dan akses ke repo latihan, beri **Copilot Requests: Read** pada permission akun. Jangan salin nilai PAT ke chat atau commit.
3. Masukkan nilainya melalui prompt aman `gh secret set COPILOT_GITHUB_TOKEN -R sandy-demo/AgenticSDLC`, lalu cek nama menggunakan `gh secret list -R sandy-demo/AgenticSDLC`.

Setelah itu cek CodeQL di **Settings → Security → Code security → Code scanning → Set up → Default** dan aktifkan workflow latihan hanya saat anggaran disetujui. S14 memakai fixture aman, bukan issue yang meminta akses rahasia. S15 berhenti sebelum merge; syaratnya review manusia dan persetujuan eksplisit.

### Enam momen screenshot manual di VS Code

| Momen | Layar dan nama file | Prompt / tindakan |
|---|---|---|
| 1 | S01 diff tanpa instruksi: `S01-01-without-instructions.png` (salin juga sebagai `S01-before.png`) | Buka Chat → Agent: “Tambah endpoint GET /claims/:id/history yang mengembalikan riwayat klaim pemiliknya.” Tunjukkan Source Control. |
| 2 | S01 instruksi dan hasil: `S01-02-instructions-file.png` dan `S01-03-with-instructions.png` (salin hasil sebagai `S01-after.png`) | Buka instructions di checkout dengan aturan; ulangi prompt yang sama, lalu tunjukkan diff. |
| 3 | S02 rencana: `S02-01-agent-plan.png` | “Tambahkan pilihan Travel, Meals, Equipment, Other pada form klaim. Periksa skema, payload, tampilan daftar, dan tes; jalankan npm test.” |
| 4 | S02 Changes dan tes: `S02-02-files-changed.png` dan `S02-03-tests-green.png` | Buka Source Control, lalu Terminal; tunggu laporan tes. |
| 5 | S03 route awal dan skill: `S03-before.png` dan `S03-01-skill-loaded.png` | Buka `src/routes/reports.js`. Kirim “Buat POST /claims/:id/comments memakai skill new-endpoint. Batasi akses ke klaim, validasi isi, dan jangan catat isi komentar ke log.” |
| 6 | S03 hasil: `S03-after.png` | Tunjukkan route + docs di split editor dan tes akses. |

### Reset yang sudah dicoba

- **Data:** Ctrl+C di terminal server, lalu `npm run demo:before`. Pengujian menghasilkan 7 → 8 → 7 klaim. `npm run reset` aman; perintah biasa mencetak petunjuk, bukan menghentikan proses.
- **Kode:** `npm run reset -- --fresh` membuat checkout baru di tag `v0-baseline`; checkout utama dan GitHub tidak berubah.
