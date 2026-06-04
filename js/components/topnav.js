const Topnav = (() => {
  const PAGE_META = {
    '/':          { title: null, subKey: 'sub_dashboard' },
    '/reviews':   { title: null, subKey: 'sub_reviews' },
    '/analytics': { title: null, subKey: 'sub_analytics' },
    '/settings':  { title: null, subKey: 'sub_settings' }
  };

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function currentPath() {
    return window.location.hash.replace('#', '') || '/';
  }

  function render() {
    const topnav = document.getElementById('topnav');
    if (!topnav) return;
    const meta = PAGE_META[currentPath()] || PAGE_META['/'];
    const settings = Store.get('settings') || {};
    const biz = settings.business || {};
    const me = Store.get('me') || {};
    const bizName = biz.name || 'Le Petit Bistro';
    const displayName = me.username || bizName;
    const initials = displayName.split(' ').map(function(w){return w[0];}).join('').slice(0,2);
    const subText = meta.subKey ? t(meta.subKey) : '';

    topnav.innerHTML = [
      '<div class="topnav-left">',
      '  <button class="hamburger" id="hamburger" aria-label="Menu">',
      '    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
      '  </button>',
      '  <div>',
      '    <div class="topnav-title">' + escHtml(displayName) + '</div>',
      '    <div class="topnav-subtitle"><span class="pulse-dot"></span>' + escHtml(subText) + '</div>',
      '  </div>',
      '</div>',
      '<div class="topnav-right">',
      '  <div class="lang-toggle" id="langToggle">',
      '    <span class="lang-opt" data-lang="fr">FR</span>',
      '    <span class="lang-opt" data-lang="en">EN</span>',
      '  </div>',
      '  <div class="search-box">',
      '    <svg width="13" height="13" fill="none" stroke="#9CA3AF" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      '    <input class="search-input" id="globalSearch" type="text" placeholder="' + escHtml(t('search_placeholder')) + '" autocomplete="off">',
      '  </div>',
      '  <button class="icon-btn" id="notifBtn" title="Notifications">',
      '    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      '    <span class="notif-dot"></span>',
      '  </button>',
      '  <div style="position:relative" id="profileWrap">',
      '    <div class="profile-pill" id="profilePill" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">',
      '      <div class="profile-avatar">' + escHtml(initials) + '</div>',
      '      <span class="profile-name">' + escHtml(displayName) + '</span>',
      '      <svg width="13" height="13" fill="none" stroke="#9CA3AF" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
      '    </div>',
      '    <div class="dropdown" id="profileDD" role="menu">',
      '      <div class="dd-header"><div class="dd-biz">' + escHtml(displayName) + '</div><div class="dd-email">' + escHtml(me.username ? '@' + me.username : bizName) + '</div></div>',
      '      <a class="dd-item" href="#/settings"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>' + t('nav_settings') + '</a>',
      '      <div class="dd-divider"></div>',
      '      <div class="dd-item danger" id="logoutBtn"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' + (I18n.getLang() === 'en' ? 'Sign out' : 'Se déconnecter') + '</div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    // Profile dropdown toggle
    var pill = document.getElementById('profilePill');
    var dd = document.getElementById('profileDD');
    if (pill && dd) {
      pill.addEventListener('click', function() {
        var open = dd.classList.toggle('open');
        pill.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function(e) {
        var wrap = document.getElementById('profileWrap');
        if (wrap && !wrap.contains(e.target)) {
          dd.classList.remove('open');
          pill.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dd.classList.contains('open')) {
          dd.classList.remove('open');
          pill.setAttribute('aria-expanded', 'false');
          pill.focus();
        }
      });
    }

    // Logout button
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('sfai_jwt');
        localStorage.removeItem('sfai_demo');
        window.location.reload();
      });
    }

    // Lang toggle
    var langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.querySelectorAll('.lang-opt').forEach(function(opt) {
        opt.classList.toggle('active', opt.dataset.lang === I18n.getLang());
        opt.addEventListener('click', function() {
          I18n.setLang(opt.dataset.lang);
        });
      });
    }

    // Search: clic sur l'icône → focus input
    var searchBox = document.querySelector('.search-box');
    var search    = document.getElementById('globalSearch');
    if (searchBox && search) {
      searchBox.addEventListener('click', function(e) {
        if (e.target !== search) search.focus();
      });
    }

    if (search) {
      // Live filter quand on est déjà sur la page Reviews
      search.addEventListener('input', function() {
        if (currentPath() === '/reviews') {
          document.dispatchEvent(new CustomEvent('sfai:search', { detail: { query: search.value } }));
        }
      });

      // Enter depuis n'importe quelle page → aller sur Reviews avec la requête
      search.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        var q = search.value.trim();
        if (!q) return;
        if (currentPath() === '/reviews') {
          document.dispatchEvent(new CustomEvent('sfai:search', { detail: { query: q } }));
        } else {
          window._sfaiPendingSearch = q;
          Router.navigate('/reviews');
        }
      });
    }
  }

  function updateTitle() {
    var meta = PAGE_META[currentPath()] || PAGE_META['/'];
    var titleEl = document.querySelector('.topnav-title');
    var subEl = document.querySelector('.topnav-subtitle');
    var _me = Store.get('me') || {};
    var _bizName = (Store.get('settings') || {}).business && (Store.get('settings') || {}).business.name || 'Le Petit Bistro';
    if (titleEl) titleEl.textContent = _me.username || _bizName;
    if (subEl) subEl.innerHTML = '<span class="pulse-dot"></span>' + (meta.subKey ? t(meta.subKey) : '');
    var search = document.getElementById('globalSearch');
    if (search) search.value = '';
  }

  // Re-render on language change
  document.addEventListener('sfai:lang-changed', function() {
    render();
    if (window.Router) Router.init && Router.init();
  });

  return { render, updateTitle };
})();

window.Topnav = Topnav;
