/* ============================================================
   Agente Dashboard — JS
   i18n · Mock API · Router · Renderers
   ============================================================ */

'use strict';

(function() {
  const savedTheme = localStorage.getItem('agente_theme');
  if (savedTheme && savedTheme !== 'default') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
})();

/* ── i18n ─────────────────────────────────────────────────── */
const i18n = {
  pt: {
    'nav.overview': 'Visão Geral',
    'nav.conversations': 'Conversas',
    'nav.catalog': 'Catálogo',
    'nav.settings': 'Configurações',
    'kpi.conversations': 'Conversas hoje',
    'kpi.response_time': 'Tempo de resposta',
    'kpi.handoffs': 'Atendimentos humanos',
    'kpi.leads': 'Leads capturados',
    'kpi.via_ai': 'via IA',
    'kpi.takeovers': 'takeovers hoje',
    'kpi.qualified': 'mensagens qualificadas',
    'kpi.vs_yesterday': 'vs. ontem',
    'table.client': 'Cliente',
    'table.last_message': 'Última mensagem',
    'table.status': 'Status',
    'table.time': 'Horário',
    'table.action': 'Ação',
    'catalog.add': 'Adicionar produto',
    'catalog.edit_title': 'Editar produto',
    'catalog.add_title': 'Novo produto',
    'catalog.name': 'Nome',
    'catalog.category': 'Categoria',
    'catalog.custom_category': 'Outra categoria',
    'catalog.custom_category_placeholder': 'Digite a categoria…',
    'catalog.price': 'Preço',
    'catalog.stock': 'Estoque',
    'catalog.description': 'Descrição',
    'catalog.specs': 'Especificações',
    'catalog.save': 'Salvar produto',
    'catalog.cancel': 'Cancelar',
    'catalog.col_num': '#',
    'catalog.col_name': 'Nome',
    'catalog.col_cat': 'Categoria',
    'catalog.col_price': 'Preço',
    'catalog.col_stock': 'Estoque',
    'catalog.col_status': 'Status',
    'catalog.col_actions': 'Ações',
    'catalog.desc_hint': 'Escreva descrições detalhadas para melhorar a busca por IA',
    'catalog.filter_name': 'Buscar por nome…',
    'catalog.filter_all_cats': 'Todas as categorias',
    'catalog.no_results': 'Nenhum produto encontrado.',
    'status.active': 'Ativo',
    'status.paused': 'Pausado',
    'status.inactive': 'Inativo',
    'status.ai_on': 'IA ativada',
    'status.ai_off': 'IA pausada',
    'empty.conversations': 'Nenhuma conversa ainda.',
    'empty.catalog': 'Catálogo vazio. Adicione seu primeiro produto.',
    'empty.conv_select': 'Selecione uma conversa para visualizar',
    'error.generic': 'Erro ao carregar dados.',
    'btn.retry': 'Tentar novamente',
    'btn.open': 'Abrir',
    'btn.logout': 'Sair',
    'btn.edit': 'Editar',
    'btn.delete': 'Excluir',
    'login.title': 'Agente',
    'login.subtitle': 'Gerencie seu assistente no WhatsApp',
    'login.email': 'E-mail',
    'login.password': 'Senha',
    'login.btn': 'Entrar',
    'overview.title': 'Visão Geral',
    'overview.recent': 'Conversas recentes',
    'overview.chart': 'Volume de conversas — últimos 7 dias',
    'conversations.title': 'Conversas',
    'catalog.title': 'Catálogo',
    'settings.title': 'Configurações',
    'settings.soon': 'Em breve',
    'settings.soon_sub': 'Personalizações de horário, tom de voz e integrações estarão aqui.',
    'nav.config_general': 'Geral',
    'nav.config_theme': 'Tema do Aplicativo',
    'config.theme': 'Tema do Aplicativo',
    'config.theme_default': 'Padrão (Ouro)',
    'config.theme_soft_black': 'Preto Suave',
    'config.theme_light_brown': 'Marrom Claro',
    'config.account': 'Dados da Conta',
    'config.biz_name': 'Nome do Negócio',
    'config.biz_name_hint': 'Nome exibido no aplicativo',
    'config.phone': 'Telefone WhatsApp',
    'config.phone_hint': 'Número vinculado ao agente. Não pode ser alterado.',
    'config.email': 'E-mail',
    'config.save': 'Salvar',
    'config.saving': 'Salvando…',
    'config.saved': 'Salvo com sucesso',
    'config.save_error': 'Erro ao salvar',
    'config.danger': 'Zona de Perigo',
    'config.delete_acct': 'Excluir conta',
    'config.delete_warn': 'Esta ação é permanente e não pode ser desfeita.',
    'config.delete_confirm': 'Confirmar exclusão',
    'config.delete_cancel': 'Cancelar',
    'topbar.user': 'Móveis Viana',
    'topbar.role': 'Administrador',
    'select_conv': 'Selecione uma conversa',
  },
  en: {
    'nav.overview': 'Overview',
    'nav.conversations': 'Conversations',
    'nav.catalog': 'Catalog',
    'nav.settings': 'Settings',
    'kpi.conversations': 'Conversations today',
    'kpi.response_time': 'Response time',
    'kpi.handoffs': 'Human handoffs',
    'kpi.leads': 'Leads captured',
    'kpi.via_ai': 'via AI',
    'kpi.takeovers': 'takeovers today',
    'kpi.qualified': 'qualified messages',
    'kpi.vs_yesterday': 'vs. yesterday',
    'table.client': 'Client',
    'table.last_message': 'Last message',
    'table.status': 'Status',
    'table.time': 'Time',
    'table.action': 'Action',
    'catalog.add': 'Add product',
    'catalog.edit_title': 'Edit product',
    'catalog.add_title': 'New product',
    'catalog.name': 'Name',
    'catalog.category': 'Category',
    'catalog.custom_category': 'Other category',
    'catalog.custom_category_placeholder': 'Enter category…',
    'catalog.price': 'Price',
    'catalog.stock': 'Stock',
    'catalog.description': 'Description',
    'catalog.specs': 'Specifications',
    'catalog.save': 'Save product',
    'catalog.cancel': 'Cancel',
    'catalog.col_num': '#',
    'catalog.col_name': 'Name',
    'catalog.col_cat': 'Category',
    'catalog.col_price': 'Price',
    'catalog.col_stock': 'Stock',
    'catalog.col_status': 'Status',
    'catalog.col_actions': 'Actions',
    'catalog.desc_hint': 'Write detailed descriptions to improve AI search',
    'catalog.filter_name': 'Search by name…',
    'catalog.filter_all_cats': 'All categories',
    'catalog.no_results': 'No products found.',
    'status.active': 'Active',
    'status.paused': 'Paused',
    'status.inactive': 'Inactive',
    'status.ai_on': 'AI active',
    'status.ai_off': 'AI paused',
    'empty.conversations': 'No conversations yet.',
    'empty.catalog': 'Catalog is empty. Add your first product.',
    'empty.conv_select': 'Select a conversation to view',
    'error.generic': 'Error loading data.',
    'btn.retry': 'Retry',
    'btn.open': 'Open',
    'btn.logout': 'Logout',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'login.title': 'Agente',
    'login.subtitle': 'Manage your WhatsApp AI assistant',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.btn': 'Sign in',
    'overview.title': 'Overview',
    'overview.recent': 'Recent conversations',
    'overview.chart': 'Conversation volume — last 7 days',
    'conversations.title': 'Conversations',
    'catalog.title': 'Catalog',
    'settings.title': 'Settings',
    'settings.soon': 'Coming soon',
    'settings.soon_sub': 'Business hours, tone, and integrations will be configured here.',
    'nav.config_general': 'General',
    'nav.config_theme': 'Application Theme',
    'config.theme': 'App Theme',
    'config.theme_default': 'Default (Gold)',
    'config.theme_soft_black': 'Soft Black',
    'config.theme_light_brown': 'Light Brown',
    'config.account': 'Account Details',
    'config.biz_name': 'Business Name',
    'config.biz_name_hint': 'Name shown in application',
    'config.phone': 'WhatsApp Phone',
    'config.phone_hint': 'Number linked to the agent. Cannot be changed.',
    'config.email': 'Email',
    'config.save': 'Save',
    'config.saving': 'Saving…',
    'config.saved': 'Saved successfully',
    'config.save_error': 'Error saving',
    'config.danger': 'Danger Zone',
    'config.delete_acct': 'Delete account',
    'config.delete_warn': 'This action is permanent and cannot be undone.',
    'config.delete_confirm': 'Confirm deletion',
    'config.delete_cancel': 'Cancel',
    'topbar.user': 'Viana Furniture',
    'topbar.role': 'Administrator',
    'select_conv': 'Select a conversation',
  }
};

