# Status workshop

## Putaran lanjutan — hasil terbaru

Buka [urutan belajar offline](site/index.html#urutan). Tiap bab punya alur interaktif, langkah praktik, **Cek hasil**, **Langkah live**, dan cara reset. Klik langkah alur untuk melihat peran dan keluaran; klik screenshot untuk memperbesar.

**Bukti:** 15 skenario, 22 halaman offline, 178 PNG, 66 versi bernomor. 29 nama tangkapan yang benar-benar belum ada tetap tercantum di [daftar pending](docs/screenshots/_missing.json). Hasil lokal, screenshot portal, dan usulan tidak saling menggantikan.

| Skenario | Hasil yang diverifikasi |
|---|---|
| [S04](site/scenarios/S04.html#learning-check) | Retry Copilot #20 berfungsi lokal; #4 tetap kosong, CI draft baru masih perlu izin |
| [S05](site/scenarios/S05.html#learning-check) | Draft #27 punya fix; fixture dan 14 tes validasi per zona lulus lokal |
| [S07](site/scenarios/S07.html#learning-check) | S07a #18 dan S07b #23 menghasilkan diff; kontrak lulus pada kedua snapshot |
| [S08](site/scenarios/S08.html#learning-check) | Draft QA #24 test-only; bug batas sekarang terbukti pada helper dan API |
| [S09](site/scenarios/S09.html#learning-check) | Review Copilot pada #2 dan #20 tercatat · tiga sesi spesialis #2, bukan approval manusia |
| [S12](site/scenarios/S12.html#learning-check) | Target diperbaiki dan dicoba di draft #33; provider tetap 403; pembanding docs #28 teruji |
| [S13](site/scenarios/S13.html#learning-check) | Pemicu live teruji · Copilot CLI HTTP 403; label dan komentar belum terbit |
| [S14](site/scenarios/S14.html#learning-check) | Fixture guardrail dan audit teruji; kredit sesi GitHub direkam terpisah |
| [S10](site/scenarios/S10.html#learning-check) | CodeQL aktif · 0 alert terbuka pada pemindaian awal; autofix belum diuji |
| [S11](site/scenarios/S11.html#learning-check) | Architect menghasilkan draft ADR #22; tidak ada approval atau implementasi |
| [S15](site/scenarios/S15.html#learning-check) | Template tersedia, epik dan ADR nyata; belum masuk implementasi/merge |
| [S01](site/scenarios/S01.html#learning-check) | Copilot CLI: dua prompt identik selesai; bukti UI Agent Mode VS Code belum ada |
| [S02](site/scenarios/S02.html#learning-check) | Draft #29 punya perubahan lintas file; browser dan 4 tes UI lulus lokal |
| [S03](site/scenarios/S03.html#learning-check) | Endpoint komentar berfungsi pada draft #25; laporan skill cloud dan tes lokal tercatat |
| [S06](site/scenarios/S06.html#learning-check) | Versi GitHub Issue personal selesai diuji · versi Jira/Teams tetap manual/org |

- **Perbaikan yang diuji:** S04 #20, S05 #27, S06 personal #21, S07a #18 → S07b #23 dan S08 QA #24. Tes dijalankan pada commit masing-masing; status CI PR Copilot tidak dipinjam dari PR pembanding. Skill S03 menghasilkan endpoint #25 dan pemilihan kategori S02 diuji pada #29.
- **Pemicu workflow:** [draft #33](https://github.com/sandy-demo/AgenticSDLC/pull/33) memberi target Docs Sync yang benar dan lockfile terkompilasi. [Run 45657391526](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45657391526) tetap gagal provider HTTP 403 dan cap. Secret tidak diubah, pemicu sementara dikembalikan, dan batas tidak dinaikkan.
- **Template pulih:** [expense-app-full](https://github.com/sandy-demo/expense-app-full) adalah template dari tag v0-baseline, default demo/workshop, CI awal lulus. Protection membutuhkan satu approval dan tiga checks. [Epik S15](https://github.com/sandy-demo/expense-app-full/issues/1) serta [ADR Proposed](https://github.com/sandy-demo/expense-app-full/pull/2) ada; belum ada implementasi atau merge.
- **Batas live:** Agent Mode VS Code belum terekam; integrasi org S06 tetap manual; CodeQL S10 tidak mempunyai alert nyata; izin workflow dan persetujuan manusia tidak dipalsukan. Panduan tidak meminta memasang kerentanan atau mengakses data rahasia.
- **Validasi paket:** lint, 20 unit test, 7 tes Playwright, pengambilan ulang foto lokal dan reset aman lulus. Semua 22 halaman diperiksa offline pada 320, 390, 768 dan 1440 px; semua 45 langkah alur bisa dibuka dengan keyboard. Materi tetap berfungsi tanpa JavaScript.
- **Chart:** C3 dan C6 berasal dari pengukuran di [metrics.json](docs/metrics.json). C4 dan C5 tidak mengisi nol untuk perbandingan yang belum terukur.

## Putaran awal — catatan historis

## Paket belajar dry-run 1: siap dipakai

Mulai dari [urutan latihan](site/index.html#urutan). Di setiap skenario,
ikuti **Langkah demo**, cocokkan **Cek selesai latihan**, lalu baca cara reset.
Bagian yang tidak bisa dijalankan offline bisa dipelajari dengan membaca
bukti yang tersimpan. Tidak perlu login untuk membaca modul.

- **Dokumentasi:** 15 skenario, 22 halaman offline, 120 PNG (termasuk 37 dengan kotak dan nomor). Caption membedakan gambar aplikasi/GitHub, keluaran tes lokal, dan usulan. File asli tetap disimpan.
- **Dry-run live:** belum selesai. Untuk 44 layar yang belum terekam, bagian **Cara merekam hasil live** mencatat nama file, prasyarat, letak kontrol, dan hasil yang harus benar-benar terlihat. Bukti lokal tidak menggantikan checkpoint live.
- **Pengukuran:** C3 dan C6 mengikuti [metrik terukur](docs/metrics.json). C4 dan C5 belum punya perbandingan; angka yang tidak tersedia bukan nol. AI credits bukan tagihan atau jumlah premium requests.
- **Validasi:** lint, 20 tes unit, 6 e2e, pengambilan ulang foto lokal dan reset aman lulus. Semua halaman diperiksa offline pada 320, 390, 768 dan 1440 px. Build ulang identik; petunjuk tetap terbaca tanpa JavaScript.
- **Publikasi:** push sebelumnya berhasil pada `644ad60`. Paket ini hanya masuk branch bukti melalui [draft #1](https://github.com/sandy-demo/AgenticSDLC/pull/1). Repo template `sandy-demo/expense-app-full` kembali memberi HTTP 404. Tidak ada merge atau perubahan branch dasar.

| Skenario | Hasil GitHub/VS Code yang diketahui | Layar belum terekam |
|---|---|---:|
| [S04](site/scenarios/S04.html#practice) | Contoh #17 punya diff dan CI hijau · PR Copilot #4 tetap tanpa diff | 1 |
| [S05](site/scenarios/S05.html#practice) | Issue dan draft nyata · guardrail menolak edit; perbaikan belum ada | 2 |
| [S07](site/scenarios/S07.html#practice) | Issue #14 dan draft #15 nyata · runner tidak mulai; dua tahap kontrak lulus lokal | 3 |
| [S08](site/scenarios/S08.html#practice) | Bug batas diverifikasi dan dilaporkan di issue #13 oleh fasilitator · PR QA pending | 1 |
| [S09](site/scenarios/S09.html#practice) | Tiga sesi direkam dan ringkasan fasilitator terbit · 0 komentar severity terbit | 1 |
| [S12](site/scenarios/S12.html#practice) | Live ditunda · target draft main belum ada di GitHub | 2 |
| [S13](site/scenarios/S13.html#practice) | Pemicu live teruji · Copilot CLI HTTP 403; label dan komentar belum terbit | 2 |
| [S14](site/scenarios/S14.html#practice) | Fixture aman teruji · audit hanya metadata; tidak menjalankan permintaan berisiko live | 3 |
| [S10](site/scenarios/S10.html#practice) | CodeQL aktif · 0 alert terbuka pada pemindaian awal; autofix belum diuji | 4 |
| [S11](site/scenarios/S11.html#practice) | Usulan ADR dibaca di sesi Architect · belum disetujui; tidak ada PR implementasi | 3 |
| [S15](site/scenarios/S15.html#practice) | Manual pending · versi live perlu repo turunan dan persetujuan manusia | 10 |
| [S01](site/scenarios/S01.html#practice) | File instruksi sudah direkam · perbandingan hasil Agent Mode belum direkam | 4 |
| [S02](site/scenarios/S02.html#practice) | manual pending · VS Code | 3 |
| [S03](site/scenarios/S03.html#practice) | Route baseline sudah direkam · penggunaan skill di Agent Mode belum direkam | 2 |
| [S06](site/scenarios/S06.html#practice) | manual/org · konektor belum dijalankan | 3 |

[Bukti dan sumber](docs/BEFORE-AFTER.md) · [Daftar layar](docs/screenshots/_missing.json)

## Catatan fase awal (historis)

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
3. Nama secret `COPILOT_GITHUB_TOKEN` terverifikasi tanpa membaca nilainya. `gh aw compile --strict` lolos untuk ketiga workflow, dan Docs Sync, Issue Triage, serta CI Fault Analysis berstatus aktif. `AGENTIC_WORKSHOP_LIVE` belum diatur. [Scan awal CodeQL](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45587014329) lulus; API melaporkan **0 alert terbuka**.
4. Tag `v0-baseline` dan keenam branch latihan ada di remote. Branch default `demo/workshop` sekarang dilindungi: 1 approval, tiga checks CI, dan force-push nonaktif. `main` remote belum ada. [Draft stock #2](https://github.com/sandy-demo/AgenticSDLC/pull/2) terbuka. Screenshot berasal dari halaman publik; View session memerlukan login.
5. Bukti hanya dikumpulkan di `evidence/dry-run-1`, dari `main` lokal (commit yang sama dengan `demo/workshop`). Tidak ada merge atau perubahan pada baseline. Template `sandy-demo/expense-app-full` tidak ditemukan oleh API, jadi sinkronisasi belum bisa diverifikasi.

### Yang sudah diverifikasi

- 15 pemeriksaan lokal dijalankan berurutan. S06 khusus organisasi tetap **manual/org**; yang diuji hanya tombol baseline.
- 16 tangkapan asli (aplikasi dan dua ringkasan Actions; termasuk versi beranotasi), plus 15 render hasil pemeriksaan lokal. Lihat [bukti dan asal setiap tangkapan](docs/BEFORE-AFTER.md) serta [daftar layar pending](docs/screenshots/_missing.json).
- S04: tanggal besok HTTP 201 → 400, hari ini tetap 201. S08: coverage baris aktual 100% → 100% pada dua suite dengan fokus berbeda; tes tepat Rp1.000.000 sengaja gagal. S15: baseline IDR berhasil, bukan hasil multi-currency.
- [Metrik per skenario](docs/metrics.json): waktu cek lokal terukur. Durasi PR/revisi, komentar, angka alert dan premium requests tetap `null`. Endpoint usage mengembalikan 404.

### S04 live — timeout: draft PR tidak punya perubahan

- [Issue #3](https://github.com/sandy-demo/AgenticSDLC/issues/3) ditugaskan ke Copilot. [Draft PR #4](https://github.com/sandy-demo/AgenticSDLC/pull/4) muncul dalam **0,19 menit** tanpa mengubah branch dasar.
- Tiga sesi Copilot selesai tanpa diff. [Percobaan terakhir](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45589865167) mengonfirmasi guardrail `invalid-input`; yang lulus hanya 11 tes baseline di masing-masing Jakarta dan LA, belum termasuk kasus tanggal besok.
- [Komentar revisi](https://github.com/sandy-demo/AgenticSDLC/pull/4#issuecomment-7158729467) meminta tes batas dan pesan error, tetapi [run revisi](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45588240268) tidak menghasilkan commit perubahan. `revisionMinutes` tetap `null`; belum ada perbaikan aplikasi dari PR.
- [CI biasa](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45587509262) meminta persetujuan maintainer. Ini berbeda dari CodeQL dan berbeda dari merge. Sepuluh screenshot S04 live tersedia, termasuk tampilan View session yang terautentikasi, di [panduan S04](site/scenarios/S04.html#s04-cloud-evidence).

- Reproduksi lokal: hook menolak argumen edit berbentuk teks, tetapi menerima input terstruktur. Kandidat perbaikan parser lulus 10 kasus di lingkungan terpisah; hook aktif belum diubah atau dipintas. Penggunaan yang terlihat: **21,9 AI credits** untuk tiga sesi S04, bukan premium requests dan bukan tagihan.

### S05 live — penolakan edit yang sama

- [Run awal](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45567770102): Jakarta lulus dan LA gagal pada fixture timezone. [Issue #5](https://github.com/sandy-demo/AgenticSDLC/issues/5) menghasilkan [draft #6](https://github.com/sandy-demo/AgenticSDLC/pull/6) dalam **0,1 menit** pada base `demo/ci-timezone`.
- [Run agent](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45591806998) selesai, tetapi log mencatat pemanggilan edit gagal dan ringkasan PR menyebut `invalid-input`; **0 file berubah**. [CI PR](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45591807143) belum berjalan. [Empat screenshot tambahan](site/scenarios/S05.html#s05-cloud-evidence) membuktikan issue, draft dan diff kosong, bukan patch.
- S07a/S07b dan S08 perlu edit oleh agent. Tidak memulai sesi tambahan yang sudah diketahui terhambat sampai koreksi parser ditinjau. Bukti lokal tetap tersedia.

### S09 live — review tanpa mengubah kode

- [Draft stock #2](https://github.com/sandy-demo/AgenticSDLC/pull/2) mendapat [1 komentar Copilot Code Review](https://github.com/sandy-demo/AgenticSDLC/pull/2#pullrequestreview-6055637734); ini bukan approval manusia. Tiga sesi spesialis selesai menurut API. Belum ada komentar `[SEV-…]` yang dipublikasikan dan draft S04 belum memiliki diff. Tiga [screenshot nyata](site/scenarios/S09.html#s09-cloud-evidence) menunjukkan sebelum review, komentar bawaan, dan daftar tiga sesi Done.
- Untuk layar sesi yang aksesnya terbatas, masuk sendiri sebagai akun workshop di tab browser VS Code, lalu kembali ke halaman workshop. Panduan tidak memotret halaman login, MFA, atau nilai token. Jika ada informasi sensitif lain, potong atau tutup dengan blok solid sebelum dimasukkan ke bukti.

### Bukti visual pengaturan publik

- [S04: letak parser](site/scenarios/S04.html#s04-cloud-evidence), [S10: CodeQL Setup sukses](site/scenarios/S10.html#codeql-initial-scan), dan [S14: hook serta batas workflow](site/scenarios/S14.html#s14-controls) sudah punya screenshot asli. Status CodeQL dan kuota workflow terpisah dari hasil Autofix dan tagihan. Tidak ada nilai token yang direkam.

### Screenshot setelah login

- Akun browser workshop sudah terverifikasi. Tujuh layar yang sebelumnya tertutup login sudah dipotret: sesi S04 dan S05, pemilih QA S08, daftar tiga sesi S09, 0 alert terbuka S10, serta [dua layar setup PAT/secret](site/setup.html#pat-copilot-screenshots). Perekaman hanya mencakup area yang relevan; tidak ada password, kode MFA, atau nilai token.
- Di sesi S05, GitHub menampilkan **1,4 AI credits**. Angka ini menambah C6; bukan jumlah premium requests atau tagihan.

### S12 dan S13 — hasil lanjutan

- S12 tidak dijalankan live: tindakan membuat draft Docs Sync menunjuk ke `main`, sedangkan repo memakai `demo/workshop` dan tidak punya `main`. Pemeriksaan kontrak lokal tetap tersedia.
- [Issue S13 #7](https://github.com/sandy-demo/AgenticSDLC/issues/7) memicu [Issue Triage](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45596615909); [draft latihan #8](https://github.com/sandy-demo/AgenticSDLC/pull/8) memicu [CI](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45596624154) dan [CI Fault Analysis](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45596785536). LA gagal dengan `ECONNRESET` sebagai fixture, Jakarta dan e2e lulus. Kedua workflow agent berhenti di `Execute GitHub Copilot CLI` dengan HTTP 403 dari provider, tanpa label atau komentar. Secret ada; penyebab spesifik penolakan provider belum terbukti.
- [Bukti S13 di panduan](site/scenarios/S13.html#s13-cloud-evidence) menunjukkan issue kosong dan kedua ringkasan. Variabel sementara `AGENTIC_WORKSHOP_LIVE` sudah dikembalikan ke kondisi tidak ada. Tidak ada merge.

### S11, S14 dan kesiapan capstone

- [Issue S11 #11](https://github.com/sandy-demo/AgenticSDLC/issues/11) dan [sesi Architect](https://github.com/sandy-demo/AgenticSDLC/tasks/d9a154f1-a752-4a8a-ac6d-80384e42a711) menghasilkan usulan ADR 0001 untuk dibaca. **Belum disetujui**, belum ada PR ADR atau PR implementasi. Opsi yang terlihat: konflik status atau kunci idempotensi dengan transaksi. Penggunaan yang ditampilkan sesi: 3,3 AI credits, bukan tagihan.
- S14: prosedur aman memeriksa fixture lokal tanpa menjalankan argumen. [Audit metadata](docs/screenshots/S14-local-audit.png) menunjukkan dua keputusan; tidak merekam kredensial. Tidak ada uji destruktif live. S10: 0 alert terbuka, jadi tidak ada Autofix yang bisa dijalankan.
- S15: baseline IDR sudah diuji. Multi-currency, persetujuan Tech Lead, dan merge belum dilakukan; versi live memerlukan repo turunan. Repo template yang diminta belum ditemukan.
- Generator kini membaca metrik dan arsip screenshot untuk membangun ulang panduan. `npm run shots:all` menguji ulang aplikasi dan mempertahankan arsip PNG yang masih valid. `npm run site:build` menyusun foto, caption, status pending, dan petunjuk reset dari sumber.

### Yang masih perlu dilakukan untuk jalur cloud

[Panduan PAT Copilot untuk S12 dan S13](docs/ORG-SETUP.md#pat-copilot-untuk-s12-dan-s13) menjelaskan kenapa izin ada di tab **Account** dan kapan token tidak diperlukan.

1. Buka [Fine-grained tokens](https://github.com/settings/personal-access-tokens/new) pada akun latihan dan pilih **Generate new token**.
2. Batasi masa berlaku dan akses ke repo latihan, beri **Copilot Requests: Read** pada permission akun. Jangan salin nilai PAT ke chat atau commit.
3. Masukkan nilainya melalui prompt aman `gh secret set COPILOT_GITHUB_TOKEN -R sandy-demo/AgenticSDLC`, lalu cek nama menggunakan `gh secret list -R sandy-demo/AgenticSDLC`.

Secret dan CodeQL sudah terpasang. Untuk melanjutkan S04, maintainer perlu meninjau koreksi parser melalui PR terpisah dengan guardrail tetap aktif. Screenshot S04 dan S05 kini diambil langsung dari tab workshop yang login. S04 baru sampai draft tanpa perubahan, jangan merge atau menyetujui workflow sebagai bukti perbaikan yang belum ada. Batas 25 menit S04 sudah lewat; draft #4 tetap tanpa diff. S04 tidak diulang sebelum koreksi parser ditinjau. S05 juga membuktikan penolakan edit. Tidak mengulang pekerjaan edit sebelum perbaikan hook ditinjau. Untuk S12/S13, aktifkan pemicu workshop hanya saat anggaran disetujui; variabelnya masih nonaktif. S14 memakai fixture aman, bukan issue yang meminta akses rahasia. S15 berhenti sebelum merge; syaratnya review manusia dan persetujuan eksplisit.

### Enam momen screenshot manual di VS Code

| Momen | Layar dan nama file | Prompt / tindakan |
|---|---|---|
| 1 | S01 diff tanpa instruksi: `S01-01-without-instructions.png` (salin juga sebagai `S01-before.png`) | Buka Chat → Agent: “Tambah endpoint GET /claims/:id/history yang mengembalikan riwayat klaim pemiliknya.” Tunjukkan Source Control. |
| 2 | S01 instruksi dan hasil: `S01-02-instructions-file.png` dan `S01-03-with-instructions.png` (salin hasil sebagai `S01-after.png`) | Buka instructions di checkout dengan aturan; ulangi prompt yang sama, lalu tunjukkan diff. |
| 3 | S02 rencana: `S02-01-agent-plan.png` | “Tambahkan pilihan Travel, Meals, Equipment, Other pada form klaim. Periksa skema, payload, tampilan daftar, dan tes; jalankan npm test.” |
| 4 | S02 Changes dan tes: `S02-02-files-changed.png` dan `S02-03-tests-green.png` | Buka Source Control, lalu Terminal; tunggu laporan tes. |
| 5 | S03 route awal dan skill: `S03-before.png` dan `S03-01-skill-loaded.png` | Buka `src/routes/reports.js`. Kirim “Buat POST /claims/:id/comments memakai skill new-endpoint. Batasi akses ke klaim, validasi isi, dan jangan catat isi komentar ke log.” |
| 6 | S03 hasil: `S03-after.png` | Tunjukkan route + docs di split editor dan tes akses. |

### Cek akhir dan batas bukti

- 22 halaman HTML diperiksa offline pada 320, 390, 768 dan 1440 px, tanpa gambar rusak atau error konsol. 61 PNG cocok dengan sumber; 51 layar yang belum ada tercatat di [daftar pending](docs/screenshots/_missing.json). Sebagian PNG adalah output fixture lokal yang diberi label, bukan screenshot GitHub.
- `npm run lint`, `npm test` (20 tes), `npm run e2e` (6 tes), `npm run shots:all`, dan `npm run site:build` lulus. Dua build menghasilkan file identik.
- C3 dan C6 mengikuti pengukuran yang tersedia. C4 tidak punya hasil sesudah Autofix; C5 tidak punya durasi capstone live. Angka yang tidak tersedia tidak diisi dengan nol.

### Lanjutan modul: langkah GitHub dengan nomor

- Panduan sekarang memuat **90 PNG**. Ada **14 gambar GitHub beranotasi** dengan penjelasan bernomor di samping gambar; versi asli tetap disimpan. Coba [S04](site/scenarios/S04.html#practice), [S08](site/scenarios/S08.html#practice), [S12](site/scenarios/S12.html#practice), dan [S14](site/scenarios/S14.html#s14-controls).
- [Draft #12](https://github.com/sandy-demo/AgenticSDLC/pull/12/files) memperbaiki parser guardrail pada branch `training/hook-input`. Fixture memverifikasi penolakan input rusak dan akses lokasi terlindungi tetap berlaku. [CI draft](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45641962687) lulus di kedua zona waktu dan e2e; CodeQL juga lulus. Belum di-review/merge, sehingga hook aktif dan draft tanggal/CI masih belum berubah.
- S08: uji batas lokal menghasilkan dua kasus lulus dan satu gagal tepat Rp1.000.000; [Issue #13](https://github.com/sandy-demo/AgenticSDLC/issues/13) melaporkan temuan oleh fasilitator. Ini bukan PR atau komentar dari QA Engineer.
- S09: sesi terautentikasi menunjukkan satu draf Performance `[SEV-3]`. Security dan Compliance tidak menyatakan temuan yang tidak terbukti. Tidak ada komentar severity terbit. Tampilan tiga sesi spesialis berjumlah 16,9 AI credits dan dicatat di C6 (bukan tagihan).
- S01 dan S03 sekarang punya layar file sumber di GitHub; hasil percakapan atau perubahan Agent Mode masih pending. S07 punya bukti adapter callback yang asli. S12 punya dua layar sesuai sumber, `items` di dokumen dan `claims` di route; workflow belum berhasil menghasilkan draft.
- **46 layar yang belum tercapai** tercatat di [daftar pending](docs/screenshots/_missing.json), bukan diganti gambar rekaan. Lanjutkan kasus edit sesudah perbaikan parser disetujui; S12/S13 juga perlu konfigurasi target dan akses Copilot CLI yang benar. S06 masih perlu konektor organisasinya; S10 tidak punya alert; S11/S15 tetap mengikuti persetujuan manusia.
- Verifikasi ulang: 22 halaman offline pada 320, 390, 768 dan 1440 px, tanpa gambar rusak atau error konsol; dua build identik. 20 unit test, 6 e2e, lint, dan reset aman lulus.

### Latihan ulang — hasil dan screenshot terbaru

- Panduan 15 skenario sekarang memuat **119 PNG**; **30 berkas beranotasi** punya kotak dan nomor yang cocok dengan caption. Versi sumber asli dipertahankan. **44 layar yang belum terjadi** masih tercatat di [daftar pending](docs/screenshots/_missing.json).
- [S04](site/scenarios/S04.html#practice): [draft pembanding #17](https://github.com/sandy-demo/AgenticSDLC/pull/17) dibuka dari `demo/claim-date`. File validasi, tes dan kontrak docs terlihat. [CI](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45648576502) lulus di Jakarta, LA, dan e2e. Ini contoh yang berfungsi, **bukan** hasil sesi Copilot #4 yang tetap tanpa diff.
- [S07](site/scenarios/S07.html#practice): [issue #14](https://github.com/sandy-demo/AgenticSDLC/issues/14) ditugaskan ke Copilot pada `training/hook-input`. [Draft #15](https://github.com/sandy-demo/AgenticSDLC/pull/15/files) muncul, tetapi job tidak diambil runner. Percobaan ulang API mendapat HTTP 500, jadi tidak membuat sesi baru atau menganggap hook telah diuji di cloud. S07b belum dimulai karena tes dari S07a belum ada di draft.
- Jalur belajar lokal yang benar-benar dijalankan: [S05](site/scenarios/S05.html#practice) stabil pada 15 Oktober saat zona waktu dinyatakan; [S07](site/scenarios/S07.html#practice) callback asli dan kandidat fetch masing-masing lulus tiga kontrak tanpa jaringan; [S08](site/scenarios/S08.html#practice) 20/20 pada suite reguler, 13 lulus dan 1 gagal pada suite batas, keduanya 100% baris approvalRules. Perintah PowerShell yang bisa disalin sudah diuji.
- [S09](site/scenarios/S09.html#practice): [ringkasan fasilitator](https://github.com/sandy-demo/AgenticSDLC/pull/2#issuecomment-7167398066) benar-benar terbit. Tidak ada tambahan komentar severity atau approval. [S14](site/scenarios/S14.html#practice) memakai gambar audit fixture saja; [S15](site/scenarios/S15.html#practice) menunjukkan letak aturan satu approval dan tiga checks yang sudah aktif, tanpa menyimpan perubahan pengaturan.
- S12 masih menarget branch yang tidak ada dan S13 ditolak provider. Usulan edit workflow S12 tidak diterapkan saat tool edit menolak input; tidak ada guardrail yang dilewati. Login ulang tidak diperlukan untuk paket bukti ini. Tidak ada PR yang di-merge atau branch dasar yang diubah.
- Pemeriksaan ulang lulus: `npm run shots:all`, `npm run site:build` (dua build identik), lint, 20 unit test, 6 e2e, dan 22 halaman offline tanpa gambar rusak atau error konsol pada empat ukuran layar.

### Reset yang sudah dicoba

- **Data:** Ctrl+C di terminal server, lalu `npm run demo:before`. Pengujian menghasilkan 7 → 8 → 7 klaim. `npm run reset` aman; perintah biasa mencetak petunjuk, bukan menghentikan proses.
- **Kode:** `npm run reset -- --fresh` membuat checkout baru di tag `v0-baseline`; checkout utama dan GitHub tidak berubah.
