var I18n = (function() {
  'use strict';

  var TRANSLATIONS = {
    fr: {
      // Navigation
      nav_dashboard:    'Tableau de bord',
      nav_reviews:      'Tous les avis',
      nav_analytics:    'Analytique IA',
      nav_settings:     'Paramètres',
      nav_admin:        'Administration',
      nav_plan:         'Plan Pro',

      // Topnav subtitles
      sub_dashboard:    'Aperçu de vos avis clients en temps réel',
      sub_reviews:      'Gérez et répondez à vos avis clients',
      sub_analytics:    'Insights générés par intelligence artificielle',
      sub_settings:     'Configuration de votre établissement',
      search_placeholder: 'Rechercher un avis…',

      // Dashboard
      total_reviews:    'Total des avis',
      avg_rating:       'Note moyenne',
      pending_response: 'En attente de réponse',
      reviews_today:    'nouveaux aujourd\'hui',
      recent_reviews:   'Avis récents',
      see_all:          'Voir tous →',
      urgent_reviews:   'avis urgent(s) sans réponse',
      no_reviews:       'Aucun avis dans cette catégorie.',
      filter_all:       'Tous',
      filter_pending:   'En attente',
      filter_responded: 'Répondus',
      filter_5stars:    '⭐ 5 étoiles',
      sentiment_trend:  'Tendances sentiment',
      rating_breakdown: 'Répartition des notes',
      response_rate:    'Taux de réponse',
      avg_delay:        'Délai moyen',
      positive:         'Positif',
      negative:         'Négatif',
      months_ago:       'mois',
      collected:        'avis collectés',

      // Reviews page
      all_reviews:      'Tous les avis',
      sub_manage:       'Gérez et répondez à l\'ensemble de vos avis clients',
      all_sources:      'Toutes les sources',
      all_ratings:      'Toutes les notes',
      all_statuses:     'Tous les statuts',
      export_csv:       'Exporter CSV',
      reviews_found:    'avis trouvé(s)',
      no_results:       'Aucun avis ne correspond à votre recherche.',
      prev_page:        '← Précédent',
      next_page:        'Suivant →',
      page_of:          'Page',
      status_pending:   'En attente',
      status_responded: 'Répondu',
      generate_ai:      'Générer une réponse IA',
      ignore:           'Ignorer',

      // Analytics
      analytics_title:  'Analytique IA',
      sub_analytics2:   'Insights générés par intelligence artificielle',
      nps_score:        'Score NPS',
      promoters_detractors: 'Promoteurs – Détracteurs',
      positive_sentiment: 'Sentiment Positif',
      reviews_4_5:      'Avis 4★ et 5★',
      response_rate_kpi:'Taux de Réponse',
      reviews_count:    'avis',
      rating_evolution: 'Évolution de la note (6 mois)',
      source_breakdown: 'Répartition par source',
      keywords:         'Mots-clés récurrents',
      ai_insights:      '💡 Insights IA',
      no_data:          'Aucune donnée',

      // Settings
      settings_title:   'Paramètres',
      sub_settings2:    'Configuration de votre établissement',
      tab_business:     'Établissement',
      tab_integrations: 'Intégrations',
      tab_ai:           'IA & Réponses',
      tab_subscription: 'Abonnement',
      biz_name:         'Nom de l\'établissement',
      biz_street:       'Adresse (rue)',
      biz_city:         'Ville',
      biz_postal_ca:    'Code postal',
      biz_postal_us:    'ZIP Code',
      biz_country:      'Pays',
      biz_province:     'Province',
      biz_state:        'State',
      biz_category:     'Catégorie',
      response_lang:    'Langue des réponses',
      save:             'Enregistrer',
      saved:            'Paramètres enregistrés',
      integrations:     'Intégrations',
      connected:        'Connecté',
      disconnected:     'Déconnecté',
      connect_google:   'Connecter avec Google',
      setup_location:   'Configurer l\'établissement →',
      sync_now:         'Synchroniser maintenant',
      syncing:          'Synchronisation…',
      no_locations:     'Aucun établissement Google trouvé pour ce compte.',
      select_location:  'Sélectionne ton établissement Google',
      ai_provider:      'Fournisseur IA',
      api_key:          'Clé API',
      test_connection:  'Tester',
      testing:          'Test en cours…',
      default_tone:     'Ton par défaut',
      demo_mode:        'Démonstration (sans clé)',
      subscription:     'Abonnement',
      currency:         'Devise',
      subtotal:         'Sous-total',
      taxes:            'Taxes',
      total:            'Total',
      per_month:        '/ mois',
      no_tax:           'Aucune taxe de vente applicable',
      features_included:'Fonctionnalités incluses',
      manage_sub:       'Gérer l\'abonnement',
      upgrade_title:    'Plan Business',
      upgrade_sub:      'Équipes illimitées · API sur mesure · Support prioritaire 24/7',
      upgrade_cta:      'Découvrir Business →',

      // Slideover
      generate_response:'Générer une réponse IA',
      reply_to:         'Répondre à l\'avis de',
      original_review:  'Avis original',
      response_tone:    'Ton de la réponse',
      generated:        'Réponse générée',
      tone_professional:'Professionnel',
      tone_warm:        'Chaleureux',
      tone_formal:      'Formel',
      tone_casual:      'Décontracté',
      generating:       'L\'IA génère votre réponse personnalisée…',
      regenerate:       'Régénérer',
      edit:             'Modifier',
      publish:          'Publier la réponse',
      published:        'Réponse publiée avec succès !',
      chars:            'caractères',
      write_response:   'Veuillez générer ou écrire une réponse.',

      // Login
      login_title:      'SmartFeedback AI',
      login_sub:        'Connectez-vous pour accéder à votre tableau de bord',
      login_google:     'Continuer avec Google',
      login_note:       'Vos avis Google sont synchronisés automatiquement',

      // Toast
      settings_saved:    'Paramètres enregistrés',
      google_disconnected:'Compte Google déconnecté',
      sync_launched:     'Synchronisation lancée — les avis arrivent dans quelques secondes',
      sync_error:        'Erreur de synchronisation',
      location_connected:'Établissement connecté — synchronisation en cours…',
      connection_error:  'Impossible de récupérer les établissements',
      location_error:    'Erreur lors de la connexion',
      ai_settings_saved: 'Paramètres IA enregistrés',
      enter_api_key:     'Veuillez saisir une clé API',
      connection_ok:     'Connexion réussie ✓',
      invalid_key:       'Clé invalide ou erreur API',
      network_error:     'Erreur réseau — réessayez',
      custom_required:   'Endpoint et modèle sont requis pour un fournisseur personnalisé.',
      csv_exported:      'Export CSV téléchargé',
    },

    en: {
      // Navigation
      nav_dashboard:    'Dashboard',
      nav_reviews:      'All Reviews',
      nav_analytics:    'AI Analytics',
      nav_settings:     'Settings',
      nav_admin:        'Administration',
      nav_plan:         'Pro Plan',

      // Topnav subtitles
      sub_dashboard:    'Real-time overview of your customer reviews',
      sub_reviews:      'Manage and respond to your customer reviews',
      sub_analytics:    'AI-generated insights from your reviews',
      sub_settings:     'Configure your establishment',
      search_placeholder: 'Search a review…',

      // Dashboard
      total_reviews:    'Total Reviews',
      avg_rating:       'Average Rating',
      pending_response: 'Awaiting Response',
      reviews_today:    'new today',
      recent_reviews:   'Recent Reviews',
      see_all:          'See all →',
      urgent_reviews:   'urgent review(s) without response',
      no_reviews:       'No reviews in this category.',
      filter_all:       'All',
      filter_pending:   'Pending',
      filter_responded: 'Responded',
      filter_5stars:    '⭐ 5 stars',
      sentiment_trend:  'Sentiment Trends',
      rating_breakdown: 'Rating Breakdown',
      response_rate:    'Response Rate',
      avg_delay:        'Avg. Delay',
      positive:         'Positive',
      negative:         'Negative',
      months_ago:       'months',
      collected:        'reviews collected',

      // Reviews page
      all_reviews:      'All Reviews',
      sub_manage:       'Manage and respond to all your customer reviews',
      all_sources:      'All sources',
      all_ratings:      'All ratings',
      all_statuses:     'All statuses',
      export_csv:       'Export CSV',
      reviews_found:    'review(s) found',
      no_results:       'No reviews match your search.',
      prev_page:        '← Previous',
      next_page:        'Next →',
      page_of:          'Page',
      status_pending:   'Pending',
      status_responded: 'Responded',
      generate_ai:      'Generate AI Response',
      ignore:           'Ignore',

      // Analytics
      analytics_title:  'AI Analytics',
      sub_analytics2:   'AI-generated insights from your reviews',
      nps_score:        'NPS Score',
      promoters_detractors: 'Promoters – Detractors',
      positive_sentiment: 'Positive Sentiment',
      reviews_4_5:      '4★ and 5★ reviews',
      response_rate_kpi:'Response Rate',
      reviews_count:    'reviews',
      rating_evolution: 'Rating Evolution (6 months)',
      source_breakdown: 'Breakdown by Source',
      keywords:         'Recurring Keywords',
      ai_insights:      '💡 AI Insights',
      no_data:          'No data',

      // Settings
      settings_title:   'Settings',
      sub_settings2:    'Configure your establishment',
      tab_business:     'Establishment',
      tab_integrations: 'Integrations',
      tab_ai:           'AI & Responses',
      tab_subscription: 'Subscription',
      biz_name:         'Establishment Name',
      biz_street:       'Street Address',
      biz_city:         'City',
      biz_postal_ca:    'Postal Code',
      biz_postal_us:    'ZIP Code',
      biz_country:      'Country',
      biz_province:     'Province',
      biz_state:        'State',
      biz_category:     'Category',
      response_lang:    'Response Language',
      save:             'Save',
      saved:            'Settings saved',
      integrations:     'Integrations',
      connected:        'Connected',
      disconnected:     'Disconnected',
      connect_google:   'Connect with Google',
      setup_location:   'Set up establishment →',
      sync_now:         'Sync Now',
      syncing:          'Syncing…',
      no_locations:     'No Google establishment found for this account.',
      select_location:  'Select your Google establishment',
      ai_provider:      'AI Provider',
      api_key:          'API Key',
      test_connection:  'Test',
      testing:          'Testing…',
      default_tone:     'Default Tone',
      demo_mode:        'Demo (no key required)',
      subscription:     'Subscription',
      currency:         'Currency',
      subtotal:         'Subtotal',
      taxes:            'Taxes',
      total:            'Total',
      per_month:        '/ month',
      no_tax:           'No sales tax applicable',
      features_included:'Included Features',
      manage_sub:       'Manage Subscription',
      upgrade_title:    'Business Plan',
      upgrade_sub:      'Unlimited teams · Custom API · 24/7 priority support',
      upgrade_cta:      'Discover Business →',

      // Slideover
      generate_response:'Generate AI Response',
      reply_to:         'Reply to review by',
      original_review:  'Original Review',
      response_tone:    'Response Tone',
      generated:        'Generated Response',
      tone_professional:'Professional',
      tone_warm:        'Warm',
      tone_formal:      'Formal',
      tone_casual:      'Casual',
      generating:       'AI is generating your personalized response…',
      regenerate:       'Regenerate',
      edit:             'Edit',
      publish:          'Publish Response',
      published:        'Response published successfully!',
      chars:            'characters',
      write_response:   'Please generate or write a response.',

      // Login
      login_title:      'SmartFeedback AI',
      login_sub:        'Sign in to access your dashboard',
      login_google:     'Continue with Google',
      login_note:       'Your Google reviews are synced automatically',

      // Toast
      settings_saved:    'Settings saved',
      google_disconnected:'Google account disconnected',
      sync_launched:     'Sync launched — reviews will arrive in a few seconds',
      sync_error:        'Sync error',
      location_connected:'Establishment connected — syncing…',
      connection_error:  'Unable to fetch establishments',
      location_error:    'Connection error',
      ai_settings_saved: 'AI settings saved',
      enter_api_key:     'Please enter an API key',
      connection_ok:     'Connection successful ✓',
      invalid_key:       'Invalid key or API error',
      network_error:     'Network error — please retry',
      custom_required:   'Endpoint and model are required for a custom provider.',
      csv_exported:      'CSV export downloaded',
    }
  };

  var currentLang = localStorage.getItem('sfai_lang') || 'fr';

  function t(key, vars) {
    var dict = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;
    var str  = dict[key] || TRANSLATIONS.fr[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function getLang() { return currentLang; }

  function setLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('sfai_lang', lang);
    // Re-render current page
    document.dispatchEvent(new CustomEvent('sfai:lang-changed', { detail: { lang: lang } }));
  }

  return { t: t, getLang: getLang, setLang: setLang };
})();

window.I18n = I18n;
window.t = function(key, vars) { return I18n.t(key, vars); };
