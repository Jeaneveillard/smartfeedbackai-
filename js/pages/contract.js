var ContractModal = (function() {
  'use strict';

  function show() {
    var lang = window.I18n ? I18n.getLang() : 'fr';
    var fr = lang !== 'en';
    var date = new Date().toLocaleDateString(fr ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

    var overlay = document.createElement('div');
    overlay.id  = 'contractOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

    var sections = fr ? [
      {
        title: '1. Parties',
        body:  '<p><strong>Fournisseur de services :</strong><br>Jean Eveillard Cazeau<br>contact@smartfeedbackai.com · 438-378-6703<br><em>ci-après désigné « SmartFeedback AI »</em></p>' +
               '<p style="margin-top:10px;"><strong>Client :</strong> Tout établissement ou individu ayant accepté ce contrat lors de l\'inscription sur la plateforme SmartFeedback AI.</p>'
      },
      {
        title: '2. Services fournis',
        body:  '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Accès à la plateforme SmartFeedback AI pour la gestion des avis clients</li>' +
               '<li>Génération de réponses assistée par intelligence artificielle</li>' +
               '<li>Synchronisation des avis Google Business (si le compte est connecté)</li>' +
               '<li>Tableau de bord analytique des avis</li>' +
               '<li>Notifications par courriel pour les nouveaux avis</li>' +
               '</ul>'
      },
      {
        title: '3. Accès aux données Google',
        body:  '<p>Dans le cadre de l\'intégration Google Business :</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>SmartFeedback AI accède uniquement aux avis et aux réponses de la fiche Google Business du client</li>' +
               '<li>Aucun accès aux emails, contacts, calendrier ou autres services Google n\'est effectué</li>' +
               '<li>Aucun mot de passe n\'est stocké — l\'accès se fait via le protocole sécurisé OAuth 2.0</li>' +
               '<li>Le client peut révoquer l\'accès à tout moment depuis son compte Google</li>' +
               '</ul>'
      },
      {
        title: '4. Confidentialité',
        body:  '<p>SmartFeedback AI s\'engage à :</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Ne jamais vendre, partager ou divulguer les données du client à des tiers</li>' +
               '<li>Utiliser les données uniquement pour fournir les services décrits dans ce contrat</li>' +
               '<li>Protéger les données par des mesures de sécurité appropriées (chiffrement, accès restreint)</li>' +
               '<li>Informer le client en cas de violation de données dans un délai de 72 heures</li>' +
               '</ul>'
      },
      {
        title: '5. Obligations du client',
        body:  '<p>Le client s\'engage à :</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Fournir des informations exactes lors de l\'inscription</li>' +
               '<li>Maintenir la confidentialité de ses identifiants de connexion</li>' +
               '<li>Utiliser la plateforme conformément aux lois applicables</li>' +
               '<li>Ne pas tenter de compromettre la sécurité de la plateforme</li>' +
               '</ul>'
      },
      {
        title: '6. Abonnement et paiement',
        body:  '<p>Les modalités de paiement sont convenues entre SmartFeedback AI et le client lors de l\'inscription. L\'accès à la plateforme est conditionnel au paiement de l\'abonnement en vigueur. Tout abonnement non renouvelé entraîne la suspension du compte après la date d\'expiration.</p>'
      },
      {
        title: '7. Résiliation',
        body:  '<p>Chaque partie peut résilier ce contrat avec un préavis de <strong>30 jours</strong> par courriel. En cas de résiliation :</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Le client conserve l\'accès jusqu\'à la fin de la période payée</li>' +
               '<li>Les données du client sont supprimées dans un délai de 30 jours suivant la résiliation</li>' +
               '<li>Aucun remboursement n\'est effectué pour la période en cours</li>' +
               '</ul>'
      },
      {
        title: '8. Limitation de responsabilité',
        body:  '<p>SmartFeedback AI ne peut être tenu responsable des pertes indirectes, de manque à gagner ou de dommages résultant d\'une interruption de service, d\'une modification de l\'API Google, ou de tout événement hors de son contrôle. La responsabilité totale ne peut excéder le montant payé par le client au cours des 3 derniers mois.</p>'
      },
      {
        title: '9. Droit applicable',
        body:  '<p>Ce contrat est régi par les lois de la province de <strong>Québec</strong> et les lois fédérales du Canada. Tout litige sera soumis aux tribunaux compétents de la province de Québec.</p>'
      },
      {
        title: '10. Contact',
        body:  '<p><strong>Jean Eveillard Cazeau</strong><br>📧 contact@smartfeedbackai.com<br>📞 438-378-6703</p>'
      }
    ] : [
      {
        title: '1. Parties',
        body:  '<p><strong>Service Provider:</strong><br>Jean Eveillard Cazeau<br>contact@smartfeedbackai.com · 438-378-6703<br><em>hereinafter referred to as "SmartFeedback AI"</em></p>' +
               '<p style="margin-top:10px;"><strong>Client:</strong> Any business or individual who accepted this agreement during registration on the SmartFeedback AI platform.</p>'
      },
      {
        title: '2. Services Provided',
        body:  '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Access to the SmartFeedback AI platform for customer review management</li>' +
               '<li>AI-assisted response generation</li>' +
               '<li>Google Business review synchronization (if account connected)</li>' +
               '<li>Review analytics dashboard</li>' +
               '<li>Email notifications for new reviews</li>' +
               '</ul>'
      },
      {
        title: '3. Google Data Access',
        body:  '<p>As part of the Google Business integration:</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>SmartFeedback AI only accesses reviews and responses from the client\'s Google Business listing</li>' +
               '<li>No access to emails, contacts, calendar, or other Google services</li>' +
               '<li>No passwords are stored — access is via the secure OAuth 2.0 protocol</li>' +
               '<li>The client can revoke access at any time from their Google account</li>' +
               '</ul>'
      },
      {
        title: '4. Confidentiality',
        body:  '<p>SmartFeedback AI commits to:</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Never selling, sharing, or disclosing client data to third parties</li>' +
               '<li>Using data only to provide the services described in this agreement</li>' +
               '<li>Protecting data with appropriate security measures (encryption, restricted access)</li>' +
               '<li>Notifying the client of any data breach within 72 hours</li>' +
               '</ul>'
      },
      {
        title: '5. Client Obligations',
        body:  '<p>The client agrees to:</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>Provide accurate information during registration</li>' +
               '<li>Maintain the confidentiality of their login credentials</li>' +
               '<li>Use the platform in compliance with applicable laws</li>' +
               '<li>Not attempt to compromise the security of the platform</li>' +
               '</ul>'
      },
      {
        title: '6. Subscription & Payment',
        body:  '<p>Payment terms are agreed between SmartFeedback AI and the client at registration. Access to the platform is conditional on payment of the current subscription. Any unpaid subscription results in account suspension after the expiry date.</p>'
      },
      {
        title: '7. Termination',
        body:  '<p>Either party may terminate this agreement with <strong>30 days\' notice</strong> by email. Upon termination:</p>' +
               '<ul style="padding-left:18px;line-height:2;">' +
               '<li>The client retains access until the end of the paid period</li>' +
               '<li>Client data is deleted within 30 days following termination</li>' +
               '<li>No refund is issued for the current period</li>' +
               '</ul>'
      },
      {
        title: '8. Limitation of Liability',
        body:  '<p>SmartFeedback AI cannot be held liable for indirect losses, lost profits, or damages resulting from service interruption, changes to the Google API, or any event beyond its control. Total liability cannot exceed the amount paid by the client in the last 3 months.</p>'
      },
      {
        title: '9. Governing Law',
        body:  '<p>This agreement is governed by the laws of the province of <strong>Quebec</strong> and the federal laws of Canada. Any dispute will be submitted to the competent courts of the province of Quebec.</p>'
      },
      {
        title: '10. Contact',
        body:  '<p><strong>Jean Eveillard Cazeau</strong><br>📧 contact@smartfeedbackai.com<br>📞 438-378-6703</p>'
      }
    ];

    var sectionsHtml = sections.map(function(s) {
      return '<div style="margin-bottom:20px;">' +
        '<h3 style="font-size:13px;font-weight:700;color:#4F46E5;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px;">' + s.title + '</h3>' +
        '<div style="font-size:13px;color:#374151;line-height:1.7;">' + s.body + '</div>' +
        '</div>';
    }).join('<hr style="border:none;border-top:1px solid #F3F4F6;margin:0 0 20px;">');

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.2);">' +

        '<div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:16px 16px 0 0;padding:24px 28px;position:sticky;top:0;z-index:1;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                  '<svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg>' +
                '</div>' +
                '<div>' +
                  '<div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:1px;">' + (fr ? 'Contrat de service' : 'Service Agreement') + '</div>' +
                  '<div style="font-size:11px;color:rgba(255,255,255,.75);">SmartFeedback AI · ' + date + '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<button onclick="ContractModal.close()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">×</button>' +
          '</div>' +
        '</div>' +

        '<div style="padding:28px;">' +
          sectionsHtml +
          '<button onclick="ContractModal.close()" style="width:100%;background:#4F46E5;color:#fff;border:none;padding:13px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:8px;">' +
            (fr ? '✓ Compris' : '✓ Got it') +
          '</button>' +
          '<p style="text-align:center;font-size:11px;color:#9CA3AF;margin:12px 0 0;">' +
            (fr ? 'Questions ? ' : 'Questions? ') +
            '<a href="mailto:contact@smartfeedbackai.com" style="color:#4F46E5;">contact@smartfeedbackai.com</a> · 438-378-6703' +
          '</p>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) ContractModal.close();
    });
  }

  function close() {
    var el = document.getElementById('contractOverlay');
    if (el) document.body.removeChild(el);
  }

  return { show: show, close: close };
})();
window.ContractModal = ContractModal;
