# API Expense Claim — localhost

Jalankan `npm run dev`. Semua contoh memakai data fiktif. Header `x-demo-user`
memilih persona aplikasi, bukan autentikasi: `1`–`3` Employee,
`4`–`5` Manager, `6` Finance. Body dikirim sebagai `application/json`.

| Method dan path | Peran | Input | Respons berhasil |
|---|---|---|---|
| `GET /health` | Semua | — | `200`, `{ status: "ok" }` |
| `GET /claims` | Employee | — | `200`, `{ items: [...] }` — **kontrak lama, dibuat tidak sinkron untuk S12** |
| `POST /claims` | Employee | `title`, `amount`, `claimDate` (`YYYY-MM-DD`), `category`, `attachment`, `notes` | `201`, `{ claim: { id, status, ... } }` |
| `GET /claims/:id` | Pemilik, Manager tim, Finance | `id` | `200`, `{ claim }` |
| `POST /claims/:id/comments` | Employee pemilik klaim | `id`, `{ "text": "..." }` | `201`, `{ comment: { id, claimId, authorId, text } }` |
| `GET /approvals` | Manager, Finance | — | `200`, `{ claims }`; hanya klaim pada antrean peran tersebut |
| `POST /approvals/:id` | Manager, Finance | `{ "action": "approve" }` atau `"reject"` | `200`, `{ claim }`; audit status ditulis dalam transaksi yang sama |
| `GET /reports?month=YYYY-MM` | Finance | `month` | `200`, `{ month, rows: [ { category, department, count, total } ] }` |

`category` yang tidak dikirim pada baseline menjadi `Other`; `attachment` dan
`notes` opsional. `400` mengirim `{ code, message }` jika input tidak valid.
`401` untuk pemilih persona yang tidak valid, `403` untuk peran yang salah,
`404` jika klaim tidak terlihat, `409` jika status berubah atau belum sesuai.

Untuk komentar, `id` harus bilangan bulat positif yang aman dan `text` harus
berupa string yang tidak kosong setelah spasi di awal dan akhir dihapus, dengan
panjang maksimal 500 karakter setelah penghapusan spasi. Teks yang disimpan dan
dikembalikan adalah hasil penghapusan spasi tersebut. Input tidak valid
menghasilkan `400` (`INVALID_ID` atau `COMMENT_TEXT`); klaim yang tidak ada
atau milik karyawan lain menghasilkan `404` (`CLAIM_NOT_FOUND`). Manager dan
Finance mendapat `403` (`ROLE_REQUIRED`), dan persona tidak valid mendapat
`401` (`DEMO_USER_REQUIRED`). Semua error berbentuk `{ code, message }`.

Contoh: browser mengirim "Taksi bandara", `250000`, dan tanggal hari ini.
Server memvalidasi data, menyimpan `pending` dan event awal di SQLite, lalu
mengembalikan nomor klaim. Browser menampilkan status menunggu Manager.
Tanggal masa depan baru ditolak ketika perbaikan S04 diterapkan;
aturan bisnisnya tetap tercatat di [business-rules.md](business-rules.md).
