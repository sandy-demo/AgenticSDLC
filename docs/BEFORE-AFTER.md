# Bukti before dan after

Dry-run 2026-11-25 UTC. Mulai dari [panduan HTML](../site/index.html#urutan). **Tangkapan aplikasi** adalah UI asli dengan data fiktif. **Output yang dirender** berasal dari hasil perintah atau API yang benar-benar dijalankan, bukan layar VS Code, Copilot, atau GitHub. Dua tangkapan GitHub Actions adalah ringkasan run publik; identitas akun ditutup.

| Skenario | Status | Bukti | Waktu cek lokal (bukan waktu ke PR) |
|---|---|---|---|
| S04 | Lokal dicek; pending · Issue, draft PR, revisi Copilot | [S04-local-form.png](screenshots/S04-local-form.png) · [S04-local-form-annotated.png](screenshots/S04-local-form-annotated.png) · [S04-before.png](screenshots/S04-before.png) · [S04-before-annotated.png](screenshots/S04-before-annotated.png) · [S04-after.png](screenshots/S04-after.png) · [S04-after-annotated.png](screenshots/S04-after-annotated.png) · [S04-local-result.png](screenshots/S04-local-result.png) | 2,01 dtk · HTTP 201 → 400; hari ini 201 |
| S05 | Lokal dicek; Actions nyata · PR perbaikan pending | [S05-local-result.png](screenshots/S05-local-result.png) · [S05-before.png](screenshots/S05-before.png) | 0,27 dtk |
| S07 | Lokal dicek; pending · dua draft PR S07a/S07b | [S07-local-result.png](screenshots/S07-local-result.png) | 0 dtk |
| S08 | Lokal dicek; pending · agent picker, PR dan issue Bug: | [S08-local-result.png](screenshots/S08-local-result.png) | 3,23 dtk · coverage baris 100% → 100%; 1 tes batas gagal |
| S09 | Lokal dicek; pending · Copilot code review dan review board | [S09-local-result.png](screenshots/S09-local-result.png) | 1,31 dtk |
| S12 | Lokal dicek; pending · Docs Sync dan draft docs | [S12-local-result.png](screenshots/S12-local-result.png) | 0,5 dtk |
| S13 | Lokal dicek; Actions nyata · triage dan komentar agent pending | [S13-local-result.png](screenshots/S13-local-result.png) · [S13-ci-failure.png](screenshots/S13-ci-failure.png) | 0,14 dtk |
| S14 | Lokal dicek; pending · sesi cloud/usage; fixture aman saja | [S14-local-result.png](screenshots/S14-local-result.png) | 0,06 dtk |
| S10 | Lokal dicek; pending · CodeQL default setup belum aktif | [S10-local-result.png](screenshots/S10-local-result.png) | 0,52 dtk |
| S11 | Lokal dicek; pending · ADR, persetujuan dan PR implementer | [S11-local-result.png](screenshots/S11-local-result.png) | 0,91 dtk |
| S15 | Lokal dicek; pending · fitur multi-mata-uang dan gate manusia | [S15-before.png](screenshots/S15-before.png) · [S15-before-annotated.png](screenshots/S15-before-annotated.png) · [S15-local-approval.png](screenshots/S15-local-approval.png) · [S15-local-result.png](screenshots/S15-local-result.png) | 0,91 dtk |
| S01 | Lokal dicek; manual pending · VS Code | [S01-local-result.png](screenshots/S01-local-result.png) | 0,12 dtk |
| S02 | Lokal dicek; manual pending · VS Code | [S02-before.png](screenshots/S02-before.png) · [S02-after.png](screenshots/S02-after.png) · [S02-after-annotated.png](screenshots/S02-after-annotated.png) · [S02-local-result.png](screenshots/S02-local-result.png) | 1,48 dtk |
| S03 | Lokal dicek; manual pending · VS Code | [S03-local-result.png](screenshots/S03-local-result.png) | 0,53 dtk |
| S06 | Lokal dicek; manual/org · konektor belum dijalankan | [S06-before.png](screenshots/S06-before.png) · [S06-before-annotated.png](screenshots/S06-before-annotated.png) · [S06-local-result.png](screenshots/S06-local-result.png) | 0,79 dtk |

Detail angka: [metrics.json](metrics.json). Layar yang belum terekam: [daftar file](screenshots/_missing.json). Waktu cloud, review, alert dan premium requests belum terukur; nilainya `null`, bukan 0.
