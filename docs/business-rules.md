# Aturan bisnis Expense Claim

1. Kategori valid: `Travel`, `Meals`, `Equipment`, `Other`.
2. Jumlah harus rupiah bulat, lebih dari Rp0, dan maksimal Rp50.000.000.
3. Tanggal klaim tidak boleh di masa depan dan maksimal 90 hari kalender ke
   belakang (termasuk hari ke-90). Hari ini dan batasnya mengikuti zona bisnis
   `Asia/Jakarta`, bukan zona waktu mesin.
4. Klaim di bawah Rp1.000.000 perlu Manager. Klaim **Rp1.000.000 atau lebih**
   perlu Manager lalu Finance. S08 menguji nilai tepat di batas.
5. Approver bukan pengaju. Manager hanya memutuskan klaim timnya.
6. Simpan perubahan status di `claim_events`: pelaku, waktu, asal, tujuan.
7. Laporan bulanan menghitung klaim yang disetujui per kategori dan departemen,
   berdasarkan tanggal klaim.

Ini aturan yang diharapkan, bukan daftar bug yang sudah dibereskan. Lihat
[status](../PROGRESS.md) untuk perbedaan baseline workshop.
