var SignupPage = (function() {
  'use strict';

  function getApiBase() {
    if (window.API_BASE) return window.API_BASE;
    var h = window.location.hostname;
    return (h === 'localhost' || h === '127.0.0.1') ? 'http://localhost:3001' : 'https://smartfeedbackai-api.onrender.com';
  }

  // Password strength: returns 0-4
  function strength(pw) {
    var score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  var STRENGTH_LABELS = {
    fr: ['', 'Faible', 'Moyen', 'Bon', 'Excellent'],
    en: ['', 'Weak',   'Fair',  'Good', 'Strong']
  };
  var STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  function render(container, inviteToken) {
    var lang = window.I18n ? I18n.getLang() : 'fr';

    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg,#F4F5F9);">' +
        '<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:36px 32px;' +
             'max-width:420px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);">' +

          '<div style="text-align:center;margin-bottom:28px;">' +
            '<div style="width:52px;height:52px;background:linear-gradient(135deg,#818CF8,#4F46E5);' +
                 'border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">' +
              '<svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24">' +
                '<path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/>' +
              '</svg>' +
            '</div>' +
            '<h1 style="font-size:20px;font-weight:800;margin:0 0 6px;">SmartFeedback AI</h1>' +
            '<p id="signupWelcome" style="font-size:14px;color:#6B7280;margin:0;">' +
              (lang === 'en' ? 'Welcome! Create your password to get started.' : 'Bienvenue ! Créez votre mot de passe pour commencer.') +
            '</p>' +
          '</div>' +

          '<div id="signupLoading" style="text-align:center;padding:20px;color:#6B7280;">' +
            '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" ' +
                 'style="animation:spin 1s linear infinite;margin-bottom:8px;">' +
              '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>' +
            '</svg>' +
            '<p style="font-size:13px;margin:0;">' + (lang === 'en' ? 'Validating your invitation…' : 'Validation de votre invitation…') + '</p>' +
          '</div>' +

          '<form id="signupForm" style="display:none;">' +
            '<div id="signupName" style="background:var(--primary-light);border-radius:8px;padding:10px 14px;' +
                 'margin-bottom:20px;font-size:13.5px;color:var(--primary);font-weight:600;text-align:center;"></div>' +

            '<div style="margin-bottom:14px;">' +
              '<label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">' +
                (lang === 'en' ? 'Choose a password' : 'Choisissez un mot de passe') +
              '</label>' +
              '<div style="position:relative;">' +
                '<input id="signupPwd" type="password" autocomplete="new-password"' +
                       ' placeholder="' + (lang === 'en' ? 'Min. 8 characters' : 'Min. 8 caractères') + '"' +
                       ' style="width:100%;padding:10px 42px 10px 12px;border:1.5px solid #D1D5DB;border-radius:8px;' +
                              'font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;"' +
                       ' onfocus="this.style.borderColor=\'#4F46E5\'" onblur="this.style.borderColor=\'#D1D5DB\'">' +
                '<button type="button" id="signupEyeBtn"' +
                        ' style="position:absolute;right:10px;top:50%;transform:translateY(-50%);' +
                               'background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;">' +
                  '<svg id="signupEyeIco" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
                    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' +
                  '</svg>' +
                '</button>' +
              '</div>' +
              '<div id="strengthBar" style="height:4px;border-radius:2px;margin-top:6px;background:#E5E7EB;overflow:hidden;">' +
                '<div id="strengthFill" style="height:100%;width:0%;transition:width .3s,background .3s;border-radius:2px;"></div>' +
              '</div>' +
              '<div id="strengthLabel" style="font-size:11px;color:#9CA3AF;margin-top:4px;"></div>' +
            '</div>' +

            '<div style="margin-bottom:14px;">' +
              '<label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">' +
                (lang === 'en' ? 'Confirm password' : 'Confirmer le mot de passe') +
              '</label>' +
              '<input id="signupPwd2" type="password" autocomplete="new-password"' +
                     ' placeholder="••••••••"' +
                     ' style="width:100%;padding:10px 12px;border:1.5px solid #D1D5DB;border-radius:8px;' +
                            'font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;"' +
                     ' onfocus="this.style.borderColor=\'#4F46E5\'" onblur="this.style.borderColor=\'#D1D5DB\'">' +
            '</div>' +

            '<ul style="font-size:12px;color:#6B7280;list-style:none;padding:0;margin:0 0 18px;">' +
              '<li id="r-len"  style="margin-bottom:3px;">○ ' + (lang === 'en' ? 'At least 8 characters'           : 'Au moins 8 caractères') + '</li>' +
              '<li id="r-case" style="margin-bottom:3px;">○ ' + (lang === 'en' ? '1 uppercase + 1 lowercase'       : '1 majuscule + 1 minuscule') + '</li>' +
              '<li id="r-num"  style="margin-bottom:3px;">○ ' + (lang === 'en' ? 'At least 1 number'               : 'Au moins 1 chiffre') + '</li>' +
            '</ul>' +

            '<div id="signupError" style="display:none;background:#FEF2F2;border:1px solid #FECACA;' +
                 'border-radius:7px;padding:9px 12px;font-size:13px;color:#B91C1C;margin-bottom:12px;"></div>' +

            '<button type="submit" id="signupSubmit"' +
                    ' style="width:100%;background:#4F46E5;color:#fff;font-size:14px;font-weight:600;' +
                           'padding:11px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;">' +
              (lang === 'en' ? 'Create my account' : 'Créer mon compte') +
            '</button>' +

            '<div style="display:flex;align-items:center;gap:10px;margin:16px 0;">' +
              '<div style="flex:1;height:1px;background:#E5E7EB;"></div>' +
              '<span style="font-size:12px;color:#9CA3AF;">' + (lang === 'en' ? 'or' : 'ou') + '</span>' +
              '<div style="flex:1;height:1px;background:#E5E7EB;"></div>' +
            '</div>' +

            '<a id="signupGoogleBtn" href="' + getApiBase() + '/auth/google"' +
               ' style="display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;' +
                      'color:#374151;font-size:13.5px;font-weight:600;padding:10px 20px;border-radius:8px;' +
                      'text-decoration:none;border:1.5px solid #D1D5DB;"' +
               ' onmouseover="this.style.borderColor=\'#4285F4\'" onmouseout="this.style.borderColor=\'#D1D5DB\'">' +
              '<svg width="18" height="18" viewBox="0 0 48 48">' +
                '<path fill="#4285F4" d="M44.5 20H24v8h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>' +
              '</svg>' +
              (lang === 'en' ? 'Continue with Google' : 'Continuer avec Google') +
            '</a>' +

          '</form>' +

          '<div id="signupError2" style="display:none;background:#FEF2F2;border:1px solid #FECACA;' +
               'border-radius:8px;padding:14px;font-size:13px;color:#B91C1C;text-align:center;"></div>' +
        '</div>' +
      '</div>' +

      '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';

    // Validate invite token
    fetch(getApiBase() + '/auth/invite/' + inviteToken)
      .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
      .then(function(r) {
        document.getElementById('signupLoading').style.display = 'none';
        if (!r.ok) {
          document.getElementById('signupError2').style.display = 'block';
          document.getElementById('signupError2').textContent = r.data.error;
          return;
        }
        var nameEl = document.getElementById('signupName');
        nameEl.textContent = lang === 'en'
          ? 'Account: ' + r.data.name + ' (@' + r.data.username + ')'
          : 'Compte : ' + r.data.name + ' (@' + r.data.username + ')';
        document.getElementById('signupForm').style.display = 'block';
        bindEvents(inviteToken, lang);
      })
      .catch(function() {
        document.getElementById('signupLoading').style.display = 'none';
        document.getElementById('signupError2').style.display = 'block';
        document.getElementById('signupError2').textContent = lang === 'en'
          ? 'Connection error. Please try again.' : 'Erreur de connexion. Réessayez.';
      });
  }

  function bindEvents(inviteToken, lang) {
    // Eye toggle
    var eyeBtn = document.getElementById('signupEyeBtn');
    var pwdInp = document.getElementById('signupPwd');
    var eyeIco = document.getElementById('signupEyeIco');
    if (eyeBtn && pwdInp) {
      eyeBtn.addEventListener('click', function() {
        var hidden = pwdInp.type === 'password';
        pwdInp.type = hidden ? 'text' : 'password';
        eyeIco.innerHTML = hidden
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        eyeBtn.style.color = hidden ? '#4F46E5' : '#9CA3AF';
      });
    }

    // Password strength indicator
    if (pwdInp) {
      pwdInp.addEventListener('input', function() {
        var pw  = pwdInp.value;
        var s   = strength(pw);
        var pct = s === 0 ? 0 : (s / 4) * 100;
        document.getElementById('strengthFill').style.width  = pct + '%';
        document.getElementById('strengthFill').style.background = STRENGTH_COLORS[s] || '#E5E7EB';
        document.getElementById('strengthLabel').textContent  = s > 0 ? (STRENGTH_LABELS[lang] || STRENGTH_LABELS.fr)[s] : '';
        document.getElementById('strengthLabel').style.color  = STRENGTH_COLORS[s] || '#9CA3AF';
        // Update requirements
        updateReq('r-len',  pw.length >= 8);
        updateReq('r-case', /[A-Z]/.test(pw) && /[a-z]/.test(pw));
        updateReq('r-num',  /[0-9]/.test(pw));
      });
    }

    // Form submit
    var form = document.getElementById('signupForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var pw   = document.getElementById('signupPwd').value;
        var pw2  = document.getElementById('signupPwd2').value;
        var err  = document.getElementById('signupError');
        var btn  = document.getElementById('signupSubmit');

        if (pw !== pw2) {
          err.textContent = lang === 'en' ? 'Passwords do not match.' : 'Les mots de passe ne correspondent pas.';
          err.style.display = 'block'; return;
        }
        if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw)) {
          err.textContent = lang === 'en' ? 'Please meet all password requirements.' : 'Veuillez respecter toutes les exigences.';
          err.style.display = 'block'; return;
        }

        btn.disabled = true;
        btn.textContent = lang === 'en' ? 'Creating account…' : 'Création en cours…';
        err.style.display = 'none';

        fetch((window.API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://smartfeedbackai-api.onrender.com')) + '/auth/invite/' + inviteToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        })
        .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
        .then(function(r) {
          if (!r.ok) {
            err.textContent = r.data.error;
            err.style.display = 'block';
            btn.disabled = false;
            btn.textContent = lang === 'en' ? 'Create my account' : 'Créer mon compte';
            return;
          }
          // Store JWT and go to dashboard
          localStorage.setItem('sfai_jwt', r.data.token);
          window.history.replaceState({}, '', window.location.pathname);
          window.location.reload();
        })
        .catch(function() {
          err.textContent = lang === 'en' ? 'Network error. Please retry.' : 'Erreur réseau. Réessayez.';
          err.style.display = 'block';
          btn.disabled = false;
          btn.textContent = lang === 'en' ? 'Create my account' : 'Créer mon compte';
        });
      });
    }
  }

  function updateReq(id, ok) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.color = ok ? '#10B981' : '#9CA3AF';
    el.textContent = el.textContent.replace(/^[○●]/, ok ? '●' : '○');
  }

  return { render: render };
})();

window.SignupPage = SignupPage;
