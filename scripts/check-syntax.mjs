import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

for (const root of ['src', 'scripts', 'tests']) {
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(mjs|js)$/.test(entry.name)) continue;
    const result = spawnSync(process.execPath, ['--check', join(entry.parentPath, entry.name)], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(1);
  }
}
