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
| `GET /approvals` | Manager, Finance | — | `200`, `{ claims }`; hanya klaim pada antrean peran tersebut |
| `POST /approvals/:id` | Manager, Finance | `{ "action": "approve" }` atau `"reject"` | `200`, `{ claim }`; audit status ditulis dalam transaksi yang sama |
| `GET /reports?month=YYYY-MM` | Finance | `month` | `200`, `{ month, rows: [ { category, department, count, total } ] }` |

`category` yang tidak dikirim pada baseline menjadi `Other`; `attachment` dan
`notes` opsional. `400` mengirim `{ code, message }` jika input tidak valid.
`401` untuk pemilih persona yang tidak valid, `403` untuk peran yang salah,
`404` jika klaim tidak terlihat, `409` jika status berubah atau belum sesuai.

Contoh: browser mengirim "Taksi bandara", `250000`, dan tanggal hari ini.
Pilihan kategori Perjalanan, Makan, Peralatan, dan Lainnya mengirim nilai
`Travel`, `Meals`, `Equipment`, dan `Other`; pilihan awal dan setelah form
direset adalah Lainnya (`Other`). Kategori tersimpan ditampilkan di daftar klaim.
Server memvalidasi data, menyimpan `pending` dan event awal di SQLite, lalu
mengembalikan nomor klaim. Browser menampilkan status menunggu Manager.
Tanggal masa depan baru ditolak ketika perbaikan S04 diterapkan;
aturan bisnisnya tetap tercatat di [business-rules.md](business-rules.md).
