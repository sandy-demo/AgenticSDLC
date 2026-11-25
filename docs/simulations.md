# Latihan yang tidak memerlukan perubahan berisiko

## S09 — Review board

- **Temuan yang bisa diperiksa:** di `src/db.js`, `listOwn` mengambil ID lalu
  melakukan satu query tambahan per klaim. Usulkan satu query dengan kolom
  yang sama; buktikan output tidak berubah.
- **Kartu ilustrasi:** AppSec meminta memeriksa apakah objek pengguna ikut
  dicatat. Compliance meminta bukti jejak perubahan status. Baseline ini
  tidak mencatat data pribadi dan sudah menyimpan jejak perubahan.

## S10 — CodeQL dan tindak lanjut

Gunakan kartu latihan berikut untuk membahas alur triage, usulan perbaikan,
scan ulang, dan keputusan manusia. Ini **bukan alert GitHub**.

| Kartu | Keadaan ilustrasi | Apa yang dicek reviewer |
|---|---|---|
| Awal | Alert simulasi meminta pemeriksaan jalur query laporan | Apakah data dari pengguna dipisah dari teks SQL? |
| Perbaikan | Contoh kode aman sudah ada di `src/db.js` | Nilai periode diikat sebagai parameter; peran Finance dan validasi periode tetap diuji. |
| Penutupan | Reviewer menunggu hasil scan ulang | Jangan menandai alert sungguhan selesai tanpa bukti. `npm audit` dan CodeQL punya cakupan berbeda. |

Tidak ada payload, dependensi sengaja rentan, atau angka alert nyata.
Jika scanner tersedia di repo tujuan, jalankan pada source yang ada dan
catat hasil aktual, termasuk bila tidak menemukan alert.

## S14 — Uji kebijakan tanpa menjalankan perintah

Kirim **data fixture** ke pemeriksa hook lewat `npm run guard:demo`.
Jangan minta agent membaca secret, menghancurkan file, atau mem-push ke
`main`. Pemeriksa melaporkan keputusan dan kategori; tidak menjalankan argumen.
Audit lokal bukan audit enterprise dan bukan pengganti izin GitHub atau sandbox.