let currentLang = localStorage.getItem('agente_lang') || 'pt';

function t(key) {
  return i18n[currentLang][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('agente_lang', lang);
  renderAll();
  updateLangButtons();
}

function updateLangButtons() {
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === currentLang);
  });
}

/* ── CATEGORIES ──────────────────────────────────────────── */
// Edit this list to add, remove, or rename categories.
// Each entry has a Portuguese canonical value (stored in the DB) and an English translation.
const DEFAULT_CATEGORIES = [
  { pt: 'Sofás e Poltronas', en: 'Sofas & Armchairs' },
  { pt: 'Salas de Jantar', en: 'Dining Room' },
  { pt: 'Quartos', en: 'Bedroom' },
  { pt: 'Salas de Estar', en: 'Living Room' },
  { pt: 'Escritório', en: 'Office' },
  { pt: 'Área Externa', en: 'Outdoor' },
  { pt: 'Colchões', en: 'Mattresses' },
  { pt: 'Acessórios e Decoração', en: 'Accessories & Decor' },
];

// Returns the display label for a category's PT canonical name in the current language.
function tCat(ptName) {
  const cat = DEFAULT_CATEGORIES.find(c => c.pt === ptName);
  if (!cat) return ptName; // unknown / custom value — show as-is
  return currentLang === 'en' ? cat.en : cat.pt;
}

// Builds the <option> list for the category select.
function categoryOptions(selected) {
  const placeholder = currentLang === 'en' ? 'Select a category…' : 'Selecione uma categoria…';
  const isCustom = selected && !DEFAULT_CATEGORIES.find(c => c.pt === selected);
  const opts = DEFAULT_CATEGORIES.map(c => {
    const label = currentLang === 'en' ? c.en : c.pt;
    const isSelected = selected === c.pt ? ' selected' : '';
    return `<option value="${escapeHtml(c.pt)}"${isSelected}>${escapeHtml(label)}</option>`;
  }).join('');
  const blankSelected = selected ? '' : ' selected';
  const customLabel = t('catalog.custom_category');
  const customSel = isCustom ? ' selected' : '';
  return `<option value=""${blankSelected} disabled>${escapeHtml(placeholder)}</option>${opts}<option value="__custom__"${customSel}>${escapeHtml(customLabel)}</option>`;
}

function onCategoryChange() {
  const sel = document.getElementById('f-category');
  const inp = document.getElementById('f-category-custom');
  if (!sel || !inp) return;
  const isCustom = sel.value === '__custom__';
  inp.style.display = isCustom ? 'block' : 'none';
  if (isCustom) inp.focus();
}

// Builds the <option> list for the category filter (includes "All categories" first).
function filterCategoryOptions() {
  const all = escapeHtml(t('catalog.filter_all_cats'));
  const opts = DEFAULT_CATEGORIES.map(c => {
    const label = currentLang === 'en' ? c.en : c.pt;
    return `<option value="${escapeHtml(c.pt)}">${escapeHtml(label)}</option>`;
  }).join('');
  return `<option value="">${all}</option>${opts}`;
}

/* ── XSS ESCAPE ──────────────────────────────────────────── */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Populated when catalog loads; used by openEditDrawer
let _products = [];

