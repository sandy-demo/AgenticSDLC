# ADR 0003: Controller untuk workflow Agentic SDLC

Status: Proposed untuk aktivasi live. Implementasi lokal boleh diuji tanpa API.

## Masalah

Skenario workshop terpisah tidak menghubungkan hasil desain ke implementasi,
atau hasil CI ke keputusan review. Peserta memerlukan satu tiket sebagai
peta pekerjaan dari awal sampai tindak lanjut setelah rilis.

## Keputusan

Gunakan GitHub Actions dan controller Node.js. Copilot Architect dan Implementer
mengerjakan tiket fase terpisah. Controller mencocokkan approval manusia,
commit PR, serta tiga job CI. Review Copilot hanya catatan, bukan approval.

Merge dan publikasi GitHub Release tetap dilakukan manusia. Rilis yang cocok
dengan commit merge memicu tiket pemeriksaan lanjutan. Penutupan tiket oleh
manusia mengakhiri workflow, tanpa mengklaim deployment sudah dilakukan.

## Alternatif

Satu agent yang mengerjakan semua tahap lebih pendek, tetapi bisa menganggap
rencananya sendiri sudah disetujui. Menunggu berjam-jam di satu job Actions
memboroskan runner. Karena itu, lanjutkan berdasarkan kejadian dan simpan status
di komentar bot, dengan resume manual bila API atau izin menolak.

## Konsekuensi

Penugasan agent memakai API issue assignment yang membutuhkan token pengguna.
Token Actions standar hanya dipakai controller untuk metadata dan komentar.
Tidak ada jadwal berulang, retry AI tanpa izin, atau perubahan guardrail.

Batas: paling banyak dua tugas coding dan tiga request review per tiket.
API preview dan ketersediaan Copilot dapat menolak; status harus menjadi blocked.
Jika kode berubah, approval dan CI lama tidak digunakan.

## Tes penerimaan

- Approval dari bot, penulis PR, atau commit lama tidak membuka tahap berikutnya.
- Tiga job CI milik commit PR yang sama harus berhasil.
- Kejadian yang diulang tidak membuat tiket atau penugasan agent ganda.
- API 403 mengakhiri run dengan error; resume perlu keputusan manusia.
- Controller tidak memanggil merge, create release, atau deploy.
