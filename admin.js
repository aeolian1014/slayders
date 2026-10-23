/* public/admin.js — Slayders AI Admin dashboard frontend */
'use strict';

// ── Auth params from URL ─────────────────────────────────────────────────────
const SEARCH = new URLSearchParams(location.search);
const KEY     = SEARCH.get('key')  || '';
const DEV_USER = SEARCH.get('dev') || '';

// Same server-address lookup as app.js: fixed Pages page, changing tunnel address.
const ON_PAGES = location.hostname.endsWith('github.io');
const API_JSON = 'https://api.github.com/repos/aeolian1014/slayders/contents/api.json';
function cleanApi(u) {
  try { const x = new URL(u); return x.protocol === 'https:' && x.hostname.endsWith('.trycloudflare.com') ? x.origin : ''; }
  catch { return ''; }
}
let API = ON_PAGES ? cleanApi(SEARCH.get('api')) : '';
async function refreshApi() {
  if (!ON_PAGES) return false;
  try {
    const r = await fetch(API_JSON + '?t=' + Date.now(), { cache: 'no-store', headers: { Accept: 'application/vnd.github.raw+json' } });
    const u = cleanApi((await r.json()).api);
    if (u && u !== API) { API = u; return true; }
  } catch { /* offline */ }
  return false;
}

async function api(method, path, body, retried = false) {
  if (ON_PAGES && !API) await refreshApi();
  const headers = { 'Content-Type': 'application/json' };
  if (KEY)      headers['X-Admin-Key'] = KEY;
  if (DEV_USER) headers['X-Dev-User']  = DEV_USER;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  let r;
  try { r = await fetch(API + '/api/admin' + path, opts); }
  catch (err) { if (!retried && await refreshApi()) return api(method, path, body, true); throw err; }
  if ((r.status === 530 || r.status === 502) && !retried && await refreshApi()) return api(method, path, body, true);
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`${r.status}: ${text}`);
  }
  return r.json();
}

// ── Tab switching ────────────────────────────────────────────────────────────

function activateTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.add('active');

  document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(el => el.classList.add('active'));

  if (tabId === 'umumiy')   loadStats();
  if (tabId === 'users')    loadUsers();
  if (tabId === 'jobs')     loadJobs();
  if (tabId === 'settings') loadSettings();
}

document.querySelectorAll('[data-tab]').forEach(el => {
  el.addEventListener('click', () => activateTab(el.dataset.tab));
});

// Refresh button on stats tab
const refreshStatsBtn = document.getElementById('refreshStats');
if (refreshStatsBtn) {
  refreshStatsBtn.addEventListener('click', loadStats);
}

// ── Stat cards ───────────────────────────────────────────────────────────────

async function loadStats() {
  try {
    const s = await api('GET', '/stats');
    document.getElementById('statUsers').textContent    = fmt(s.users);
    document.getElementById('statNewToday').textContent = fmt(s.newUsersToday);
    document.getElementById('statMsgs').textContent     = fmt(s.messagesToday);
    document.getElementById('statJobs').textContent     = fmt(s.jobsToday);
    document.getElementById('statQueue').textContent    = fmt(s.queueLength);
    document.getElementById('statRevenue').textContent  = fmt(s.revenueSpentToday);

    renderStatusBars(s.jobsByStatus);
  } catch (e) {
    console.error('loadStats', e);
  }
}

function fmt(n) { return (n ?? 0).toLocaleString('uz'); }

const STATUS_META = {
  queued:  { label: 'Navbatda',      color: '#5da8ff' },
  running: { label: 'Bajarilmoqda', color: '#a29bfe' },
  done:    { label: 'Tayyor',        color: '#22c693' },
  failed:  { label: 'Xato',          color: '#e05c5c' },
};

function renderStatusBars(byStatus) {
  const container = document.getElementById('statusBars');
  if (!container) return;
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
  container.innerHTML = Object.entries(STATUS_META).map(([key, meta]) => {
    const n = byStatus[key] || 0;
    const pct = Math.round((n / total) * 100);
    return `
      <div class="status-bar-row">
        <div class="status-bar-label">${meta.label}</div>
        <div class="status-bar-track">
          <div class="status-bar-fill" style="width:${pct}%;background:${meta.color};"></div>
        </div>
        <div class="status-bar-count">${n}</div>
      </div>`;
  }).join('');
}

// ── Users ────────────────────────────────────────────────────────────────────

let usersPage = 1;
let usersQuery = '';
let usersTimer = null;

async function loadUsers(page = usersPage, q = usersQuery) {
  usersPage = page;
  usersQuery = q;
  try {
    const rows = await api('GET', `/users?q=${encodeURIComponent(q)}&page=${page}`);
    renderUsersTable(rows);
    renderPagination(page, rows.length, 50);
  } catch (e) { console.error('loadUsers', e); }
}

