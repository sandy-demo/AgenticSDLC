import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const directory = new URL('../../site/assets/diagrams/', import.meta.url);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.route('**/*', (route) => route.abort());
  await page.setContent('<!doctype html><html lang="id"><body></body></html>');
  await page.addScriptTag({ content: readFileSync(new URL('../../node_modules/mermaid/dist/mermaid.min.js', import.meta.url), 'utf8') });
  await page.evaluate(() => window.mermaid.initialize({
    startOnLoad: false, securityLevel: 'strict', htmlLabels: false,
    theme: 'base',
    themeVariables: {
      fontFamily: 'system-ui, sans-serif', fontSize: '17px', background: '#ffffff',
      primaryColor: '#f1f5f9', primaryBorderColor: '#52647a', primaryTextColor: '#15263a',
      lineColor: '#52647a', edgeLabelBackground: '#ffffff',
      actorBkg: '#e5eeff', actorBorder: '#315699', actorTextColor: '#132d5b',
      noteBkgColor: '#fff3d4', noteTextColor: '#4d330f',
    },
    flowchart: { nodeSpacing: 30, rankSpacing: 42, wrappingWidth: 180 },
    sequence: { width: 113, actorMargin: 30, useMaxWidth: false },
  }));
  for (let index = 1; index <= 13; index += 1) {
    const id = `D${index}`;
    const source = readFileSync(new URL(`${id}.mmd`, directory), 'utf8');
    const svg = await page.evaluate(async ({ id, source }) => (await window.mermaid.render(id, source)).svg, { id, source });
    writeFileSync(new URL(`${id}.svg`, directory), `${svg}\n`);
  }
  console.log('13 diagram Mermaid diekspor sebagai SVG untuk penggunaan offline.');
} finally {
  await browser.close();
}
