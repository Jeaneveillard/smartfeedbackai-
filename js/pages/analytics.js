(function () {
  'use strict';

  /* ── Security helper ─────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Stopwords ───────────────────────────────── */
  var STOPWORDS = {
    le:1, la:1, les:1, de:1, du:1, des:1, un:1, une:1, et:1, est:1,
    pas:1, nous:1, pour:1, avec:1, mais:1, que:1, qui:1, se:1, au:1,
    aux:1, en:1, sur:1, par:1, dans:1, the:1, a:1, an:1, ce:1, cette:1,
    il:1, elle:1, ils:1, elles:1, je:1, tu:1, on:1, y:1, me:1, te:1,
    lui:1, leur:1, leurs:1, son:1, sa:1, ses:1, mon:1, ma:1, mes:1,
    ton:1, ta:1, tes:1, ou:1, si:1, ne:1, plus:1, tout:1, bien:1,
    très:1, aussi:1, car:1, dont:1, où:1, nos:1, vos:1, votre:1, notre:1
  };

  /* ── Month labels ────────────────────────────── */
  var MONTH_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  /* ── Star renderer ───────────────────────────── */
  function renderStars(avg) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<span style="color:' + (i <= Math.round(avg) ? '#F59E0B' : '#D1D5DB') + ';font-size:14px;">★</span>';
    }
    return html;
  }

  /* ── Metrics calculator ──────────────────────── */
  function calcMetrics(reviews) {
    var total = reviews.length;

    if (total === 0) {
      return {
        totalReviews: 0,
        avgRating: 0,
        responseRate: 0,
        respondedCount: 0,
        npsScore: 0,
        positiveSentiment: 0,
        ratingByMonth: [],
        bySource:             { google: 0, tripadvisor: 0, yelp: 0 },
        sourceCounts:         { google: 0, tripadvisor: 0, yelp: 0 },
        topKeywords: [],
        topPositiveWord: null,
        negPending: 0,
        responseRateBySource: { google: 0, tripadvisor: 0, yelp: 0 }
      };
    }

    /* Basic counts */
    var ratingSum      = 0;
    var respondedCount = 0;
    var promoters      = 0;
    var detractors     = 0;
    var positiveCount  = 0;
    var sourceCounts   = { google: 0, tripadvisor: 0, yelp: 0 };
    var sourceResponded= { google: 0, tripadvisor: 0, yelp: 0 };
    var wordMap        = {};
    var positiveWords  = {};

    reviews.forEach(function (r) {
      var rating = Number(r.rating) || 0;
      ratingSum += rating;

      if (r.status === 'responded') {
        respondedCount++;
        if (sourceCounts[r.source] !== undefined) sourceResponded[r.source]++;
      }

      if (rating >= 5) { promoters++; }
      if (rating <= 2) { detractors++; }
      if (rating >= 4) { positiveCount++; }

      if (sourceCounts[r.source] !== undefined) sourceCounts[r.source]++;

      /* Word extraction */
      if (r.text) {
        var words = r.text
          .toLowerCase()
          .replace(/[^a-zàâäéèêëïîôùûüçœæ\s]/gi, ' ')
          .split(/\s+/);
        words.forEach(function (w) {
          if (w.length < 3) return;
          if (STOPWORDS[w]) return;
          wordMap[w] = (wordMap[w] || 0) + 1;
          if (rating >= 5) {
            positiveWords[w] = (positiveWords[w] || 0) + 1;
          }
        });
      }
    });

    var avgRating      = Math.round((ratingSum / total) * 10) / 10;
    var responseRate   = Math.round((respondedCount / total) * 100);
    var npsScore       = Math.round(((promoters - detractors) / total) * 100);
    var positiveSentiment = Math.round((positiveCount / total) * 100);

    /* Source percentages */
    var bySource = {};
    ['google', 'tripadvisor', 'yelp'].forEach(function (src) {
      bySource[src] = total > 0 ? Math.round((sourceCounts[src] / total) * 100) : 0;
    });

    /* Response rate by source */
    var responseRateBySource = {};
    ['google', 'tripadvisor', 'yelp'].forEach(function (src) {
      responseRateBySource[src] = sourceCounts[src] > 0
        ? Math.round((sourceResponded[src] / sourceCounts[src]) * 100)
        : 0;
    });

    /* Rating by month — last 6 months */
    var now = new Date();
    var months = [];
    for (var m = 5; m >= 0; m--) {
      var d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_SHORT[d.getMonth()], sum: 0, count: 0 });
    }
    reviews.forEach(function (r) {
      var d = new Date(r.date);
      if (isNaN(d.getTime())) return;
      months.forEach(function (bucket) {
        if (d.getFullYear() === bucket.year && d.getMonth() === bucket.month) {
          bucket.sum   += Number(r.rating) || 0;
          bucket.count += 1;
        }
      });
    });
    var ratingByMonth = months.map(function (b) {
      return { label: b.label, avg: b.count > 0 ? Math.round((b.sum / b.count) * 10) / 10 : null };
    });

    /* Top keywords (top 8) */
    var wordEntries = Object.keys(wordMap).map(function (w) {
      return { word: w, count: wordMap[w] };
    });
    wordEntries.sort(function (a, b) { return b.count - a.count; });
    var topKeywords = wordEntries.slice(0, 8);

    /* Top positive keyword */
    var posEntries = Object.keys(positiveWords).map(function (w) {
      return { word: w, count: positiveWords[w] };
    });
    posEntries.sort(function (a, b) { return b.count - a.count; });
    var topPositiveWord = posEntries.length > 0 ? posEntries[0] : null;

    return {
      totalReviews: total,
      avgRating: avgRating,
      responseRate: responseRate,
      npsScore: npsScore,
      positiveSentiment: positiveSentiment,
      ratingByMonth: ratingByMonth,
      bySource: bySource,
      sourceCounts: sourceCounts,
      topKeywords: topKeywords,
      topPositiveWord: topPositiveWord,
      responseRateBySource: responseRateBySource,
      respondedCount: respondedCount,
      // For insights
      negPending: reviews.filter(function (r) { return r.rating <= 2 && r.status === 'pending'; }).length
    };
  }

  /* ── SVG bar chart ───────────────────────────── */
  function renderBarChart(ratingByMonth) {
    var W = 320, H = 140, barW = 32, gap = 12;
    var totalBars = ratingByMonth.length;
    var chartW    = totalBars * (barW + gap) - gap;
    var startX    = Math.round((W - chartW) / 2);
    var maxH      = 100;

    function barColor(avg) {
      if (avg === null) return '#E5E7EB';
      if (avg >= 4.5)  return '#10B981';
      if (avg >= 3.5)  return '#F97316';
      return '#EF4444';
    }

    var bars = ratingByMonth.map(function (item, i) {
      var x    = startX + i * (barW + gap);
      var pct  = item.avg !== null ? item.avg / 5 : 0;
      var h    = Math.max(4, Math.round(pct * maxH));
      var y    = (H - 24) - h;               // 24px for labels
      var fill = barColor(item.avg);
      var label = item.avg !== null ? esc(String(item.avg)) : '';
      return (
        '<g>' +
          '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" rx="4" fill="' + fill + '" opacity="0.9"/>' +
          (item.avg !== null ? '<text x="' + (x + barW / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="9" fill="#6B7280">' + label + '</text>' : '') +
          '<text x="' + (x + barW / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="9" fill="#9CA3AF">' + esc(item.label) + '</text>' +
        '</g>'
      );
    }).join('');

    return (
      '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;margin:0 auto">' +
        bars +
      '</svg>'
    );
  }

  /* ── Horizontal source bars ──────────────────── */
  function renderSourceBars(bySource, sourceCounts) {
    var sources = [
      { key: 'google',      label: 'Google',      color: '#4F46E5' },
      { key: 'tripadvisor', label: 'TripAdvisor',  color: '#10B981' },
      { key: 'yelp',        label: 'Yelp',         color: '#EF4444' }
    ];

    return sources.map(function (s) {
      var pct   = bySource[s.key] || 0;
      var count = sourceCounts[s.key] || 0;
      return (
        '<div style="margin-bottom:18px;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
            '<span style="font-size:13px;font-weight:600;color:var(--txt1)">' + esc(s.label) + '</span>' +
            '<span style="font-size:12px;color:var(--txt2)">' + esc(String(count)) + ' ' + t('reviews_count') + ' (' + esc(String(pct)) + '%)</span>' +
          '</div>' +
          '<div style="height:10px;background:var(--border-faint);border-radius:8px;overflow:hidden;">' +
            '<div style="height:100%;width:' + esc(String(pct)) + '%;background:' + s.color + ';border-radius:8px;transition:width .6s ease;"></div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  /* ── Keyword tags ────────────────────────────── */
  function renderKeywords(topKeywords) {
    if (topKeywords.length === 0) {
      return '<p style="color:var(--txt3);font-size:13px;">' + t('no_data') + '</p>';
    }

    var maxCount = topKeywords[0].count;
    var minCount = topKeywords[topKeywords.length - 1].count;
    var minPx = 12, maxPx = 22;

    return topKeywords.map(function (kw) {
      var range  = maxCount > minCount ? maxCount - minCount : 1;
      var norm   = (kw.count - minCount) / range;
      var fsize  = Math.round(minPx + norm * (maxPx - minPx));
      return (
        '<span class="keyword-tag" style="font-size:' + fsize + 'px;" title="' + esc(String(kw.count)) + ' occurrences">' +
          esc(kw.word) +
        '</span>'
      );
    }).join('');
  }

  /* ── AI Insights ─────────────────────────────── */
  function renderInsights(m) {
    var items = [];
    var isEn = (window.I18n && window.I18n.getLang() === 'en');

    /* Insight 1: response rate */
    if (m.responseRate > 80) {
      items.push({
        icon: '✅',
        cls: 'green',
        text: isEn
          ? 'Your response rate of ' + m.responseRate + '% is excellent — keep it up!'
          : 'Votre taux de réponse de ' + m.responseRate + '% est excellent — continuez ainsi !'
      });
    } else if (m.responseRate > 0) {
      items.push({
        icon: '💬',
        cls: 'indigo',
        text: isEn
          ? 'Response rate of ' + m.responseRate + '% — increase it to strengthen your e-reputation.'
          : 'Taux de réponse de ' + m.responseRate + '% — augmentez-le pour renforcer votre e-réputation.'
      });
    }

    /* Insight 2: top positive keyword */
    if (m.topPositiveWord && m.totalReviews > 0) {
      var positiveFiveCount = 0;
      var reviews = window.Store ? (window.Store.get('reviews') || []) : [];
      reviews.forEach(function (r) {
        if (r.rating >= 5) positiveFiveCount++;
      });
      var pct5 = positiveFiveCount > 0
        ? Math.round((m.topPositiveWord.count / positiveFiveCount) * 100)
        : 0;
      items.push({
        icon: '⭐',
        cls: 'yellow',
        text: isEn
          ? 'The word "' + esc(m.topPositiveWord.word) + '" appears in ' + pct5 + '% of your positive reviews'
          : 'Le mot « ' + esc(m.topPositiveWord.word) + ' » apparaît dans ' + pct5 + '% de vos avis positifs'
      });
    }

    /* Insight 3: negative pending */
    if (m.negPending > 0) {
      items.push({
        icon: '⚠️',
        cls: 'yellow',
        text: isEn
          ? m.negPending + ' negative review' + (m.negPending > 1 ? 's' : '') + ' without a response — a quick reply limits the impact'
          : m.negPending + ' avis négatif' + (m.negPending > 1 ? 's' : '') + ' sans réponse — une réponse rapide limite l\'impact'
      });
    } else {
      items.push({
        icon: '🎉',
        cls: 'green',
        text: isEn
          ? 'No negative reviews without a response — great management!'
          : 'Aucun avis négatif sans réponse — bonne gestion !'
      });
    }

    return items.map(function (item) {
      return (
        '<div class="insight-item ' + item.cls + '">' +
          '<span class="insight-icon" style="font-size:18px;line-height:1;">' + item.icon + '</span>' +
          '<span class="insight-text">' + esc(item.text) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  /* ── NPS color ───────────────────────────────── */
  function npsColor(score) {
    if (score > 50)  return '#10B981';
    if (score >= 0)  return '#F97316';
    return '#EF4444';
  }

  /* ── Main render ─────────────────────────────── */
  function render(container) {
    var reviews = (window.Store ? window.Store.get('reviews') : null) || [];
    var m       = calcMetrics(reviews);

    container.innerHTML = [
      /* Page header */
      '<div class="page-header">',
      '  <div>',
      '    <h1 class="page-title">' + t('analytics_title') + '</h1>',
      '    <p class="page-sub">' + t('sub_analytics2') + '</p>',
      '  </div>',
      '</div>',

      /* KPI Row */
      '<div class="kpi-row">',

      /* NPS */
      '  <div class="kpi-card">',
      '    <div class="kpi-label">' + t('nps_score') + '</div>',
      '    <div class="kpi-value" style="color:' + npsColor(m.npsScore) + '">' + esc(String(m.npsScore)) + '</div>',
      '    <div class="kpi-sub">' + t('promoters_detractors') + '</div>',
      '  </div>',

      /* Sentiment */
      '  <div class="kpi-card">',
      '    <div class="kpi-label">' + t('positive_sentiment') + '</div>',
      '    <div class="kpi-value" style="color:#10B981">' + esc(String(m.positiveSentiment)) + '%</div>',
      '    <div class="kpi-sub">' + t('reviews_4_5') + '</div>',
      '  </div>',

      /* Response rate */
      '  <div class="kpi-card">',
      '    <div class="kpi-label">' + t('response_rate_kpi') + '</div>',
      '    <div class="kpi-value" style="color:#4F46E5">' + esc(String(m.responseRate)) + '%</div>',
      '    <div class="kpi-sub">' + esc(String(m.respondedCount)) + ' / ' + esc(String(m.totalReviews)) + ' ' + t('reviews_count') + '</div>',
      '  </div>',

      /* Average rating */
      '  <div class="kpi-card">',
      '    <div class="kpi-label">' + t('avg_rating') + '</div>',
      '    <div class="kpi-value">' + esc(String(m.avgRating)) + '</div>',
      '    <div class="kpi-sub">' + renderStars(m.avgRating) + '</div>',
      '  </div>',

      '</div>',

      /* Analytics grid — bar chart + source bars */
      '<div class="analytics-grid">',

      /* Bar chart */
      '  <div class="section-card">',
      '    <div class="section-hd"><h2 class="section-title">' + t('rating_evolution') + '</h2></div>',
      '    <div style="padding:20px 22px;">',
      '      ' + renderBarChart(m.ratingByMonth),
      '    </div>',
      '  </div>',

      /* Source distribution */
      '  <div class="section-card">',
      '    <div class="section-hd"><h2 class="section-title">' + t('source_breakdown') + '</h2></div>',
      '    <div style="padding:20px 22px;">',
      '      ' + renderSourceBars(m.bySource, m.sourceCounts),
      '    </div>',
      '  </div>',

      '</div>',

      /* Bottom row — keywords + insights */
      '<div class="analytics-grid">',

      /* Keywords */
      '  <div class="section-card">',
      '    <div class="section-hd"><h2 class="section-title">' + t('keywords') + '</h2></div>',
      '    <div style="padding:20px 22px;">',
      '      <div class="keywords-wrap">',
      '        ' + renderKeywords(m.topKeywords),
      '      </div>',
      '    </div>',
      '  </div>',

      /* AI Insights */
      '  <div class="section-card">',
      '    <div class="section-hd">',
      '      <h2 class="section-title">' + t('ai_insights') + '</h2>',
      '    </div>',
      '    <div style="padding:20px 22px;">',
      '      <div class="insights-wrap">',
      '        ' + renderInsights(m),
      '      </div>',
      '    </div>',
      '  </div>',

      '</div>'
    ].join('\n');
  }

  window.AnalyticsPage = { render: render };

  document.addEventListener('sfai:lang-changed', function() {
    var app = document.getElementById('app');
    if (window.location.hash === '#/analytics' && app) {
      AnalyticsPage.render(app);
    }
  });
})();