/* ── REAL API ─────────────────────────────────────────────── */
const API_HEADERS = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('agente_token')}`,
});

async function realAPI(endpoint, opts = {}) {
  const res = await fetch(endpoint, {
    method: opts.method || 'GET',
    headers: API_HEADERS(),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const mockAPI = realAPI;

/* ── HELPERS ──────────────────────────────────────────────── */
function relTime(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return diff + 's';
  if (diff < 3600) return Math.floor(diff / 60) + 'min';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 172800) return 'ontem';
  return Math.floor(diff / 86400) + 'd';
}

function volume7dToChartData(volume7d) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return volume7d.map(v => ({
    day: dayNames[new Date(v.date + 'T12:00:00').getDay()],
    val: v.count,
  }));
}

function msgCssRole(role) {
  const r = (role || '').replace(/"/g, '').trim().toLowerCase();
  if (['assistant', 'owner', 'employee', 'business'].includes(r)) return 'ai';
  return 'customer';
}

/* ── ROUTER ───────────────────────────────────────────────── */
const ROUTES = {
  '#/overview': renderOverview,
  '#/conversas': renderConversas,
  '#/catalogo': renderCatalogo,
  '#/config': function() {
    history.replaceState(null, '', '#/config/general');
    router();
  },
  '#/config/general': renderConfigGeneral,
  '#/config/theme': renderConfigThemeSection,
};

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const isOpen = sidebar.classList.toggle('sidebar--open');
  if (backdrop) backdrop.classList.toggle('backdrop--visible', isOpen);
  document.body.classList.toggle('body--no-scroll', isOpen);
}

function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('sidebar--open');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.classList.remove('backdrop--visible');
  document.body.classList.remove('body--no-scroll');
}

function navigate(hash) {
  closeSidebar();
  history.pushState(null, '', hash);
  router();
}

function toggleNavGroup(group) {
  const el = document.getElementById('nav-group-' + group);
  if (el) el.toggleAttribute('data-open');
}

function router() {
  const hash = location.hash || '#/overview';
  const render = ROUTES[hash] || renderOverview;

  // Update top-level nav-item active states
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === hash);
  });

  // Update sub-item active states
  document.querySelectorAll('.nav-sub-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === hash);
  });

  // Auto-expand config group and mark parent active when on any config sub-route
  const configGroup = document.getElementById('nav-group-config');
  const configParent = document.querySelector('.nav-parent[data-group="config"]');
  if (hash.startsWith('#/config')) {
    if (configGroup) configGroup.setAttribute('data-open', '');
    if (configParent) configParent.classList.add('active');
  } else {
    if (configParent) configParent.classList.remove('active');
  }

  // Update topbar breadcrumb
  const pageNames = {
    '#/overview': t('nav.overview'),
    '#/conversas': t('nav.conversations'),
    '#/catalogo': t('nav.catalog'),
    '#/config/general': t('nav.config_general'),
    '#/config/theme': t('nav.config_theme'),
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = pageNames[hash] || '';

  render();
}

/* ── USER INFO ────────────────────────────────────────────── */
let _userInfo = null;

function applyUserInfo(profile) {
  _userInfo = profile;
  const name = profile.business_name || profile.email;
  const initials = name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  const sidebarName = document.querySelector('.sidebar-user-name');
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (sidebarName) sidebarName.textContent = name;

  const topbarAvatar = document.getElementById('topbar-avatar');
  if (topbarAvatar) topbarAvatar.textContent = initials;

  const dropdown = document.getElementById('avatar-dropdown');
  if (dropdown) {
    const nameEl = dropdown.querySelector('.dropdown-user-name');
    const emailEl = dropdown.querySelector('.dropdown-user-email');
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = profile.email;
  }
}

/* ── RENDER ALL (i18n re-render) ─────────────────────────── */
function renderAll() {
  // Update static i18n text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Re-apply real user info (i18n sweep above would overwrite .sidebar-user-name)
  if (_userInfo) applyUserInfo(_userInfo);
  // Re-run page renderer
  router();
}

/* ── SKELETON HELPERS ─────────────────────────────────────── */
function skLine(w = '100%', h = 14, mb = 0) {
  return `<div class="skeleton sk-line" style="width:${w};height:${h}px;${mb ? `margin-bottom:${mb}px` : ''}"></div>`;
}

function skBlock(w = '100%', h = 80) {
  return `<div class="skeleton sk-block" style="width:${w};height:${h}px"></div>`;
}

/* ── PILL HELPER ──────────────────────────────────────────── */
function pill(status) {
  if (status === 'active') return `<span class="pill pill-active">${t('status.active')}</span>`;
  if (status === 'paused') return `<span class="pill pill-paused">${t('status.paused')}</span>`;
  if (status === 'error') return `<span class="pill pill-error">${t('status.paused')}</span>`;
  if (status === 'inactive') return `<span class="pill pill-gray">${t('status.inactive')}</span>`;
  return `<span class="pill pill-gray">${status}</span>`;
}

function formatPrice(n) {
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── TOAST ────────────────────────────────────────────────── */
function showToast(message, type = 'success') {
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ── ERROR BANNER ─────────────────────────────────────────── */
function errorBanner() {
  return `
    <div class="error-banner">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="#C99A2E" stroke-width="1.5"/>
        <path d="M10 6v5M10 13.5v.5" stroke="#C99A2E" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>${t('error.generic')}</span>
      <button class="retry-btn" id="retry-btn">${t('btn.retry')}</button>
    </div>`;
}

/* ── OVERVIEW PAGE ────────────────────────────────────────── */
function renderOverview() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-section">
      <div class="page-header">
        <h1 class="page-title-large font-display">${t('overview.title')}</h1>
      </div>
      <div class="kpi-strip" id="kpi-strip">
        ${[0, 1, 2, 3].map(() => `
          <div class="kpi-card">
            ${skLine('60%', 11, 12)}
            ${skBlock('55%', 44)}
            ${skLine('40%', 12)}
          </div>
        `).join('')}
      </div>
      <div class="card mb-24" id="chart-card">
        <div class="flex items-center justify-between mb-16">
          <span class="font-display text-20">${t('overview.chart')}</span>
        </div>
        ${skBlock('100%', 180)}
      </div>
      <div class="card" id="recent-card">
        <div class="flex items-center justify-between mb-16">
          <span class="font-display text-20">${t('overview.recent')}</span>
        </div>
        ${[0, 1, 2, 3, 4].map(() => `
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
            ${skLine('18%', 14)} ${skLine('30%', 14)} ${skLine('12%', 14)} ${skLine('10%', 14)}
          </div>`).join('')}
      </div>
    </div>`;

  // Load stats + chart (volume_7d comes from stats)
  mockAPI('/api/stats').then(stats => {
    const strip = document.getElementById('kpi-strip');
    if (!strip) return;
    const deltaClass = d => d > 0 ? 'positive' : d < 0 ? 'negative' : 'neutral';
    const deltaIcon = d => d > 0 ? '▲' : d < 0 ? '▼' : '—';
    const respTime = stats.avg_response_time_s != null
      ? stats.avg_response_time_s.toFixed(1) + 's' : '—';
    strip.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.conversations')}</div>
        <div class="kpi-value tabular">${stats.conversations_today}</div>
        <div class="kpi-delta ${deltaClass(stats.conversations_delta_pct)}">
          ${deltaIcon(stats.conversations_delta_pct)} ${Math.abs(stats.conversations_delta_pct).toFixed(1)}%
          <span class="text-tertiary text-11" style="font-weight:400"> ${t('kpi.vs_yesterday')}</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.response_time')}</div>
        <div class="kpi-value tabular">${respTime}</div>
        <div class="kpi-sub">${t('kpi.via_ai')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.handoffs')}</div>
        <div class="kpi-value tabular">${stats.human_handoffs_today}</div>
        <div class="kpi-sub">${t('kpi.takeovers')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.leads')}</div>
        <div class="kpi-value tabular">${stats.leads_today}</div>
        <div class="kpi-sub">${t('kpi.qualified')}</div>
      </div>`;

    // Chart from real volume_7d
    const chartCard = document.getElementById('chart-card');
    if (chartCard) {
      if (stats.volume_7d && stats.volume_7d.length) {
        chartCard.innerHTML = `
          <div class="flex items-center justify-between mb-16">
            <span class="font-display text-20">${t('overview.chart')}</span>
          </div>
          <div class="chart-wrap">${buildChart(volume7dToChartData(stats.volume_7d))}</div>`;
      } else {
        chartCard.innerHTML = `
          <div class="flex items-center justify-between mb-16">
            <span class="font-display text-20">${t('overview.chart')}</span>
          </div>
          <div style="height:180px;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary);font-size:13px">
            ${t('empty.conversations')}
          </div>`;
      }
    }
  }).catch(() => {
    const strip = document.getElementById('kpi-strip');
    if (strip) strip.innerHTML = errorBanner();
  });

  // Load recent conversations
  mockAPI('/api/conversations').then(convs => {
    const recentCard = document.getElementById('recent-card');
    if (!recentCard) return;
    if (!convs.length) {
      recentCard.innerHTML = `
        <div class="flex items-center justify-between mb-16">
          <span class="font-display text-20">${t('overview.recent')}</span>
        </div>
        ${emptyState('chat', t('empty.conversations'))}`;
      return;
    }
    const rows = convs.slice(0, 10).map(c => `
      <tr>
        <td><strong>${escapeHtml(c.customer_name || c.customer_phone)}</strong><br><span style="font-size:12px;color:var(--text-tertiary)">${escapeHtml(c.customer_phone)}</span></td>
        <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:13px">${escapeHtml(c.last_message || '')}</td>
        <td>${pill(c.status)}</td>
        <td style="font-size:13px;color:var(--text-tertiary)">${escapeHtml(relTime(c.last_message_time))}</td>
        <td><button class="btn btn-ghost" style="padding:5px 14px;font-size:13px" onclick="navigate('#/conversas')">${t('btn.open')}</button></td>
      </tr>`).join('');
    recentCard.innerHTML = `
      <div class="flex items-center justify-between mb-16">
        <span class="font-display text-20">${t('overview.recent')}</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${t('table.client')}</th>
              <th>${t('table.last_message')}</th>
              <th>${t('table.status')}</th>
              <th>${t('table.time')}</th>
              <th>${t('table.action')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).catch(() => {
    const recentCard = document.getElementById('recent-card');
    if (recentCard) {
      recentCard.innerHTML = `
        <div class="flex items-center justify-between mb-16">
          <span class="font-display text-20">${t('overview.recent')}</span>
        </div>
        ${errorBanner()}`;
      const retryBtn = recentCard.querySelector('#retry-btn');
      if (retryBtn) retryBtn.onclick = renderOverview;
    }
  });
}

/* ── SVG CHART ───────────────────────────────────────────── */
function buildChart(data) {
  const W = 800, H = 180, pad = { top: 16, right: 20, bottom: 32, left: 36 };
  const maxVal = Math.max(...data.map(d => d.val)) * 1.15;
  const xStep = (W - pad.left - pad.right) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + (H - pad.top - pad.bottom) * (1 - d.val / maxVal);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // area fill path
  const areaD = pathD
    + ` L ${points[points.length - 1].x.toFixed(1)} ${(H - pad.bottom).toFixed(1)}`
    + ` L ${points[0].x.toFixed(1)} ${(H - pad.bottom).toFixed(1)} Z`;

  const labels = points.map(p => `
    <text x="${p.x.toFixed(1)}" y="${H - 6}" class="chart-label" text-anchor="middle">${p.day}</text>
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" class="chart-label" text-anchor="middle">${p.val}</text>
  `).join('');

  const dots = points.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--gold)" stroke="var(--bg-card)" stroke-width="2"/>`).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="${pad.left}" y1="${H - pad.bottom}" x2="${W - pad.right}" y2="${H - pad.bottom}"
            stroke="var(--border-dark)" stroke-width="1"/>
      <path d="${areaD}" fill="url(#chartGrad)"/>
      <path d="${pathD}" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
      ${labels}
    </svg>`;
}

/* ── EMPTY STATE SVG ──────────────────────────────────────── */
function emptyState(type, text, ctaLabel, ctaAction) {
  const icons = {
    chat: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="40" height="30" rx="8" fill="var(--gold-light)" stroke="var(--border-dark)" stroke-width="1.5"/>
      <rect x="16" y="22" width="24" height="3" rx="1.5" fill="var(--border-dark)"/>
      <rect x="16" y="29" width="16" height="3" rx="1.5" fill="var(--border-dark)"/>
      <path d="M10 44 L18 52 V44" fill="var(--gold-light)" stroke="var(--border-dark)" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`,
    grid: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="20" height="20" rx="5" fill="var(--gold-light)" stroke="var(--border-dark)" stroke-width="1.5"/>
      <rect x="36" y="8" width="20" height="20" rx="5" fill="var(--gold-light)" stroke="var(--border-dark)" stroke-width="1.5"/>
      <rect x="8" y="36" width="20" height="20" rx="5" fill="var(--gold-light)" stroke="var(--border-dark)" stroke-width="1.5"/>
      <rect x="36" y="36" width="20" height="20" rx="5" fill="var(--border)" stroke="var(--border-dark)" stroke-width="1.5" stroke-dasharray="3 2"/>
    </svg>`,
    settings: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="10" stroke="var(--border-dark)" stroke-width="1.5" fill="var(--gold-light)"/>
      <path d="M32 10 v6 M32 48 v6 M10 32 h6 M48 32 h6 M16.6 16.6 l4.2 4.2 M43.2 43.2 l4.2 4.2 M47.4 16.6 l-4.2 4.2 M20.8 43.2 l-4.2 4.2"
            stroke="var(--border-dark)" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  };
  const cta = (ctaLabel && ctaAction)
    ? `<button class="btn btn-outline" style="margin-top:4px" onclick="${ctaAction}">${ctaLabel}</button>`
    : '';
  return `
    <div class="empty-state">
      ${icons[type] || icons.chat}
      <p class="empty-state-text">${text}</p>
      ${cta}
    </div>`;
}

/* ── CONVERSATIONS PAGE ────────────────────────────────────── */
let selectedConvPhone = null;

function renderConversas() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-section" style="margin: -32px; height: calc(100vh - 60px);">
      <div class="conversations-layout">
        <div class="conv-list" id="conv-list">
          <div class="conv-list-header">${t('conversations.title')}</div>
          ${[0, 1, 2, 3, 4].map(() => `
            <div style="padding:14px 20px;border-bottom:1px solid var(--border)">
              ${skLine('55%', 14, 6)}${skLine('85%', 12, 4)}${skLine('70%', 12)}
            </div>`).join('')}
        </div>
        <div class="conv-detail" id="conv-detail">
          <div class="conv-detail-header" style="justify-content:center">
            <span style="color:var(--text-tertiary);font-size:14px">${t('empty.conv_select')}</span>
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center">
            ${emptyState('chat', t('empty.conv_select'))}
          </div>
        </div>
      </div>
    </div>`;

  mockAPI('/api/conversations').then(convs => {
    const listEl = document.getElementById('conv-list');
    if (!listEl) return;

    if (!convs.length) {
      listEl.innerHTML = `<div class="conv-list-header">${t('conversations.title')}</div>${emptyState('chat', t('empty.conversations'))}`;
      return;
    }

    listEl.innerHTML = `
      <div class="conv-list-header">${t('conversations.title')}</div>
      ${convs.map(c => `
        <div class="conv-item${selectedConvPhone === c.customer_phone ? ' active' : ''}" data-conv-phone="${escapeHtml(c.customer_phone)}">
          <div class="conv-item-header">
            <span class="conv-item-name">${escapeHtml(c.customer_name || c.customer_phone)}</span>
            <span class="conv-item-time">${escapeHtml(relTime(c.last_message_time))}</span>
          </div>
          <div style="margin-bottom:6px">${pill(c.status)}</div>
          <div class="conv-item-preview">${escapeHtml(c.last_message || '')}</div>
        </div>`).join('')}`;

    listEl.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedConvPhone = item.dataset.convPhone;
        listEl.querySelectorAll('.conv-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const conv = convs.find(c => c.customer_phone === selectedConvPhone);
        renderConvDetail(conv);
      });
    });

    // Auto-select first
    if (!selectedConvPhone && convs.length) {
      selectedConvPhone = convs[0].customer_phone;
      listEl.querySelector('.conv-item')?.classList.add('active');
      renderConvDetail(convs[0]);
    } else if (selectedConvPhone) {
      const conv = convs.find(c => c.customer_phone === selectedConvPhone);
      if (conv) renderConvDetail(conv);
    }
  }).catch(() => {
    const listEl = document.getElementById('conv-list');
    if (listEl) listEl.innerHTML = `<div class="conv-list-header">${t('conversations.title')}</div>${errorBanner()}`;
  });
}

