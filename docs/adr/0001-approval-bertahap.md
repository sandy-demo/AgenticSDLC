# ADR 0001: Idempotensi persetujuan bertahap

- Status: Proposed
- Issue: [#11](https://github.com/sandy-demo/AgenticSDLC/issues/11)
- Tanggal: 2026-11-25

## Konteks

Aturan bisnis menetapkan bahwa klaim di bawah Rp1.000.000 cukup diputuskan
Manager, sedangkan klaim Rp1.000.000 atau lebih harus disetujui Manager lalu
Finance. Manager hanya memutuskan klaim timnya, dan approver tidak boleh menjadi
pengaju. Setiap perubahan status harus memiliki event yang mencatat pelaku,
waktu, status asal, dan status tujuan.

Saat ini `POST /approvals/:id` menerima tindakan `approve` atau `reject`.
Keputusan hanya diterima ketika klaim menunggu keputusan peran tersebut.
Permintaan ulang setelah transisi menghasilkan `409 CLAIM_STATUS`; pembaruan
status dan penulisan `claim_events` sudah berada dalam satu transaksi. Tidak
ada kunci idempotensi pada kontrak API.

Implementasi `requiresFinance` saat ini memakai batas lebih dari Rp1.000.000,
berbeda dari aturan bisnis yang menetapkan Rp1.000.000 atau lebih. ADR ini
mengikuti aturan bisnis yang diharapkan; penyelarasan implementasi dan pengujian
batas menjadi pekerjaan implementasi setelah persetujuan ADR, bukan bagian
draf ini.

## Keputusan

Usulkan dukungan opsional header `Idempotency-Key` pada `POST /approvals/:id`.
Header yang tidak dikirim mempertahankan perilaku saat ini, termasuk `409`
untuk persetujuan ulang. Jika dikirim, kunci berlaku untuk kombinasi pelaku,
klaim, dan endpoint; permintaan juga diikat pada tindakan yang dikirim.

Dalam transaksi yang sama, simpan transisi status, event audit, serta catatan
kunci dan hasil keputusan. Hasil yang disimpan mencakup kode HTTP dan status
hasil, bukan salinan isi klaim. Pada retry yang cocok, susun ulang respons
berdasarkan data klaim dan status hasil yang tercatat tanpa membuat transisi
atau event audit kedua. Pemeriksaan kunci harus dilakukan sebelum pemeriksaan
status saat ini agar retry tetap dapat diputar ulang setelah transisi berhasil.

Perilaku untuk input:

- Kunci baru dengan tindakan yang valid dan klaim yang menunggu peran tersebut:
  proses keputusan dan simpan hasil serta audit secara atomik.
- Kunci dan permintaan identik yang dikirim ulang oleh pelaku yang sama: balas
  dengan hasil sukses semula; jangan menambah event audit.
- Kunci sama untuk tindakan berbeda pada klaim dan pelaku yang sama: balas
  `409` dengan `{ code, message }`; jangan mengubah status atau menambah event.
- Kunci baru atau tanpa kunci untuk klaim yang sudah tidak menunggu keputusan
  peran tersebut: balas `409 CLAIM_STATUS`; jangan menambah event.
- Kunci kosong atau tidak valid ditolak sebagai input tidak valid sebelum
  perubahan status. Batas panjang dan format kunci ditetapkan pada implementasi
  API, dengan panjang maksimum 128 karakter.

Peran dan transisi yang diizinkan:

| Peran | Syarat otorisasi | Tindakan dan transisi |
|---|---|---|
| Manager | Bukan pengaju; klaim berada di departemen Manager | Dari `pending`, `reject` menuju `rejected`; `approve` menuju `approved` jika jumlah di bawah Rp1.000.000, atau `finance_review` jika jumlah Rp1.000.000 atau lebih |
| Finance | Bukan pengaju; klaim berada di `finance_review` | `reject` menuju `rejected`; `approve` menuju `approved` |
| Employee atau peran lain | Tidak berwenang memutuskan | Ditolak dengan `403`; tidak ada transisi atau event |

Klaim yang telah `approved` atau `rejected` tidak menerima keputusan baru.
Finance tidak dapat memutuskan klaim yang masih `pending`; Manager tidak dapat
memutuskan klaim pada `finance_review`. Otorisasi dan validasi status tetap
berlaku untuk kunci baru. Retry identik dari pelaku yang telah diotorisasi
untuk keputusan asli hanya mengembalikan hasil tersimpan dan bukan keputusan
baru.

## Alternatif

1. **Pertahankan `409` untuk semua permintaan ulang.** Implementasi tetap
   sederhana dan konflik status eksplisit, tetapi klien tidak dapat membedakan
   keputusan yang gagal dari respons sukses yang hilang di jaringan. Mengulang
   permintaan berhasil akan terlihat seperti kegagalan.
2. **Gunakan kunci idempotensi dengan audit dalam transaksi yang sama
   (dipilih).** Retry aman dan audit tidak terduplikasi; perlu penyimpanan
   kunci, pengikatan permintaan, serta aturan retensi.
3. **Menerima retry tanpa kunci dan menganggapnya sukses.** Tidak aman untuk
   membedakan tindakan ulang yang sama dari tindakan berbeda, dan dapat
   menyembunyikan konflik atau upaya keputusan kedua.

## Konsekuensi

- Klien yang memilih mengirim kunci dapat mengulang permintaan setelah timeout
  tanpa membuat event keputusan duplikat. Klien lama mempertahankan kontrak
  konflik `409`.
- Penyimpanan hasil, perubahan status, dan event audit harus atomik. Kegagalan
  transaksi tidak boleh meninggalkan kunci tanpa hasil, perubahan tanpa audit,
  ataupun audit tanpa perubahan.
- Kunci dengan tindakan berbeda ditolak, bukan dianggap sebagai retry.
  Respons retry menggunakan status hasil asli walaupun klaim kemudian berubah
  melalui keputusan tahap berikutnya.
- Kunci bersifat opsional demi kompatibilitas. Jaminan replay hanya berlaku
  ketika klien mengirim kunci yang sama.
- Perubahan kontrak header dan kemungkinan `409` untuk pemakaian ulang kunci
  dengan input berbeda perlu didokumentasikan di `docs/api.md` saat
  implementasi disetujui.

## Tes penerimaan yang diusulkan

- Verifikasi ambang dengan klaim Rp999.999, Rp1.000.000, dan Rp1.000.001:
  Manager menyelesaikan klaim di bawah ambang; pada ambang dan di atasnya,
  persetujuan Manager menghasilkan `finance_review` dan hanya Finance yang
  dapat menyelesaikannya. Penolakan Manager tetap menuju `rejected`.
- Verifikasi Finance dapat menyetujui atau menolak klaim `finance_review`,
  tetapi tidak dapat memutuskan klaim `pending`; Manager tidak dapat
  memutuskan klaim `finance_review`.
- Verifikasi Employee, Manager dari departemen lain, dan pengaju sendiri
  tidak dapat memutuskan klaim; tidak ada perubahan status atau event pada
  permintaan yang ditolak.
- Verifikasi tanpa kunci, persetujuan berulang menghasilkan `409` seperti
  perilaku saat ini.
- Verifikasi kunci yang sama dan tindakan sama setelah respons pertama hilang
  mengembalikan hasil sukses yang sama dengan tepat satu perubahan status dan
  satu event audit.
- Verifikasi kunci sama dengan tindakan berbeda menghasilkan `409`, tanpa
  perubahan status atau event tambahan.
- Verifikasi kunci invalid, status tidak sesuai, dan kegagalan penyimpanan
  tidak meninggalkan catatan kunci, transisi, atau event parsial.
- Verifikasi dua permintaan bersamaan dengan kunci dan input sama tetap
  menghasilkan satu transisi dan satu event; retry mendapatkan hasil yang
  tercatat.

## Dependensi dan risiko

- Implementasi bergantung pada penyimpanan unik untuk lingkup
  pelaku/klaim/kunci dan transaksi database yang mencakup pembaruan status,
  event audit, dan hasil idempotensi.
- Kunci tidak boleh menjadi pengganti otorisasi untuk keputusan baru. Replay
  hanya berlaku pada identitas pelaku, klaim, dan tindakan yang cocok.
- Retensi kunci perlu cukup lama untuk mencakup retry klien; kebijakan retensi
  dan respons setelah kunci kedaluwarsa harus ditentukan sebelum implementasi.
- Risiko batas ambang yang berbeda pada baseline dimitigasi dengan pengujian
  eksplisit nilai tepat Rp1.000.000 dan memastikan implementasi mengikuti
  `docs/business-rules.md`.
- Konflik unik atau kegagalan transaksi harus diperlakukan sebagai kondisi
  aman: jangan melaporkan sukses kecuali hasil keputusan dan audit sudah
  tersimpan.

## Mitigasi dan langkah berikutnya

Tech Lead meninjau dan menyetujui ADR ini sebelum implementasi. Setelah
persetujuan, implementasi perlu menambahkan kontrak header, penyimpanan
transaksional dan unik, validasi input, tes penerimaan di atas, serta pembaruan
`docs/api.md`. Jangan mengubah kode sebelum persetujuan ADR.
