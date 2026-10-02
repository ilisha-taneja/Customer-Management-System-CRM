/* ============================================================
   Nimbus CRM — script.js
   Sections:
   1. State + seed data
   2. Storage helpers
   3. Utilities (escape, format, toast, modal)
   4. Auth + permissions
   5. Router
   6. Page renderers
   7. Modals (forms, confirm, email, interaction)
   8. Export / import
   9. Event handlers
   10. Boot
   ============================================================ */

/* ============ 1. STATE + SEED DATA ============ */

const KEYS = {
  customers: 'crm_customers',
  leads: 'crm_leads',
  interactions: 'crm_interactions',
  users: 'crm_users',
  settings: 'crm_settings',
  session: 'crm_session'
};

const state = {
  customers: [],
  leads: [],
  interactions: [],
  users: [],
  settings: {},
  session: null,
  editingCustomerId: null,
  customerPage: 1,
  customerSearch: '',
  customerStatus: 'all',
  customerSort: { key: 'name', dir: 'asc' },
  leadSearch: '',
  leadStatus: 'all',
  intFilters: { type: 'all', customer: 'all', from: '', to: '' },
  report: { type: 'customers', from: '', to: '', status: 'all', activityType: 'all' },
  charts: {}
};

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function isoDaysAgo(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour === undefined ? 10 : hour, (days * 7) % 60, 0, 0);
  return d.toISOString();
}

function seedData() {
  const users = [
    { id: 'u_admin', name: 'Olivia Bennett', email: 'admin@nimbus.test', password: 'admin123', role: 'Admin' },
    { id: 'u_manager', name: 'Daniel Reyes', email: 'manager@nimbus.test', password: 'manager123', role: 'Manager' },
    { id: 'u_agent', name: 'Sophia Kim', email: 'agent@nimbus.test', password: 'agent123', role: 'Agent' }
  ];

  const customers = [
    { id: 'c1', name: 'Aarav Sharma', email: 'aarav.sharma@nexatech.io', phone: '+91 98110 22334', company: 'Nexatech Solutions', status: 'Active', notes: 'Renewal discussion due next quarter. Prefers email over calls.', createdAt: isoDaysAgo(120) },
    { id: 'c2', name: 'Bella Martins', email: 'bella.martins@brightlane.co', phone: '+1 415 555 0132', company: 'Brightlane Media', status: 'Active', notes: 'Runs the marketing team of 12. Interested in analytics add-on.', createdAt: isoDaysAgo(104) },
    { id: 'c3', name: 'Carlos Mendez', email: 'carlos.mendez@vortexlabs.com', phone: '+1 646 555 0177', company: 'Vortex Labs', status: 'Inactive', notes: 'Paused contract in March. Follow up in September.', createdAt: isoDaysAgo(96) },
    { id: 'c4', name: 'Diana Okoye', email: 'diana.okoye@lumenbank.com', phone: '+44 20 7946 0158', company: 'Lumen Bank', status: 'Active', notes: 'Enterprise account. Requires quarterly business reviews.', createdAt: isoDaysAgo(88) },
    { id: 'c5', name: 'Ethan Brooks', email: 'ethan.brooks@stackform.dev', phone: '+1 512 555 0199', company: 'Stackform', status: 'Lead', notes: 'Came through webinar. Evaluating two vendors.', createdAt: isoDaysAgo(74) },
    { id: 'c6', name: 'Fatima Zahra', email: 'fatima.zahra@oasiscorp.ae', phone: '+971 50 555 0123', company: 'Oasis Corporation', status: 'Active', notes: 'Wants multi-currency invoicing before signing.', createdAt: isoDaysAgo(66) },
    { id: 'c7', name: 'Georg Petrov', email: 'georg.petrov@helixsoft.de', phone: '+49 30 55501188', company: 'HelixSoft GmbH', status: 'Inactive', notes: 'Budget freeze until next fiscal year.', createdAt: isoDaysAgo(58) },
    { id: 'c8', name: 'Hana Sato', email: 'hana.sato@kiteanalytics.jp', phone: '+81 3 5550 0142', company: 'Kite Analytics', status: 'Active', notes: 'Power user. Great candidate for case study.', createdAt: isoDaysAgo(47) },
    { id: 'c9', name: 'Ibrahim Khan', email: 'ibrahim.khan@northwind.pk', phone: '+92 300 5550123', company: 'Northwind Traders', status: 'Lead', notes: 'Referred by Hana Sato. Needs a demo next week.', createdAt: isoDaysAgo(33) },
    { id: 'c10', name: 'Julia Nowak', email: 'julia.nowak@pixelforge.pl', phone: '+48 22 555 0176', company: 'PixelForge', status: 'Active', notes: 'On the Growth plan, expanding seats in Q4.', createdAt: isoDaysAgo(24) },
    { id: 'c11', name: 'Kevin Zhao', email: 'kevin.zhao@meridian.app', phone: '+1 206 555 0148', company: 'Meridian App', status: 'Active', notes: 'Technical contact for the API integration.', createdAt: isoDaysAgo(15) },
    { id: 'c12', name: 'Laura Fernandez', email: 'laura.fernandez@solargrid.es', phone: '+34 91 555 0164', company: 'SolarGrid Energy', status: 'Inactive', notes: 'Waiting on procurement approval.', createdAt: isoDaysAgo(6) }
  ];

  const leads = [
    { id: 'l1', name: 'Marcus Webb', company: 'Orbit Retail', email: 'marcus.webb@orbitretail.com', phone: '+1 312 555 0111', source: 'Website', status: 'New', value: 4800, createdAt: isoDaysAgo(21) },
    { id: 'l2', name: 'Priya Nair', company: 'CloudNest', email: 'priya.nair@cloudnest.io', phone: '+91 98200 11223', source: 'Referral', status: 'Contacted', value: 12500, createdAt: isoDaysAgo(19) },
    { id: 'l3', name: 'Tom Gallagher', company: 'Fieldstone Ltd', email: 'tom.g@fieldstone.co.uk', phone: '+44 20 7946 0222', source: 'Cold Call', status: 'Qualified', value: 9200, createdAt: isoDaysAgo(16) },
    { id: 'l4', name: 'Sofia Ricci', company: 'Vela Fashion', email: 'sofia.ricci@velafashion.it', phone: '+39 06 555 0133', source: 'Social', status: 'Proposal', value: 15750, createdAt: isoDaysAgo(13) },
    { id: 'l5', name: 'Noah Pierce', company: 'Redwood Health', email: 'noah.pierce@redwood.health', phone: '+1 617 555 0144', source: 'Event', status: 'Won', value: 22000, createdAt: isoDaysAgo(11) },
    { id: 'l6', name: 'Amara Diallo', company: 'Sahel Foods', email: 'amara.diallo@sahelfoods.com', phone: '+221 77 555 0155', source: 'Website', status: 'New', value: 6400, createdAt: isoDaysAgo(8) },
    { id: 'l7', name: 'Lukas Meyer', company: 'Bauhaus Digital', email: 'lukas.meyer@bauhausdigital.de', phone: '+49 89 5550166', source: 'Ad', status: 'Lost', value: 3800, createdAt: isoDaysAgo(6) },
    { id: 'l8', name: 'Grace Kim', company: 'Nova Learning', email: 'grace.kim@novalearning.kr', phone: '+82 2 555 0177', source: 'Referral', status: 'Contacted', value: 8800, createdAt: isoDaysAgo(4) },
    { id: 'l9', name: 'Victor Alvarez', company: 'Toroline Logistics', email: 'victor.alvarez@toroline.mx', phone: '+52 55 5555 0188', source: 'Event', status: 'Qualified', value: 18400, createdAt: isoDaysAgo(2) }
  ];

  const rawInteractions = [
    ['c1', 'Call', 'Renewal timeline check-in', 'Discussed renewal dates; budget confirmed for next year.', 118, 10, 'Olivia Bennett'],
    ['c1', 'Email', 'Sent updated pricing sheet', 'Shared the new volume pricing tiers.', 96, 9, 'Sophia Kim'],
    ['c2', 'Meeting', 'Analytics add-on walkthrough', 'Demoed the analytics module to a team of 6.', 92, 14, 'Daniel Reyes'],
    ['c3', 'Call', 'Contract pause discussion', 'Customer pausing until their budget reopens.', 84, 11, 'Olivia Bennett'],
    ['c4', 'Email', 'QBR agenda proposal', 'Sent agenda for the quarterly business review.', 76, 16, 'Daniel Reyes'],
    ['c4', 'Meeting', 'Quarterly business review', 'Reviewed usage, SLA and expansion options.', 70, 15, 'Olivia Bennett'],
    ['c5', 'Call', 'Discovery call', 'Needs SSO and audit logs before evaluating further.', 68, 10, 'Sophia Kim'],
    ['c6', 'Email', 'Multi-currency requirements', 'Requested details on supported currencies.', 61, 12, 'Sophia Kim'],
    ['c2', 'Email', 'Case study draft review', 'Sent first draft for customer approval.', 55, 9, 'Daniel Reyes'],
    ['c7', 'Call', 'Budget freeze notice', 'Will revisit after their fiscal year starts.', 49, 13, 'Olivia Bennett'],
    ['c8', 'Meeting', 'Integration planning session', 'Mapped the data sync workflow with their engineers.', 44, 11, 'Daniel Reyes'],
    ['c8', 'Email', 'API credentials issued', 'Shared sandbox keys and docs.', 40, 10, 'Sophia Kim'],
    ['c9', 'Call', 'Referral introduction', 'Hana referred Ibrahim; intro call completed.', 34, 15, 'Sophia Kim'],
    ['c1', 'Email', 'Security questionnaire', 'Returned completed vendor security questionnaire.', 30, 9, 'Olivia Bennett'],
    ['c10', 'Meeting', 'Seat expansion discussion', 'Adding 8 seats from October.', 27, 14, 'Daniel Reyes'],
    ['c11', 'Call', 'API integration kickoff', 'Aligned on webhook events and rate limits.', 22, 10, 'Sophia Kim'],
    ['c12', 'Email', 'Proposal follow-up', 'Awaiting procurement sign-off.', 18, 12, 'Olivia Bennett'],
    ['c5', 'Email', 'Demo follow-up materials', 'Shared comparison sheet and trial credentials.', 14, 9, 'Sophia Kim'],
    ['c2', 'Call', 'Ad campaign planning', 'Reviewed upcoming campaign calendar.', 11, 16, 'Daniel Reyes'],
    ['c9', 'Meeting', 'Product demo', 'Showed pipeline and reporting modules.', 8, 14, 'Daniel Reyes'],
    ['c4', 'Email', 'Compliance documentation', 'Sent SOC 2 report under NDA.', 5, 11, 'Olivia Bennett'],
    ['c6', 'Call', 'Contract redlines', 'Legal reviewing the MSA v3.', 4, 15, 'Olivia Bennett'],
    ['c11', 'Meeting', 'Sprint planning with their team', 'Agreed on phase-1 integration scope.', 3, 13, 'Sophia Kim'],
    ['c1', 'Email', 'Onboarding checklist', 'Shared onboarding steps for new team members.', 1, 10, 'Sophia Kim'],
    ['c10', 'Call', 'Upcoming invoice query', 'Confirmed proration for added seats.', 0, 9, 'Daniel Reyes']
  ];

  const interactions = rawInteractions.map((r, i) => ({
    id: 'i' + (i + 1),
    customerId: r[0],
    type: r[1],
    subject: r[2],
    notes: r[3],
    date: isoDaysAgo(r[4], r[5]),
    createdBy: r[6]
  }));

  const settings = {
    companyName: 'Nimbus CRM',
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    itemsPerPage: 10
  };

  return { users, customers, leads, interactions, settings };
}

