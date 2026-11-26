# Agentic SDLC di GitHub

Workshop berbahasa Indonesia dengan **Expense Claim App**, aplikasi demo untuk
PT Nusantara Finansial (fiktif). Pelajari cara mengubah issue menjadi draft pull
request tanpa melewati review manusia, CI, dan pemeriksaan keamanan.


## Review manusia sebelum workflow aktif

[Draft publikasi #39](https://github.com/sandy-demo/AgenticSDLC/pull/39) membawa
runtime saja; [draft #1](https://github.com/sandy-demo/AgenticSDLC/pull/1) tetap
menyimpan materi lengkap. Copilot mengerjakan publikasi, tetapi GitHub mencatat
pembuat PR sebagai sandy-demo. Akun itu tidak bisa approve PR sendiri.

1. Gunakan akun GitHub asli yang berbeda dan kamu kendalikan, atau minta rekan
   reviewer. Jika belum punya, selesaikan [pendaftaran GitHub](https://github.com/signup)
   dan verifikasi email sendiri. Jangan membuat akun otomatis untuk berpura-pura
   menjadi reviewer; password dan token tidak perlu dikirim ke Chat.
2. Maintainer mengundang akun tersebut dengan akses Write; pemilik akun menerima
   undangannya. Nama akun tidak boleh ditebak oleh agent pada mesin bersama.
3. Buka [file perubahan #39](https://github.com/sandy-demo/AgenticSDLC/pull/39/files).
   Baca controller, batas aksi, tes, dan [ADR 0003](docs/adr/0003-agentic-sdlc-workflow.md).
   Setelah pemeriksaan hijau dan hasilnya sesuai, reviewer memilih
   **Review changes → Approve → Submit review**. Chat “saya approve” belum mencatat
   review GitHub. Jika ada masalah, pilih Request changes, bukan Approve.
4. Sesudah approval nyata, maintainer memublikasikan melalui jalur PR yang
   diizinkan. Agent tidak mematikan proteksi, mengganti author, atau merge sendiri.
5. Baru siapkan branch latihan khusus, isi AGENTIC_SDLC_BASE_BRANCH, dan aktifkan
   AGENTIC_SDLC_LIVE=true. Workflow mengutamakan secret AGENTIC_SDLC_TOKEN; bila
   belum ada, memakai COPILOT_GITHUB_TOKEN yang tersedia di repo. Token terpilih
   harus berizin API yang benar. Penolakan API tetap menghentikan workflow, bukan
   mencoba credential lain. Nilai secret tidak dibaca atau disalin ke dokumen.

Sakelar aktif diperlukan untuk menghubungkan kejadian GitHub, bukan untuk
membaca materi atau menjalankan tes lokal. Ia tidak menggantikan publikasi
workflow, akses Copilot, approval manusia, atau izin rilis.

## Mulai

1. Buka [site/index.html](site/index.html) di browser. Materi HTML dapat dibuka
   tanpa internet; [S04](site/scenarios/S04.html) adalah demo utama.
2. Dengan Node.js 24 LTS dan Git: `npm ci` lalu `npx playwright install chromium`.
   Jika npm meminta izin install script, izinkan hanya build native `better-sqlite3`
   yang dipatok di lockfile. Aplikasi menggunakan data fiktif dan berjalan di localhost.
3. Jalankan:
   - `npm run demo:before` — buka aplikasi baseline di `http://127.0.0.1:3000`.
   - `npm run shots -- S04` — ambil bukti lokal (butuh tag `v0-baseline`
     dan branch lokal `demo/claim-date`; cek [cara demo](site/setup.html)).
   - `npm run reset` — kembali ke data awal dengan restart. Opsi `--fresh`
     membuat checkout baru tanpa mengubah `main` atau GitHub.

`npm run dev` menjalankan workspace saat ini. `npm test` dan `npm run e2e`
memeriksa API dan UI. Untuk panduan GitHub Pages, CodeQL, dan Copilot, lihat
[pengaturan repo](docs/ORG-SETUP.md). Aplikasi Express tidak di-host di Pages.

## Spesifikasi awal

[Mulai di sini](agentic-sdlc-workshop-docs/START-HERE.md) ·
[Konteks bisnis](agentic-sdlc-workshop-docs/CONTEXT.md) ·
[Rencana teknis](agentic-sdlc-workshop-docs/PLAN.md) ·
[Templat](agentic-sdlc-workshop-docs/TEMPLATES.md) ·
[Runbook](agentic-sdlc-workshop-docs/RUNBOOK.md) ·
[Spesifikasi situs](agentic-sdlc-workshop-docs/DOCS-SPEC.md)

Dokumen di atas adalah spesifikasi awal. Untuk perintah yang berlaku gunakan
README ini dan [cara demo](site/setup.html); jangan jalankan contoh reset
remote di spesifikasi. Lihat [status pengerjaan](PROGRESS.md) dan
[bukti lokal](docs/BEFORE-AFTER.md) untuk hasil yang sudah diverifikasi.