async function renderConvDetail(conv) {
  const detail = document.getElementById('conv-detail');
  if (!detail) return;

  detail.innerHTML = `
    <div class="conv-detail-header">
      <div>
        <div class="conv-detail-name">${escapeHtml(conv.customer_name || conv.customer_phone)}</div>
        <div class="conv-detail-phone">${escapeHtml(conv.customer_phone)}</div>
      </div>
      <div id="conv-header-pill" style="margin-left:12px">${pill(conv.status)}</div>
      <div class="conv-detail-actions">
        <label class="toggle-wrap" title="${conv.ai_enabled ? t('status.ai_on') : t('status.ai_off')}">
          <span id="ai-toggle-label">${conv.ai_enabled ? t('status.ai_on') : t('status.ai_off')}</span>
          <div class="toggle">
            <input type="checkbox" id="ai-toggle" ${conv.ai_enabled ? 'checked' : ''}/>
            <span class="toggle-slider"></span>
          </div>
        </label>
      </div>
    </div>
    <div class="conv-messages" id="conv-messages">
      <div style="text-align:center;color:var(--text-tertiary);padding:24px;font-size:13px">Carregando…</div>
    </div>`;

  // Fetch messages from API
  try {
    const messages = await realAPI(`/api/conversations/${encodeURIComponent(conv.customer_phone)}/messages`);
    const msgEl = detail.querySelector('#conv-messages');
    if (msgEl) {
      if (!messages.length) {
        msgEl.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);padding:24px;font-size:13px">${t('empty.conversations')}</div>`;
      } else {
        msgEl.innerHTML = messages.map(m => {
          const cssRole = msgCssRole(m.role);
          return `
            <div class="msg-row ${escapeHtml(cssRole)}">
              <div class="msg-bubble ${escapeHtml(cssRole)}">${escapeHtml(m.message)}</div>
              <div class="msg-time">${escapeHtml(relTime(m.created_at))}</div>
            </div>`;
        }).join('');
        msgEl.scrollTop = msgEl.scrollHeight;
      }
    }
  } catch {
    const msgEl = detail.querySelector('#conv-messages');
    if (msgEl) msgEl.innerHTML = errorBanner();
  }

  // Toggle AI
  const toggle = detail.querySelector('#ai-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      conv.ai_enabled = enabled;
      conv.status = enabled ? 'active' : 'paused';

      const label = detail.querySelector('#ai-toggle-label');
      if (label) label.textContent = enabled ? t('status.ai_on') : t('status.ai_off');

      const headerPill = detail.querySelector('#conv-header-pill');
      if (headerPill) headerPill.innerHTML = pill(conv.status);

      const listItem = document.querySelector(`.conv-item[data-conv-phone="${CSS.escape(conv.customer_phone)}"]`);
      if (listItem) {
        const existingPill = listItem.querySelector('.pill');
        if (existingPill && existingPill.parentElement) {
          existingPill.parentElement.innerHTML = pill(conv.status);
        }
      }

      realAPI(`/api/conversations/${encodeURIComponent(conv.customer_phone)}/toggle-ai`, {
        method: 'PUT', body: { ai_enabled: enabled }
      });
    });
  }
}

