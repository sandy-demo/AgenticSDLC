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
| `POST /approvals/:id` | Manager, Finance | `{ "action": "approve" }` atau `"reject"`; header opsional `Idempotency-Key` (prototype S11 di bawah) | `200`, `{ claim }`; audit status ditulis dalam transaksi yang sama |
| `GET /reports?month=YYYY-MM` | Finance | `month` | `200`, `{ month, rows: [ { category, department, count, total } ] }` |

`category` yang tidak dikirim pada baseline menjadi `Other`; `attachment` dan
`notes` opsional. `400` mengirim `{ code, message }` jika input tidak valid.
`401` untuk pemilih persona yang tidak valid, `403` untuk peran yang salah,
`404` jika klaim tidak terlihat, `409` jika status berubah atau belum sesuai.

Contoh: browser mengirim "Taksi bandara", `250000`, dan tanggal hari ini.
Server memvalidasi data, menyimpan `pending` dan event awal di SQLite, lalu
mengembalikan nomor klaim. Browser menampilkan status menunggu Manager.
Tanggal masa depan baru ditolak ketika perbaikan S04 diterapkan;
aturan bisnisnya tetap tercatat di [business-rules.md](business-rules.md).

## S11 — REFERENCE PROTOTYPE ONLY, draft terisolasi

Perbandingan untuk latihan ini belum di-merge dan bukan implementasi produksi.
Persetujuan melanjutkan drafting di chat bukan persetujuan ADR di GitHub.
Prototype ini terpisah dari ADR resmi #22 dan Implementer #34 yang masih
terblokir; tidak mengubah atau menyetujui keduanya dan tidak menyatakan handoff
live telah lolos.

- Tanpa `Idempotency-Key`, approval berulang tetap `409 CLAIM_STATUS`.
- Header opsional harus token ASCII `[A-Za-z0-9._-]{1,128}`, tanpa normalisasi
  aplikasi; nilai kosong atau tidak valid menghasilkan `400 IDEMPOTENCY_KEY`.
- Peran, akses departemen, dan larangan pengaju memutuskan klaim sendiri
  diperiksa sebelum lookup outcome. Action tetap harus `approve` atau `reject`.
- Scope adalah aktor + klaim + key. Action yang sama mengembalikan `200` dan
  `{ claim }` hasil awal, termasuk status awal, walaupun Finance sudah melanjutkan
  klaim. Replay tidak mengubah status aktual; gunakan `GET /claims/:id` untuk
  status terkini. Field klaim selain status tidak dapat diubah lewat API ini,
  sehingga respons direkonstruksi tanpa menyimpan salinan isi klaim.
- Key yang sama dalam scope tersebut dengan action berbeda menghasilkan
  `409 IDEMPOTENCY_CONFLICT`, tanpa event baru. Key baru selalu memeriksa tahap
  aktual: Manager pada `pending`, Finance pada `finance_review`; tahap yang
  salah menghasilkan `409 CLAIM_STATUS` dan tidak menyimpan outcome.
- Khusus branch prototype ini, nilai **Rp1.000.000 atau lebih** diarahkan dari
  Manager ke Finance; di bawahnya cukup Manager. Data seed dan skenario lain
  tidak diubah.
- Prepared statements SQLite hanya menyimpan metadata outcome (aktor, ID klaim,
  key, action, status hasil), bukan request atau isi klaim. Perubahan status,
  `claim_events`, dan outcome sukses di-commit atomik; kegagalan me-rollback
  ketiganya. HTTP sukses selalu `200`.
- Key, request, dan isi klaim tidak masuk log. Replay tidak menambah event audit
  atau log operasional `claim.status_changed`; penolakan hanya mencatat metadata
  error seperti biasa.
- Database tetap `:memory:`: outcome hanya berlaku selama instance server lab
  hidup, hilang saat restart, tanpa persistensi atau jaminan lintas instance.

Reproduksi lokal tanpa jaringan: jalankan
`npm test -- tests/unit/approval-prototype.test.js`, lalu `npm test`.
Tes memakai clock tetap, data fiktif, replay Manager/Finance, konflik action,
validasi, akses/tahap, audit/log tepat sekali, serta rollback transaksi nyata.
