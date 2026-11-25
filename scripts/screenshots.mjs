import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config, root, serve } from './demo-runtime.mjs';
import { refreshEvidence } from './workshop-evidence.mjs';

const scenarios = JSON.parse(readFileSync(new URL('./scenarios.json', import.meta.url), 'utf8'));
const [id = 'S04', ...extra] = process.argv.slice(2);
if (extra.length || (id !== 'all' && !Object.hasOwn(scenarios, id))) throw new Error('Gunakan S01–S15 atau all.');

const out = join(root, config.screenshotDir);
mkdirSync(out, { recursive: true });
const chosen = id === 'all' ? Object.entries(scenarios) : [[id, scenarios[id]]];
const selected = chosen.filter(([, scenario]) => scenario.app);
const failures = [];

if (selected.length) {
  const browser = await chromium.launch();
  try {
    for (const [scenarioId, { app }] of selected) {
      for (const [index, ref] of [config.baseline, app.after].entries()) {
        if (!ref) continue;
        const name = `${scenarioId}-${index ? 'after' : 'before'}.png`;
        let context;
        let server;
        try {
          server = await serve(ref);
          context = await browser.newContext({ viewport: config.viewport, colorScheme: config.darkMode ? 'dark' : 'light' });
          const page = await context.newPage();
          await page.goto(`${server.url}${app.page}`);
          await page.locator('#items li').first().waitFor();
          if (app.exercise === 'future-date') {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            const tomorrow = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
              .map((n) => String(n).padStart(2, '0')).join('-');
            await page.locator('#title').fill('Taksi bandara');
            await page.locator('#amount').fill('250000');
            await page.locator('#claimDate').fill(tomorrow);
            const category = page.locator('#category');
            if (await category.count()) await category.selectOption('Travel');
            const result = page.waitForResponse((response) =>
              response.url() === `${server.url}/claims` && response.request().method() === 'POST');
            await page.locator('#submit').click();
            const response = await result;
            if (response.status() !== (index ? 400 : 201)) throw new Error(`HTTP ${response.status()} tidak sesuai latihan.`);
            if (index && (await response.json()).code !== 'CLAIM_DATE_FUTURE') throw new Error('Kode error S04 salah.');
          }
          const target = page.locator(app.checks[index]);
          await target.waitFor({ state: 'visible', timeout: 5000 });
          if (scenarioId === 'S02' && index === 0 && await page.locator('#category').count()) {
            throw new Error('Form baseline seharusnya tidak memuat kategori.');
          }
          await page.screenshot({ path: join(out, name), fullPage: false, animations: 'disabled' });
          console.log(`Disimpan: ${name} (${ref})`);
        } catch (error) {
          failures.push({ name, reason: error.message.split(/\r?\n/)[0] });
          console.error(`${name}: ${error.message}`);
        } finally {
          await context?.close();
          if (server) { server.stop(); await server.completed; }
        }
      }
    }
  } finally {
    await browser.close();
  }
} else {
  console.log(`${id}: tidak ada layar lokal otomatis. Ikuti Cara demo untuk bukti GitHub atau VS Code.`);
}

refreshEvidence(scenarios, out, failures);
if (failures.length) process.exitCode = 1;
