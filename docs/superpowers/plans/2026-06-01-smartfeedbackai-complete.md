# SmartFeedbackAI — Complete Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the single-file prototype into a structured 23-file multi-file SPA with 4 complete pages, JSON mock data, and configurable AI response generation.

**Architecture:** Hash-based SPA — `index.html` loads all CSS+JS via tags; `router.js` maps `window.location.hash` to page modules injecting HTML into `<div id="app">`. Shared components render once and persist across navigation. `store.js` holds runtime state with localStorage sync.

**Tech Stack:** Vanilla JS (IIFE pattern), CSS custom properties, SVG charts. Requires `npx serve .` for `fetch()` on JSON data.

---

## Build Order

- [ ] **Task 1** — CSS files: `css/tokens.css`, `css/base.css`, `css/layout.css`, `css/components.css`, `css/pages/*.css`
- [ ] **Task 2** — Data: `data/reviews.json` (20 avis), `data/settings.json`
- [ ] **Task 3** — Core JS: `js/store.js`, `js/router.js`, `js/ai.js`
- [ ] **Task 4** — Components: `js/components/toast.js`, `js/components/sidebar.js`, `js/components/topnav.js`, `js/components/slideover.js`
- [ ] **Task 5** — Pages: `js/pages/dashboard.js`, `js/pages/reviews.js`, `js/pages/analytics.js`, `js/pages/settings.js`
- [ ] **Task 6** — Entry point: `js/main.js`, `index.html` (replace prototype)
- [ ] **Task 7** — Security review + bug fixes
