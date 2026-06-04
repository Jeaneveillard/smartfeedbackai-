window.DashboardPage = (function () {

  /* ─── Security helper ─────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── Date helpers ────────────────────────────────────────────────────── */
  var MONTHS = {
    fr: ['jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'],
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  };

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    var lang = window.I18n ? I18n.getLang() : 'fr';
    var months = MONTHS[lang] || MONTHS.fr;
    if (lang === 'en') return months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
    return d.getUTCDate() + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  function isToday(iso) {
    var d = new Date(iso);
    var t = new Date();
    return d.getUTCFullYear() === t.getFullYear() &&
           d.getUTCMonth()    === t.getMonth()    &&
           d.getUTCDate()     === t.getDate();
  }

  /* ─── Stars HTML ──────────────────────────────────────────────────────── */
  function starsHtml(n) {
    var html = '';
    for (var i = 0; i < 5; i++) {
      html += '<span class="rs' + (i >= n ? ' off' : '') + '">★</span>';
    }
    return html;
  }

  /* ─── Source tag ──────────────────────────────────────────────────────── */
  function sourceClass(src) {
    var map = { google: 'src-google', tripadvisor: 'src-tripadvisor', yelp: 'src-yelp' };
    return map[src] || 'src-google';
  }

  /* ─── Build a single review card (safe) ──────────────────────────────── */
  function buildReviewCard(review, onPublish) {
    var card = document.createElement('div');
    card.className = 'review-card';

    var statusBadge = review.status === 'responded'
      ? '<span class="badge responded"><span class="badge-dot"></span>Répondu</span>'
      : '<span class="badge pending"><span class="badge-dot"></span>' + t('filter_pending') + '</span>';

    var actionsHtml = '';
    if (review.status === 'pending') {
      actionsHtml =
        '<button class="btn btn-primary js-ai-reply" data-id="' + esc(review.id) + '">' +
          '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
            '<path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.3 1 4.4 2.7 5.9L3 21l4.7-1.5c1.4.5 2.8.8 4.3.8 5.5 0 10-3.9 10-8.6S17.5 3 12 3z"/>' +
          '</svg>' +
          t('generate_ai') +
        '</button>';
    } else {
      actionsHtml = '<span class="btn btn-ghost" style="cursor:default;opacity:.6;font-size:12px;">✓ Répondu</span>';
    }

    card.innerHTML =
      '<div class="rc-top">' +
        '<div class="reviewer">' +
          '<div class="rev-avatar" style="background:' + esc(review.color) + '">' + esc(review.initials) + '</div>' +
          '<div>' +
            '<div class="rev-name">' + esc(review.author) + '</div>' +
            '<div class="rev-date">' + formatDate(review.date) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rc-right">' +
          '<div class="rev-stars">' + starsHtml(review.rating) + '</div>' +
          statusBadge +
        '</div>' +
      '</div>' +
      '<span class="source-tag ' + sourceClass(review.source) + '">' + esc(review.source) + '</span>' +
      '<div class="rev-text">' + esc(review.text) + '</div>' +
      '<div class="rev-actions">' + actionsHtml + '</div>';

    if (review.status === 'pending') {
      var btn = card.querySelector('.js-ai-reply');
      if (btn) {
        btn.addEventListener('click', function () {
          Slideover.open(review, onPublish);
        });
      }
    }

    return card;
  }

  /* ─── Rating breakdown bars (calculated from real data) ──────────────── */
  function buildBreakdown(reviews, container) {
    var counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(function (r) {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    var total = reviews.length || 1;
    var colors = { 5: '#10B981', 4: '#6EE7B7', 3: '#F59E0B', 2: '#FB923C', 1: '#EF4444' };

    var html = '<div class="breakdown-title">' + t('rating_breakdown') + '</div>';
    [5, 4, 3, 2, 1].forEach(function (star) {
      var pct = Math.round((counts[star] / total) * 100);
      html +=
        '<div class="br-row">' +
          '<div class="br-label">★ ' + star + '</div>' +
          '<div class="br-track">' +
            '<div class="br-fill" style="width:' + pct + '%;background:' + colors[star] + '"></div>' +
          '</div>' +
          '<div class="br-count">' + counts[star] + '</div>' +
        '</div>';
    });

    container.innerHTML = html;

    /* Animate bar widths after paint */
    var fills = container.querySelectorAll('.br-fill');
    fills.forEach(function (f) {
      var target = f.style.width;
      f.style.width = '0';
      setTimeout(function () { f.style.width = target; }, 60);
    });
  }

  /* ─── Sentiment trend SVG (static decorative paths) ─────────────────── */
  function sentimentSvg() {
    return (
      '<svg viewBox="0 0 276 120" preserveAspectRatio="none" style="width:100%;height:100%">' +
        '<defs>' +
          '<linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#4F46E5" stop-opacity=".18"/>' +
            '<stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>' +
          '</linearGradient>' +
          '<linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#10B981" stop-opacity=".14"/>' +
            '<stop offset="100%" stop-color="#10B981" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        /* Positive area */
        '<path d="M0 90 C30 80,55 40,90 35 S150 25,180 20 S240 18,276 15 L276 120 L0 120 Z" fill="url(#dg1)"/>' +
        '<path d="M0 90 C30 80,55 40,90 35 S150 25,180 20 S240 18,276 15" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/>' +
        /* Negative area */
        '<path d="M0 100 C30 98,55 95,90 90 S150 85,180 88 S240 92,276 95 L276 120 L0 120 Z" fill="url(#dg2)"/>' +
        '<path d="M0 100 C30 98,55 95,90 90 S150 85,180 88 S240 92,276 95" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  /* ─── Count-up animation ─────────────────────────────────────────────── */
  function animateCountUp(el, target, duration) {
    var frameDuration = 1000 / 60;
    var totalFrames = Math.round(duration / frameDuration);
    var frame = 0;

    var timer = setInterval(function () {
      frame++;
      var progress = frame / totalFrames;
      var current = Math.round(target * Math.min(progress, 1));
      el.textContent = current;
      if (frame >= totalFrames) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, frameDuration);
  }

  /* ─── Render filter tabs + review list ───────────────────────────────── */
  function renderReviewList(listEl, reviews, activeTab, onPublish) {
    listEl.innerHTML = '';

    var filtered;
    if (activeTab === 'all') {
      filtered = reviews;
    } else if (activeTab === 'pending') {
      filtered = reviews.filter(function (r) { return r.status === 'pending'; });
    } else if (activeTab === 'responded') {
      filtered = reviews.filter(function (r) { return r.status === 'responded'; });
    } else if (activeTab === 'five') {
      filtered = reviews.filter(function (r) { return r.rating === 5; });
    } else {
      filtered = reviews;
    }

    var shown = filtered.slice(0, 5);

    if (shown.length === 0) {
      var empty = document.createElement('div');
      empty.style.cssText = 'padding:40px 22px;text-align:center;color:var(--txt3);font-size:13px;';
      empty.textContent = t('no_reviews');
      listEl.appendChild(empty);
      return;
    }

    shown.forEach(function (review) {
      listEl.appendChild(buildReviewCard(review, onPublish));
    });
  }

  /* ─── Main render ─────────────────────────────────────────────────────── */
  function renderEmpty(container) {
    var lang = window.I18n ? I18n.getLang() : 'fr';
    container.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'min-height:60vh;text-align:center;padding:40px 20px;">' +
        '<div style="width:72px;height:72px;background:var(--primary-light);border-radius:20px;' +
        'display:flex;align-items:center;justify-content:center;margin-bottom:20px;">' +
          '<svg width="32" height="32" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24">' +
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
          '</svg>' +
        '</div>' +
        '<h2 style="font-size:20px;font-weight:800;color:var(--txt1);margin:0 0 8px;letter-spacing:-.4px;">' +
          (lang === 'en' ? 'No reviews yet' : 'Aucun avis pour le moment') +
        '</h2>' +
        '<p style="font-size:14px;color:var(--txt2);max-width:380px;line-height:1.6;margin:0 0 28px;">' +
          (lang === 'en'
            ? 'Connect your Google Business Profile in Settings to automatically sync your customer reviews.'
            : 'Connectez votre fiche Google Business dans les Paramètres pour synchroniser automatiquement vos avis clients.') +
        '</p>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">' +
          '<a href="#/settings" class="btn btn-primary">' +
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">' +
              '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>' +
            '</svg>' +
            (lang === 'en' ? 'Connect Google' : 'Connecter Google') +
          '</a>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--txt3);margin-top:20px;">' +
          (lang === 'en'
            ? '💡 The demo mode shows sample data. Log in with Google to see real reviews.'
            : '💡 Le mode démo affiche des données d\'exemple. Connectez-vous avec Google pour voir de vrais avis.') +
        '</p>' +
      '</div>';
  }

  function render(container) {
    var reviews = Store.get('reviews') || [];

    // Empty state — no reviews yet (real backend with no data)
    if (reviews.length === 0 && !localStorage.getItem('sfai_demo')) {
      renderEmpty(container);
      return;
    }

    /* ── Stats ── */
    var totalCount   = reviews.length;
    var pendingCount = reviews.filter(function (r) { return r.status === 'pending'; }).length;
    var avgRating    = totalCount
      ? (reviews.reduce(function (acc, r) { return acc + r.rating; }, 0) / totalCount)
      : 0;
    var avgRatingStr = avgRating.toFixed(1);
    var avgRatingNum = parseFloat(avgRatingStr);

    var todayPending = reviews.filter(function (r) { return r.status === 'pending' && isToday(r.date); }).length;

    var respondedCount = reviews.filter(function (r) { return r.status === 'responded'; }).length;
    var responseRate   = totalCount ? Math.round((respondedCount / totalCount) * 100) : 0;

    /* ── Urgent reviews (rating ≤ 2 + pending) ── */
    var urgentReviews = reviews.filter(function (r) { return r.rating <= 2 && r.status === 'pending'; });

    /* ── Recent reviews sorted by date ── */
    var sorted = reviews.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    /* ── Average stars display ── */
    function avgStarsHtml(avg) {
      var html = '';
      for (var i = 1; i <= 5; i++) {
        html += '<span class="star' + (i <= Math.round(avg) ? '' : ' off') + '">★</span>';
      }
      return html;
    }

    /* ── Build DOM ── */
    container.innerHTML = '';

    /* ── Urgent alert card ── */
    if (urgentReviews.length > 0) {
      var alertCard = document.createElement('div');
      alertCard.style.cssText =
        'background:#FEF2F2;border:1px solid #FECACA;border-radius:var(--r);' +
        'padding:16px 22px;margin-bottom:20px;animation:fadeUp .4s ease both;';

      var alertHeader = document.createElement('div');
      alertHeader.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;';
      alertHeader.innerHTML =
        '<span style="font-size:18px;">⚠️</span>' +
        '<span style="font-size:14px;font-weight:700;color:#B91C1C;">' +
          urgentReviews.length + ' ' + t('urgent_reviews') + ' — ' + (I18n.getLang() === 'en' ? 'response required' : 'réponse requise') +
        '</span>';
      alertCard.appendChild(alertHeader);

      urgentReviews.forEach(function (r) {
        var row = document.createElement('div');
        row.style.cssText =
          'display:flex;align-items:center;gap:10px;padding:8px 0;' +
          'border-top:1px solid #FECACA;';
        row.innerHTML =
          '<div class="rev-avatar" style="background:' + esc(r.color) + ';width:30px;height:30px;font-size:11px;">' +
            esc(r.initials) +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:13px;font-weight:600;color:#111827;">' + esc(r.author) + '</div>' +
            '<div style="font-size:12px;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
              esc(r.text.slice(0, 80)) + (r.text.length > 80 ? '…' : '') +
            '</div>' +
          '</div>' +
          '<div class="rev-stars">' + starsHtml(r.rating) + '</div>';

        var urgBtn = document.createElement('button');
        urgBtn.className = 'btn btn-danger';
        urgBtn.style.flexShrink = '0';
        urgBtn.textContent = 'Répondre';
        urgBtn.addEventListener('click', function () {
          Slideover.open(r, function () { render(container); });
        });
        row.appendChild(urgBtn);
        alertCard.appendChild(row);
      });

      container.appendChild(alertCard);
    }

    /* ── Page header ── */
    var header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML =
      '<div class="page-title">' + t('nav_dashboard') + '</div>' +
      '<div class="page-sub">' + t('sub_dashboard') + '</div>';
    container.appendChild(header);

    /* ── Summary cards ── */
    var cardsRow = document.createElement('div');
    cardsRow.className = 'cards-row';

    /* Card 1 — Total */
    var card1 = document.createElement('div');
    card1.className = 'summary-card';
    card1.innerHTML =
      '<div class="sc-top">' +
        '<span class="sc-label">' + t('total_reviews') + '</span>' +
        '<div class="sc-icon sc-icon-indigo">' +
          '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
            '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>' +
            '<circle cx="9" cy="7" r="4"/>' +
            '<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="sc-value" id="countTotal">0</div>' +
      '<div class="sc-note"><span class="pos-txt">+' + totalCount + '</span>&nbsp;' + t('collected') + '</div>';
    cardsRow.appendChild(card1);

    /* Card 2 — Average rating */
    var card2 = document.createElement('div');
    card2.className = 'summary-card';
    card2.innerHTML =
      '<div class="sc-top">' +
        '<span class="sc-label">' + t('avg_rating') + '</span>' +
        '<div class="sc-icon sc-icon-yellow">' +
          '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">' +
            '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="sc-value">' + avgRatingStr + '</div>' +
      '<div class="sc-stars">' + avgStarsHtml(avgRatingNum) + '</div>' +
      '<div class="sc-note">' + (I18n.getLang() === 'en' ? 'Out of 5 stars' : 'Sur 5 étoiles') + '</div>';
    cardsRow.appendChild(card2);

    /* Card 3 — Pending */
    var card3 = document.createElement('div');
    card3.className = 'summary-card';
    card3.innerHTML =
      '<div class="sc-top">' +
        '<span class="sc-label">' + t('pending_response') + '</span>' +
        '<div class="sc-icon sc-icon-orange">' +
          '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<polyline points="12 6 12 12 16 14"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="sc-value">' + pendingCount + '</div>' +
      '<div class="sc-note">' +
        '<span class="' + (todayPending > 0 ? 'warn-txt' : '') + '">' +
          todayPending + ' ' + t('reviews_today') +
        '</span>' +
      '</div>';
    cardsRow.appendChild(card3);

    container.appendChild(cardsRow);

    /* ── Count-up on total card ── */
    var countEl = card1.querySelector('#countTotal');
    if (countEl) {
      animateCountUp(countEl, totalCount, 1000);
    }

    /* ── Main grid ── */
    var mainGrid = document.createElement('div');
    mainGrid.className = 'main-grid';

    /* ─ Left: recent reviews section card ─ */
    var leftCard = document.createElement('div');
    leftCard.className = 'section-card';

    var sectionHd = document.createElement('div');
    sectionHd.className = 'section-hd';
    sectionHd.innerHTML =
      '<div class="section-title">' + t('recent_reviews') + '</div>' +
      '<span class="section-link" id="viewAllLink">' + t('see_all') + '</span>';
    leftCard.appendChild(sectionHd);

    /* Filter tabs */
    var filterRow = document.createElement('div');
    filterRow.className = 'filter-row';

    var tabs = [
      { key: 'all',       label: t('filter_all') },
      { key: 'pending',   label: t('filter_pending') },
      { key: 'responded', label: t('filter_responded') },
      { key: 'five',      label: t('filter_5stars') }
    ];

    var activeTab = 'all';
    var listEl = document.createElement('div');

    var onPublishCb = function () { render(container); };

    tabs.forEach(function (tab) {
      var btn = document.createElement('div');
      btn.className = 'f-tab' + (tab.key === activeTab ? ' active' : '');
      btn.textContent = tab.label;
      btn.addEventListener('click', function () {
        filterRow.querySelectorAll('.f-tab').forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        activeTab = tab.key;
        renderReviewList(listEl, sorted, activeTab, onPublishCb);
      });
      filterRow.appendChild(btn);
    });

    leftCard.appendChild(filterRow);
    leftCard.appendChild(listEl);
    renderReviewList(listEl, sorted, activeTab, onPublishCb);

    /* ─ Right column ─ */
    var rightCol = document.createElement('div');
    rightCol.className = 'right-col';

    /* Sentiment trend chart card */
    var chartCard = document.createElement('div');
    chartCard.className = 'section-card chart-wrap';
    chartCard.innerHTML =
      '<div class="section-hd" style="border-bottom:1px solid var(--border-faint);margin:-18px -22px 0;padding:14px 22px;">' +
        '<div class="section-title" style="font-size:13px;">' + t('sentiment_trend') + '</div>' +
      '</div>' +
      '<div class="chart-legend" style="margin-top:14px;">' +
        '<div class="legend-item"><div class="leg-dot" style="background:#4F46E5"></div>' + t('positive') + '</div>' +
        '<div class="legend-item"><div class="leg-dot" style="background:#10B981"></div>Neutre</div>' +
      '</div>' +
      '<div class="chart-svg-wrap">' + sentimentSvg() + '</div>';
    rightCol.appendChild(chartCard);

    /* Rating breakdown card */
    var breakdownCard = document.createElement('div');
    breakdownCard.className = 'section-card breakdown-wrap';
    rightCol.appendChild(breakdownCard);
    buildBreakdown(reviews, breakdownCard);

    /* Quick stats card */
    var qsCard = document.createElement('div');
    qsCard.className = 'section-card quick-stats';
    qsCard.innerHTML =
      '<div class="qs-item">' +
        '<div class="qs-label">' + t('response_rate') + '</div>' +
        '<div class="qs-value">' + responseRate + '%</div>' +
        '<div class="qs-sub">' + respondedCount + ' / ' + totalCount + ' avis</div>' +
      '</div>' +
      '<div class="qs-item">' +
        '<div class="qs-label">' + t('avg_delay') + '</div>' +
        '<div class="qs-value">3.2h</div>' +
        '<div class="qs-sub">Temps de réponse</div>' +
      '</div>';
    rightCol.appendChild(qsCard);

    mainGrid.appendChild(leftCard);
    mainGrid.appendChild(rightCol);
    container.appendChild(mainGrid);

    /* ── "Voir tous" link ── */
    var viewAllLink = container.querySelector('#viewAllLink');
    if (viewAllLink) {
      viewAllLink.addEventListener('click', function () {
        Router.navigate('/reviews');
      });
    }
  }

  document.addEventListener('sfai:lang-changed', function() {
    var app = document.getElementById('app');
    var hash = window.location.hash;
    if ((hash === '#/' || hash === '' || hash === '#') && app) {
      DashboardPage.render(app);
    }
  });

  return { render: render };

})();
