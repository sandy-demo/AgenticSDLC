# Dry-run lokal

| Skenario | Bukti yang diperiksa | Belum ada |
|---|---|---|
| S04 | Playwright mengirim “Taksi bandara”, Rp250.000, tanggal besok. Baseline menjawab `201`; `demo/claim-date` menjawab `400` dengan `CLAIM_DATE_FUTURE`. | Session, PR, dan checks GitHub. |
| S08 | Coverage baris `approvalRules.js` dari suite validasi terpilih: 0/1 sebelum, 1/1 setelah tes batas ditambahkan. Tes tepat Rp1.000.000 gagal sesuai fixture (`false`, seharusnya `true`). | Issue dan PR QA live. |
| S09 | `src/db.js` menunjukkan satu query ID dan query tambahan per klaim. Tes API membuktikan hanya data karyawan contoh yang dikembalikan. | Komentar reviewer live. PII dan audit dipakai sebagai checklist ilustrasi. |
| S10 | Kartu alert simulasi dan prepared statement di source; tidak ada celah yang ditanam. | Alert, scan ulang, dan PR Autofix live. |
| S12 | `docs/api.md` sengaja memakai `items`; tes API membaca `claims`. Tiga workflow dikompilasi strict. | GitHub Actions run dan draft PR docs. |
| S14 | `npm run guard:demo` mengecek fixture deny dan audit lokal tanpa menjalankan argumen. | Dashboard GitHub dan audit tenant. |
| S15 | Tangkapan baseline IDR dan timeline latihan. | Implementasi multi-currency, merge, serta metrik waktu dan kredit. |

Ulangi S08 di PowerShell dari root repo:

```powershell
npx vitest run tests/unit/validation.test.js --coverage --coverage.include=src/services/approvalRules.js --coverage.reportsDirectory=coverage-s08-before
$env:QA_BOUNDARY = '1'
npx vitest run --coverage --coverage.include=src/services/approvalRules.js --coverage.reportsDirectory=coverage-s08-after
Remove-Item Env:QA_BOUNDARY
```

`coverage-summary.json` di masing-masing folder memuat angka dalam
[`metrics.json`](metrics.json). Ini bukan total coverage aplikasi, bukan hasil
perbaikan, dan bukan hasil GitHub. Kegagalan di test batas memang diharapkan.

## Pemeriksaan sebelum publikasi

- `npm ci` dan 20 tes unit lulus pada Node 24. Di Node 26, 20 tes yang sama
  lulus di Jakarta dan Los Angeles; 6 skenario Playwright lulus, termasuk
  22 halaman offline di 320, 390, 768, dan 1440 px.
- Lighthouse Accessibility: 100 pada beranda, S04, Governance, dan Capstone
  di Chromium lokal. Pemeriksaan otomatis bukan pengganti penggunaan
  pembaca layar oleh peserta.
- `gh aw compile --strict`: 3 workflow, tanpa warning. Actionlint lulus
  untuk CI, setup Copilot, dan Pages. Belum ada GitHub Actions run.
- Pemeriksaan advisori dependensi langsung tidak melaporkan temuan. Audit
  seluruh lockfile terakhir belum tuntas karena endpoint registry membalas
  HTTP 429; jalankan ulang `npm audit` sebelum klaim hasil audit penuh.
