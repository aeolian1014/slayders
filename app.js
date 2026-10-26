/* =====================================================================
   Slayders AI — app.js  (Premium redesign, T2 — emoji-free)
   Telegram Mini App · Vanilla JS · No bundler
   API contract: /api/me, /api/history, /api/chat, /api/plan/:id/start,
                 /api/jobs/:id, /api/jobs/:id/file, /api/upload
   ===================================================================== */

'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ICON REGISTRY — Lucide-style inline SVG
   24×24 viewBox, stroke=currentColor, sw=1.75, round caps/joins, no fill
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ICONS = {
  /* service cards */
  presentation: `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" stroke-linecap="round"/>`,
  'file-text':  `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>`,
  'book-open':  `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  'list-checks':`<path d="M10 6h11M10 12h11M10 18h11"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>`,
  'grid-3x3':   `<rect x="3" y="3" width="4" height="4" rx="0.5"/><rect x="10" y="3" width="4" height="4" rx="0.5"/><rect x="17" y="3" width="4" height="4" rx="0.5"/><rect x="3" y="10" width="4" height="4" rx="0.5"/><rect x="10" y="10" width="4" height="4" rx="0.5"/><rect x="17" y="10" width="4" height="4" rx="0.5"/><rect x="3" y="17" width="4" height="4" rx="0.5"/><rect x="10" y="17" width="4" height="4" rx="0.5"/><rect x="17" y="17" width="4" height="4" rx="0.5"/>`,
  'pen-line':   `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
  target:       `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  'columns-2':  `<rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>`,
  paperclip:    `<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>`,
  /* navigation */
  home:         `<path d="M3 9.5L12 3l9 6.5V21H15v-6H9v6H3V9.5z"/>`,
  'message-circle': `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
  folder:       `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>`,
  user:         `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>`,
  /* actions */
  send:         `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  download:     `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  check:        `<polyline points="20 6 9 17 4 12"/>`,
  x:            `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  sparkles:     `<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>`,
  'arrow-right':`<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  'file-blank': `<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>`,
  empty: `<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>`,
  'graduation-cap': `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`,
};

/**
 * Returns a full <svg> string for the given icon name.
 * @param {string} name  - key in ICONS
 * @param {number} size  - px (default 20)
 * @param {string} extra - extra attributes on <svg>
 */
function icon(name, size = 20, extra = '') {
  const paths = ICONS[name] ?? ICONS['file-blank'];
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONSTANTS & LOOKUP TABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const KIND_LABELS = {
  prezentatsiya: 'Prezentatsiya',
  referat:       'Referat',
  mustaqil_ish:  'Mustaqil ish',
  test:          'Test',
  krossvord:     'Krossvord',
  esse:          'Esse',
  swot:          'SWOT tahlil',
  t_chizma:      'T-chizma',
  boshqa:        'Boshqa',
};

// Icon key for each kind (maps to ICONS registry)
const KIND_ICON = {
  prezentatsiya: 'presentation',
  referat:       'file-text',
  mustaqil_ish:  'book-open',
  test:          'list-checks',
  krossvord:     'grid-3x3',
  esse:          'pen-line',
  swot:          'target',
  t_chizma:      'columns-2',
  boshqa:        'file-blank',
};

const PLAN_FIELD_LABELS = {
  kind:        'Tur',
  title:       'Sarlavha',
  topic:       'Mavzu',
  subject:     'Fan',
  institution: 'Muassasa',
  author:      'Muallif',
  group:       'Guruh',
  size:        'Hajm',
  language:    'Til',
  style:       'Uslub',
  details:     "Qo'shimcha",
};

const JOB_STATUS_LABELS = {
  queued:  'Navbatda',
  running: 'Tayyorlanmoqda',
  done:    'Tayyor',
  failed:  'Xatolik',
};

// 4 checklist steps for the job card
const JOB_STEPS = [
  'Reja qabul qilindi',
  'Matn yozilmoqda',
  'Dizayn',
  'Fayl tayyor',
];

// Service definitions — icon key + one-line Uzbek description
const SERVICES = [
  {
    key:  'prezentatsiya',
    label: 'Prezentatsiya',
    desc:  'Slaydlar bilan taqdimot',
    iconKey: 'presentation',
  },
  {
    key:  'referat',
    label: 'Referat',
    desc:  'Ilmiy matn va manbalar',
    iconKey: 'file-text',
  },
  {
    key:  'mustaqil_ish',
    label: 'Mustaqil ish',
    desc:  "O'quv topshiriqlar",
    iconKey: 'book-open',
  },
  {
    key:  'test',
    label: 'Test',
    desc:  "Savollar to'plami",
    iconKey: 'list-checks',
  },
  {
    key:  'krossvord',
    label: 'Krossvord',
    desc:  "Soʼzlar panjara oʼyini",
    iconKey: 'grid-3x3',
  },
  {
    key:  'esse',
    label: 'Esse',
    desc:  'Fikrlar va mulohazalar',
    iconKey: 'pen-line',
  },
  {
    key:  'swot',
    label: 'SWOT tahlil',
    desc:  'Kuchli/zaif tomonlar',
    iconKey: 'target',
  },
  {
    key:  't_chizma',
    label: 'T-chizma',
    desc:  "Taqqoslash jadvali",
    iconKey: 'columns-2',
  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   THEME & AUTH HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function applyTheme() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  const p = tg.themeParams || {};
  const root = document.documentElement.style;
  const map = {
    '--tg-bg':           p.bg_color,
    '--tg-secondary-bg': p.secondary_bg_color,
    '--tg-text':         p.text_color,
    '--tg-hint':         p.hint_color,
    '--tg-link':         p.link_color,
    '--tg-button':       p.button_color,
    '--tg-button-text':  p.button_text_color,
    '--tg-header-bg':    p.header_bg_color,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v) root.setProperty(k, v);
  }
  if (p.bg_color) document.body.style.background = p.bg_color;
}

function getDevUserId() {
  return new URLSearchParams(location.search).get('dev') || null;
}
function getInitData() {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) return tg.initData;
  return null;
}
function authHeaders(extra = {}) {
  const devId = getDevUserId();
  const initData = getInitData();
  const h = { 'Content-Type': 'application/json', ...extra };
  if (devId) {
    h['X-Dev-User'] = devId;
  } else if (initData) {
    h['X-Init-Data'] = initData;
  }
  return h;
}

