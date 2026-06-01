/* ============================================================
   Agente Dashboard — JS
   i18n · Mock API · Router · Renderers
   ============================================================ */

'use strict';

/* ── i18n ─────────────────────────────────────────────────── */
const i18n = {
  pt: {
    'nav.overview':      'Visão Geral',
    'nav.conversations': 'Conversas',
    'nav.catalog':       'Catálogo',
    'nav.settings':      'Configurações',
    'kpi.conversations': 'Conversas hoje',
    'kpi.response_time': 'Tempo de resposta',
    'kpi.handoffs':      'Atendimentos humanos',
    'kpi.leads':         'Leads capturados',
    'kpi.via_ai':        'via IA',
    'kpi.takeovers':     'takeovers hoje',
    'kpi.qualified':     'mensagens qualificadas',
    'kpi.vs_yesterday':  'vs. ontem',
    'table.client':      'Cliente',
    'table.last_message':'Última mensagem',
    'table.status':      'Status',
    'table.time':        'Horário',
    'table.action':      'Ação',
    'catalog.add':       'Adicionar produto',
    'catalog.edit_title':'Editar produto',
    'catalog.add_title': 'Novo produto',
    'catalog.name':      'Nome',
    'catalog.category':  'Categoria',
    'catalog.price':     'Preço',
    'catalog.stock':     'Estoque',
    'catalog.description':'Descrição',
    'catalog.specs':     'Especificações',
    'catalog.save':      'Salvar produto',
    'catalog.cancel':    'Cancelar',
    'catalog.col_num':   '#',
    'catalog.col_name':  'Nome',
    'catalog.col_cat':   'Categoria',
    'catalog.col_price': 'Preço',
    'catalog.col_stock': 'Estoque',
    'catalog.col_status':'Status',
    'catalog.col_actions':'Ações',
    'catalog.desc_hint': 'Escreva descrições detalhadas para melhorar a busca por IA',
    'status.active':     'Ativo',
    'status.paused':     'Pausado',
    'status.inactive':   'Inativo',
    'status.ai_on':      'IA ativada',
    'status.ai_off':     'IA pausada',
    'empty.conversations':'Nenhuma conversa ainda.',
    'empty.catalog':     'Catálogo vazio. Adicione seu primeiro produto.',
    'empty.conv_select': 'Selecione uma conversa para visualizar',
    'error.generic':     'Erro ao carregar dados.',
    'btn.retry':         'Tentar novamente',
    'btn.open':          'Abrir',
    'btn.logout':        'Sair',
    'btn.edit':          'Editar',
    'btn.delete':        'Excluir',
    'login.title':       'Agente',
    'login.subtitle':    'Gerencie seu assistente no WhatsApp',
    'login.email':       'E-mail',
    'login.password':    'Senha',
    'login.btn':         'Entrar',
    'overview.title':    'Visão Geral',
    'overview.recent':   'Conversas recentes',
    'overview.chart':    'Volume de conversas — últimos 7 dias',
    'conversations.title':'Conversas',
    'catalog.title':     'Catálogo',
    'settings.title':       'Configurações',
    'settings.soon':        'Em breve',
    'settings.soon_sub':    'Personalizações de horário, tom de voz e integrações estarão aqui.',
    'config.profile':       'Perfil do Negócio',
    'config.biz_name':      'Nome do Negócio',
    'config.email':         'E-mail de Contato',
    'config.phone':         'Telefone (WhatsApp)',
    'config.agent':         'Configurações do Agente IA',
    'config.system_prompt': 'Prompt / Tom de Voz',
    'config.prompt_hint':   'Descreva como o agente deve se comportar. Máx. 2000 caracteres.',
    'config.ai_language':   'Idioma do Agente',
    'config.lang_auto':     'Detectar automaticamente',
    'config.lang_pt':       'Português',
    'config.lang_en':       'English',
    'config.hours':         'Horário de Atendimento',
    'config.hours_open':    'Abertura',
    'config.hours_close':   'Fechamento',
    'config.day.mon':       'Seg',
    'config.day.tue':       'Ter',
    'config.day.wed':       'Qua',
    'config.day.thu':       'Qui',
    'config.day.fri':       'Sex',
    'config.day.sat':       'Sáb',
    'config.day.sun':       'Dom',
    'config.integration':   'Integração',
    'config.webhook_url':   'URL do Webhook (n8n)',
    'config.copy':          'Copiar',
    'config.copied':        'Copiado!',
    'config.save':          'Salvar',
    'config.saving':        'Salvando…',
    'config.saved':         'Salvo com sucesso',
    'config.save_error':    'Erro ao salvar',
    'topbar.user':       'Móveis Viana',
    'topbar.role':       'Administrador',
    'select_conv':       'Selecione uma conversa',
  },
  en: {
    'nav.overview':      'Overview',
    'nav.conversations': 'Conversations',
    'nav.catalog':       'Catalog',
    'nav.settings':      'Settings',
    'kpi.conversations': 'Conversations today',
    'kpi.response_time': 'Response time',
    'kpi.handoffs':      'Human handoffs',
    'kpi.leads':         'Leads captured',
    'kpi.via_ai':        'via AI',
    'kpi.takeovers':     'takeovers today',
    'kpi.qualified':     'qualified messages',
    'kpi.vs_yesterday':  'vs. yesterday',
    'table.client':      'Client',
    'table.last_message':'Last message',
    'table.status':      'Status',
    'table.time':        'Time',
    'table.action':      'Action',
    'catalog.add':       'Add product',
    'catalog.edit_title':'Edit product',
    'catalog.add_title': 'New product',
    'catalog.name':      'Name',
    'catalog.category':  'Category',
    'catalog.price':     'Price',
    'catalog.stock':     'Stock',
    'catalog.description':'Description',
    'catalog.specs':     'Specifications',
    'catalog.save':      'Save product',
    'catalog.cancel':    'Cancel',
    'catalog.col_num':   '#',
    'catalog.col_name':  'Name',
    'catalog.col_cat':   'Category',
    'catalog.col_price': 'Price',
    'catalog.col_stock': 'Stock',
    'catalog.col_status':'Status',
    'catalog.col_actions':'Actions',
    'catalog.desc_hint': 'Write detailed descriptions to improve AI search',
    'status.active':     'Active',
    'status.paused':     'Paused',
    'status.inactive':   'Inactive',
    'status.ai_on':      'AI active',
    'status.ai_off':     'AI paused',
    'empty.conversations':'No conversations yet.',
    'empty.catalog':     'Catalog is empty. Add your first product.',
    'empty.conv_select': 'Select a conversation to view',
    'error.generic':     'Error loading data.',
    'btn.retry':         'Retry',
    'btn.open':          'Open',
    'btn.logout':        'Logout',
    'btn.edit':          'Edit',
    'btn.delete':        'Delete',
    'login.title':       'Agente',
    'login.subtitle':    'Manage your WhatsApp AI assistant',
    'login.email':       'Email',
    'login.password':    'Password',
    'login.btn':         'Sign in',
    'overview.title':    'Overview',
    'overview.recent':   'Recent conversations',
    'overview.chart':    'Conversation volume — last 7 days',
    'conversations.title':'Conversations',
    'catalog.title':     'Catalog',
    'settings.title':       'Settings',
    'settings.soon':        'Coming soon',
    'settings.soon_sub':    'Business hours, tone, and integrations will be configured here.',
    'config.profile':       'Business Profile',
    'config.biz_name':      'Business Name',
    'config.email':         'Contact Email',
    'config.phone':         'Phone (WhatsApp)',
    'config.agent':         'AI Agent Settings',
    'config.system_prompt': 'System Prompt / Tone',
    'config.prompt_hint':   'Describe how the agent should behave. Max 2000 characters.',
    'config.ai_language':   'Agent Language',
    'config.lang_auto':     'Auto-detect',
    'config.lang_pt':       'Português',
    'config.lang_en':       'English',
    'config.hours':         'Business Hours',
    'config.hours_open':    'Open',
    'config.hours_close':   'Close',
    'config.day.mon':       'Mon',
    'config.day.tue':       'Tue',
    'config.day.wed':       'Wed',
    'config.day.thu':       'Thu',
    'config.day.fri':       'Fri',
    'config.day.sat':       'Sat',
    'config.day.sun':       'Sun',
    'config.integration':   'Integration',
    'config.webhook_url':   'Webhook URL (n8n)',
    'config.copy':          'Copy',
    'config.copied':        'Copied!',
    'config.save':          'Save',
    'config.saving':        'Saving…',
    'config.saved':         'Saved successfully',
    'config.save_error':    'Error saving',
    'topbar.user':       'Viana Furniture',
    'topbar.role':       'Administrator',
    'select_conv':       'Select a conversation',
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
  { pt: 'Sofás e Poltronas',      en: 'Sofas & Armchairs'       },
  { pt: 'Salas de Jantar',        en: 'Dining Room'             },
  { pt: 'Quartos',                en: 'Bedroom'                 },
  { pt: 'Salas de Estar',         en: 'Living Room'             },
  { pt: 'Escritório',             en: 'Office'                  },
  { pt: 'Área Externa',           en: 'Outdoor'                 },
  { pt: 'Colchões',               en: 'Mattresses'              },
  { pt: 'Acessórios e Decoração', en: 'Accessories & Decor'     },
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
  const opts = DEFAULT_CATEGORIES.map(c => {
    const label = currentLang === 'en' ? c.en : c.pt;
    const isSelected = selected === c.pt ? ' selected' : '';
    return `<option value="${escapeHtml(c.pt)}"${isSelected}>${escapeHtml(label)}</option>`;
  }).join('');
  const blankSelected = selected ? '' : ' selected';
  return `<option value=""${blankSelected} disabled>${escapeHtml(placeholder)}</option>${opts}`;
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

/* ── MOCK DATA ───────────────────────────────────────────── */
const MOCK_STATS = {
  conversations: 47,
  conversations_delta: +12.3,
  response_time: '4.2s',
  handoffs: 3,
  leads: 14,
};

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    phone: '(47) 99142-3381',
    name: 'Carlos Mendonça',
    last_message: 'Vocês têm sofá de couro na cor caramelo? Preciso de algo que combine com o meu piso claro.',
    status: 'active',
    ai_enabled: true,
    time: '2min',
    messages: [
      { role: 'customer', content: 'Boa tarde! Estou procurando um sofá de couro.', time: '14:32' },
      { role: 'ai', content: 'Olá, Carlos! Boa tarde. Temos uma ótima seleção de sofás de couro. O que você tem em mente — tamanho, cor ou estilo?', time: '14:32' },
      { role: 'customer', content: 'Preciso de algo cor caramelo que combine com piso claro.', time: '14:33' },
      { role: 'ai', content: 'Perfeito! Temos o Sofá Milano em couro caramelo, 3 lugares, por R$3.890. Também temos o Sofá Nobre em caramelo claro, 2+3, por R$5.490. Qual o tamanho do ambiente?', time: '14:33' },
      { role: 'customer', content: 'Vocês têm sofá de couro na cor caramelo? Preciso de algo que combine com o meu piso claro.', time: '14:41' },
    ]
  },
  {
    id: 2,
    phone: '(48) 98834-5512',
    name: 'Ana Beatriz Leal',
    last_message: 'Qual o prazo de entrega para Florianópolis?',
    status: 'active',
    ai_enabled: true,
    time: '18min',
    messages: [
      { role: 'customer', content: 'Olá, vocês entregam em Floripa?', time: '14:05' },
      { role: 'ai', content: 'Olá, Ana! Sim, entregamos para Florianópolis e região. O prazo é de 7 a 12 dias úteis.', time: '14:05' },
      { role: 'customer', content: 'Qual o prazo de entrega para Florianópolis?', time: '14:22' },
    ]
  },
  {
    id: 3,
    phone: '(47) 99887-0023',
    name: 'Roberto Dias',
    last_message: 'Ok, vou pensar e retorno em breve.',
    status: 'paused',
    ai_enabled: false,
    time: '1h',
    messages: [
      { role: 'customer', content: 'Bom dia, queria ver as mesas de jantar.', time: '13:10' },
      { role: 'ai', content: 'Bom dia, Roberto! Temos diversas opções de mesas de jantar — em madeira maciça, MDF e vidro. Quantas pessoas precisam sentar?', time: '13:10' },
      { role: 'customer', content: 'Para 6 pessoas. Quanto custa a de madeira maciça?', time: '13:12' },
      { role: 'ai', content: 'A Mesa Rio em madeira maciça de cedro, 6 lugares, está por R$2.890. Inclui 6 cadeiras estofadas. Quer ver as fotos?', time: '13:13' },
      { role: 'customer', content: 'Ok, vou pensar e retorno em breve.', time: '13:40' },
    ]
  },
  {
    id: 4,
    phone: '(47) 98765-4321',
    name: 'Fernanda Rocha',
    last_message: 'Tem algum guarda-roupa com espelho embutido?',
    status: 'active',
    ai_enabled: true,
    time: '2h',
    messages: [
      { role: 'customer', content: 'Tem algum guarda-roupa com espelho embutido?', time: '12:30' },
      { role: 'ai', content: 'Olá, Fernanda! Sim! Temos o Guarda-roupa Veneza com espelho de corpo inteiro embutido na porta central, 6 portas, por R$3.200. Está disponível em branco e nogueira.', time: '12:30' },
    ]
  },
  {
    id: 5,
    phone: '(47) 91234-5678',
    name: 'Márcio Ferreira',
    last_message: 'Não preciso mais, obrigado.',
    status: 'paused',
    ai_enabled: false,
    time: 'ontem',
    messages: [
      { role: 'customer', content: 'Boa noite, tem rack para TV de 65 polegadas?', time: '19:15' },
      { role: 'ai', content: 'Boa noite, Márcio! Temos o Rack Moderno com suporte até 80", em MDF lacado branco, por R$890.', time: '19:15' },
      { role: 'customer', content: 'Não preciso mais, obrigado.', time: '19:22' },
    ]
  },
];

