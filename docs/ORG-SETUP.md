# Menjalankan bagian GitHub dan organisasi

## Di repository tujuan

1. Pemilik memberi izin **Write** pada akun yang akan push. Pastikan
   `origin` menunjuk ke `https://github.com/sandy-demo/AgenticSDLC.git`.
   Untuk repository yang masih kosong, pemilik melakukan push awal `main`
   beserta `v0-baseline`, `v1-app-clean`, dan branch `demo/*` yang ingin dipakai.
   Setelah bootstrap tidak ada push langsung ke `main`.
2. Pastikan GitHub Actions dan [Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent)
   sudah diizinkan. Buat issue dengan `node scripts/seed-issues.mjs --dry-run`
   lalu `node scripts/seed-issues.mjs --apply OWNER/REPO` pada repo latihan.
   Buat draft PR dari `demo/pr-stock` bila perlu. Jangan buka PR dari branch
   latihan terhadap repo produksi.
3. Admin menunggu checks pertama, lalu menerapkan review wajib dan required
   checks di `main`. Gunakan `bash scripts/protect-main.sh --apply OWNER/REPO`
   hanya bila belum ada aturan. Aktifkan
   [CodeQL default setup](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configure-code-scanning)
   dan tambah rule **Require code scanning results** untuk CodeQL setelah hasil
   pertama muncul, agar tidak mengunci branch dengan nama check tebakan.
4. Di **Settings → Pages**, pilih **GitHub Actions**. Jalankan workflow
   **Publish workshop** dari `main`, kemudian verifikasi URL yang dikeluarkan job.
   Situs hanya menyajikan materi offline; aplikasi Express tidak di-host di Pages.
5. Untuk eksperimen mandiri, admin boleh menandai repo sebagai **Template
   repository**. Template GitHub tidak membawa tag Git. Kalau membuat repo
   turunan dari template, pilih **Include all branches** bila memerlukan demo
   branch. Buat tag `v0-baseline` pada commit awal sebelum memulai latihan.
   Untuk varian peserta, `bash scripts/make-bare.sh` menghasilkan ZIP lokal.

## Agentic Workflows dan biaya (S12–S14)

- Baca [autentikasi gh-aw](https://github.github.com/gh-aw/reference/auth/) dan
  periksa plan, izin Actions, dan budget sebelum mengaktifkan.
- Personal: buat fine-grained PAT dengan **Copilot Requests: Read** pada
  pengaturan akun sendiri. Masukkan lewat UI Secrets repository dengan nama
  `COPILOT_GITHUB_TOKEN`; jangan taruh nilainya di chat, terminal history, atau commit.
- Organisasi: admin memastikan kebijakan billing organisasi mengizinkan
  `copilot-requests: write` atau penggunaan PAT disetujui. Perubahan izin pada
  frontmatter perlu dikompilasi ulang dan ditinjau sebelum publikasi.
- Jika organisasi mewajibkan token khusus untuk membuat PR draft, ikuti
  dokumentasi `safe-outputs` dan kebijakan repo; jangan memperluas izin token agent.
- Sesudah disetujui, atur variabel Actions `AGENTIC_WORKSHOP_LIVE=true`.
  Jalankan Docs Sync secara manual dari `main` dan cek draft PR. S13 terbatas
  pada issue latihan dan PR `demo/ci-econnreset`. Hapus variabel setelah latihan.

## S06 dan S14 versi organisasi

Pemilik tenant mengimpor versi template ke repo latihan, mengizinkan Copilot,
dan mengonfigurasi konektor Jira/Teams sesuai kebijakan. Uji dengan ticket
fiktif; simpan hanya nomor ticket/draft PR yang aman dipublikasikan.
Untuk governance, rekam dashboard usage dan policy yang boleh dibagikan
setelah menutup informasi akun, organisasi, dan penagihan sensitif.

Status: belum dijalankan di tenant organisasi. Tidak ada screenshot Jira,
Teams, dashboard usage, atau policy enterprise. Gunakan versi Issue GitHub
untuk S06 dan fixture lokal untuk S14 sampai akses tersedia.