/* ── CATALOG PAGE ─────────────────────────────────────────── */
let drawerMode = null;
let editingProductId = null;

function renderCatalogo() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-section">
      <div class="catalog-header">
        <h1 class="page-title-large font-display">${t('catalog.title')}</h1>
        <div class="catalog-header-actions">
          <div class="catalog-filters">
            <input type="text" class="form-input" id="filter-name" style="width:180px"
              placeholder="${t('catalog.filter_name')}" oninput="applyFilters()" autocomplete="off">
            <select class="form-select" id="filter-category" style="width:170px" onchange="applyFilters()">
              ${filterCategoryOptions()}
            </select>
            <input type="number" class="form-input" id="filter-price-min" style="width:105px"
              placeholder="Min R$" min="0" step="0.01" oninput="applyFilters()">
            <input type="number" class="form-input" id="filter-price-max" style="width:105px"
              placeholder="Max R$" min="0" step="0.01" oninput="applyFilters()">
          </div>
          <button class="btn btn-outline" id="add-product-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            ${t('catalog.add')}
          </button>
        </div>
      </div>
      <div class="card" id="catalog-table-wrap">
        ${[0, 1, 2, 3, 4].map(() => `
          <div style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--border)">
            ${skLine('4%', 14)} ${skLine('22%', 14)} ${skLine('14%', 14)}
            ${skLine('10%', 14)} ${skLine('8%', 14)} ${skLine('10%', 14)}
          </div>`).join('')}
      </div>
    </div>
    <!-- Drawer -->
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <div class="drawer" id="product-drawer">
      <div class="drawer-header">
        <h2 class="drawer-title" id="drawer-title">${t('catalog.add_title')}</h2>
        <button class="btn-icon" id="drawer-close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">
        <form id="product-form" autocomplete="off">
          <div class="form-group">
            <label class="form-label">${t('catalog.name')}<span class="required">*</span></label>
            <input type="text" class="form-input" id="f-name" required placeholder="Sofá Milano Couro"/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('catalog.category')}</label>
              <select class="form-select" id="f-category" onchange="onCategoryChange()">
                ${categoryOptions('')}
              </select>
              <input type="text" class="form-input" id="f-category-custom"
                     placeholder="${escapeHtml(t('catalog.custom_category_placeholder'))}"
                     style="margin-top:8px;display:none"/>
            </div>
            <div class="form-group">
              <label class="form-label">${t('catalog.price')} (R$)</label>
              <input type="number" class="form-input" id="f-price" placeholder="1990.00" min="0" step="0.01"/>
            </div>
          </div>
          <div class="form-group" style="max-width:160px">
            <label class="form-label">${t('catalog.stock')}</label>
            <input type="number" class="form-input" id="f-stock" placeholder="0" min="0"/>
          </div>
          <div class="form-group">
            <label class="form-label">${t('catalog.description')}</label>
            <textarea class="form-textarea" id="f-description" rows="4" placeholder="Descreva o produto..."></textarea>
            <div class="form-hint">${t('catalog.desc_hint')}</div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('catalog.specs')}</label>
            <textarea class="form-textarea" id="f-specs" rows="3" placeholder="Largura: 220cm | Altura: 82cm"></textarea>
          </div>
        </form>
      </div>
      <div class="drawer-footer">
        <button class="btn btn-ghost" id="drawer-cancel">${t('catalog.cancel')}</button>
        <button class="btn btn-primary" id="drawer-save">${t('catalog.save')}</button>
      </div>
    </div>`;

  loadCatalogData();
  wireDrawer();
}

function loadCatalogData() {
  mockAPI('/api/products').then(products => {
    _products = products;
    renderProductTable(products);
  }).catch(() => {
    const wrap = document.getElementById('catalog-table-wrap');
    if (wrap) {
      wrap.innerHTML = errorBanner();
      wrap.querySelector('#retry-btn')?.addEventListener('click', () => loadCatalogData());
    }
  });
}

function renderProductTable(products, isFiltered = false) {
  const wrap = document.getElementById('catalog-table-wrap');
  if (!wrap) return;

  if (!products.length) {
    if (isFiltered) {
      wrap.innerHTML = `<div class="empty-state"><p style="color:var(--text-secondary);font-size:14px">${t('catalog.no_results')}</p></div>`;
    } else {
      wrap.innerHTML = emptyState('grid', t('empty.catalog'), t('catalog.add'), 'openDrawer()');
    }
    return;
  }

  const rows = products.map(p => `
    <tr ondblclick="openEditDrawer(${escapeHtml(p.id)})" style="cursor:pointer" title="${t('btn.edit')}">
      <td class="text-tertiary text-13 tabular">${escapeHtml(p.id)}</td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td class="text-secondary text-13">${escapeHtml(tCat(p.category)) || '—'}</td>
      <td class="num-center tabular">${escapeHtml(formatPrice(p.price))}</td>
      <td class="num-center tabular">${escapeHtml(p.quantity)}</td>
      <td>${pill(p.active ? 'active' : 'inactive')}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon" title="${t('btn.edit')}" onclick="event.stopPropagation();openEditDrawer(${escapeHtml(p.id)})">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M10.5 2l2.5 2.5-8 8H2.5V10l8-8z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-icon danger" title="${t('btn.delete')}" onclick="event.stopPropagation();deleteProduct(${escapeHtml(p.id)})">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 4h11M5 4V2.5h5V4M6 7v4M9 7v4M3 4l.8 8.5h7.4L12 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  wrap.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width:40px">${t('catalog.col_num')}</th>
            <th>${t('catalog.col_name')}</th>
            <th>${t('catalog.col_cat')}</th>
            <th class="num-center">${t('catalog.col_price')}</th>
            <th class="num-center">${t('catalog.col_stock')}</th>
            <th>${t('catalog.col_status')}</th>
            <th style="width:80px"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function applyFilters() {
  const name = (document.getElementById('filter-name')?.value || '').toLowerCase().trim();
  const cat  = document.getElementById('filter-category')?.value || '';
  const min  = parseFloat(document.getElementById('filter-price-min')?.value);
  const max  = parseFloat(document.getElementById('filter-price-max')?.value);

  const filtered = _products.filter(p => {
    if (name && !p.name.toLowerCase().includes(name)) return false;
    if (cat  && p.category !== cat) return false;
    if (!isNaN(min) && (p.price || 0) < min) return false;
    if (!isNaN(max) && (p.price || 0) > max) return false;
    return true;
  });

  const anyActive = !!(name || cat || !isNaN(min) || !isNaN(max));
  renderProductTable(filtered, anyActive);
}