let mockProducts = [
  { id: 1, name: 'Sofá Milano Couro', category: 'Sofás', price: 3890.00, stock: 4, active: true, description: 'Sofá de couro genuíno italiano, 3 lugares, assento em espuma D-28. Disponível em caramelo, preto e marrom.', specs: 'Largura: 220cm | Profundidade: 95cm | Altura: 82cm | Peso: 68kg' },
  { id: 2, name: 'Mesa Rio Madeira Maciça', category: 'Mesas', price: 2890.00, stock: 6, active: true, description: 'Mesa de jantar em cedro maciço, acabamento natural. Acompanha 6 cadeiras estofadas em tecido bege.', specs: 'Largura: 180cm | Profundidade: 90cm | Altura: 76cm | Capacidade: 6 lugares' },
  { id: 3, name: 'Guarda-roupa Veneza', category: 'Quartos', price: 3200.00, stock: 3, active: true, description: 'Guarda-roupa 6 portas com espelho de corpo inteiro embutido na porta central. Disponível em branco e nogueira.', specs: 'Largura: 240cm | Profundidade: 53cm | Altura: 210cm | Portas: 6 | Espelho: Sim' },
  { id: 4, name: 'Rack Moderno 80"', category: 'Sala', price: 890.00, stock: 12, active: true, description: 'Rack para TV até 80 polegadas em MDF lacado branco. Painel ripado para passagem de cabos.', specs: 'Largura: 200cm | Profundidade: 40cm | Altura: 48cm | Suporte TV: até 80"' },
  { id: 5, name: 'Cama Box Queen Premium', category: 'Quartos', price: 2400.00, stock: 0, active: false, description: 'Conjunto cama box queen size com colchão ortopédico. Base em madeira reforçada.', specs: 'Largura: 158cm | Comprimento: 198cm | Altura total: 66cm' },
  { id: 6, name: 'Estante Bibliothèque', category: 'Sala', price: 1290.00, stock: 2, active: true, description: 'Estante modular em MDF nogal com 5 prateleiras ajustáveis e 2 portas inferiores.', specs: 'Largura: 180cm | Profundidade: 35cm | Altura: 190cm | Prateleiras: 5' },
];

