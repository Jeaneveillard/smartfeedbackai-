var PrivacyModal = (function() {
  'use strict';

  function show() {
    var lang = window.I18n ? I18n.getLang() : 'fr';
    var fr = lang !== 'en';

    var overlay = document.createElement('div');
    overlay.id  = 'privacyOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.2);">' +

        // Header
        '<div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:16px 16px 0 0;padding:24px 28px;position:sticky;top:0;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                  '<svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg>' +
                '</div>' +
                '<div>' +
                  '<div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:1px;">' + (fr ? 'Sécurité & Confidentialité' : 'Security & Privacy') + '</div>' +
                  '<div style="font-size:11px;color:rgba(255,255,255,.75);">SmartFeedback AI</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<button onclick="PrivacyModal.close()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">×</button>' +
          '</div>' +
        '</div>' +

        '<div style="padding:28px;">' +

          // What we access
          '<div style="margin-bottom:24px;">' +
            '<h3 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 12px;display:flex;align-items:center;gap:8px;">' +
              '<span style="background:#D1FAE5;color:#065F46;width:24px;height:24px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;">✓</span>' +
              (fr ? 'Ce que nous accédons (Google Business)' : 'What we access (Google Business)') +
            '</h3>' +
            '<ul style="margin:0;padding:0 0 0 16px;font-size:13.5px;color:#374151;line-height:2;">' +
              '<li>' + (fr ? 'Lecture de vos avis clients Google' : 'Reading your Google customer reviews') + '</li>' +
              '<li>' + (fr ? 'Publication de réponses à vos avis' : 'Publishing replies to your reviews') + '</li>' +
              '<li>' + (fr ? 'Informations de base de votre fiche (nom, adresse)' : 'Basic info from your listing (name, address)') + '</li>' +
            '</ul>' +
          '</div>' +

          // What we DON'T access
          '<div style="background:#FEF2F2;border-radius:10px;padding:16px;margin-bottom:24px;">' +
            '<h3 style="font-size:14px;font-weight:700;color:#991B1B;margin:0 0 10px;display:flex;align-items:center;gap:8px;">' +
              '<span style="font-size:16px;">🚫</span>' +
              (fr ? 'Ce que nous n\'accédons JAMAIS' : 'What we NEVER access') +
            '</h3>' +
            '<ul style="margin:0;padding:0 0 0 16px;font-size:13.5px;color:#374151;line-height:2;">' +
              '<li>' + (fr ? 'Votre mot de passe Google' : 'Your Google password') + '</li>' +
              '<li>' + (fr ? 'Vos emails Gmail' : 'Your Gmail emails') + '</li>' +
              '<li>' + (fr ? 'Vos contacts, calendrier, Drive' : 'Your contacts, calendar, Drive') + '</li>' +
              '<li>' + (fr ? 'Vos autres services Google' : 'Your other Google services') + '</li>' +
              '<li>' + (fr ? 'Vos informations financières' : 'Your financial information') + '</li>' +
            '</ul>' +
          '</div>' +

          // How OAuth works
          '<div style="background:#EFF6FF;border-radius:10px;padding:16px;margin-bottom:24px;">' +
            '<h3 style="font-size:14px;font-weight:700;color:#1E40AF;margin:0 0 10px;display:flex;align-items:center;gap:8px;">' +
              '<span style="font-size:16px;">ℹ️</span>' +
              (fr ? 'Comment ça fonctionne (OAuth 2.0)' : 'How it works (OAuth 2.0)') +
            '</h3>' +
            '<p style="font-size:13px;color:#374151;margin:0;line-height:1.7;">' +
              (fr
                ? 'La connexion Google utilise le protocole <strong>OAuth 2.0</strong> — la même technologie que "Se connecter avec Google" sur tous les grands sites web. <strong>Aucun mot de passe n\'est jamais partagé avec nous.</strong> Google gère entièrement l\'authentification et vous montre exactement les permissions demandées avant que vous acceptiez.'
                : 'The Google connection uses <strong>OAuth 2.0</strong> — the same technology as "Sign in with Google" on all major websites. <strong>No password is ever shared with us.</strong> Google fully manages authentication and shows you exactly what permissions are requested before you accept.') +
            '</p>' +
          '</div>' +

          // Dedicated Google account tip
          '<div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:1px solid #86EFAC;border-radius:10px;padding:16px;margin-bottom:24px;">' +
            '<h3 style="font-size:14px;font-weight:700;color:#166534;margin:0 0 10px;display:flex;align-items:center;gap:8px;">' +
              '<span style="font-size:16px;">💡</span>' +
              (fr ? 'Notre recommandation : compte Google dédié' : 'Our recommendation: dedicated Google account') +
            '</h3>' +
            '<p style="font-size:13px;color:#374151;margin:0 0 10px;line-height:1.7;">' +
              (fr
                ? 'Pour une sécurité maximale, nous recommandons de <strong>ne jamais connecter votre compte Google personnel</strong>. Voici la méthode la plus sûre :'
                : 'For maximum security, we recommend <strong>never connecting your personal Google account</strong>. Here\'s the safest method:') +
            '</p>' +
            '<ol style="margin:0;padding:0 0 0 18px;font-size:13px;color:#374151;line-height:2.2;">' +
              '<li>' + (fr ? 'Créez un <strong>nouveau compte Google gratuit</strong> dédié — ex : <code style="background:#fff;padding:1px 6px;border-radius:4px;">avis.monrestaurant@gmail.com</code>' : 'Create a <strong>free dedicated Google account</strong> — e.g. <code style="background:#fff;padding:1px 6px;border-radius:4px;">reviews.myrestaurant@gmail.com</code>') + '</li>' +
              '<li>' + (fr ? 'Dans Google Business, ajoutez ce compte comme <strong>Gestionnaire</strong> de votre fiche' : 'In Google Business, add this account as a <strong>Manager</strong> of your listing') + '</li>' +
              '<li>' + (fr ? 'Connectez <strong>ce compte dédié</strong> à SmartFeedback AI — jamais votre compte principal' : 'Connect <strong>this dedicated account</strong> to SmartFeedback AI — never your main account') + '</li>' +
            '</ol>' +
            '<p style="font-size:12px;color:#166534;margin:10px 0 0;font-weight:600;">' +
              (fr ? '✓ Votre compte principal reste 100% privé et protégé.' : '✓ Your main account stays 100% private and protected.') +
            '</p>' +
          '</div>' +

          // Revoke access
          '<div style="border:1px solid #E5E7EB;border-radius:10px;padding:16px;margin-bottom:24px;">' +
            '<h3 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 10px;display:flex;align-items:center;gap:8px;">' +
              '<span style="font-size:16px;">🔑</span>' +
              (fr ? 'Révoquer l\'accès à tout moment' : 'Revoke access at any time') +
            '</h3>' +
            '<p style="font-size:13px;color:#374151;margin:0 0 10px;line-height:1.7;">' +
              (fr
                ? 'Vous pouvez annuler l\'accès en 1 clic depuis votre compte Google :'
                : 'You can cancel access in 1 click from your Google account:') +
            '</p>' +
            '<ol style="margin:0;padding:0 0 0 16px;font-size:13px;color:#374151;line-height:2;">' +
              '<li>' + (fr ? 'Aller sur myaccount.google.com' : 'Go to myaccount.google.com') + '</li>' +
              '<li>' + (fr ? 'Sécurité → Applications tierces' : 'Security → Third-party apps') + '</li>' +
              '<li>' + (fr ? 'Trouver SmartFeedback AI → Supprimer l\'accès' : 'Find SmartFeedback AI → Remove access') + '</li>' +
            '</ol>' +
          '</div>' +

          // Data hosting
          '<div style="border:1px solid #E5E7EB;border-radius:10px;padding:16px;margin-bottom:28px;">' +
            '<h3 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 10px;display:flex;align-items:center;gap:8px;">' +
              '<span style="font-size:16px;">🏢</span>' +
              (fr ? 'Hébergement des données' : 'Data hosting') +
            '</h3>' +
            '<ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#374151;line-height:2;">' +
              '<li>' + (fr ? 'Serveurs : Render.com (États-Unis)' : 'Servers: Render.com (United States)') + '</li>' +
              '<li>' + (fr ? 'Base de données : Neon PostgreSQL (États-Unis)' : 'Database: Neon PostgreSQL (United States)') + '</li>' +
              '<li>' + (fr ? 'Frontend : Cloudflare Workers (CDN mondial)' : 'Frontend: Cloudflare Workers (Global CDN)') + '</li>' +
              '<li>' + (fr ? 'Aucune vente de données à des tiers' : 'No data sold to third parties') + '</li>' +
            '</ul>' +
          '</div>' +

          // Close button
          '<button onclick="PrivacyModal.close()" style="width:100%;background:#4F46E5;color:#fff;border:none;padding:13px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">' +
            (fr ? '✓ Compris' : '✓ Got it') +
          '</button>' +

          '<p style="text-align:center;font-size:11px;color:#9CA3AF;margin:12px 0 0;">' +
            (fr ? 'Questions ? ' : 'Questions? ') +
            '<a href="mailto:jeaneveillard@gmail.com" style="color:#4F46E5;">jeaneveillard@gmail.com</a>' +
          '</p>' +

        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) PrivacyModal.close();
    });
  }

  function close() {
    var el = document.getElementById('privacyOverlay');
    if (el) document.body.removeChild(el);
  }

  return { show: show, close: close };
})();
window.PrivacyModal = PrivacyModal;
