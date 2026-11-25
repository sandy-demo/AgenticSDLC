import { appendFileSync, lstatSync, mkdirSync, readFileSync } from 'node:fs';

const restrictions = [
  ['credential-location', /(?:^|[\s/"'\\])\.(?:env(?:\.\w+)?|auth)(?=$|[\s/"'\\])/i],
  ['destructive-command', /\brm\s+-rf\b|\bRemove-Item\b[^;\n]*\b-Recurse\b/i],
  ['remote-script', /\bcurl\b[^|\n]*\|\s*(?:bash|sh)\b/i],
  ['change-main', /\bgit\s+push\b[^;\n]*(?:\bmain\b|--force\b)/i],
  ['environment-dump', /\bprintenv\b/i],
];

const patchEnvelope = /^\*\*\* Begin Patch\r?\n\*\*\* (?:Add|Delete|Update) File: [^\r\n]+\r?\n(?:[\s\S]*\r?\n)?\*\*\* End Patch(?:\r?\n)?$/;

export function check(input) {
  if (!input || typeof input.toolName !== 'string' || !input.toolName.trim()) return 'invalid-input';
  const { toolName, toolArgs } = input;
  const rawPatch = toolName === 'apply_patch' && typeof toolArgs === 'string' && patchEnvelope.test(toolArgs);
  const args = typeof toolArgs === 'string' && !rawPatch ? JSON.parse(toolArgs) : toolArgs;
  const value = JSON.stringify(args ?? {}).replaceAll('\\\\', '/');
  return restrictions.find(([, pattern]) => pattern.test(value))?.[0] ?? 'standard-policy';
}

function audit(phase, decision, category) {
  mkdirSync('audit', { recursive: true, mode: 0o700 });
  if (!lstatSync('audit').isDirectory() || lstatSync('audit/tools.log', { throwIfNoEntry: false })?.isSymbolicLink()) {
    throw new Error('Lokasi audit bukan direktori/file lokal biasa.');
  }
  appendFileSync('audit/tools.log', `${JSON.stringify({ at: new Date().toISOString(), phase, decision, category })}\n`, { mode: 0o600 });
}

const [action] = process.argv.slice(2);
if (action === 'demo') {
  for (const [label, command] of [['tes biasa', 'npm test'], ['lokasi terlindungi', 'cat .env']]) {
    const category = check({ toolName: 'bash', toolArgs: { command } });
    const decision = category === 'standard-policy' ? 'default' : 'deny';
    audit('fixture', decision, category);
    console.log(`${label}: ${decision} (${category})`);
  }
  console.log('Fixture tidak dieksekusi. Jejak tanpa argumen: audit/tools.log');
} else if (['session', 'pre', 'post'].includes(action)) {
  let category = 'standard-policy';
  try {
    if (action === 'pre') category = check(JSON.parse(readFileSync(0, 'utf8')));
  } catch {
    category = 'invalid-input';
  }
  let denied = category !== 'standard-policy';
  try {
    audit(action, denied ? 'deny' : 'default', category);
  } catch {
    denied = true;
    category = 'audit-unavailable';
    console.error('Hook: catatan audit tidak bisa ditulis.');
    if (action !== 'pre') process.exitCode = 1;
  }
  if (action === 'pre' && denied) {
    console.log(JSON.stringify({
      permissionDecision: 'deny',
      permissionDecisionReason: `Guardrail workshop menolak kategori ${category}.`,
    }));
  }
} else {
  throw new Error('Pilih session, pre, post, atau demo.');
}