function wireDrawer() {
  const backdrop = document.getElementById('drawer-backdrop');
  const addBtn = document.getElementById('add-product-btn');
  const closeBtn = document.getElementById('drawer-close');
  const cancelBtn = document.getElementById('drawer-cancel');
  const saveBtn = document.getElementById('drawer-save');

  addBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  cancelBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  saveBtn?.addEventListener('click', async () => {
    const name = document.getElementById('f-name')?.value.trim();
    if (!name) { document.getElementById('f-name')?.focus(); return; }

    const payload = {
      name,
      category: (() => { const s = document.getElementById('f-category')?.value || ''; return s === '__custom__' ? (document.getElementById('f-category-custom')?.value.trim() || '') : s; })(),
      price: parseFloat(document.getElementById('f-price')?.value) || 0,
      quantity: parseInt(document.getElementById('f-stock')?.value) || 0,
      description: document.getElementById('f-description')?.value.trim() || '',
      specs: document.getElementById('f-specs')?.value.trim() || '',
    };

    saveBtn.disabled = true;
    saveBtn.textContent = '…';

    try {
      if (drawerMode === 'edit' && editingProductId) {
        await mockAPI(`/api/products/${editingProductId}`, { method: 'PUT', body: { ...payload, active: true } });
      } else {
        await mockAPI('/api/products', { method: 'POST', body: payload });
      }
      closeDrawer();
      loadCatalogData();
    } catch (e) {
      saveBtn.disabled = false;
      saveBtn.textContent = t('catalog.save');
    }
  });
}

