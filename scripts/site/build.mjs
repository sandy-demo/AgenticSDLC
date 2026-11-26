import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../demo-runtime.mjs';
import { sdlcStages } from '../sdlc-workflow.mjs';
import { evidenceImages, missingStatus, pngDimensions, setupShots, shotNames, workshopOrder } from '../workshop-evidence.mjs';
import { diagramNotes, faq, glossary, timeline, roles } from './content.mjs';

const site = join(root, 'site');
let pageCount = 0;
const read = (file) => readFileSync(join(root, file), 'utf8');
const scenarios = JSON.parse(read('scripts/scenarios.json'));
const metrics = JSON.parse(read('docs/metrics.json'));
const workflowEvidence = JSON.parse(read('docs/sdlc/evidence.json'));
const ids = Object.keys(scenarios);
const nodeRange = JSON.parse(read('package.json')).engines.node;
const levels = ['Inner loop', 'Delegasi asinkron', 'Tim virtual', 'Continuous AI', 'Governance dan capstone'];
const levelOf = (id) => [3, 7, 11, 13, 15].findIndex((edge) => Number(id.slice(1)) <= edge) + 1;
const escape = (input) => String(input).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const link = (href, text, attrs = '') => `<a href="${escape(href)}"${attrs ? ` ${attrs}` : ''}>${escape(text)}</a>`;
const badge = (text) => `<span class="badge">${escape(text)}</span>`;
const snippet = (text, id = '') => `<pre><code translate="no"${id ? ` id="${id}"` : ''}>${escape(text)}</code></pre>`;
const note = (text) => `<p class="note">${text}</p>`;
const sections = [
  ['index.html', 'Mulai'], ['sdlc.html', 'Workflow utuh'], ['scenarios/index.html', 'Skenario'], ['architecture.html', 'Arsitektur'],
  ['capstone.html', 'Capstone'], ['governance.html', 'Governance'], ['setup.html', 'Cara demo'],
];
const repo = 'https://github.com/sandy-demo/AgenticSDLC';
const evidenceRepos = [repo, 'https://github.com/sandy-demo/expense-app-full'];
function evidenceUrl(value) {
  if (typeof value !== 'string') return null;
  const url = URL.parse(value);
  if (url?.protocol !== 'https:' || url.username || url.password) return null;
  const destination = url.origin + url.pathname;
  return evidenceRepos.some((base) => destination === base || destination.startsWith(`${base}/`))
    ? url.href : null;
}
const pngInfo = new Map();
const allEvidence = Object.fromEntries(ids.map((id) => [id, evidenceImages(metrics[id])]));
const imageDetails = new Map([...Object.values(allEvidence).flatMap(({ local, github }) =>
  [...local, ...github].map((image) => [image.name, image])), ...workflowEvidence.images.map((image) => [image.name, image])]);
const knownShots = [...new Set([...[...setupShots, ...ids.flatMap((id) => [
  ...shotNames(scenarios[id], metrics[id]), scenarios[id].guide.completion?.verifiedLearningEvidence,
].filter(Boolean))], ...workflowEvidence.images.map(({ name }) => name)])];