let nextProductId = 7;

const MOCK_CHART_DATA = [
  { day: 'Seg', val: 31 },
  { day: 'Ter', val: 38 },
  { day: 'Qua', val: 27 },
  { day: 'Qui', val: 44 },
  { day: 'Sex', val: 52 },
  { day: 'Sáb', val: 41 },
  { day: 'Dom', val: 47 },
];

/* ── MOCK API ─────────────────────────────────────────────── */
let _forceError = false;

function mockAPI(endpoint, opts = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (_forceError) { reject(new Error('Simulated error')); return; }

      if (endpoint === '/api/stats') {
        resolve({ ...MOCK_STATS });
      } else if (endpoint === '/api/conversations') {
        resolve([...MOCK_CONVERSATIONS]);
      } else if (endpoint.startsWith('/api/conversations/') && endpoint.endsWith('/toggle-ai')) {
        const phone = decodeURIComponent(endpoint.split('/')[3]);
        const conv = MOCK_CONVERSATIONS.find(c => c.phone === phone);
        if (conv) conv.ai_enabled = opts.body?.ai_enabled ?? !conv.ai_enabled;
        resolve({ ai_enabled: conv?.ai_enabled });
      } else if (endpoint === '/api/products') {
        if (opts.method === 'POST') {
          const p = { id: nextProductId++, ...opts.body, active: true };
          mockProducts.push(p);
          resolve(p);
        } else {
          resolve([...mockProducts]);
        }
      } else if (endpoint.startsWith('/api/products/')) {
        const id = parseInt(endpoint.split('/')[3]);
        if (opts.method === 'PUT') {
          const idx = mockProducts.findIndex(p => p.id === id);
          if (idx >= 0) { mockProducts[idx] = { ...mockProducts[idx], ...opts.body }; resolve(mockProducts[idx]); }
          else reject(new Error('Not found'));
        } else if (opts.method === 'DELETE') {
          mockProducts = mockProducts.filter(p => p.id !== id);
          resolve({ ok: true });
        }
      } else if (endpoint === '/api/profile') {
        if (opts.method === 'PUT') {
          resolve({ ...opts.body, email: 'demo@empresa.com.br', business_phone: '+55 47 99142-0000' });
        } else {
          resolve({ business_name: 'Móveis Viana', email: 'demo@empresa.com.br', business_phone: '+55 47 99142-0000' });
        }
      } else if (endpoint === '/api/settings') {
        if (opts.method === 'PUT') {
          resolve(opts.body);
        } else {
          resolve({
            system_prompt: 'Você é um assistente de vendas da Móveis Viana. Seja cordial e objetivo.',
            ai_language: 'auto',
            business_hours: {
              mon: { enabled: true,  open: '09:00', close: '18:00' },
              tue: { enabled: true,  open: '09:00', close: '18:00' },
              wed: { enabled: true,  open: '09:00', close: '18:00' },
              thu: { enabled: true,  open: '09:00', close: '18:00' },
              fri: { enabled: true,  open: '09:00', close: '18:00' },
              sat: { enabled: true,  open: '09:00', close: '13:00' },
              sun: { enabled: false, open: '09:00', close: '12:00' },
            },
          });
        }
      } else {
        resolve({});
      }
    }, 600);
  });
}