function openDrawer() {
  drawerMode = 'add';
  editingProductId = null;
  const title = document.getElementById('drawer-title');
  if (title) title.textContent = t('catalog.add_title');
  document.getElementById('product-form')?.reset();
  document.getElementById('drawer-backdrop')?.classList.add('open');
  document.getElementById('product-drawer')?.classList.add('open');
  setTimeout(() => document.getElementById('f-name')?.focus(), 250);
}

window.openDrawer = openDrawer;

window.openEditDrawer = function (id) {
  const product = _products.find(p => p.id === id);
  if (!product) return;
  drawerMode = 'edit';
  editingProductId = id;
  const title = document.getElementById('drawer-title');
  if (title) title.textContent = t('catalog.edit_title');
  document.getElementById('f-name').value = product.name || '';
  const _knownCat = DEFAULT_CATEGORIES.find(c => c.pt === product.category);
  const _customInp = document.getElementById('f-category-custom');
  if (!_knownCat && product.category) {
    document.getElementById('f-category').value = '__custom__';
    if (_customInp) { _customInp.value = product.category; _customInp.style.display = 'block'; }
  } else {
    document.getElementById('f-category').value = product.category || '';
    if (_customInp) { _customInp.value = ''; _customInp.style.display = 'none'; }
  }
  document.getElementById('f-price').value = product.price || '';
  document.getElementById('f-stock').value = product.quantity || '';
  document.getElementById('f-description').value = product.description || '';
  document.getElementById('f-specs').value = product.specs || '';
  document.getElementById('drawer-backdrop')?.classList.add('open');
  document.getElementById('product-drawer')?.classList.add('open');
};

window.deleteProduct = function (id) {
  if (!confirm('Excluir este produto?')) return;
  mockAPI(`/api/products/${id}`, { method: 'DELETE' }).then(() => loadCatalogData());
};

function closeDrawer() {
  document.getElementById('drawer-backdrop')?.classList.remove('open');
  document.getElementById('product-drawer')?.classList.remove('open');
  const saveBtn = document.getElementById('drawer-save');
  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = t('catalog.save'); }
}

/* ── CONFIG PAGE ──────────────────────────────────────────── */

function _configCard(title, bodyHtml, footerHtml = '') {
  return `
    <div class="card mb-24">
      <div class="config-section-header">
        <h2 class="config-section-title">${escapeHtml(title)}</h2>
        <hr class="config-section-divider">
      </div>
      ${bodyHtml}
      ${footerHtml ? `<div class="config-section-footer">${footerHtml}</div>` : ''}
    </div>`;
}

