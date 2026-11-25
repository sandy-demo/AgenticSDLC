import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const directory = new URL('../issues/', import.meta.url);
const issues = readdirSync(directory).filter((file) => /^S\d{2}[ab]?\.md$/.test(file) && file !== 'S07.md')
  .sort().map((file) => {
    const text = readFileSync(new URL(file, directory), 'utf8').replace(/\r\n/g, '\n');
    const match = /^# ([^\n]+)\nlabels:([^\n]*)\n\n([\s\S]+)$/.exec(text);
    if (!match) throw new Error(`Format issue tidak valid: ${file}`);
    const [, title, labelLine, body] = match;
    for (const section of ['Konteks', 'Acceptance criteria', 'Definition of done', 'Skenario workshop']) {
      if (!body.includes(`## ${section}\n`)) throw new Error(`${file}: bagian ${section} tidak ada.`);
    }
    return { title, labels: labelLine.split(',').map((label) => label.trim()).filter(Boolean),
      body: file === 'S13.md' ? '\n' : body };
  });
if (issues.length !== 16 || new Set(issues.map(({ title }) => title)).size !== 16) {
  throw new Error('Diperlukan 16 judul issue unik (S07a dan S07b menggantikan S07).');
}

function gh(args, input) {
  const { stdout, status, error } = spawnSync('gh', args, { input, encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'], env: { ...process.env, GH_PROMPT_DISABLED: '1', GH_PAGER: 'cat' } });
  if (error) throw error;
  if (status !== 0) throw new Error(`GitHub CLI gagal (${status}): ${args[0]}`);
  return stdout.trim();
}

const [mode, repo, ...extra] = process.argv.slice(2);
if (!mode || mode === '--dry-run') {
  if (repo) throw new Error('Gunakan --dry-run atau --apply OWNER/REPO.');
  console.log(issues.map(({ title, labels }) => `${title} [${labels.join(', ') || 'tanpa label'}]`).join('\n'));
  console.log(`${issues.length} issue valid. Tidak ada perubahan GitHub.`);
} else if (mode === '--apply' && /^[\w.-]+\/[\w.-]+$/.test(repo ?? '') && !extra.length) {
  if (gh(['api', `repos/${repo}`, '--jq', '.permissions.push']) !== 'true') throw new Error(`Tidak punya izin tulis ke ${repo}.`);
  const list = (resource, jq) => new Set(gh(['api', '--paginate', `repos/${repo}/${resource}`, '--jq', jq]).split(/\r?\n/));
  const labels = list('labels?per_page=100', '.[].name');
  for (const label of new Set(issues.flatMap((issue) => issue.labels))) {
    if (!labels.has(label)) gh(['label', 'create', label, '--color', '3159a9', '--repo', repo]);
  }
  const open = list('issues?state=open&per_page=100', '.[] | select(.pull_request == null) | .title');
  for (const { title, labels: issueLabels, body } of issues) {
    if (open.has(title)) { console.log(`Sudah ada: ${title}`); continue; }
    console.log(gh(['issue', 'create', '--repo', repo, '--title', title, '--body-file', '-',
      ...issueLabels.flatMap((label) => ['--label', label])], body));
  }
} else {
  throw new Error('Gunakan --dry-run atau --apply OWNER/REPO.');
}