function renderUsersTable(rows) {
  const tbody = document.getElementById('usersBody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:28px">Foydalanuvchilar topilmadi</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(u => `
    <tr data-user-id="${u.id}">
      <td style="color:var(--muted);font-size:12px">${u.id}</td>
      <td style="font-weight:500">${esc(u.name || '')}</td>
      <td style="color:var(--text-sub)">${esc(u.username ? '@' + u.username : '')}</td>
      <td>${fmt(u.balance)}</td>
      <td>${fmt(u.used_today)}</td>
      <td style="color:var(--muted)">${fmtDate(u.created_at)}</td>
      <td>${fmt(u.messages_count)}</td>
      <td>${fmt(u.jobs_count)}</td>
    </tr>`).join('');

  tbody.querySelectorAll('tr[data-user-id]').forEach(tr => {
    tr.addEventListener('click', () => openUserDrawer(parseInt(tr.dataset.userId, 10)));
  });
}

function renderPagination(page, rowsLen, pageSize) {
  const pg = document.getElementById('usersPagination');
  const buttons = [];
  if (page > 1) buttons.push(`<button class="page-btn" data-page="${page - 1}">Oldingi</button>`);
  buttons.push(`<button class="page-btn active">${page}</button>`);
  if (rowsLen === pageSize) buttons.push(`<button class="page-btn" data-page="${page + 1}">Keyingi</button>`);
  pg.innerHTML = buttons.join('');
  pg.querySelectorAll('[data-page]').forEach(b => {
    b.addEventListener('click', () => loadUsers(parseInt(b.dataset.page, 10)));
  });
}

document.getElementById('userSearch').addEventListener('input', e => {
  clearTimeout(usersTimer);
  usersTimer = setTimeout(() => loadUsers(1, e.target.value.trim()), 350);
});

// ── User detail drawer ───────────────────────────────────────────────────────

async function openUserDrawer(userId) {
  const drawer = document.getElementById('userDrawer');
  const body   = document.getElementById('drawerBody');
  const title  = document.getElementById('drawerTitle');
  title.textContent = `Foydalanuvchi #${userId}`;
  body.innerHTML = '<p style="color:var(--muted)">Yuklanmoqda…</p>';
  drawer.classList.add('open');

  try {
    const { user, messages, plans, jobs } = await api('GET', `/users/${userId}`);
    title.textContent = esc(user.first_name || '') + (user.username ? ` (@${user.username})` : '') + ` #${user.id}`;

    body.innerHTML = `
      <div class="drawer-section">
        <div class="drawer-section-title">Ma'lumot</div>
        <div class="info-grid">
          <div><div class="info-item-label">ID</div><div class="info-item-value">${user.id}</div></div>
          <div><div class="info-item-label">Balans</div><div class="info-item-value" id="dd-balance">${fmt(user.balance)} so'm</div></div>
          <div><div class="info-item-label">Bugun ishlatilgan</div><div class="info-item-value">${fmt(user.used_today)}</div></div>
          <div><div class="info-item-label">A'zo bo'lgan</div><div class="info-item-value">${fmtDate(user.created_at)}</div></div>
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">Balans boshqaruv</div>
        <div class="balance-row">
          <input class="balance-input" id="dd-delta" type="number" placeholder="±miqdor" />
          <button class="btn-primary" id="dd-balance-btn">O'zgartirish</button>
          <button class="btn-danger"  id="dd-reset-btn">Bugunni tiklash</button>
        </div>
        <div id="dd-msg" style="margin-top:8px;font-size:12px;color:var(--success);"></div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">Chat (oxirgi 100 xabar)</div>
        <div class="transcript" id="dd-transcript">${renderTranscript(messages)}</div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">Rejalar (${plans.length})</div>
        ${plans.map(p => {
          let json = {};
          try { json = JSON.parse(p.json); } catch {}
          return `<div style="margin-bottom:6px;font-size:12px;color:var(--text-sub)">
            #${p.id} <span class="badge badge-${p.status}">${p.status}</span>
            ${esc(json.title || json.kind || '')}
          </div>`;
        }).join('')}
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">Buyurtmalar (${jobs.length})</div>
        ${jobs.map(j => `<div style="margin-bottom:6px;font-size:12px;color:var(--text-sub)">
          #${j.id.slice(0,8)} <span class="badge badge-${j.status}">${j.status}</span> ${esc(j.kind || '')} — ${fmtDate(j.created_at)}
        </div>`).join('')}
      </div>
    `;

    // Balance button
    document.getElementById('dd-balance-btn').addEventListener('click', async () => {
      const delta = parseInt(document.getElementById('dd-delta').value, 10);
      if (!delta) return;
      try {
        const r = await api('POST', `/users/${userId}/balance`, { delta });
        document.getElementById('dd-balance').textContent = fmt(r.balance) + ' so\'m';
        document.getElementById('dd-msg').style.color = 'var(--success)';
        document.getElementById('dd-msg').textContent = 'Balans yangilandi';
      } catch (e) {
        document.getElementById('dd-msg').style.color = 'var(--danger)';
        document.getElementById('dd-msg').textContent = e.message;
      }
    });

    // Reset today button
    document.getElementById('dd-reset-btn').addEventListener('click', async () => {
      try {
        await api('POST', `/users/${userId}/reset-today`);
        document.getElementById('dd-msg').style.color = 'var(--success)';
        document.getElementById('dd-msg').textContent = 'Bugungi limit tiklandi';
      } catch (e) {
        document.getElementById('dd-msg').style.color = 'var(--danger)';
        document.getElementById('dd-msg').textContent = e.message;
      }
    });

  } catch (e) {
    body.innerHTML = `<p style="color:var(--danger)">${esc(e.message)}</p>`;
  }
}

function renderTranscript(messages) {
  if (!messages.length) return '<p style="color:var(--muted);font-size:12px">Xabarlar yo\'q</p>';
  return messages.map(m => `
    <div class="msg-bubble msg-${m.role}">
      <div>${esc(m.text)}</div>
      <div class="msg-meta">${fmtDate(m.created_at)}${m.charged ? ' <span class="msg-charged">to\'langan</span>' : ''}</div>
    </div>`).join('');
}

document.getElementById('drawerClose').addEventListener('click', () => {
  document.getElementById('userDrawer').classList.remove('open');
});

// ── Jobs ─────────────────────────────────────────────────────────────────────

let jobsStatus = '';

async function loadJobs(status = jobsStatus) {
  jobsStatus = status;
  try {
    const rows = await api('GET', `/jobs${status ? '?status=' + status : ''}`);
    renderJobsTable(rows);
  } catch (e) { console.error('loadJobs', e); }
}

function renderJobsTable(rows) {
  const tbody = document.getElementById('jobsBody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:28px">Buyurtmalar topilmadi</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(j => `
    <tr>
      <td style="font-size:11px;color:var(--muted);font-family:monospace">${j.id.slice(0, 8)}</td>
      <td>${esc(j.user_name || '')}${j.username ? ' <span style="color:var(--muted)">@' + esc(j.username) + '</span>' : ''}</td>
      <td>${esc(j.title || j.kind || '')}</td>
      <td><span class="badge badge-${j.status}">${j.status}</span></td>
      <td style="color:var(--muted)">${fmtDate(j.created_at)}</td>
      <td>
        <div class="actions">
          ${j.status === 'failed' || j.status === 'queued'
            ? `<button class="btn-sm" data-action="retry" data-id="${j.id}">Qayta</button>`
            : ''}
          ${j.status === 'done' && j.file_path
            ? `<button class="btn-sm" data-action="send" data-id="${j.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Telegramga
              </button>`
            : ''}
        </div>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-action="send"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      btn.disabled = true;
      try { await api('POST', `/jobs/${btn.dataset.id}/send`); btn.textContent = 'Yuborildi'; }
      catch (err) { alert(err.message); btn.disabled = false; }
    });
  });
  tbody.querySelectorAll('[data-action="retry"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      btn.disabled = true;
      try {
        await api('POST', `/jobs/${btn.dataset.id}/retry`);
        loadJobs();
      } catch (err) { alert(err.message); btn.disabled = false; }
    });
  });
}

