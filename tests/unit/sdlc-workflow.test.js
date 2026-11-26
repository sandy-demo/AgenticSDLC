import { expect, it, vi } from 'vitest';
import { allowedFiles, createGithubClient, createPipeline, hasHumanApproval, issueNumber, loadState, stateComment, validateBaseBranch, WorkflowError } from '../../scripts/sdlc-workflow.mjs';
const sha = letter => letter.repeat(40);
const repository = 'demo/workshop';
const base = 'training/example';
const user = (login, type = 'User') => ({ login, type });
const human = { id: 20, user: user('lead'), state: 'APPROVED', commit_id: sha('b'), submitted_at: '2026-10-15T12:00:00Z' };
const pull = (number, head, files) => ({ number, files, user: user('copilot-swe-agent[bot]', 'Bot'), state: 'open', merged: false,
  head: { sha: head, ref: `copilot/phase-${number}`, repo: { full_name: repository } }, base: { ref: base, repo: { full_name: repository } } });
function fixture() {
  const comments = [];
  const issues = new Map([[1, { number: 1, title: 'Tiket latihan', body: 'Besok ditolak, hari ini diterima.', state: 'open', labels: [], assignees: [] }]]);
  const pulls = new Map(); const reviews = new Map(); const timelines = new Map();
  let runs = []; let releases = []; let next = 101; let failure = false;
  const jobs = ['test (Asia/Jakarta)', 'test (America/Los_Angeles)', 'e2e'].map(name => ({ name, status: 'completed', conclusion: 'success' }));
  const request = vi.fn(async (method, path, body, agent) => {
    if (method === 'GET' && path.startsWith('search/issues?')) return { total_count: issues.size - 1, items: [...issues.values()].filter(i => i.number !== 1) };
    const p = path.replace(`repos/${repository}/`, '');
    if (method === 'GET' && /^collaborators\/.+\/permission$/.test(p)) return { permission: 'write' };
    if (method === 'GET' && p.startsWith('branches/')) return { name: base };
    if (method === 'GET' && p.startsWith('labels/')) return { name: 'agentic-sdlc' };
    if (method === 'GET' && /^issues\/\d+$/.test(p)) return issues.get(Number(p.split('/')[1]));
    if (method === 'POST' && (p === 'labels' || /^issues\/\d+\/labels$/.test(p))) return [];
    if (method === 'POST' && p === 'issues') {
      const issue = { ...body, number: next++, user: user('github-actions[bot]', 'Bot'), state: 'open', assignees: [] };
      issues.set(issue.number, issue); return issue;
    }
    if (method === 'POST' && /^issues\/\d+\/comments$/.test(p)) {
      const comment = { id: 77, body: body.body, user: user('github-actions[bot]', 'Bot') }; comments.push(comment); return comment;
    }
    if (method === 'PATCH' && p === 'issues/comments/77') { comments[0].body = body.body; return comments[0]; }
    if (method === 'POST' && /^issues\/\d+\/assignees$/.test(p)) {
      expect(agent).toBe(true);
      if (failure) throw new WorkflowError('GITHUB_API', 'GitHub menolak (403).', 403);
      const issue = issues.get(Number(p.split('/')[1])); issue.assignees = [user('copilot-swe-agent[bot]', 'Bot')]; return issue;
    }
    if (method === 'GET' && /^pulls\/\d+$/.test(p)) return pulls.get(Number(p.split('/')[1]));
    if (method === 'GET' && p.startsWith('actions/workflows/')) return { workflow_runs: runs };
    if (method === 'GET' && p.startsWith('actions/runs/')) return { jobs };
    if (method === 'POST' && p.endsWith('/copilot-code-review')) { expect(agent).toBe(true); return { state: 'PENDING', node_id: 'request' }; }
    if (method === 'GET' && p.startsWith('releases?')) return releases;
    if (method === 'GET' && p.startsWith('commits/')) return { sha: sha('c') };
    throw new Error(`Unexpected fixture request: ${method} ${p}`);
  });
  const list = vi.fn(async path => {
    const p = path.replace(`repos/${repository}/`, '');
    if (p === 'issues/1/comments') return comments;
    if (/^issues\/\d+\/timeline$/.test(p)) return timelines.get(Number(p.split('/')[1])) ?? [];
    if (/^pulls\/\d+\/reviews$/.test(p)) return reviews.get(Number(p.split('/')[1])) ?? [];
    if (/^pulls\/\d+\/files$/.test(p)) return pulls.get(Number(p.split('/')[1])).files;
    throw new Error(`Unexpected fixture list: ${p}`);
  });
  const pipeline = createPipeline({ client: { request, list }, repository, clock: () => new Date('2026-10-15T12:00:00Z'), logger: vi.fn() });
  const run = (action = 'advance', event = {}) => pipeline.run({ issue: 1, action, actor: 'lead', base, event });
  const attach = (id, pr, approval = []) => {
    pulls.set(pr.number, pr); reviews.set(pr.number, approval);
    timelines.set(id, [{ event: 'cross-referenced', source: { issue: { number: pr.number, repository_url: `https://api.github.com/repos/${repository}`, pull_request: { url: 'present' } } } }]);
  };
  const design = () => attach(101, pull(31, sha('a'), [{ filename: 'docs/adr/0001-example.md' }]), [{ ...human, commit_id: sha('a') }]);
  const implementation = () => attach(102, pull(42, sha('b'), [{ filename: 'src/routes/claims.js' }, { filename: 'tests/unit/api.test.js' }, { filename: 'docs/api.md' }]));
  const passCi = (head = sha('b')) => { runs = [{ id: 50, head_sha: head, path: '.github/workflows/ci.yml', event: 'pull_request', status: 'completed', conclusion: 'success', pull_requests: [{ number: 42 }] }]; };
  const aiReview = () => reviews.set(42, [{ id: 10, user: user('copilot-pull-request-reviewer[bot]', 'Bot'), state: 'COMMENTED', commit_id: sha('b'), submitted_at: '2026-10-15T12:00:00Z' }]);
  return { run, request, issues, pulls, reviews, design, implementation, passCi, aiReview, jobs, comments, failAssignment: value => { failure = value; }, publish: () => { releases = [{ draft: false, tag_name: 'v1.0', author: user('lead') }]; } };
}
async function prepared() {
  const f = fixture(); await f.run('start'); f.design(); await f.run(); f.implementation(); f.passCi(); return f;
}
it('connects plan, approvals, CI, AI review, human release and follow-up without merging', async () => {
  const f = fixture(); expect((await f.run('start')).phase).toBe('planning'); await f.run('start');
  expect(f.request.mock.calls.filter(([, p]) => p.endsWith('/assignees'))).toHaveLength(1);
  f.design(); expect((await f.run()).phase).toBe('implementing'); f.implementation();
  expect((await f.run()).phase).toBe('checks'); f.passCi(); expect((await f.run()).phase).toBe('review'); await f.run();
  expect(f.request.mock.calls.filter(([, p]) => p.endsWith('/copilot-code-review'))).toHaveLength(1);
  f.aiReview(); expect((await f.run()).phase).toBe('review'); f.reviews.get(42).push(human);
  expect((await f.run()).phase).toBe('release-ready');
  Object.assign(f.pulls.get(42), { merged: true, state: 'closed', merged_by: user('lead'), merge_commit_sha: sha('c') });
  expect((await f.run()).phase).toBe('merged');
  expect((await f.run('advance', { action: 'published', release: { draft: false, tag_name: 'v1.0' }, sender: user('lead') })).phase).toBe('released');
  Object.assign(f.issues.get(103), { state: 'closed', closed_by: user('lead') }); expect((await f.run()).phase).toBe('completed');
  expect(f.request.mock.calls.some(([m, p]) => m !== 'GET' && /\/merge$|\/releases$|\/deployments$/.test(p))).toBe(false);
});
it('requires approval on the latest plan and rejects app edits in a design PR', async () => {
  const f = fixture(); await f.run('start'); f.design(); f.pulls.get(31).head.sha = sha('d');
  expect((await f.run()).phase).toBe('plan-review'); expect(f.issues.has(102)).toBe(false);
  f.pulls.get(31).files = [{ filename: 'src/db.js' }]; await expect(f.run()).rejects.toMatchObject({ code: 'PLAN_SCOPE' });
});
it('invalidates a ready handoff when human approval is dismissed', async () => {
  const f = await prepared(); f.aiReview(); f.reviews.get(42).push(human); expect((await f.run()).phase).toBe('release-ready');
  f.reviews.get(42).push({ ...human, id: 21, state: 'DISMISSED' }); expect((await f.run()).phase).toBe('review');
});
it('uses an existing current Copilot review without starting another one', async () => {
  const f = await prepared(); f.aiReview(); f.reviews.get(42).push(human); expect((await f.run()).phase).toBe('release-ready');
  expect(f.request.mock.calls.filter(([, p]) => p.endsWith('/copilot-code-review'))).toHaveLength(0);
});
it('requires explicit resume after assignment failure and does not duplicate phase issues', async () => {
  const f = fixture(); f.failAssignment(true); await expect(f.run('start')).rejects.toMatchObject({ status: 403 });
  expect((await f.run()).phase).toBe('blocked'); expect(f.issues.size).toBe(2); f.failAssignment(false);
  expect((await f.run('resume')).phase).toBe('planning'); expect(f.issues.size).toBe(2);
});
it('requires successful CI at the current commit with all three jobs', async () => {
  const f = await prepared(); f.passCi(sha('a')); expect((await f.run()).phase).toBe('checks');
  f.passCi(); f.jobs[2].conclusion = 'failure'; expect((await f.run()).phase).toBe('checks');
  expect(f.request.mock.calls.filter(([, p]) => p.endsWith('/copilot-code-review'))).toHaveLength(0);
});
it('returns to checks when a new implementation commit arrives', async () => {
  const f = await prepared(); await f.run(); f.aiReview(); f.reviews.get(42).push(human); await f.run();
  f.pulls.get(42).head.sha = sha('e'); expect((await f.run()).phase).toBe('checks');
});
it.each(['main', 'master', 'demo/../main', 'demo/x.lock', 'demo/'])('rejects unsafe base %s', value => expect(() => validateBaseBranch(value)).toThrow(WorkflowError));
it.each(['0', '01', '2.5', '9007199254740992'])('rejects invalid issue %s', value => expect(() => issueNumber(value)).toThrow(WorkflowError));
it('does not trust a human comment imitating the bot state marker', () => {
  const state = { version: 1, issue: 1, base, phase: 'release-ready', reviewCount: 0 };
  expect(loadState([{ id: 99, body: stateComment(state, repository), user: user('lead') }], 1)).toBeNull();
});
it('keeps workflow files, renames and hidden paths outside implementation scope', () => {
  expect(allowedFiles([{ filename: 'src/claims.js', previous_filename: '.github/hooks/guardrails.json' }])).toBe(false);
  expect(allowedFiles([{ filename: '.github/workflows/ci.yml' }])).toBe(false);
  expect(allowedFiles([{ filename: 'src/.hidden' }])).toBe(false);
});
it('rejects bot approvals, self approvals and human requests for changes', async () => {
  const pr = pull(42, sha('b'), []);
  expect(await hasHumanApproval(pr, [{ ...human, user: pr.user }], async () => 'write')).toBe(false);
  expect(await hasHumanApproval({ ...pr, user: human.user }, [human], async () => 'write')).toBe(false);
  expect(await hasHumanApproval(pr, [human, { ...human, id: 21, user: user('other'), state: 'CHANGES_REQUESTED' }], async () => 'write')).toBe(false);
});
it('surfaces API denial rather than a success-shaped fallback', async () => {
  const client = createGithubClient({ token: 'test-token', agentToken: 'test-agent-token', fetcher: vi.fn(async () => ({ ok: false, status: 403 })) });
  await expect(client.request('POST', `repos/${repository}/pulls/42/copilot-code-review`, {}, true)).rejects.toMatchObject({ status: 403 });
});

