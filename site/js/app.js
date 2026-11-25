function stored(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

for (const tablist of document.querySelectorAll('[data-tabs]')) {
  const tabs = [...tablist.querySelectorAll('button')];
  const setTab = (choice, moveFocus = false) => {
    for (const tab of tabs) {
      const active = tab === choice;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    }
    if (moveFocus) choice.focus();
    try { localStorage.setItem('workshop-view', choice.dataset.view); }
    catch { /* file:// storage is browser-dependent */ }
  };
  tablist.hidden = false;
  setTab(tabs.find((tab) => tab.dataset.view === stored('workshop-view')) ?? tabs[0]);
  tablist.addEventListener('click', (event) => {
    if (tabs.includes(event.target)) setTab(event.target);
  });
  tablist.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    const operations = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(operations, event.key)) return;
    event.preventDefault();
    setTab(tabs[operations[event.key]], true);
  });
}

const filters = document.querySelector('[data-filters]');
if (filters) {
  const cards = [...document.querySelectorAll('[data-scenario]')];
  const status = document.querySelector('[data-filter-status]');
  const { query, level, persona, org } = filters.elements;
  const queryState = new URLSearchParams(location.search);
  query.value = queryState.get('q') ?? '';
  if ([...level.options].some((option) => option.value === queryState.get('level'))) level.value = queryState.get('level');
  if ([...persona.options].some((option) => option.value === queryState.get('persona'))) persona.value = queryState.get('persona');
  org.checked = queryState.get('org') === '1';
  const update = () => {
    const search = query.value.toLocaleLowerCase('id').trim();
    let total = 0;
    for (const card of cards) {
      const matches = (!level.value || card.dataset.level === level.value) &&
        (!persona.value || card.dataset.roles.split('|').includes(persona.value)) &&
        (!org.checked || card.dataset.org === 'true') &&
        (!search || card.textContent.toLocaleLowerCase('id').includes(search));
      card.hidden = !matches;
      if (matches) total += 1;
    }
    status.textContent = total ? `${total} skenario cocok.` : 'Tidak ada yang cocok. Ubah kata kunci atau filter.';
    const params = new URLSearchParams();
    if (query.value) params.set('q', query.value);
    if (level.value) params.set('level', level.value);
    if (persona.value) params.set('persona', persona.value);
    if (org.checked) params.set('org', '1');
    if (location.protocol !== 'file:') history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  };
  filters.hidden = false;
  filters.addEventListener('input', update);
  filters.addEventListener('submit', (event) => { event.preventDefault(); update(); });
  update();
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = button.closest('.step').querySelector('[role=status]');
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Disalin.';
    } catch {
      const selection = getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Teks dipilih. Tekan Ctrl+C atau gunakan menu Salin.';
    }
  });
}

for (const slider of document.querySelectorAll('[data-compare]')) {
  const stage = slider.closest('.compare').querySelector('.compare-stage');
  const update = () => {
    stage.style.setProperty('--split', `${slider.value}%`);
    slider.setAttribute('aria-valuetext', `${slider.value}% bagian sebelum`);
  };
  slider.parentElement.hidden = false;
  slider.addEventListener('input', update);
  update();
}

const lightbox = document.querySelector('[data-lightbox]');
if (lightbox && typeof lightbox.showModal === 'function') {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-shot]');
    if (!link || event.ctrlKey || event.shiftKey || event.metaKey || event.altKey || event.button) return;
    event.preventDefault();
    const image = link.querySelector('img');
    const zoom = lightbox.querySelector('img');
    zoom.src = link.href;
    zoom.alt = image.alt;
    zoom.width = image.width;
    zoom.height = image.height;
    lightbox.querySelector('p').textContent = image.alt;
    lightbox.showModal();
  });
}

const cap = document.querySelector('[data-cap-controls]');
if (cap) {
  const buttons = [...cap.querySelectorAll('button')];
  const panels = [...document.querySelectorAll('[data-cap-panel]')];
  const highlights = [...document.querySelectorAll('[data-cap-diagram] .node')];
  const narrowSteps = [...document.querySelectorAll('[data-diagram="D12"] .diagram-narrow li')];
  const update = (index) => {
    for (const [i, button] of buttons.entries()) {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      panels[i].hidden = i !== index;
    }
    for (const node of highlights) node.toggleAttribute('data-highlight', node.id.startsWith(`D12-flowchart-${'abcdefgh'[index]}-`));
    narrowSteps.forEach((step, i) => step.toggleAttribute('data-highlight', i === index));
  };
  cap.hidden = false;
  buttons.forEach((button, index) => button.addEventListener('click', () => update(index)));
  update(0);
}

const example = document.querySelector('[data-example]');
if (example) {
  const output = example.querySelector('output');
  example.addEventListener('change', (event) => {
    const invalid = event.target.value === 'tomorrow';
    output.textContent = invalid
      ? '400 · CLAIM_DATE_FUTURE. Tanggal besok ditolak; SQLite tidak menerima klaim baru.'
      : '201 · Klaim tersimpan. Browser menampilkan status menunggu Manager.';
  });
  example.hidden = false;
}

if (window.Chart) {
  const palette = matchMedia('(prefers-color-scheme: dark)').matches
    ? ['#92b9ff', '#dab0f9', '#77d5ac', '#f4bd7d', '#a8bedc', '#ea9ab4', '#b3d489', '#8acede']
    : ['#2256b4', '#704ca4', '#26715a', '#8e5218', '#536d8f', '#934260', '#426328', '#365e6b'];
  const css = getComputedStyle(document.documentElement);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const canvas of document.querySelectorAll('canvas[data-chart]')) {
    const config = JSON.parse(canvas.dataset.chart);
    const { type, labels, values, horiz = false, max, label, second } = config;
    canvas.parentElement.hidden = false;
    const datasets = [{ label, data: values, backgroundColor: type === 'doughnut' ? palette.slice(0, values.length) : palette[0], borderWidth: 0 }];
    if (second) datasets.push({ label: second.label, data: second.values, backgroundColor: palette[2], borderWidth: 0 });
    const numeric = { beginAtZero: true, ...(typeof max === 'number' ? { max } : {}) };
    new window.Chart(canvas, {
      type, data: { labels, datasets },
      options: {
        indexAxis: horiz ? 'y' : 'x', animation: reduced ? false : { duration: 200 },
        responsive: true, maintainAspectRatio: false, color: css.getPropertyValue('--text').trim(),
        plugins: { legend: { display: type === 'doughnut' || !!second } },
        scales: type !== 'doughnut' ? { [horiz ? 'x' : 'y']: numeric } : {},
      },
    });
  }
}