function renderConfigAccount(profile) {
  const body = `
    <div class="config-field-row">
      <div>
        <div class="config-field-label">${t('config.biz_name')}</div>
        <div class="config-field-hint">${t('config.biz_name_hint')}</div>
      </div>
      <input class="form-input" id="cfg-biz-name" type="text" value="${escapeHtml(profile.business_name || '')}">
    </div>
    <div class="config-field-row">
      <div>
        <div class="config-field-label">${t('config.phone')}</div>
        <div class="config-field-hint">${t('config.phone_hint')}</div>
      </div>
      <input class="form-input" value="${escapeHtml(profile.business_phone || '')}" readonly
             style="background:var(--bg-canvas);cursor:default;color:var(--text-secondary)">
    </div>
    <div class="config-field-row">
      <div class="config-field-label">${t('config.email')}</div>
      <input class="form-input" id="cfg-email" type="email" value="${escapeHtml(profile.email || '')}">
    </div>`;
  const footer = `<button class="btn-primary" id="cfg-account-save">${t('config.save')}</button>`;
  return _configCard(t('config.account'), body, footer);
}

function renderConfigTheme() {
  const currentTheme = localStorage.getItem('agente_theme') || 'default';
  const body = `
    <div class="config-field-row">
      <div>
        <div class="config-field-label">${t('config.theme')}</div>
      </div>
      <select class="form-select" id="cfg-theme" style="width:200px">
        <option value="default" ${currentTheme === 'default' ? 'selected' : ''}>${t('config.theme_default')}</option>
        <option value="soft-black" ${currentTheme === 'soft-black' ? 'selected' : ''}>${t('config.theme_soft_black')}</option>
        <option value="light-brown" ${currentTheme === 'light-brown' ? 'selected' : ''}>${t('config.theme_light_brown')}</option>
      </select>
    </div>`;
  return _configCard(t('config.theme'), body);
}

function renderConfigDanger() {
  const body = `
    <p class="danger-zone-warn">${t('config.delete_warn')}</p>
    <div id="cfg-delete-area">
      <button class="btn-delete" id="cfg-delete-btn">${t('config.delete_acct')}</button>
    </div>`;
  return _configCard(t('config.danger'), body);
}

function wireConfigAccount(profile) {
  // Account save
  const saveBtn = document.getElementById('cfg-account-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = t('config.saving');
      try {
        const updated = await realAPI('/api/profile', {
          method: 'PUT',
          body: {
            business_name: document.getElementById('cfg-biz-name')?.value || null,
            email: document.getElementById('cfg-email')?.value || null,
          },
        });
        applyUserInfo(updated);
        showToast(t('config.saved'));
      } catch (err) {
        const msg = err.message || '';
        showToast(msg.includes('409') || msg.includes('already') ? (currentLang === 'pt' ? 'E-mail já em uso' : 'Email already in use') : t('config.save_error'), 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = t('config.save');
      }
    });
  }

  // Delete account — two-step confirmation
  const deleteBtn = document.getElementById('cfg-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const area = document.getElementById('cfg-delete-area');
      if (!area) return;
      area.innerHTML = `
        <div class="danger-zone-confirm">
          <button class="btn-delete" id="cfg-delete-confirm">${t('config.delete_confirm')}</button>
          <button class="btn-ghost" id="cfg-delete-cancel">${t('config.delete_cancel')}</button>
        </div>`;
      document.getElementById('cfg-delete-cancel')?.addEventListener('click', () => {
        area.innerHTML = `<button class="btn-delete" id="cfg-delete-btn">${t('config.delete_acct')}</button>`;
        wireConfigAccount(profile);
      });
      document.getElementById('cfg-delete-confirm')?.addEventListener('click', async () => {
        const confirmBtn = document.getElementById('cfg-delete-confirm');
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = t('config.saving'); }
        try {
          await realAPI('/api/account', { method: 'DELETE' });
          localStorage.removeItem('agente_token');
          window.location.href = '/login';
        } catch {
          showToast(t('config.save_error'), 'error');
          area.innerHTML = `<button class="btn-delete" id="cfg-delete-btn">${t('config.delete_acct')}</button>`;
          wireConfigAccount(profile);
        }
      });
    });
  }
}

function wireConfigTheme() {
  const select = document.getElementById('cfg-theme');
  if (select) {
    select.addEventListener('change', (e) => {
      const theme = e.target.value;
      localStorage.setItem('agente_theme', theme);
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  }
}

function renderConfigGeneral() {
  const main = document.getElementById('main');
  const skeleton = `
    <div class="card mb-24">
      ${skLine('35%', 16, 12)}${skLine('100%', 1, 20)}
      ${skLine('45%', 13, 10)}${skLine('65%', 36, 14)}
      ${skLine('45%', 13, 10)}${skLine('65%', 36, 14)}
    </div>`;

  main.innerHTML = `
    <div class="page-section">
      <div class="page-header">
        <h1 class="page-title-large font-display">${t('nav.config_general')}</h1>
      </div>
      <div id="config-content">${skeleton}</div>
    </div>`;

  realAPI('/api/profile')
    .then(profile => {
      document.getElementById('config-content').innerHTML =
        renderConfigAccount(profile) + renderConfigDanger();
      wireConfigAccount(profile);
    })
    .catch(() => {
      const el = document.getElementById('config-content');
      if (el) el.innerHTML = errorBanner();
    });
}

function renderConfigThemeSection() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-section">
      <div class="page-header">
        <h1 class="page-title-large font-display">${t('nav.config_theme')}</h1>
      </div>
      <div id="config-content">
        ${renderConfigTheme()}
      </div>
    </div>`;
  wireConfigTheme();
}

function renderConfig() {
  history.replaceState(null, '', '#/config/general');
  router();
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Auth guard
  if (!localStorage.getItem('agente_token')) {
    window.location.href = '/login';
    return;
  }

  // Translate static elements (sidebar, footer) on initial load
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  updateLangButtons();
  router();

  // Fetch real user info and populate sidebar/topbar
  realAPI('/api/profile').then(applyUserInfo).catch(() => { });

  // Hash routing
  window.addEventListener('hashchange', router);

  // Close mobile sidebar on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

  // Topbar avatar dropdown
  const avatarBtn = document.getElementById('topbar-avatar');
  const dropdown = document.getElementById('avatar-dropdown');
  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown?.classList.remove('open'));

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('agente_token');
    window.location.href = '/login';
  });
});
