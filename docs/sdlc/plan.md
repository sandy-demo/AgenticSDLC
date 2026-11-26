# Rencana workflow Agentic SDLC end-to-end

Workflow menghubungkan tiket, desain, implementasi, tes, review, rilis GitHub,
dan tindak lanjut. Copilot menyiapkan usulan; manusia memberi persetujuan.
GitHub Release tidak berarti aplikasi sudah di-deploy.

## Kebutuhan yang akan dipenuhi

| ID | Kebutuhan |
|---|---|
| REQ-001 | Satu tiket menjadi sumber status dan tautan seluruh tahap. |
| REQ-002 | Copilot menulis draft desain sebelum mengubah aplikasi. |
| REQ-003 | Reviewer manusia menyetujui commit desain yang tepat. |
| REQ-004 | Implementasi, tes, dan docs masuk draft terpisah. |
| REQ-005 | CI Jakarta, Los Angeles, dan browser lulus pada commit implementasi. |
| REQ-006 | Catatan review Copilot tidak menggantikan approval manusia. |
| REQ-007 | Controller tidak melakukan merge, rilis, deployment, atau perubahan akses. |
| REQ-008 | Kegagalan terlihat; ulang kejadian tidak membuat tugas AI ganda. |

## Konteks teknis dan prinsip

Pakai Node.js dan API GitHub dengan profil Architect dan Implementer yang sudah
ada. Status berupa satu komentar bot di tiket utama. Controller hanya membaca
kode dari default branch tepercaya, tidak menjalankan kode atau artefak PR.

Sesuai [aturan repo](../../AGENTS.md), branch latihan dan data fiktif wajib.
Sesuai [instruksi Copilot](../../.github/copilot-instructions.md), error dan panduan
berbahasa Indonesia, dan log berisi metadata saja. Ini penambahan workflow,
bukan migrasi aplikasi; tidak ada pola transformasi framework yang diperlukan.
Spesifikasi berasal dari permintaan pengguna, konteks workshop, dan prinsip
repo, bukan dari artefak migrasi baru.

Workflow nonaktif sampai AGENTIC_SDLC_LIVE bernilai true. Penugasan dan review
memerlukan secret pengguna AGENTIC_SDLC_TOKEN dengan izin API yang sesuai.
Bila belum tersedia, workflow memakai COPILOT_GITHUB_TOKEN yang sudah ada;
penolakan API bukan alasan mencoba credential lain.
Jangan menaruh nilainya di tiket atau kode. Pilih AGENTIC_SDLC_BASE_BRANCH dari
branch demo/, training/, atau sdlc/. Controller tidak menerima main.

Batas per tiket: dua tugas coding (desain dan implementasi), tiga permintaan
review, dan paling banyak 50 file berubah per PR. Dua puluh tiket berlabel
agentic-sdlc dapat dilacak; hapus label dari tiket historis bila perlu.

## Tahap implementasi dan tugas

### 1. Status dan gerbang

REQ-001, REQ-003, REQ-005, REQ-006, REQ-008.

- [x] T001 [Plan:1.1] Tambahkan controller pada scripts/sdlc-workflow.mjs.
- [x] T002 [Plan:1.2] Uji approval, commit, CI, dan idempotensi di tests/unit/sdlc-workflow.test.js.

### 2. Hubungkan kejadian GitHub

REQ-002, REQ-004, REQ-007, REQ-008.

- [x] T003 [Plan:2.1] Tambahkan workflow nonaktif .github/workflows/agentic-sdlc.yml.
- [x] T004 [Plan:2.2] Hubungkan tiket fase dengan Architect dan Implementer.
- [x] T005 [Plan:2.3] Minta review Copilot hanya setelah tiga job CI berhasil.
- [x] T006 [Plan:2.4] Setelah rilis manusia, buat tiket pemeriksaan lanjutan; tunggu penutupan manusia.

### 3. Panduan pemula

REQ-001, REQ-006, REQ-007.

- [x] T007 [Plan:3.1] Tambahkan halaman site/sdlc.html dari scripts/site/build.mjs.
- [x] T008 [Plan:3.2] Tautkan dari README, navigasi, dan setup. Jelaskan aktivasi dan biaya.

## Requirement Mapping

| REQ ID | Plan Items | Bukti |
|---|---|---|
| REQ-001 | 1.1, 3.1 | Komentar status dan panduan visual |
| REQ-002 | 2.2 | Tiket desain ditugaskan ke Architect |
| REQ-003 | 1.2 | Approval manusia pada SHA desain |
| REQ-004 | 2.2 | Tiket implementasi dengan referensi ADR yang tepat |
| REQ-005 | 1.2 | Tiga job CI pada commit PR yang sama |
| REQ-006 | 1.2, 2.3 | Pemeriksaan terpisah atas catatan Copilot dan approval manusia |
| REQ-007 | 2.1, 2.4 | Tidak ada API merge, create release, atau deployment |
| REQ-008 | 1.2 | Uji duplikasi, penolakan API, dan resume eksplisit |

## Verifikasi dan cakupan

Tes controller memakai respons API fiktif dan jam tetap. Jalankan npm test,
npm run lint, build situs, dan npm run e2e. Validasi struktur workflow YAML.

Verifikasi live memerlukan publikasi file di default branch oleh maintainer,
aktivasi, token pengguna, akses Copilot, dan anggaran. Hasil tes lokal bukan
bukti pekerjaan cloud berhasil. Tidak ada deployment yang disiapkan karena
repo ini belum memiliki target hosting aplikasi dan izin deployment.

## Hasil verifikasi lokal awal

45 tes unit dan 10 tes browser lulus. Actionlint Windows dan pemeriksaan AST
workflow tidak menemukan masalah. Pengujian controller memakai API fiktif,
bukan penugasan AI, merge, atau rilis live. Aktivasi tetap terpisah.

## Verifikasi sesudah galeri dan GitHub CI

[Data bukti](evidence.json) menyimpan
run, commit, log pengujian, sumber screenshot, dan hash berkas asli.
[CI GitHub](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45761657365) pada commit e07ed05 lulus:
45 unit test per zona (24 khusus controller) dan 11 tes browser.
[Workflow Agentic SDLC](https://github.com/sandy-demo/AgenticSDLC/actions/runs/45761657411) masih Skipped.
Hasil tersebut menguji kode dengan API fiktif, bukan pekerjaan agent live.
Aktivasi dan persetujuan manusia tetap diperlukan; tidak ada merge atau deployment.
