import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './demo-runtime.mjs';

export const workshopOrder = ['S04', 'S05', 'S07', 'S08', 'S09', 'S12', 'S13', 'S14', 'S10', 'S11', 'S15', 'S01', 'S02', 'S03', 'S06'];
export const setupShots = ['setup-copilot-pat.png', 'setup-copilot-secret.png'];

export function evidenceImages(entry) {
  return { local: entry?.localDryRun?.images ?? [], github: [...(entry?.preflight?.images ?? []), ...(entry?.cloudEvidence?.images ?? [])] };
}

export function shotNames(scenario, entry) {
  const { local, github } = evidenceImages(entry);
  return [...new Set([...scenario.shots, ...local.map(({ name }) => name), ...github.map(({ name }) => name)])];
}

export function missingStatus(id) {
  if (id === 'S06') return 'manual/org';
  return /^S0[123]$/.test(id) ? 'manual pending' : 'missing';
}

export function pngDimensions(bytes) {
  if (!(bytes?.length > 20 * 1024) || bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  return width && height ? { width, height } : null;
}

export function markdownCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function refreshEvidence(scenarios, out, errors = []) {
  const metrics = JSON.parse(readFileSync(join(root, 'docs', 'metrics.json'), 'utf8'));
  const workflowPath = join(root, 'docs', 'sdlc', 'evidence.json');
  const workflow = existsSync(workflowPath) ? JSON.parse(readFileSync(workflowPath, 'utf8')) : null;
  const workflowSection = workflow ? `

## Workflow end-to-end

Buka [panduan workflow](../site/sdlc.html#evidence) dan [data sumber](sdlc/evidence.json).
Tes lokal pada ${workflow.validation.executedAt}: ${workflow.validation.passed}/${workflow.validation.total} tes unit lulus,
termasuk ${workflow.validation.controllerPassed} tes controller dengan respons API GitHub fiktif. Bukan run cloud.

| Bukti | Sumber dan batas |
|---|---|
${workflow.images.map(image=>`| [${image.name}](screenshots/${image.name}) | ${markdownCell(image.source)} |`).join('\n')}

### Masih perlu bukti GitHub

${workflow.pendingLive.map(item=>`- **${markdownCell(item.where)}:** ${markdownCell(item.instruction)} Target: \`${item.name}\`.`).join('\n')}

Gambar panduan bukan layar Actions; output Vitest yang dirender bukan screenshot terminal.
GitHub Release bukan deployment. Workflow belum dipublikasikan atau diaktifkan.
` : '';
  const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  const available = (name) => {
    const path = join(out, name);
    return existsSync(path) && pngDimensions(readFileSync(path));
  };
  const missingByScenario = Object.fromEntries(workshopOrder.map((id) =>
    [id, scenarios[id].shots.filter((name) => !available(name))]));
  const missing = Object.values(missingByScenario).flat();
  const measured = (id) => {
    const entry = metrics[id];
    const run = entry?.runs?.at(-1);
    const local = entry?.localDryRun?.durationSeconds;
    return [
      Number.isFinite(local) ? `${number.format(local)} dtk lokal` : null,
      Number.isFinite(run?.minutesToPr) ? `${number.format(run.minutesToPr)} menit ke draft` : null,
      Number.isFinite(run?.reviewerComments) ? `${run.reviewerComments} komentar review` : null,
      Number.isFinite(run?.aiCredits) ? `${number.format(run.aiCredits)} AI credits` : null,
      entry?.localCoverage ? `coverage ${entry.localCoverage.before}% → ${entry.localCoverage.after}%` : null,
      Number.isInteger(entry?.preflight?.openAlerts) ? `${entry.preflight.openAlerts} alert awal` : null,
    ].filter(Boolean).join(' · ') || 'Belum diukur';
  };
  const rows = workshopOrder.map((id) => {
    const scenario = scenarios[id];
    const images = shotNames(scenario, metrics[id]).filter(available).map((name) => `[${name}](screenshots/${name})`);
    const status = `${metrics[id]?.localDryRun ? 'Lokal dicek; ' : ''}${scenario.guide?.live ?? 'Live belum terukur'}`;
    return `| ${id} | ${markdownCell(status)} | ${images.join(' · ') || 'Belum direkam'} | ${measured(id)} |`;
  });
  const incomplete = (status) => workshopOrder.filter((id) => missingStatus(id) === status).flatMap((id) => missingByScenario[id]);
  writeFileSync(join(out, '_missing.json'), `${JSON.stringify({
    missing, errors, manualPending: incomplete('manual pending'), manualOrg: incomplete('manual/org'), workflowPending: workflow?.pendingLive ?? [],
  }, null, 2)}
`);
  const setup = setupShots.filter(available).map((name) => `[${name}](screenshots/${name})`).join(' · ');
  writeFileSync(join(root, 'docs', 'BEFORE-AFTER.md'), `# Bukti before dan after

Buka [panduan HTML](../site/index.html#urutan). Foto aplikasi melihat UI nyata dengan data fiktif;
output tes yang dirender bukan layar produk. Foto GitHub membuktikan keadaan yang terlihat saja.

${setup ? `Persiapan PAT/secret (tanpa nilai token): ${setup}

` : ''}| Skenario | Status | Bukti | Metrik terverifikasi |
|---|---|---|---|
${rows.join('\n')}

Baca [metrik per skenario](metrics.json) dan [layar yang belum direkam](screenshots/_missing.json).
Angka yang belum diukur bukan nol; AI credits bukan premium requests atau tagihan.
${workflowSection}`);
}