/* ============ 2. STORAGE HELPERS ============ */

function readKey(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    toast('Storage unavailable — changes are kept in memory only.', 'error');
  }
}

function loadAll() {
  const seed = seedData();
  state.settings = Object.assign({}, seed.settings, readKey(KEYS.settings) || {});
  state.users = readKey(KEYS.users) || seed.users;
  state.customers = readKey(KEYS.customers) || seed.customers;
  state.leads = readKey(KEYS.leads) || seed.leads;
  state.interactions = readKey(KEYS.interactions) || seed.interactions;
  state.session = readKey(KEYS.session);

  if (!Array.isArray(state.users) || !state.users.length) state.users = seed.users;
  if (!Array.isArray(state.customers)) state.customers = seed.customers;
  if (!Array.isArray(state.leads)) state.leads = seed.leads;
  if (!Array.isArray(state.interactions)) state.interactions = seed.interactions;

  saveAll();
}

function saveAll() {
  writeKey(KEYS.settings, state.settings);
  writeKey(KEYS.users, state.users);
  writeKey(KEYS.customers, state.customers);
  writeKey(KEYS.leads, state.leads);
  writeKey(KEYS.interactions, state.interactions);
}

const saveCustomers = () => writeKey(KEYS.customers, state.customers);
const saveLeads = () => writeKey(KEYS.leads, state.leads);
const saveInteractions = () => writeKey(KEYS.interactions, state.interactions);
const saveUsers = () => writeKey(KEYS.users, state.users);
const saveSettings = () => writeKey(KEYS.settings, state.settings);
const saveSession = () => (state.session ? writeKey(KEYS.session, state.session) : localStorage.removeItem(KEYS.session));

/* ============ 3. UTILITIES ============ */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  return ((parts[0] || '?')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const p = (n) => String(n).padStart(2, '0');
  const dd = p(d.getDate());
  const mm = p(d.getMonth() + 1);
  const yy = d.getFullYear();
  switch (state.settings.dateFormat) {
    case 'DD/MM/YYYY': return dd + '/' + mm + '/' + yy;
    case 'YYYY-MM-DD': return yy + '-' + mm + '-' + dd;
    default: return mm + '/' + dd + '/' + yy;
  }
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return fmtDate(iso) + ', ' + h + ':' + m + ' ' + ampm;
}

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$' };

function fmtMoney(value) {
  const cur = state.settings.currency || 'USD';
  const num = Number(value) || 0;
  const sym = CURRENCY_SYMBOLS[cur] || cur + ' ';
  return sym + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function statusBadge(status) {
  const cls = 'badge badge-' + String(status).toLowerCase();
  return '<span class="' + cls + '">' + esc(status) + '</span>';
}

function typeBadge(type) {
  return '<span class="badge badge-' + String(type).toLowerCase() + '">' + esc(type) + '</span>';
}

function roleBadge(role) {
  return '<span class="badge badge-' + String(role).toLowerCase() + '">' + esc(role) + '</span>';
}

function customerById(id) {
  return state.customers.find((c) => c.id === id) || null;
}

function leadById(id) {
  return state.leads.find((l) => l.id === id) || null;
}

function userById(id) {
  return state.users.find((u) => u.id === id) || null;
}

function emptyState(icon, title, message, buttonHTML) {
  return (
    '<div class="empty">' +
    '<i class="fa-solid ' + icon + '"></i>' +
    '<h4>' + esc(title) + '</h4>' +
    '<p>' + esc(message) + '</p>' +
    (buttonHTML || '') +
    '</div>'
  );
}

function toast(message, type) {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.setAttribute('role', 'status');
  el.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i><span>' + esc(message) + '</span>';
  $('#toastRoot').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, 2800);
}

function openModal(title, bodyHTML, footerHTML) {
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal-head">' +
        '<h3>' + esc(title) + '</h3>' +
        '<button type="button" class="modal-close" data-action="modal-close" aria-label="Close dialog"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div class="modal-body">' + bodyHTML + '</div>' +
      '<div class="modal-foot">' + (footerHTML || '') + '</div>' +
    '</div>';
  $('#modalRoot').appendChild(wrap);
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) closeModal(); });
  const focusable = wrap.querySelector('input, select, textarea');
  if (focusable) focusable.focus();
  return wrap;
}

function closeModal() {
  $('#modalRoot').innerHTML = '';
}

function confirmAction(opts, onYes) {
  const title = opts.title || 'Are you sure?';
  const wrap = openModal(
    title,
    '<p>' + esc(opts.message || '') + '</p>',
    '<button type="button" class="btn btn-ghost" data-modal-cancel>' + esc(opts.cancelText || 'Cancel') + '</button>' +
    '<button type="button" class="btn ' + (opts.danger === false ? 'btn-primary' : 'btn-danger') + '" data-modal-ok>' + esc(opts.confirmText || 'Delete') + '</button>'
  );
  $('[data-modal-cancel]', wrap).addEventListener('click', closeModal);
  $('[data-modal-ok]', wrap).addEventListener('click', () => { closeModal(); onYes(); });
}

function setFieldError(input, errEl, message) {
  if (input) input.classList.toggle('invalid', Boolean(message));
  if (errEl) errEl.textContent = message || '';
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
}

function isPhone(v) {
  return /^\+?[0-9\s\-().]{7,20}$/.test(String(v).trim()) && (String(v).replace(/\D/g, '').length >= 7);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function chartColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: dark ? '#9AA3B8' : '#6B7280',
    grid: dark ? 'rgba(255,255,255,.07)' : 'rgba(17,24,39,.07)',
    tooltipBg: dark ? '#151B2E' : '#FFFFFF',
    tooltipText: dark ? '#E7EAF3' : '#111827'
  };
}

function makeChart(id, config) {
  if (typeof Chart === 'undefined') return;
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (state.charts[id]) state.charts[id].destroy();
  const c = chartColors();
  config.options = config.options || {};
  config.options.responsive = true;
  config.options.maintainAspectRatio = false;
  config.options.plugins = Object.assign({}, config.options.plugins, {
    legend: Object.assign({ labels: { color: c.text, font: { family: 'Inter' } } }, (config.options.plugins && config.options.plugins.legend) || {}),
    tooltip: Object.assign({ backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.grid, borderWidth: 1 }, (config.options.plugins && config.options.plugins.tooltip) || {})
  });
  if (config.options.scales) {
    Object.keys(config.options.scales).forEach((key) => {
      const axis = config.options.scales[key];
      axis.ticks = Object.assign({ color: c.text }, axis.ticks || {});
      axis.grid = Object.assign({ color: c.grid }, axis.grid || {});
    });
  }
  state.charts[id] = new Chart(canvas, config);
}

/* ============ 4. AUTH + PERMISSIONS ============ */

const PAGE_PERMISSIONS = {
  Admin: ['dashboard', 'customers', 'add-customer', 'customer', 'interactions', 'leads', 'reports', 'users', 'settings'],
  Manager: ['dashboard', 'customers', 'add-customer', 'customer', 'leads', 'reports'],
  Agent: ['dashboard', 'customers', 'add-customer', 'customer', 'interactions', 'leads']
};

function currentUser() {
  if (!state.session) return null;
  return userById(state.session.userId);
}

function currentRole() {
  const u = currentUser();
  return u ? u.role : null;
}

function canSee(page) {
  const role = currentRole();
  if (!role) return false;
  return PAGE_PERMISSIONS[role].indexOf(page) !== -1;
}

function canDelete() {
  return currentRole() === 'Admin' || currentRole() === 'Manager';
}

function isAdmin() {
  return currentRole() === 'Admin';
}

function login(email, password) {
  const found = state.users.find(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
  );
  if (!found) return { ok: false, error: 'Invalid email or password.' };
  state.session = { userId: found.id };
  saveSession();
  return { ok: true, user: found };
}

function register(name, email, password, role) {
  const exists = state.users.some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (exists) return { ok: false, error: 'An account with this email already exists.' };
  const user = { id: uid('u'), name: name.trim(), email: String(email).trim().toLowerCase(), password: password, role: role || 'Agent' };
  state.users.push(user);
  saveUsers();
  state.session = { userId: user.id };
  saveSession();
  return { ok: true, user: user };
}

function logout() {
  state.session = null;
  saveSession();
  closeModal();
  $('#userDropdown').classList.add('hidden');
  if (location.hash !== '#dashboard') location.hash = '#dashboard';
  renderRoute();
  toast('Signed out.', 'info');
}

function applyRoleUI() {
  $$('.nav-link').forEach((link) => {
    link.classList.toggle('hidden', !canSee(link.dataset.page));
  });
  const role = currentRole() || '—';
  const user = currentUser();
  $('#sidebarRoleBadge').textContent = role;
  $('#sidebarRoleBadge').className = 'badge badge-' + String(role).toLowerCase();
  $('#sidebarUserName').textContent = user ? user.name : '—';
  $('#userAvatar').textContent = user ? initials(user.name) : 'U';
  $('#userNameLabel').textContent = user ? user.name : 'User';
  $('#ddName').textContent = user ? user.name : '—';
  $('#ddRole').textContent = role;
  $('#ddRole').className = 'badge badge-' + String(role).toLowerCase();
  const addUserBtn = $('[data-action="user-add"]');
  if (addUserBtn) addUserBtn.classList.toggle('hidden', !isAdmin());
  const resetBtn = $('#resetBtn');
  if (resetBtn) resetBtn.classList.toggle('hidden', !isAdmin());
}

/* ============ 5. ROUTER ============ */

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  'add-customer': 'Add Customer',
  customer: 'Customer Detail',
  interactions: 'Interactions',
  leads: 'Leads',
  reports: 'Reports',
  users: 'Users',
  settings: 'Settings'
};

