const Slideover = (() => {
  var currentReview = null;
  var onPublishCb   = null;
  var genId         = 0; // incremented each generate() call — cancels stale typeText

  function starsHtml(n) {
    return Array.from({length:5}, function(_,i) {
      return '<span class="rs' + (i >= n ? ' off' : '') + '">★</span>';
    }).join('');
  }

  function open(review, onPublish) {
    currentReview = review;
    onPublishCb   = onPublish || null;

    var el      = document.getElementById('slideover');
    var overlay = document.getElementById('overlay');
    if (!el || !overlay) return;

    var sub     = el.querySelector('#soSubtitle');
    var nameEl  = el.querySelector('#soName');
    var avatarEl= el.querySelector('#soAvatar');
    var starsEl = el.querySelector('#soStars');
    var textEl  = el.querySelector('#soText');
    var areaEl  = el.querySelector('#aiArea');
    var charEl  = el.querySelector('#charCount');

    if (sub)     sub.textContent     = t('reply_to') + ' ' + review.author;
    if (nameEl)  nameEl.textContent  = review.author;
    if (avatarEl){ avatarEl.textContent = review.initials; avatarEl.style.background = review.color; }
    if (starsEl) starsEl.innerHTML   = starsHtml(review.rating);
    if (textEl)  textEl.textContent  = '« ' + review.text + ' »';
    if (areaEl)  areaEl.value        = '';
    if (charEl)  charEl.textContent  = '0 ' + t('chars');

    // Reset tone to first pill
    el.querySelectorAll('.tone-opt').forEach(function(t) { t.classList.remove('selected'); });
    var first = el.querySelector('.tone-opt');
    if (first) first.classList.add('selected');

    overlay.classList.add('open');
    el.classList.add('open');

    generate();
  }

  function close() {
    genId++; // cancel any running typeText
    var el      = document.getElementById('slideover');
    var overlay = document.getElementById('overlay');
    if (el)      el.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  function selectedTone() {
    var sel = document.querySelector('#slideover .tone-opt.selected');
    return sel ? (sel.dataset.tone || 'professional') : 'professional';
  }

  function generate() {
    if (!currentReview) return;
    genId++; // invalidate any previous typeText in progress
    var myId    = genId;

    var thinkEl = document.getElementById('aiThinking');
    var areaEl  = document.getElementById('aiArea');
    var charEl  = document.getElementById('charCount');

    if (thinkEl) thinkEl.style.display = 'flex';
    if (areaEl)  areaEl.value          = '';
    if (charEl)  charEl.textContent    = '0 ' + t('chars');

    AI.generate({
      rating: currentReview.rating,
      tone:   selectedTone(),
      name:   currentReview.author.split(' ')[0],
      text:   currentReview.text
    }).then(function(text) {
      if (myId !== genId) return; // a newer generation started — discard this one
      if (thinkEl) thinkEl.style.display = 'none';
      typeText(areaEl, text, myId);
    });
  }

  function typeText(el, text, myId) {
    if (!el) return;
    el.value = '';
    var i = 0;
    function step() {
      if (myId !== genId) return; // cancelled by newer generation or close
      if (i < text.length) {
        el.value += text[i++];
        updateCharCount();
        setTimeout(step, 7);
      }
    }
    step();
  }

  function updateCharCount() {
    var areaEl = document.getElementById('aiArea');
    var charEl = document.getElementById('charCount');
    if (!areaEl || !charEl) return;
    var n = areaEl.value.length;
    charEl.textContent = n + ' ' + t('chars');
  }

  function initEvents() {
    var overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', close);

    var closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    var regenBtn = document.getElementById('regenBtn');
    if (regenBtn) regenBtn.addEventListener('click', generate);

    var editBtn = document.getElementById('editBtn');
    if (editBtn) editBtn.addEventListener('click', function() {
      var a = document.getElementById('aiArea');
      if (a) { a.focus(); a.setSelectionRange(a.value.length, a.value.length); }
    });

    var publishBtn = document.getElementById('publishBtn');
    if (publishBtn) publishBtn.addEventListener('click', function() {
      var areaEl = document.getElementById('aiArea');
      var text   = areaEl ? areaEl.value.trim() : '';
      if (!text) { Toast.show(t('write_response'), 'error'); return; }

      var source = currentReview ? (currentReview.source || 'google') : 'google';

      if (source === 'tripadvisor' || source === 'yelp') {
        // Assisted copy-paste workflow
        var settings = window.Store ? Store.get('settings') : {};
        var ints     = (settings && settings.integrations) || {};
        var platformUrl = ints[source + '_url'] || '';
        var lang = window.I18n ? I18n.getLang() : 'fr';

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(function() {
          // Open platform page if URL configured
          if (platformUrl) {
            window.open(platformUrl, '_blank');
          }

          // Show guided modal
          var platformName = source === 'tripadvisor' ? 'TripAdvisor' : 'Yelp';
          var modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;display:flex;align-items:center;justify-content:center;';
          modal.innerHTML =
            '<div style="background:#fff;border-radius:12px;padding:28px 32px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);">' +
              '<div style="font-size:18px;font-weight:800;margin-bottom:8px;">✅ Réponse copiée !</div>' +
              '<p style="font-size:13.5px;color:#374151;line-height:1.6;margin:0 0 16px;">' +
                (platformUrl
                  ? (lang === 'en'
                    ? 'The response is copied. ' + platformName + ' has been opened in a new tab.<br><br>Find the review and paste with <strong>Ctrl+V</strong>.'
                    : 'La réponse est copiée. ' + platformName + ' s\'est ouvert dans un nouvel onglet.<br><br>Trouvez l\'avis et collez avec <strong>Ctrl+V</strong>.')
                  : (lang === 'en'
                    ? 'The response is copied. Go to your <strong>' + platformName + '</strong> page and paste it with <strong>Ctrl+V</strong>.<br><br>💡 Add your ' + platformName + ' URL in Settings → Integrations to open it automatically.'
                    : 'La réponse est copiée. Rendez-vous sur votre fiche <strong>' + platformName + '</strong> et collez avec <strong>Ctrl+V</strong>.<br><br>💡 Ajoutez votre URL ' + platformName + ' dans Paramètres → Intégrations pour l\'ouvrir automatiquement.')) +
              '</p>' +
              (!platformUrl ? '<a href="#/settings" onclick="document.body.removeChild(this.closest(\'[style*=z-index:9000]\'));return true;" style="font-size:12px;color:var(--primary);text-decoration:none;">→ Configurer l\'URL</a><br><br>' : '') +
              '<button class="btn btn-primary" style="width:100%;" onclick="document.body.removeChild(this.closest(\'[style*=z-index:9000]\'));"> ' +
                (lang === 'en' ? 'Got it' : 'Compris') + ' ✓</button>' +
            '</div>';
          document.body.appendChild(modal);
          modal.addEventListener('click', function(e) {
            if (e.target === modal) document.body.removeChild(modal);
          });

          // Mark as responded locally
          if (currentReview) {
            Store.publishResponse(currentReview.id, text);
            if (onPublishCb) onPublishCb(currentReview.id, text);
          }
          close();
        }).catch(function() {
          Toast.show(lang === 'en' ? 'Could not copy — please copy manually.' : 'Impossible de copier — copiez manuellement.', 'error');
        });

      } else {
        // Google — publish via API (current behaviour)
        if (currentReview) {
          Store.publishResponse(currentReview.id, text);
          if (onPublishCb) onPublishCb(currentReview.id, text);
        }
        close();
        Toast.show(t('published'), 'success');
      }
    });

    // Tone pills — scoped to #slideover to avoid matching settings page pills
    var soEl = document.getElementById('slideover');
    if (soEl) {
      soEl.querySelectorAll('.tone-opt').forEach(function(opt) {
        opt.addEventListener('click', function() {
          soEl.querySelectorAll('.tone-opt').forEach(function(t) { t.classList.remove('selected'); });
          opt.classList.add('selected');
          generate();
        });
      });
    }

    var areaEl = document.getElementById('aiArea');
    if (areaEl) areaEl.addEventListener('input', updateCharCount);

    // Escape ferme le slide-over
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var so = document.getElementById('slideover');
        if (so && so.classList.contains('open')) close();
      }
    });
  }

  return { open: open, close: close, initEvents: initEvents };
})();

window.Slideover = Slideover;
