import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { join } from 'node:path';
import { root } from './demo-runtime.mjs';

const file = join(root, 'docs', 'metrics.json');
const [id, action, field, value, ...extra] = process.argv.slice(2);
const data = JSON.parse(readFileSync(file, 'utf8'));
if (!/^S(0[1-9]|1[0-5])$/.test(id ?? '') || extra.length) throw new Error('Pilih skenario S01–S15.');
const scenario = data[id] ??= { runs: [] };
const latest = scenario.runs.at(-1);
const time = () => new Date(performance.timeOrigin + performance.now());
if (action === 'start' && field === undefined) {
  if (latest && !latest.stoppedAt) throw new Error('Run belum dihentikan.');
  const startedAt = time().toISOString();
  scenario.runs.push({ date: startedAt.slice(0, 10), startedAt });
} else if (action === 'stop' && field === undefined) {
  if (!latest || latest.stoppedAt) throw new Error('Mulai run sebelum menghentikannya.');
  latest.stoppedAt = time().toISOString();
  latest.durationSeconds = Math.round((Date.parse(latest.stoppedAt) - Date.parse(latest.startedAt)) / 1000);
} else if (action === 'record' && ['aiCredits', 'minutesToPr'].includes(field) && latest &&
           /^\d+(?:\.\d+)?$/.test(value ?? '') && Number.isFinite(Number(value))) {
  latest[field] = Number(value);
} else {
  throw new Error('Gunakan start, stop, atau record aiCredits|minutesToPr <angka terukur>.');
}
writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Metrik ${id} disimpan. Durasi belum berarti durasi ke PR; isi hanya jika benar-benar diukur.`);
