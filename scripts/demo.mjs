import { config, serve } from './demo-runtime.mjs';

const [mode, ref, ...extra] = process.argv.slice(2);
if (extra.length || !['before', 'after', 'compare'].includes(mode) || (mode === 'before' ? !!ref : !ref)) {
  throw new Error('Gunakan before, after <ref>, atau compare <ref>. Hentikan server dari terminal yang sama (Ctrl+C).');
}
const sessions = [];
const stop = () => sessions.forEach((session) => session.stop());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
try {
  if (mode !== 'after') sessions.push(await serve(config.baseline, config.beforePort));
  if (mode !== 'before') sessions.push(await serve(ref, config.afterPort));
  for (const { url } of sessions) console.log(`Buka ${url}`);
  const [code, signal] = await Promise.race(sessions.map(({ completed }) => completed));
  if (code !== 0 && !signal) process.exitCode = 1;
} finally {
  stop();
}
