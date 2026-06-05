# backend/static/CLAUDE.md — Frontend Deep-Dive

## Architecture: Vanilla JS SPA

Zero build system. Two files do everything:
- `dashboard.js` (~1,409 lines) — router, i18n, mock API, all page renderers
- `dashboard.css` (~1,352 lines) — design tokens, all component styles

**No webpack, Vite, npm, or TypeScript.** Pure ES6 served directly by FastAPI's static file mount at `/static`.

## Router (Hash-based)

```javascript
// dashboard.js
const ROUTES = {
  '/overview':  renderOverview,
  '/conversas': renderConversas,
  '/catalogo':  renderCatalogo,
  '/config':    renderConfig,
};

window.addEventListener('hashchange', () => navigate(location.hash));
```

Navigate programmatically: `location.hash = '#/catalogo'`  
Active nav item: sidebar `<a>` whose `href` matches current hash gets class `.active`.

## Adding a New Page

1. Write a `renderXxx()` async function in `dashboard.js`
2. Register it in the `ROUTES` object: `'/xxx': renderXxx`
3. Add a sidebar link in `dashboard.html`: `<a href="#/xxx">...</a>`
4. Add i18n strings for all new labels (both `pt` and `en` — see i18n section below)
5. Add any new CSS classes to `dashboard.css`

## i18n System

```javascript
// Near top of dashboard.js
const i18n = {
  pt: { 'nav.overview': 'Visão Geral', 'catalog.name': 'Nome', ... },
  en: { 'nav.overview': 'Overview',    'catalog.name': 'Name', ... },
};

let lang = localStorage.getItem('agente_lang') || 'pt';

function t(key) {
  return i18n[lang][key] || key; // falls back to the key string if missing
}
```

Language persists via `localStorage['agente_lang']`. Toggle calls `lang = newLang` then re-renders the current page.

**To add new strings:**
1. Add `'your.key': 'Texto PT'` to `i18n.pt`
2. Add `'your.key': 'English Text'` to `i18n.en`
3. Use `t('your.key')` in the renderer

**Existing namespaces:**
- `nav.*` — sidebar navigation labels
- `kpi.*` — KPI card labels and deltas
- `table.*` — table headers
- `catalog.*` — product form labels and hints
- `config.*` — settings page labels and section titles
- `status.*` — status pill text (active, paused, inactive, ai_on, ai_off)
- `btn.*` — button labels (logout, edit, delete, retry, open)
- `empty.*` — empty state messages
- `error.*` — error messages

## API Communication

All authenticated requests go through `apiFetch`:

```javascript
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('agente_token');
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) { logout(); return; }
  return res.json();
}
```

**Mock API:** A `USE_MOCK_API` constant at the top of `dashboard.js` switches between the real backend and hardcoded mock data (600ms simulated delay). Use mock for UI development without a running backend.

## Design Tokens (CSS Variables)

All defined in `:root` in `dashboard.css`. Never hardcode colors — reference these variables:

```css
/* Surfaces */
--bg-canvas:      #F7F4ED  /* warm off-white page background */
--bg-card:        #FFFFFF  /* card/panel background */
--bg-hover:       #F5EFE0  /* row hover, subtle highlight */

/* Accent (gold) */
--gold:           #C9A84C  /* primary CTA, active states, chart fill */
--gold-hover:     #A8893C  /* darker gold for :hover */
--gold-light:     #F5E6C8  /* tinted gold background, skeleton shimmer */

/* Text */
--text-primary:   #1A1A1A
--text-secondary: #6B6B6B
--text-tertiary:  #9E9E9E  /* hints, placeholders, disabled */

/* Borders */
--border:         #ECE6DA  /* hairline borders (default) */
--border-dark:    #D4C9B0  /* stronger border on hover/focus */

/* Sidebar (dark theme) */
--sidebar-bg:     #1E1C19
--sidebar-text:   #D4C9B0
--sidebar-active: #C9A84C

/* Semantic */
--green:          #3F7D5C  /* active/success */
--amber:          #C99A2E  /* paused/caution */
--red:            #B3261E  /* error/delete */

/* Shape */
--radius-card:    14px
--radius-pill:    999px
--shadow-card:    0 1px 3px rgba(0,0,0,0.08)
```

## Typography

Two fonts loaded from Google Fonts in `dashboard.html`:
- **Fraunces** (variable serif) — page titles, KPI numbers, drawer headings
- **Hanken Grotesk** (sans-serif) — all body text, table data, buttons, labels

For price and count columns use `font-variant-numeric: tabular-nums` to keep numbers aligned.

## Component Patterns

### Status Pills
```html
<span class="pill pill--active">Active</span>
<span class="pill pill--paused">Paused</span>
<span class="pill pill--inactive">Inactive</span>
```

### Skeleton Loaders
Show during fetch, replace on resolve:
```javascript
function skeletonRow() {
  return `<tr><td colspan="7"><div class="skeleton skeleton--row"></div></td></tr>`;
}
```

### Drawer (Slide-in Form Panel)
```html
<div class="drawer" id="product-drawer">
  <div class="drawer__backdrop"></div>
  <div class="drawer__panel">
    <header class="drawer__header">...</header>
    <form class="drawer__body">...</form>
    <footer class="drawer__footer">...</footer>
  </div>
</div>
```
Open: `drawer.classList.add('drawer--open')`  
Close: `drawer.classList.remove('drawer--open')`

### Toast Notifications
```javascript
showToast('Produto salvo!', 'success'); // type: 'success' | 'error'
```

### Empty States
```javascript
function emptyState(iconSvg, title, subtitle) {
  return `<div class="empty-state">
    <div class="empty-state__icon">${iconSvg}</div>
    <p class="empty-state__title">${title}</p>
    <p class="empty-state__subtitle">${subtitle}</p>
  </div>`;
}
```

## Auth Flow (Frontend)

1. Login page POSTs to `/api/auth/login` → stores `agente_token` + `agente_business_phone` in `localStorage`
2. Every page checks `localStorage.agente_token` on load; redirects to `/login` if missing
3. `apiFetch` calls `logout()` automatically on any 401 response
4. Logout: clears `localStorage`, redirects to `/login`

## Catalog: Custom Category Pattern

The category dropdown includes a sentinel `"__custom__"` option to reveal a free-text input:

```javascript
function onCategoryChange(e) {
  const isCustom = e.target.value === '__custom__';
  customInput.style.display = isCustom ? 'block' : 'none';
  customInput.required = isCustom;
}

// On form submit:
const category = form.category.value === '__custom__'
  ? form.custom_category.value.trim()
  : form.category.value;
```

Custom categories entered this way are stored in `products.category` and surfaced by `GET /api/categories` alongside defaults.
