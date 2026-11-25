import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../demo-runtime.mjs';
import { diagramNotes, faq, glossary, timeline, roles } from './content.mjs';

const site = join(root, 'site');
const read = (file) => readFileSync(join(root, file), 'utf8');
const scenarios = JSON.parse(read('scripts/scenarios.json'));
const metrics = JSON.parse(read('docs/metrics.json'));
const ids = Object.keys(scenarios);
const levels = ['Inner loop', 'Delegasi asinkron', 'Tim virtual', 'Continuous AI', 'Governance dan capstone'];
const levelOf = (id) => [3, 7, 11, 13, 15].findIndex((edge) => Number(id.slice(1)) <= edge) + 1;
const escape = (input) => String(input).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const link = (href, text, attrs = '') => `<a href="${escape(href)}"${attrs ? ` ${attrs}` : ''}>${escape(text)}</a>`;
const badge = (text) => `<span class="badge">${escape(text)}</span>`;
const snippet = (text, id = '') => `<pre><code translate="no"${id ? ` id="${id}"` : ''}>${escape(text)}</code></pre>`;
const note = (text) => `<p class="note">${text}</p>`;
const sections = [
  ['index.html', 'Mulai'], ['scenarios/index.html', 'Skenario'], ['architecture.html', 'Arsitektur'],
  ['capstone.html', 'Capstone'], ['governance.html', 'Governance'], ['setup.html', 'Cara demo'],
];
const repo = 'https://github.com/sandy-demo/AgenticSDLC';
const pngInfo = new Map();
const knownShots = [...new Set(Object.values(scenarios).flatMap(({ shots }) => shots)),
  'S04-before-annotated.png', 'S04-after-annotated.png', 'setup-copilot-pat.png', 'setup-copilot-secret.png'];

