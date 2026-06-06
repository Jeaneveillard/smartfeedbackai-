var OnboardingPage = (function() {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function getApiBase() {
    if (window.API_BASE) return window.API_BASE;
    var h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3001';
    return 'https://smartfeedbackai-api.onrender.com';
  }

  var SECTORS = [
    'Restaurants',
    'Hôtels & hébergements',
    'Cliniques & santé',
    'Salons & beauté',
    'Fitness & sport',
    'Commerce de détail',
    'Garages & auto',
    'Services professionnels'
  ];

  function render(container) {
    var sectorOptions = SECTORS.map(function(s) {
      return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
    }).join('');

    container.innerHTML =
      '<div class="ob-wrap">' +
        '<div class="ob-card">' +

          '<div class="ob-logo">' +
            '<div class="ob-logo-icon">' +
              '<svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24">' +
                '<path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/>' +
              '</svg>' +
            '</div>' +
            '<h1 class="ob-title">Demande d\'accès</h1>' +
            '<p class="ob-subtitle">Remplissez ce formulaire pour demander l\'accès à SmartFeedback AI. L\'administrateur vous contactera sous 24–48h.</p>' +
          '</div>' +

          '<div class="ob-section-label">Votre établissement</div>' +
          '<div class="ob-grid">' +

            '<div class="ob-field full">' +
              '<label class="ob-label">Nom de l\'établissement<span class="ob-req">*</span></label>' +
              '<input class="ob-input" type="text" id="obBusinessName" placeholder="Le Bon Café, Clinique Santé+">' +
            '</div>' +

            '<div class="ob-field full">' +
              '<label class="ob-label">Secteur d\'activité<span class="ob-req">*</span></label>' +
              '<select class="ob-input" id="obSector">' +
                '<option value="">— Choisir —</option>' +
                sectorOptions +
              '</select>' +
            '</div>' +

            '<div class="ob-field full">' +
              '<label class="ob-label">Adresse complète<span class="ob-req">*</span></label>' +
              '<input class="ob-input" type="text" id="obAddress" placeholder="123 rue Principale">' +
            '</div>' +

            '<div class="ob-field">' +
              '<label class="ob-label">Ville<span class="ob-req">*</span></label>' +
              '<input class="ob-input" type="text" id="obCity" placeholder="Montréal">' +
            '</div>' +

            '<div class="ob-field">' +
              '<label class="ob-label">Site web</label>' +
              '<input class="ob-input" type="url" id="obWebsite" placeholder="https://monsite.com">' +
            '</div>' +

          '</div>' +

          '<div class="ob-section-label">Votre contact</div>' +
          '<div class="ob-grid">' +

            '<div class="ob-field full">' +
              '<label class="ob-label">Nom du contact<span class="ob-req">*</span></label>' +
              '<input class="ob-input" type="text" id="obContactName" placeholder="Marie Dupont">' +
            '</div>' +

            '<div class="ob-field">' +
              '<label class="ob-label">Email<span class="ob-req">*</span></label>' +
              '<input class="ob-input" type="email" id="obEmail" placeholder="contact@monsite.com">' +
            '</div>' +

            '<div class="ob-field">' +
              '<label class="ob-label">Téléphone</label>' +
              '<input class="ob-input" type="tel" id="obPhone" placeholder="514-555-0123">' +
            '</div>' +

          '</div>' +

          '<div id="obError" class="ob-error"></div>' +

          '<button class="ob-submit" id="obSubmit">Envoyer la demande →</button>' +

          '<p style="font-size:11px;color:#9CA3AF;text-align:center;margin:14px 0 0;">Accès accordé uniquement par l\'administrateur. Aucune carte de crédit requise.</p>' +

        '</div>' +
      '</div>';

    document.getElementById('obSubmit').addEventListener('click', function() {
      var businessName = document.getElementById('obBusinessName').value.trim();
      var sector       = document.getElementById('obSector').value;
      var address      = document.getElementById('obAddress').value.trim();
      var city         = document.getElementById('obCity').value.trim();
      var website      = document.getElementById('obWebsite').value.trim();
      var contactName  = document.getElementById('obContactName').value.trim();
      var email        = document.getElementById('obEmail').value.trim();
      var phone        = document.getElementById('obPhone').value.trim();

      var errEl  = document.getElementById('obError');
      var btn    = document.getElementById('obSubmit');

      errEl.style.display = 'none';

      if (!businessName || !sector || !address || !city || !contactName || !email) {
        errEl.textContent = 'Veuillez remplir tous les champs obligatoires (*).';
        errEl.style.display = 'block';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = 'Format email invalide.';
        errEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Envoi en cours…';

      fetch(getApiBase() + '/api/onboarding-requests', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          business_name: businessName,
          sector:        sector,
          contact_name:  contactName,
          email:         email,
          phone:         phone || undefined,
          address:       address,
          city:          city,
          website:       website || undefined
        })
      })
      .then(function(res) { return res.json().then(function(d) { return { status: res.status, data: d }; }); })
      .then(function(r) {
        if (r.status === 201) {
          var card = document.querySelector('.ob-card');
          card.innerHTML =
            '<div class="ob-success">' +
              '<div class="ob-success-icon">✓</div>' +
              '<h2>Demande envoyée !</h2>' +
              '<p>Merci, <strong>' + esc(contactName) + '</strong>. Nous avons bien reçu votre demande pour <strong>' + esc(businessName) + '</strong>.<br><br>L\'administrateur l\'examinera et vous contactera à <strong>' + esc(email) + '</strong> sous 24–48h.</p>' +
            '</div>';
        } else if (r.status === 409) {
          errEl.textContent = r.data.error || 'Une demande avec cet email existe déjà.';
          errEl.style.background = '#FEF3C7';
          errEl.style.borderColor = '#FDE68A';
          errEl.style.color = '#92400E';
          errEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Envoyer la demande →';
        } else {
          errEl.textContent = r.data.error || 'Erreur serveur. Veuillez réessayer.';
          errEl.style.background = '#FEF2F2';
          errEl.style.borderColor = '#FECACA';
          errEl.style.color = '#B91C1C';
          errEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Envoyer la demande →';
        }
      })
      .catch(function() {
        errEl.textContent = 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
        errEl.style.background = '#FEF2F2';
        errEl.style.borderColor = '#FECACA';
        errEl.style.color = '#B91C1C';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Envoyer la demande →';
      });
    });
  }

  return { render: render };
})();
window.OnboardingPage = OnboardingPage;