function adminKey() {
  const params = [];
  if (KEY) params.push('key=' + encodeURIComponent(KEY));
  if (DEV_USER) params.push('dev=' + encodeURIComponent(DEV_USER));
  return params.length ? '?' + params.join('&') + '&' : '?';  // chained params or bare ?
}

document.getElementById('jobFilters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  loadJobs(chip.dataset.status);
});

// ── Settings ─────────────────────────────────────────────────────────────────

async function loadSettings() {
  try {
    const s = await api('GET', '/settings');
    const form = document.getElementById('settingsForm');
    for (const [k, v] of Object.entries(s)) {
      const inp = form.elements[k];
      if (inp) inp.value = v;
    }
  } catch (e) { console.error('loadSettings', e); }
}

document.getElementById('settingsForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const msg  = document.getElementById('saveMsg');
  const body = {};
  for (const inp of form.querySelectorAll('input[name]')) {
    body[inp.name] = parseInt(inp.value, 10);
  }
  try {
    await api('POST', '/settings', body);
    msg.textContent = 'Saqlandi';
    msg.style.color = 'var(--success)';
    setTimeout(() => { msg.textContent = ''; }, 3000);
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--danger)';
  }
});

// ── Utilities ────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('uz-UZ', { hour12: false }).replace('T', ' ').slice(0, 16);
  } catch { return iso; }
}

// ── Init ─────────────────────────────────────────────────────────────────────

activateTab('umumiy');