function setAuthTab(tab) {
  $$('.auth-tab').forEach((b) => {
    const active = b.dataset.authTab === tab;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  $('#loginForm').classList.toggle('hidden', tab !== 'login');
  $('#registerForm').classList.toggle('hidden', tab !== 'register');
}

function showAuth() {
  $('#authScreen').classList.remove('hidden');
  $('#app').classList.add('hidden');
  setAuthTab('login');
}

function showApp() {
  $('#authScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
}

function renderRoute() {
  if (!state.session || !currentUser()) {
    showAuth();
    return;
  }
  showApp();
  applyRoleUI();

  const hash = (location.hash || '#dashboard').replace(/^#/, '');
  const parts = hash.split('/');
  const page = parts[0] || 'dashboard';

  if (page === 'login' || page === 'register') {
    location.hash = '#dashboard';
    return;
  }

  if (page !== 'add-customer') state.editingCustomerId = null;

  if (!PAGE_TITLES[page] || !canSee(page)) {
    toast('You do not have permission to view that page.', 'error');
    location.hash = '#dashboard';
    return;
  }

  $$('.page').forEach((sec) => sec.classList.toggle('active', sec.dataset.page === page));

  const navPage = page === 'customer' ? 'customers' : page;
  $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === navPage));

  let title = PAGE_TITLES[page];
  if (page === 'add-customer') title = state.editingCustomerId ? 'Edit Customer' : 'Add Customer';
  $('#pageTitle').textContent = title;
  document.title = title + ' · ' + (state.settings.companyName || 'Nimbus CRM');

  closeDrawer();

  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'customers': renderCustomers(); break;
    case 'add-customer': prepareCustomerForm(); break;
    case 'customer': renderCustomerDetail(parts[1]); break;
    case 'interactions': renderInteractions(); break;
    case 'leads': renderLeads(); break;
    case 'reports': renderReports(); break;
    case 'users': renderUsers(); break;
    case 'settings': renderSettings(); break;
    default: break;
  }
}

function navigate(hash) {
  if (location.hash === '#' + hash) renderRoute();
  else location.hash = hash;
}

function openCustomerForm(id) {
  state.editingCustomerId = id || null;
  navigate('add-customer');
}

function openDrawer() {
  $('#sidebar').classList.add('open');
  $('#sidebarOverlay').classList.add('show');
}

function closeDrawer() {
  $('#sidebar').classList.remove('open');
  $('#sidebarOverlay').classList.remove('show');
}

/* ============ 6. PAGE RENDERERS ============ */

/* ---------- Dashboard ---------- */

function renderDashboard() {
  const totalCustomers = state.customers.length;
  const activeCustomers = state.customers.filter((c) => c.status === 'Active').length;
  const totalLeads = state.leads.length;
  const monthStart = monthStartISO();
  const monthInteractions = state.interactions.filter((i) => i.date >= monthStart).length;
  const pipelineValue = state.leads.filter((l) => l.status !== 'Lost' && l.status !== 'Won').reduce((s, l) => s + (Number(l.value) || 0), 0);

  const recentInteractions = state.interactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const recentCustomers = state.customers
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  let activityHTML = '';
  if (!recentInteractions.length) {
    activityHTML = emptyState('fa-clock-rotate-left', 'No activity yet', 'Log your first interaction to see it here.');
  } else {
    activityHTML = '<div class="timeline">' + recentInteractions.map((it) => {
      const cust = customerById(it.customerId);
      return (
        '<div class="timeline-item">' +
          '<span class="timeline-dot type-' + esc(it.type) + '"></span>' +
          '<div class="timeline-card">' +
            '<div class="timeline-top">' + typeBadge(it.type) + '<strong>' + esc(it.subject) + '</strong></div>' +
            '<div class="timeline-meta">' +
              (cust ? '<a href="#customer/' + esc(cust.id) + '">' + esc(cust.name) + '</a>' : 'Unknown customer') +
              ' · ' + esc(fmtDateTime(it.date)) + ' · by ' + esc(it.createdBy) +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('') + '</div>';
  }

  let recentCustHTML = '';
  if (!recentCustomers.length) {
    recentCustHTML = emptyState('fa-users', 'No customers', 'Add a customer to get started.',
      '<a class="btn btn-primary" href="#add-customer"><i class="fa-solid fa-plus"></i> Add customer</a>');
  } else {
    recentCustHTML = '<div class="table-wrap"><table class="table"><thead><tr>' +
      '<th scope="col">Customer</th><th scope="col">Company</th><th scope="col">Status</th>' +
      '</tr></thead><tbody>' +
      recentCustomers.map((c) => (
        '<tr data-action="open-customer" data-id="' + esc(c.id) + '" tabindex="0">' +
          '<td><div class="cell-user"><span class="avatar">' + esc(initials(c.name)) + '</span>' +
          '<span><strong>' + esc(c.name) + '</strong><span class="sub">' + esc(c.email) + '</span></span></div></td>' +
          '<td>' + esc(c.company) + '</td>' +
          '<td>' + statusBadge(c.status) + '</td>' +
        '</tr>'
      )).join('') +
      '</tbody></table></div>';
  }

  $('#dashboardContent').innerHTML =
    '<div class="page-head"><div><h2>Welcome back, ' + esc((currentUser() || {}).name || '') + '</h2>' +
    '<p class="muted">Here is what is happening in ' + esc(state.settings.companyName) + ' today.</p></div></div>' +

    '<div class="stat-grid">' +
      statCard('fa-users', 'indigo', totalCustomers, 'Total customers', state.customers.length + ' records') +
      statCard('fa-user-check', 'green', activeCustomers, 'Active customers', Math.round((activeCustomers / Math.max(totalCustomers, 1)) * 100) + '% of total') +
      statCard('fa-bullseye', 'amber', totalLeads, 'Total leads', 'Pipeline ' + fmtMoney(pipelineValue)) +
      statCard('fa-clock-rotate-left', 'purple', monthInteractions, 'Interactions this month', 'Since ' + fmtDate(monthStart)) +
    '</div>' +

    '<div class="chart-grid">' +
      '<div class="card chart-card"><h3>Customers by status</h3><p class="muted">Distribution of your customer base</p><div class="chart-box"><canvas id="chartStatus"></canvas></div></div>' +
      '<div class="card chart-card"><h3>Leads by stage</h3><p class="muted">Where your prospects sit in the funnel</p><div class="chart-box"><canvas id="chartLeads"></canvas></div></div>' +
      '<div class="card chart-card"><h3>Interactions per week</h3><p class="muted">Last 6 weeks of activity</p><div class="chart-box"><canvas id="chartWeeks"></canvas></div></div>' +
    '</div>' +

    '<div class="split">' +
      '<div class="card"><div class="section-title"><h3>Recent activity</h3>' +
        (canSee('interactions') ? '<a href="#interactions" class="muted">View all</a>' : '<span class="muted">Latest 6</span>') +
      '</div>' + activityHTML + '</div>' +
      '<div class="card"><div class="section-title"><h3>Newest customers</h3><a href="#customers" class="muted">View all</a></div>' + recentCustHTML + '</div>' +
    '</div>';

  const statusCounts = ['Active', 'Inactive', 'Lead'].map((s) => state.customers.filter((c) => c.status === s).length);
  makeChart('chartStatus', {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Inactive', 'Lead'],
      datasets: [{ data: statusCounts, backgroundColor: ['#4F46E5', '#9CA3AF', '#F59E0B'], borderWidth: 0 }]
    },
    options: { cutout: '68%', plugins: { legend: { position: 'bottom' } } }
  });

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
  makeChart('chartLeads', {
    type: 'bar',
    data: {
      labels: stages,
      datasets: [{ label: 'Leads', data: stages.map((s) => state.leads.filter((l) => l.status === s).length), backgroundColor: '#4F46E5', borderRadius: 6, maxBarThickness: 40 }]
    },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });

  const weekLabels = [];
  const weekCounts = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    weekLabels.push(start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    weekCounts.push(state.interactions.filter((it) => {
      const d = new Date(it.date);
      return d >= start && d <= endOfDay;
    }).length);
  }
  makeChart('chartWeeks', {
    type: 'line',
    data: { labels: weekLabels, datasets: [{ label: 'Interactions', data: weekCounts, borderColor: '#4F46E5', backgroundColor: 'rgba(79,70,229,.14)', fill: true, tension: .35, pointBackgroundColor: '#4F46E5' }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

function statCard(icon, tone, value, label, sub) {
  return (
    '<div class="stat-card">' +
      '<span class="stat-icon ' + tone + '"><i class="fa-solid ' + icon + '"></i></span>' +
      '<div><div class="stat-value">' + esc(String(value)) + '</div>' +
      '<div class="stat-label">' + esc(label) + '</div>' +
      '<div class="stat-delta">' + esc(sub || '') + '</div></div>' +
    '</div>'
  );
}

/* ---------- Customers list ---------- */

function filteredCustomers() {
  const q = state.customerSearch.trim().toLowerCase();
  const list = state.customers.filter((c) => {
    const haystack = (c.name + ' ' + c.email + ' ' + c.company).toLowerCase();
    const matchQ = !q || haystack.indexOf(q) !== -1;
    const matchS = state.customerStatus === 'all' || c.status === state.customerStatus;
    return matchQ && matchS;
  });
  const key = state.customerSort.key;
  const dir = state.customerSort.dir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    let av = a[key];
    let bv = b[key];
    if (key === 'createdAt') {
      av = new Date(av).getTime();
      bv = new Date(bv).getTime();
      return (av - bv) * dir;
    }
    av = String(av || '').toLowerCase();
    bv = String(bv || '').toLowerCase();
    return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
  });
  return list;
}

function renderCustomers() {
  const all = filteredCustomers();
  const perPage = Number(state.settings.itemsPerPage) || 10;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  if (state.customerPage > totalPages) state.customerPage = totalPages;
  const start = (state.customerPage - 1) * perPage;
  const pageRows = all.slice(start, start + perPage);

  const tbody = $('#customersTbody');
  const wrap = $('#page-customers .table-wrap');
  const emptyBox = $('#customersEmpty');

  if (!pageRows.length) {
    tbody.innerHTML = '';
    wrap.classList.add('hidden');
    emptyBox.innerHTML = emptyState(
      'fa-user-slash',
      'No customers found',
      state.customers.length ? 'Try adjusting your search or filters.' : 'Add your first customer to get started.',
      state.customers.length
        ? '<button type="button" class="btn btn-outline" data-action="clear-customer-filters">Clear filters</button>'
        : '<a class="btn btn-primary" href="#add-customer"><i class="fa-solid fa-plus"></i> Add customer</a>'
    );
  } else {
    wrap.classList.remove('hidden');
    emptyBox.innerHTML = '';
    tbody.innerHTML = pageRows.map((c) => (
      '<tr data-action="open-customer" data-id="' + esc(c.id) + '" tabindex="0">' +
        '<td><div class="cell-user"><span class="avatar">' + esc(initials(c.name)) + '</span>' +
          '<span><strong>' + esc(c.name) + '</strong><span class="sub">Since ' + esc(fmtDate(c.createdAt)) + '</span></span></div></td>' +
        '<td>' + esc(c.email) + '</td>' +
        '<td>' + esc(c.phone) + '</td>' +
        '<td>' + esc(c.company) + '</td>' +
        '<td>' + statusBadge(c.status) + '</td>' +
        '<td>' + esc(fmtDate(c.createdAt)) + '</td>' +
        '<td class="col-actions"><div class="row-actions">' +
          '<button type="button" class="btn btn-sm btn-outline" data-action="customer-edit" data-id="' + esc(c.id) + '" aria-label="Edit ' + esc(c.name) + '"><i class="fa-solid fa-pen"></i></button>' +
          '<button type="button" class="btn btn-sm btn-outline" data-action="customer-email" data-id="' + esc(c.id) + '" aria-label="Email ' + esc(c.name) + '"><i class="fa-solid fa-envelope"></i></button>' +
          (canDelete()
            ? '<button type="button" class="btn btn-sm btn-danger" data-action="customer-delete" data-id="' + esc(c.id) + '" aria-label="Delete ' + esc(c.name) + '"><i class="fa-solid fa-trash"></i></button>'
            : '') +
        '</div></td>' +
      '</tr>'
    )).join('');
  }

  $('#customersCount').textContent = all.length
    ? 'Showing ' + (start + 1) + '–' + Math.min(start + perPage, all.length) + ' of ' + all.length + ' customers'
    : '0 customers';

  let paginationHTML = '<button type="button" class="page-btn" data-action="customer-page" data-page-num="' + (state.customerPage - 1) + '"' + (state.customerPage === 1 ? ' disabled' : '') + ' aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>';
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - state.customerPage) > 1) {
      if (p === 2 || p === totalPages - 1) paginationHTML += '<span class="muted">…</span>';
      continue;
    }
    paginationHTML += '<button type="button" class="page-btn' + (p === state.customerPage ? ' active' : '') + '" data-action="customer-page" data-page-num="' + p + '"' + (p === state.customerPage ? ' aria-current="page"' : '') + '>' + p + '</button>';
  }
  paginationHTML += '<button type="button" class="page-btn" data-action="customer-page" data-page-num="' + (state.customerPage + 1) + '"' + (state.customerPage === totalPages ? ' disabled' : '') + ' aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button>';
  $('#customersPagination').innerHTML = paginationHTML;

  $$('#page-customers thead th[data-key]').forEach((th) => {
    const icon = $('i', th);
    if (!icon) return;
    if (th.dataset.key === state.customerSort.key) {
      icon.className = 'fa-solid ' + (state.customerSort.dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
    } else {
      icon.className = 'fa-solid fa-sort';
    }
  });
}

/* ---------- Add / edit customer form ---------- */

function prepareCustomerForm() {
  const editing = state.editingCustomerId ? customerById(state.editingCustomerId) : null;
  $('#customerForm').reset();
  ['custName', 'custEmail', 'custPhone', 'custCompany'].forEach((id) => setFieldError($('#' + id), $('#' + id + 'Err'), ''));

  if (editing) {
    $('#customerFormTitle').textContent = 'Edit Customer';
    $('#customerFormSub').textContent = 'Update the record for ' + editing.name + '.';
    $('#customerSubmitLabel').textContent = 'Update customer';
    $('#custId').value = editing.id;
    $('#custName').value = editing.name;
    $('#custEmail').value = editing.email;
    $('#custPhone').value = editing.phone;
    $('#custCompany').value = editing.company;
    $('#custStatus').value = editing.status;
    $('#custNotes').value = editing.notes || '';
  } else {
    $('#customerFormTitle').textContent = 'Add Customer';
    $('#customerFormSub').textContent = 'Create a new customer record.';
    $('#customerSubmitLabel').textContent = 'Save customer';
    $('#custId').value = '';
    $('#custStatus').value = 'Active';
  }
  $('#pageTitle').textContent = editing ? 'Edit Customer' : 'Add Customer';
}

function submitCustomerForm() {
  const id = $('#custId').value;
  const name = $('#custName').value.trim();
  const email = $('#custEmail').value.trim();
  const phone = $('#custPhone').value.trim();
  const company = $('#custCompany').value.trim();
  const status = $('#custStatus').value;
  const notes = $('#custNotes').value.trim();

  let ok = true;
  if (!name) { setFieldError($('#custName'), $('#custNameErr'), 'Name is required.'); ok = false; } else setFieldError($('#custName'), $('#custNameErr'), '');
  if (!email) { setFieldError($('#custEmail'), $('#custEmailErr'), 'Email is required.'); ok = false; }
  else if (!isEmail(email)) { setFieldError($('#custEmail'), $('#custEmailErr'), 'Enter a valid email address.'); ok = false; }
  else setFieldError($('#custEmail'), $('#custEmailErr'), '');
  if (!phone) { setFieldError($('#custPhone'), $('#custPhoneErr'), 'Phone is required.'); ok = false; }
  else if (!isPhone(phone)) { setFieldError($('#custPhone'), $('#custPhoneErr'), 'Enter a valid phone number (7+ digits).'); ok = false; }
  else setFieldError($('#custPhone'), $('#custPhoneErr'), '');
  if (!company) { setFieldError($('#custCompany'), $('#custCompanyErr'), 'Company is required.'); ok = false; } else setFieldError($('#custCompany'), $('#custCompanyErr'), '');

  if (!ok) {
    toast('Please fix the highlighted fields.', 'error');
    return;
  }

  if (id) {
    const customer = customerById(id);
    if (customer) {
      Object.assign(customer, { name, email, phone, company, status, notes });
      saveCustomers();
      state.editingCustomerId = null;
      toast('Customer updated.');
      navigate('customers');
    }
  } else {
    const customer = { id: uid('c'), name, email, phone, company, status, notes, createdAt: new Date().toISOString() };
    state.customers.unshift(customer);
    saveCustomers();
    toast('Customer added.');
    state.editingCustomerId = null;
    navigate('customers');
  }
}

/* ---------- Customer detail ---------- */

function renderCustomerDetail(id) {
  const customer = id ? customerById(id) : null;
  const box = $('#customerDetail');

  if (!customer) {
    box.innerHTML = emptyState('fa-user-slash', 'Customer not found', 'This record may have been deleted.',
      '<a class="btn btn-primary" href="#customers">Back to customers</a>');
    return;
  }

  const interactions = state.interactions
    .filter((i) => i.customerId === customer.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const timeline = interactions.length
    ? '<div class="timeline">' + interactions.map((it) => (
        '<div class="timeline-item">' +
          '<span class="timeline-dot type-' + esc(it.type) + '"></span>' +
          '<div class="timeline-card">' +
            '<div class="timeline-top">' + typeBadge(it.type) + '<strong>' + esc(it.subject) + '</strong></div>' +
            '<div class="timeline-meta">' + esc(fmtDateTime(it.date)) + ' · by ' + esc(it.createdBy) + '</div>' +
            (it.notes ? '<p>' + esc(it.notes) + '</p>' : '') +
          '</div>' +
        '</div>'
      )).join('') + '</div>'
    : emptyState('fa-clock-rotate-left', 'No interactions yet', 'Log a call, email or meeting for this customer.');

  box.innerHTML =
    '<div class="detail-head">' +
      '<div class="detail-id">' +
        '<span class="avatar">' + esc(initials(customer.name)) + '</span>' +
        '<div><h2>' + esc(customer.name) + '</h2>' +
        '<p class="muted">' + esc(customer.company) + ' · customer since ' + esc(fmtDate(customer.createdAt)) + '</p>' +
        '<p style="margin-top:8px">' + statusBadge(customer.status) + '</p></div>' +
      '</div>' +
      '<div class="detail-actions">' +
        '<a class="btn btn-ghost" href="#customers"><i class="fa-solid fa-arrow-left"></i> Back</a>' +
        '<button type="button" class="btn btn-outline" data-action="customer-edit" data-id="' + esc(customer.id) + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
        '<button type="button" class="btn btn-primary" data-action="customer-log" data-id="' + esc(customer.id) + '"><i class="fa-solid fa-plus"></i> Log interaction</button>' +
        '<button type="button" class="btn btn-outline" data-action="customer-email" data-id="' + esc(customer.id) + '"><i class="fa-solid fa-envelope"></i> Send email</button>' +
        (canDelete()
          ? '<button type="button" class="btn btn-danger" data-action="customer-delete" data-id="' + esc(customer.id) + '"><i class="fa-solid fa-trash"></i> Delete</button>'
          : '') +
      '</div>' +
    '</div>' +

    '<div class="detail-grid">' +
      '<div class="card">' +
        '<div class="section-title"><h3>Contact information</h3></div>' +
        '<div class="info-list">' +
          '<div class="info-row"><i class="fa-solid fa-envelope"></i><div><span>Email</span><strong><a href="mailto:' + esc(customer.email) + '">' + esc(customer.email) + '</a></strong></div></div>' +
          '<div class="info-row"><i class="fa-solid fa-phone"></i><div><span>Phone</span><strong>' + esc(customer.phone) + '</strong></div></div>' +
          '<div class="info-row"><i class="fa-solid fa-building"></i><div><span>Company</span><strong>' + esc(customer.company) + '</strong></div></div>' +
          '<div class="info-row"><i class="fa-solid fa-circle-info"></i><div><span>Status</span><strong>' + esc(customer.status) + '</strong></div></div>' +
          '<div class="info-row"><i class="fa-solid fa-calendar"></i><div><span>Created</span><strong>' + esc(fmtDate(customer.createdAt)) + '</strong></div></div>' +
        '</div>' +
        '<div class="section-title" style="margin-top:20px"><h3>Notes</h3></div>' +
        '<p class="muted">' + (customer.notes ? esc(customer.notes) : 'No notes for this customer.') + '</p>' +
      '</div>' +
      '<div class="card">' +
        '<div class="section-title"><h3>Interaction timeline</h3><span class="badge">' + interactions.length + ' entries</span></div>' +
        timeline +
      '</div>' +
    '</div>';
}

/* ---------- Interactions ---------- */

function renderInteractions() {
  const customerOptions = state.customers.slice().sort((a, b) => a.name.localeCompare(b.name));

  const intSelect = $('#intCustomer');
  const prevInt = intSelect.value;
  intSelect.innerHTML = '<option value="">Select a customer…</option>' +
    customerOptions.map((c) => '<option value="' + esc(c.id) + '">' + esc(c.name) + ' — ' + esc(c.company) + '</option>').join('');
  intSelect.value = prevInt;

  const filterSelect = $('#intFilterCustomer');
  const prevFilter = filterSelect.value || state.intFilters.customer;
  filterSelect.innerHTML = '<option value="all">All customers</option>' +
    customerOptions.map((c) => '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>').join('');
  filterSelect.value = prevFilter || 'all';
  state.intFilters.customer = filterSelect.value;

  $('#intDate').value = $('#intDate').value || todayISO();
  $('#intFilterType').value = state.intFilters.type;
  $('#intFilterFrom').value = state.intFilters.from;
  $('#intFilterTo').value = state.intFilters.to;

  const list = state.interactions
    .filter((it) => {
      const day = it.date.slice(0, 10);
      const okType = state.intFilters.type === 'all' || it.type === state.intFilters.type;
      const okCust = state.intFilters.customer === 'all' || it.customerId === state.intFilters.customer;
      const okFrom = !state.intFilters.from || day >= state.intFilters.from;
      const okTo = !state.intFilters.to || day <= state.intFilters.to;
      return okType && okCust && okFrom && okTo;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = $('#interactionsTbody');
  const wrap = $('#page-interactions .table-wrap');
  const emptyBox = $('#interactionsEmpty');

  if (!list.length) {
    tbody.innerHTML = '';
    wrap.classList.add('hidden');
    emptyBox.innerHTML = emptyState('fa-clock-rotate-left', 'No interactions found',
      state.interactions.length ? 'Try changing the filters.' : 'Log your first interaction using the form.');
  } else {
    wrap.classList.remove('hidden');
    emptyBox.innerHTML = '';
    tbody.innerHTML = list.map((it) => {
      const cust = customerById(it.customerId);
      return (
        '<tr>' +
          '<td>' + esc(fmtDateTime(it.date)) + '</td>' +
          '<td>' + typeBadge(it.type) + '</td>' +
          '<td>' + (cust ? '<a href="#customer/' + esc(cust.id) + '">' + esc(cust.name) + '</a>' : '<span class="muted">Deleted customer</span>') + '</td>' +
          '<td><strong>' + esc(it.subject) + '</strong>' + (it.notes ? '<span class="sub">' + esc(it.notes) + '</span>' : '') + '</td>' +
          '<td>' + esc(it.createdBy) + '</td>' +
        '</tr>'
      );
    }).join('');
  }
}

function saveInteraction(data) {
  const interaction = {
    id: uid('i'),
    customerId: data.customerId,
    type: data.type,
    subject: data.subject,
    notes: data.notes || '',
    date: data.date || new Date().toISOString(),
    createdBy: (currentUser() || {}).name || 'Unknown'
  };
  state.interactions.unshift(interaction);
  saveInteractions();
  return interaction;
}

function submitInteractionForm() {
  const customerId = $('#intCustomer').value;
  const subject = $('#intSubject').value.trim();
  const type = $('#intType').value;
  const notes = $('#intNotes').value.trim();
  const dateVal = $('#intDate').value || todayISO();

  let ok = true;
  if (!customerId) { setFieldError($('#intCustomer'), $('#intCustomerErr'), 'Choose a customer.'); ok = false; }
  else setFieldError($('#intCustomer'), $('#intCustomerErr'), '');
  if (!subject) { setFieldError($('#intSubject'), $('#intSubjectErr'), 'Subject is required.'); ok = false; }
  else setFieldError($('#intSubject'), $('#intSubjectErr'), '');

  if (!ok) { toast('Please fix the highlighted fields.', 'error'); return; }

  saveInteraction({ customerId, type, subject, notes, date: new Date(dateVal + 'T' + new Date().toTimeString().slice(0, 8)).toISOString() });
  $('#intSubject').value = '';
  $('#intNotes').value = '';
  renderInteractions();
  toast(type + ' logged.');
}

/* ---------- Leads ---------- */

function renderLeads() {
  const q = state.leadSearch.trim().toLowerCase();
  const list = state.leads
    .filter((l) => {
      const matchQ = !q || (l.name + ' ' + l.company + ' ' + l.email).toLowerCase().indexOf(q) !== -1;
      const matchS = state.leadStatus === 'all' || l.status === state.leadStatus;
      return matchQ && matchS;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
  const tbody = $('#leadsTbody');
  const wrap = $('#page-leads .table-wrap');
  const emptyBox = $('#leadsEmpty');

  if (!list.length) {
    tbody.innerHTML = '';
    wrap.classList.add('hidden');
    emptyBox.innerHTML = emptyState('fa-bullseye', 'No leads found',
      state.leads.length ? 'Try changing your search or stage filter.' : 'Add your first lead to start your pipeline.',
      '<button type="button" class="btn btn-primary" data-action="lead-add"><i class="fa-solid fa-plus"></i> Add lead</button>');
  } else {
    wrap.classList.remove('hidden');
    emptyBox.innerHTML = '';
    tbody.innerHTML = list.map((l) => (
      '<tr>' +
        '<td><div class="cell-user"><span class="avatar">' + esc(initials(l.name)) + '</span>' +
          '<span><strong>' + esc(l.name) + '</strong><span class="sub">' + esc(l.email) + '</span></span></div></td>' +
        '<td>' + esc(l.company) + '</td>' +
        '<td>' + esc(l.source) + '</td>' +
        '<td><select class="stage-select" data-action="lead-status" data-id="' + esc(l.id) + '" aria-label="Stage for ' + esc(l.name) + '">' +
          stages.map((s) => '<option value="' + s + '"' + (s === l.status ? ' selected' : '') + '>' + s + '</option>').join('') +
        '</select></td>' +
        '<td><strong>' + fmtMoney(l.value) + '</strong></td>' +
        '<td>' + esc(fmtDate(l.createdAt)) + '</td>' +
        '<td class="col-actions"><div class="row-actions">' +
          (l.status !== 'Won'
            ? '<button type="button" class="btn btn-sm btn-outline" data-action="lead-convert" data-id="' + esc(l.id) + '" title="Convert to customer" aria-label="Convert ' + esc(l.name) + ' to customer"><i class="fa-solid fa-user-check"></i></button>'
            : '') +
          '<button type="button" class="btn btn-sm btn-outline" data-action="lead-edit" data-id="' + esc(l.id) + '" aria-label="Edit ' + esc(l.name) + '"><i class="fa-solid fa-pen"></i></button>' +
          (canDelete()
            ? '<button type="button" class="btn btn-sm btn-danger" data-action="lead-delete" data-id="' + esc(l.id) + '" aria-label="Delete ' + esc(l.name) + '"><i class="fa-solid fa-trash"></i></button>'
            : '') +
        '</div></td>' +
      '</tr>'
    )).join('');
  }

  const totalValue = list.reduce((s, l) => s + (Number(l.value) || 0), 0);
  $('#leadsCount').textContent = list.length + ' lead' + (list.length === 1 ? '' : 's');
  $('#leadsValue').textContent = 'Total value: ' + fmtMoney(totalValue);
}

/* ---------- Reports ---------- */

function reportData() {
  const r = state.report;
  if (r.type === 'customers') {
    const rows = state.customers.filter((c) => {
      const day = c.createdAt.slice(0, 10);
      const okFrom = !r.from || day >= r.from;
      const okTo = !r.to || day <= r.to;
      const okStatus = r.status === 'all' || c.status === r.status;
      return okFrom && okTo && okStatus;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      title: 'Customer report',
      head: ['Name', 'Email', 'Phone', 'Company', 'Status', 'Created'],
      rows: rows,
      body: rows.map((c) => [c.name, c.email, c.phone, c.company, c.status, fmtDate(c.createdAt)]),
      summary: [
        ['Total customers', String(rows.length)],
        ['Active', String(rows.filter((c) => c.status === 'Active').length)],
        ['Inactive', String(rows.filter((c) => c.status === 'Inactive').length)],
        ['Lead', String(rows.filter((c) => c.status === 'Lead').length)]
      ]
    };
  }

  const rows = state.interactions.filter((it) => {
    const day = it.date.slice(0, 10);
    const okFrom = !r.from || day >= r.from;
    const okTo = !r.to || day <= r.to;
    const okType = r.activityType === 'all' || it.type === r.activityType;
    return okFrom && okTo && okType;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    title: 'Activity report',
    head: ['Date', 'Type', 'Customer', 'Subject', 'Notes', 'Created by'],
    rows: rows,
    body: rows.map((it) => {
      const cust = customerById(it.customerId);
      return [fmtDate(it.date), it.type, cust ? cust.name : 'Unknown', it.subject, it.notes || '', it.createdBy];
    }),
    summary: [
      ['Total interactions', String(rows.length)],
      ['Emails', String(rows.filter((i) => i.type === 'Email').length)],
      ['Calls', String(rows.filter((i) => i.type === 'Call').length)],
      ['Meetings', String(rows.filter((i) => i.type === 'Meeting').length)]
    ]
  };
}

function renderReports() {
  $('#repType').value = state.report.type;
  $('#repFrom').value = state.report.from;
  $('#repTo').value = state.report.to;
  $('#repStatus').value = state.report.status;
  $('#repActivityType').value = state.report.activityType;
  $('#repStatusWrap').classList.toggle('hidden', state.report.type !== 'customers');
  $('#repActivityWrap').classList.toggle('hidden', state.report.type !== 'activity');

  const data = reportData();

  let chartHTML = '';
  if (state.report.type === 'customers') {
    chartHTML = '<div class="card chart-card"><h3>Status breakdown</h3><p class="muted">Filtered customers by status</p><div class="chart-box"><canvas id="chartReport"></canvas></div></div>';
  } else {
    chartHTML = '<div class="card chart-card"><h3>Activity by type</h3><p class="muted">Filtered interactions by channel</p><div class="chart-box"><canvas id="chartReport"></canvas></div></div>';
  }

  const tableHTML = data.rows.length
    ? '<div class="table-wrap"><table class="table"><thead><tr>' +
        data.head.map((h) => '<th scope="col">' + esc(h) + '</th>').join('') +
      '</tr></thead><tbody>' +
        data.body.map((row) => '<tr>' + row.map((cell) => '<td>' + esc(cell) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>'
    : emptyState('fa-chart-bar', 'No data for this range', 'Adjust the date range or filters and try again.');

  $('#reportsContent').innerHTML =
    '<div class="report-summary">' +
      data.summary.map((s) => '<div class="summary-item"><div class="v">' + esc(s[1]) + '</div><div class="l">' + esc(s[0]) + '</div></div>').join('') +
    '</div>' +
    '<div class="report-grid">' + chartHTML +
      '<div class="card"><div class="section-title"><h3>' + esc(data.title) + '</h3><span class="badge">' + data.rows.length + ' rows</span></div>' + tableHTML + '</div>' +
    '</div>';

  if (state.report.type === 'customers') {
    const counts = ['Active', 'Inactive', 'Lead'].map((s) => data.rows.filter((c) => c.status === s).length);
    makeChart('chartReport', {
      type: 'bar',
      data: { labels: ['Active', 'Inactive', 'Lead'], datasets: [{ label: 'Customers', data: counts, backgroundColor: ['#4F46E5', '#9CA3AF', '#F59E0B'], borderRadius: 6, maxBarThickness: 46 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  } else {
    const counts = ['Email', 'Call', 'Meeting'].map((t) => data.rows.filter((i) => i.type === t).length);
    makeChart('chartReport', {
      type: 'doughnut',
      data: { labels: ['Email', 'Call', 'Meeting'], datasets: [{ data: counts, backgroundColor: ['#3B82F6', '#F59E0B', '#8B5CF6'], borderWidth: 0 }] },
      options: { cutout: '68%', plugins: { legend: { position: 'bottom' } } }
    });
  }
}

/* ---------- Users ---------- */

function renderUsers() {
  const tbody = $('#usersTbody');
  const wrap = $('#page-users .table-wrap');
  const emptyBox = $('#usersEmpty');

  if (!state.users.length) {
    tbody.innerHTML = '';
    wrap.classList.add('hidden');
    emptyBox.innerHTML = emptyState('fa-user-shield', 'No users', 'Register an account to get started.');
    return;
  }

  wrap.classList.remove('hidden');
  emptyBox.innerHTML = '';
  const me = currentUser();
  tbody.innerHTML = state.users.map((u) => (
    '<tr>' +
      '<td><div class="cell-user"><span class="avatar">' + esc(initials(u.name)) + '</span>' +
        '<span><strong>' + esc(u.name) + '</strong><span class="sub">' + (me && me.id === u.id ? 'You' : 'Team member') + '</span></span></div></td>' +
      '<td>' + esc(u.email) + '</td>' +
      '<td>' + roleBadge(u.role) + '</td>' +
      '<td class="col-actions"><div class="row-actions">' +
        '<button type="button" class="btn btn-sm btn-outline" data-action="user-edit" data-id="' + esc(u.id) + '" aria-label="Edit ' + esc(u.name) + '"><i class="fa-solid fa-pen"></i></button>' +
        (me && me.id !== u.id
          ? '<button type="button" class="btn btn-sm btn-danger" data-action="user-delete" data-id="' + esc(u.id) + '" aria-label="Delete ' + esc(u.name) + '"><i class="fa-solid fa-trash"></i></button>'
          : '') +
      '</div></td>' +
    '</tr>'
  )).join('');
}

/* ---------- Settings ---------- */

function renderSettings() {
  $('#setCompany').value = state.settings.companyName;
  $('#setTheme').value = state.settings.theme;
  $('#setDateFormat').value = state.settings.dateFormat;
  $('#setCurrency').value = state.settings.currency;
  $('#setPerPage').value = String(state.settings.itemsPerPage);
}

function submitSettingsForm() {
  state.settings.companyName = $('#setCompany').value.trim() || 'Nimbus CRM';
  state.settings.theme = $('#setTheme').value;
  state.settings.dateFormat = $('#setDateFormat').value;
  state.settings.currency = $('#setCurrency').value;
  state.settings.itemsPerPage = Number($('#setPerPage').value) || 10;
  saveSettings();
  applyTheme();
  document.title = $('#pageTitle').textContent + ' · ' + state.settings.companyName;
  toast('Settings saved.');
}

function applyTheme() {
  const theme = state.settings.theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  $('#themeIcon').className = 'fa-solid ' + (theme === 'dark' ? 'fa-sun' : 'fa-moon');
  $('#setTheme').value = theme;
}

/* ============ 7. MODALS ============ */

function openLeadModal(leadId) {
  const lead = leadId ? leadById(leadId) : null;
  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
  const sources = ['Website', 'Referral', 'Social', 'Cold Call', 'Event', 'Ad'];

  const wrap = openModal(
    lead ? 'Edit lead' : 'Add lead',
    '<form id="leadModalForm" novalidate>' +
      '<div class="grid-2">' +
        '<div class="field"><label for="lmName">Contact name <span class="req">*</span></label><input type="text" id="lmName" value="' + esc(lead ? lead.name : '') + '"><p class="field-error" id="lmNameErr"></p></div>' +
        '<div class="field"><label for="lmCompany">Company <span class="req">*</span></label><input type="text" id="lmCompany" value="' + esc(lead ? lead.company : '') + '"><p class="field-error" id="lmCompanyErr"></p></div>' +
        '<div class="field"><label for="lmEmail">Email <span class="req">*</span></label><input type="email" id="lmEmail" value="' + esc(lead ? lead.email : '') + '"><p class="field-error" id="lmEmailErr"></p></div>' +
        '<div class="field"><label for="lmPhone">Phone</label><input type="tel" id="lmPhone" value="' + esc(lead ? lead.phone : '') + '"><p class="field-error" id="lmPhoneErr"></p></div>' +
        '<div class="field"><label for="lmSource">Source</label><select id="lmSource">' +
          sources.map((s) => '<option value="' + s + '"' + (lead && lead.source === s ? ' selected' : '') + '>' + s + '</option>').join('') +
        '</select></div>' +
        '<div class="field"><label for="lmStatus">Stage</label><select id="lmStatus">' +
          stages.map((s) => '<option value="' + s + '"' + (lead && lead.status === s ? ' selected' : '') + '>' + s + '</option>').join('') +
        '</select></div>' +
        '<div class="field"><label for="lmValue">Value (' + esc(state.settings.currency) + ') <span class="req">*</span></label><input type="number" id="lmValue" min="0" step="100" value="' + esc(lead ? lead.value : '') + '"><p class="field-error" id="lmValueErr"></p></div>' +
      '</div>' +
    '</form>',
    '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancel</button>' +
    '<button type="button" class="btn btn-primary" data-modal-ok><i class="fa-solid fa-floppy-disk"></i> ' + (lead ? 'Update lead' : 'Add lead') + '</button>'
  );

  $('[data-modal-cancel]', wrap).addEventListener('click', closeModal);
  $('[data-modal-ok]', wrap).addEventListener('click', () => {
    const name = $('#lmName', wrap).value.trim();
    const company = $('#lmCompany', wrap).value.trim();
    const email = $('#lmEmail', wrap).value.trim();
    const phone = $('#lmPhone', wrap).value.trim();
    const source = $('#lmSource', wrap).value;
    const status = $('#lmStatus', wrap).value;
    const value = Number($('#lmValue', wrap).value);

    let ok = true;
    if (!name) { setFieldError($('#lmName', wrap), $('#lmNameErr', wrap), 'Name is required.'); ok = false; } else setFieldError($('#lmName', wrap), $('#lmNameErr', wrap), '');
    if (!company) { setFieldError($('#lmCompany', wrap), $('#lmCompanyErr', wrap), 'Company is required.'); ok = false; } else setFieldError($('#lmCompany', wrap), $('#lmCompanyErr', wrap), '');
    if (!email) { setFieldError($('#lmEmail', wrap), $('#lmEmailErr', wrap), 'Email is required.'); ok = false; }
    else if (!isEmail(email)) { setFieldError($('#lmEmail', wrap), $('#lmEmailErr', wrap), 'Enter a valid email address.'); ok = false; }
    else setFieldError($('#lmEmail', wrap), $('#lmEmailErr', wrap), '');
    if (phone && !isPhone(phone)) { setFieldError($('#lmPhone', wrap), $('#lmPhoneErr', wrap), 'Enter a valid phone number.'); ok = false; } else setFieldError($('#lmPhone', wrap), $('#lmPhoneErr', wrap), '');
    if (!value && value !== 0) { setFieldError($('#lmValue', wrap), $('#lmValueErr', wrap), 'Value is required.'); ok = false; }
    else if (value < 0) { setFieldError($('#lmValue', wrap), $('#lmValueErr', wrap), 'Value cannot be negative.'); ok = false; }
    else setFieldError($('#lmValue', wrap), $('#lmValueErr', wrap), '');

    if (!ok) return;

    if (lead) {
      Object.assign(lead, { name, company, email, phone, source, status, value });
      saveLeads();
      toast('Lead updated.');
    } else {
      state.leads.unshift({ id: uid('l'), name, company, email, phone, source, status, value, createdAt: new Date().toISOString() });
      saveLeads();
      toast('Lead added.');
    }
    closeModal();
    renderLeads();
  });
}

function openUserModal(userId) {
  const user = userId ? userById(userId) : null;
  const wrap = openModal(
    user ? 'Edit user' : 'Add user',
    '<form id="userModalForm" novalidate>' +
      '<div class="field"><label for="umName">Full name <span class="req">*</span></label><input type="text" id="umName" value="' + esc(user ? user.name : '') + '"><p class="field-error" id="umNameErr"></p></div>' +
      '<div class="field"><label for="umEmail">Email <span class="req">*</span></label><input type="email" id="umEmail" value="' + esc(user ? user.email : '') + '"><p class="field-error" id="umEmailErr"></p></div>' +
      '<div class="field"><label for="umPassword">' + (user ? 'New password (leave blank to keep current)' : 'Password') + ' ' + (user ? '' : '<span class="req">*</span>') + '</label>' +
        '<input type="password" id="umPassword" autocomplete="new-password"><p class="field-error" id="umPasswordErr"></p></div>' +
      '<div class="field"><label for="umRole">Role</label><select id="umRole">' +
        ['Admin', 'Manager', 'Agent'].map((r) => '<option value="' + r + '"' + (user && user.role === r ? ' selected' : '') + '>' + r + '</option>').join('') +
      '</select></div>' +
    '</form>',
    '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancel</button>' +
    '<button type="button" class="btn btn-primary" data-modal-ok><i class="fa-solid fa-floppy-disk"></i> ' + (user ? 'Update user' : 'Create user') + '</button>'
  );

  $('[data-modal-cancel]', wrap).addEventListener('click', closeModal);
  $('[data-modal-ok]', wrap).addEventListener('click', () => {
    const name = $('#umName', wrap).value.trim();
    const email = $('#umEmail', wrap).value.trim();
    const password = $('#umPassword', wrap).value;
    const role = $('#umRole', wrap).value;

    let ok = true;
    if (!name) { setFieldError($('#umName', wrap), $('#umNameErr', wrap), 'Name is required.'); ok = false; } else setFieldError($('#umName', wrap), $('#umNameErr', wrap), '');
    if (!email) { setFieldError($('#umEmail', wrap), $('#umEmailErr', wrap), 'Email is required.'); ok = false; }
    else if (!isEmail(email)) { setFieldError($('#umEmail', wrap), $('#umEmailErr', wrap), 'Enter a valid email address.'); ok = false; }
    else if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase() && (!user || u.id !== user.id))) {
      setFieldError($('#umEmail', wrap), $('#umEmailErr', wrap), 'This email is already registered.'); ok = false;
    } else setFieldError($('#umEmail', wrap), $('#umEmailErr', wrap), '');

    if (user) {
      if (password && password.length < 6) { setFieldError($('#umPassword', wrap), $('#umPasswordErr', wrap), 'Password must be at least 6 characters.'); ok = false; }
      else setFieldError($('#umPassword', wrap), $('#umPasswordErr', wrap), '');
    } else if (!password || password.length < 6) {
      setFieldError($('#umPassword', wrap), $('#umPasswordErr', wrap), 'Password must be at least 6 characters.'); ok = false;
    } else setFieldError($('#umPassword', wrap), $('#umPasswordErr', wrap), '');

    if (!ok) return;

    if (user) {
      user.name = name;
      user.email = email.toLowerCase();
      user.role = role;
      if (password) user.password = password;
      toast('User updated.');
    } else {
      state.users.push({ id: uid('u'), name, email: email.toLowerCase(), password, role });
      toast('User created.');
    }
    saveUsers();
    closeModal();
    renderUsers();
    applyRoleUI();
  });
}

function openProfileModal() {
  const me = currentUser();
  if (!me) return;
  const wrap = openModal(
    'My profile',
    '<form id="profileForm" novalidate>' +
      '<div class="field"><label for="pfName">Full name</label><input type="text" id="pfName" value="' + esc(me.name) + '"><p class="field-error" id="pfNameErr"></p></div>' +
      '<div class="field"><label for="pfEmail">Email</label><input type="email" id="pfEmail" value="' + esc(me.email) + '"><p class="field-error" id="pfEmailErr"></p></div>' +
      '<div class="field"><label for="pfPassword">New password (optional)</label><input type="password" id="pfPassword" autocomplete="new-password" placeholder="Leave blank to keep current password"><p class="field-error" id="pfPasswordErr"></p></div>' +
      '<p class="muted">Role: <strong>' + esc(me.role) + '</strong> — contact an administrator to change roles.</p>' +
    '</form>',
    '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancel</button>' +
    '<button type="button" class="btn btn-primary" data-modal-ok><i class="fa-solid fa-floppy-disk"></i> Save profile</button>'
  );

  $('[data-modal-cancel]', wrap).addEventListener('click', closeModal);
  $('[data-modal-ok]', wrap).addEventListener('click', () => {
    const name = $('#pfName', wrap).value.trim();
    const email = $('#pfEmail', wrap).value.trim();
    const password = $('#pfPassword', wrap).value;
    let ok = true;

    if (!name) { setFieldError($('#pfName', wrap), $('#pfNameErr', wrap), 'Name is required.'); ok = false; } else setFieldError($('#pfName', wrap), $('#pfNameErr', wrap), '');
    if (!email) { setFieldError($('#pfEmail', wrap), $('#pfEmailErr', wrap), 'Email is required.'); ok = false; }
    else if (!isEmail(email)) { setFieldError($('#pfEmail', wrap), $('#pfEmailErr', wrap), 'Enter a valid email address.'); ok = false; }
    else if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== me.id)) {
      setFieldError($('#pfEmail', wrap), $('#pfEmailErr', wrap), 'This email is already registered.'); ok = false;
    } else setFieldError($('#pfEmail', wrap), $('#pfEmailErr', wrap), '');

    if (password && password.length < 6) { setFieldError($('#pfPassword', wrap), $('#pfPasswordErr', wrap), 'Password must be at least 6 characters.'); ok = false; }
    else setFieldError($('#pfPassword', wrap), $('#pfPasswordErr', wrap), '');

    if (!ok) return;

    me.name = name;
    me.email = email.toLowerCase();
    if (password) me.password = password;
    saveUsers();
    closeModal();
    applyRoleUI();
    toast('Profile updated.');
  });
}

function openEmailModal(customerId) {
  const customer = customerById(customerId);
  if (!customer) return;
  const wrap = openModal(
    'Send email to ' + customer.name,
    '<p class="muted" style="margin-bottom:14px"><i class="fa-solid fa-circle-info"></i> Simulation only — nothing is actually sent. The message is logged as an Email interaction.</p>' +
    '<form id="emailModalForm" novalidate>' +
      '<div class="field"><label for="emTo">To</label><input type="email" id="emTo" value="' + esc(customer.email) + '" readonly></div>' +
      '<div class="field"><label for="emSubject">Subject <span class="req">*</span></label><input type="text" id="emSubject" placeholder="Subject line"><p class="field-error" id="emSubjectErr"></p></div>' +
      '<div class="field"><label for="emBody">Message <span class="req">*</span></label><textarea id="emBody" rows="5" placeholder="Write your message…"></textarea><p class="field-error" id="emBodyErr"></p></div>' +
    '</form>',
    '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancel</button>' +
    '<button type="button" class="btn btn-primary" data-modal-ok><i class="fa-solid fa-paper-plane"></i> Send &amp; log</button>'
  );

  $('[data-modal-cancel]', wrap).addEventListener('click', closeModal);
  $('[data-modal-ok]', wrap).addEventListener('click', () => {
    const subject = $('#emSubject', wrap).value.trim();
    const body = $('#emBody', wrap).value.trim();
    let ok = true;
    if (!subject) { setFieldError($('#emSubject', wrap), $('#emSubjectErr', wrap), 'Subject is required.'); ok = false; } else setFieldError($('#emSubject', wrap), $('#emSubjectErr', wrap), '');
    if (!body) { setFieldError($('#emBody', wrap), $('#emBodyErr', wrap), 'Message is required.'); ok = false; } else setFieldError($('#emBody', wrap), $('#emBodyErr', wrap), '');
    if (!ok) return;

    saveInteraction({ customerId: customer.id, type: 'Email', subject, notes: body, date: new Date().toISOString() });
    closeModal();
    toast('Email logged for ' + customer.name + '.');
    renderRoute();
  });
}

function openInteractionModal(customerId) {
  const customer = customerById(customerId);
  if (!customer) return;
  const wrap = openModal(
    'Log interaction — ' + customer.name,
    '<form id="logModalForm" novalidate>' +
      '<div class="field"><label for="imType">Type</label><select id="imType"><option value="Email">Email</option><option value="Call">Call</option><option value="Meeting">Meeting</option></select></div>' +
      '<div class="field"><label for="imSubject">Subject <span class="req">*</span></label><input type="text" id="imSubject" placeholder="e.g. Follow-up call"><p class="field-error" id="imSubjectErr"></p></div>' +
      '<div class="field"><label for="imNotes">Notes</label><textarea id="imNotes" rows="3" placeholder="Outcome / next steps"></textarea></div>' +
      '<div class="field"><label for="imDate">Date</label><input type="date" id="imDate" value="' + todayISO() + '"></div>' +
    '</form>',
    '<button type="button" class="btn btn-ghost" data-modal-cancel>Cancel</button>' +
    '<button type="button" class="btn btn-primary" data-modal-ok><i class="fa-solid fa-plus"></i> Log interaction</button>'
  );

  $('[data-modal-cancel]', wrap).addEventListener('click', closeModal);
  $('[data-modal-ok]', wrap).addEventListener('click', () => {
    const type = $('#imType', wrap).value;
    const subject = $('#imSubject', wrap).value.trim();
    const notes = $('#imNotes', wrap).value.trim();
    const dateVal = $('#imDate', wrap).value || todayISO();
    if (!subject) { setFieldError($('#imSubject', wrap), $('#imSubjectErr', wrap), 'Subject is required.'); return; }
    setFieldError($('#imSubject', wrap), $('#imSubjectErr', wrap), '');

    saveInteraction({
      customerId: customer.id,
      type,
      subject,
      notes,
      date: new Date(dateVal + 'T' + new Date().toTimeString().slice(0, 8)).toISOString()
    });
    closeModal();
    toast(type + ' logged for ' + customer.name + '.');
    renderRoute();
  });
}

/* ============ 8. EXPORT / IMPORT ============ */

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    customers: state.customers,
    leads: state.leads,
    interactions: state.interactions,
    users: state.users,
    settings: state.settings
  };
  downloadFile('crm-backup-' + todayISO() + '.json', JSON.stringify(payload, null, 2), 'application/json');
  toast('JSON backup exported.');
}

function importJSONFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object') throw new Error('bad file');
      if (!Array.isArray(data.customers)) throw new Error('missing customers');
      state.customers = data.customers;
      state.leads = Array.isArray(data.leads) ? data.leads : state.leads;
      state.interactions = Array.isArray(data.interactions) ? data.interactions : state.interactions;
      if (Array.isArray(data.users) && data.users.length) state.users = data.users;
      if (data.settings && typeof data.settings === 'object') state.settings = Object.assign({}, state.settings, data.settings);
      saveAll();
      applyTheme();
      renderRoute();
      toast('Data imported from JSON.');
    } catch (err) {
      toast('Import failed: that file is not a valid CRM backup.', 'error');
    }
  };
  reader.readAsText(file);
}

function csvEscape(value) {
  const s = String(value === undefined || value === null ? '' : value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportCSV() {
  const header = ['id', 'name', 'email', 'phone', 'company', 'status', 'notes', 'createdAt'];
  const lines = [header.join(',')];
  state.customers.forEach((c) => {
    lines.push([c.id, c.name, c.email, c.phone, c.company, c.status, c.notes, c.createdAt].map(csvEscape).join(','));
  });
  downloadFile('crm-customers-' + todayISO() + '.csv', lines.join('\n'), 'text/csv;charset=utf-8');
  toast('Customers exported to CSV.');
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cur);
      cur = '';
    } else if (ch === '\n') {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else if (ch !== '\r') {
      cur += ch;
    }
  }
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

function importCSVFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseCSV(String(reader.result));
      if (rows.length < 2) throw new Error('no rows');
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const idx = (name) => header.indexOf(name);
      if (idx('name') === -1 || idx('email') === -1) throw new Error('missing columns');
      let added = 0;
      rows.slice(1).forEach((r) => {
        const email = (r[idx('email')] || '').trim();
        const name = (r[idx('name')] || '').trim();
        if (!name || !isEmail(email)) return;
        if (state.customers.some((c) => c.email.toLowerCase() === email.toLowerCase())) return;
        state.customers.unshift({
          id: uid('c'),
          name,
          email,
          phone: (idx('phone') > -1 ? r[idx('phone')] : '') || '',
          company: (idx('company') > -1 ? r[idx('company')] : '') || '—',
          status: ['Active', 'Inactive', 'Lead'].indexOf((idx('status') > -1 ? r[idx('status')] : '')) !== -1 ? r[idx('status')] : 'Active',
          notes: (idx('notes') > -1 ? r[idx('notes')] : '') || '',
          createdAt: (idx('createdat') > -1 ? r[idx('createdat')] : '') || new Date().toISOString()
        });
        added++;
      });
      saveCustomers();
      renderRoute();
      toast(added ? added + ' customer(s) imported.' : 'No new customers found in the file.', added ? 'success' : 'info');
    } catch (err) {
      toast('Import failed: expected columns id, name, email, phone, company, status, notes, createdAt.', 'error');
    }
  };
  reader.readAsText(file);
}

function exportReportPDF() {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    toast('PDF library failed to load.', 'error');
    return;
  }
  const data = reportData();
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text(data.title, 40, 40);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text((state.settings.companyName || 'CRM') + '  ·  Generated ' + new Date().toLocaleString(), 40, 58);

  doc.autoTable({
    startY: 72,
    head: [data.head],
    body: data.body,
    styles: { fontSize: 8, cellPadding: 6, textColor: [30, 30, 30] },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 246, 251] },
    margin: { left: 40, right: 40 }
  });

  doc.save(data.title.toLowerCase().replace(/\s+/g, '-') + '-' + todayISO() + '.pdf');
  toast('Report exported to PDF.');
}

function exportReportExcel() {
  if (typeof XLSX === 'undefined') {
    toast('Excel library failed to load.', 'error');
    return;
  }
  const data = reportData();
  const aoa = [data.head].concat(data.body);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = data.head.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, state.report.type === 'customers' ? 'Customers' : 'Activity');
  XLSX.writeFile(wb, data.title.toLowerCase().replace(/\s+/g, '-') + '-' + todayISO() + '.xlsx');
  toast('Report exported to Excel.');
}

function resetToSeed() {
  confirmAction({
    title: 'Reset all data?',
    message: 'This will replace every customer, lead, interaction, user and setting with the original seed data. This cannot be undone.',
    confirmText: 'Reset data'
  }, () => {
    const seed = seedData();
    state.customers = seed.customers;
    state.leads = seed.leads;
    state.interactions = seed.interactions;
    state.users = seed.users;
    state.settings = seed.settings;
    state.session = { userId: 'u_admin' };
    state.customerPage = 1;
    state.customerSearch = '';
    state.customerStatus = 'all';
    saveAll();
    saveSession();
    applyTheme();
    applyRoleUI();
    renderRoute();
    toast('Data reset to seed.');
  });
}

/* ============ 9. EVENT HANDLERS ============ */

function bindEvents() {
  /* ---- Auth tabs & demo logins ---- */
  $$('[data-auth-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setAuthTab(btn.dataset.authTab));
  });

  $$('[data-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parts = btn.dataset.demo.split('|');
      $('#tabLogin').click();
      $('#loginEmail').value = parts[0];
      $('#loginPassword').value = parts[1];
      $('#loginForm').requestSubmit ? $('#loginForm').requestSubmit() : $('#loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;
    let ok = true;
    if (!email) { setFieldError($('#loginEmail'), $('#loginEmailErr'), 'Email is required.'); ok = false; }
    else if (!isEmail(email)) { setFieldError($('#loginEmail'), $('#loginEmailErr'), 'Enter a valid email address.'); ok = false; }
    else setFieldError($('#loginEmail'), $('#loginEmailErr'), '');
    if (!password) { setFieldError($('#loginPassword'), $('#loginPasswordErr'), 'Password is required.'); ok = false; }
    else setFieldError($('#loginPassword'), $('#loginPasswordErr'), '');
    if (!ok) return;

    const result = login(email, password);
    if (!result.ok) {
      setFieldError($('#loginPassword'), $('#loginPasswordErr'), result.error);
      toast(result.error, 'error');
      return;
    }
    $('#loginForm').reset();
    toast('Welcome back, ' + result.user.name.split(' ')[0] + '!');
    if (location.hash && location.hash !== '#dashboard' && canSee(location.hash.replace('#', '').split('/')[0])) renderRoute();
    else location.hash = '#dashboard';
    renderRoute();
  });

  $('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#regName').value.trim();
    const email = $('#regEmail').value.trim();
    const password = $('#regPassword').value;
    const role = $('#regRole').value;
    let ok = true;

    if (!name) { setFieldError($('#regName'), $('#regNameErr'), 'Name is required.'); ok = false; } else setFieldError($('#regName'), $('#regNameErr'), '');
    if (!email) { setFieldError($('#regEmail'), $('#regEmailErr'), 'Email is required.'); ok = false; }
    else if (!isEmail(email)) { setFieldError($('#regEmail'), $('#regEmailErr'), 'Enter a valid email address.'); ok = false; }
    else if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) { setFieldError($('#regEmail'), $('#regEmailErr'), 'This email is already registered.'); ok = false; }
    else setFieldError($('#regEmail'), $('#regEmailErr'), '');
    if (!password || password.length < 6) { setFieldError($('#regPassword'), $('#regPasswordErr'), 'Password must be at least 6 characters.'); ok = false; }
    else setFieldError($('#regPassword'), $('#regPasswordErr'), '');
    if (!ok) return;

    const result = register(name, email, password, role);
    if (!result.ok) { toast(result.error, 'error'); return; }
    $('#registerForm').reset();
    toast('Account created. Signed in as ' + result.user.role + '.');
    location.hash = '#dashboard';
    renderRoute();
  });

  /* ---- Topbar ---- */
  $('#themeBtn').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    saveSettings();
    applyTheme();
    renderRoute();
    toast(state.settings.theme === 'dark' ? 'Dark mode on.' : 'Light mode on.', 'info');
  });

  $('#menuBtn').addEventListener('click', openDrawer);
  $('#sidebarOverlay').addEventListener('click', closeDrawer);

  $('#userBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = $('#userDropdown');
    dd.classList.toggle('hidden');
    $('#userBtn').setAttribute('aria-expanded', String(!dd.classList.contains('hidden')));
  });

  /* ---- Global search ---- */
  $('#globalSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const box = $('#searchResults');
    if (!q) { box.classList.add('hidden'); box.innerHTML = ''; return; }

    const custs = state.customers.filter((c) => (c.name + ' ' + c.email + ' ' + c.company).toLowerCase().indexOf(q) !== -1).slice(0, 4);
    const leads = state.leads.filter((l) => (l.name + ' ' + l.company + ' ' + l.email).toLowerCase().indexOf(q) !== -1).slice(0, 3);

    let html = custs.map((c) => (
      '<button type="button" class="search-item" data-action="open-customer" data-id="' + esc(c.id) + '">' +
        '<i class="fa-solid fa-user"></i><span><strong>' + esc(c.name) + '</strong><small>' + esc(c.company) + ' · customer</small></span>' +
      '</button>'
    )).join('') + leads.map((l) => (
      '<button type="button" class="search-item" data-action="open-leads">' +
        '<i class="fa-solid fa-bullseye"></i><span><strong>' + esc(l.name) + '</strong><small>' + esc(l.company) + ' · lead · ' + esc(l.status) + '</small></span>' +
      '</button>'
    )).join('');

    if (!html) html = '<div class="search-empty">No matches for “' + esc(q) + '”</div>';
    box.innerHTML = html;
    box.classList.remove('hidden');
  });

  /* ---- Customer search / filters ---- */
  $('#customerSearch').addEventListener('input', (e) => {
    state.customerSearch = e.target.value;
    state.customerPage = 1;
    renderCustomers();
  });

  $('#leadSearch').addEventListener('input', (e) => {
    state.leadSearch = e.target.value;
    renderLeads();
  });

  /* ---- Forms ---- */
  $('#customerForm').addEventListener('submit', (e) => { e.preventDefault(); submitCustomerForm(); });
  $('#interactionForm').addEventListener('submit', (e) => { e.preventDefault(); submitInteractionForm(); });
  $('#settingsForm').addEventListener('submit', (e) => { e.preventDefault(); submitSettingsForm(); });

  $('#setTheme').addEventListener('change', () => {
    state.settings.theme = $('#setTheme').value;
    saveSettings();
    applyTheme();
  });

  /* ---- File imports ---- */
  $('#importJsonInput').addEventListener('change', (e) => {
    if (e.target.files[0]) importJSONFile(e.target.files[0]);
    e.target.value = '';
  });
  $('#importCsvInput').addEventListener('change', (e) => {
    if (e.target.files[0]) importCSVFile(e.target.files[0]);
    e.target.value = '';
  });

  /* ---- Delegated clicks ---- */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      $('#userDropdown').classList.add('hidden');
      $('#userBtn').setAttribute('aria-expanded', 'false');
    }
    if (!e.target.closest('.search-box')) {
      $('#searchResults').classList.add('hidden');
    }

    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const id = el.dataset.id;

    switch (action) {
      case 'modal-close':
        closeModal();
        break;

      case 'profile':
        $('#userDropdown').classList.add('hidden');
        openProfileModal();
        break;

      case 'logout':
        $('#userDropdown').classList.add('hidden');
        confirmAction({ title: 'Log out?', message: 'You will be returned to the login screen.', confirmText: 'Log out', danger: false }, logout);
        break;

      case 'open-customer':
        $('#searchResults').classList.add('hidden');
        $('#globalSearch').value = '';
        navigate('customer/' + id);
        break;

      case 'open-leads':
        $('#searchResults').classList.add('hidden');
        $('#globalSearch').value = '';
        navigate('leads');
        break;

      case 'customer-edit':
        openCustomerForm(id);
        break;

      case 'customer-email':
        openEmailModal(id);
        break;

      case 'customer-log':
        openInteractionModal(id);
        break;

      case 'customer-delete': {
        if (!canDelete()) { toast('Your role cannot delete records.', 'error'); break; }
        const customer = customerById(id);
        if (!customer) break;
        confirmAction({
          title: 'Delete customer?',
          message: 'This will permanently delete ' + customer.name + ' and cannot be undone.'
        }, () => {
          state.customers = state.customers.filter((c) => c.id !== id);
          state.interactions = state.interactions.filter((i) => i.customerId !== id);
          saveCustomers();
          saveInteractions();
          if (location.hash.indexOf('#customer/') === 0) navigate('customers');
          else renderCustomers();
          toast('Customer deleted.');
        });
        break;
      }

      case 'clear-customer-filters':
        state.customerSearch = '';
        state.customerStatus = 'all';
        state.customerPage = 1;
        $('#customerSearch').value = '';
        $('#customerStatusFilter').value = 'all';
        renderCustomers();
        break;

      case 'customer-page': {
        const p = Number(el.dataset.pageNum);
        if (p >= 1) {
          state.customerPage = p;
          renderCustomers();
          $('#page-customers').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      }

      case 'customer-sort-th': {
        const key = el.dataset.key;
        if (state.customerSort.key === key) {
          state.customerSort.dir = state.customerSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          state.customerSort = { key, dir: 'asc' };
        }
        state.customerPage = 1;
        syncSortSelect();
        renderCustomers();
        break;
      }

      case 'lead-add':
        openLeadModal(null);
        break;

      case 'lead-edit':
        openLeadModal(id);
        break;

      case 'lead-delete': {
        if (!canDelete()) { toast('Your role cannot delete records.', 'error'); break; }
        const lead = leadById(id);
        if (!lead) break;
        confirmAction({
          title: 'Delete lead?',
          message: 'This will permanently delete the lead “' + lead.name + '”.'
        }, () => {
          state.leads = state.leads.filter((l) => l.id !== id);
          saveLeads();
          renderLeads();
          toast('Lead deleted.');
        });
        break;
      }

      case 'lead-convert': {
        const lead = leadById(id);
        if (!lead) break;
        if (state.customers.some((c) => c.email.toLowerCase() === lead.email.toLowerCase())) {
          toast('A customer with this email already exists.', 'error');
          break;
        }
        confirmAction({
          title: 'Convert to customer?',
          message: lead.name + ' from ' + lead.company + ' will be added as a customer and the lead marked as Won.',
          confirmText: 'Convert',
          danger: false
        }, () => {
          const customer = {
            id: uid('c'),
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '—',
            company: lead.company,
            status: 'Active',
            notes: 'Converted from lead (' + lead.source + ', ' + fmtMoney(lead.value) + ').',
            createdAt: new Date().toISOString()
          };
          state.customers.unshift(customer);
          lead.status = 'Won';
          saveCustomers();
          saveLeads();
          renderLeads();
          toast('Lead converted to customer.');
        });
        break;
      }

      case 'user-add':
        if (!isAdmin()) { toast('Admins only.', 'error'); break; }
        openUserModal(null);
        break;

      case 'user-edit':
        if (!isAdmin()) { toast('Admins only.', 'error'); break; }
        openUserModal(id);
        break;

      case 'user-delete': {
        if (!isAdmin()) { toast('Admins only.', 'error'); break; }
        const user = userById(id);
        if (!user) break;
        confirmAction({
          title: 'Delete user?',
          message: 'This will remove the account for ' + user.name + '.'
        }, () => {
          state.users = state.users.filter((u) => u.id !== id);
          saveUsers();
          renderUsers();
          applyRoleUI();
          toast('User deleted.');
        });
        break;
      }

      case 'report-pdf':
        exportReportPDF();
        break;

      case 'report-excel':
        exportReportExcel();
        break;

      case 'export-json':
        exportJSON();
        break;

      case 'import-json':
        $('#importJsonInput').click();
        break;

      case 'export-csv':
        exportCSV();
        break;

      case 'import-csv':
        $('#importCsvInput').click();
        break;

      case 'reset-data':
        if (!isAdmin()) { toast('Admins only.', 'error'); break; }
        resetToSeed();
        break;

      default:
        break;
    }
  });

  /* ---- Delegated changes ---- */
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'customer-status-filter':
        state.customerStatus = el.value;
        state.customerPage = 1;
        renderCustomers();
        break;

      case 'customer-sort': {
        const parts = el.value.split('-');
        const dir = parts.pop();
        state.customerSort = { key: parts.join('-'), dir };
        state.customerPage = 1;
        renderCustomers();
        break;
      }

      case 'int-filter-type':
        state.intFilters.type = el.value;
        renderInteractions();
        break;

      case 'int-filter-customer':
        state.intFilters.customer = el.value;
        renderInteractions();
        break;

      case 'int-filter-from':
        state.intFilters.from = el.value;
        renderInteractions();
        break;

      case 'int-filter-to':
        state.intFilters.to = el.value;
        renderInteractions();
        break;

      case 'lead-status-filter':
        state.leadStatus = el.value;
        renderLeads();
        break;

      case 'lead-status': {
        const lead = leadById(el.dataset.id);
        if (lead) {
          lead.status = el.value;
          saveLeads();
          renderLeads();
          toast('Lead moved to ' + lead.status + '.', 'info');
        }
        break;
      }

      case 'report-type':
        state.report.type = el.value;
        renderReports();
        break;

      case 'report-from':
        state.report.from = el.value;
        renderReports();
        break;

      case 'report-to':
        state.report.to = el.value;
        renderReports();
        break;

      case 'report-status':
        state.report.status = el.value;
        renderReports();
        break;

      case 'report-activity-type':
        state.report.activityType = el.value;
        renderReports();
        break;

      default:
        break;
    }
  });

  /* ---- Keyboard ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      $('#userDropdown').classList.add('hidden');
      $('#searchResults').classList.add('hidden');
      closeDrawer();
    }
    if (e.key === 'Enter' && e.target.matches('tr[data-action="open-customer"]')) {
      navigate('customer/' + e.target.dataset.id);
    }
  });

  /* ---- Router ---- */
  window.addEventListener('hashchange', renderRoute);
}

function syncSortSelect() {
  const select = $('#customerSort');
  const value = state.customerSort.key + '-' + state.customerSort.dir;
  let option = Array.from(select.options).find((o) => o.value === value);
  if (!option) {
    option = document.createElement('option');
    option.value = value;
    option.textContent = state.customerSort.key + ' ' + state.customerSort.dir.toUpperCase();
    select.appendChild(option);
  }
  select.value = value;
}

/* ============ 10. BOOT ============ */

(function boot() {
  loadAll();
  applyTheme();
  bindEvents();

  if (!state.session || !currentUser()) {
    showAuth();
    if (location.hash && location.hash !== '#dashboard') {
      history.replaceState(null, '', '#dashboard');
    }
    return;
  }

  showApp();
  applyRoleUI();
  if (!location.hash) location.hash = '#dashboard';
  renderRoute();
})();
