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

## PAT Copilot untuk S12 dan S13

**PAT (Personal Access Token)** adalah kredensial yang mewakili akunmu. Saat Docs Sync (S12), Issue Triage, atau CI Fault Analysis (S13) butuh bantuan AI, GitHub Actions memakai secret `COPILOT_GITHUB_TOKEN` untuk mengirim permintaan ke Copilot atas nama akun `sandy-demo`. Job Actions tidak memakai sesi login browser kamu.

**Kapan boleh dilewati?** PAT ini tidak diperlukan untuk materi offline, aplikasi lokal, CI biasa, atau memilih Copilot lewat **Assignees** di S04. Untuk Assignees, GitHub mengecek akses Copilot akun yang sedang login.

**Kenapa di tab Account?** Copilot memeriksa akses layanan pada akun pemilik token, bukan pengaturan repo. **Copilot Requests: Read** adalah izin minimum untuk memanggil Copilot lewat PAT. Izin ini bukan izin mengubah file atau membuka PR. **Copilot agent settings** di tab **Repositories** mengatur konfigurasi agent, jadi bukan penggantinya.

### Buat dan simpan token

1. **Buat di Settings akun.** Dari foto profil, pilih **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**, atau buka [form fine-grained PAT](https://github.com/settings/personal-access-tokens/new?name=COPILOT_GITHUB_TOKEN&user_copilot_requests=read). Di **Resource owner** pilih akun pribadi **sandy-demo**. Pilih masa berlaku singkat dan batasi akses repo ke **AgenticSDLC**.
2. **Pilih izin di tab Account.** Klik **Permissions > Account > Add permissions**, cari **Copilot Requests**, lalu pilih **Read** (*Read-only*). Tidak perlu menambah izin tulis. Klik **Generate token**.
3. **Simpan di Settings repo.** Buka [Actions secrets repo AgenticSDLC](https://github.com/sandy-demo/AgenticSDLC/settings/secrets/actions) (**Settings > Secrets and variables > Actions > Secrets**). Klik **New repository secret**, isi **Name** dengan `COPILOT_GITHUB_TOKEN`, tempel nilai PAT di kolom **Secret**, lalu klik **Add secret**. Jangan masukkan nilai token ke chat, commit, atau screenshot.

Lihat [posisi Account → Copilot Requests: Read-only](screenshots/setup-copilot-pat.png) dan [daftar Repository secrets](screenshots/setup-copilot-secret.png). Tangkapan pertama diambil sebelum token dibuat; tangkapan kedua hanya menampilkan nama secret.

**Cara cek:** jalankan `gh secret list -R sandy-demo/AgenticSDLC`. Nama `COPILOT_GITHUB_TOKEN` harus muncul, bukan nilainya. Menyimpan secret tidak otomatis menyalakan workflow. Izin untuk operasi GitHub tetap dikontrol terpisah lewat `permissions` dan `safe-outputs`. [Panduan autentikasi gh-aw](https://github.github.com/gh-aw/reference/auth/#copilot_github_token).

## Agentic Workflows dan biaya (S12–S14)

- Baca [autentikasi gh-aw](https://github.github.com/gh-aw/reference/auth/) dan
  periksa plan, izin Actions, dan budget sebelum mengaktifkan.
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
