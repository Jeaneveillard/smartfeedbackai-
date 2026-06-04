# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une landing page marketing affichée aux visiteurs non authentifiés, avec des CTA qui mènent au login/signup sans rechargement de page.

**Architecture:** Nouveau module `LandingPage` (pattern IIFE comme le reste de l'app). `main.js` l'affiche à la place de `LoginPage` quand il n'y a pas de JWT. Les boutons CTA appellent `LoginPage.render()` / `SignupPage.render()` sur le même conteneur. Un bouton « ← Retour » flottant (géré entièrement par `landing.js`) permet de revenir à la landing depuis le login/signup.

**Tech Stack:** Vanilla JS (IIFE, pas d'ES modules), CSS avec custom properties (`css/tokens.css`), pas de build step. Pas de framework de test — vérification manuelle dans le navigateur via `npx serve .`.

**Note sur les tests :** Ce projet n'a pas de test runner. Chaque tâche se vérifie en chargeant l'app dans le navigateur. Le serveur de dev se lance avec `npx serve .` → http://localhost:3000. Pour forcer l'affichage de la landing en local (qui est normalement en mode démo), on teste via `?token=` absent + un override, voir Task 5.

---

## File Structure

| Fichier | Responsabilité |
|---|---|
| `css/pages/landing.css` | **Créer.** Tous les styles de la landing (nav, hero, secteurs, sources, features, témoignages, FAQ, CTA, footer, responsive, bouton retour) |
| `js/pages/landing.js` | **Créer.** Module `window.LandingPage = { render }` — génère le HTML, attache les listeners CTA, gère le bouton retour |
| `index.html` | **Modifier.** Ajouter `<link>` CSS et `<script>` landing.js |
| `js/main.js` | **Modifier.** Bloc `if (!jwt)` non-démo → `LandingPage.render()` au lieu de `LoginPage.render()` |

---

## Task 1: Squelette CSS de la landing

**Files:**
- Create: `css/pages/landing.css`

- [ ] **Step 1: Créer le fichier CSS avec tous les styles**

Créer `css/pages/landing.css`. Utiliser les tokens existants (`var(--primary)`, `var(--bg)`, etc.). Tous les sélecteurs sont préfixés `.lp-` pour éviter les collisions avec les styles de l'app.

```css
/* ─── Landing Page ─── */
.lp-root { font-family: 'Inter', -apple-system, sans-serif; color: var(--txt1); background: var(--card); min-height: 100vh; }

/* Nav */
.lp-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 0 40px; height: 58px; display: flex; align-items: center; justify-content: space-between; }
.lp-logo { display: flex; align-items: center; gap: 9px; }
.lp-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg,#818CF8,var(--primary)); border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.lp-logo-text { font-weight: 800; font-size: 15px; letter-spacing: -.4px; }
.lp-nav-actions { display: flex; gap: 10px; align-items: center; }
.lp-btn-ghost { background: none; border: 1.5px solid var(--border); padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--txt1); font-family: inherit; }
.lp-btn-ghost:hover { border-color: var(--primary); }
.lp-btn-primary { background: var(--primary); color: #fff; border: none; padding: 8px 18px; border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.lp-btn-primary:hover { background: var(--primary-dark); }

/* Hero */
.lp-hero { background: linear-gradient(160deg,#fff 0%,var(--primary-light) 55%,var(--primary-mid) 100%); padding: 72px 40px 60px; text-align: center; }
.lp-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-light); border: 1px solid var(--primary-mid); color: var(--primary); font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; margin-bottom: 22px; }
.lp-hero h1 { font-size: 42px; font-weight: 800; line-height: 1.15; letter-spacing: -.8px; margin: 0 0 16px; }
.lp-hero h1 span { color: var(--primary); }
.lp-hero-sub { font-size: 16px; color: var(--txt2); max-width: 540px; margin: 0 auto 32px; line-height: 1.6; }
.lp-hero-ctas { display: flex; gap: 12px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }
.lp-hero-ctas .lp-btn-primary { padding: 12px 28px; font-size: 15px; border-radius: 8px; box-shadow: 0 4px 14px rgba(79,70,229,.35); }
.lp-hero-ctas .lp-btn-ghost { padding: 12px 24px; font-size: 15px; border-radius: 8px; }

/* Preview */
.lp-preview { background: #fff; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 8px 40px rgba(79,70,229,.12); max-width: 680px; margin: 0 auto; overflow: hidden; }
.lp-preview-bar { background: var(--bg); border-bottom: 1px solid var(--border); padding: 10px 16px; display: flex; align-items: center; gap: 6px; }
.lp-dot { width: 10px; height: 10px; border-radius: 50%; }
.lp-preview-body { padding: 20px; }
.lp-rev { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 12px; text-align: left; }
.lp-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
.lp-stars { color: var(--yellow); font-size: 12px; margin-bottom: 3px; }
.lp-chip { display: inline-flex; align-items: center; gap: 5px; background: var(--primary-light); color: var(--primary); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; margin-top: 8px; }
.lp-ai-resp { background: linear-gradient(135deg,var(--primary-light),var(--primary-ultra)); border: 1px solid var(--primary-mid); border-radius: 8px; padding: 10px 14px; font-size: 11px; color: var(--txt1); line-height: 1.5; margin-top: 8px; text-align: left; }
.lp-stat-row { display: flex; gap: 10px; }
.lp-stat { flex: 1; border-radius: 8px; padding: 10px 14px; text-align: center; }
.lp-stat-num { font-size: 20px; font-weight: 800; }
.lp-stat-lbl { font-size: 11px; color: var(--txt2); }

/* Secteurs */
.lp-sectors { padding: 28px 40px; text-align: center; border-bottom: 1px solid var(--border-faint); }
.lp-eyebrow { font-size: 12px; color: var(--txt3); font-weight: 500; margin-bottom: 16px; text-transform: uppercase; letter-spacing: .8px; }
.lp-sector-row { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; }
.lp-sector { display: inline-flex; align-items: center; gap: 6px; background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 500; color: var(--txt1); }

/* Sources */
.lp-sources { padding: 20px 40px 28px; text-align: center; border-bottom: 1px solid var(--border-faint); }
.lp-source-row { display: flex; justify-content: center; align-items: center; gap: 28px; flex-wrap: wrap; }
.lp-source { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: var(--txt2); }

/* Sections génériques */
.lp-section-label { font-size: 12px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-bottom: 10px; }
.lp-section-title { font-size: 30px; font-weight: 800; text-align: center; letter-spacing: -.5px; margin: 0 0 12px; }
.lp-section-sub { font-size: 15px; color: var(--txt2); text-align: center; max-width: 480px; margin: 0 auto 48px; line-height: 1.6; }

/* Features */
.lp-features { padding: 72px 40px; background: var(--card); }
.lp-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto; }
.lp-feat { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.lp-feat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.lp-feat h3 { font-size: 15px; font-weight: 700; margin: 0 0 8px; }
.lp-feat p { font-size: 13px; color: var(--txt2); line-height: 1.55; margin: 0; }

/* Témoignages */
.lp-testi { padding: 72px 40px; background: var(--bg); }
.lp-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
.lp-testi-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.lp-quote { font-size: 13px; color: var(--txt1); line-height: 1.6; margin: 12px 0 16px; font-style: italic; }
.lp-author { display: flex; align-items: center; gap: 10px; }
.lp-author-name { font-size: 13px; font-weight: 700; }
.lp-author-role { font-size: 11px; color: var(--txt3); }

/* FAQ */
.lp-faq { padding: 72px 40px; background: var(--card); }
.lp-faq-list { max-width: 640px; margin: 0 auto; }
.lp-faq-item { border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin-bottom: 10px; }
.lp-faq-q { font-size: 14px; font-weight: 700; color: var(--txt1); display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.lp-faq-a { font-size: 13px; color: var(--txt2); margin-top: 10px; line-height: 1.6; }
.lp-faq-plus { color: var(--txt3); font-size: 18px; flex-shrink: 0; }

/* CTA final */
.lp-cta { padding: 72px 40px; background: linear-gradient(135deg,var(--sidebar-bg),var(--primary)); text-align: center; color: #fff; }
.lp-cta h2 { font-size: 32px; font-weight: 800; margin: 0 0 14px; letter-spacing: -.5px; }
.lp-cta p { font-size: 16px; color: rgba(255,255,255,.75); margin: 0 0 32px; }
.lp-btn-white { background: #fff; color: var(--primary); border: none; padding: 14px 32px; border-radius: 9px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,.2); font-family: inherit; }
.lp-btn-outline { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.4); padding: 13px 28px; border-radius: 9px; font-size: 15px; font-weight: 600; cursor: pointer; margin-left: 12px; font-family: inherit; }

/* Footer */
.lp-footer { padding: 28px 40px; background: var(--txt1); color: var(--txt2); display: flex; align-items: center; justify-content: space-between; font-size: 12px; flex-wrap: wrap; gap: 10px; }
.lp-footer a { color: var(--txt3); text-decoration: none; margin-left: 20px; cursor: pointer; }
.lp-footer a:hover { color: #fff; }

/* Bouton retour (login/signup depuis landing) */
.lp-back { position: fixed; top: 16px; left: 16px; z-index: 200; background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--txt1); cursor: pointer; box-shadow: var(--shadow); font-family: inherit; }
.lp-back:hover { border-color: var(--primary); color: var(--primary); }

/* Responsive */
@media (max-width: 860px) {
  .lp-feat-grid, .lp-testi-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .lp-nav { padding: 0 16px; }
  .lp-hero { padding: 48px 20px 40px; }
  .lp-hero h1 { font-size: 30px; }
  .lp-features, .lp-testi, .lp-faq, .lp-cta { padding: 48px 20px; }
  .lp-sectors, .lp-sources { padding: 24px 20px; }
  .lp-feat-grid, .lp-testi-grid { grid-template-columns: 1fr; }
  .lp-section-title { font-size: 24px; }
  .lp-cta h2 { font-size: 24px; }
  .lp-btn-outline { margin-left: 0; margin-top: 12px; }
}
```

- [ ] **Step 2: Vérifier la syntaxe CSS**

Run: `npx --yes csslint css/pages/landing.css 2>&1 | head -20` (ou ouvrir le fichier — si csslint indisponible, ignorer)
Expected: Pas d'erreur de parsing. Les warnings de style sont acceptables.

- [ ] **Step 3: Commit**

```bash
git add css/pages/landing.css
git commit -m "feat: add landing page styles"
```

---

## Task 2: Module LandingPage (HTML + CTA)

**Files:**
- Create: `js/pages/landing.js`

- [ ] **Step 1: Créer le module avec le HTML complet et les listeners**

Créer `js/pages/landing.js`. Le module expose `render(container)`. Tout le contenu est statique (aucune donnée utilisateur injectée). Les boutons CTA appellent `LoginPage.render(container)` ou `SignupPage.render(container)`, puis on injecte un bouton retour flottant qui ré-affiche la landing.

```js
var LandingPage = (function() {
  'use strict';

  function showAuth(container, page) {
    // page === 'login' | 'signup'
    if (page === 'signup' && window.SignupPage) {
      SignupPage.render(container);
    } else if (window.LoginPage) {
      LoginPage.render(container);
    }
    // Bouton retour flottant
    var back = document.createElement('button');
    back.className = 'lp-back';
    back.innerHTML = '← Retour';
    back.addEventListener('click', function() { render(container); });
    container.appendChild(back);
  }

  function render(container) {
    container.innerHTML = [
      '<div class="lp-root">',

      // NAV
      '  <nav class="lp-nav">',
      '    <div class="lp-logo">',
      '      <div class="lp-logo-icon"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg></div>',
      '      <span class="lp-logo-text">SmartFeedback AI</span>',
      '    </div>',
      '    <div class="lp-nav-actions">',
      '      <button class="lp-btn-ghost" id="lpNavLogin">Se connecter</button>',
      '      <button class="lp-btn-primary" id="lpNavSignup">Commencer gratuitement</button>',
      '    </div>',
      '  </nav>',

      // HERO
      '  <section class="lp-hero">',
      '    <div class="lp-badge"><svg width="12" height="12" fill="none" stroke="#4F46E5" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg> Propulsé par Claude AI (Anthropic)</div>',
      '    <h1>Gérez tous vos avis clients<br>avec l\'<span>intelligence artificielle</span></h1>',
      '    <p class="lp-hero-sub">Centralisez vos avis Google, TripAdvisor et Yelp. Générez des réponses professionnelles en quelques secondes. Pour tout type d\'entreprise.</p>',
      '    <div class="lp-hero-ctas">',
      '      <button class="lp-btn-primary" id="lpHeroSignup">🚀 Commencer gratuitement</button>',
      '      <button class="lp-btn-ghost" id="lpHeroLogin">Se connecter →</button>',
      '    </div>',
      '    <div class="lp-preview">',
      '      <div class="lp-preview-bar"><span class="lp-dot" style="background:#EF4444"></span><span class="lp-dot" style="background:#F59E0B"></span><span class="lp-dot" style="background:#10B981"></span><span style="margin-left:8px;font-size:11px;color:#9CA3AF">SmartFeedback AI — Dashboard</span></div>',
      '      <div class="lp-preview-body">',
      '        <div class="lp-rev">',
      '          <div class="lp-avatar" style="background:#4F46E5">CL</div>',
      '          <div style="flex:1">',
      '            <div class="lp-stars">★★★★★</div>',
      '            <div style="font-size:12px;color:#374151;line-height:1.4">"Personnel très professionnel, service impeccable. Je recommande vivement !"</div>',
      '            <div class="lp-chip"><svg width="11" height="11" fill="none" stroke="#4F46E5" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg> Réponse IA générée en 2 sec</div>',
      '            <div class="lp-ai-resp">"Merci beaucoup pour votre retour, Claire ! Nous sommes ravis que votre expérience ait été à la hauteur de vos attentes. Toute l\'équipe vous remercie !"</div>',
      '          </div>',
      '        </div>',
      '        <div class="lp-stat-row">',
      '          <div class="lp-stat" style="background:var(--green-bg);border:1px solid #D1FAE5"><div class="lp-stat-num" style="color:#059669">94%</div><div class="lp-stat-lbl">Avis répondus</div></div>',
      '          <div class="lp-stat" style="background:var(--primary-light);border:1px solid var(--primary-mid)"><div class="lp-stat-num" style="color:#4F46E5">4.8★</div><div class="lp-stat-lbl">Note moyenne</div></div>',
      '          <div class="lp-stat" style="background:var(--orange-bg);border:1px solid #FED7AA"><div class="lp-stat-num" style="color:#EA580C">3</div><div class="lp-stat-lbl">En attente</div></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </section>',

      // SECTEURS
      '  <div class="lp-sectors">',
      '    <div class="lp-eyebrow">Pour tous les secteurs qui reçoivent des avis clients</div>',
      '    <div class="lp-sector-row">',
      '      <span class="lp-sector">🍽️ Restaurants</span>',
      '      <span class="lp-sector">🏨 Hôtels &amp; hébergements</span>',
      '      <span class="lp-sector">🏥 Cliniques &amp; santé</span>',
      '      <span class="lp-sector">💇 Salons &amp; beauté</span>',
      '      <span class="lp-sector">🏋️ Fitness &amp; sport</span>',
      '      <span class="lp-sector">🛍️ Commerce de détail</span>',
      '      <span class="lp-sector">🚗 Garages &amp; auto</span>',
      '      <span class="lp-sector">⚖️ Services professionnels</span>',
      '    </div>',
      '  </div>',

      // SOURCES
      '  <div class="lp-sources">',
      '    <div class="lp-eyebrow">Connecté à vos plateformes d\'avis</div>',
      '    <div class="lp-source-row">',
      '      <div class="lp-source"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg> Google</div>',
      '      <span style="color:#D1D5DB">·</span>',
      '      <div class="lp-source" style="color:#00AF87">✈ TripAdvisor</div>',
      '      <span style="color:#D1D5DB">·</span>',
      '      <div class="lp-source" style="color:#FF1A1A">★ Yelp</div>',
      '    </div>',
      '  </div>',

      // FEATURES
      '  <section class="lp-features">',
      '    <div class="lp-section-label">Fonctionnalités</div>',
      '    <h2 class="lp-section-title">Tout ce dont votre entreprise a besoin</h2>',
      '    <p class="lp-section-sub">Un tableau de bord centralisé pour piloter votre réputation en ligne en quelques minutes par semaine.</p>',
      '    <div class="lp-feat-grid">',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--primary-light)"><svg width="20" height="20" fill="none" stroke="#4F46E5" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg></div><h3>Réponses IA en 1 clic</h3><p>Génère des réponses personnalisées et professionnelles pour chaque avis, quel que soit le secteur.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--green-bg)"><svg width="20" height="20" fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg></div><h3>Tableau de bord centralisé</h3><p>Tous vos avis Google, TripAdvisor et Yelp au même endroit. Fini de jongler entre les plateformes.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--orange-bg)"><svg width="20" height="20" fill="none" stroke="#F97316" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></div><h3>Analytique IA</h3><p>Analyse des sentiments, tendances et suggestions pour améliorer continuellement votre offre.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--primary-ultra)"><svg width="20" height="20" fill="none" stroke="#8B5CF6" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg></div><h3>Ton personnalisable</h3><p>Professionnel, chaleureux, formel ou décontracté — adaptez le ton à l\'image de votre marque.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:#FEF2F2"><svg width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h3>Sécurité &amp; confidentialité</h3><p>Vos données sont chiffrées et ne sont jamais partagées avec des tiers. Conforme RGPD.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:#F0FDF4"><svg width="20" height="20" fill="none" stroke="#22C55E" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.1 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.91 10a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.92z"/></svg></div><h3>Alertes en temps réel</h3><p>Soyez alerté immédiatement dès qu\'un nouvel avis négatif est posté pour réagir rapidement.</p></div>',
      '    </div>',
      '  </section>',

      // TÉMOIGNAGES
      '  <section class="lp-testi">',
      '    <div class="lp-section-label">Témoignages</div>',
      '    <h2 class="lp-section-title">Ils nous font confiance</h2>',
      '    <p class="lp-section-sub">Des professionnels de tous secteurs qui ont transformé leur gestion des avis.</p>',
      '    <div class="lp-testi-grid">',
      '      <div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">"En 2 semaines, notre note Google est passée de 4,1 à 4,7. Les réponses IA sont vraiment personnalisées, pas des copier-coller génériques."</p><div class="lp-author"><div class="lp-avatar" style="background:#4F46E5">SL</div><div><div class="lp-author-name">Sophie Laurent</div><div class="lp-author-role">🍽️ Brasserie Le Central, Lyon</div></div></div></div>',
      '      <div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">"Notre clinique reçoit des dizaines d\'avis par semaine. SmartFeedback AI nous fait gagner des heures tout en maintenant un ton professionnel et empathique."</p><div class="lp-author"><div class="lp-avatar" style="background:#10B981">DR</div><div><div class="lp-author-name">Dr. Rousseau</div><div class="lp-author-role">🏥 Clinique Santé Plus, Montréal</div></div></div></div>',
      '      <div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">"L\'analyse des sentiments nous a révélé ce que nos clients appréciaient vraiment dans notre hôtel. On a pu agir concrètement et nos réservations ont augmenté."</p><div class="lp-author"><div class="lp-avatar" style="background:#F97316">KM</div><div><div class="lp-author-name">Karim Mansouri</div><div class="lp-author-role">🏨 Hôtel Lumière, Paris</div></div></div></div>',
      '    </div>',
      '  </section>',

      // FAQ
      '  <section class="lp-faq">',
      '    <div class="lp-section-label">FAQ</div>',
      '    <h2 class="lp-section-title">Questions fréquentes</h2>',
      '    <p class="lp-section-sub">Tout ce que vous voulez savoir avant de commencer.</p>',
      '    <div class="lp-faq-list">',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Pour quel type d\'entreprise SmartFeedback AI est-il conçu ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Pour toute entreprise qui reçoit des avis clients en ligne : restaurants, hôtels, cliniques, salons, commerces, garages, services professionnels… Si vous avez une fiche Google Business, vous pouvez en bénéficier.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Comment les réponses sont-elles générées ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Notre IA est basée sur Claude (Anthropic), l\'un des modèles les plus avancés du marché. Elle analyse le contexte de chaque avis — note, ton, sujet — pour générer une réponse naturelle et adaptée à votre secteur.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Puis-je modifier les réponses avant de les publier ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Absolument. Toutes les réponses générées sont éditables avant publication. Vous gardez le contrôle total sur ce qui est publié au nom de votre entreprise.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Quelles plateformes d\'avis sont supportées ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Actuellement Google, TripAdvisor et Yelp. D\'autres plateformes (Booking.com, Facebook, Pages Jaunes) seront ajoutées prochainement.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Comment démarrer ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Créez votre compte en 2 minutes, configurez votre profil d\'entreprise, et commencez à générer des réponses immédiatement. Aucune installation requise, tout fonctionne dans le navigateur.</div></div>',
      '    </div>',
      '  </section>',

      // CTA FINAL
      '  <section class="lp-cta">',
      '    <h2>Prêt à maîtriser votre réputation en ligne ?</h2>',
      '    <p>Rejoignez les entreprises qui gagnent du temps et améliorent leur note grâce à l\'IA.</p>',
      '    <button class="lp-btn-white" id="lpCtaSignup">🚀 Commencer gratuitement</button>',
      '    <button class="lp-btn-outline" id="lpCtaLogin">Se connecter</button>',
      '  </section>',

      // FOOTER
      '  <footer class="lp-footer">',
      '    <span>© 2025 SmartFeedback AI. Tous droits réservés.</span>',
      '    <div>',
      '      <a id="lpFooterPrivacy">Confidentialité</a>',
      '      <a id="lpFooterContract">Contrat</a>',
      '      <a href="mailto:jeaneveillard@gmail.com">Contact</a>',
      '    </div>',
      '  </footer>',

      '</div>'
    ].join('');

    // CTA listeners
    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
    on('lpNavLogin',   function() { showAuth(container, 'login'); });
    on('lpNavSignup',  function() { showAuth(container, 'signup'); });
    on('lpHeroLogin',  function() { showAuth(container, 'login'); });
    on('lpHeroSignup', function() { showAuth(container, 'signup'); });
    on('lpCtaLogin',   function() { showAuth(container, 'login'); });
    on('lpCtaSignup',  function() { showAuth(container, 'signup'); });
    on('lpFooterPrivacy', function() { if (window.PrivacyModal) PrivacyModal.show(); });
    on('lpFooterContract', function() { if (window.ContractModal) ContractModal.show(); });
  }

  return { render: render };
})();
window.LandingPage = LandingPage;
```

- [ ] **Step 2: Vérifier la syntaxe JS**

Run: `node --check js/pages/landing.js`
Expected: Pas de sortie (= syntaxe valide). En cas d'erreur, corriger.

- [ ] **Step 3: Commit**

```bash
git add js/pages/landing.js
git commit -m "feat: add LandingPage module"
```

---

## Task 3: Câblage dans index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Ajouter le lien CSS**

Dans `index.html`, après la ligne `<link rel="stylesheet" href="css/pages/settings.css">` (ligne ~23), ajouter :

```html
    <link rel="stylesheet" href="css/pages/landing.css">
```

- [ ] **Step 2: Ajouter le script**

Dans `index.html`, juste après `<script src="js/pages/signup.js"></script>` (ligne ~56), ajouter :

```html
    <script src="js/pages/landing.js"></script>
```

- [ ] **Step 3: Vérifier l'ordre de chargement**

Le script `landing.js` doit être chargé AVANT `main.js` et APRÈS `login.js`/`signup.js` (car `LandingPage.showAuth` référence `LoginPage`/`SignupPage`). Confirmer visuellement dans `index.html` que l'ordre est :
`...login.js → signup.js → landing.js → privacy.js → contract.js → main.js`
(privacy/contract peuvent être avant ou après landing — pas de dépendance au chargement, seulement à l'usage).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: wire up landing page assets in index.html"
```

---

## Task 4: Redirection des visiteurs non authentifiés

**Files:**
- Modify: `js/main.js` (bloc `if (!jwt)`, ~lignes 211-221)

- [ ] **Step 1: Remplacer LoginPage par LandingPage pour les visiteurs non auth**

Dans `js/main.js`, dans le bloc `if (!jwt)` (le 2ème, après le bloc démo), remplacer l'appel à `LoginPage.render` par `LandingPage.render`. Code actuel :

```js
    if (!jwt) {
      // Backend configuré mais pas de JWT — afficher la page de login
      document.body.innerHTML = '<div id="app" style="min-height:100vh;background:var(--bg,#F4F5F9)"></div>';
      document.body.style.fontFamily = "'Inter', -apple-system, sans-serif";
      if (window.LoginPage) {
        LoginPage.render(document.getElementById('app'));
      } else {
        document.getElementById('app').innerHTML = '<p style="padding:40px;text-align:center">Chargement...</p>';
      }
      return;
    }
```

Le remplacer par :

```js
    if (!jwt) {
      // Backend configuré mais pas de JWT — afficher la landing page
      document.body.innerHTML = '<div id="app" style="min-height:100vh;background:var(--bg,#F4F5F9)"></div>';
      document.body.style.fontFamily = "'Inter', -apple-system, sans-serif";
      if (window.LandingPage) {
        LandingPage.render(document.getElementById('app'));
      } else if (window.LoginPage) {
        LoginPage.render(document.getElementById('app'));
      } else {
        document.getElementById('app').innerHTML = '<p style="padding:40px;text-align:center">Chargement...</p>';
      }
      return;
    }
```

Note : on garde `LoginPage` en fallback si jamais `LandingPage` n'est pas chargé. L'invitation (`?invite=`) continue d'aller directement au signup — ce bloc est plus haut et n'est pas touché.

- [ ] **Step 2: Vérifier la syntaxe JS**

Run: `node --check js/main.js`
Expected: Pas de sortie.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: show landing page to unauthenticated visitors"
```

---

## Task 5: Vérification manuelle dans le navigateur

**Files:** Aucun (vérification seulement)

En local, l'app est en mode démo (localhost sans JWT → dashboard direct), donc la landing ne s'affiche pas naturellement. On la force avec un flag.

- [ ] **Step 1: Lancer le serveur de dev**

Run: `npx serve .`
Expected: Serveur sur http://localhost:3000

- [ ] **Step 2: Forcer l'affichage de la landing**

Dans la console du navigateur (F12) sur http://localhost:3000, exécuter :

```js
localStorage.removeItem('sfai_jwt');
LandingPage.render(document.getElementById('app') || document.body);
```

Si `#app` n'existe pas (mode démo a rendu le shell), exécuter d'abord :
```js
document.body.innerHTML = '<div id="app"></div>';
LandingPage.render(document.getElementById('app'));
```

Expected : la landing s'affiche entièrement — nav, hero avec aperçu, secteurs, sources, 6 features, 3 témoignages, 5 FAQ, CTA, footer.

- [ ] **Step 3: Tester les CTA**

Cliquer sur "Se connecter" (nav) → le formulaire de login s'affiche + bouton "← Retour" en haut à gauche.
Cliquer sur "← Retour" → la landing réapparaît.
Cliquer sur "Commencer gratuitement" (hero) → le formulaire d'inscription s'affiche + bouton retour.
Cliquer sur "← Retour" → la landing réapparaît.

Expected : tous les swaps fonctionnent sans erreur console, le bouton retour ramène toujours à la landing.

- [ ] **Step 4: Tester le responsive**

Ouvrir les DevTools (F12), activer le mode responsive, tester à 375px (mobile).
Expected : nav compacte, hero lisible, grilles features/témoignages en 1 colonne, pas de débordement horizontal.

- [ ] **Step 5: Vérifier qu'un utilisateur connecté n'est pas affecté**

Note : ce test nécessite un backend. À défaut, vérifier par lecture de code que le bloc `if (!jwt)` est le seul modifié et que le chemin JWT présent (ligne ~223+) reste inchangé.

Expected : aucun changement de comportement pour les utilisateurs connectés.

- [ ] **Step 6: Commit (si ajustements nécessaires)**

Si des corrections ont été faites pendant la vérification, les committer. Sinon, rien à committer.

---

## Self-Review Notes

- **Couverture spec :** Nav ✓ (Task 2), Hero ✓, Secteurs ✓, Sources ✓, Features 6 ✓, Témoignages 3 ✓, FAQ 5 statique ✓, CTA ✓, Footer ✓, redirection non-auth ✓ (Task 4), CTA swap login/signup ✓ (Task 2), responsive 640px ✓ (Task 1), tokens CSS ✓, pas d'injection de données ✓.
- **Ajout hors-spec justifié :** bouton « ← Retour » — nécessaire car le swap login/signup ne change pas l'URL, donc le bouton « précédent » du navigateur ne ramène pas à la landing. Entièrement contenu dans `landing.js`, ne touche pas `login.js`/`signup.js`.
- **Cohérence :** `LandingPage.render(container)` utilisé partout ; `showAuth(container, page)` interne ; IDs CTA uniques (`lpNavLogin`, `lpHeroSignup`, etc.).
