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

    // Notifications panel
    var notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var existing = document.getElementById('notifPanel');
        if (existing) { existing.remove(); return; }

        var reviews  = Store.get('reviews') || [];
        var pending  = reviews.filter(function(r) { return r.status === 'pending' || r.status === 'new'; })
                              .slice(0, 8);
        var lang     = I18n.getLang();
        var fr       = lang !== 'en';

        var items = pending.length
          ? pending.map(function(r) {
              var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
              return '<div class="notif-item" data-id="' + r.id + '" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid #F3F4F6;transition:background .15s;" ' +
                'onmouseover="this.style.background=\'#F9FAFB\'" onmouseout="this.style.background=\'#fff\'">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
                  '<div style="font-size:12.5px;font-weight:600;color:#111827;">' + escHtml(r.author) + '</div>' +
                  '<div style="font-size:10px;color:#F59E0B;white-space:nowrap;">' + stars + '</div>' +
                '</div>' +
                '<div style="font-size:11.5px;color:#6B7280;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">' +
                  escHtml(r.text ? r.text.slice(0, 60) + (r.text.length > 60 ? '…' : '') : '') +
                '</div>' +
              '</div>';
            }).join('')
          : '<div style="padding:24px;text-align:center;font-size:13px;color:#6B7280;">' +
              (fr ? '✓ Tous les avis ont une réponse' : '✓ All reviews have been answered') +
            '</div>';

        var panel = document.createElement('div');
        panel.id = 'notifPanel';
        panel.style.cssText = 'position:absolute;top:calc(100% + 8px);right:0;width:280px;background:#fff;' +
          'border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12);z-index:500;overflow:hidden;';
        panel.innerHTML =
          '<div style="padding:12px 14px;border-bottom:1px solid #F3F4F6;display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="font-size:13px;font-weight:700;color:#111827;">' + (fr ? 'Avis sans réponse' : 'Unanswered reviews') + '</span>' +
            (pending.length ? '<span style="background:#EF4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;">' + pending.length + '</span>' : '') +
          '</div>' +
          items +
          (pending.length ? '<div style="padding:10px 14px;border-top:1px solid #F3F4F6;">' +
            '<a href="#/reviews" onclick="document.getElementById(\'notifPanel\').remove();" ' +
            'style="font-size:12px;color:#4F46E5;text-decoration:none;font-weight:600;">' +
            (fr ? 'Voir tous les avis →' : 'View all reviews →') + '</a></div>' : '');

        // Position relative to notifBtn
        notifBtn.style.position = 'relative';
        notifBtn.appendChild(panel);

        // Click on review item → open slideover
        panel.querySelectorAll('.notif-item').forEach(function(item) {
          item.addEventListener('click', function() {
            panel.remove();
            var id = item.getAttribute('data-id');
            var rev = (Store.get('reviews') || []).find(function(r) { return r.id === id || r.id == id; });
            if (rev && window.Slideover) {
              if (window.location.hash !== '#/reviews') Router.navigate('/reviews');
              setTimeout(function() { Slideover.open(rev, null); }, 100);
            }
          });
        });

        // Close on outside click
        setTimeout(function() {
          document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target) && e.target !== notifBtn) {
              panel.remove();
              document.removeEventListener('click', closePanel);
            }
          });
        }, 0);
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
