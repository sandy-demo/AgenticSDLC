import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './demo-runtime.mjs';

export function refreshEvidence(scenarios, out, errors = []) {
  const missing = [];
  const shot = (name) => {
    if (existsSync(join(out, name))) return `[${name}](screenshots/${name})`;
    missing.push(name);
    return 'Belum di-capture';
  };
  const rows = Object.entries(scenarios).map(([id, s]) => {
    const [before, after] = [shot(`${id}-before.png`), shot(`${id}-after.png`)];
    const steps = s.shots.filter((n) => n !== `${id}-before.png` && n !== `${id}-after.png`).map(shot);
    const count = steps.filter((step) => step !== 'Belum di-capture').length;
    return `| ${id} | ${s.title} | ${before} | ${after} | ${count}/${steps.length} |`;
  });
  writeFileSync(join(out, '_missing.json'), `${JSON.stringify({ missing, errors }, null, 2)}\n`);
  writeFileSync(join(root, 'docs', 'BEFORE-AFTER.md'), `# Bukti before dan after

Tangkapan berlabel **lokal** berasal dari aplikasi Expense Claim dengan seed
fiktif. S04 membandingkan respons aplikasi lokal dari dua ref, bukan PR atau
session Copilot. S02 membandingkan dengan tag app bersih. Nama layar yang
belum ada tercantum di [daftar placeholder](screenshots/_missing.json).

Foto S04 beranotasi: [sebelum](screenshots/S04-before-annotated.png) ·
[sesudah](screenshots/S04-after-annotated.png), jika sudah direkam.

| Skenario | Tujuan | Before (lokal jika tersedia) | After (lokal jika tersedia) | Layar langkah |
|---|---|---|---|---|
${rows.join('\n')}
`);
}
