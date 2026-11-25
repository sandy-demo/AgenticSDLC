import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const config = JSON.parse(readFileSync(new URL('./demo.config.json', import.meta.url), 'utf8'));

export function git(args, cwd = root) {
  return execFileSync('git', ['--no-pager', ...args], { cwd, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }).trim();
}

export function snapshot(ref) {
  if (!/^[\w][\w./-]*$/.test(ref ?? '') || ref.includes('..')) throw new Error('Gunakan nama ref Git yang valid.');
  const oid = git(['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]);
  const directory = join(root, '.worktrees', `workshop-${oid.slice(0, 12)}`);
  mkdirSync(join(root, '.worktrees'), { recursive: true });
  if (!existsSync(directory)) git(['worktree', 'add', '--detach', directory, oid]);
  if (git(['rev-parse', 'HEAD'], directory) !== oid || git(['status', '--porcelain'], directory)) {
    throw new Error(`Worktree ${directory} bukan snapshot bersih. Jangan gunakan untuk bukti.`);
  }
  const modules = join(directory, 'node_modules');
  if (!existsSync(modules)) {
    const dependencyKey = (folder) => {
      const { packages } = JSON.parse(readFileSync(join(folder, 'package-lock.json'), 'utf8'));
      const { dependencies } = packages[''];
      const names = new Set(Object.keys(dependencies));
      for (const [path, { dependencies: deps, dev }] of Object.entries(packages)) {
        if (path && !dev) for (const name of Object.keys(deps ?? {})) names.add(name);
      }
      return [...names].sort().map((name) => packages[`node_modules/${name}`]?.integrity).join(' ');
    };
    if (dependencyKey(directory) !== dependencyKey(root) || !existsSync(join(root, 'node_modules'))) {
      throw new Error(`Dependensi runtime berbeda atau belum terpasang. Jalankan npm ci di ${directory}.`);
    }
    // The snapshots here share the pinned app runtime; site dev dependencies are irrelevant.
    symlinkSync(join(root, 'node_modules'), modules, process.platform === 'win32' ? 'junction' : 'dir');
  }
  return directory;
}

export async function serve(ref, port = 0) {
  const directory = snapshot(ref);
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: directory, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'inherit'],
  });
  const completed = once(child, 'close');
  let url;
  try {
    url = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`${ref} tidak siap dalam 15 detik.`)), 15_000);
      let output = '';
      child.once('error', (error) => { clearTimeout(timeout); reject(error); });
      child.once('exit', (code) => { clearTimeout(timeout); reject(new Error(`${ref} berhenti (${code}).`)); });
      child.stdout.on('data', (data) => {
        output = `${output}${data}`.slice(-8192);
        const match = /"event":"server\.ready","port":(\d+)/.exec(output);
        if (match) { clearTimeout(timeout); resolve(`http://127.0.0.1:${match[1]}`); }
      });
    });
    const ready = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
    if (!ready.ok) throw new Error(`${ref}: health check ${ready.status}.`);
  } catch (error) {
    child.kill();
    await completed.catch(() => {});
    throw error;
  }
  return { url, completed, stop: () => { if (!child.killed && child.exitCode === null) child.kill(); } };
}
