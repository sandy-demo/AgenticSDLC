import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config, git, root } from './demo-runtime.mjs';

const baseline = git(['rev-parse', '--verify', `${config.baseline}^{commit}`]);
const target = join(root, '.worktrees', `latihan-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`);
if (process.argv[2] !== '--fresh') {
  console.log(`Reset aman: hentikan server demo dan mulai lagi; SQLite di memori kembali ke seed.`);
  console.log(`Buat checkout latihan baru dengan npm run reset -- --fresh. Main dan remote tidak akan diubah (${baseline.slice(0, 8)}).`);
} else {
  if (existsSync(target)) throw new Error('Lokasi latihan sudah ada.');
  git(['worktree', 'add', '--detach', target, baseline]);
  console.log(`Checkout baru: ${target}\nFile dan branch yang sudah ada tidak diubah.`);
}
