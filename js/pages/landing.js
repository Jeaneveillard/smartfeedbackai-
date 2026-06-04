var LandingPage = (function() {
  'use strict';

  function showAuth(container, page) {
    // page === 'login' | 'signup'
    if (page === 'signup' && window.SignupPage) {
      SignupPage.render(container);
    } else if (window.LoginPage) {
      LoginPage.render(container);
    }
    // Bouton retour flottant
    var back = document.createElement('button');
    back.className = 'lp-back';
    back.innerHTML = '← Retour';
    back.addEventListener('click', function() { render(container); });
    container.appendChild(back);
  }

  function render(container) {
    container.innerHTML = [
      '<div class="lp-root">',

      // NAV
      '  <nav class="lp-nav">',
      '    <div class="lp-logo">',
      '      <div class="lp-logo-icon"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg></div>',
      '      <span class="lp-logo-text">SmartFeedback AI</span>',
      '    </div>',
      '    <div class="lp-nav-actions">',
      '      <button class="lp-btn-ghost" id="lpNavLogin">Se connecter</button>',
      '      <button class="lp-btn-primary" id="lpNavSignup">Commencer gratuitement</button>',
      '    </div>',
      '  </nav>',

      // HERO
      '  <section class="lp-hero">',
      '    <div class="lp-badge"><svg width="12" height="12" fill="none" stroke="#4F46E5" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg> Propulsé par Claude AI (Anthropic)</div>',
      '    <h1>Gérez tous vos avis clients<br>avec l\'<span>intelligence artificielle</span></h1>',
      '    <p class="lp-hero-sub">Centralisez vos avis Google, TripAdvisor et Yelp. Générez des réponses professionnelles en quelques secondes. Pour tout type d\'entreprise.</p>',
      '    <div class="lp-hero-ctas">',
      '      <button class="lp-btn-primary" id="lpHeroSignup">🚀 Commencer gratuitement</button>',
      '      <button class="lp-btn-ghost" id="lpHeroLogin">Se connecter →</button>',
      '    </div>',
      '    <div class="lp-preview">',
      '      <div class="lp-preview-bar"><span class="lp-dot" style="background:#EF4444"></span><span class="lp-dot" style="background:#F59E0B"></span><span class="lp-dot" style="background:#10B981"></span><span style="margin-left:8px;font-size:11px;color:#9CA3AF">SmartFeedback AI — Dashboard</span></div>',
      '      <div class="lp-preview-body">',
      '        <div class="lp-rev">',
      '          <div class="lp-avatar" style="background:#4F46E5">CL</div>',
      '          <div style="flex:1">',
      '            <div class="lp-stars">★★★★★</div>',
      '            <div style="font-size:12px;color:#374151;line-height:1.4">"Personnel très professionnel, service impeccable. Je recommande vivement !"</div>',
      '            <div class="lp-chip"><svg width="11" height="11" fill="none" stroke="#4F46E5" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg> Réponse IA générée en 2 sec</div>',
      '            <div class="lp-ai-resp">"Merci beaucoup pour votre retour, Claire ! Nous sommes ravis que votre expérience ait été à la hauteur de vos attentes. Toute l\'équipe vous remercie !"</div>',
      '          </div>',
      '        </div>',
      '        <div class="lp-stat-row">',
      '          <div class="lp-stat" style="background:var(--green-bg);border:1px solid #D1FAE5"><div class="lp-stat-num" style="color:#059669">94%</div><div class="lp-stat-lbl">Avis répondus</div></div>',
      '          <div class="lp-stat" style="background:var(--primary-light);border:1px solid var(--primary-mid)"><div class="lp-stat-num" style="color:#4F46E5">4.8★</div><div class="lp-stat-lbl">Note moyenne</div></div>',
      '          <div class="lp-stat" style="background:var(--orange-bg);border:1px solid #FED7AA"><div class="lp-stat-num" style="color:#EA580C">3</div><div class="lp-stat-lbl">En attente</div></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </section>',

      // SECTEURS
      '  <div class="lp-sectors">',
      '    <div class="lp-eyebrow">Pour tous les secteurs qui reçoivent des avis clients</div>',
      '    <div class="lp-sector-row">',
      '      <span class="lp-sector">🍽️ Restaurants</span>',
      '      <span class="lp-sector">🏨 Hôtels &amp; hébergements</span>',
      '      <span class="lp-sector">🏥 Cliniques &amp; santé</span>',
      '      <span class="lp-sector">💇 Salons &amp; beauté</span>',
      '      <span class="lp-sector">🏋️ Fitness &amp; sport</span>',
      '      <span class="lp-sector">🛍️ Commerce de détail</span>',
      '      <span class="lp-sector">🚗 Garages &amp; auto</span>',
      '      <span class="lp-sector">⚖️ Services professionnels</span>',
      '    </div>',
      '  </div>',

      // SOURCES
      '  <div class="lp-sources">',
      '    <div class="lp-eyebrow">Connecté à vos plateformes d\'avis</div>',
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
      '    <div class="lp-section-label">Fonctionnalités</div>',
      '    <h2 class="lp-section-title">Tout ce dont votre entreprise a besoin</h2>',
      '    <p class="lp-section-sub">Un tableau de bord centralisé pour piloter votre réputation en ligne en quelques minutes par semaine.</p>',
      '    <div class="lp-feat-grid">',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--primary-light)"><svg width="20" height="20" fill="none" stroke="#4F46E5" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg></div><h3>Réponses IA en 1 clic</h3><p>Génère des réponses personnalisées et professionnelles pour chaque avis, quel que soit le secteur.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--green-bg)"><svg width="20" height="20" fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg></div><h3>Tableau de bord centralisé</h3><p>Tous vos avis Google, TripAdvisor et Yelp au même endroit. Fini de jongler entre les plateformes.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--orange-bg)"><svg width="20" height="20" fill="none" stroke="#F97316" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></div><h3>Analytique IA</h3><p>Analyse des sentiments, tendances et suggestions pour améliorer continuellement votre offre.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:var(--primary-ultra)"><svg width="20" height="20" fill="none" stroke="#8B5CF6" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg></div><h3>Ton personnalisable</h3><p>Professionnel, chaleureux, formel ou décontracté — adaptez le ton à l\'image de votre marque.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:#FEF2F2"><svg width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h3>Sécurité &amp; confidentialité</h3><p>Vos données sont chiffrées et ne sont jamais partagées avec des tiers. Conforme RGPD.</p></div>',
      '      <div class="lp-feat"><div class="lp-feat-icon" style="background:#F0FDF4"><svg width="20" height="20" fill="none" stroke="#22C55E" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.1 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.91 10a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.92z"/></svg></div><h3>Alertes en temps réel</h3><p>Soyez alerté immédiatement dès qu\'un nouvel avis négatif est posté pour réagir rapidement.</p></div>',
      '    </div>',
      '  </section>',

      // TÉMOIGNAGES
      '  <section class="lp-testi">',
      '    <div class="lp-section-label">Témoignages</div>',
      '    <h2 class="lp-section-title">Ils nous font confiance</h2>',
      '    <p class="lp-section-sub">Des professionnels de tous secteurs qui ont transformé leur gestion des avis.</p>',
      '    <div class="lp-testi-grid">',
      '      <div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">"En 2 semaines, notre note Google est passée de 4,1 à 4,7. Les réponses IA sont vraiment personnalisées, pas des copier-coller génériques."</p><div class="lp-author"><div class="lp-avatar" style="background:#4F46E5">SL</div><div><div class="lp-author-name">Sophie Laurent</div><div class="lp-author-role">🍽️ Brasserie Le Central, Lyon</div></div></div></div>',
      '      <div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">"Notre clinique reçoit des dizaines d\'avis par semaine. SmartFeedback AI nous fait gagner des heures tout en maintenant un ton professionnel et empathique."</p><div class="lp-author"><div class="lp-avatar" style="background:#10B981">DR</div><div><div class="lp-author-name">Dr. Rousseau</div><div class="lp-author-role">🏥 Clinique Santé Plus, Montréal</div></div></div></div>',
      '      <div class="lp-testi-card"><div class="lp-stars">★★★★★</div><p class="lp-quote">"L\'analyse des sentiments nous a révélé ce que nos clients appréciaient vraiment dans notre hôtel. On a pu agir concrètement et nos réservations ont augmenté."</p><div class="lp-author"><div class="lp-avatar" style="background:#F97316">KM</div><div><div class="lp-author-name">Karim Mansouri</div><div class="lp-author-role">🏨 Hôtel Lumière, Paris</div></div></div></div>',
      '    </div>',
      '  </section>',

      // FAQ
      '  <section class="lp-faq">',
      '    <div class="lp-section-label">FAQ</div>',
      '    <h2 class="lp-section-title">Questions fréquentes</h2>',
      '    <p class="lp-section-sub">Tout ce que vous voulez savoir avant de commencer.</p>',
      '    <div class="lp-faq-list">',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Pour quel type d\'entreprise SmartFeedback AI est-il conçu ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Pour toute entreprise qui reçoit des avis clients en ligne : restaurants, hôtels, cliniques, salons, commerces, garages, services professionnels… Si vous avez une fiche Google Business, vous pouvez en bénéficier.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Comment les réponses sont-elles générées ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Notre IA est basée sur Claude (Anthropic), l\'un des modèles les plus avancés du marché. Elle analyse le contexte de chaque avis — note, ton, sujet — pour générer une réponse naturelle et adaptée à votre secteur.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Puis-je modifier les réponses avant de les publier ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Absolument. Toutes les réponses générées sont éditables avant publication. Vous gardez le contrôle total sur ce qui est publié au nom de votre entreprise.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Quelles plateformes d\'avis sont supportées ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Actuellement Google, TripAdvisor et Yelp. D\'autres plateformes (Booking.com, Facebook, Pages Jaunes) seront ajoutées prochainement.</div></div>',
      '      <div class="lp-faq-item"><div class="lp-faq-q">Comment démarrer ?<span class="lp-faq-plus">+</span></div><div class="lp-faq-a">Créez votre compte en 2 minutes, configurez votre profil d\'entreprise, et commencez à générer des réponses immédiatement. Aucune installation requise, tout fonctionne dans le navigateur.</div></div>',
      '    </div>',
      '  </section>',

      // CTA FINAL
      '  <section class="lp-cta">',
      '    <h2>Prêt à maîtriser votre réputation en ligne ?</h2>',
      '    <p>Rejoignez les entreprises qui gagnent du temps et améliorent leur note grâce à l\'IA.</p>',
      '    <button class="lp-btn-white" id="lpCtaSignup">🚀 Commencer gratuitement</button>',
      '    <button class="lp-btn-outline" id="lpCtaLogin">Se connecter</button>',
      '  </section>',

      // FOOTER
      '  <footer class="lp-footer">',
      '    <span>© 2025 SmartFeedback AI. Tous droits réservés.</span>',
      '    <div>',
      '      <a id="lpFooterPrivacy">Confidentialité</a>',
      '      <a id="lpFooterContract">Contrat</a>',
      '      <a href="mailto:jeaneveillard@gmail.com">Contact</a>',
      '    </div>',
      '  </footer>',

      '</div>'
    ].join('');

    // CTA listeners
    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
    on('lpNavLogin',   function() { showAuth(container, 'login'); });
    on('lpNavSignup',  function() { showAuth(container, 'signup'); });
    on('lpHeroLogin',  function() { showAuth(container, 'login'); });
    on('lpHeroSignup', function() { showAuth(container, 'signup'); });
    on('lpCtaLogin',   function() { showAuth(container, 'login'); });
    on('lpCtaSignup',  function() { showAuth(container, 'signup'); });
    on('lpFooterPrivacy', function() { if (window.PrivacyModal) PrivacyModal.show(); });
    on('lpFooterContract', function() { if (window.ContractModal) ContractModal.show(); });
  }

  return { render: render };
})();
window.LandingPage = LandingPage;
