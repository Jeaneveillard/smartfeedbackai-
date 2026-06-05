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

  /* ── Tab state ───────────────────────────────── */
  var currentTab = 'business';

  /* ── Tab definitions ─────────────────────────── */
  function getTabs() {
    var me = window.Store ? Store.get('me') : null;
    var isAdmin = me && me.isAdmin;
    var tabs = [
      { id: 'business',     labelKey: 'tab_business'     },
      { id: 'integrations', labelKey: 'tab_integrations' },
      { id: 'subscription', labelKey: 'tab_subscription' }
    ];
    // IA & Réponses (clés API) — visible uniquement par le gestionnaire
    if (isAdmin) tabs.splice(2, 0, { id: 'ai', labelKey: 'tab_ai' });
    return tabs;
  }

  /* ── Integration metadata ────────────────────── */
  function getIntegrations() {
    var lang = window.I18n ? I18n.getLang() : 'fr';
    return [
      { key:'google',      label:'Google',      color:'#4285F4', letter:'G',
        desc: lang==='en' ? 'Sync Google reviews'      : 'Synchronisation des avis Google' },
      { key:'tripadvisor', label:'TripAdvisor', color:'#34A853', letter:'T',
        desc: lang==='en' ? 'Sync TripAdvisor reviews' : 'Synchronisation des avis TripAdvisor' },
      { key:'yelp',        label:'Yelp',         color:'#D32323', letter:'Y',
        desc: lang==='en' ? 'Sync Yelp reviews'        : 'Synchronisation des avis Yelp' }
    ];
  }

  /* ── Helpers ─────────────────────────────────── */
  function getSettings() {
    return (window.Store ? window.Store.get('settings') : null) || {};
  }

  function saveSettings(patch, callback) {
    var current = getSettings();
    var merged  = Object.assign({}, current, patch);
    ['business','ai','integrations','billing'].forEach(function(k) {
      if (patch[k]) merged[k] = Object.assign({}, current[k] || {}, patch[k]);
    });
    if (window.Store) window.Store.set('settings', merged);
    // Persist to backend (non-blocking)
    if (window.API) {
      API.put('/api/settings', merged)
        .then(function(saved) { if (window.Store) window.Store.set('settings', saved); if (callback) callback(); })
        .catch(function() { if (callback) callback(); });
    } else if (callback) { callback(); }
  }

  /* ── Render nav ──────────────────────────────── */
  function renderNav() {
    return getTabs().map(function (tab) {
      var active = tab.id === currentTab ? ' active' : '';
      return (
        '<div class="settings-nav-item' + active + '" data-tab="' + esc(tab.id) + '">' +
          esc(t(tab.labelKey)) +
        '</div>'
      );
    }).join('');
  }

  /* ── Geo data ───────────────────────────────── */
  var CA_PROVINCES = [
    {code:'AB',name:'Alberta',              tax:5.00,  taxLabel:'GST 5%'},
    {code:'BC',name:'British Columbia',     tax:12.00, taxLabel:'GST+PST 12%'},
    {code:'MB',name:'Manitoba',             tax:12.00, taxLabel:'GST+PST 12%'},
    {code:'NB',name:'New Brunswick',        tax:15.00, taxLabel:'HST 15%'},
    {code:'NL',name:'Newfoundland & Lab.',  tax:15.00, taxLabel:'HST 15%'},
    {code:'NS',name:'Nova Scotia',          tax:15.00, taxLabel:'HST 15%'},
    {code:'NT',name:'Northwest Territories',tax:5.00,  taxLabel:'GST 5%'},
    {code:'NU',name:'Nunavut',              tax:5.00,  taxLabel:'GST 5%'},
    {code:'ON',name:'Ontario',              tax:13.00, taxLabel:'HST 13%'},
    {code:'PE',name:'Prince Edward Island', tax:15.00, taxLabel:'HST 15%'},
    {code:'QC',name:'Quebec',               tax:14.975,taxLabel:'GST+QST 14.975%'},
    {code:'SK',name:'Saskatchewan',         tax:11.00, taxLabel:'GST+PST 11%'},
    {code:'YT',name:'Yukon',                tax:5.00,  taxLabel:'GST 5%'}
  ];
  var US_STATES = [
    {code:'AK',name:'Alaska',          tax:0.00}, {code:'AL',name:'Alabama',         tax:4.00},
    {code:'AR',name:'Arkansas',        tax:6.50}, {code:'AZ',name:'Arizona',         tax:5.60},
    {code:'CA',name:'California',      tax:7.25}, {code:'CO',name:'Colorado',        tax:2.90},
    {code:'CT',name:'Connecticut',     tax:6.35}, {code:'DC',name:'Washington DC',   tax:6.00},
    {code:'DE',name:'Delaware',        tax:0.00}, {code:'FL',name:'Florida',         tax:6.00},
    {code:'GA',name:'Georgia',         tax:4.00}, {code:'HI',name:'Hawaii',          tax:4.00},
    {code:'IA',name:'Iowa',            tax:6.00}, {code:'ID',name:'Idaho',           tax:6.00},
    {code:'IL',name:'Illinois',        tax:6.25}, {code:'IN',name:'Indiana',         tax:7.00},
    {code:'KS',name:'Kansas',          tax:6.50}, {code:'KY',name:'Kentucky',        tax:6.00},
    {code:'LA',name:'Louisiana',       tax:4.45}, {code:'MA',name:'Massachusetts',   tax:6.25},
    {code:'MD',name:'Maryland',        tax:6.00}, {code:'ME',name:'Maine',           tax:5.50},
    {code:'MI',name:'Michigan',        tax:6.00}, {code:'MN',name:'Minnesota',       tax:6.875},
    {code:'MO',name:'Missouri',        tax:4.225},{code:'MS',name:'Mississippi',     tax:7.00},
    {code:'MT',name:'Montana',         tax:0.00}, {code:'NC',name:'North Carolina',  tax:4.75},
    {code:'ND',name:'North Dakota',    tax:5.00}, {code:'NE',name:'Nebraska',        tax:5.50},
    {code:'NH',name:'New Hampshire',   tax:0.00}, {code:'NJ',name:'New Jersey',      tax:6.625},
    {code:'NM',name:'New Mexico',      tax:5.00}, {code:'NV',name:'Nevada',          tax:6.85},
    {code:'NY',name:'New York',        tax:4.00}, {code:'OH',name:'Ohio',            tax:5.75},
    {code:'OK',name:'Oklahoma',        tax:4.50}, {code:'OR',name:'Oregon',          tax:0.00},
    {code:'PA',name:'Pennsylvania',    tax:6.00}, {code:'RI',name:'Rhode Island',    tax:7.00},
    {code:'SC',name:'South Carolina',  tax:6.00}, {code:'SD',name:'South Dakota',    tax:4.50},
    {code:'TN',name:'Tennessee',       tax:7.00}, {code:'TX',name:'Texas',           tax:6.25},
    {code:'UT',name:'Utah',            tax:4.85}, {code:'VA',name:'Virginia',        tax:5.30},
    {code:'VT',name:'Vermont',         tax:6.00}, {code:'WA',name:'Washington',      tax:6.50},
    {code:'WI',name:'Wisconsin',       tax:5.00}, {code:'WV',name:'West Virginia',   tax:6.00},
    {code:'WY',name:'Wyoming',         tax:4.00}
  ];

  function getRegions(country) {
    return country === 'US' ? US_STATES : CA_PROVINCES;
  }
  function getTaxInfo(country, code) {
    var list = getRegions(country);
    for (var i = 0; i < list.length; i++) {
      if (list[i].code === code) return list[i];
    }
    return { tax: 0, taxLabel: '' };
  }

  /* ── Tab: Établissement ──────────────────────── */
  function renderBusiness() {
    var s   = getSettings();
    var biz = s.business || {};
    var me  = window.Store ? Store.get('me') : null;
    var username = (me && me.username) ? me.username : '';
    var country = biz.country || 'CA';
    var regions = getRegions(country);
    var curSP   = biz.stateProvince || '';

    var countryOpts = [
      {code:'CA', label:'Canada'},
      {code:'US', label:'United States'}
    ].map(function(c){
      return '<option value="' + c.code + '"' + (country === c.code ? ' selected' : '') + '>' + c.label + '</option>';
    }).join('');

    var regionOpts = regions.map(function(r){
      return '<option value="' + esc(r.code) + '"' + (curSP === r.code ? ' selected' : '') + '>' + esc(r.code) + ' — ' + esc(r.name) + '</option>';
    }).join('');

    var categories = ['Restaurant', 'Café', 'Bar', 'Boulangerie', 'Hôtel', 'Other'];
    var catOpts = categories.map(function (c) {
      return '<option value="' + esc(c) + '"' + (biz.category === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    var languages = [{ value:'fr', label:'Français' }, { value:'en', label:'English' }];
    var langOpts = languages.map(function (l) {
      return '<option value="' + esc(l.value) + '"' + ((s.ai && s.ai.language) === l.value ? ' selected' : '') + '>' + esc(l.label) + '</option>';
    }).join('');

    return (
      '<div class="settings-section active" id="tab-business">' +
        '<div class="settings-section-title">' + esc(t('tab_business')) + '</div>' +

        (username
          ? '<div class="form-group">' +
              '<label class="form-label">Username</label>' +
              '<div style="padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:14px;color:var(--txt2);">@' + esc(username) + '</div>' +
              '<p style="font-size:11px;color:var(--txt3);margin-top:4px;">Votre identifiant unique — modifiable par l\'administrateur.</p>' +
            '</div>'
          : '') +

        '<div class="form-group">' +
          '<label class="form-label" for="biz-name">' + esc(t('biz_name')) + '</label>' +
          '<input class="form-input" type="text" id="biz-name" autocomplete="organization" placeholder="Le Petit Bistro">' +
        '</div>' +

        '<div class="form-group">' +
          '<label class="form-label" for="biz-street">' + esc(t('biz_street')) + '</label>' +
          '<input class="form-input" type="text" id="biz-street" autocomplete="address-line1" placeholder="1234 Main Street">' +
        '</div>' +

        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label" for="biz-city">' + esc(t('biz_city')) + '</label>' +
            '<input class="form-input" type="text" id="biz-city" autocomplete="address-level2" placeholder="Montreal">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label" for="biz-postal">' + (country === 'CA' ? esc(t('biz_postal_ca')) : esc(t('biz_postal_us'))) + '</label>' +
            '<input class="form-input" type="text" id="biz-postal" autocomplete="postal-code" placeholder="' + (country === 'CA' ? 'H2X 2S9' : '10001') + '" style="max-width:160px;">' +
          '</div>' +
        '</div>' +

        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label" for="biz-country">' + esc(t('biz_country')) + '</label>' +
            '<select class="form-input" id="biz-country">' + countryOpts + '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label" for="biz-state">' + (country === 'CA' ? esc(t('biz_province')) : esc(t('biz_state'))) + '</label>' +
            '<select class="form-input" id="biz-state">' + regionOpts + '</select>' +
          '</div>' +
        '</div>' +

        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label" for="biz-category">' + esc(t('biz_category')) + '</label>' +
            '<select class="form-input" id="biz-category">' + catOpts + '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label" for="biz-lang">' + esc(t('response_lang')) + '</label>' +
            '<select class="form-input" id="biz-lang">' + langOpts + '</select>' +
          '</div>' +
        '</div>' +

        '<div class="btn-save-row">' +
          '<button class="btn btn-primary" id="saveBusiness">' + esc(t('save')) + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Tab: Intégrations ───────────────────────── */
  function renderIntegrations() {
    var s    = getSettings();
    var ints = s.integrations || {};
    var me   = window.Store ? window.Store.get('me') : null;
    var googleConnected  = me && me.googleConnected;
    var googleLocationId = me && me.google_location_id;
    var lastSync         = me && me.last_sync_at;

    var rows = getIntegrations().map(function (src) {
      var enabled   = !!ints[src.key];
      var isGoogle  = src.key === 'google';

      // Pour Google : statut réel basé sur le token OAuth
      var realConnected = isGoogle ? googleConnected : enabled;
      var statusCls = realConnected ? 'connected' : 'disconnected';
      var statusTxt = realConnected ? t('connected') : t('disconnected');

      // Bouton d'action Google
      var actionHtml = '';
      if (isGoogle && googleConnected && !googleLocationId) {
        actionHtml = '<button class="btn btn-soft" id="setupGoogleBtn" style="font-size:12px;padding:5px 12px;">' + esc(t('setup_location')) + '</button>';
      } else if (isGoogle && googleConnected && googleLocationId) {
        var syncTxt = lastSync ? ('Sync: ' + new Date(lastSync).toLocaleTimeString('fr-CA', {hour:'2-digit',minute:'2-digit'})) : 'Jamais synchronisé';
        actionHtml = '<button class="btn btn-ghost" id="manualSyncBtn" style="font-size:12px;padding:5px 12px;">' + esc(t('sync_now')) + '</button>' +
                     '<span style="font-size:11px;color:var(--txt3);margin-left:8px">' + esc(syncTxt) + '</span>';
      } else if (isGoogle && !googleConnected) {
        actionHtml = '<a class="btn btn-primary" href="http://localhost:3001/auth/google" style="font-size:12px;padding:5px 12px;text-decoration:none;">' + esc(t('connect_google')) + '</a>';
      }

      // URL fields for TripAdvisor and Yelp (manual copy-paste workflow)
      var urlField = '';
      if (!isGoogle) {
        var urlKey   = src.key + '_url';
        var urlVal   = ints[urlKey] || '';
        var urlPlaceholder = src.key === 'tripadvisor'
          ? 'https://www.tripadvisor.ca/Restaurant_Review-...'
          : 'https://www.yelp.ca/biz/...';
        urlField =
          '<div style="width:100%;margin-top:10px;">' +
            '<label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:4px;">URL de votre fiche ' + esc(src.label) + '</label>' +
            '<div style="display:flex;gap:6px;">' +
              '<input class="form-input platform-url-input" type="url"' +
                     ' data-platform="' + esc(src.key) + '"' +
                     ' value="' + esc(urlVal) + '"' +
                     ' placeholder="' + esc(urlPlaceholder) + '"' +
                     ' style="flex:1;font-size:12px;padding:6px 10px;">' +
              '<button class="btn btn-soft save-platform-url" data-platform="' + esc(src.key) + '" style="font-size:11.5px;padding:5px 10px;">OK</button>' +
            '</div>' +
            '<p style="font-size:11px;color:var(--txt3);margin:4px 0 0;">L\'IA génère la réponse → vous la copiez et la collez sur cette page.</p>' +
          '</div>';
      }

      return (
        '<div class="integration-item" style="flex-wrap:wrap;gap:8px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">' +
            '<div style="display:flex;align-items:center;gap:14px;">' +
              '<div style="width:38px;height:38px;border-radius:10px;background:' + src.color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800;flex-shrink:0;">' +
                esc(src.letter) +
              '</div>' +
              '<div>' +
                '<div style="font-size:13.5px;font-weight:600;color:var(--txt1)">' + esc(src.label) + '</div>' +
                '<div style="font-size:12px;color:var(--txt2);margin-top:2px">' + esc(src.desc) + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end;">' +
              '<span class="integration-status ' + statusCls + '">' +
                '<span style="width:6px;height:6px;border-radius:50%;background:' + (realConnected ? 'var(--green)' : 'var(--txt3)') + ';display:inline-block;"></span>' +
                esc(statusTxt) +
              '</span>' +
              actionHtml +
              (isGoogle ? '' :
                '<label class="toggle" title="Activer / Désactiver ' + esc(src.label) + '">' +
                  '<input type="checkbox" class="integration-toggle" data-source="' + esc(src.key) + '"' + (enabled ? ' checked' : '') + '>' +
                  '<span class="toggle-slider"></span>' +
                '</label>') +
            '</div>' +
          '</div>' +
          urlField +
        '</div>'
      );
    }).join('');

    // Sélecteur d'établissement (affiché dynamiquement)
    var locationPickerHtml =
      '<div id="google-location-picker" style="display:none;background:var(--primary-light);border:1.5px solid var(--primary-mid);border-radius:var(--r);padding:16px 18px;margin-top:16px;">' +
        '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">' + esc(t('select_location')) + '</div>' +
        '<div id="location-list" style="display:flex;flex-direction:column;gap:8px;"></div>' +
      '</div>';

    return (
      '<div class="settings-section active" id="tab-integrations">' +
        '<div class="settings-section-title">' + esc(t('tab_integrations')) + '</div>' +
        rows +
        locationPickerHtml +
      '</div>'
    );
  }

  /* ── Tab: IA & Réponses ──────────────────────── */
  function renderAI() {
    var s  = getSettings();
    var ai = s.ai || {};

    /* Provider list from AI module */
    var providers = window.AI && window.AI.PROVIDERS ? window.AI.PROVIDERS : {
      mock:    { label: t('demo_mode'),              needsKey: false },
      claude:  { label: 'Claude — Anthropic',        needsKey: true  },
      chatgpt: { label: 'ChatGPT — OpenAI',          needsKey: true  },
      grok:    { label: 'Grok — xAI',                needsKey: true  },
      mistral: { label: 'Mistral AI',                needsKey: true  },
      gemini:  { label: 'Google Gemini',             needsKey: true  }
    };
    var currentProvider = ai.provider || 'mock';
    var providerOpts = Object.keys(providers).map(function (k) {
      return '<option value="' + esc(k) + '"' + (currentProvider === k ? ' selected' : '') + '>' + esc(providers[k].label) + '</option>';
    }).join('');

    var providerLinks = {
      claude:  'console.anthropic.com',
      chatgpt: 'platform.openai.com/api-keys',
      grok:    'console.x.ai',
      mistral: 'console.mistral.ai/api-keys',
      gemini:  'aistudio.google.com/apikey'
    };
    var keyHints = {
      claude:  'sk-ant-…',
      chatgpt: 'sk-…',
      grok:    'xai-…',
      mistral: 'Votre clé Mistral',
      gemini:  'AIza…'
    };
    var needsKey   = providers[currentProvider] && providers[currentProvider].needsKey;
    var keyHide    = needsKey ? '' : ' style="display:none"';
    var keyHint    = keyHints[currentProvider] || '';
    var keyLink    = providerLinks[currentProvider]
      ? '<p style="font-size:11.5px;color:var(--txt3);margin-top:6px;">Obtenez votre clé sur <strong>' + esc(providerLinks[currentProvider]) + '</strong></p>'
      : '';
    var isCustom   = currentProvider === 'custom';
    var customHide = isCustom ? '' : ' style="display:none"';
    var custom     = (ai.customProvider) || {};
    var customName     = custom.name     || '';
    var customEndpoint = custom.endpoint || '';
    var customModel    = custom.model    || '';

    var tones = [
      { value: 'professional', label: 'Professionnel' },
      { value: 'warm',         label: 'Chaleureux'     },
      { value: 'formal',       label: 'Formel'         },
      { value: 'casual',       label: 'Décontracté'    }
    ];
    var toneOpts = tones.map(function (tone) {
      var active = (ai.defaultTone === tone.value) ? ' active' : '';
      return (
        '<label class="tone-opt' + active + '" data-tone="' + esc(tone.value) + '">' +
          '<input type="radio" name="ai-tone" value="' + esc(tone.value) + '"' + (ai.defaultTone === tone.value ? ' checked' : '') + ' style="display:none">' +
          esc(tone.label) +
        '</label>'
      );
    }).join('');

    var languages = [
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'English'  }
    ];
    var langOpts = languages.map(function (l) {
      var sel = (ai.language === l.value) ? ' selected' : '';
      return '<option value="' + esc(l.value) + '"' + sel + '>' + esc(l.label) + '</option>';
    }).join('');

    return (
      '<div class="settings-section active" id="tab-ai">' +
        '<div class="settings-section-title">' + esc(t('tab_ai')) + '</div>' +

        '<div class="form-group">' +
          '<label class="form-label" for="ai-provider">' + esc(t('ai_provider')) + '</label>' +
          '<select class="form-input" id="ai-provider" style="max-width:340px;">' + providerOpts + '</select>' +
          '<p style="font-size:11.5px;color:var(--txt3);margin-top:6px;">' + esc(t('demo_mode')) + '</p>' +
        '</div>' +

        '<div class="form-group" id="ai-key-group"' + keyHide + '>' +
          '<label class="form-label" for="ai-apikey">' + esc(t('api_key')) + '</label>' +
          '<div style="display:flex;gap:10px;max-width:400px;">' +
            '<input class="form-input" type="password" id="ai-apikey" placeholder="' + esc(keyHint) + '" autocomplete="off" style="flex:1;max-width:none;">' +
            '<button class="btn btn-soft" id="testApiKey" style="white-space:nowrap;flex-shrink:0;">' + esc(t('test_connection')) + '</button>' +
          '</div>' +
          keyLink +
        '</div>' +

        /* ── Champs fournisseur personnalisé ── */
        '<div id="ai-custom-group"' + customHide + ' style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;margin-bottom:16px;">' +
          '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--txt3);margin-bottom:14px;">Configuration du fournisseur personnalisé</div>' +
          '<div class="form-group" style="margin-bottom:12px;">' +
            '<label class="form-label" for="custom-name">Nom affiché</label>' +
            '<input class="form-input" type="text" id="custom-name" placeholder="ex: DeepSeek, Groq, Together AI…" style="max-width:340px;" value="' + esc(customName) + '">' +
          '</div>' +
          '<div class="form-group" style="margin-bottom:12px;">' +
            '<label class="form-label" for="custom-endpoint">URL de l\'endpoint <span style="color:var(--red)">*</span></label>' +
            '<input class="form-input" type="url" id="custom-endpoint" placeholder="https://api.exemple.com/v1/chat/completions" style="max-width:480px;" value="' + esc(customEndpoint) + '">' +
            '<p style="font-size:11px;color:var(--txt3);margin-top:5px;">Compatible format OpenAI (<code>/v1/chat/completions</code>). Exemples : Groq, Together AI, DeepSeek, Ollama…</p>' +
          '</div>' +
          '<div class="form-group" style="margin-bottom:0;">' +
            '<label class="form-label" for="custom-model">Nom du modèle <span style="color:var(--red)">*</span></label>' +
            '<input class="form-input" type="text" id="custom-model" placeholder="ex: deepseek-chat, llama-3.1-70b, mixtral-8x7b…" style="max-width:340px;" value="' + esc(customModel) + '">' +
          '</div>' +
        '</div>' +

        '<div class="form-group">' +
          '<label class="form-label">' + esc(t('default_tone')) + '</label>' +
          '<div class="tone-opts" id="ai-tone-opts">' + toneOpts + '</div>' +
        '</div>' +

        '<div class="form-group">' +
          '<label class="form-label" for="ai-lang">' + esc(t('response_lang')) + '</label>' +
          '<select class="form-input" id="ai-lang">' + langOpts + '</select>' +
        '</div>' +

        '<div class="btn-save-row">' +
          '<button class="btn btn-primary" id="saveAI">' + esc(t('save')) + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Billing helpers ────────────────────────── */
  var BASE_PRICE_CAD = 49.00;
  var BASE_BIZ_CAD   = 99.00;
  var FX = { CAD: 1.00, USD: 0.73 };  // approximate; updated periodically

  function fmt(amount, currency) {
    return '$' + amount.toFixed(2) + ' ' + currency;
  }

  /* ── Tab: Abonnement ─────────────────────────── */
  /* billing status cached after first fetch */
  var _billingStatus = null;

  function renderSubscription(billingStatus) {
    var s        = getSettings();
    var biz      = s.business || {};
    var billing  = s.billing  || {};
    var currency = billing.currency || 'CAD';
    var country  = biz.country || 'CA';
    var sp       = biz.stateProvince || '';
    var taxInfo  = getTaxInfo(country, sp);
    var taxRate  = taxInfo.tax || 0;
    var taxLabel = taxInfo.taxLabel || '';
    var isEn     = I18n.getLang() === 'en';

    var rate     = FX[currency] || 1;
    var subtotal = BASE_PRICE_CAD * rate;
    var taxAmt   = subtotal * (taxRate / 100);
    var total    = subtotal + taxAmt;

    var currencyOpts = Object.keys(FX).map(function(c) {
      return '<option value="' + c + '"' + (currency === c ? ' selected' : '') + '>' + c + '</option>';
    }).join('');

    var taxRow = taxRate > 0
      ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--txt2);padding:6px 0;">' +
          '<span>' + esc(t('taxes')) + ' (' + esc(sp) + ' — ' + esc(taxLabel) + ')</span>' +
          '<span>' + fmt(taxAmt, currency) + '</span>' +
        '</div>'
      : '<div style="font-size:12px;color:var(--txt3);padding:4px 0;">' + esc(t('no_tax')) + ' (' + esc(sp || country) + ').</div>';

    var altCurrency = currency === 'CAD' ? 'USD' : 'CAD';
    var altRate     = FX[altCurrency] || 1;
    var altTotal    = (BASE_PRICE_CAD * altRate) * (1 + taxRate / 100);
    var approxNote  = isEn ? 'Approximate exchange rate' : 'Taux de change approximatif';
    var altNote     = '<div style="font-size:11.5px;color:var(--txt3);margin-top:8px;">≈ ' + fmt(altTotal, altCurrency) + ' ' + esc(t('per_month')) + ' · ' + esc(approxNote) + '</div>';

    var features = [
      isEn ? 'Unlimited AI responses'   : 'Réponses IA illimitées',
      isEn ? '3 connected platforms'    : '3 plateformes connectées',
      isEn ? 'Advanced analytics'       : 'Analytique avancée',
      'Export CSV'
    ];
    var featureList = features.map(function(f) {
      return '<li style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-faint);font-size:13.5px;"><span style="color:var(--green);font-size:15px;">✓</span>' + esc(f) + '</li>';
    }).join('');

    var indicativeNote = isEn ? 'Approximate exchange rate · Amounts are indicative' : 'Taux de change approximatif · Les montants sont indicatifs';

    /* ── Stripe subscription status block ── */
    var subStatus  = billingStatus ? billingStatus.subscriptionStatus : null;
    var isActive   = subStatus === 'active' || subStatus === 'trialing';
    var isPastDue  = subStatus === 'past_due';
    var statusBadgeColor = isActive ? 'var(--green)' : isPastDue ? 'var(--orange)' : 'var(--txt3)';
    var statusLabel = isActive
      ? (isEn ? 'ACTIVE' : 'ACTIF')
      : isPastDue
        ? (isEn ? 'PAYMENT OVERDUE' : 'PAIEMENT EN RETARD')
        : subStatus === 'canceled'
          ? (isEn ? 'CANCELED' : 'ANNULÉ')
          : (isEn ? 'INACTIVE' : 'INACTIF');

    var planCard;
    if (isActive || isPastDue) {
      /* Has subscription — show manage button */
      planCard =
        '<div style="background:var(--primary-light);border:1.5px solid var(--primary-mid);border-radius:var(--r);padding:20px 22px;margin-bottom:24px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="background:' + statusBadgeColor + ';color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:.5px;">STARTER · ' + statusLabel + '</span>' +
            '</div>' +
            '<button class="btn btn-ghost" id="manageSubBtn">' + esc(isEn ? 'Manage subscription' : 'Gérer l\'abonnement') + '</button>' +
          '</div>' +
          '<div style="border-top:1px solid var(--primary-mid);padding-top:14px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--txt2);padding:6px 0;">' +
              '<span>' + esc(t('subtotal')) + '</span><span>' + fmt(subtotal, currency) + ' ' + esc(t('per_month')) + '</span>' +
            '</div>' +
            taxRow +
            '<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:var(--txt1);padding:8px 0;border-top:1.5px solid var(--primary-mid);margin-top:4px;">' +
              '<span>' + esc(t('total')) + '</span><span>' + fmt(total, currency) + ' ' + esc(t('per_month')) + '</span>' +
            '</div>' +
            altNote +
          '</div>' +
        '</div>';
    } else {
      var me   = window.Store ? Store.get('me') : null;
      var plan = me && me.plan;

      if (plan === 'beta') {
        /* Beta plan — show trial info, no payment CTA */
        var subEnd  = me && me.subscription_end;
        var daysLeft = subEnd ? Math.ceil((new Date(subEnd) - new Date()) / 86400000) : null;
        var betaMsg  = daysLeft !== null
          ? (isEn ? daysLeft + ' days remaining in your beta period' : daysLeft + ' jours restants dans votre période bêta')
          : (isEn ? 'Beta access — contact your administrator for details' : 'Accès bêta — contactez votre administrateur pour les détails');
        planCard =
          '<div style="background:linear-gradient(135deg,#059669,#10B981);border-radius:var(--r);padding:22px 24px;color:#fff;margin-bottom:24px;">' +
            '<div style="font-size:15px;font-weight:700;margin-bottom:6px;">' +
              (isEn ? '🎉 Beta access — free trial' : '🎉 Accès bêta — essai gratuit') +
            '</div>' +
            '<div style="font-size:13px;opacity:.9;margin-bottom:4px;">' + esc(betaMsg) + '</div>' +
            (subEnd ? '<div style="font-size:12px;opacity:.75;">' + (isEn ? 'Expires ' : 'Expire le ') + subEnd + '</div>' : '') +
          '</div>';
      } else {
        /* No active subscription — show subscribe CTA */
        planCard =
          '<div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:var(--r);padding:22px 24px;color:#fff;margin-bottom:24px;">' +
            '<div style="font-size:15px;font-weight:700;margin-bottom:6px;">' +
              (isEn ? 'Subscribe to SmartFeedback AI' : 'S\'abonner à SmartFeedback AI') +
            '</div>' +
            '<div style="font-size:13px;opacity:.85;margin-bottom:18px;">' +
              (isEn ? 'Starter plan — ' : 'Plan Starter — ') + fmt(total, currency) + ' ' + esc(t('per_month')) +
              (taxRate > 0 ? ', ' + (isEn ? 'taxes included' : 'taxes incluses') : '') +
            '</div>' +
            '<button class="btn" id="subscribeBtn" style="background:#fff;color:#4F46E5;font-weight:700;">' +
              (isEn ? '💳 Subscribe now' : '💳 S\'abonner maintenant') +
            '</button>' +
          '</div>';
      }
    }

    /* Loading spinner when status not yet fetched */
    if (billingStatus === undefined) {
      planCard = '<div style="padding:24px;text-align:center;color:var(--txt3);font-size:13px;">' +
        (isEn ? 'Loading subscription status…' : 'Chargement du statut…') + '</div>';
    }

    return (
      '<div class="settings-section active" id="tab-subscription">' +
        '<div class="settings-section-title">' + esc(t('tab_subscription')) + '</div>' +

        /* Currency selector */
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:12px 16px;background:var(--bg);border-radius:var(--r-sm);border:1px solid var(--border-faint);">' +
          '<span style="font-size:13px;font-weight:600;color:var(--txt2);">' + esc(t('currency')) + ' :</span>' +
          '<select class="form-input" id="billing-currency" style="width:auto;padding:5px 10px;">' + currencyOpts + '</select>' +
          '<span style="font-size:11.5px;color:var(--txt3);">' + esc(indicativeNote) + '</span>' +
        '</div>' +

        planCard +

        /* Features */
        '<div style="margin-bottom:28px;">' +
          '<div style="font-size:13px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;">' + esc(t('features_included').toUpperCase()) + '</div>' +
          '<ul style="list-style:none;padding:0;margin:0;">' + featureList + '</ul>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Populate form fields from Store ──────────── */
  function populateFields() {
    var s      = getSettings();
    var biz    = s.business || {};
    var ai     = s.ai       || {};
    var custom = ai.customProvider || {};

    /* Business tab — NA address fields */
    var nameEl   = document.getElementById('biz-name');
    var streetEl = document.getElementById('biz-street');
    var cityEl   = document.getElementById('biz-city');
    var postalEl = document.getElementById('biz-postal');
    if (nameEl)   nameEl.value   = biz.name          || '';
    if (streetEl) streetEl.value = biz.street        || '';
    if (cityEl)   cityEl.value   = biz.city          || '';
    if (postalEl) postalEl.value = biz.postalCode     || '';

    /* AI tab */
    var keyEl = document.getElementById('ai-apikey');
    if (keyEl) keyEl.value = ai.apiKey || '';

    /* Custom provider fields */
    var cnEl = document.getElementById('custom-name');
    var ceEl = document.getElementById('custom-endpoint');
    var cmEl = document.getElementById('custom-model');
    if (cnEl) cnEl.value = custom.name     || '';
    if (ceEl) ceEl.value = custom.endpoint || '';
    if (cmEl) cmEl.value = custom.model    || '';
  }

  /* ── Bind tab panel events ───────────────────── */
  function bindEvents(container) {
    /* Nav tab switching */
    var navItems = container.querySelectorAll('.settings-nav-item');
    navItems.forEach(function (el) {
      el.addEventListener('click', function () {
        var tab = el.getAttribute('data-tab');
        if (tab) {
          currentTab = tab;
          render(container);
        }
      });
    });

    /* ─ Business save ─ */
    /* ─ Country change → rebuild province/state dropdown ─ */
    var countryEl = document.getElementById('biz-country');
    var stateEl   = document.getElementById('biz-state');
    var postalLbl = document.querySelector('label[for="biz-postal"]');
    var stateLbl  = document.querySelector('label[for="biz-state"]');
    var postalEl2 = document.getElementById('biz-postal');
    if (countryEl && stateEl) {
      countryEl.addEventListener('change', function () {
        var ctry    = countryEl.value;
        var regions = getRegions(ctry);
        stateEl.innerHTML = regions.map(function(r) {
          return '<option value="' + esc(r.code) + '">' + esc(r.code) + ' — ' + esc(r.name) + '</option>';
        }).join('');
        if (postalLbl) postalLbl.textContent = ctry === 'CA' ? t('biz_postal_ca') : t('biz_postal_us');
        if (stateLbl)  stateLbl.textContent  = ctry === 'CA' ? t('biz_province')  : t('biz_state');
        if (postalEl2) postalEl2.placeholder  = ctry === 'CA' ? 'H2X 2S9'         : '10001';
      });
    }

    /* ─ Currency change → re-render subscription tab ─ */
    var currencyEl = document.getElementById('billing-currency');
    if (currencyEl) {
      currencyEl.addEventListener('change', function () {
        var s = getSettings();
        saveSettings({ billing: Object.assign({}, s.billing, { currency: currencyEl.value }) });
        currentTab = 'subscription';
        render(container);
      });
    }

    /* ─ Business save ─ */
    var saveBizBtn = document.getElementById('saveBusiness');
    if (saveBizBtn) {
      saveBizBtn.addEventListener('click', function () {
        var nameEl   = document.getElementById('biz-name');
        var streetEl = document.getElementById('biz-street');
        var cityEl   = document.getElementById('biz-city');
        var postalEl = document.getElementById('biz-postal');
        var ctryEl   = document.getElementById('biz-country');
        var spEl     = document.getElementById('biz-state');
        var catEl    = document.getElementById('biz-category');
        var langEl   = document.getElementById('biz-lang');

        var s = getSettings();
        saveSettings({
          business: Object.assign({}, s.business, {
            name:          nameEl   ? nameEl.value.trim()   : (s.business && s.business.name)          || '',
            street:        streetEl ? streetEl.value.trim() : (s.business && s.business.street)        || '',
            city:          cityEl   ? cityEl.value.trim()   : (s.business && s.business.city)          || '',
            postalCode:    postalEl ? postalEl.value.trim() : (s.business && s.business.postalCode)    || '',
            country:       ctryEl   ? ctryEl.value          : (s.business && s.business.country)       || 'CA',
            stateProvince: spEl     ? spEl.value            : (s.business && s.business.stateProvince) || '',
            category:      catEl    ? catEl.value           : (s.business && s.business.category)      || ''
          }),
          ai: Object.assign({}, s.ai, {
            language: langEl ? langEl.value : (s.ai && s.ai.language) || 'fr'
          })
        });

        if (window.Toast)   window.Toast.show(t('settings_saved'), 'success');
        if (window.Sidebar) window.Sidebar.render();
        if (window.Topnav)  window.Topnav.updateTitle();
      });
    }

    /* ─ Google: configurer l'établissement ─ */
    var setupGoogleBtn = document.getElementById('setupGoogleBtn');
    if (setupGoogleBtn) {
      setupGoogleBtn.addEventListener('click', function () {
        setupGoogleBtn.disabled = true;
        setupGoogleBtn.textContent = 'Chargement…';
        API.get('/auth/setup/locations').then(function (data) {
          var picker  = document.getElementById('google-location-picker');
          var listEl  = document.getElementById('location-list');
          if (!picker || !listEl) return;
          if (!data.locations || !data.locations.length) {
            listEl.innerHTML = '<p style="font-size:13px;color:var(--txt2);">' + esc(t('no_locations')) + '</p>';
          } else {
            listEl.innerHTML = data.locations.map(function (loc) {
              return '<button class="btn btn-ghost location-choice" data-id="' + esc(loc.id) + '" style="text-align:left;justify-content:flex-start;gap:10px;">' +
                '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
                esc(loc.title) + '</button>';
            }).join('');
            listEl.querySelectorAll('.location-choice').forEach(function (btn) {
              btn.addEventListener('click', function () {
                var locationId = btn.getAttribute('data-id');
                btn.textContent = 'Connexion…';
                btn.disabled = true;
                API.post('/auth/setup/location', { locationId: locationId }).then(function () {
                  Toast.show(t('location_connected'), 'success');
                  // Reload me data
                  API.get('/auth/me').then(function (me) {
                    Store.set('me', me);
                    currentTab = 'integrations';
                    render(container);
                  });
                }).catch(function () {
                  Toast.show(t('location_error'), 'error');
                  btn.disabled = false;
                  btn.textContent = 'Réessayer';
                });
              });
            });
          }
          picker.style.display = '';
          setupGoogleBtn.disabled = false;
          setupGoogleBtn.textContent = t('setup_location');
        }).catch(function () {
          Toast.show(t('connection_error'), 'error');
          setupGoogleBtn.disabled = false;
          setupGoogleBtn.textContent = t('setup_location');
        });
      });
    }

    /* ─ Google: sync manuelle ─ */
    var manualSyncBtn = document.getElementById('manualSyncBtn');
    if (manualSyncBtn) {
      manualSyncBtn.addEventListener('click', function () {
        manualSyncBtn.disabled = true;
        manualSyncBtn.textContent = t('syncing');
        API.post('/api/sync', {}).then(function () {
          Toast.show(t('sync_launched'), 'success');
          setTimeout(function () {
            manualSyncBtn.disabled = false;
            manualSyncBtn.textContent = t('sync_now');
          }, 3000);
        }).catch(function () {
          Toast.show(t('sync_error'), 'error');
          manualSyncBtn.disabled = false;
          manualSyncBtn.textContent = t('sync_now');
        });
      });
    }

    /* ─ Save TripAdvisor / Yelp URL ─ */
    container.querySelectorAll('.save-platform-url').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var platform = btn.getAttribute('data-platform');
        var input    = container.querySelector('.platform-url-input[data-platform="' + platform + '"]');
        if (!input) return;
        var url = input.value.trim();
        var s   = getSettings();
        var ints = Object.assign({}, s.integrations || {});
        ints[platform + '_url'] = url;
        saveSettings({ integrations: ints });
        btn.textContent = '✓';
        setTimeout(function() { btn.textContent = 'OK'; }, 1500);
        if (window.Toast) Toast.show('URL ' + platform + ' enregistrée', 'success');
      });
    });

    /* ─ Integration toggles ─ */
    var toggles = container.querySelectorAll('.integration-toggle');
    toggles.forEach(function (input) {
      input.addEventListener('change', function () {
        var source  = input.getAttribute('data-source');
        var enabled = input.checked;
        var s = getSettings();
        var ints = Object.assign({}, s.integrations);
        ints[source] = enabled;
        saveSettings({ integrations: ints });
        /* Re-render panel to update status badge */
        currentTab = 'integrations';
        render(container);
      });
    });

    /* ─ Provider selector — show/hide API key field live ─ */
    var providerSel  = document.getElementById('ai-provider');
    var keyGroup     = document.getElementById('ai-key-group');
    var keyInput     = document.getElementById('ai-apikey');
    var customGroup  = document.getElementById('ai-custom-group');
    if (providerSel) {
      providerSel.addEventListener('change', function () {
        var prov = providerSel.value;
        var providers = window.AI && window.AI.PROVIDERS ? window.AI.PROVIDERS : {};
        var needs = providers[prov] && providers[prov].needsKey;
        if (keyGroup)    keyGroup.style.display    = needs ? '' : 'none';
        if (customGroup) customGroup.style.display = (prov === 'custom') ? '' : 'none';
        var hints = { claude: 'sk-ant-…', chatgpt: 'sk-…', grok: 'xai-…', mistral: 'Votre clé Mistral', gemini: 'AIza…', custom: 'Votre clé API' };
        if (keyInput) keyInput.placeholder = hints[prov] || 'Votre clé API';
      });
    }

    /* ─ Tone pills ─ */
    var toneWrap = document.getElementById('ai-tone-opts');
    if (toneWrap) {
      toneWrap.addEventListener('click', function (e) {
        var pill = e.target.closest('[data-tone]');
        if (!pill) return;
        toneWrap.querySelectorAll('.tone-opt').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var radio = pill.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    }

    /* ─ Test API key ─ */
    var testBtn = document.getElementById('testApiKey');
    if (testBtn) {
      testBtn.addEventListener('click', function () {
        var keyEl = document.getElementById('ai-apikey');
        var key   = keyEl ? keyEl.value.trim() : '';
        if (!key) {
          if (window.Toast) window.Toast.show(t('enter_api_key'), 'error');
          return;
        }
        testBtn.disabled = true;
        testBtn.textContent = t('testing');

        var aiGlobal = window.AI;
        if (!aiGlobal || typeof aiGlobal.testApiKey !== 'function') {
          if (window.Toast) window.Toast.show('Module IA non disponible', 'error');
          testBtn.disabled = false;
          testBtn.textContent = t('test_connection');
          return;
        }

        var provEl = document.getElementById('ai-provider');
        var prov   = provEl ? provEl.value : 'claude';
        aiGlobal.testApiKey(key, prov).then(function (ok) {
          if (ok) {
            if (window.Toast) window.Toast.show(t('connection_ok'), 'success');
          } else {
            if (window.Toast) window.Toast.show(t('invalid_key'), 'error');
          }
        }).catch(function () {
          if (window.Toast) window.Toast.show(t('network_error'), 'error');
        }).then(function () {
          testBtn.disabled = false;
          testBtn.textContent = t('test_connection');
        });
      });
    }

    /* ─ AI save ─ */
    var saveAIBtn = document.getElementById('saveAI');
    if (saveAIBtn) {
      saveAIBtn.addEventListener('click', function () {
        var keyEl  = document.getElementById('ai-apikey');
        var langEl = document.getElementById('ai-lang');

        /* Read selected tone */
        var selectedTone = 'professional';
        var activePill = document.querySelector('#ai-tone-opts .tone-opt.active');
        if (activePill) selectedTone = activePill.getAttribute('data-tone') || 'professional';

        var provEl = document.getElementById('ai-provider');
        var cnEl   = document.getElementById('custom-name');
        var ceEl   = document.getElementById('custom-endpoint');
        var cmEl   = document.getElementById('custom-model');
        var prov   = provEl ? provEl.value : 'mock';

        /* Validate custom fields before saving */
        if (prov === 'custom') {
          var ep = ceEl ? ceEl.value.trim() : '';
          var md = cmEl ? cmEl.value.trim() : '';
          if (!ep || !md) {
            if (window.Toast) window.Toast.show(t('custom_required'), 'error');
            return;
          }
        }

        var s = getSettings();
        saveSettings({
          ai: Object.assign({}, s.ai, {
            provider:    prov,
            apiKey:      keyEl ? keyEl.value.trim() : (s.ai && s.ai.apiKey) || '',
            defaultTone: selectedTone,
            language:    langEl ? langEl.value : (s.ai && s.ai.language) || 'fr',
            customProvider: {
              name:     cnEl ? cnEl.value.trim() : (s.ai && s.ai.customProvider && s.ai.customProvider.name)     || '',
              endpoint: ceEl ? ceEl.value.trim() : (s.ai && s.ai.customProvider && s.ai.customProvider.endpoint) || '',
              model:    cmEl ? cmEl.value.trim() : (s.ai && s.ai.customProvider && s.ai.customProvider.model)    || ''
            }
          })
        });

        if (window.Toast) window.Toast.show(t('ai_settings_saved'), 'success');
      });
    }
  }

  /* ── Main render ─────────────────────────────── */
  function render(container) {
    /* Choose panel content */
    // Reset currentTab to 'business' if user lost access to 'ai' tab
    var allowedTabs = getTabs().map(function(tab) { return tab.id; });
    if (allowedTabs.indexOf(currentTab) === -1) currentTab = 'business';

    var panelHtml;
    if (currentTab === 'business')          panelHtml = renderBusiness();
    else if (currentTab === 'integrations') panelHtml = renderIntegrations();
    else if (currentTab === 'ai')           panelHtml = renderAI();
    else {
      /* Subscription tab: render with loading state, then fetch real status */
      panelHtml = renderSubscription(undefined); // undefined = loading
    }

    container.innerHTML = [
      '<div class="page-header">',
      '  <div>',
      '    <h1 class="page-title">' + esc(t('settings_title')) + '</h1>',
      '    <p class="page-sub">' + esc(t('sub_settings2')) + '</p>',
      '  </div>',
      '</div>',

      '<div class="settings-layout">',

      /* Left nav */
      '  <nav class="settings-nav">' + renderNav() + '</nav>',

      /* Right panel */
      '  <div class="settings-panel">' + panelHtml + '</div>',

      '</div>'
    ].join('\n');

    /* Populate form values safely via .value (not innerHTML) */
    populateFields();

    /* Attach event listeners */
    bindEvents(container);

    /* If subscription tab: fetch real billing status then re-render panel */
    if (currentTab === 'subscription' && window.API) {
      API.get('/api/billing/status')
        .then(function(status) {
          _billingStatus = status;
          var panel = container.querySelector('.settings-panel');
          if (panel) {
            panel.innerHTML = renderSubscription(_billingStatus);
            bindBillingEvents(container);
          }
        })
        .catch(function() {
          _billingStatus = null;
          var panel = container.querySelector('.settings-panel');
          if (panel) {
            panel.innerHTML = renderSubscription(null);
            bindBillingEvents(container);
          }
        });
    }

    /* Handle Stripe redirect callbacks (stored in localStorage by main.js) */
    var checkout = localStorage.getItem('sfai_checkout');
    if (checkout) {
      localStorage.removeItem('sfai_checkout');
      if (checkout === 'success') {
        if (window.Toast) Toast.show('✅ Abonnement activé — bienvenue !', 'success');
      } else if (checkout === 'cancel') {
        if (window.Toast) Toast.show('Paiement annulé.', 'error');
      }
    }
  }

  function bindBillingEvents(container) {
    var subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', function() {
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = '…';
        API.post('/api/billing/checkout', {})
          .then(function(data) {
            if (data && data.url) window.location.href = data.url;
            else throw new Error('No URL');
          })
          .catch(function(err) {
            subscribeBtn.disabled = false;
            subscribeBtn.textContent = I18n.getLang() === 'en' ? '💳 Subscribe now' : '💳 S\'abonner maintenant';
            if (window.Toast) Toast.show(err.message || 'Erreur Stripe', 'error');
          });
      });
    }

    var manageBtn = document.getElementById('manageSubBtn');
    if (manageBtn) {
      manageBtn.addEventListener('click', function() {
        manageBtn.disabled = true;
        API.get('/api/billing/portal')
          .then(function(data) {
            if (data && data.url) window.location.href = data.url;
            else throw new Error('No URL');
          })
          .catch(function(err) {
            manageBtn.disabled = false;
            if (window.Toast) Toast.show(err.message || 'Erreur portail', 'error');
          });
      });
    }
  }

  window.SettingsPage = { render: render };

  document.addEventListener('sfai:lang-changed', function() {
    var app = document.getElementById('app');
    if (window.location.hash === '#/settings' && app) {
      SettingsPage.render(app);
    }
  });
})();
