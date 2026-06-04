# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartFeedbackAI is a French-language SaaS dashboard for AI-powered restaurant review management. Multi-file vanilla JS/CSS SPA (no framework, no build step). Demo scoped to "Le Petit Bistro".

## Running the App

`fetch()` on JSON data requires a local server:

```bash
npx serve .          # → http://localhost:3000
# or
npm start
```

To test with Playwright (uses system Chrome):
```bash
node test-playwright.js   # not committed — run ad-hoc
```

## Architecture

Hash-based SPA: `index.html` loads all CSS + JS via `<link>`/`<script>` tags. `js/router.js` maps `window.location.hash` to page modules that inject HTML into `<div id="app">`. Shared components (sidebar, topnav, toast, slideover) render once and survive navigation.

### Script load order (must be preserved)

```
store.js → router.js → ai.js
→ components/toast.js → components/sidebar.js → components/topnav.js → components/slideover.js
→ pages/dashboard.js → pages/reviews.js → pages/analytics.js → pages/settings.js
→ main.js   ← bootstrap (fetch data → Store.init → render shell → Router.init)
```

### JS pattern

All files use the IIFE pattern (`window.X = (function() { ... })()`). No ES modules, no `import`/`export`. Classic `<script src="">` tags only.

### State management (`js/store.js`)

`Store.init(reviews, settings)` — called once at startup. Merges `localStorage` overrides over fetched JSON. Re-applies persisted `publishedResponses` to the in-memory review array. `Store.publishResponse(id, text)` updates both memory and `localStorage`.

### Routing (`js/router.js`)

| Hash | Page |
|------|------|
| `#/` | Dashboard |
| `#/reviews` | Tous les avis |
| `#/analytics` | Analytique IA |
| `#/settings` | Paramètres |

### AI module (`js/ai.js`)

`AI.generate({ rating, tone, name, text }) → Promise<string>`. Uses mock templates (20 combinations: 5 ratings × 4 tones) by default. If `Store.get('settings').ai.apiKey` is set, calls Claude API (`claude-haiku-4-5-20251001`) directly from the browser with fallback to mock on error.

## CSS Structure

| File | Responsibility |
|------|---------------|
| `css/tokens.css` | All CSS custom properties (edit here, never hardcode values) |
| `css/base.css` | Reset + body |
| `css/layout.css` | Sidebar + topnav + main wrapper + responsive |
| `css/components.css` | All shared UI (buttons, cards, badges, slideover, toast…) |
| `css/pages/*.css` | Page-specific styles |

Color convention: `--primary` (indigo) = action, `--green` = success/responded, `--orange` = pending/warning, `--red` = danger.

## Data Files

- `data/reviews.json` — 20 mock reviews (fields: `id`, `author`, `initials`, `color`, `rating`, `date`, `source`, `status`, `text`, `response`)
- `data/settings.json` — default config (business, ai, integrations)

Both are loaded at startup via `fetch()` in `main.js`.

## Security Rules

- **Always use `esc(s)`** before injecting any user-sourced string into `innerHTML`. Every page file has its own `esc()` helper.
- **Form inputs**: populate via `.value =`, never `innerHTML`.
- **CSV export**: use `csvCell()` in `reviews.js` — it prevents formula injection for Excel/Sheets.
- The Claude API key is stored in `localStorage` only — never hardcoded, never logged.

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `≤ 1100px` | Right column stacks below reviews |
| `≤ 860px` | Summary cards go 2-column |
| `≤ 640px` | Sidebar hidden behind hamburger, single-column |

## Adding a New Page

1. Register a route in `js/main.js`: `Router.register('/mypage', function() { MyPage.render(app); })`
2. Add a nav item in `js/components/sidebar.js` NAV array
3. Create `js/pages/mypage.js` exposing `window.MyPage = { render }`
4. Add `<script src="js/pages/mypage.js">` to `index.html` before `main.js`
5. Add `css/pages/mypage.css` and link it in `index.html`