/*
// Real API calls (uncomment when backend is running):
const API_HEADERS = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
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
*/

/* ── ROUTER ───────────────────────────────────────────────── */
const ROUTES = {
  '#/overview':      renderOverview,
  '#/conversas':     renderConversas,
  '#/catalogo':      renderCatalogo,
  '#/config':        renderConfig,
};

function navigate(hash) {
  history.pushState(null, '', hash);
  router();
}

function router() {
  const hash = location.hash || '#/overview';
  const render = ROUTES[hash] || renderOverview;

  // Update sidebar active states
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === hash);
  });

  // Update topbar breadcrumb
  const pageNames = {
    '#/overview':  t('nav.overview'),
    '#/conversas': t('nav.conversations'),
    '#/catalogo':  t('nav.catalog'),
    '#/config':    t('nav.settings'),
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = pageNames[hash] || '';

  render();
}

/* ── RENDER ALL (i18n re-render) ─────────────────────────── */
function renderAll() {
  // Update static i18n text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
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
  if (status === 'active')   return `<span class="pill pill-active">${t('status.active')}</span>`;
  if (status === 'paused')   return `<span class="pill pill-paused">${t('status.paused')}</span>`;
  if (status === 'error')    return `<span class="pill pill-error">${t('status.paused')}</span>`;
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
        ${[0,1,2,3].map(() => `
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
        ${[0,1,2,3,4].map(() => `
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
            ${skLine('18%', 14)} ${skLine('30%', 14)} ${skLine('12%', 14)} ${skLine('10%', 14)}
          </div>`).join('')}
      </div>
    </div>`;

  // Load data
  mockAPI('/api/stats').then(stats => {
    const strip = document.getElementById('kpi-strip');
    if (!strip) return;
    const deltaClass = d => d > 0 ? 'positive' : d < 0 ? 'negative' : 'neutral';
    const deltaIcon  = d => d > 0 ? '▲' : d < 0 ? '▼' : '—';
    strip.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.conversations')}</div>
        <div class="kpi-value tabular">${stats.conversations}</div>
        <div class="kpi-delta ${deltaClass(stats.conversations_delta)}">
          ${deltaIcon(stats.conversations_delta)} ${Math.abs(stats.conversations_delta).toFixed(1)}%
          <span class="text-tertiary text-11" style="font-weight:400"> ${t('kpi.vs_yesterday')}</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.response_time')}</div>
        <div class="kpi-value tabular">${stats.response_time}</div>
        <div class="kpi-sub">${t('kpi.via_ai')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.handoffs')}</div>
        <div class="kpi-value tabular">${stats.handoffs}</div>
        <div class="kpi-sub">${t('kpi.takeovers')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('kpi.leads')}</div>
        <div class="kpi-value tabular">${stats.leads}</div>
        <div class="kpi-sub">${t('kpi.qualified')}</div>
      </div>`;
  }).catch(() => {
    const strip = document.getElementById('kpi-strip');
    if (strip) strip.innerHTML = errorBanner();
  });

  mockAPI('/api/conversations').then(convs => {
    // Render chart
    const chartCard = document.getElementById('chart-card');
    if (chartCard) {
      chartCard.innerHTML = `
        <div class="flex items-center justify-between mb-16">
          <span class="font-display text-20">${t('overview.chart')}</span>
        </div>
        <div class="chart-wrap">${buildChart(MOCK_CHART_DATA)}</div>`;
    }

    // Render recent convs table
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
        <td><strong>${escapeHtml(c.name)}</strong><br><span style="font-size:12px;color:var(--text-tertiary)">${escapeHtml(c.phone)}</span></td>
        <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:13px">${escapeHtml(c.last_message)}</td>
        <td>${pill(c.status)}</td>
        <td style="font-size:13px;color:var(--text-tertiary)">${escapeHtml(c.time)}</td>
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
    + ` L ${points[points.length-1].x.toFixed(1)} ${(H - pad.bottom).toFixed(1)}`
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
let selectedConvId = null;

function renderConversas() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-section" style="margin: -32px; height: calc(100vh - 60px);">
      <div class="conversations-layout">
        <div class="conv-list" id="conv-list">
          <div class="conv-list-header">${t('conversations.title')}</div>
          ${[0,1,2,3,4].map(() => `
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
        <div class="conv-item${selectedConvId === c.id ? ' active' : ''}" data-conv-id="${c.id}">
          <div class="conv-item-header">
            <span class="conv-item-name">${escapeHtml(c.name)}</span>
            <span class="conv-item-time">${escapeHtml(c.time)}</span>
          </div>
          <div style="margin-bottom:6px">${pill(c.status)}</div>
          <div class="conv-item-preview">${escapeHtml(c.last_message)}</div>
        </div>`).join('')}`;

    listEl.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedConvId = parseInt(item.dataset.convId);
        listEl.querySelectorAll('.conv-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const conv = convs.find(c => c.id === selectedConvId);
        renderConvDetail(conv);
      });
    });

    // Auto-select first
    if (!selectedConvId && convs.length) {
      selectedConvId = convs[0].id;
      listEl.querySelector('.conv-item')?.classList.add('active');
      renderConvDetail(convs[0]);
    } else if (selectedConvId) {
      const conv = convs.find(c => c.id === selectedConvId);
      if (conv) renderConvDetail(conv);
    }
  }).catch(() => {
    const listEl = document.getElementById('conv-list');
    if (listEl) listEl.innerHTML = `<div class="conv-list-header">${t('conversations.title')}</div>${errorBanner()}`;
  });
}

