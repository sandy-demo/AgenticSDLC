import { readdirSync } from 'node:fs';
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
    await expect(page.locator('figure[data-diagram] img')).toBeVisible();
    await expect(page.getByRole('link', { name: /Perbesar S04-before-annotated/ }).first()).toBeVisible();
  });
});