for (const directory of ['scenarios', 'assets/screenshots', 'assets/vendor', 'assets/data']) {
  mkdirSync(join(site, directory), { recursive: true });
}
for (const name of knownShots) {
  if (!/^[A-Za-z0-9-]+\.png$/.test(name)) throw new Error(`Nama bukti tidak valid: ${name}`);
  const file = join(root, 'docs', 'screenshots', name);
  if (!existsSync(file)) continue;
  const bytes = readFileSync(file);
  const dimensions = pngDimensions(bytes);
  if (!dimensions) throw new Error(`Bukti PNG tidak valid atau di bawah 20 KiB: ${name}`);
  pngInfo.set(name, dimensions);
  copyFileSync(file, join(site, 'assets', 'screenshots', name));
}
const chartBundle = read('node_modules/chart.js/dist/chart.umd.min.js').replace(/\n\/\/# sourceMappingURL=[^\n]*\n?$/, '\n');
writeFileSync(join(site, 'assets', 'vendor', 'chart.umd.min.js'), chartBundle);
copyFileSync(join(root, 'node_modules', 'chart.js', 'LICENSE.md'), join(site, 'assets', 'vendor', 'Chart.js-LICENSE.md'));
copyFileSync(join(root, 'node_modules', '@kurkle', 'color', 'LICENSE.md'), join(site, 'assets', 'vendor', 'kurkle-color-LICENSE.md'));
const missingByScenario = Object.fromEntries(ids.map((id) =>
  [id, scenarios[id].shots.filter((name) => !pngInfo.has(name))]));
writeFileSync(join(site, 'assets', 'data', 'scenarios.json'), `${JSON.stringify({
  scenarios: Object.fromEntries(ids.map((id) => [id, { ...scenarios[id], level: levelOf(id),
    screenshotStatus: Object.fromEntries(shotNames(scenarios[id], metrics[id]).map((name) =>
      [name, pngInfo.has(name) ? 'available' : missingStatus(id)])) }])),
  metrics,
  dryRun: {
    order: workshopOrder,
    scenarios: Object.fromEntries(workshopOrder.map((id) => [id, {
      live: scenarios[id].guide.live,
      localDurationSeconds: metrics[id]?.localDryRun?.durationSeconds ?? null,
      missing: missingByScenario[id],
      screenshots: allEvidence[id].local.map(({ name }) => name).filter((name) => pngInfo.has(name)),
      cloudScreenshots: allEvidence[id].github.map(({ name }) => name).filter((name) => pngInfo.has(name)),
    }])),
  },
  setupEvidence: setupShots.filter((name) => pngInfo.has(name)).map((name) => ({ name, ...pngInfo.get(name) })),
  sdlcEvidence: workflowEvidence,
}, null, 2)}\n`);

function document(file, title, body, { charts = false } = {}) {
  pageCount += 1;
  const up = file.includes('/') ? '../' : '';
  const group = up ? 'scenarios/index.html' : file;
  const markup = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#15263a">
  <title>${escape(title)} | Agentic SDLC</title>
  <link rel="icon" href="${up}assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${up}assets/workshop.css">
  ${charts ? `<script defer src="${up}assets/vendor/chart.umd.min.js"></script>` : ''}
  <script defer src="${up}js/app.js"></script>
</head>
<body>
<a class="skip" href="#main">Langsung ke isi</a>
<header class="bar"><div class="wrap">
  <a class="brand" href="${up}index.html"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="6" fill="#3264ce"/><path d="M8 16h6l3-6 3 12 3-6h2" fill="none" stroke="#fff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg> Agentic SDLC</a>
  <nav aria-label="Navigasi workshop">${sections.map(([path, label]) => link(up + path, label,
    path === group ? `aria-current="${path === file ? 'page' : 'location'}"` : '')).join('')}</nav>
</div></header>
<main class="wrap" id="main">
${body}
</main>
<footer><div class="wrap"><p>Expense Claim App · PT Nusantara Finansial (fiktif)</p><p>${link(up + 'glossary.html', 'Glosarium & FAQ')} · ${link(repo, 'Repository GitHub')}</p></div></footer>
<dialog data-lightbox aria-label="Perbesar screenshot"><form method="dialog"><button autofocus>Tutup gambar</button></form><img alt=""><p></p></dialog>
</body>
</html>
`;
  writeFileSync(join(site, file), markup.replace(/[ \t]+(?=\r?\n)/g, ''));
}

function diagram(id, up = '', { inline = false } = {}) {
  const { caption, steps } = diagramNotes[id];
  const source = read(`site/assets/diagrams/${id}.mmd`);
  const svg = read(`site/assets/diagrams/${id}.svg`);
  const match = /viewBox="[-.\d]+ [-.\d]+ ([.\d]+) ([.\d]+)"/.exec(svg);
  if (!match) throw new Error(`${id}: viewBox hilang.`);
  const image = `<img class="diagram-image" src="${up}assets/diagrams/${id}.svg" alt="${escape(steps.join(' '))}" width="${Math.ceil(+match[1])}" height="${Math.ceil(+match[2])}" loading="lazy">`;
  return `<figure class="diagram" data-diagram="${id}">
  ${inline ? `<div class="diagram-inline" data-cap-diagram role="img" aria-label="${escape(steps.join(' '))}">${svg}</div><noscript>${image}</noscript>` : image}
  <ol class="diagram-narrow">${steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol>
  <figcaption><strong>${id}.</strong> ${escape(caption)}</figcaption>
  <details><summary>Lihat sumber Mermaid</summary><p>${link(`${up}assets/diagrams/${id}.svg`, 'Buka diagram SVG ukuran penuh')}</p>${snippet(source.trim())}</details>
</figure>`;
}

function chart(id, title, { type, label, labels, values, horiz = false, max, second } = {}, caption) {
  if (!labels || !values) {
    return `<figure class="chart" data-chart-id="${id}"><h3>${id} · ${escape(title)}</h3>
      <p class="note">Belum ada data terukur. Tidak ditampilkan sebagai nol.</p><figcaption>${escape(caption)}</figcaption></figure>`;
  }
  const data = escape(JSON.stringify({ type, label, labels, values, horiz, max, second }));
  const headers = [label, ...(second ? [second.label] : [])];
  const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  return `<figure class="chart" data-chart-id="${id}">
  <h3>${id} · ${escape(title)}</h3><div class="chart-area" hidden><canvas data-chart="${data}" aria-hidden="true"></canvas></div>
  <table class="data"><caption>Data untuk grafik</caption><thead><tr><th scope="col">Kategori</th>${headers.map((value) => `<th scope="col">${escape(value)}</th>`).join('')}</tr></thead>
  <tbody>${labels.map((value, i) => `<tr><th scope="row">${escape(value)}</th><td>${number.format(values[i])}</td>${second ? `<td>${number.format(second.values[i])}</td>` : ''}</tr>`).join('')}</tbody></table>
  <figcaption>${escape(caption)}</figcaption></figure>`;
}

const shotAlts = {
  'setup-copilot-pat.png': 'Form baru tanpa nilai token; Account menampilkan Copilot Requests dengan akses Read-only.',
  'setup-copilot-secret.png': 'Settings repo, Actions secrets, tombol New repository secret, dan nama COPILOT_GITHUB_TOKEN yang sudah tersimpan.',
  'S04-before.png': 'S04 baseline lokal: klaim Taksi bandara Rp250.000 tersimpan setelah tanggal besok dikirim.',
  'S04-after.png': 'S04 branch perbaikan lokal: form menampilkan pesan tanggal klaim tidak boleh di masa depan.',
  'S04-before-annotated.png': 'Langkah 1: kotak menyorot status klaim tersimpan pada baseline lokal.',
  'S04-after-annotated.png': 'Langkah 4: kotak menyorot pesan penolakan tanggal masa depan pada branch perbaikan lokal.',
  'S02-before.png': 'S02 baseline lokal: formulir tanpa pilihan kategori.',
  'S02-after.png': 'S02 tag app bersih: formulir dengan pilihan kategori.',
  'S06-before.png': 'S06 baseline lokal: tombol masih berlabel Submit.',
  'S15-before.png': 'S15 baseline lokal: jumlah klaim hanya bisa diisi dalam IDR.',
};

function thumbnail(name, up = '') {
  if (!pngInfo.has(name)) {
    const status = missingStatus(name.slice(0, 3));
    return `<div class="placeholder"><strong>${status === 'missing' ? 'Belum direkam' : status}</strong><code translate="no">${escape(name)}</code></div>`;
  }
  const path = `${up}assets/screenshots/${name}`;
  const { width, height } = pngInfo.get(name);
  return `<a class="thumbnail" data-shot href="${path}"><img src="${path}" alt="${escape(imageDetails.get(name)?.alt ?? shotAlts[name] ?? `Bukti workshop ${name}`)}" width="${width}" height="${height}" loading="lazy"><span>Perbesar ${escape(name)}</span></a>`;
}

function evidenceFigure(name, up = '../') {
  const image = imageDetails.get(name);
  if (!image || !pngInfo.has(name)) return thumbnail(name, up);
  const url = evidenceUrl(image.url);
  const source = url ? link(url, 'Sumber GitHub') : escape(image.source ?? 'Bukti latihan');
  return `<figure class="evidence-shot" style="min-width:0;margin:0">${thumbnail(name, up)}<figcaption>${source} · ${escape(image.guide ?? image.alt)}</figcaption></figure>`;
}

function comparison(id) {
  const names = [`${id}-before.png`, `${id}-after.png`];
  if (id === 'S10') {
    if (s10AlertPair) {
      return `<div class="compare"><div class="gallery">${s10AlertPair.map((name) => evidenceFigure(name)).join('')}</div></div>`;
    }
    if (pngInfo.has(names[1])) {
      return `<div class="compare"><div class="gallery">${thumbnail(names[0], '../')}</div>
      <p class="note">Belum ada pasangan bukti dari ref PR yang sama.</p></div>`;
    }
  }
  const ready = names.every((name) => pngInfo.has(name));
  const pair = id === 'S04' && ['S04-before-annotated.png', 'S04-after-annotated.png'].every((name) => pngInfo.has(name))
    ? ['S04-before-annotated.png', 'S04-after-annotated.png'] : names;
  const image = (name, className = '') => {
    const { width, height } = pngInfo.get(name);
    return `<img class="${className}" src="../assets/screenshots/${name}" width="${width}" height="${height}" alt="" loading="lazy">`;
  };
  return `<div class="compare">
    ${ready ? `<p>Geser pembanding atau gunakan tombol panah pada kontrol. Kedua gambar bisa dibuka terpisah.</p>
    <div class="compare-stage" aria-hidden="true">${image(names[1])}${image(names[0], 'before')}</div>
    <div hidden><label class="slider-label" for="compare-${id}"><span>Sebelum</span><strong>Bagian gambar sebelum</strong><span>Sesudah</span></label>
    <input id="compare-${id}" type="range" min="0" max="100" value="50" data-compare></div>` : ''}
    <div class="gallery">${pair.map((name) => thumbnail(name, '../')).join('')}</div>
  </div>`;
}

const learningStepTitle = 'Cek selesai latihan';
const liveStepTitle = 'Cara merekam hasil live';
const indexedSteps = (list) => list.map(([title, detail, command, references = []], index) =>
  ({ title, detail, command, references, index }));

function stepEvidence(id, index) {
  const sequence = scenarios[id]?.guide?.stepEvidence ?? [];
  const name = sequence[index];
  return sequence.indexOf(name) === index && pngInfo.has(name) ? name : null;
}

function evidenceGallery(names) {
  return names.length ? `<div class="gallery">${names.map((name) => evidenceFigure(name)).join('')}</div>` : '';
}

function steps(id, list) {
  return `<ol class="steps">${list.map(({ title, detail, command, references, index }) => {
    const codeId = `cmd-${id}-${index + 1}`;
    const annotated = stepEvidence(id, index);
    const links = references.map(({ label, url }) => {
      const href = evidenceUrl(url);
      if (!href || typeof label !== 'string' || !label.trim()) {
        throw new Error(`Rujukan GitHub tidak valid di ${id}, langkah ${index + 1}.`);
      }
      return link(href, label);
    });
    return `<li class="step" value="${index + 1}"><div class="step-top"><span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h3>${escape(title)}</h3></div>
    <p>${escape(detail)}</p>${links.length ? `<p>${links.join(' · ')}</p>` : ''}
    ${command ? `<div class="cmd">${snippet(command, codeId)}
    <button type="button" data-copy="${codeId}" aria-label="Salin: ${escape(title)}" hidden>Salin</button></div><p class="feedback" role="status"></p>` : ''}
    ${annotated ? evidenceGallery([annotated]) : ''}</li>`;
  }).join('')}</ol>`;
}

function workflowPath(flow) {
  return `<figure id="solution-flow" class="solution-flow" aria-labelledby="solution-flow-title">
  <h3 id="solution-flow-title">Alur kerja ringkas</h3>
  <ol class="workflow-path" role="list">
  ${flow.map(({ actor, action, result }, index) => `<li><details>
    <summary><strong>${escape(actor)}</strong><span>${escape(action)}</span></summary>
    <p><strong>Hasil:</strong> ${escape(result)}</p>
  </details>${index < flow.length - 1 ? `<svg class="workflow-arrow" width="20" height="16" viewBox="0 0 20 16" aria-hidden="true" focusable="false">
    <path d="M2 8h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>` : ''}</li>`).join('')}
  </ol>
  <figcaption>Ilustrasi alur. Ikuti arah panah, lalu buka tiap kotak untuk melihat hasilnya.</figcaption>
</figure>`;
}

function sequenceDiagram(id, { title, actors, phases, caption }) {
  const roles = new Map(actors.map(([key, name, place], index) => [key, { name, place, index }]));
  if (roles.size !== actors.length || roles.size < 2 || !phases.length) {
    throw new Error(`Lajur atau tahap diagram ${id} tidak valid.`);
  }
  const actorLabel = ({ name, place }) => `<strong>${escape(name)}</strong><span class="sequence-place">${escape(place)}</span>`;
  const event = ([from, to, action, reply = false]) => {
    const sender = roles.get(from);
    const recipient = roles.get(to);
    if (!sender || !recipient || sender === recipient) throw new Error(`Arah panah diagram ${id} tidak valid.`);
    const first = Math.min(sender.index, recipient.index);
    const last = Math.max(sender.index, recipient.index);
    return `<li class="sequence-event${sender.index > recipient.index ? ' is-reverse' : ''}${reply ? ' is-reply' : ''}" style="--first:${first + 1};--last:${last + 2};--span:${last - first + 1}">
      <div class="sequence-route"><span>${actorLabel(sender)}</span><span class="sequence-direction" aria-hidden="true">&#8594;</span>
        <span class="sequence-sr">ke</span><span>${actorLabel(recipient)}</span></div>
      <div class="sequence-message"><span class="sequence-label">${escape(action)}</span><span class="sequence-line" aria-hidden="true"></span></div>
    </li>`;
  };
  return `<figure id="interaction-flow" class="interaction-flow" aria-labelledby="interaction-flow-title">
    <h3 id="interaction-flow-title">Diagram interaksi</h3><p>${escape(title)}.</p>
    <div class="sequence" style="--lanes:${actors.length}">
      <ul class="sequence-actors" aria-hidden="true">${[...roles.values()].map((actor) => `<li>${actorLabel(actor)}</li>`).join('')}</ul>
      <div class="sequence-phases">${phases.map(([phase, messages]) => `
        <section class="sequence-phase"><h4>${escape(phase)}</h4><ol class="sequence-events" role="list">
          ${messages.map(event).join('')}
        </ol></section>`).join('')}</div>
    </div>
    <figcaption>Baca dari atas ke bawah. Garis putus-putus pada lajur menandai balasan. ${escape(caption)}</figcaption>
  </figure>`;
}

const titlesByRole = [
  ['Developer', 'S01', 'Ajari agent cara tim menulis kode.'],
  ['Engineering Manager / PM', 'S04', 'Delegasikan satu issue dan review hasilnya.'],
  ['QA', 'S08', 'Turunkan aturan bisnis menjadi tes batas.'],
  ['AppSec', 'S10', 'Bedakan alert, mitigasi, dan bukti scan ulang.'],
  ['CISO / Platform', 'S14', 'Lihat kontrol, audit, dan biaya.'],
  ['Eksekutif', 'capstone.html', 'Ikuti satu fitur melewati semua gate.'],
];

document('index.html', 'Workshop dari issue ke draft PR', `
<section class="hero hero-grid" aria-labelledby="hero">
  <div><p class="kicker">Panduan praktik · GitHub Copilot</p><h1 id="hero">Dari issue ke draft PR, tanpa melewati review manusia</h1>
    <p class="lead">Pakai Expense Claim App untuk melihat bagaimana agent mengerjakan tugas, CI memeriksa perubahan, dan manusia memutuskan apakah hasilnya layak masuk.</p>
    <div class="actions">${link('scenarios/S04.html', 'Coba S04: Issue → draft PR', 'class="button primary"')}${link('setup.html', 'Siapkan demo', 'class="button"')}</div>
    <div class="badges">${['15 skenario', '5 level', 'Materi offline', 'Data fiktif'].map(badge).join('')}</div>
  </div>
  <aside class="rail" aria-label="Alur inti workshop"><p class="eyebrow">4 langkah inti</p><ol>
    <li><strong>01 · Tulis kriteria</strong><br>Bima menjelaskan kapan tanggal klaim harus ditolak.</li>
    <li><strong>02 · Delegasikan</strong><br>Copilot mengusulkan perubahan di branch dan draft PR.</li>
    <li><strong>03 · Periksa</strong><br>CI menjalankan tes. Reviewer meminta bukti atau revisi.</li>
    <li><strong>04 · Putuskan</strong><br>Manusia melihat hasil. S04 berhenti di draft PR.</li>
  </ol></aside>
</section>
<section class="section" id="urutan"><h2>Ikuti latihan satu per satu</h2>
<p>${link('sdlc.html', 'Mulai workflow utuh: tiket → desain → implementasi → review → tindak lanjut')}.</p>
<p>Isi nilai yang ditunjukkan, klik kontrol bernomor, lalu cocokkan hasilnya. Screenshot asli dibedakan dari hasil perintah yang dirender dan layar cloud yang belum terekam.</p>
<p><strong>Cek hasil</strong> bisa diselesaikan secara offline. <strong>Langkah live</strong> menjelaskan prasyarat untuk menjalankan latihan langsung di GitHub.</p>
<div class="actions">${link('scenarios/S04.html#practice', 'Mulai latihan S04', 'class="button primary"')}${link('setup.html#reset', 'Cara reset yang aman', 'class="button"')}</div>
<details><summary>Lihat urutan pemeriksaan 15 skenario</summary><ol>${workshopOrder.map((id) => `<li>${link(`scenarios/${id}.html#practice`, `${id} · ${scenarios[id].title}`)}</li>`).join('')}</ol></details></section>
<section class="section" aria-labelledby="pilih"><h2 id="pilih">Mulai dari kebutuhanmu</h2><div class="card-grid">
${titlesByRole.map(([role, destination, why]) => `<article class="card"><span class="subtitle">${escape(role)}</span><h3>${link(destination.startsWith('S') ? `scenarios/${destination}.html` : destination, destination.startsWith('S') ? `${destination} · ${scenarios[destination].title}` : 'Capstone · satu fitur dari ide ke review')}</h3><p>${escape(why)}</p></article>`).join('')}
</div></section>
<section class="section" aria-labelledby="why"><h2 id="why">Kapan perlu agent, bukan sekadar chat?</h2>
<p>Chat cukup untuk memahami sebuah fungsi. Agent cocok untuk tugas yang punya kriteria, beberapa file, dan hasil yang bisa dites. Workflow terjadwal menambah biaya dan risiko; pilih kerja otomatis hanya jika pemicu dan hasil yang diizinkan jelas.</p>
${diagram('D1')}${diagram('D2')}
${chart('C1', 'Ruang kerja dan kontrol per level (ilustrasi)', { type:'bar', label:'Otonomi (skala 1–5)', labels:levels, values:[1, 2, 3, 4, 5], horiz:true, max:5, second:{ label:'Kebutuhan kontrol (1–5)', values:[1, 3, 4, 5, 5] } },
  'Rubrik belajar, bukan hasil pengukuran. Skor tidak menggantikan pemeriksaan izin dan review.')}</section>
<section class="section"><h2>Lanjutkan sendiri</h2><p>${link('architecture.html', 'Ikuti satu klaim dari browser ke SQLite')} · ${link('scenarios/index.html', 'Cari skenario')} · ${link('glossary.html', 'Pelajari istilah dan FAQ')}.</p></section>
`, { charts: true });

document('scenarios/index.html', 'Peta skenario', `
<p class="kicker">Peta latihan</p><h1>15 skenario Agentic SDLC</h1><p class="lead">Pilih level dan persona, atau cari masalah yang ingin kamu coba. S06 dan S14 punya versi lokal/personal serta versi organisasi.</p>
<form class="panel filter" data-filters hidden><div class="filter-grid">
  <label>Cari judul atau kata kunci<input type="search" name="query" placeholder="Contoh: tanggal klaim…" autocomplete="off"></label>
  <label>Level<select name="level"><option value="">Semua level</option>${levels.map((text, i) => `<option value="${i + 1}">${i + 1} · ${escape(text)}</option>`).join('')}</select></label>
  <label>Persona<select name="persona"><option value="">Semua persona</option>${Object.keys(roles).map((role) => `<option value="${escape(role)}">${escape(role)} · ${escape(roles[role])}</option>`).join('')}</select></label>
</div><label class="check"><input type="checkbox" name="org"> Hanya skenario dengan opsi organisasi</label></form>
<p class="muted" role="status" data-filter-status>15 skenario tersedia.</p>
<div class="card-grid">${ids.map((id) => {
  const { title, pain, roles: people, org } = scenarios[id];
  return `<article class="card" data-scenario="${id}" data-level="${levelOf(id)}" data-roles="${escape(people.join('|'))}" data-org="${!!org}">
    <span class="subtitle">${id} · Level ${levelOf(id)}${org ? ' · Opsi organisasi' : ''}</span>
    <h2>${link(`${id}.html`, title)}</h2><p>${badge(scenarios[id].guide.live)}</p><p>${escape(pain)}</p><p class="muted">${escape(people.join(', '))}</p></article>`;
}).join('')}</div>
<section class="section"><h2>Distribusi persona</h2>${chart('C2', 'Keterlibatan persona per skenario', {
  type:'doughnut', label:'Jumlah skenario', labels:Object.keys(roles),
  values:Object.keys(roles).map((role) => ids.filter((id) => scenarios[id].roles.includes(role)).length),
}, 'Dihitung dari daftar skenario, bukan dry-run. Satu skenario bisa mencakup lebih dari satu persona.')}</section>
`, { charts: true });

const diagramFor = { S04:'D6', S09:'D7', S10:'D8', S11:'D9', S12:'D10', S13:'D10', S14:'D11', S15:'D12' };
const coverage = metrics.S08.localCoverage;
const scan = metrics.S10.runs.findLast(({ alertsBefore, alertsAfter }) =>
  Number.isInteger(alertsBefore) && Number.isInteger(alertsAfter));
const s10Alerts = ['S10-alert-open-annotated.png', 'S10-03-alert-closed-annotated.png'];
const s10AlertPair = scan && s10Alerts.every((name) => pngInfo.has(name)) ? s10Alerts : null;
for (const [index, id] of ids.entries()) {
  const s = scenarios[id];
  const graph = diagramFor[id];
  const { local, github } = allEvidence[id];
  const cloud = metrics[id]?.cloudEvidence;
  const preflight = metrics[id]?.preflight;
  const remaining = missingByScenario[id];
  const { learningCheck, verifiedLearningEvidence, livePrerequisite, targets } = s.guide.completion;
  const allSteps = indexedSteps(s.steps);
  const lessonSteps = allSteps.filter(({ title }) => title !== learningStepTitle && title !== liveStepTitle);
  const movedEvidence = (stepTitle) => allSteps.filter(({ title }) => title === stepTitle)
    .map(({ index }) => stepEvidence(id, index)).filter(Boolean);
  const learningEvidence = [...new Set([verifiedLearningEvidence, ...movedEvidence(learningStepTitle)])]
    .filter((name) => pngInfo.has(name));
  const liveEvidence = movedEvidence(liveStepTitle);
  const pendingTargets = targets.filter(({ name }) => !pngInfo.has(name));
  const seenInSteps = new Set([...s.guide.stepEvidence, ...learningEvidence]);
  const localGallery = local.filter(({ name }) => !seenInSteps.has(name) && pngInfo.has(name));
  const cloudGallery = github.filter(({ name }) => pngInfo.has(name));
  const cloudAnchor = { S10: 'codeql-initial-scan', S14: 's14-controls' }[id] ?? id.toLowerCase() + '-cloud-evidence';
  const visualEvidence = (id === 'S10' && s10AlertPair) || [`${id}-before.png`, `${id}-after.png`];
  const sources = [...new Set([cloud?.issueUrl, cloud?.prUrl, cloud?.fixtureDraftUrl, cloud?.fixtureRunUrl,
    cloud?.ciUrl, cloud?.proposalUrl, cloud?.triageRunUrl, cloud?.analysisRunUrl, cloud?.builtInReviewUrl, preflight?.scanUrl,
    metrics[id]?.localDryRun?.relatedActionsRun].map(evidenceUrl).filter(Boolean))];
  const explanation = cloud?.currentSummary?.trim() || {
    S04: 'Sesi cloud selesai tanpa perubahan. Foto aplikasi sebelum/sesudah tetap berasal dari dua ref latihan lokal, bukan PR kosong.',
    S05: 'Kegagalan job LA terukur. Draft tidak punya diff; run agent yang selesai bukan CI PR yang hijau.',
    S08: 'Foto menu menunjukkan QA Engineer tersedia, bukan bukti PR atau issue dibuat.',
    S09: 'Komentar Copilot bukan approval manusia. Daftar Done tidak membuktikan ada komentar spesialis yang dipublikasikan.',
    S10: 'CodeQL mencatat 0 alert terbuka. Tidak ada Autofix atau pengukuran sesudah perbaikan.',
    S11: 'Architect memberikan usulan ADR di dalam sesi saja. Belum disetujui dan belum ada PR ADR atau implementasi.',
    S12: 'Safe output Docs Sync menunjuk ke main, tetapi repo latihan memakai demo/workshop dan belum memiliki main.',
    S13: 'Kegagalan ECONNRESET berasal dari fixture LA. Kedua job Copilot CLI ditolak HTTP 403, tanpa label atau komentar baru. Pemicu sementara sudah dihapus.',
    S14: 'Tangkapan konfigurasi bukan bukti cloud attack. Fixture lokal menguji keputusan tanpa menjalankan argumennya.',
  }[id];
  const resultChart = id === 'S08' ? chart('C3', 'Coverage baris approvalRules.js', coverage ? {
    type:'bar', label:'Coverage (%)', labels:['Suite validasi', 'Ditambah tes batas'], values:[coverage.before, coverage.after], max:100,
  } : undefined, coverage
    ? `Vitest v5.1.0, ${coverage.date}. Satu baris yang diuji; suite kedua menemukan tes gagal di Rp1.000.000. Bukan total coverage aplikasi.`
    : 'Ukur suite yang sama sebelum dan setelah tes batas ditambahkan.')
    : id === 'S10' ? chart('C4', 'Alert CodeQL terbuka', scan ? {
      type:'bar', label:'Jumlah alert', labels:['Sebelum', 'Sesudah'], values:[scan.alertsBefore, scan.alertsAfter],
    } : undefined, typeof scan?.comparisonContext === 'string' && scan.comparisonContext.trim()
      ? scan.comparisonContext
      : preflight ? 'Pemindaian awal tidak menemukan alert. Perbandingan Autofix membutuhkan hasil sebelum dan sesudah.' : 'Isi saat kedua scan live sudah diverifikasi.') : '';
  document(`scenarios/${id}.html`, `${id} · ${s.title}`, `
<p class="breadcrumb">${link('index.html', 'Semua skenario')} / ${id}</p><p class="kicker">${id} · Level ${levelOf(id)} — ${escape(levels[levelOf(id) - 1])}</p>
<h1>${escape(s.title)}</h1><p class="lead">${escape(s.solution)}</p>
${note(`<strong>Status latihan:</strong> ${escape(s.guide.live)}. ${s.guide.sequence ? `${link('#interaction-flow', 'Lihat diagram interaksi')} · ` : ''}${link('#practice', 'Ikuti langkah')} · ${link('#learning-check', 'Cek hasil')} · ${link('#live-steps', 'Langkah live')} · ${link('#reset', 'Ulangi dari awal')}.`)}
<div class="badges">${[...s.roles, s.kind, `${s.minutes} · ilustrasi durasi`].map(badge).join('')}</div>
<div class="tabs" role="tablist" aria-label="Sudut pandang" data-tabs hidden>
  <button type="button" role="tab" id="business-tab" data-view="business" aria-controls="business">Bisnis</button>
  <button type="button" role="tab" id="technical-tab" data-view="technical" aria-controls="technical">Teknis</button>
</div>
<div class="panel" id="business" role="tabpanel" aria-labelledby="business-tab" tabindex="0">
  <h2>Masalah yang dihadapi</h2><p>${escape(s.pain)}</p>${note(`<strong>Kerugian:</strong> ${escape(s.loss)}`)}
</div>
<div class="panel" id="technical" role="tabpanel" aria-labelledby="technical-tab" tabindex="0">
  <h2>Masalah pada baseline</h2><p><code translate="no">${escape(s.path)}</code></p>
  <details><summary>Lihat potongan atau catatan sumber</summary>${snippet(s.sample)}</details>
</div>
<section class="section"><h2>Solusi dan alur</h2><p>${escape(s.solution)}</p>
${s.guide.flow?.length ? workflowPath(s.guide.flow) : ''}
${s.guide.sequence ? sequenceDiagram(id, s.guide.sequence) : ''}
${graph ? `<details id="solution-details"><summary>Lihat diagram lengkap</summary>${diagram(graph, '../')}</details>`
  : s.guide.flow?.length ? '' : `<div class="rail"><ol>${lessonSteps.map(({ title, detail }) => `<li><strong>${escape(title)}.</strong> ${escape(detail)}</li>`).join('')}</ol></div>`}</section>
<section class="section" id="practice"><h2>Langkah demo</h2>
<h3>Yang kamu lakukan</h3><ol class="checklist">${s.guide.practiceActions.map((action) => `<li>${escape(action)}</li>`).join('')}</ol>
<p>Issue adalah tiket kerja. PR (pull request) adalah usulan perubahan; jika masih draft, hasilnya belum digabung. <strong>Files changed</strong> atau <strong>Changes</strong> menunjukkan file yang berubah. <strong>Checks</strong> menunjukkan hasil tes otomatis.</p>
<p>${link('../setup.html#issue-to-review', 'Ikuti alur GitHub dari tiket sampai review')} jika latihanmu memakai PR. Tautan contoh di bawah hanya membuka hasil yang sudah ada.</p>
<h3>Contoh dan cara cek hasilnya</h3>${steps(id, lessonSteps)}</section>
<section class="section" id="learning-check" aria-labelledby="learning-check-title">
  <h2 id="learning-check-title">Cek hasil</h2><p>${escape(learningCheck)}</p>
  ${learningEvidence.length ? `<h3>Bukti latihan terverifikasi</h3>${evidenceGallery(learningEvidence)}` : ''}
</section>
<section class="section" id="live-steps" aria-labelledby="live-steps-title">
  <h2 id="live-steps-title">Langkah live</h2>
  <details open><summary>Prasyarat dan petunjuk pengambilan bukti</summary><p>${escape(livePrerequisite)}</p>
    ${pendingTargets.length ? `<ul>${pendingTargets.map(({ name, instruction }) =>
      `<li><strong><code translate="no">${escape(name)}</code></strong><p>${escape(instruction)}</p></li>`).join('')}</ul>`
    : '<p>Tidak ada target bukti live yang belum direkam.</p>'}
  </details>
  ${evidenceGallery(liveEvidence)}
</section>
<section class="section"><h2>Sebelum dan sesudah</h2>${comparison(id)}
<table class="data"><caption>Apa yang berubah</caption><thead><tr><th scope="col">Bagian</th><th scope="col">Sebelum</th><th scope="col">Sesudah / target</th></tr></thead><tbody>
<tr><th scope="row">Perilaku</th><td>${escape(s.compare[0])}</td><td>${escape(s.compare[1])}</td></tr>
<tr><th scope="row">Bukti visual</th>${visualEvidence.map((name) => `<td>${pngInfo.has(name) ? (imageDetails.get(name)?.url ? 'Ada tangkapan GitHub.' : 'Ada tangkapan lokal.') : 'Belum direkam.'}</td>`).join('')}</tr>
<tr><th scope="row">Keputusan</th><td>Peserta membaca keadaan awal.</td><td>Manusia memeriksa hasil sebelum meneruskan.</td></tr>
</tbody></table>${resultChart}</section>
<section class="section"><h2>Manfaat</h2><ul><li>${escape(s.benefit)}</li></ul></section>
<section class="section" id="evidence"><h2>Bukti dan sumber</h2>
<p>${link(`${repo}/blob/demo/workshop/issues/${id}.md`, `Template issue ${id}`)} · ${link('../assets/data/scenarios.json', 'Data latihan dan pengukuran')}.</p>
${localGallery.length ? `<div class="gallery">${localGallery.map(({ name }) => evidenceFigure(name)).join('')}</div>` : ''}
${explanation || cloudGallery.length || sources.length ? `<div id="${cloudAnchor}"><h3>Bukti GitHub live</h3>${explanation ? `<p>${escape(explanation)}</p>` : ''}
  ${sources.length ? `<ul>${sources.map((url) => `<li>${link(url, url.startsWith(`${repo}/`) ? url.slice(repo.length + 1) : url.slice('https://github.com/'.length))}</li>`).join('')}</ul>` : ''}
  ${cloudGallery.length ? `<div class="gallery">${cloudGallery.map(({ name }) => evidenceFigure(name)).join('')}</div>` : ''}</div>` : ''}
${remaining.length ? `<details><summary>${remaining.length} layar yang belum direkam</summary><ul>${remaining.map((name) => `<li><code>${escape(name)}</code></li>`).join('')}</ul></details>` : ''}</section>
<section class="section" id="reset"><h2>Ulangi latihan</h2><p>${escape(s.guide.reset)}</p>${snippet(s.app ? 'npm run reset\nnpm run demo:before' : 'npm run reset -- --fresh')}<p>${link('../setup.html#reset', 'Cara reset tanpa mengubah branch')}.</p></section>
<nav class="section prevnext" aria-label="Pindah skenario">
${link(index ? `${ids[index - 1]}.html` : 'index.html', index ? `← ${ids[index - 1]}` : '← Semua skenario', 'class="button"')}
${link('../capstone.html', 'Capstone', 'class="button"')}
${link(index < 14 ? `${ids[index + 1]}.html` : '../setup.html', index < 14 ? `${ids[index + 1]} →` : 'Cara demo →', 'class="button"')}</nav>
`, { charts: !!resultChart });
}

document('architecture.html', 'Arsitektur aplikasi dan agent', `
<p class="kicker">Arsitektur</p><h1>Siapa memanggil siapa?</h1><p class="lead">Browser menjalankan form. Express memeriksa aturan dan menyimpan klaim di SQLite. GitHub membantu tim mengubah kode, bukan memproses klaim.</p>
<section class="section"><h2>Runtime lokal</h2>${diagram('D3')}
<ol class="checklist">
  <li>Employee 01 mengisi <strong>Taksi bandara</strong>, <strong>Rp250.000</strong>, dan tanggal klaim. Browser mengirim <code translate="no">POST /claims</code>.</li>
  <li>API membaca persona demo dan memvalidasi nilai. Pada branch perbaikan S04, tanggal besok ditolak sebelum penyimpanan.</li>
  <li>Untuk tanggal hari ini, SQLite menyimpan klaim berstatus <code translate="no">pending</code> dan event awal dalam transaksi.</li>
  <li>API mengirim HTTP 201 dan data klaim. Browser menampilkan nomor dan status menunggu Manager, lalu memuat daftar baru.</li>
</ol>
<form class="panel" data-example hidden><p><strong>Simulasi respons:</strong> bukan panggilan API.</p>
  <label for="claim-example-date">Tanggal untuk Taksi bandara · Rp250.000</label>
  <select id="claim-example-date" name="claim-date"><option value="today">Hari ini</option><option value="tomorrow">Besok</option></select>
  <p><output for="claim-example-date" aria-live="polite">201 · Klaim tersimpan. Browser menampilkan status menunggu Manager.</output></p>
</form>${note('Aplikasi hanya mendengarkan di localhost. Pemilih peran bukan login. SQLite di memori tidak menyimpan data setelah server dihentikan.')}</section>
<section class="section"><h2>Jalur perubahan di GitHub</h2><p>Issue, branch, CI, review, dan CodeQL mengatur perubahan kode. Audit serta pengukuran biaya tidak ikut pada jalur permintaan browser.</p>${diagram('D4')}</section>
<section class="section"><h2>Peta konfigurasi</h2>${diagram('D5')}<dl>
  <dt><code translate="no">.github/copilot-instructions.md</code> dan <code translate="no">AGENTS.md</code></dt><dd>Aturan lintas tugas: bahasa, validasi, review, dan tes.</dd>
  <dt><code translate="no">.github/agents/*.agent.md</code></dt><dd>Profil peran dan daftar tool untuk planner, architect, implementer, QA, dan reviewer.</dd>
  <dt><code translate="no">.github/skills/*/SKILL.md</code></dt><dd>Prosedur endpoint dan pengambilan bukti.</dd>
  <dt><code translate="no">.github/hooks/guardrails.json</code></dt><dd>Konfigurasi hook Copilot CLI/cloud, bukan policy tenant.</dd>
  <dt><code translate="no">.github/workflows/ci.yml</code> dan <code translate="no">copilot-setup-steps.yml</code></dt><dd>Tes per perubahan dan persiapan lingkungan agent.</dd>
  <dt><code translate="no">.github/workflows/*.md</code> + <code translate="no">*.lock.yml</code></dt><dd>Sumber gh-aw dan hasil compile untuk Actions.</dd>
  <dt><code translate="no">.github/workflows/pages.yml</code></dt><dd>Publikasi manual folder site; bukan deployment Express.</dd>
</dl><p>${link('scenarios/S04.html', 'Lihat bukti respons 201 dan 400 pada S04')}.</p></section>
`);

const stageData = metrics.S15.runs.findLast(({ stagesMinutes }) =>
  timeline.every(([label]) => Number.isFinite(stagesMinutes?.[label])));
document('capstone.html', 'Capstone multi-mata-uang', `
<p class="kicker">S15 · Capstone</p><h1>Satu fitur, delapan tahap penyerahan</h1>
<p class="lead">Lina ingin klaim IDR, USD, dan SGD. Setiap tahap menghasilkan artefak yang diteruskan ke orang atau agent berikutnya. Hanya Tech Lead yang boleh merge di repo turunan.</p>
${note('Ini rencana dan timeline latihan. Baseline hanya menerima IDR; belum ada live run atau fitur multi-currency yang sudah selesai.')}
<section class="section"><h2>Hasil baseline IDR</h2><p>Foto ini menunjukkan persetujuan klaim rupiah pada versi lokal; pilihan USD/SGD belum ada.</p><div class="gallery">${evidenceFigure('S15-local-approval.png', '')}</div><p>${link('scenarios/S15.html#practice', 'Langkah latihan capstone')}.</p></section>
<section class="section"><h2>Ikuti perjalanan epik</h2>${diagram('D12', '', { inline:true })}
<div class="actions" data-cap-controls hidden aria-label="Pilih tahap">${timeline.map(([label], i) => `<button type="button" aria-controls="cap-${i + 1}" data-cap-choice>${i + 1} · ${escape(label)}</button>`).join('')}</div>
${timeline.map(([label, owner, text, evidence], index) => `<section class="section panel" id="cap-${index + 1}" data-cap-panel>
  <h3>${index + 1} · ${escape(label)}</h3><p><strong>${escape(owner)}.</strong> ${escape(text)}</p><div class="gallery">${thumbnail(evidence)}</div>
</section>`).join('')}
</section>
<section class="section"><h2>Waktu per tahap</h2>${chart('C5', 'Perbandingan lead time per tahap', stageData ? {
  type:'bar', label:'Agentic (menit)', labels:timeline.map(([label]) => label), values:timeline.map(([label]) => stageData.stagesMinutes[label]),
} : undefined, 'Waktu live belum diukur; durasi runbook adalah ilustrasi, bukan pembanding hasil.')}
<p>Versi ringkas: tunjukkan epik, draft PR, review, lalu keputusan merge. Untuk materi tanpa akses cloud, mulai dari bukti lokal ${link('scenarios/S04.html', 'S04')}.</p></section>
`, { charts: true });

const billed = Object.entries(metrics).flatMap(([id, { runs }]) =>
  runs.filter(({ aiCredits }) => Number.isFinite(aiCredits)).map((run) => ({ id, ...run })));
document('governance.html', 'Governance dan biaya', `
<p class="kicker">S14 · Governance</p><h1>Batasi aksi agent. Ukur biaya terpisah.</h1>
<p class="lead">Ibu Maya butuh jawaban konkret: siapa bisa menulis ke repo, apa yang diblok, dan di mana biaya terlihat?</p>
<section class="section"><h2>Empat kontrol yang berbeda</h2><div class="card-grid">
  <article class="card"><h3>Branch protection</h3><p>Review dan checks wajib di main. Repository owner mengatur; Tech Lead meninjau.</p></article>
  <article class="card"><h3>Hook + audit</h3><p>Hook memeriksa panggilan tool. Audit workshop hanya metadata dan tidak menjadi batas keamanan tersendiri.</p></article>
  <article class="card"><h3>Permissions + safe outputs</h3><p>Agent membaca dengan izin minimum. Job terpisah hanya boleh memproses output yang dipilih, misalnya satu draft PR docs.</p></article>
  <article class="card"><h3>Anggaran</h3><p>Periksa kuota dan pemicu workflow; aktifkan hanya saat latihan. Audit organisasi terpisah dari audit lokal.</p></article>
</div>${diagram('D11')}<p>Uji fixture tanpa menjalankan argumen:</p>${snippet('npm run guard:demo')}</section>
<section class="section"><h2>Lihat pengaturan di GitHub</h2><p>${link('scenarios/S14.html#s14-controls', 'Lihat hook dan batas workflow yang sudah dipotret')}. Foto berikut hanya keluaran fixture lokal.</p><div class="gallery">${evidenceFigure('S14-local-result.png', '')}</div></section>
<section class="section"><h2>Berapa biayanya?</h2>
${note('<strong>Ilustrasi:</strong> jika pemakaian di luar kuota mencapai 25 AI credits, 25 × US$0,01 = US$0,25. Bukan estimasi satu sesi dan bukan tagihan.')}
<p>Tarif konversi diambil dari ${link('https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing', 'GitHub Docs — Usage-based billing for individuals')}, diperiksa 25 November 2026. Satuan USD per AI credit untuk akun personal; contoh tidak memasukkan langganan, pajak, atau biaya Actions. Token yang digunakan dan model menentukan jumlah kredit. Periksa dashboard paketmu untuk pemakaian aktual.</p>
${chart('C6', 'Pemakaian AI credits', billed.length ? { type:'line', label:'AI credits terukur', labels:billed.map(({ id, date }) => `${id} · ${date}`), values:billed.map(({ aiCredits }) => aiCredits) } : undefined, 'Sumber: AI credits yang tercatat di docs/metrics.json per skenario. Angka diambil dari tampilan sesi workshop, bukan tagihan atau jumlah premium requests.')}
</section>`, { charts: true });

document('sdlc.html', 'Workflow Agentic SDLC dari awal sampai tindak lanjut', `
<p class="kicker">Alur yang bisa dijalankan · GitHub Actions</p>
<h1>Satu tiket, dari rencana sampai tindak lanjut</h1>
<p class="lead">Kamu tulis masalah. Workflow menghubungkan Copilot Architect, Implementer, tes, dan review. Manusia tetap menyetujui desain, kode, dan rilis.</p>
${note(workflowEvidence.githubCi ? '<strong>Sudah dicek di GitHub:</strong> CI untuk draft latihan lulus. Workflow Copilot sendiri masih nonaktif dan tercatat Skipped. Membuka halaman ini tidak memulai AI.' : '<strong>Status:</strong> controller diuji lokal dengan API fiktif; alur Copilot belum diuji live.')}
<div class="actions">${link('#mulai', 'Cara mulai dari satu tiket', 'class="button primary"')}${link('#workflow-sequence', 'Diagram utuh', 'class="button"')}${link('#learning-check', 'Cek hasil', 'class="button"')}${link('#evidence', 'Bukti dan sumber', 'class="button"')}${link('#github-check', 'Cek GitHub', 'class="button"')}</div>
<section class="section" id="workflow-sequence"><h2>Siapa mengerjakan apa?</h2>
${sequenceDiagram('sdlc', {
 title: 'Tiket, dua approval manusia, rilis GitHub, lalu pemeriksaan hasil',
 actors: [['human','Tim manusia','GitHub Issues / Review'],['control','Controller','GitHub Actions'],['architect','Copilot Architect','Agent GitHub'],['builder','Copilot Implementer','Agent GitHub'],['checks','CI dan review Copilot','Actions / Pull requests']],
 phases: [
  ['1. Desain dulu, bukan langsung coding', [
   ['human','control','Mulai workflow untuk tiket utama'],['control','architect','Buat tiket desain dan tugaskan'],
   ['architect','human','Ajukan draft desain dan rencana',true],['human','control','Setujui commit desain yang tepat']]],
  ['2. Implementasi, tes, dan review', [
   ['control','builder','Tugaskan dari desain yang disetujui'],['builder','checks','Ajukan kode, tes, dan docs'],
   ['checks','control','Laporkan tiga job CI lulus',true],['control','checks','Baru minta review Copilot'],
   ['checks','human','Kembalikan catatan Copilot, bukan approval',true],
   ['human','control','Review kode dan beri approval']]],
  ['3. Rilis dan tindak lanjut punya pemilik', [
   ['control','human','Laporkan siap rilis, tanpa merge otomatis',true],['human','control','Merge dan publikasi GitHub Release'],
   ['control','human','Buat tiket pemeriksaan setelah rilis',true],['human','control','Catat hasil dan tutup tiket']]],
 ],
 caption: 'Controller memverifikasi metadata GitHub. GitHub Release bukan deployment. Ini ilustrasi cara kerja yang dirancang, bukan riwayat run live.',
})}</section>
<section class="section"><h2>Delapan tahap dengan keluaran jelas</h2>
<ol class="checklist">${sdlcStages.map(({name,actor,action})=>`<li><strong>${escape(name)} · ${escape(actor)}.</strong> ${escape(action)}</li>`).join('')}</ol>
<p><strong>Contoh tiket:</strong> “Klaim Taksi bandara Rp250.000 bertanggal besok masih tersimpan. Besok harus ditolak; hari ini tetap diterima.” Pakai contoh kecil dan data fiktif.</p></section>
<section class="section" id="mulai"><h2>Cara menjalankan di repo latihan</h2><ol class="steps">
<li class="step"><h3>1. Siapkan aktivasi dengan maintainer</h3><p>Maintainer meninjau lalu memublikasikan workflow dan controller di default branch repo latihan. Tombol Run workflow baru tersedia setelah itu. Perubahan sudah dikirim ke draft latihan, belum menjadi versi default yang bisa dipakai untuk alur live.</p><p>Di Settings → Secrets and variables → Actions, siapkan secret AGENTIC_SDLC_TOKEN, variabel AGENTIC_SDLC_BASE_BRANCH (misalnya training/hook-input), dan AGENTIC_SDLC_LIVE=true. Nilai token tidak boleh masuk tiket, kode, atau Chat.</p><p>Persiapan publikasi ada di ${link('https://github.com/sandy-demo/AgenticSDLC/pull/39', 'draft runtime #39')}. Copilot sudah bekerja, tetapi GitHub mencatat author sandy-demo. Approval harus dari akun manusia berbeda yang berwenang, bukan akun reviewer buatan. Buka Files changed → Review changes → Approve → Submit review hanya setelah membaca perubahan dan hasil tes.</p><p>Workflow memakai AGENTIC_SDLC_TOKEN bila ada; jika belum tersedia, memakai COPILOT_GITHUB_TOKEN yang sudah ada. Nilai token tidak perlu dibaca atau dikirim ke Chat. Lihat ${link('../README.md', 'petunjuk akun reviewer dan aktivasi')}.</p></li>
<li class="step"><h3>2. Buat tiket utama</h3><p>Di repo latihan, pilih Issues → New issue. Isi masalah, input contoh, hasil saat ini, dan hasil yang diinginkan. Catat nomor tiket; tidak perlu menugaskan tiket utama ke Copilot secara manual.</p><p>${link(`${repo}/issues/new`, 'Buka form issue pada repo workshop')}.</p></li>
<li class="step"><h3>3. Mulai workflow</h3><p>Buka Actions → Agentic SDLC → Run workflow. Isi nomor issue dan pilih action=start. Controller membuat tiket desain, menugaskan Architect, dan menulis komentar status pada tiket utama.</p><p>${link(`${repo}/actions`, 'Buka daftar Actions repo workshop')} · Workflow baru muncul setelah publikasi.</p></li>
<li class="step"><h3>4. Review desain</h3><p>Dari komentar status, buka draft desain → Files changed. Baca keputusan dan cara mengujinya. Reviewer manusia selain penulis PR memilih Review changes → Approve → Submit review jika sesuai, atau Request changes jika perlu revisi. Approval pada commit lama tidak dipakai.</p></li>
<li class="step"><h3>5. Cek implementasi dan tes</h3><p>Setelah desain disetujui, controller membuat tiket Implementer. Baca file yang berubah dan tab Checks. Jika CI menunggu izin, maintainer memeriksa perubahan sebelum memilih Approve and run. Itu bukan approval kode.</p><p>Controller meminta review Copilot hanya setelah Jakarta, Los Angeles, dan browser lulus pada commit yang sama. Jika merah, minta revisi; workflow tidak menghapus tes atau memicu sesi perbaikan berulang.</p></li>
<li class="step"><h3>6. Beri keputusan manusia</h3><p>Baca catatan Copilot dan coba input contoh. Reviewer manusia memberi approval pada commit implementasi terbaru. Approval bot atau penulis PR sendiri tidak membuka gerbang. Status berikutnya release-ready.</p></li>
<li class="step"><h3>7. Rilis hanya jika diizinkan</h3><p>Controller tidak menekan Merge atau Publish release. Latihan utama boleh berhenti di release-ready. Jika repo turunan memang diizinkan untuk rilis, manusia merge lalu membuat GitHub Release dengan tag tepat pada commit hasil merge.</p><p>Deployment memerlukan hosting, lingkungan, dan izin terpisah. Rilis GitHub tidak membuktikan aplikasi sudah tersedia di server.</p></li>
<li class="step"><h3>8. Periksa hasil setelah rilis</h3><p>Workflow membuat tiket pemeriksaan setelah menemukan rilis yang cocok. Manusia mencoba aplikasi yang benar-benar dipasang, mencatat hasil smoke test dan kontrak API, lalu menutup tiket. completed hanya membuktikan tiket ditutup manusia; hasil uji harus dibaca di tiket.</p></li>
</ol><details><summary>Lihat screenshot instruksi mulai</summary><div class="gallery">${evidenceFigure('SDLC-02-mulai-annotated.png', '')}</div><p><strong>Nomor 3:</strong> setelah aktivasi disetujui, isi nomor issue dan action=start. Gambar ini memotret teks panduan lokal, bukan layar Actions yang sudah dijalankan.</p></details></section>
<section class="section"><h2>Kalau status berhenti</h2><p>Baca komentar Workflow Agentic SDLC di tiket utama. Di situ ada tahap sekarang dan tautan tiket desain, PR, serta CI.</p>
<dl class="panel"><dt>plan-review</dt><dd>Menunggu approval manusia untuk commit desain terbaru.</dd><dt>checks</dt><dd>Tiga job CI belum lulus pada commit yang tepat. Baca job merah.</dd><dt>review</dt><dd>Menunggu catatan Copilot atau approval manusia. Keduanya berbeda.</dd><dt>blocked</dt><dd>Periksa pesan API, izin, atau lingkup file. Setelah sebab diselesaikan, maintainer memilih action=resume. Tidak ada retry AI otomatis.</dd><dt>Kejadian terlewat</dt><dd>Pilih action=advance untuk tiket yang sama. Controller mencocokkan status, PR, CI, dan rilis tanpa membuat tugas ganda. action=status hanya membaca.</dd></dl>
<p>Jika desain berubah setelah implementasi dimulai, jangan meloloskan pekerjaan lama. Hentikan tiket lama dan rencanakan kembali tugas yang sempit.</p></section>
<section class="section"><h2>Akses, biaya, dan batas</h2><p>AGENTIC_SDLC_TOKEN adalah token pengguna dengan akses repo dan Copilot yang sesuai. Token Actions standar tidak cukup untuk penugasan cloud agent. Dokumentasi API assignment meminta Metadata read serta Actions, Contents, Issues, dan Pull requests read/write pada repo yang dipilih. Review juga bergantung pada paket, kebijakan, dan kuota akun.</p>
<p>${link('https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-via-the-api','Sumber resmi API penugasan Copilot')} · ${link('https://docs.github.com/en/rest/pulls/copilot-code-review','Sumber resmi API review Copilot')}.</p>
<p>Tidak ada angka biaya live untuk workflow ini. Batas controller adalah dua penugasan otomatis dan tiga permintaan review per tiket, bukan batas nilai tagihan. Revisi manual dapat memakai kredit tambahan. Tidak ada jadwal berulang.</p>
<p>Controller membaca kode sendiri dari default branch tepercaya dan tidak menjalankan kode atau artefak PR. Ia mencocokkan commit, identitas reviewer, scope file, dan CI. Implementasi tidak boleh mengubah workflow atau hook.</p></section>
<section class="section"><h2>Coba alur lokal tanpa meminta AI</h2><p>Jalankan tes dengan respons GitHub fiktif. Kasusnya meliputi seluruh urutan, approval dicabut, commit baru, API gagal, dan pencegahan tugas ganda.</p>${snippet('npm test -- sdlc-workflow.test.js')}
<p>Ini menguji controller, bukan membuktikan token atau run cloud berhasil. ${link('../docs/sdlc/plan.md', 'Rencana implementasi (berkas lokal)')} dan ${link('../docs/adr/0003-agentic-sdlc-workflow.md', 'keputusan desain (berkas lokal)')}.</p></section>
<section class="section" id="learning-check" aria-labelledby="sdlc-learning-title"><h2 id="sdlc-learning-title">Cek hasil</h2><p>Tes lokal dijalankan pada ${escape(workflowEvidence.validation.executedAt)}. Nomor pada screenshot hasil tes berarti:</p><ol class="checklist"><li><strong>1. Seluruh tes unit:</strong> ${workflowEvidence.validation.passed}/${workflowEvidence.validation.total} lulus, termasuk tes aplikasi yang sudah ada.</li><li><strong>2. Tes khusus controller:</strong> ${workflowEvidence.validation.controllerPassed} lulus dengan respons API GitHub fiktif.</li><li><strong>3. Tes gagal:</strong> ${workflowEvidence.validation.failed}. Ini bukan jumlah run GitHub.</li></ol><h3>Contoh kasus yang lulus</h3><ul>${workflowEvidence.validation.cases.map(({label})=>`<li>${escape(label)}.</li>`).join('')}</ul>${note('Lulus tes lokal belum membuktikan akses akun, model Copilot, kuota, atau workflow live berhasil. Tidak ada penugasan AI, merge, rilis, atau deployment selama tes ini.')}</section>
${workflowEvidence.githubCi ? `<section class="section" id="github-check" aria-labelledby="sdlc-github-title"><h2 id="sdlc-github-title">Cek langsung di GitHub</h2><p>CI untuk draft #1 benar-benar berjalan pada commit <code>${escape(workflowEvidence.githubCi.headSha.slice(0,7))}</code>. Hasilnya dibaca dari API dan log job GitHub, bukan disalin dari tes lokal.</p><p>${link(workflowEvidence.githubCi.url,'Buka run CI asli di GitHub')} dan ${link(workflowEvidence.githubCi.orchestration.url,'lihat run Agentic SDLC yang masih Skipped')}.</p><ol class="checklist"><li><strong>Kotak 1:</strong> cocokkan draft #1 dan branch latihan. Angka #127 pada judul CI adalah nomor run, bukan nomor PR.</li><li><strong>Kotak 2:</strong> Status Success berarti CI lulus. Pada layar kedua, Skipped berarti workflow tidak dijalankan.</li><li><strong>Kotak 3:</strong> tiga job CI hijau. Klik nama job untuk membaca log; GitHub meminta login untuk log, tetapi ringkasan run bersifat publik.</li></ol><ul>${workflowEvidence.githubCi.jobs.map(job=>`<li>${link(job.url,job.name)}: ${job.passed} tes lulus${job.controllerPassed ? `, termasuk ${job.controllerPassed} tes controller dengan API fiktif` : ''}.</li>`).join('')}</ul><p class="note">${escape(workflowEvidence.githubCi.warnings.message)}</p><p><strong>Batas bukti:</strong> CI menguji kode dan materi. Workflow Agentic SDLC tercatat Skipped karena sakelar live belum aktif. Tidak ada tiket desain otomatis, approval manusia, penugasan Copilot, merge, rilis, atau deployment dari run tersebut.</p><p>Buka screenshot bernomor di ${link('#evidence','Bukti dan sumber')}. Gambar berasal dari run validasi ini. Komentar status workflow dan hasil agent baru bisa direkam sesudah publikasi, akses, anggaran, dan keputusan manusia yang diminta alur.</p></section>` : ''}
<section class="section" id="publication-check" aria-labelledby="publication-title"><h2 id="publication-title">Persiapan aktivasi yang benar-benar dijalankan</h2><p>${link(workflowEvidence.publication.issueUrl,'Tugas publikasi #38')} benar-benar ditugaskan ke Copilot. ${link(workflowEvidence.publication.agentRunUrl,'Run cloud agent')} selesai, lalu penyesuaian identitas API dan secret diuji pada ${link(workflowEvidence.publication.prUrl,'draft runtime #39')}. Ini tugas persiapan, bukan run end-to-end dari workflow baru.</p><p>${link(workflowEvidence.publication.url,'Buka CI publikasi asli')}: commit <code>${escape(workflowEvidence.publication.headSha.slice(0,7))}</code>.</p><ul>${workflowEvidence.publication.jobs.map(job=>`<li>${link(job.url,job.name)}: ${job.passed} tes lulus${job.controllerPassed ? `, termasuk ${job.controllerPassed} tes controller dengan API fiktif` : ''}.</li>`).join('')}</ul><p>Jumlah tes draft runtime berbeda dari paket dokumentasi lengkap karena berkas awalnya berbeda. Angka pada screenshot lama tetap menjadi catatan pengujian pada commit yang disebut, bukan diubah mengikuti hasil terbaru.</p><p><strong>Yang masih perlu dilakukan manusia:</strong> GitHub mencatat author PR sebagai <code>${escape(workflowEvidence.publication.author)}</code>. Akun itu tidak bisa approve sendiri. Gunakan akun berbeda yang memang kamu kendalikan, atau minta rekan dengan akses Write. Baca ${link('../README.md','langkah reviewer dan aktivasi')}; pendaftaran akun serta verifikasi email dilakukan pemilik akun, bukan agent.</p><p>Screenshot draft: nomor 1 menunjukkan author, nomor 2 membuka Files changed. Screenshot CI: nomor 1 menunjuk draft #39, nomor 2 Status Success, nomor 3 tiga job yang lulus. Membuka halaman dan berkata “approve” di Chat belum mengirim review GitHub.</p>${note('Workflow tetap nonaktif sampai review independen dan publikasi di default branch selesai. Proteksi tidak diubah; tidak ada approval, merge, rilis, atau deployment otomatis.')}</section>
<section class="section" id="evidence" aria-labelledby="sdlc-evidence-title"><h2 id="sdlc-evidence-title">Bukti dan sumber</h2><p>Tiga adegan lokal dan empat layar GitHub memakai format dokumentasi yang sama: thumbnail kecil, klik untuk memperbesar, caption sumber, serta kotak bernomor jika ada tindakan atau hasil yang perlu ditunjuk. File asli tetap disimpan.</p><div class="gallery">${workflowEvidence.gallery.map(name=>evidenceFigure(name, '')).join('')}</div><p>Gambar tanpa kotak: ${link('assets/screenshots/SDLC-02-mulai.png','instruksi mulai')} dan ${link('assets/screenshots/SDLC-03-tes-lokal.png','hasil tes lokal')}. ${link('assets/data/scenarios.json','Data sumber, waktu uji, dan kondisi bukti')} memuat catatan sdlcEvidence.</p><div id="live-evidence"><h3>Alur Copilot live yang masih pending</h3><p>Berikut bukti yang masih perlu diambil setelah publikasi dan aktivasi disetujui. Tidak diganti dengan screenshot PR latihan lain.</p><ul>${workflowEvidence.pendingLive.map(({name,where,instruction})=>`<li><strong>${escape(where)}.</strong> ${escape(instruction)} <code translate="no">${escape(name)}</code></li>`).join('')}</ul></div></section>
`);

document('setup.html', 'Cara demo', `
<p class="kicker">Runbook</p><h1>Cara demo: lokal dulu, GitHub bila tersedia</h1>
<p class="lead">Buka materi offline tanpa menyiapkan akun. Untuk mempraktikkan aplikasi, pasang dependensi. Untuk cloud agent dan Pages, cek izin repo terlebih dahulu.</p>
<p><a href="#issue-to-review">Langsung ke langkah membuat issue, memilih Copilot, dan memberi review.</a></p>
<section class="section"><h2>1. Pilih lingkungan</h2>${diagram('D13')}
<div class="card-grid"><article class="card"><h3>Lokal</h3><p>Node.js <code>${escape(nodeRange)}</code> sesuai package.json, Git, npm, dan Chromium untuk screenshot. Tidak perlu secret.</p></article>
<article class="card"><h3>Personal GitHub</h3><p>Tambahkan GitHub CLI dan GitHub Actions. Periksa akun, izin tulis, dan ketersediaan Copilot. S06 pakai Issue.</p></article>
<article class="card"><h3>Organisasi / EMU</h3><p>Pemilik tenant mengizinkan policy dan budget, lalu mengatur konektor. Jangan memakai data atau repo produksi.</p></article></div></section>
<section class="section"><h2>2. Siapkan dan coba S04</h2>${steps('setup', indexedSteps([
  ['Pasang dependensi', 'Buka terminal di root repo. Gunakan tag v0-baseline jika tersedia.', 'npm ci\nnpx playwright install chromium'],
  ['Ambil ref demo', 'Pada hasil clone GitHub biasa, v0-baseline adalah tag dan demo/claim-date disimpan sebagai remote branch. Jangan jalankan ref yang tidak kamu tinjau.', 'git fetch origin --tags\ngit branch --track demo/claim-date origin/demo/claim-date'],
  ['Bandingkan perilaku', 'Buka 127.0.0.1:3000 dan :3001. Kirim Taksi bandara Rp250.000 bertanggal besok; versi after menolak. Ctrl+C untuk menghentikan keduanya.', 'npm run demo:compare -- demo/claim-date'],
  ['Ambil bukti dan ulangi', 'Script screenshot memakai port sementara pada localhost; perubahan hanya mengenai data demo dalam memori.', 'npm run shots -- S04\nnpm run reset'],
]))}<p>Jika checkout berasal dari ZIP/template tanpa tag, <code translate="no">npm run dev</code> tetap menjalankan app. Untuk perbandingan dua ref, gunakan clone repo lengkap.</p></section>
<section class="section" id="issue-to-review" aria-labelledby="issue-to-review-title">
<h2 id="issue-to-review-title">Praktik GitHub: dari tiket sampai review manusia</h2>
<p>Gunakan repo latihan yang mengizinkan Copilot dan akun yang punya akses. Untuk latihan pertama, pakai kasus tanggal klaim S04. Membuka contoh tidak membuat tiket, menjalankan tes, atau menyetujui perubahan.</p>
<ol class="checklist">
<li><strong>Buat tiket kerja (issue).</strong> Buka repo latihan di GitHub → <strong>Issues → New issue</strong>. Isi judul <em>Tolak tanggal klaim besok</em>. Di deskripsi, tulis: “Pada form klaim, Taksi bandara Rp250.000 bertanggal besok masih tersimpan. Besok harus ditolak; tanggal hari ini tetap diterima.” Klik <strong>Create issue</strong> atau <strong>Submit new issue</strong>. ${link(`${repo}/issues/3`, 'Baca contoh tiket tanggal klaim')}.</li>
<li><strong>Pilih agent dan tugaskan.</strong> Di sisi kanan tiket, klik <strong>Assignees → Copilot</strong>, lalu <strong>Assign</strong>. Jika form menampilkan pilihan profil agent, pilih yang diminta latihan; S04 cukup dengan Copilot. Skenario dengan spesialis menjelaskan kapan memakai tab <strong>Agents</strong>. Kalau Copilot tidak muncul, periksa akses repo dengan maintainer, jangan menganggap tugas sudah dikirim.</li>
<li><strong>Baca usulan kode.</strong> Tunggu tautan pull request (PR) muncul di tiket, atau cek sesi di <strong>Agents</strong>. Di PR, tab <strong>Conversation</strong> menampilkan ringkasan. Label <strong>Draft</strong> berarti usulan belum digabung; cek apakah benar ada file perubahan. ${link(`${repo}/pull/20`, 'Lihat contoh usulan perbaikan S04')}.</li>
<li><strong>Periksa perubahan sendiri.</strong> Klik <strong>Files changed</strong> atau <strong>Changes</strong>. Daftar sebelum dan sesudah ini disebut <em>diff</em>: tanda + berarti baris ditambah; tanda − berarti dihapus. Baca file validasi dan tes. Cocokkan keduanya dengan tiket: besok ditolak dan hari ini diterima. ${link(`${repo}/pull/20/files`, 'Lihat file dan tes yang berubah pada contoh S04')}.</li>
<li><strong>Cek tes lalu coba sendiri.</strong> Di <strong>Checks</strong>, pastikan pemeriksaan otomatis untuk perubahan terbaru lulus. Bila GitHub meminta <strong>Approve and run</strong>, itu izin maintainer untuk menjalankan tes, bukan approval kode. Ulangi dua tanggal dengan data fiktif di folder latihan yang memuat perubahan. ${link(`${repo}/actions/runs/45655420680/attempts/2`, 'Lihat hasil pemeriksaan yang lulus')}.</li>
<li><strong>Beri keputusan sebagai reviewer manusia.</strong> Dari <strong>Files changed</strong>, klik <strong>Review changes</strong> atau <strong>Review</strong>. Pilih <strong>Comment</strong> untuk masukan biasa, <strong>Request changes</strong> jika ada yang perlu dibetulkan, atau <strong>Approve</strong> jika hasilnya sesuai dan kamu reviewer lain yang berwenang. Tulis alasannya, lalu <strong>Submit review</strong>. Setelah revisi, baca perubahan dan tes lagi. Approval tidak sama dengan merge; berhenti sebelum merge.</li>
</ol>
<p><strong>Coba hasilnya di komputer sendiri:</strong> gunakan clone repo latihan di folder terpisah. Setelah membaca perubahan, jalankan <code translate="no">gh pr checkout NOMOR_PR</code> di Terminal jika memakai GitHub CLI. Ganti NOMOR_PR dengan nomor usulanmu, pasang dependensi jika belum ada, lalu jalankan <code translate="no">npm run dev</code>. Jangan jalankan kode atau data produksi.</p>
<p><strong>Contoh catatan review:</strong> “Saya coba dua tanggal: besok ditolak, hari ini tersimpan. Tes untuk keduanya ada.” Kalau besok masih tersimpan, pilih Request changes dan tulis cara mengulangnya.</p>
<p>${link('scenarios/S04.html#practice', 'Coba langkah khusus S04')} · ${link('https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/overview', 'Panduan resmi menugaskan issue ke Copilot')} · ${link('https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request', 'Panduan resmi review PR')}.</p>
</section>
<section class="section" id="reset"><h2>Reset: data aplikasi atau kode latihan?</h2><dl><dt>Data demo</dt><dd>Di terminal yang menjalankan demo, tekan Ctrl+C. Jalankan <code>npm run reset</code> untuk melihat instruksi, lalu <code>npm run demo:before</code>. Perintah reset biasa tidak me-restart server otomatis. Saat diuji, daftar Employee 01 berubah 7 → 8 → 7 klaim setelah restart.</dd><dt>Kode latihan</dt><dd>Jalankan <code>npm run reset -- --fresh</code> dari root repo. Buka path checkout terpisah yang dicetak di terminal. Checkout baru berada pada tag <code>v0-baseline</code>; pekerjaan yang sudah ada, branch, dan remote tetap utuh.</dd><dt>GitHub</dt><dd>Reset lokal tidak menutup issue, menghapus branch remote, atau mengurungkan merge. Gunakan repo turunan untuk latihan yang melibatkan merge.</dd></dl></section>
<section class="section"><h2>3. Siapkan demo GitHub</h2>
<ol class="checklist"><li>Pastikan Actions aktif dan dapat menjalankan CI. Lihat check sebelum admin mengaktifkan protection dan CodeQL.</li>
<li>Seed issue di repo latihan, buka draft PR yang diizinkan, dan cek Copilot pada Assignees.</li>
<li>Untuk S12/S13, cek anggaran dan <a href="#pat-copilot">siapkan PAT Copilot jika memakai jalur personal</a>. Aktifkan <code translate="no">AGENTIC_WORKSHOP_LIVE</code> hanya saat latihan.</li>
<li>Untuk publikasi situs, atur Pages ke sumber GitHub Actions lalu jalankan <strong>Publish workshop</strong> dari main.</li></ol>
<h3 id="pat-copilot">PAT Copilot untuk S12 dan S13</h3>
<p><strong>PAT (Personal Access Token)</strong> adalah kredensial yang mewakili akunmu. Saat Docs Sync (S12), Issue Triage, atau CI Fault Analysis (S13) butuh bantuan AI, GitHub Actions memakai secret <code translate="no">COPILOT_GITHUB_TOKEN</code> untuk mengirim permintaan ke Copilot atas nama akun <code translate="no">sandy-demo</code>. Job Actions tidak memakai sesi login browser kamu.</p>
<p><strong>Kapan boleh dilewati?</strong> PAT ini tidak diperlukan untuk materi offline, aplikasi lokal, CI biasa, atau memilih Copilot lewat <strong>Assignees</strong> di S04. Untuk Assignees, GitHub mengecek akses Copilot akun yang sedang login.</p>
<p><strong>Kenapa di tab Account?</strong> Copilot memeriksa akses layanan pada akun pemilik token, bukan pengaturan repo. <strong>Copilot Requests: Read</strong> adalah izin minimum untuk memanggil Copilot lewat PAT. Izin ini bukan izin mengubah file atau membuka PR. <strong>Copilot agent settings</strong> di tab <strong>Repositories</strong> mengatur konfigurasi agent, jadi bukan penggantinya.</p>
<ol class="checklist">
<li><strong>Buat di Settings akun.</strong> Dari foto profil, pilih <strong>Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens &gt; Generate new token</strong>, atau buka <a href="https://github.com/settings/personal-access-tokens/new?name=COPILOT_GITHUB_TOKEN&amp;user_copilot_requests=read">form fine-grained PAT</a>. Di <strong>Resource owner</strong> pilih akun pribadi <strong>sandy-demo</strong>. Pilih masa berlaku singkat dan batasi akses repo ke <strong>AgenticSDLC</strong>.</li>
<li><strong>Pilih izin di tab Account.</strong> Klik <strong>Permissions &gt; Account &gt; Add permissions</strong>, cari <strong>Copilot Requests</strong>, lalu pilih <strong>Read</strong> (<em>Read-only</em>). Tidak perlu menambah izin tulis. Klik <strong>Generate token</strong>.</li>
<li><strong>Simpan di Settings repo.</strong> Buka <a href="https://github.com/sandy-demo/AgenticSDLC/settings/secrets/actions">Actions secrets repo AgenticSDLC</a> (<strong>Settings &gt; Secrets and variables &gt; Actions &gt; Secrets</strong>). Klik <strong>New repository secret</strong>, isi <strong>Name</strong> dengan <code translate="no">COPILOT_GITHUB_TOKEN</code>, tempel nilai PAT di kolom <strong>Secret</strong>, lalu klik <strong>Add secret</strong>. Jangan masukkan nilai token ke chat, commit, atau screenshot.</li>
</ol>
<div class="gallery" id="pat-copilot-screenshots"><figure class="evidence-shot" style="min-width:0;margin:0">${thumbnail('setup-copilot-pat.png')}<figcaption><a href="https://github.com/settings/personal-access-tokens/new?name=COPILOT_GITHUB_TOKEN&amp;user_copilot_requests=read">Sumber GitHub</a> · Cari Account → Copilot Requests → Read-only. Ini contoh form sebelum Generate token. Sesuaikan masa berlaku dan batasi akses sesuai petunjuk.</figcaption></figure>
<figure class="evidence-shot" style="min-width:0;margin:0">${thumbnail('setup-copilot-secret.png')}<figcaption><a href="https://github.com/sandy-demo/AgenticSDLC/settings/secrets/actions">Sumber GitHub</a> · Settings → Secrets and variables → Actions → Secrets. Klik New repository secret untuk menambahkan. Setelah tersimpan, daftar hanya menunjukkan nama COPILOT_GITHUB_TOKEN.</figcaption></figure></div>
<p><strong>Cara cek:</strong> jalankan <code translate="no">gh secret list -R sandy-demo/AgenticSDLC</code>. Nama <code translate="no">COPILOT_GITHUB_TOKEN</code> harus muncul, bukan nilainya. Menyimpan secret tidak otomatis menyalakan workflow. Izin untuk operasi GitHub tetap dikontrol terpisah lewat <code translate="no">permissions</code> dan <code translate="no">safe-outputs</code>. <a href="https://github.github.com/gh-aw/reference/auth/#copilot_github_token">Panduan autentikasi gh-aw</a>.</p>
<p>${link(`${repo}/blob/evidence/dry-run-1/docs/ORG-SETUP.md`, 'Prasyarat dan langkah admin di repo (setelah publikasi)')} · ${link('scenarios/index.html', 'Langkah untuk semua skenario')}.</p></section>
<section class="section"><h2>Kalau ada masalah</h2>
<details><summary>Copilot tidak muncul di Assignees</summary><p>Cek plan, kebijakan pemilik repository dan apakah cloud agent diizinkan. Sementara itu pakai bukti lokal S04.</p></details>
<details><summary>Demo ref atau tag tidak ditemukan</summary><p>Periksa <code>git branch -a</code> dan <code>git tag</code>. ZIP tidak berisi history; gunakan <code>npm run dev</code> bila hanya ingin mencoba baseline.</p></details>
<details><summary>Run tidak muncul atau kredit tidak tersedia</summary><p>Periksa variabel, izin, dan token melalui UI pengaturan. Jangan tempel secret ke chat atau commit. Pakai materi offline untuk melanjutkan.</p></details>
<details><summary>Port lokal sudah dipakai</summary><p>Hentikan server yang kamu jalankan dari terminalnya. Screenshot memakai port dinamis; tidak menghentikan proses lain.</p></details>
</section>`);

document('glossary.html', 'Glosarium dan FAQ', `
<p class="kicker">Rujukan</p><h1>Glosarium dan pertanyaan umum</h1>
<section class="section"><h2>Istilah</h2><dl class="panel">${glossary.map(([term, meaning]) => `<dt>${escape(term)}</dt><dd>${escape(meaning)}</dd>`).join('')}</dl></section>
<section class="section"><h2>FAQ</h2><div class="panel">${faq.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div></section>`);

console.log(`${pageCount} halaman offline: ${ids.length} skenario dan ${pageCount - ids.length} halaman pengantar/rujukan. ${pngInfo.size} gambar disalin.`);
