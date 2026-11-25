# Catatan keputusan arsitektur (ADR)

S11 dan S15 menghasilkan draf ADR, bukan desain yang sudah disetujui.
Pakai nama `0001-approval-bertahap.md` dan `0002-multi-currency.md`.
Sertakan konteks, keputusan, alternatif, konsekuensi, acceptance criteria,
dan risiko. Tech Lead meninjau draf sebelum perubahan aplikasi dimulai.

## Komentar klaim demo (S03)

Komentar disimpan dalam tabel SQLite terpisah dari event perubahan status.
Hanya karyawan pemilik yang dapat menambahkan komentar; klaim yang tidak ada
dan klaim milik orang lain sama-sama menghasilkan 404. Isi komentar tidak
dicatat dalam log. Penyimpanan tetap bersifat in-memory seperti data demo lain.