it('recovers a published release when a notification was missed', async () => {
  const f = await prepared(); await f.run(); f.aiReview(); f.reviews.get(42).push(human); await f.run();
  Object.assign(f.pulls.get(42), { merged: true, state: 'closed', merged_by: user('lead'), merge_commit_sha: sha('c') });
  expect((await f.run()).phase).toBe('merged'); f.publish();
  expect((await f.run()).phase).toBe('released'); expect(f.issues.has(103)).toBe(true);
});

it('does not reassign a completed phase when its assignee is removed', async () => {
  const f=fixture();await f.run('start');f.issues.get(101).assignees=[];
  await f.run();expect(f.request.mock.calls.filter(([,p])=>p.endsWith('/assignees'))).toHaveLength(1);
});

it('rejects malformed persisted state rather than treating it as a new workflow', () => {
 const body='<!-- agentic-sdlc-state:v1 -->\n'+String.fromCharCode(96).repeat(3)+'json\nnull\n'+String.fromCharCode(96).repeat(3);
 expect(()=>loadState([{id:99,body,user:user('github-actions[bot]','Bot')}],1)).toThrow(WorkflowError);
});

it('does not retry a failed network request or hide its uncertain outcome', async () => {
 const fetcher=vi.fn(async()=>{throw new TypeError('fetch failed');});
 const client=createGithubClient({token:'test-token',agentToken:'test-agent-token',fetcher});
 await expect(client.request('POST', 'repos/demo/workshop/issues', {}, true)).rejects.toMatchObject({code:'GITHUB_NETWORK'});
 expect(fetcher).toHaveBeenCalledTimes(1);
});
