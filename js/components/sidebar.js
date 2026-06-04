const Sidebar = (() => {
  const NAV = [
    { hash: '#/', icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>', labelKey: 'nav_dashboard' },
    { hash: '#/reviews', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', labelKey: 'nav_reviews', badge: true },
    { hash: '#/analytics', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', labelKey: 'nav_analytics' },
    { hash: '#/settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>', labelKey: 'nav_settings' }
  ];

  const ADMIN_NAV = { hash: '#/admin', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', labelKey: 'nav_admin' };

  function svg(inner) {
    return '<svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' + inner + '</svg>';
  }

  function pendingCount() {
    const reviews = Store.get('reviews') || [];
    return reviews.filter(function(r) { return r.status === 'pending'; }).length;
  }

  function render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const settings = Store.get('settings') || {};
    const biz      = settings.business || {};
    const me       = Store.get('me') || {};
    const count    = pendingCount();

    function navLink(item) {
      var isActive = (window.location.hash === item.hash) || (window.location.hash === '' && item.hash === '#/');
      var badge    = (item.badge && count > 0) ? '<span class="nav-badge">' + count + '</span>' : '';
      var label    = item.labelKey ? t(item.labelKey) : (item.label || '');
      return '<a class="nav-item' + (isActive ? ' active' : '') + '" href="' + item.hash + '">' + svg(item.icon) + label + badge + '</a>';
    }

    var adminSection = me.isAdmin
      ? '<div class="nav-group-label" style="margin-top:8px;">Admin</div>' +
        navLink(ADMIN_NAV)
      : '';

    sidebar.innerHTML = [
      '<div class="logo-wrap">',
      '  <div class="logo-icon"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg></div>',
      '  <div class="logo-text"><div class="logo-name">SmartFeedback</div><div class="logo-tag">AI Platform</div></div>',
      '</div>',
      '<nav>',
      '<div class="nav-group-label">Principal</div>',
      NAV.map(navLink).join(''),
      adminSection,
      '</nav>',
      '<div class="sidebar-spacer"></div>',
      '<div class="sidebar-bottom">',
      '  <div class="biz-row">',
      '    <div class="biz-avatar">' + (me.username || biz.name || 'LB').split(' ').map(function(w){return w[0];}).join('').slice(0,2) + '</div>',
      '    <div style="overflow:hidden;flex:1"><div class="biz-name">' + escHtml(biz.name || 'Le Petit Bistro') + '</div><div class="biz-plan">' + t('nav_plan') + '</div></div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function setActive() {
    document.querySelectorAll('.nav-item').forEach(function(el) {
      var href = el.getAttribute('href') || '';
      var hash = window.location.hash || '#/';
      el.classList.toggle('active', href === hash || (hash === '' && href === '#/'));
    });
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      var countEl = sidebar.querySelector('.nav-badge');
      var count = pendingCount();
      if (countEl) countEl.textContent = count;
    }
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function initMobile() {
    var ham = document.getElementById('hamburger');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('mob-open');
      if (overlay) overlay.style.display = 'block';
    }
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('mob-open');
      if (overlay) overlay.style.display = 'none';
    }

    if (ham) {
      ham.addEventListener('click', function() {
        if (sidebar && sidebar.classList.contains('mob-open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }
    window.addEventListener('hashchange', function() {
      closeSidebar();
      setActive();
    });
  }

  // Re-render sidebar labels when language changes
  document.addEventListener('sfai:lang-changed', function() {
    render();
  });

  return { render, setActive, initMobile };
})();

window.Sidebar = Sidebar;