function renderConvDetail(conv) {
  const detail = document.getElementById('conv-detail');
  if (!detail) return;

  detail.innerHTML = `
    <div class="conv-detail-header">
      <div>
        <div class="conv-detail-name">${escapeHtml(conv.name)}</div>
        <div class="conv-detail-phone">${escapeHtml(conv.phone)}</div>
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
      ${conv.messages.map(m => `
        <div class="msg-row ${escapeHtml(m.role)}">
          <div class="msg-bubble ${escapeHtml(m.role)}">${escapeHtml(m.content)}</div>
          <div class="msg-time">${escapeHtml(m.time)}</div>
        </div>`).join('')}
    </div>`;

  // Scroll to bottom
  const msgs = detail.querySelector('#conv-messages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;

  // Toggle AI
  const toggle = detail.querySelector('#ai-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      conv.ai_enabled = enabled;
      conv.status = enabled ? 'active' : 'paused';

      // Update label text
      const label = detail.querySelector('#ai-toggle-label');
      if (label) label.textContent = enabled ? t('status.ai_on') : t('status.ai_off');

      // Update status pill in the detail header
      const headerPill = detail.querySelector('#conv-header-pill');
      if (headerPill) headerPill.innerHTML = pill(conv.status);

      // Update status pill in the conversation list item
      const listItem = document.querySelector(`.conv-item[data-conv-id="${conv.id}"]`);
      if (listItem) {
        const existingPill = listItem.querySelector('.pill');
        if (existingPill && existingPill.parentElement) {
          existingPill.parentElement.innerHTML = pill(conv.status);
        }
      }

      mockAPI(`/api/conversations/${encodeURIComponent(conv.phone)}/toggle-ai`, {
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
        <button class="btn btn-outline" id="add-product-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          ${t('catalog.add')}
        </button>
      </div>
      <div class="card" id="catalog-table-wrap">
        ${[0,1,2,3,4].map(() => `
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
              <select class="form-select" id="f-category">
                ${categoryOptions('')}
              </select>
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
    renderProductTable(products);
  }).catch(() => {
    const wrap = document.getElementById('catalog-table-wrap');
    if (wrap) {
      wrap.innerHTML = errorBanner();
      wrap.querySelector('#retry-btn')?.addEventListener('click', () => loadCatalogData());
    }
  });
}

function renderProductTable(products) {
  const wrap = document.getElementById('catalog-table-wrap');
  if (!wrap) return;

  if (!products.length) {
    wrap.innerHTML = emptyState('grid', t('empty.catalog'), t('catalog.add'), 'openDrawer()');
    return;
  }

  const rows = products.map(p => `
    <tr ondblclick="openEditDrawer(${escapeHtml(p.id)})" style="cursor:pointer" title="${t('btn.edit')}">
      <td class="text-tertiary text-13 tabular">${escapeHtml(p.id)}</td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td class="text-secondary text-13">${escapeHtml(tCat(p.category)) || '—'}</td>
      <td class="num-center tabular">${escapeHtml(formatPrice(p.price))}</td>
      <td class="num-center tabular">${escapeHtml(p.stock)}</td>
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

function wireDrawer() {
  const backdrop = document.getElementById('drawer-backdrop');
  const addBtn   = document.getElementById('add-product-btn');
  const closeBtn = document.getElementById('drawer-close');
  const cancelBtn= document.getElementById('drawer-cancel');
  const saveBtn  = document.getElementById('drawer-save');

  addBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  cancelBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  saveBtn?.addEventListener('click', async () => {
    const name = document.getElementById('f-name')?.value.trim();
    if (!name) { document.getElementById('f-name')?.focus(); return; }

    const payload = {
      name,
      category: document.getElementById('f-category')?.value.trim() || '',
      price: parseFloat(document.getElementById('f-price')?.value) || 0,
      stock: parseInt(document.getElementById('f-stock')?.value) || 0,
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

window.openEditDrawer = function(id) {
  const product = mockProducts.find(p => p.id === id);
  if (!product) return;
  drawerMode = 'edit';
  editingProductId = id;
  const title = document.getElementById('drawer-title');
  if (title) title.textContent = t('catalog.edit_title');
  document.getElementById('f-name').value        = product.name || '';
  document.getElementById('f-category').value    = product.category || '';
  document.getElementById('f-price').value       = product.price || '';
  document.getElementById('f-stock').value       = product.stock || '';
  document.getElementById('f-description').value = product.description || '';
  document.getElementById('f-specs').value       = product.specs || '';
  document.getElementById('drawer-backdrop')?.classList.add('open');
  document.getElementById('product-drawer')?.classList.add('open');
};

window.deleteProduct = function(id) {
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
/* ── CONFIG PAGE RENDERERS ────────────────────────────────── */

function _configSectionCard(title, bodyHtml, footerHtml = '') {
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

function _configSaveBtn(id) {
  return `<button class="btn-primary" id="${id}">${t('config.save')}</button>`;
}

function renderConfigProfile(profile) {
  const body = `
    <div class="config-field-row">
      <div class="config-field-label">${t('config.biz_name')}</div>
      <div><input class="form-input" id="cfg-biz-name" type="text" value="${escapeHtml(profile.business_name || '')}"></div>
    </div>
    <div class="config-field-row">
      <div class="config-field-label">${t('config.email')}</div>
      <div class="config-field-value">${escapeHtml(profile.email)}</div>
    </div>
    <div class="config-field-row">
      <div class="config-field-label">${t('config.phone')}</div>
      <div class="config-field-value">${escapeHtml(profile.business_phone)}</div>
    </div>`;
  return _configSectionCard(t('config.profile'), body, _configSaveBtn('cfg-profile-save'));
}

function renderConfigAgent(settings) {
  const prompt = settings.system_prompt || '';
  const lang = settings.ai_language || 'auto';
  const body = `
    <div class="config-field-row">
      <div>
        <div class="config-field-label">${t('config.system_prompt')}</div>
        <div class="config-field-hint">${t('config.prompt_hint')}</div>
      </div>
      <div>
        <textarea class="form-input" id="cfg-system-prompt" maxlength="2000" rows="6">${escapeHtml(prompt)}</textarea>
        <div class="config-char-count"><span id="cfg-prompt-count">${prompt.length}</span> / 2000</div>
      </div>
    </div>
    <div class="config-field-row">
      <div class="config-field-label">${t('config.ai_language')}</div>
      <div>
        <select class="form-input" id="cfg-ai-language">
          <option value="auto"${lang === 'auto' ? ' selected' : ''}>${t('config.lang_auto')}</option>
          <option value="pt"${lang === 'pt' ? ' selected' : ''}>${t('config.lang_pt')}</option>
          <option value="en"${lang === 'en' ? ' selected' : ''}>${t('config.lang_en')}</option>
        </select>
      </div>
    </div>`;
  return _configSectionCard(t('config.agent'), body, _configSaveBtn('cfg-agent-save'));
}

function renderConfigHours(hours) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const rows = days.map(d => {
    const day = hours[d] || { enabled: false, open: '09:00', close: '18:00' };
    const disabled = day.enabled ? '' : ' disabled';
    return `
      <div class="config-hours-row">
        <label class="toggle-wrap">
          <input type="checkbox" class="hours-day-toggle" data-day="${d}"${day.enabled ? ' checked' : ''}>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
        <span class="config-hours-day">${t('config.day.' + d)}</span>
        <input type="time" class="form-input" data-day="${d}" data-field="open" value="${day.open}"${disabled}>
        <input type="time" class="form-input" data-day="${d}" data-field="close" value="${day.close}"${disabled}>
      </div>`;
  }).join('');
  const body = `<div class="config-hours-grid">${rows}</div>`;
  return _configSectionCard(t('config.hours'), body, _configSaveBtn('cfg-hours-save'));
}

function renderConfigIntegration(profile) {
  const webhookUrl = `https://your-n8n-instance.com/webhook/whatsapp/${encodeURIComponent(profile.business_phone)}`;
  const body = `
    <div class="config-field-row">
      <div class="config-field-label">${t('config.phone')}</div>
      <div class="config-copy-row">
        <span class="config-copy-value">${escapeHtml(profile.business_phone)}</span>
        <button class="btn-outline" data-copy="${escapeHtml(profile.business_phone)}" id="copy-phone">${t('config.copy')}</button>
      </div>
    </div>
    <div class="config-field-row">
      <div class="config-field-label">${t('config.webhook_url')}</div>
      <div class="config-copy-row">
        <span class="config-copy-value" title="${escapeHtml(webhookUrl)}">${escapeHtml(webhookUrl)}</span>
        <button class="btn-outline" data-copy="${escapeHtml(webhookUrl)}" id="copy-webhook">${t('config.copy')}</button>
      </div>
    </div>`;
  return _configSectionCard(t('config.integration'), body);
}

function _collectHours() {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const hours = {};
  days.forEach(d => {
    const toggle = document.querySelector(`.hours-day-toggle[data-day="${d}"]`);
    const open   = document.querySelector(`input[data-day="${d}"][data-field="open"]`);
    const close  = document.querySelector(`input[data-day="${d}"][data-field="close"]`);
    hours[d] = {
      enabled: toggle ? toggle.checked : false,
      open:    open   ? open.value   : '09:00',
      close:   close  ? close.value  : '18:00',
    };
  });
  return hours;
}

function wireConfigSections(profile, settings) {
  // Live char counter for system prompt
  const promptEl = document.getElementById('cfg-system-prompt');
  const countEl  = document.getElementById('cfg-prompt-count');
  if (promptEl && countEl) {
    promptEl.addEventListener('input', () => { countEl.textContent = promptEl.value.length; });
  }

  // Day toggle → enable/disable time inputs
  document.querySelectorAll('.hours-day-toggle').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const day = toggle.dataset.day;
      document.querySelectorAll(`input[data-day="${day}"][data-field]`).forEach(inp => {
        inp.disabled = !toggle.checked;
      });
    });
  });

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        const orig = btn.textContent;
        btn.textContent = t('config.copied');
        setTimeout(() => { btn.textContent = orig; }, 1800);
      });
    });
  });

  // Profile save
  const profileBtn = document.getElementById('cfg-profile-save');
  if (profileBtn) {
    profileBtn.addEventListener('click', async () => {
      const bizName = document.getElementById('cfg-biz-name')?.value || '';
      profileBtn.disabled = true;
      profileBtn.textContent = t('config.saving');
      try {
        await mockAPI('/api/profile', { method: 'PUT', body: { business_name: bizName } });
        showToast(t('config.saved'));
      } catch {
        showToast(t('config.save_error'), 'error');
      } finally {
        profileBtn.disabled = false;
        profileBtn.textContent = t('config.save');
      }
    });
  }

  // Agent save (also sends current hours so we don't clobber them)
  const agentBtn = document.getElementById('cfg-agent-save');
  if (agentBtn) {
    agentBtn.addEventListener('click', async () => {
      agentBtn.disabled = true;
      agentBtn.textContent = t('config.saving');
      try {
        await mockAPI('/api/settings', {
          method: 'PUT',
          body: {
            system_prompt: document.getElementById('cfg-system-prompt')?.value || null,
            ai_language:   document.getElementById('cfg-ai-language')?.value || 'auto',
            business_hours: _collectHours(),
          },
        });
        showToast(t('config.saved'));
      } catch {
        showToast(t('config.save_error'), 'error');
      } finally {
        agentBtn.disabled = false;
        agentBtn.textContent = t('config.save');
      }
    });
  }

  // Hours save (also sends current agent settings so we don't clobber them)
  const hoursBtn = document.getElementById('cfg-hours-save');
  if (hoursBtn) {
    hoursBtn.addEventListener('click', async () => {
      hoursBtn.disabled = true;
      hoursBtn.textContent = t('config.saving');
      try {
        await mockAPI('/api/settings', {
          method: 'PUT',
          body: {
            system_prompt:  document.getElementById('cfg-system-prompt')?.value || null,
            ai_language:    document.getElementById('cfg-ai-language')?.value || 'auto',
            business_hours: _collectHours(),
          },
        });
        showToast(t('config.saved'));
      } catch {
        showToast(t('config.save_error'), 'error');
      } finally {
        hoursBtn.disabled = false;
        hoursBtn.textContent = t('config.save');
      }
    });
  }
}

function renderConfig() {
  const main = document.getElementById('main');
  const skeleton = [0, 1, 2, 3].map(() => `
    <div class="card mb-24">
      ${skLine('35%', 16, 12)}${skLine('100%', 1, 20)}
      ${skLine('45%', 13, 10)}${skLine('65%', 36, 14)}
      ${skLine('45%', 13, 10)}${skLine('65%', 36, 14)}
    </div>`).join('');

  main.innerHTML = `
    <div class="page-section">
      <div class="page-header">
        <h1 class="page-title-large font-display">${t('settings.title')}</h1>
      </div>
      <div id="config-content">${skeleton}</div>
    </div>`;

  Promise.all([mockAPI('/api/profile'), mockAPI('/api/settings')])
    .then(([profile, settings]) => {
      document.getElementById('config-content').innerHTML =
        renderConfigProfile(profile) +
        renderConfigAgent(settings) +
        renderConfigHours(settings.business_hours) +
        renderConfigIntegration(profile);
      wireConfigSections(profile, settings);
    })
    .catch(() => {
      const el = document.getElementById('config-content');
      if (el) el.innerHTML = errorBanner();
    });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Auth guard
  if (!localStorage.getItem('agente_token')) {
    window.location.href = 'login.html';
    return;
  }

  // Translate static elements (sidebar, footer) on initial load
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  updateLangButtons();
  router();

  // Hash routing
  window.addEventListener('hashchange', router);

  // Topbar avatar dropdown
  const avatarBtn = document.getElementById('topbar-avatar');
  const dropdown  = document.getElementById('avatar-dropdown');
  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown?.classList.remove('open'));

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('agente_token');
    window.location.href = 'login.html';
  });
});
