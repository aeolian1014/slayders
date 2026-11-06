/* public/admin-crm.js — CRM tab of the admin dashboard: KPIs, 30-day chart, funnel, live feed, payments, clients.
   Uses api() and fmt() from admin.js. */
'use strict';

let crmData = null, crmKey = 'users';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const when = iso => (iso ? new Date(iso).toLocaleString('uz', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const som = n => fmt(n) + " so'm";

function kpi(label, value, sub = '', accent = false) {
  return `<div class="stat-card${accent ? ' accent' : ''}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
}

function renderChart() {
  const box = document.getElementById('crmChart');
  const s = crmData.series, vals = s.map(r => r[crmKey]), max = Math.max(1, ...vals);
  const W = 900, H = 220, P = 26, bw = (W - 2 * P) / s.length;
  const bars = s.map((r, i) => {
    const h = (r[crmKey] / max) * (H - 2 * P), x = P + i * bw, y = H - P - h;
    return `<rect x="${x + 2}" y="${y}" width="${bw - 4}" height="${h}" rx="3" fill="url(#g)"><title>${r.d}: ${fmt(r[crmKey])}</title></rect>` +
      (i % 5 === 0 ? `<text x="${x + bw / 2}" y="${H - 8}" font-size="10" fill="#8a8f98" text-anchor="middle">${r.d.slice(5)}</text>` : '') +
      (r[crmKey] ? `<text x="${x + bw / 2}" y="${y - 4}" font-size="9" fill="#cfd3da" text-anchor="middle">${crmKey === 'revenue' ? Math.round(r[crmKey] / 1000) + 'k' : r[crmKey]}</text>` : '');
  }).join('');
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a29bfe"/><stop offset="1" stop-color="#5da8ff"/></linearGradient></defs>
    <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="rgba(255,255,255,.12)"/>${bars}</svg>`;
}

async function loadCrm() {
  try { crmData = await api('GET', '/crm'); } catch (e) { console.error('crm', e); return; }
  const k = crmData.kpi;
  document.getElementById('crmToday').textContent = crmData.today;
  document.getElementById('crmKpis').innerHTML = [
    kpi('Foydalanuvchilar', fmt(k.users), `bugun +${fmt(k.newToday)}`),
    kpi('Faol (1 / 7 / 30 kun)', `${k.active1} / ${k.active7} / ${k.active30}`, 'xabar yozganlar'),
    kpi('Xabarlar', fmt(k.messagesToday), `bugun · jami ${fmt(k.messagesTotal)}`),
    kpi('Buyurtmalar', fmt(k.jobsTotal), `bugun ${k.jobsToday} · navbatda ${k.jobsQueued} · xato ${k.jobsFailed}`),
    kpi('Daromad (jami)', som(k.revenueTotal), `${k.paymentsPaid} ta to'lov · ${k.payingUsers} mijoz`, true),
    kpi('Daromad bugun / 7 / 30 kun', `${fmt(k.revenueToday)} / ${fmt(k.revenue7)} / ${fmt(k.revenue30)}`, "so'm"),
    kpi("Kutilayotgan to'lovlar", fmt(k.paymentsPending), `yo'qotilgan: ${k.paymentsLost}`),
    kpi('Balanslar jami', som(k.balances), 'foydalanuvchilar hisobida'),
  ].join('');
  renderChart();
  const f0 = crmData.funnel[0].n || 1;
  document.getElementById('crmFunnel').innerHTML = crmData.funnel.map(f =>
    `<div class="crm-funnel-row"><span class="lbl">${f.step}</span><span class="bar" style="width:${Math.max(2, (f.n / f0) * 100) * 0.6}%"></span><span class="val">${f.n} <small style="color:#8a8f98">(${Math.round((f.n / f0) * 100)}%)</small></span></div>`).join('');
  document.getElementById('crmJobsBy').innerHTML = crmData.jobsBy.length ? crmData.jobsBy.map(j =>
    `<div class="crm-funnel-row"><span class="lbl">${esc(j.kind)} · ${esc(j.tier)}</span><span class="val">${esc(j.status)}: ${j.n}</span></div>`).join('') : '<div style="color:#8a8f98">—</div>';
  const ICON = { user: '🆕', job: '📄', payment: '💳' };
  document.getElementById('crmFeed').innerHTML = crmData.feed.map(e =>
    `<div><span class="t">${when(e.t)}</span><span>${ICON[e.type] || '•'} <b>${esc(e.name)}</b> — ${esc(e.type === 'user' ? "botga qo'shildi" : e.info)}</span></div>`).join('');
  document.getElementById('crmPayments').innerHTML = crmData.payments.map(p =>
    `<tr><td>${p.id}</td><td>${esc(p.name)}</td><td>${fmt(p.amount)}</td><td>${esc(p.status)}</td><td>${when(p.paid_at || p.created_at)}</td></tr>`).join('') || '<tr><td colspan="5">—</td></tr>';
  document.getElementById('crmUsers').innerHTML = crmData.topUsers.map(u =>
    `<tr data-user-id="${u.id}" style="cursor:pointer"><td>${esc(u.first_name)}</td><td>${u.username ? '@' + esc(u.username) : '—'}</td><td>${fmt(u.paid)}</td><td>${u.jobs}</td><td>${u.msgs}</td><td>${fmt(u.balance)}</td><td>${when(u.last_seen)}</td><td>${when(u.created_at)}</td></tr>`).join('');
}

document.getElementById('crmSeriesTabs').addEventListener('click', e => {
  const b = e.target.closest('[data-k]'); if (!b || !crmData) return;
  document.querySelectorAll('#crmSeriesTabs .chip').forEach(c => c.classList.toggle('active', c === b));
  crmKey = b.dataset.k; renderChart();
});
document.getElementById('refreshCrm').addEventListener('click', loadCrm);
// clicking a client opens the existing user drawer (admin.js) on the Users tab
document.getElementById('crmUsers').addEventListener('click', e => {
  const tr = e.target.closest('[data-user-id]'); if (!tr) return;
  activateTab('users'); openUserDrawer(Number(tr.dataset.userId));
});
document.querySelectorAll('[data-tab="crm"]').forEach(el => el.addEventListener('click', loadCrm));

setInterval(() => { if (document.getElementById('tab-crm').classList.contains('active')) loadCrm(); }, 60000); // live: every minute
loadCrm(); // first load (admin.js opened the CRM tab before this file loaded)
