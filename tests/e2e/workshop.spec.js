import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

const site = new URL('../../site/', import.meta.url);
const paths = readdirSync(site, { recursive: true }).filter((file) => file.endsWith('.html')).map((file) => file.replaceAll('\\', '/'));

test('semua halaman bisa dibaca offline tanpa overflow atau error', async ({ context, page }) => {
  const unexpected = [];
  await context.route(/^https?:/, (route) => {
    unexpected.push(route.request().url());
    return route.abort();
  });
  page.on('pageerror', (error) => unexpected.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') unexpected.push(message.text()); });
  for (const path of paths) {
    await page.goto(new URL(path, site).href);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    if (/^scenarios\/S\d{2}\.html$/.test(path)) {
      await expect(page.locator('figure#solution-flow')).toBeVisible();
      await expect(page.locator('figure#interaction-flow')).toBeVisible();
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} @ ${width}px`).toBe(true);
    }
    expect(await page.locator('img[src]').evaluateAll((images) =>
      images.filter((img) => img.complete && !img.naturalWidth).map((img) => img.src)), path).toEqual([]);
  }
  expect(unexpected).toEqual([]);
});

test('filter, tab keyboard, pembanding, zoom, dan capstone bekerja tanpa internet', async ({ context, page }) => {
  await context.route(/^https?:/, (route) => route.abort());
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(new URL('scenarios/index.html', site).href);
  await page.getByRole('searchbox').fill('tanggal besok');
  await expect(page.locator('[data-scenario]:visible')).toHaveCount(1);
  await page.getByRole('searchbox').clear();
  await page.getByRole('checkbox', { name: /organisasi/ }).check();
  await expect(page.locator('[data-scenario]:visible')).toHaveCount(2);

  await page.goto(new URL('scenarios/S04.html', site).href);
  await page.getByRole('tab', { name: 'Bisnis' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Teknis' })).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: 'Teknis' })).toBeVisible();
  const slider = page.getByRole('slider');
  await slider.focus();
  await page.keyboard.press('End');
  await expect(slider).toHaveAttribute('aria-valuetext', '100% bagian sebelum');
  const zoom = page.getByRole('link', { name: /Perbesar S04-after-annotated/ }).first();
  await zoom.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(zoom).toBeFocused();

  await page.goto(new URL('capstone.html', site).href);
  await page.getByRole('button', { name: /Putuskan merge/ }).click();
  await expect(page.locator('[data-cap-panel]:visible')).toContainText('Bima.');
  await expect(page.locator('[data-cap-diagram] .node[data-highlight]')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator('[data-diagram="D12"] .diagram-narrow li[data-highlight]')).toContainText('Bima memutuskan merge.');
});

test.describe('tanpa JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('materi, diagram dan bukti tetap dapat dibaca', async ({ page }) => {
    await page.goto(new URL('scenarios/S04.html', site).href);
    await expect(page.getByRole('heading', { name: 'Masalah yang dihadapi' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Masalah pada baseline' })).toBeVisible();
    await expect(page.locator('figure#solution-flow')).toBeVisible();
    const diagram = page.locator('#solution-details');
    await expect(diagram.locator('img')).toBeHidden();
    await diagram.locator('summary').first().press('Enter');
    await expect(diagram.locator('img')).toBeVisible();
    await expect(page.getByRole('link', { name: /Perbesar S04-before-annotated/ }).first()).toBeVisible();
  });

  test('workflow utuh bisa dibaca dari halaman awal tanpa JavaScript', async ({ page }) => {
    const evidence = JSON.parse(readFileSync(new URL('../../docs/sdlc/evidence.json', import.meta.url), 'utf8'));
    await page.goto(new URL('index.html', site).href);
    await page.getByRole('link', { name: 'Workflow utuh', exact: true }).click();
    await expect(page).toHaveURL(/sdlc\.html$/);
    await expect(page.getByRole('heading', { name: 'Satu tiket, dari rencana sampai tindak lanjut' })).toBeVisible();
    await expect(page.locator('#interaction-flow')).toBeVisible();
    await page.getByRole('link', { name: 'Cara mulai dari satu tiket' }).click();
    await expect(page).toHaveURL(/#mulai$/);
    await expect(page.locator('#mulai')).toContainText('action=start');
    await expect(page.locator('#mulai')).toContainText('release-ready');
    await page.getByRole('link', { name: 'Cek hasil', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Cek hasil', exact: true })).toContainText('API GitHub fiktif');
    await expect(page.locator('#live-evidence')).toContainText('Alur Copilot live yang masih pending');
    await expect(page.locator('#evidence .gallery [data-shot]')).toHaveCount(evidence.gallery.length);
  });

  test('diagram S02 menampilkan aktor, lokasi, dan balasan di desktop maupun HP', async ({ page }) => {
    await page.goto(new URL('scenarios/S02.html', site).href);
    const diagram = page.locator('#interaction-flow');
    const actors = diagram.locator('.sequence-actors');
    await expect(actors.locator('li').filter({ hasText: 'Karyawan' })).toContainText('Browser lokal');
    await expect(actors.locator('li').filter({ hasText: 'SQLite' })).toContainText('Di proses aplikasi');
    const saveRequest = diagram.locator('.sequence-event').filter({ hasText: 'POST /claims: kirim kategori Travel' });
    const readReply = diagram.locator('.sequence-event').filter({ hasText: 'Balas 200 dengan kategori Travel' });
    await expect(saveRequest).toBeVisible();
    await expect(readReply.locator('.sequence-line')).toHaveCSS('border-block-start-style', 'dashed');

    await page.setViewportSize({ width: 390, height: 900 });
    await expect(actors).toBeHidden();
    await expect(saveRequest.locator('.sequence-route')).toContainText(/Karyawan.*Browser lokal.*API Express.*Aplikasi lokal/s);
    await expect(readReply.locator('.sequence-route')).toContainText(/API Express.*Developer.*Terminal/s);
    await expect(readReply).toBeVisible();
  });

  test('panduan review dan tautan PR bisa dipakai tanpa JavaScript', async ({ page }) => {
    const destination = 'https://github.com/sandy-demo/AgenticSDLC/pull/25/files';
    await page.route(destination, (route) => route.fulfill({ contentType: 'text/plain', body: 'Files changed' }));
    await page.goto(new URL('scenarios/S03.html', site).href);

    const reference = page.getByRole('link', { name: 'Lihat file yang berubah di draft PR #25', exact: true });
    await expect(reference.locator('xpath=ancestor::li[1]').locator('[data-copy]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Lihat hasil CI untuk draft PR #25', exact: true })
      .locator('xpath=ancestor::li[1]').locator('pre')).toContainText('npm test -- comments.test.js');
    await reference.click();
    await expect(page).toHaveURL(destination);

    await page.goto(new URL('scenarios/S03.html', site).href);
    await page.getByRole('link', { name: 'Ikuti alur GitHub dari tiket sampai review' }).click();
    await expect(page).toHaveURL(/setup.html#issue-to-review$/);
    const walkthrough = page.locator('#issue-to-review');
    await expect(walkthrough).toContainText('Issues → New issue');
    await expect(walkthrough).toContainText('Assignees → Copilot');
    await expect(walkthrough).toContainText('Submit review');
  });

  test('hasil belajar, petunjuk live dan alur ringkas dapat dibuka di 320px', async ({ page }) => {
    const root = new URL('../../', import.meta.url);
    const fixture = mkdtempSync(join(tmpdir(), 'workshop-renderer-'));
    try {
      for (const path of ['scripts', 'src/logger.js', 'package.json', 'docs/metrics.json', 'docs/sdlc/evidence.json', 'docs/screenshots', 'site/assets/diagrams', 'site/assets/workshop.css']) {
        cpSync(new URL(path, root), join(fixture, path), { recursive: true });
      }
      symlinkSync(fileURLToPath(new URL('node_modules', root)), join(fixture, 'node_modules'), 'junction');
      const input = join(fixture, 'scripts', 'scenarios.json');
      const scenarios = JSON.parse(readFileSync(input, 'utf8'));
      const completion = scenarios.S04.guide.completion;
      const flow = [
        { actor: 'Bima', action: 'Tulis kriteria', result: 'Issue siap <ditinjau>' },
        { actor: 'Copilot', action: 'Siapkan perubahan', result: 'Draft PR' },
        { actor: 'CI', action: 'Jalankan tes', result: 'Status pemeriksaan' },
      ];
      scenarios.S04.guide.flow = flow;
      delete scenarios.S01.guide.flow;
      writeFileSync(input, JSON.stringify(scenarios));
      execFileSync(process.execPath, [join(fixture, 'scripts', 'site', 'build.mjs')]);

      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(pathToFileURL(join(fixture, 'site', 'scenarios', 'S04.html')).href);
      await page.getByRole('link', { name: 'Cek hasil', exact: true }).click();
      await expect(page).toHaveURL(/#learning-check$/);
      const learning = page.getByRole('region', { name: 'Cek hasil' });
      await expect(learning).toContainText(completion.learningCheck);
      await expect(learning.locator('[data-shot]')).toHaveAttribute('href', `../assets/screenshots/${completion.verifiedLearningEvidence}`);
      await expect(page.locator('#practice li[value="2"] [data-shot]')).toHaveAttribute('href', /S04-after-annotated\.png$/);
      await expect(page.getByRole('heading', { name: /Cek selesai latihan|Cara merekam hasil live/ })).toHaveCount(0);

      await page.getByRole('link', { name: 'Langkah live', exact: true }).click();
      await expect(page).toHaveURL(/#live-steps$/);
      const live = page.getByRole('region', { name: 'Langkah live' });
      await expect(live.getByText(completion.livePrerequisite)).toBeVisible();
      const pendingTargets = completion.targets.filter(({ name }) => !existsSync(join(fixture, 'docs', 'screenshots', name)));
      await expect(live.getByRole('listitem')).toHaveCount(pendingTargets.length);
      for (const { name, instruction } of pendingTargets) {
        await expect(live.getByRole('listitem').filter({ hasText: name })).toContainText(instruction);
      }
      await expect(live.locator('pre, [data-copy]')).toHaveCount(0);

      for (const { actor, action, result } of flow) {
        const summary = page.locator('#solution-flow summary').filter({ hasText: action });
        await expect(summary).toContainText(actor);
        await summary.press('Enter');
        await expect(page.getByText(`Hasil: ${result}`, { exact: true })).toBeVisible();
      }
      await page.locator('#solution-details > summary').press('Enter');
      await expect(page.locator('[data-diagram="D6"] .diagram-narrow')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

      await page.goto(pathToFileURL(join(fixture, 'site', 'scenarios', 'S01.html')).href);
      await expect(page.getByRole('heading', { name: 'Alur kerja ringkas' })).toHaveCount(0);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});


test('bukti workflow memakai gallery lokal, sumber yang jelas, dan zoom keyboard', async ({ context, page }) => {
  await context.route(/^https?:/, (route) => route.abort());
  const evidence = JSON.parse(readFileSync(new URL('../../docs/sdlc/evidence.json', import.meta.url), 'utf8'));
  const name = 'SDLC-03-tes-lokal-annotated.png';
  const image = evidence.images.find((item) => item.name === name);
  await page.goto(new URL('sdlc.html', site).href);
  await page.locator('.actions').getByRole('link', { name: 'Bukti dan sumber', exact: true }).click();
  const gallery = page.locator('#evidence .gallery');
  await expect(gallery.locator('[data-shot]')).toHaveCount(evidence.gallery.length);
  await expect(gallery).toContainText('bukan screenshot terminal/GitHub');
  const zoom = gallery.getByRole('link', { name: /Perbesar SDLC-03-tes-lokal-annotated\.png$/ });
  await zoom.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveJSProperty('naturalWidth', image.width);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(zoom).toBeFocused();
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(zoom).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const live = gallery.locator('figure').filter({ has: page.locator('img[src$="SDLC-04-github-ci-annotated.png"]') });
  await expect(live.getByRole('link', { name: 'Sumber GitHub', exact: true })).toHaveAttribute('href', evidence.githubCi.url);
  await expect(page.locator('#github-check')).toContainText('45 tes lulus');
  await expect(page.locator('#live-evidence')).toContainText('Alur Copilot live yang masih pending');
  const githubZoom = live.getByRole('link', { name: /Perbesar SDLC-04-github-ci-annotated\.png$/ });
  await githubZoom.click();
  await expect(page.getByRole('dialog').locator('img')).toHaveJSProperty('naturalWidth', 1440);
  await page.keyboard.press('Escape');
  await expect(githubZoom).toBeFocused();
});
