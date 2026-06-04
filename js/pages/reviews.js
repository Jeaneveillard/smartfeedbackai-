window.ReviewsPage = (function () {

  /* ─── Closure state (persists across filter/page changes) ───────────── */
  var currentPage    = 1;
  var currentSearch  = '';
  var currentSource  = 'all';
  var currentRating  = 'all';
  var currentStatus  = 'all';

  var PAGE_SIZE = 10;

  /* ─── Security helper ────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── Date helpers ───────────────────────────────────────────────────── */
  var MONTHS = {
    fr: ['jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'],
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  };

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    var lang = window.I18n ? I18n.getLang() : 'fr';
    var months = MONTHS[lang] || MONTHS.fr;
    if (lang === 'en') {
      return months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
    }
    return d.getUTCDate() + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  /* ─── Stars HTML ─────────────────────────────────────────────────────── */
  function starsHtml(n) {
    var html = '';
    for (var i = 0; i < 5; i++) {
      html += '<span class="rs' + (i >= n ? ' off' : '') + '">★</span>';
    }
    return html;
  }

  /* ─── Source CSS class ───────────────────────────────────────────────── */
  function sourceClass(src) {
    var map = { google: 'src-google', tripadvisor: 'src-tripadvisor', yelp: 'src-yelp' };
    return map[src] || 'src-google';
  }

  /* ─── Filter logic ───────────────────────────────────────────────────── */
  function applyFilters(reviews) {
    var q = currentSearch.toLowerCase().trim();
    return reviews.filter(function (r) {
      if (currentSource !== 'all' && r.source !== currentSource) return false;
      if (currentRating !== 'all' && r.rating !== parseInt(currentRating, 10)) return false;
      if (currentStatus !== 'all' && r.status !== currentStatus) return false;
      if (q && r.author.toLowerCase().indexOf(q) === -1 &&
               r.text.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  /* ─── Build a single review card (safe) ─────────────────────────────── */
  function buildReviewCard(review, listContainer) {
    var card = document.createElement('div');
    card.className = 'review-card';

    var statusBadge = review.status === 'responded'
      ? '<span class="badge responded"><span class="badge-dot"></span>' + t('status_responded') + '</span>'
      : '<span class="badge pending"><span class="badge-dot"></span>' + t('status_pending') + '</span>';

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
      actionsHtml =
        '<span class="btn btn-ghost" style="cursor:default;opacity:.6;font-size:12px;">✓ ' + t('status_responded') + '</span>';
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
          Slideover.open(review, function () {
            /* After publish, re-render list in place */
            renderList(listContainer);
          });
        });
      }
    }

    return card;
  }

  /* ─── Inner renderList — updates list without rebuilding toolbar ─────── */
  function renderList(listContainer) {
    listContainer.innerHTML = '';

    var reviews  = Store.get('reviews') || [];
    var filtered = applyFilters(reviews);
    var total    = filtered.length;
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    /* Clamp page */
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    /* Results count */
    var countEl = document.getElementById('sfai-results-count');
    if (countEl) {
      countEl.textContent = total + ' ' + t('reviews_found');
    }

    /* Slice for current page */
    var start   = (currentPage - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(start, start + PAGE_SIZE);

    /* Empty state */
    if (pageItems.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.innerHTML =
        '<svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' +
          '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>' +
        '</svg>' +
        '<p>' + t('no_results') + '</p>';
      listContainer.appendChild(empty);
      renderPagination(listContainer, 0, 1, 1);
      return;
    }

    /* Review cards */
    pageItems.forEach(function (review) {
      listContainer.appendChild(buildReviewCard(review, listContainer));
    });

    /* Pagination */
    renderPagination(listContainer, total, currentPage, totalPages);
  }

  /* ─── Pagination bar ─────────────────────────────────────────────────── */
  function renderPagination(listContainer, total, page, totalPages) {
    if (total === 0) return;

    var pag = document.createElement('div');
    pag.className = 'pagination';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.disabled  = page <= 1;
    prevBtn.innerHTML = t('prev_page');
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) { currentPage--; renderList(listContainer); }
    });

    var info = document.createElement('span');
    info.className   = 'pagination-info';
    info.textContent = t('page_of') + ' ' + page + ' / ' + totalPages;

    var nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.disabled  = page >= totalPages;
    nextBtn.innerHTML = t('next_page');
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) { currentPage++; renderList(listContainer); }
    });

    pag.appendChild(prevBtn);
    pag.appendChild(info);
    pag.appendChild(nextBtn);
    listContainer.appendChild(pag);
  }

  /* ─── CSV helpers ───────────────────────────────────────────────────── */
  // Prefix formula-injection triggers so Excel/Sheets won't evaluate them
  var FORMULA_CHARS = /^[=+\-@\t\r]/;
  function csvCell(val) {
    var s = String(val == null ? '' : val);
    if (FORMULA_CHARS.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  /* ─── CSV export ─────────────────────────────────────────────────────── */
  function exportCsv() {
    var reviews  = Store.get('reviews') || [];
    var filtered = applyFilters(reviews);

    var rows = ['"id","author","rating","source","date","status","text"'];
    filtered.forEach(function (r) {
      rows.push([
        csvCell(r.id),
        csvCell(r.author),
        csvCell(r.rating),
        csvCell(r.source),
        csvCell(r.date),
        csvCell(r.status),
        csvCell(r.text)
      ].join(','));
    });

    var csv  = rows.join('\r\n');
    var uri  = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    var link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'avis-smartfeedbackai.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.show(t('csv_exported') + ' (' + filtered.length + ' ' + t('reviews_count') + ')', 'success');
  }

  /* ─── Main render ────────────────────────────────────────────────────── */
  function render(container) {
    /* Pick up pending search from topnav Enter navigation */
    var pendingSearch = window._sfaiPendingSearch || '';
    if (pendingSearch) { delete window._sfaiPendingSearch; }

    currentPage   = 1;
    currentSearch = pendingSearch;
    currentSource = 'all';
    currentRating = 'all';
    currentStatus = 'all';

    container.innerHTML = '';

    /* ── Page header ── */
    var header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML =
      '<div class="page-title">' + t('all_reviews') + '</div>' +
      '<div class="page-sub">' + t('sub_manage') + '</div>';
    container.appendChild(header);

    /* ── Toolbar ── */
    var toolbar = document.createElement('div');
    toolbar.className = 'reviews-toolbar';

    /* Search */
    var searchWrap = document.createElement('div');
    searchWrap.className = 'search-box reviews-search-wrap';
    searchWrap.innerHTML =
      '<svg width="14" height="14" fill="none" stroke="var(--txt3)" stroke-width="2" viewBox="0 0 24 24">' +
        '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>' +
      '</svg>' +
      '<input type="text" class="search-input" id="sfai-search-input" placeholder="' + esc(t('search_placeholder')) + '" autocomplete="off">';

    /* Filters group */
    var filtersGroup = document.createElement('div');
    filtersGroup.className = 'reviews-filters';

    var sourceSelect = document.createElement('select');
    sourceSelect.className = 'filter-select';
    sourceSelect.id = 'sfai-source-filter';
    [['all', t('all_sources')], ['google','Google'], ['tripadvisor','TripAdvisor'], ['yelp','Yelp']].forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      sourceSelect.appendChild(o);
    });

    var ratingSelect = document.createElement('select');
    ratingSelect.className = 'filter-select';
    ratingSelect.id = 'sfai-rating-filter';
    [['all', t('all_ratings')], ['5','5 ★'], ['4','4 ★'], ['3','3 ★'], ['2','2 ★'], ['1','1 ★']].forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      ratingSelect.appendChild(o);
    });

    var statusSelect = document.createElement('select');
    statusSelect.className = 'filter-select';
    statusSelect.id = 'sfai-status-filter';
    [['all', t('all_statuses')], ['pending', t('status_pending')], ['responded', t('status_responded')]].forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      statusSelect.appendChild(o);
    });

    var exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-ghost';
    exportBtn.innerHTML =
      '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
        '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>' +
        '<polyline points="7 10 12 15 17 10"/>' +
        '<line x1="12" y1="15" x2="12" y2="3"/>' +
      '</svg>' +
      t('export_csv');

    filtersGroup.appendChild(sourceSelect);
    filtersGroup.appendChild(ratingSelect);
    filtersGroup.appendChild(statusSelect);
    filtersGroup.appendChild(exportBtn);

    toolbar.appendChild(searchWrap);
    toolbar.appendChild(filtersGroup);
    container.appendChild(toolbar);

    /* ── Results count ── */
    var resultsCount = document.createElement('div');
    resultsCount.id = 'sfai-results-count';
    resultsCount.style.cssText = 'font-size:13px;color:var(--txt2);font-weight:500;margin-bottom:14px;';
    container.appendChild(resultsCount);

    /* ── List container (re-rendered on filter change) ── */
    var listContainer = document.createElement('div');
    listContainer.id = 'sfai-list';
    container.appendChild(listContainer);

    /* Initial render */
    renderList(listContainer);

    /* ── Event: search input ── */
    var searchInput = container.querySelector('#sfai-search-input');
    if (searchInput) {
      /* Pre-fill if navigated from another page via Enter */
      if (pendingSearch) {
        searchInput.value = pendingSearch;
        /* Also sync topnav input */
        var globalSearch = document.getElementById('globalSearch');
        if (globalSearch) globalSearch.value = pendingSearch;
      }
      searchInput.addEventListener('input', function () {
        currentSearch = searchInput.value;
        currentPage = 1;
        renderList(listContainer);
      });
    }

    /* ── Event: source filter ── */
    sourceSelect.addEventListener('change', function () {
      currentSource = sourceSelect.value;
      currentPage = 1;
      renderList(listContainer);
    });

    /* ── Event: rating filter ── */
    ratingSelect.addEventListener('change', function () {
      currentRating = ratingSelect.value;
      currentPage = 1;
      renderList(listContainer);
    });

    /* ── Event: status filter ── */
    statusSelect.addEventListener('change', function () {
      currentStatus = statusSelect.value;
      currentPage = 1;
      renderList(listContainer);
    });

    /* ── Event: export CSV ── */
    exportBtn.addEventListener('click', exportCsv);

    /* ── Event: sfai:search (dispatched by topnav) ── */
    document.addEventListener('sfai:search', function handler(e) {
      /* Remove this listener if the page is no longer rendered */
      if (!document.contains(listContainer)) {
        document.removeEventListener('sfai:search', handler);
        return;
      }
      var term = (e.detail && e.detail.query) ? e.detail.query : '';
      currentSearch = term;
      currentPage = 1;
      if (searchInput) searchInput.value = term;
      renderList(listContainer);
    });
  }

  document.addEventListener('sfai:lang-changed', function() {
    var app = document.getElementById('app');
    if (window.location.hash === '#/reviews' && app) {
      ReviewsPage.render(app);
    }
  });

  return { render: render };

})();
