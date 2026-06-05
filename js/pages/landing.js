var LandingPage = (function() {
  'use strict';

  var STRINGS = {
    fr: {
      navLogin: 'Se connecter',
      navSignup: 'Commencer gratuitement',
      heroH1: 'Gérez tous vos avis clients<br>avec l\'<span>intelligence artificielle</span>',
      heroSub: 'Centralisez vos avis Google, TripAdvisor et Yelp. Générez des réponses professionnelles en quelques secondes. Pour tout type d\'entreprise.',
      heroCtaSignup: '🚀 Commencer gratuitement',
      heroCtaLogin: 'Se connecter →',
      previewLabel: 'SmartFeedback AI — Dashboard',
      previewReview: '"Personnel très professionnel, service impeccable. Je recommande vivement !"',
      previewChip: 'Réponse IA générée en 2 sec',
      previewReply: '"Merci beaucoup pour votre retour, Claire ! Nous sommes ravis que votre expérience ait été à la hauteur de vos attentes. Toute l\'équipe vous remercie !"',
      previewStat1: 'Avis répondus',
      previewStat2: 'Note moyenne',
      previewStat3: 'En attente',
      sectorsEyebrow: 'Pour tous les secteurs qui reçoivent des avis clients',
      sectors: ['🍽️ Restaurants', '🏨 Hôtels &amp; hébergements', '🏥 Cliniques &amp; santé', '💇 Salons &amp; beauté', '🏋️ Fitness &amp; sport', '🛍️ Commerce de détail', '🚗 Garages &amp; auto', '⚖️ Services professionnels'],
      sourcesEyebrow: 'Connecté à vos plateformes d\'avis',
      featLabel: 'Fonctionnalités',
      featTitle: 'Tout ce dont votre entreprise a besoin',
      featSub: 'Un tableau de bord centralisé pour piloter votre réputation en ligne en quelques minutes par semaine.',
      feats: [
        { title: 'Réponses IA en 1 clic', desc: 'Génère des réponses personnalisées et professionnelles pour chaque avis, quel que soit le secteur.' },
        { title: 'Tableau de bord centralisé', desc: 'Tous vos avis Google, TripAdvisor et Yelp au même endroit. Fini de jongler entre les plateformes.' },
        { title: 'Analytique IA', desc: 'Analyse des sentiments, tendances et suggestions pour améliorer continuellement votre offre.' },
        { title: 'Ton personnalisable', desc: 'Professionnel, chaleureux, formel ou décontracté — adaptez le ton à l\'image de votre marque.' },
        { title: 'Sécurité &amp; confidentialité', desc: 'Vos données sont chiffrées et ne sont jamais partagées avec des tiers. Conforme RGPD.' },
        { title: 'Alertes en temps réel', desc: 'Soyez alerté immédiatement dès qu\'un nouvel avis négatif est posté pour réagir rapidement.' }
      ],
      testiLabel: 'Témoignages',
      testiTitle: 'Ils nous font confiance',
      testiSub: 'Des professionnels de tous secteurs qui ont transformé leur gestion des avis.',
      testis: [
        { quote: '"En 2 semaines, notre note Google est passée de 4,1 à 4,7. Les réponses IA sont vraiment personnalisées, pas des copier-coller génériques."', name: 'Sophie Laurent', role: '🍽️ Brasserie Le Central, Lyon', initials: 'SL', color: '#4F46E5' },
        { quote: '"Notre clinique reçoit des dizaines d\'avis par semaine. SmartFeedback AI nous fait gagner des heures tout en maintenant un ton professionnel et empathique."', name: 'Dr. Rousseau', role: '🏥 Clinique Santé Plus, Montréal', initials: 'DR', color: '#10B981' },
        { quote: '"L\'analyse des sentiments nous a révélé ce que nos clients appréciaient vraiment dans notre hôtel. On a pu agir concrètement et nos réservations ont augmenté."', name: 'Karim Mansouri', role: '🏨 Hôtel Lumière, Paris', initials: 'KM', color: '#F97316' }
      ],
      faqLabel: 'FAQ',
      faqTitle: 'Questions fréquentes',
      faqSub: 'Tout ce que vous voulez savoir avant de commencer.',
      faqs: [
        { q: 'Pour quel type d\'entreprise SmartFeedback AI est-il conçu ?', a: 'Pour toute entreprise qui reçoit des avis clients en ligne : restaurants, hôtels, cliniques, salons, commerces, garages, services professionnels… Si vous avez une fiche Google Business, vous pouvez en bénéficier.' },
        { q: 'Comment les réponses sont-elles générées ?', a: 'Notre IA s\'appuie sur les dernières avancées en intelligence artificielle. Elle analyse le contexte de chaque avis — note, ton, sujet — pour générer une réponse naturelle et adaptée à votre secteur.' },
        { q: 'Puis-je modifier les réponses avant de les publier ?', a: 'Absolument. Toutes les réponses générées sont éditables avant publication. Vous gardez le contrôle total sur ce qui est publié au nom de votre entreprise.' },
        { q: 'Quelles plateformes d\'avis sont supportées ?', a: 'Actuellement Google, TripAdvisor et Yelp. D\'autres plateformes (Booking.com, Facebook, Pages Jaunes) seront ajoutées prochainement.' },
        { q: 'Comment démarrer ?', a: 'Créez votre compte en 2 minutes, configurez votre profil d\'entreprise, et commencez à générer des réponses immédiatement. Aucune installation requise, tout fonctionne dans le navigateur.' }
      ],
      ctaTitle: 'Prêt à maîtriser votre réputation en ligne ?',
      ctaSub: 'Rejoignez les entreprises qui gagnent du temps et améliorent leur note grâce à l\'IA.',
      ctaSignup: '🚀 Commencer gratuitement',
      ctaLogin: 'Se connecter',
      footerCopy: '© 2026 SmartFeedback AI. Tous droits réservés.',
      footerPrivacy: 'Confidentialité',
      footerContract: 'Contrat',
      footerContact: 'Contact',
      back: '← Retour'
    },
    en: {
      navLogin: 'Sign in',
      navSignup: 'Get started free',
      heroH1: 'Manage all your customer reviews<br>with <span>artificial intelligence</span>',
      heroSub: 'Centralize your Google, TripAdvisor and Yelp reviews. Generate professional responses in seconds. For any type of business.',
      heroCtaSignup: '🚀 Get started free',
      heroCtaLogin: 'Sign in →',
      previewLabel: 'SmartFeedback AI — Dashboard',
      previewReview: '"Very professional staff, impeccable service. Highly recommend!"',
      previewChip: 'AI response generated in 2 sec',
      previewReply: '"Thank you so much for your feedback, Claire! We\'re thrilled that your experience met your expectations. The whole team thanks you!"',
      previewStat1: 'Reviews answered',
      previewStat2: 'Average rating',
      previewStat3: 'Pending',
      sectorsEyebrow: 'For every industry that receives customer reviews',
      sectors: ['🍽️ Restaurants', '🏨 Hotels &amp; accommodation', '🏥 Clinics &amp; healthcare', '💇 Salons &amp; beauty', '🏋️ Fitness &amp; sports', '🛍️ Retail', '🚗 Garages &amp; auto', '⚖️ Professional services'],
      sourcesEyebrow: 'Connected to your review platforms',
      featLabel: 'Features',
      featTitle: 'Everything your business needs',
      featSub: 'A centralized dashboard to manage your online reputation in just minutes per week.',
      feats: [
        { title: 'AI responses in 1 click', desc: 'Generate personalized, professional responses for every review, in any industry.' },
        { title: 'Centralized dashboard', desc: 'All your Google, TripAdvisor and Yelp reviews in one place. No more switching between platforms.' },
        { title: 'AI Analytics', desc: 'Sentiment analysis, trends and suggestions to continuously improve your offering.' },
        { title: 'Customizable tone', desc: 'Professional, warm, formal or casual — adapt the tone to match your brand image.' },
        { title: 'Security &amp; privacy', desc: 'Your data is encrypted and never shared with third parties. GDPR compliant.' },
        { title: 'Real-time alerts', desc: 'Get notified immediately when a new negative review is posted so you can respond quickly.' }
      ],
      testiLabel: 'Testimonials',
      testiTitle: 'They trust us',
      testiSub: 'Professionals from all industries who transformed how they manage reviews.',
      testis: [
        { quote: '"In 2 weeks, our Google rating went from 4.1 to 4.7. The AI responses are truly personalized, not generic copy-paste."', name: 'Sophie Laurent', role: '🍽️ Brasserie Le Central, Lyon', initials: 'SL', color: '#4F46E5' },
        { quote: '"Our clinic receives dozens of reviews per week. SmartFeedback AI saves us hours while maintaining a professional and empathetic tone."', name: 'Dr. Rousseau', role: '🏥 Clinique Santé Plus, Montreal', initials: 'DR', color: '#10B981' },
        { quote: '"The sentiment analysis revealed what our guests truly appreciated about our hotel. We took action and our bookings increased."', name: 'Karim Mansouri', role: '🏨 Hôtel Lumière, Paris', initials: 'KM', color: '#F97316' }
      ],
      faqLabel: 'FAQ',
      faqTitle: 'Frequently asked questions',
      faqSub: 'Everything you need to know before getting started.',
      faqs: [
        { q: 'What type of business is SmartFeedback AI designed for?', a: 'Any business that receives online customer reviews: restaurants, hotels, clinics, salons, shops, garages, professional services… If you have a Google Business profile, you can benefit.' },
        { q: 'How are responses generated?', a: 'Our AI leverages the latest advances in artificial intelligence. It analyzes the context of each review — rating, tone, subject — to generate a natural response tailored to your industry.' },
        { q: 'Can I edit responses before publishing?', a: 'Absolutely. All generated responses are editable before publication. You keep full control over what is published on behalf of your business.' },
        { q: 'Which review platforms are supported?', a: 'Currently Google, TripAdvisor and Yelp. More platforms (Booking.com, Facebook, Yellow Pages) will be added soon.' },
        { q: 'How do I get started?', a: 'Create your account in 2 minutes, set up your business profile, and start generating responses immediately. No installation required, everything works in the browser.' }
      ],
      ctaTitle: 'Ready to master your online reputation?',
      ctaSub: 'Join businesses that save time and improve their rating with AI.',
      ctaSignup: '🚀 Get started free',
      ctaLogin: 'Sign in',
      footerCopy: '© 2026 SmartFeedback AI. All rights reserved.',
      footerPrivacy: 'Privacy',
      footerContract: 'Terms',
      footerContact: 'Contact',
      back: '← Back'
    }
  };

  var FEAT_ICONS = [
    '<svg width="20" height="20" fill="none" stroke="#4F46E5" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg>',
    '<svg width="20" height="20" fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>',
    '<svg width="20" height="20" fill="none" stroke="#F97316" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
    '<svg width="20" height="20" fill="none" stroke="#8B5CF6" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
    '<svg width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    '<svg width="20" height="20" fill="none" stroke="#22C55E" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.1 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.91 10a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.92z"/></svg>'
  ];
  var FEAT_BGS = ['background:var(--primary-light)', 'background:var(--green-bg)', 'background:var(--orange-bg)', 'background:var(--primary-ultra)', 'background:#FEF2F2', 'background:#F0FDF4'];

  function showAuth(container, page) {
    if (page === 'onboarding' && window.OnboardingPage) {
      OnboardingPage.render(container);
    } else if (window.LoginPage) {
      LoginPage.render(container);
    }
    var lang = localStorage.getItem('sfai_landing_lang') || 'fr';
    var s = STRINGS[lang] || STRINGS.fr;
    var back = document.createElement('button');
    back.className = 'lp-back';
    back.innerHTML = s.back;
    back.addEventListener('click', function() { render(container); });
    container.appendChild(back);
  }

  function render(container, langOverride) {
    var lang = langOverride || localStorage.getItem('sfai_landing_lang') || 'fr';
    localStorage.setItem('sfai_landing_lang', lang);
    var s = STRINGS[lang] || STRINGS.fr;
    var otherLang = lang === 'fr' ? 'EN' : 'FR';

    container.innerHTML = [
      '<div class="lp-root">',

      // NAV
      '  <nav class="lp-nav">',
      '    <div class="lp-logo">',
      '      <div class="lp-logo-icon"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg></div>',
      '      <span class="lp-logo-text">SmartFeedback AI</span>',
      '    </div>',
      '    <div class="lp-nav-actions">',
      '      <button class="lp-btn-lang" id="lpLangToggle">' + otherLang + '</button>',
      '      <button class="lp-btn-ghost" id="lpNavLogin">' + s.navLogin + '</button>',
      '      <button class="lp-btn-primary" id="lpNavSignup">' + s.navSignup + '</button>',
      '    </div>',
      '  </nav>',

      // HERO
      '  <section class="lp-hero">',
      '    <h1>' + s.heroH1 + '</h1>',
      '    <p class="lp-hero-sub">' + s.heroSub + '</p>',
      '    <div class="lp-hero-ctas">',
      '      <button class="lp-btn-primary" id="lpHeroSignup">' + s.heroCtaSignup + '</button>',
      '      <button class="lp-btn-ghost" id="lpHeroLogin">' + s.heroCtaLogin + '</button>',
      '    </div>',
      '    <div class="lp-preview">',
      '      <div class="lp-preview-bar"><span class="lp-dot" style="background:#EF4444"></span><span class="lp-dot" style="background:#F59E0B"></span><span class="lp-dot" style="background:#10B981"></span><span style="margin-left:8px;font-size:11px;color:#9CA3AF">' + s.previewLabel + '</span></div>',
      '      <div class="lp-preview-body">',
      '        <div class="lp-rev">',
      '          <div class="lp-avatar" style="background:#4F46E5">CL</div>',
      '          <div style="flex:1">',
      '            <div class="lp-stars">★★★★★</div>',
      '            <div style="font-size:12px;color:#374151;line-height:1.4">' + s.previewReview + '</div>',
      '            <div class="lp-chip"><svg width="11" height="11" fill="none" stroke="#4F46E5" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg> ' + s.previewChip + '</div>',
      '            <div class="lp-ai-resp">' + s.previewReply + '</div>',
      '          </div>',
      '        </div>',
      '        <div class="lp-stat-row">',
      '          <div class="lp-stat" style="background:var(--green-bg);border:1px solid #D1FAE5"><div class="lp-stat-num" style="color:#059669">94%</div><div class="lp-stat-lbl">' + s.previewStat1 + '</div></div>',
      '          <div class="lp-stat" style="background:var(--primary-light);border:1px solid var(--primary-mid)"><div class="lp-stat-num" style="color:#4F46E5">4.8★</div><div class="lp-stat-lbl">' + s.previewStat2 + '</div></div>',
      '          <div class="lp-stat" style="background:var(--orange-bg);border:1px solid #FED7AA"><div class="lp-stat-num" style="color:#EA580C">3</div><div class="lp-stat-lbl">' + s.previewStat3 + '</div></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </section>',

      // SECTEURS
      '  <div class="lp-sectors">',
      '    <div class="lp-eyebrow">' + s.sectorsEyebrow + '</div>',
      '    <div class="lp-sector-row">',
      s.sectors.map(function(sec) { return '<span class="lp-sector">' + sec + '</span>'; }).join(''),
      '    </div>',
      '  </div>',

      // SOURCES
      '  <div class="lp-sources">',
      '    <div class="lp-eyebrow">' + s.sourcesEyebrow + '</div>',
      '    <div class="lp-source-row">',
      '      <div class="lp-source"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg> Google</div>',
      '      <span style="color:#D1D5DB">·</span>',
      '      <div class="lp-source" style="color:#00AF87">✈ TripAdvisor</div>',
      '      <span style="color:#D1D5DB">·</span>',
      '      <div class="lp-source" style="color:#FF1A1A">★ Yelp</div>',
      '    </div>',
      '  </div>',

      // FEATURES
      '  <section class="lp-features">',
      '    <div class="lp-section-label">' + s.featLabel + '</div>',
      '    <h2 class="lp-section-title">' + s.featTitle + '</h2>',
      '    <p class="lp-section-sub">' + s.featSub + '</p>',
      '    <div class="lp-feat-grid">',
      s.feats.map(function(f, i) {
        return '<div class="lp-feat"><div class="lp-feat-icon" style="' + FEAT_BGS[i] + '">' + FEAT_ICONS[i] + '</div><h3>' + f.title + '</h3><p>' + f.desc + '</p></div>';
      }).join(''),
      '    </div>',
      '  </section>',

      // TÉMOIGNAGES
      '  <section class="lp-testi">',
      '    <div class="lp-section-label">' + s.testiLabel + '</div>',
      '    <h2 class="lp-section-title">' + s.testiTitle + '</h2>',
      '    <p class="lp-section-sub">' + s.testiSub + '</p>',
      '    <div class="lp-testi-grid">',
      s.testis.map(function(t) {
        return '<div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">' + t.quote + '</p><div class="lp-author"><div class="lp-avatar" style="background:' + t.color + '">' + t.initials + '</div><div><div class="lp-author-name">' + t.name + '</div><div class="lp-author-role">' + t.role + '</div></div></div></div>';
      }).join(''),
      '    </div>',
      '  </section>',

      // FAQ
      '  <section class="lp-faq">',
      '    <div class="lp-section-label">' + s.faqLabel + '</div>',
      '    <h2 class="lp-section-title">' + s.faqTitle + '</h2>',
      '    <p class="lp-section-sub">' + s.faqSub + '</p>',
      '    <div class="lp-faq-list">',
      s.faqs.map(function(f) {
        return '<div class="lp-faq-item"><div class="lp-faq-q">' + f.q + '<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">' + f.a + '</div></div>';
      }).join(''),
      '    </div>',
      '  </section>',

      // CTA FINAL
      '  <section class="lp-cta">',
      '    <h2>' + s.ctaTitle + '</h2>',
      '    <p>' + s.ctaSub + '</p>',
      '    <button class="lp-btn-white" id="lpCtaSignup">' + s.ctaSignup + '</button>',
      '    <button class="lp-btn-outline" id="lpCtaLogin">' + s.ctaLogin + '</button>',
      '  </section>',

      // FOOTER
      '  <footer class="lp-footer">',
      '    <span>' + s.footerCopy + '</span>',
      '    <div>',
      '      <a id="lpFooterPrivacy">' + s.footerPrivacy + '</a>',
      '      <a id="lpFooterContract">' + s.footerContract + '</a>',
      '      <a href="mailto:jeaneveillard@gmail.com">' + s.footerContact + '</a>',
      '    </div>',
      '  </footer>',

      '</div>'
    ].join('');

    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
    on('lpLangToggle',    function() { render(container, lang === 'fr' ? 'en' : 'fr'); });
    on('lpNavLogin',      function() { showAuth(container, 'login'); });
    on('lpNavSignup',     function() { showAuth(container, 'onboarding'); });
    on('lpHeroLogin',     function() { showAuth(container, 'login'); });
    on('lpHeroSignup',    function() { showAuth(container, 'onboarding'); });
    on('lpCtaLogin',      function() { showAuth(container, 'login'); });
    on('lpCtaSignup',     function() { showAuth(container, 'onboarding'); });
    on('lpFooterPrivacy', function() { if (window.PrivacyModal) PrivacyModal.show(); });
    on('lpFooterContract',function() { if (window.ContractModal) ContractModal.show(); });
  }

  return { render: render };
})();
window.LandingPage = LandingPage;
