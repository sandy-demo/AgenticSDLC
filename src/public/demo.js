const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const statusNames = { pending: 'Menunggu Manager', finance_review: 'Menunggu Finance', approved: 'Disetujui', rejected: 'Ditolak' };
const categoryNames = { Travel: 'Perjalanan', Meals: 'Makan', Equipment: 'Peralatan', Other: 'Lainnya' };
const date = new Date();
const today = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((value) => String(value).padStart(2, '0')).join('-');

async function api(path, user, body) {
  const response = await fetch(path, {
    headers: body === undefined ? { 'x-demo-user': user } : { 'x-demo-user': user, 'content-type': 'application/json' },
    method: body === undefined ? 'GET' : 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Permintaan gagal (HTTP ${response.status}).`);
  }
  return response.json();
}

function feedback(target, kind, message) {
  target.className = `feedback ${kind}`;
  target.textContent = message;
}

function item(title, detail) {
  const li = document.createElement('li');
  const heading = document.createElement('h3');
  const text = document.createElement('p');
  heading.textContent = title;
  text.textContent = detail;
  text.className = 'muted';
  li.append(heading, text);
  return li;
}

let latestList = 0;
async function showList(load, render, emptyText) {
  const generation = ++latestList;
  $('items').replaceChildren();
  feedback($('list-status'), '', 'Memuat…');
  try {
    const rows = await load();
    if (generation !== latestList) return;
    $('items').replaceChildren(...rows.map(render));
    feedback($('list-status'), '', rows.length ? '' : emptyText);
  } catch (error) {
    if (generation === latestList) feedback($('list-status'), 'error', `Tidak bisa memuat data. ${error.message}`);
  }
}

if (document.body.dataset.page === 'employee') {
  const form = $('claim-form');
  $('claimDate').value = today;
  const loadClaims = () => showList(
    async () => (await api('/claims', '1')).claims,
    (claim) => item(claim.title, `${currency.format(claim.amount)} · ${statusNames[claim.status]}`),
    'Belum ada klaim.',
  );
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $('submit').disabled = true;
    try {
      const body = Object.fromEntries(new FormData(form));
      body.amount = Number(body.amount);
      const { claim } = await api('/claims', '1', body);
      form.reset();
      $('claimDate').value = today;
      feedback($('feedback'), 'toast', `Klaim #${claim.id} tersimpan. Status: menunggu Manager.`);
      await loadClaims();
    } catch (error) {
      feedback($('feedback'), 'error', error.message);
    } finally {
      $('submit').disabled = false;
    }
  });
  loadClaims();
} else if (document.body.dataset.page === 'approvals') {
  const user = $('approval-user');
  const loadApprovals = () => {
    const activeUser = user.value;
    return showList(async () => (await api('/approvals', activeUser)).claims, (claim) => {
      const li = item(claim.title, `${claim.employee} · ${currency.format(claim.amount)} · ${statusNames[claim.status]}`);
      const actions = document.createElement('div');
      actions.className = 'actions';
      for (const [action, label] of [['approve', 'Setujui'], ['reject', 'Tolak']]) {
        const button = document.createElement('button');
        button.textContent = label;
        if (action === 'reject') button.className = 'secondary';
        button.addEventListener('click', async () => {
          for (const control of actions.children) control.disabled = true;
          try {
            const result = await api(`/approvals/${claim.id}`, activeUser, { action });
            if (user.value !== activeUser) return;
            feedback($('feedback'), 'toast', `Status klaim #${claim.id}: ${statusNames[result.claim.status]}.`);
            await loadApprovals();
          } catch (error) {
            if (user.value === activeUser) feedback($('feedback'), 'error', error.message);
          } finally {
            for (const control of actions.children) control.disabled = false;
          }
        });
        actions.append(button);
      }
      li.append(actions);
      return li;
    }, 'Tidak ada klaim yang menunggu peran ini.');
  };
  user.addEventListener('change', () => {
    feedback($('feedback'), '', '');
    loadApprovals();
  });
  loadApprovals();
} else {
  $('month').value = today.slice(0, 7);
  const loadReport = () => showList(
    async () => (await api(`/reports?${new URLSearchParams({ month: $('month').value })}`, '6')).rows,
    (row) => item(`${categoryNames[row.category]} · ${row.department}`, `${row.count} klaim · ${currency.format(row.total)}`),
    'Tidak ada klaim disetujui untuk bulan ini.',
  );
  $('report-form').addEventListener('submit', (event) => { event.preventDefault(); loadReport(); });
  loadReport();
}