// The app is served from a fixed GitHub Pages address; the server sits behind a tunnel whose
// address changes on every restart, so the current one comes from ?api= or the repo's api.json.
const ON_PAGES = location.hostname.endsWith('github.io');
const API_JSON = 'https://api.github.com/repos/aeolian1014/slayders/contents/api.json';
function cleanApi(u) {
  try { const x = new URL(u); return x.protocol === 'https:' && x.hostname.endsWith('.trycloudflare.com') ? x.origin : ''; }
  catch { return ''; }
}
let API = ON_PAGES ? cleanApi(new URLSearchParams(location.search).get('api')) : '';
async function refreshApi() {
  if (!ON_PAGES) return false;
  try {
    const r = await fetch(API_JSON + '?t=' + Date.now(), { cache: 'no-store', headers: { Accept: 'application/vnd.github.raw+json' } });
    const u = cleanApi((await r.json()).api);
    if (u && u !== API) { API = u; return true; }
  } catch { /* offline */ }
  return false;
}

async function apiFetch(path, opts = {}, retried = false) {
  if (ON_PAGES && !API) await refreshApi();
  let res;
  try {
    res = await fetch(API + path, { ...opts, headers: authHeaders(opts.headers || {}) });
  } catch (err) {
    if (!retried && await refreshApi()) return apiFetch(path, opts, true);
    throw err;
  }
  // 530/502 = Cloudflare can't reach an old tunnel address
  if ((res.status === 530 || res.status === 502) && !retried && await refreshApi()) return apiFetch(path, opts, true);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return { ok: res.ok, status: res.status, data: null, raw: res };
  }
  const data = await res.json();
  return { ok: res.ok, status: res.status, data, raw: res };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UTILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('uz', { day: 'numeric', month: 'short' });
}
function haptic(type = 'light') {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
}
function hapticNotif(type = 'success') {
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
}
function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
function scrollToBottom(smooth = true) {
  const el = $msgs;
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
}
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const state = {
  me: null,
  messages: [],
  plan: null,
  jobs: [],
  runningJobs: {},
  sending: false,
  activeTab: 'home',
  // Attachment state for current message
  pendingAttachments: [], // [{file, id, name, size}] — id set after upload
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DOM REFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const $banner    = document.getElementById('banner');
const $tabBtns   = document.querySelectorAll('.tab-btn');
const $screens   = document.querySelectorAll('.screen');
const $msgs      = document.getElementById('messages');
const $typing    = document.getElementById('typing');
const $chipsBar  = document.getElementById('chips-bar');
const $input     = document.getElementById('input');
const $sendBtn   = document.getElementById('send-btn');
const $quotaInfo = document.getElementById('quota-info');
const $quotaWarn = document.getElementById('quota-warn');
const $homeLimitText  = document.getElementById('home-limit-text');
const $homeSkeleton   = document.getElementById('home-skeleton');
const $serviceGrid    = document.getElementById('service-grid');
const $filesList      = document.getElementById('files-list');
const $filesSkeleton  = document.getElementById('files-skeleton');
const $attachBtn      = document.getElementById('attach-btn');
const $fileInput      = document.getElementById('file-input');
const $attachChips    = document.getElementById('attach-chips');

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VIEWPORT STABLE HEIGHT (keyboard-safe layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function applyStableHeight() {
  const tg = window.Telegram?.WebApp;
  // Use Telegram's stable viewport height when available, otherwise fall back to dvh
  const h = tg?.viewportStableHeight
    ? `${tg.viewportStableHeight}px`
    : '100dvh';
  document.documentElement.style.setProperty('--tg-viewport-stable-height', h);
}

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.onEvent('viewportChanged', applyStableHeight);
}
applyStableHeight();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BANNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let _bannerTimer = null;
function showBanner(text, kind = 'error', autoHideMs = 0) {
  $banner.className = `banner ${kind}`;
  $banner.textContent = text;
  clearTimeout(_bannerTimer);
  if (autoHideMs) _bannerTimer = setTimeout(hideBanner, autoHideMs);
}
function hideBanner() {
  $banner.className = 'banner hidden';
  $banner.textContent = '';
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   QUOTA / LIMIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function updateQuota(freeLeft, freeLimit, balance, price) {
  if (freeLeft == null) return;
  const limit = freeLimit ?? 100;
  $quotaInfo.textContent =
    `Bugun bepul: ${freeLeft}/${limit} · Balans: ${balance ?? 0} so'm`;

  // Home limit chip
  if ($homeLimitText) {
    $homeLimitText.textContent = `Bugun ${freeLeft} ta bepul xabar qoldi`;
  }

  if (freeLeft === 0) {
    $quotaWarn.textContent =
      `Bepul xabarlar tugadi. Endi har bir xabar ${price ?? 100} so'm. ` +
      `Faqat buyurtmangiz haqida yozing.`;
    $quotaWarn.classList.remove('hidden');
  } else {
    $quotaWarn.classList.add('hidden');
  }

  // Profile ring update (if me is set)
  updateProfileRing(freeLeft, freeLimit, balance, price);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROFILE RING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function updateProfileRing(freeLeft, freeLimit, balance, price) {
  const ringFill  = document.getElementById('ring-fill');
  const ringLabel = document.getElementById('ring-label');
  const statBal   = document.getElementById('stat-balance');
  const statPrice = document.getElementById('stat-price');

  const limit = freeLimit ?? 100;
  const left  = freeLeft  ?? 0;
  const circumference = 2 * Math.PI * 50; // r=50 → ~314

  if (ringFill) {
    const pct = limit > 0 ? left / limit : 0;
    const offset = circumference * (1 - pct);
    ringFill.style.strokeDasharray = circumference;
    ringFill.style.strokeDashoffset = offset;
  }
  if (ringLabel) ringLabel.textContent = left;
  if (statBal)   statBal.textContent   = balance ?? 0;
  if (statPrice) statPrice.textContent = price ?? 100;

  // Inject SVG gradient def if missing
  injectRingGradient();
}

let _gradientInjected = false;
function injectRingGradient() {
  if (_gradientInjected) return;
  _gradientInjected = true;
  const svg = document.querySelector('.ring-svg');
  if (!svg) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#6C5CE7"/>
      <stop offset="100%" stop-color="#00B8D9"/>
    </linearGradient>`;
  svg.prepend(defs);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPING INDICATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function showTyping() { $typing.classList.remove('hidden'); scrollToBottom(); }
function hideTyping() { $typing.classList.add('hidden'); }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUGGESTION CHIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function showChips() {
  if (state.messages.length > 0) $chipsBar.classList.remove('hidden');
}
function hideChips() {
  $chipsBar.classList.add('hidden');
}

document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    haptic('medium');
    $input.value = btn.dataset.text;
    autoGrow($input);
    $input.focus();
    hideChips();
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const tgWebApp = window.Telegram?.WebApp;

function switchTab(tab, { silent = false } = {}) {
  if (state.activeTab === tab && !silent) return;
  state.activeTab = tab;

  // Update tabs
  $tabBtns.forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update screens
  $screens.forEach(s => {
    const isActive = s.id === `screen-${tab}`;
    s.classList.toggle('active', isActive);
  });

  // Telegram BackButton: show on non-home tabs
  if (tgWebApp?.BackButton) {
    if (tab === 'home') {
      tgWebApp.BackButton.hide();
    } else {
      tgWebApp.BackButton.show();
    }
  }

  // Tab-specific refresh
  if (tab === 'files') renderFilesList();
  if (tab === 'chat')  { scrollToBottom(false); showChips(); }
  if (tab === 'profile') updateProfileRing(
    state.me?.freeLeft, state.me?.freeLimit,
    state.me?.balance,  state.me?.price
  );

  // Motion: animate active screen
  if (!prefersReducedMotion() && window.Motion?.animate) {
    const screen = document.getElementById(`screen-${tab}`);
    if (screen) {
      Motion.animate(screen, { opacity: [0, 1], y: [8, 0] }, { duration: 0.18, easing: 'ease-out' });
    }
  }
}

$tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    haptic('light');
    switchTab(btn.dataset.tab);
  });
});

// Telegram back button → home
if (tgWebApp?.BackButton) {
  tgWebApp.BackButton.onClick(() => switchTab('home'));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HOME: SERVICE GRID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function buildServiceGrid() {
  $serviceGrid.innerHTML = '';
  SERVICES.forEach((svc, i) => {
    const btn = document.createElement('button');
    btn.className = 'service-card';
    btn.setAttribute('aria-label', svc.label);
    btn.innerHTML = `
      <div class="service-card-icon service-icon--${svc.iconKey}">
        ${icon(svc.iconKey, 22)}
      </div>
      <div class="service-card-body">
        <span class="service-card-label">${esc(svc.label)}</span>
        <span class="service-card-desc">${esc(svc.desc)}</span>
      </div>
      <span class="service-card-arrow">${icon('arrow-right', 16)}</span>
    `;
    btn.addEventListener('click', () => {
      haptic('medium');
      const msg = `Menga ${svc.label} kerak`;
      switchTab('chat');
      // Small delay so the tab animation completes
      setTimeout(() => {
        $input.value = msg;
        autoGrow($input);
        handleSend();
      }, 120);
    });

    // Animate in staggered with Motion if available
    if (!prefersReducedMotion() && window.Motion?.animate) {
      btn.style.opacity = '0';
      setTimeout(() => {
        Motion.animate(btn, { opacity: [0, 1], y: [14, 0] }, {
          duration: 0.22,
          easing: 'ease-out',
        });
      }, i * 40);
    }

    $serviceGrid.appendChild(btn);
  });

  // Hide skeleton
  if ($homeSkeleton) $homeSkeleton.style.display = 'none';
  $serviceGrid.style.display = 'grid';
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CHAT: BUBBLE RENDERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderBubble(role, text, ts, atts) {
  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'out' : 'in'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const chips = (atts && atts.length)
    ? `<div class="bubble-attachments">${atts.map(a => `<span class="bubble-attach-chip">${icon('paperclip', 12)}<span>${esc(a.name)}</span></span>`).join('')}</div>`
    : '';
  bubble.innerHTML = chips +
    (text ? `<span class="bubble-text">${esc(text).replace(/\n/g, '<br>')}</span>` : '') +
    (ts ? `<span class="bubble-time">${fmtTime(ts)}</span>` : '');
  row.appendChild(bubble);
  return row;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CHAT: PLAN CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderPlanCard(plan, disabled = false) {
  const card = document.createElement('div');
  card.className = 'plan-card';
  card.dataset.planId = plan.id;

  const title = document.createElement('div');
  title.className = 'plan-card-title';
  title.textContent = `Reja: ${KIND_LABELS[plan.json?.kind] || plan.json?.kind || 'Fayl'}`;
  card.appendChild(title);

  const fields = document.createElement('div');
  fields.className = 'plan-fields';
  const json = plan.json || plan; // handle both shapes
  for (const [key, label] of Object.entries(PLAN_FIELD_LABELS)) {
    const val = json[key] || plan[key];
    if (!val) continue;
    const lbl = document.createElement('span');
    lbl.className = 'plan-field-label';
    lbl.textContent = label + ':';
    const valEl = document.createElement('span');
    valEl.className = 'plan-field-value';
    valEl.textContent = key === 'kind' ? (KIND_LABELS[val] || val) : val;
    fields.appendChild(lbl);
    fields.appendChild(valEl);
  }
  card.appendChild(fields);

  const actions = document.createElement('div');
  actions.className = 'plan-actions';

  const isDeck = json.kind === 'prezentatsiya';
  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-primary';
  startBtn.innerHTML = isDeck ? '⚡ Oddiy — ~2 daqiqa' : icon('arrow-right', 16) + ' Boshlash';
  startBtn.disabled = disabled;
  startBtn.addEventListener('click', () => {
    haptic('medium');
    startPlan(plan.id, card, 'ordinary');
  });

  let premiumBtn = null;
  if (isDeck) {
    premiumBtn = document.createElement('button');
    premiumBtn.className = 'btn btn-primary';
    premiumBtn.innerHTML = '💎 Premium — 10–15 daqiqa';
    premiumBtn.disabled = disabled;
    premiumBtn.addEventListener('click', () => {
      haptic('medium');
      startPlan(plan.id, card, 'premium');
    });
  }

  const changeBtn = document.createElement('button');
  changeBtn.className = 'btn btn-ghost';
  changeBtn.innerHTML = icon('pen-line', 15) + " O'zgartirish";
  changeBtn.disabled = disabled;
  changeBtn.addEventListener('click', () => {
    haptic('light');
    $input.value = "Rejani o'zgartirmoqchiman: ";
    $input.focus();
    autoGrow($input);
  });

  actions.appendChild(startBtn);
  if (premiumBtn) actions.appendChild(premiumBtn);
  actions.appendChild(changeBtn);
  if (premiumBtn) {
    const note = document.createElement('div');
    note.className = 'plan-tier-note';
    note.textContent = 'Premium taqdimot ancha chiroyli, lekin tayyorlanishi 10–15 daqiqa davom etadi.';
    actions.appendChild(note);
  }
  card.appendChild(actions);

  return card;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CHAT: JOB CARD (step checklist)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Map job.status to step states:
 *  queued  → step 0 active, rest pending
 *  running → step 1–2 animate (cycle on timer), step 0 done
 *  done    → all steps done
 *  failed  → step at running mark as failed
 */
function jobStepStates(job) {
  const { status } = job;
  if (status === 'queued') {
    return ['active', 'pending', 'pending', 'pending'];
  }
  if (status === 'running') {
    // steps 0,1 done, step 2 active, step 3 pending
    return ['done', 'done', 'active', 'pending'];
  }
  if (status === 'done') {
    return ['done', 'done', 'done', 'done'];
  }
  if (status === 'failed') {
    return ['done', 'failed', 'pending', 'pending'];
  }
  return ['pending', 'pending', 'pending', 'pending'];
}

function renderJobCard(job) {
  const card = document.createElement('div');
  card.className = `job-card status-${job.status}`;
  card.id = `job-${job.id}`;

  // Header
  const header = document.createElement('div');
  header.className = 'job-card-header';
  const badge = document.createElement('span');
  badge.className = 'job-kind-badge';
  badge.textContent = KIND_LABELS[job.kind] || job.kind || 'Fayl';
  const titleEl = document.createElement('span');
  titleEl.className = 'job-title';
  titleEl.textContent = job.title || 'Fayl tayyorlanmoqda';
  header.appendChild(badge);
  if (job.tier === 'premium') {
    const prem = document.createElement('span');
    prem.className = 'job-premium-badge';
    prem.textContent = '💎 Premium';
    header.appendChild(prem);
  }
  header.appendChild(titleEl);
  card.appendChild(header);

  // Status row
  const statusRow = document.createElement('div');
  statusRow.className = 'job-status-row';
  const dot = document.createElement('span');
  dot.className = 'job-status-dot';
  const statusText = document.createElement('span');
  statusText.textContent = _jobStatusText(job);
  statusRow.append(dot, statusText);
  card.appendChild(statusRow);

  // Step checklist
  const stepsEl = document.createElement('div');
  stepsEl.className = 'job-steps';
  const stepStates = jobStepStates(job);
  JOB_STEPS.forEach((label, i) => {
    const step = document.createElement('div');
    const st = stepStates[i];
    step.className = `job-step ${st}`;
    const stepDot = document.createElement('div');
    stepDot.className = 'step-dot';
    // Use SVG icons instead of text symbols
    if (st === 'done')   stepDot.innerHTML = icon('check', 10);
    if (st === 'failed') stepDot.innerHTML = icon('x', 10);
    const stepLbl = document.createElement('span');
    stepLbl.textContent = label;
    step.append(stepDot, stepLbl);
    stepsEl.appendChild(step);
  });
  card.appendChild(stepsEl);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'job-actions';

  if (job.status === 'done' && job.download) {
    const dlBtn = document.createElement('button');
    dlBtn.className = 'btn btn-success';
    dlBtn.innerHTML = icon('download', 16) + ' Yuklab olish';
    dlBtn.addEventListener('click', () => sendFileToChat(job.id));
    actions.appendChild(dlBtn);

    const sentMsg = document.createElement('span');
    sentMsg.style.cssText = 'font-size:12px;color:var(--tg-hint);align-self:center;display:flex;align-items:center;gap:4px';
    sentMsg.innerHTML = icon('send', 13) + ' Telegramga yuborildi';
    actions.appendChild(sentMsg);
  }
  if (job.status === 'failed') {
    const errMsg = document.createElement('div');
    errMsg.className = 'job-error-msg';
    errMsg.textContent = job.error
      ? `Xatolik: ${job.error}`
      : "Fayl yaratishda xatolik yuz berdi. Qayta urinib ko'ring.";
    card.appendChild(errMsg);
  }
  if (actions.children.length) card.appendChild(actions);

  return card;
}

function _jobStatusText(job) {
  const base = JOB_STATUS_LABELS[job.status] || job.status;
  if (job.status === 'queued' && job.position != null) {
    return `${base} (${job.position}-navbat)`;
  }
  return base;
}

function updateJobCard(job) {
  const existing = document.getElementById(`job-${job.id}`);
  if (!existing) return;
  const fresh = renderJobCard(job);
  existing.replaceWith(fresh);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOAD /api/me
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function loadMe() {
  const { ok, data } = await apiFetch('/api/me');
  if (!ok || !data) return;
  state.me = data;
  updateQuota(data.freeLeft, data.freeLimit, data.balance, data.price);

  // Profile name
  const nameEl = document.getElementById('profile-name');
  if (nameEl && data.user?.first_name) {
    nameEl.textContent = data.user.first_name;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOAD /api/history
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function loadHistory() {
  const { ok, data } = await apiFetch('/api/history');
  if (!ok || !data) return;

  const { messages, plan, jobs } = data;
  state.messages = messages || [];
  state.plan     = plan || null;
  state.jobs     = jobs || [];

  $msgs.innerHTML = '';

  if (!messages || messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      `<div class="empty-state-icon">${icon('book-open', 40)}</div>` +
      '<div class="empty-state-title">Salom! Men Slayders AI</div>' +
      '<div class="empty-state-sub">Referat, prezentatsiya, esse va boshqalar<br>uchun pastdagi xizmatlardan birini tanlang.</div>';
    $msgs.appendChild(empty);
  } else {
    for (const msg of messages) {
      $msgs.appendChild(renderBubble(msg.role, msg.text, msg.created_at, msg.attachments));
    }
    showChips();
  }

  if (plan && plan.status === 'proposed') {
    $msgs.appendChild(renderPlanCard(plan, false));
    state.plan = plan;
  }

  for (const job of jobs) {
    $msgs.appendChild(renderJobCard(job));
    if (job.status === 'queued' || job.status === 'running') {
      startPollingJob(job.id);
    }
  }

  scrollToBottom(false);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FILES SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderFilesList() {
  const jobs = state.jobs;
  $filesSkeleton.style.display = 'none';
  $filesList.innerHTML = '';

  if (!jobs || jobs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      `<div class="empty-state-icon">${icon('folder', 40)}</div>` +
      "<div class=\"empty-state-title\">Hali fayllar yo'q</div>" +
      "<div class=\"empty-state-sub\">Buyurtma bergach fayllar shu yerda ko'rinadi.</div>";
    $filesList.appendChild(empty);
    return;
  }

  // Most recent first
  const sorted = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  sorted.forEach((job, i) => {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.setAttribute('role', 'listitem');

    const iconKey = KIND_ICON[job.kind] || 'file-blank';
    const iconEl = document.createElement('div');
    iconEl.className = `file-icon file-icon--${iconKey}`;
    iconEl.innerHTML = icon(iconKey, 20);

    const info = document.createElement('div');
    info.className = 'file-info';

    const titleEl = document.createElement('div');
    titleEl.className = 'file-title';
    titleEl.textContent = KIND_LABELS[job.kind] || job.kind || 'Fayl';

    const meta = document.createElement('div');
    meta.className = 'file-meta';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = job.created_at ? fmtDate(job.created_at) : '';
    const statusBadge = document.createElement('span');
    statusBadge.className = `file-status-badge badge-${job.status}`;

    // Small colored dot + label (no emoji)
    const dotSpan = document.createElement('span');
    dotSpan.className = 'badge-dot';
    const lblSpan = document.createElement('span');
    lblSpan.textContent = JOB_STATUS_LABELS[job.status] || job.status;
    statusBadge.append(dotSpan, lblSpan);

    meta.append(dateSpan, statusBadge);
    info.append(titleEl, meta);
    row.append(iconEl, info);

    if (job.status === 'done') {
      const dlBtn = document.createElement('button');
      dlBtn.className = 'file-dl-btn';
      dlBtn.setAttribute('aria-label', 'Yuklab olish');
      dlBtn.innerHTML = icon('download', 18);
      dlBtn.addEventListener('click', () => sendFileToChat(job.id));
      row.appendChild(dlBtn);
    }

    // Animate in with stagger
    if (!prefersReducedMotion() && window.Motion?.animate) {
      row.style.opacity = '0';
      setTimeout(() => {
        Motion.animate(row, { opacity: [0, 1], y: [10, 0] }, { duration: 0.2, easing: 'ease-out' });
      }, i * 50);
    }

    $filesList.appendChild(row);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SEND MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function sendMessage(text, atts = []) {
  if (state.sending || (!text.trim() && !atts.length)) return;
  state.sending = true;
  $sendBtn.disabled = true;
  $input.disabled   = true;
  hideBanner();
  hideChips();

  // Optimistic user bubble
  $msgs.querySelector('.empty-state')?.remove();
  const userBubble = renderBubble('user', text, new Date().toISOString(), atts);
  $msgs.appendChild(userBubble);
  scrollToBottom();
  showTyping();

  try {
    const { ok, status, data } = await apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ text, attachmentIds: atts.map(a => a.id) }),
    });
    hideTyping();

    if (status === 402 && data) {
      hapticNotif('error');
      showBanner(data.error || 'Balans yetarli emas.', 'error');
      updateQuota(data.freeLeft ?? 0, state.me?.freeLimit, data.balance, state.me?.price);
      userBubble.remove();
    } else if (!ok || !data) {
      hapticNotif('error');
      showBanner("Serverda xatolik yuz berdi. Qayta urinib ko'ring.", 'error');
      userBubble.remove();
    } else {
      updateQuota(data.freeLeft, state.me?.freeLimit, data.balance, state.me?.price);
      if (data.me) state.me = { ...state.me, ...data.me };

      if (data.reply) {
        $msgs.appendChild(renderBubble('assistant', data.reply, new Date().toISOString()));
      }
      if (data.plan) {
        state.plan = data.plan;
        document.querySelectorAll('.plan-card').forEach(el => el.remove());
        $msgs.appendChild(renderPlanCard(data.plan, false));
      }
      scrollToBottom();
      showChips();
    }
  } catch {
    hideTyping();
    hapticNotif('error');
    showBanner('Tarmoq xatosi. Internetni tekshiring.', 'error');
    userBubble.remove();
  } finally {
    state.sending    = false;
    $sendBtn.disabled = false;
    $input.disabled   = false;
    $input.focus();
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   START PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function startPlan(planId, cardEl, tier = 'ordinary') {
  cardEl?.querySelectorAll('button').forEach(b => { b.disabled = true; });

  const { ok, data, status } = await apiFetch(`/api/plan/${planId}/start`, {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });

  if (ok && data?.busy) {
    hapticNotif('error');
    cardEl?.querySelectorAll('.plan-busy-msg, .plan-busy-btn').forEach(e => e.remove());
    const msg = document.createElement('div');
    msg.className = 'plan-busy-msg';
    msg.textContent = data.message;
    const fallback = document.createElement('button');
    fallback.className = 'btn btn-primary plan-busy-btn';
    fallback.textContent = 'Oddiy taqdimot yaratish';
    fallback.addEventListener('click', () => { haptic('medium'); startPlan(planId, cardEl, 'ordinary'); });
    const actions = cardEl?.querySelector('.plan-actions');
    actions?.append(msg, fallback);
    actions?.querySelectorAll('button').forEach(b => { if (b !== fallback) b.disabled = false; });
    return;
  }

  if (!ok || !data) {
    hapticNotif('error');
    showBanner(
      status === 402
        ? (data?.error || 'Balans yetarli emas.')
        : "Rejani boshlashda xatolik. Qayta urinib ko'ring.",
      'error'
    );
    cardEl?.querySelectorAll('button').forEach(b => { b.disabled = false; });
    return;
  }

  const job = data.job;
  state.jobs.push(job);
  const jobCard = renderJobCard(job);
  cardEl?.replaceWith(jobCard);
  showBanner('Fayl tayyorlanmoqda! Biroz kuting…', 'info', 4000);
  haptic('medium');
  startPollingJob(job.id);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   JOB POLLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function startPollingJob(jobId) {
  if (state.runningJobs[jobId]) return;

  const handle = setInterval(async () => {
    const { ok, data } = await apiFetch(`/api/jobs/${jobId}`);
    if (!ok || !data) return;

    // Update state.jobs entry
    const idx = state.jobs.findIndex(j => j.id === jobId);
    if (idx !== -1) state.jobs[idx] = { ...state.jobs[idx], ...data };
    else state.jobs.push(data);

    updateJobCard({ ...data, download: data.download || null });

    if (data.status === 'done') {
      clearInterval(handle);
      delete state.runningJobs[jobId];
      hapticNotif('success');
      showBanner('Fayl tayyor! Yuklab olishingiz mumkin.', 'info', 6000);
      // Also refresh files tab
      renderFilesList();
    } else if (data.status === 'failed') {
      clearInterval(handle);
      delete state.runningJobs[jobId];
      hapticNotif('error');
    }
  }, 5000);

  state.runningJobs[jobId] = handle;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INPUT HANDLERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

$input.addEventListener('input', () => autoGrow($input));
$input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
$sendBtn.addEventListener('click', () => { haptic('medium'); handleSend(); });

function handleSend() {
  const text = $input.value.trim();
  const pend = state.pendingAttachments;
  if (pend.some(a => !a.id)) { showBanner('Fayllar yuklanmoqda, biroz kuting.', 'info', 2500); return; }
  const atts = pend.map(a => ({ id: a.id, name: a.name }));
  if (!text && !atts.length) return;
  $input.value = '';
  autoGrow($input);
  state.pendingAttachments = [];
  renderAttachChips();
  sendMessage(text, atts);
}

/* ---- Attachments ---- */
const ATTACH_MAX_BYTES = 20 * 1024 * 1024;
const ATTACH_MAX_COUNT = 5;
const ATTACH_EXT = /\.(pdf|docx?|pptx?|txt|jpe?g|png)$/i;

function fmtSize(n) {
  return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
}

function dropAttachment(a) {
  state.pendingAttachments = state.pendingAttachments.filter(x => x !== a);
  renderAttachChips();
}

function renderAttachChips() {
  $attachChips.innerHTML = '';
  $attachChips.classList.toggle('hidden', !state.pendingAttachments.length);
  for (const a of state.pendingAttachments) {
    const chip = document.createElement('div');
    chip.className = 'attach-chip';
    chip.setAttribute('role', 'listitem');
    chip.innerHTML =
      `<span class="attach-chip-name">${esc(a.name)}</span>` +
      `<span class="attach-chip-size">${fmtSize(a.size)}</span>` +
      `<button type="button" class="attach-chip-remove" aria-label="Olib tashlash">${icon('x', 14)}</button>` +
      `<span class="attach-chip-progress" style="width:${a.id ? 100 : a.progress}%"></span>`;
    chip.querySelector('button').addEventListener('click', () => { a.xhr?.abort(); dropAttachment(a); });
    a.bar = chip.querySelector('.attach-chip-progress');
    $attachChips.appendChild(chip);
  }
}

// Files are delivered as Telegram messages: a link download does not work inside the Telegram app.
async function sendFileToChat(jobId) {
  haptic('medium');
  try {
    const { ok, data } = await apiFetch(`/api/jobs/${jobId}/send`, { method: 'POST' });
    if (ok) showBanner('Fayl Telegram chatingizga yuborildi.', 'info', 3000);
    else showBanner(data?.error || 'Faylni yuborib bo\'lmadi.', 'error', 4000);
  } catch {
    showBanner('Tarmoq xatosi. Qayta urinib ko\'ring.', 'error', 4000);
  }
}

function uploadAttachment(a) {
  const fd = new FormData();
  fd.append('file', a.file, a.name);
  const xhr = new XMLHttpRequest();
  a.xhr = xhr;
  xhr.open('POST', API + '/api/upload');
  const h = authHeaders(); delete h['Content-Type']; // browser sets the multipart boundary
  for (const k in h) xhr.setRequestHeader(k, h[k]);
  xhr.upload.onprogress = e => {
    if (!e.lengthComputable) return;
    a.progress = Math.round(e.loaded / e.total * 100);
    if (a.bar) a.bar.style.width = a.progress + '%';
  };
  xhr.onload = () => {
    let d = null; try { d = JSON.parse(xhr.responseText); } catch { /* ignore */ }
    if (xhr.status === 200 && d?.id) { a.id = d.id; renderAttachChips(); }
    else { showBanner(d?.error || 'Fayl yuklanmadi.', 'error', 4000); dropAttachment(a); }
  };
  xhr.onerror = () => { showBanner('Tarmoq xatosi. Fayl yuklanmadi.', 'error', 4000); dropAttachment(a); };
  xhr.send(fd);
}

function addFiles(files) {
  for (const f of files) {
    if (state.pendingAttachments.length >= ATTACH_MAX_COUNT) { showBanner(`Eng ko'pi bilan ${ATTACH_MAX_COUNT} ta fayl.`, 'warn', 3000); break; }
    if (!ATTACH_EXT.test(f.name)) { showBanner(`"${f.name}" turi qo'llab-quvvatlanmaydi.`, 'warn', 3000); continue; }
    if (f.size > ATTACH_MAX_BYTES) { showBanner(`"${f.name}" 20 MB dan katta.`, 'warn', 3000); continue; }
    const a = { file: f, name: f.name, size: f.size, progress: 0, id: null };
    state.pendingAttachments.push(a);
    uploadAttachment(a);
  }
  renderAttachChips();
}

$attachBtn.addEventListener('click', () => { haptic('light'); $fileInput.click(); });
$fileInput.addEventListener('change', () => { addFiles([...$fileInput.files]); $fileInput.value = ''; });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function init() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    applyTheme();
    tg.onEvent('themeChanged', applyTheme);
  }

  // Build home grid immediately (no API needed)
  buildServiceGrid();

  // Parallel API calls
  await Promise.all([loadMe(), loadHistory()]);

  // Show correct initial tab (silent so no double-switch)
  switchTab('home', { silent: true });
}

init();
