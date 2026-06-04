(function () {
  'use strict';

  function renderShell() {
    document.body.innerHTML = [
      // Sidebar overlay for mobile
      '<div id="sidebarOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:199"></div>',

      // Sidebar
      '<aside class="sidebar" id="sidebar"></aside>',

      // Main
      '<main class="main">',
      '  <header class="topnav" id="topnav"></header>',
      '  <div id="app"></div>',
      '</main>',

      // Slide-over overlay
      '<div class="overlay" id="overlay"></div>',

      // Slide-over panel
      '<div class="slideover" id="slideover">',
      '  <div class="so-header">',
      '    <div>',
      '      <div class="so-title">' + t('generate_response') + '</div>',
      '      <div class="so-subtitle" id="soSubtitle"></div>',
      '    </div>',
      '    <button class="close-btn" aria-label="Fermer">',
      '      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      '    </button>',
      '  </div>',
      '  <div class="so-body">',
      '    <div class="orig-block">',
      '      <div class="orig-label">' + t('original_review') + '</div>',
      '      <div class="orig-reviewer">',
      '        <div id="soAvatar" class="rev-avatar" style="width:30px;height:30px;font-size:11px"></div>',
      '        <div>',
      '          <div class="orig-name" id="soName"></div>',
      '          <div class="rev-stars" id="soStars" style="margin-top:3px"></div>',
      '        </div>',
      '      </div>',
      '      <div class="orig-text" id="soText"></div>',
      '    </div>',
      '    <div class="tone-wrap">',
      '      <div class="tone-title">' + t('response_tone') + '</div>',
      '      <div class="tone-opts">',
      '        <div class="tone-opt selected" data-tone="professional">' + t('tone_professional') + '</div>',
      '        <div class="tone-opt" data-tone="warm">' + t('tone_warm') + '</div>',
      '        <div class="tone-opt" data-tone="formal">' + t('tone_formal') + '</div>',
      '        <div class="tone-opt" data-tone="casual">' + t('tone_casual') + '</div>',
      '      </div>',
      '    </div>',
      '    <div class="ai-gen-label">' + t('generated') + ' <span class="ai-badge">IA</span></div>',
      '    <div class="ai-thinking" id="aiThinking">',
      '      <div class="thinking-dot"></div>',
      '      <div class="thinking-dot"></div>',
      '      <div class="thinking-dot"></div>',
      '      <div class="thinking-txt">' + t('generating') + '</div>',
      '    </div>',
      '    <textarea class="ai-textarea" id="aiArea" rows="8"></textarea>',
      '    <div class="char-count" id="charCount">0 ' + t('chars') + '</div>',
      '  </div>',
      '  <div class="so-footer">',
      '    <button class="btn btn-ghost btn-lg" id="regenBtn">',
      '      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.37"/></svg>',
      '      ' + t('regenerate'),
      '    </button>',
      '    <button class="btn btn-soft btn-lg" id="editBtn">',
      '      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      '      ' + t('edit'),
      '    </button>',
      '    <button class="btn btn-primary btn-lg" id="publishBtn" style="flex:1">',
      '      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      '      ' + t('publish'),
      '    </button>',
      '  </div>',
      '</div>',

      // Toast
      '<div class="toast" id="toast">',
      '  <div class="toast-ico"><svg width="10" height="10" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>',
      '  <span id="toastMsg"></span>',
      '</div>'
    ].join('');
  }

  function loadJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.json();
    });
  }

  function registerRoutes() {
    var app = document.getElementById('app');

    Router.register('/', function () {
      Topnav.updateTitle();
      Sidebar.setActive();
      DashboardPage.render(app);
    });

    Router.register('/reviews', function () {
      Topnav.updateTitle();
      Sidebar.setActive();
      ReviewsPage.render(app);
    });

    Router.register('/analytics', function () {
      Topnav.updateTitle();
      Sidebar.setActive();
      AnalyticsPage.render(app);
    });

    Router.register('/settings', function () {
      Topnav.updateTitle();
      Sidebar.setActive();
      SettingsPage.render(app);
    });

    Router.register('/admin', function () {
      Topnav.updateTitle();
      Sidebar.setActive();
      if (window.AdminPage) AdminPage.render(app);
    });
  }

  function boot() {
    var urlParams = new URLSearchParams(window.location.search);

    // Invitation link — show signup page
    var inviteToken = urlParams.get('invite');
    if (inviteToken) {
      document.body.innerHTML = '<div id="app" style="min-height:100vh;background:var(--bg,#F4F5F9)"></div>';
      document.body.style.fontFamily = "'Inter', -apple-system, sans-serif";
      if (window.SignupPage) {
        SignupPage.render(document.getElementById('app'), inviteToken);
      }
      return;
    }

    // Handle JWT from OAuth redirect (?token=...)
    var inboundToken  = urlParams.get('token');
    if (inboundToken) {
      localStorage.setItem('sfai_jwt', inboundToken);
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }

    var jwt = localStorage.getItem('sfai_jwt');

    // Demo mode : explicitement activé via localStorage OU protocol file://
    // Sur localhost/127.0.0.1 avec npx serve, on est en mode API (backend sur :3001)
    var isFileProtocol = (window.location.protocol === 'file:');
    var demoForced = localStorage.getItem('sfai_demo') === 'true';
    var demoMode = demoForced || isFileProtocol;

    // Demo mode: no backend configured → load mock JSON directly
    if (!jwt && demoMode) {
      Promise.all([
        loadJSON('data/reviews.json'),
        loadJSON('data/settings.json')
      ]).then(function(results) {
        Store.init(results[0], results[1]);
        renderShell();
        Sidebar.render();
        Topnav.render();
        Sidebar.initMobile();
        Slideover.initEvents();
        registerRoutes();
        Router.init();
      }).catch(function(err) {
        document.body.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;flex-direction:column;gap:12px;color:#6B7280">' +
          '<strong style="color:#111827;font-size:16px">Erreur de chargement</strong>' +
          '<p style="font-size:13px">Lancez : <code style="background:#F3F4F6;padding:2px 8px;border-radius:4px">npx serve .</code></p>' +
          '</div>';
        console.error(err);
      });
      return;
    }

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

    // JWT présent → valider + charger depuis l'API
    Promise.all([
      API.get('/auth/me'),
      API.get('/api/reviews?pageSize=100'),
      API.get('/api/settings')
    ]).then(function(results) {
      var me       = results[0];
      var data     = results[1];
      var settings = results[2];

      if (!me || !me.id) {
        localStorage.removeItem('sfai_jwt');
        window.location.reload();
        return;
      }

      Store.init(data.reviews || [], settings);
      Store.set('me', me); // garde les infos du tenant (googleConnected, google_location_id)
      renderShell();
      Sidebar.render();
      Topnav.render();
      Sidebar.initMobile();
      Slideover.initEvents();
      registerRoutes();
      Router.init();
    }).catch(function(err) {
      document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;flex-direction:column;gap:12px;color:#6B7280">' +
        '<svg width="40" height="40" fill="none" stroke="#EF4444" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        '<strong style="color:#111827;font-size:16px">Impossible de charger les données</strong>' +
        '<p style="font-size:13px;text-align:center">Lancez un serveur local : <code style="background:#F3F4F6;padding:2px 8px;border-radius:4px">npx serve .</code></p>' +
        '</div>';
      console.error(err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('sfai:lang-changed', function() {
    // Re-render shell to update tone labels
    var soTitle = document.querySelector('#slideover .so-title');
    if (soTitle) soTitle.textContent = t('generate_response');
    var toneTitle = document.querySelector('#slideover .tone-title');
    if (toneTitle) toneTitle.textContent = t('response_tone');
    var toneOpts = document.querySelectorAll('#slideover .tone-opt');
    var toneKeys = ['tone_professional', 'tone_warm', 'tone_formal', 'tone_casual'];
    toneOpts.forEach(function(opt, i) { if (toneKeys[i]) opt.textContent = t(toneKeys[i]); });
    var genLabel = document.querySelector('#slideover .ai-gen-label');
    if (genLabel) genLabel.innerHTML = t('generated') + ' <span class="ai-badge">IA</span>';
    var thinkTxt = document.querySelector('#slideover .thinking-txt');
    if (thinkTxt) thinkTxt.textContent = t('generating');
    var regenBtn = document.getElementById('regenBtn');
    if (regenBtn) regenBtn.innerHTML = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.37"/></svg> ' + t('regenerate');
    var editBtn = document.getElementById('editBtn');
    if (editBtn) editBtn.innerHTML = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> ' + t('edit');
    var publishBtn = document.getElementById('publishBtn');
    if (publishBtn) publishBtn.innerHTML = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> ' + t('publish');
  });
})();