for (const directory of ['scenarios', 'assets/screenshots', 'assets/vendor', 'assets/data']) {
  mkdirSync(join(site, directory), { recursive: true });
}
for (const name of knownShots) {
  const file = join(root, 'docs', 'screenshots', name);
  if (!existsSync(file)) continue;
  const bytes = readFileSync(file);
  if (bytes.length < 24 || bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error(`Bukan PNG: ${name}`);
  pngInfo.set(name, { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
  copyFileSync(file, join(site, 'assets', 'screenshots', name));
}
const chartBundle = read('node_modules/chart.js/dist/chart.umd.min.js').replace(/\n\/\/# sourceMappingURL=[^\n]*\n?$/, '\n');
writeFileSync(join(site, 'assets', 'vendor', 'chart.umd.min.js'), chartBundle);
copyFileSync(join(root, 'node_modules', 'chart.js', 'LICENSE.md'), join(site, 'assets', 'vendor', 'Chart.js-LICENSE.md'));
copyFileSync(join(root, 'node_modules', '@kurkle', 'color', 'LICENSE.md'), join(site, 'assets', 'vendor', 'kurkle-color-LICENSE.md'));
writeFileSync(join(site, 'assets', 'data', 'scenarios.json'), `${JSON.stringify({
  scenarios: Object.fromEntries(ids.map((id) => [id, { ...scenarios[id], level: levelOf(id),
    screenshotStatus: Object.fromEntries(scenarios[id].shots.map((name) => [name, pngInfo.has(name) ? 'available' : 'missing'])) }])),
  metrics,
}, null, 2)}\n`);

function document(file, title, body, { charts = false } = {}) {
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
  if (!pngInfo.has(name)) return `<div class="placeholder"><strong>Belum di-capture</strong><code translate="no">${escape(name)}</code></div>`;
  const path = `${up}assets/screenshots/${name}`;
  const { width, height } = pngInfo.get(name);
  return `<a class="thumbnail" data-shot href="${path}"><img src="${path}" alt="${escape(shotAlts[name] ?? `Bukti workshop ${name}`)}" width="${width}" height="${height}" loading="lazy"><span>Perbesar ${escape(name)}</span></a>`;
}

function comparison(id) {
  const names = [`${id}-before.png`, `${id}-after.png`];
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

function steps(id, list) {
  return `<ol class="steps">${list.map(([title, detail, command], index) => {
    const codeId = `cmd-${id}-${index + 1}`;
    const annotated = id === 'S04' && (index === 0 || index === 3)
      ? `S04-${index ? 'after' : 'before'}-annotated.png` : null;
    return `<li class="step"><div class="step-top"><span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h3>${escape(title)}</h3></div>
    <p>${escape(detail)}</p><div class="cmd">${snippet(command, codeId)}
    <button type="button" data-copy="${codeId}" aria-label="Salin: ${escape(title)}" hidden>Salin</button></div><p class="feedback" role="status"></p>
    ${annotated && pngInfo.has(annotated) ? `<div class="gallery">${thumbnail(annotated, '../')}</div>` : ''}</li>`;
  }).join('')}</ol>`;
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
    <h2>${link(`${id}.html`, title)}</h2><p>${escape(pain)}</p><p class="muted">${escape(people.join(', '))}</p></article>`;
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
for (const [index, id] of ids.entries()) {
  const s = scenarios[id];
  const graph = diagramFor[id];
  const screenshots = s.shots.filter((name) => !/(before|after)\.png$/.test(name));
  const resultChart = id === 'S08' ? chart('C3', 'Coverage baris approvalRules.js', coverage ? {
    type:'bar', label:'Coverage (%)', labels:['Suite validasi', 'Ditambah tes batas'], values:[coverage.before, coverage.after], max:100,
  } : undefined, coverage
    ? `Vitest v5.1.0, ${coverage.date}. Satu baris yang diuji; suite kedua menemukan tes gagal di Rp1.000.000. Bukan total coverage aplikasi.`
    : 'Ukur suite yang sama sebelum dan setelah tes batas ditambahkan.')
    : id === 'S10' ? chart('C4', 'Alert CodeQL terbuka', scan ? {
      type:'bar', label:'Jumlah alert', labels:['Sebelum', 'Sesudah'], values:[scan.alertsBefore, scan.alertsAfter],
    } : undefined, 'Kartu simulasi bukan hasil CodeQL. Isi saat kedua scan live sudah diverifikasi.') : '';
  document(`scenarios/${id}.html`, `${id} · ${s.title}`, `
<p class="breadcrumb">${link('index.html', 'Semua skenario')} / ${id}</p><p class="kicker">${id} · Level ${levelOf(id)} — ${escape(levels[levelOf(id) - 1])}</p>
<h1>${escape(s.title)}</h1><p class="lead">${escape(s.solution)}</p>
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
${graph ? diagram(graph, '../') : `<div class="rail"><ol>${s.steps.map(([stepTitle, detail]) => `<li><strong>${escape(stepTitle)}.</strong> ${escape(detail)}</li>`).join('')}</ol></div>`}</section>
<section class="section"><h2>Langkah demo</h2>${steps(id, s.steps)}</section>
<section class="section"><h2>Sebelum dan sesudah</h2>${comparison(id)}
<table class="data"><caption>Apa yang berubah</caption><thead><tr><th scope="col">Bagian</th><th scope="col">Sebelum</th><th scope="col">Sesudah / target</th></tr></thead><tbody>
<tr><th scope="row">Perilaku</th><td>${escape(s.compare[0])}</td><td>${escape(s.compare[1])}</td></tr>
<tr><th scope="row">Bukti visual</th><td>${pngInfo.has(`${id}-before.png`) ? 'Ada tangkapan lokal.' : 'Belum di-capture.'}</td><td>${pngInfo.has(`${id}-after.png`) ? 'Ada tangkapan lokal.' : 'Belum di-capture.'}</td></tr>
<tr><th scope="row">Keputusan</th><td>Peserta membaca keadaan awal.</td><td>Manusia memeriksa hasil sebelum meneruskan.</td></tr>
</tbody></table>${resultChart}</section>
<section class="section"><h2>Manfaat</h2><ul><li>${escape(s.benefit)}</li></ul></section>
<section class="section"><h2>Bukti dan sumber</h2>
<p>PR, Actions run, dan alert live: belum ada tautan terverifikasi untuk skenario ini. ${link(`${repo}/tree/main/issues/${id}.md`, `Template issue ${id} di GitHub (setelah publikasi)`)}.</p>
${screenshots.length ? `<div class="gallery">${screenshots.map((name) => thumbnail(name, '../')).join('')}</div>` : ''}</section>
<section class="section"><h2>Ulangi latihan</h2><p>Hentikan server dari terminalnya untuk mengulang data awal. Gunakan checkout latihan baru bila ingin membandingkan perubahan kode. Perintah ini tidak menutup PR atau mengubah remote.</p>${snippet('npm run reset -- --fresh')}</section>
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
`, { charts: !!stageData });

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
<section class="section"><h2>Berapa biayanya?</h2>
${note('<strong>Ilustrasi:</strong> jika pemakaian di luar kuota mencapai 25 AI credits, 25 × US$0,01 = US$0,25. Bukan estimasi satu sesi dan bukan tagihan.')}
<p>Tarif konversi diambil dari ${link('https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing', 'GitHub Docs — Usage-based billing for individuals')}, diperiksa 25 November 2026. Satuan USD per AI credit untuk akun personal; contoh tidak memasukkan langganan, pajak, atau biaya Actions. Token yang digunakan dan model menentukan jumlah kredit. Periksa dashboard paketmu untuk pemakaian aktual.</p>
${chart('C6', 'Pemakaian AI credits', billed.length ? { type:'line', label:'AI credits terukur', labels:billed.map(({ id, date }) => `${id} · ${date}`), values:billed.map(({ aiCredits }) => aiCredits) } : undefined, 'Sumber: AI credits yang tercatat di docs/metrics.json per skenario. Angka tampilan sesi S04 dan S05 bukan tagihan atau jumlah premium requests.')}
</section>`, { charts: billed.length > 0 });

document('setup.html', 'Cara demo', `
<p class="kicker">Runbook</p><h1>Cara demo: lokal dulu, GitHub bila tersedia</h1>
<p class="lead">Buka materi offline tanpa menyiapkan akun. Untuk mempraktikkan aplikasi, pasang dependensi. Untuk cloud agent dan Pages, cek izin repo terlebih dahulu.</p>
<section class="section"><h2>1. Pilih lingkungan</h2>${diagram('D13')}
<div class="card-grid"><article class="card"><h3>Lokal</h3><p>Node.js 24 LTS, Git, npm dan browser Chromium untuk screenshot. Tidak perlu secret.</p></article>
<article class="card"><h3>Personal GitHub</h3><p>Tambahkan GitHub CLI dan GitHub Actions. Periksa akun, izin tulis, dan ketersediaan Copilot. S06 pakai Issue.</p></article>
<article class="card"><h3>Organisasi / EMU</h3><p>Pemilik tenant mengizinkan policy dan budget, lalu mengatur konektor. Jangan memakai data atau repo produksi.</p></article></div></section>
<section class="section"><h2>2. Siapkan dan coba S04</h2>${steps('setup', [
  ['Pasang dependensi', 'Buka terminal di root repo. Gunakan tag v0-baseline jika tersedia.', 'npm ci\nnpx playwright install chromium'],
  ['Ambil ref demo', 'Pada hasil clone GitHub biasa, v0-baseline adalah tag dan demo/claim-date disimpan sebagai remote branch. Jangan jalankan ref yang tidak kamu tinjau.', 'git fetch origin --tags\ngit branch --track demo/claim-date origin/demo/claim-date'],
  ['Bandingkan perilaku', 'Buka 127.0.0.1:3000 dan :3001. Kirim Taksi bandara Rp250.000 bertanggal besok; versi after menolak. Ctrl+C untuk menghentikan keduanya.', 'npm run demo:compare -- demo/claim-date'],
  ['Ambil bukti dan ulangi', 'Script screenshot memakai port sementara pada localhost; perubahan hanya mengenai data demo dalam memori.', 'npm run shots -- S04\nnpm run reset'],
])}<p>Jika checkout berasal dari ZIP/template tanpa tag, <code translate="no">npm run dev</code> tetap menjalankan app. Untuk perbandingan dua ref, gunakan clone repo lengkap.</p></section>
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
<p>${link(`${repo}/blob/main/docs/ORG-SETUP.md`, 'Prasyarat dan langkah admin di repo (setelah publikasi)')} · ${link('scenarios/index.html', 'Langkah untuk semua skenario')}.</p></section>
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

console.log(`22 halaman offline: ${ids.length} skenario dan 7 halaman pengantar/rujukan. ${pngInfo.size} gambar disalin.`);
