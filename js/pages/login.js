var LoginPage = (function() {
  'use strict';

  function getApiBase() {
    var h = window.location.hostname;
    if (window.API_BASE) return window.API_BASE;
    if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3001';
    return 'https://smartfeedbackai-api.onrender.com';
  }

  function render(container) {
    var lang = window.I18n ? I18n.getLang() : 'fr';
    container.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg,#F4F5F9);">',
      '  <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:36px 32px;',
      '       max-width:380px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);">',

      '    <!-- Logo -->',
      '    <div style="text-align:center;margin-bottom:24px;">',
      '      <div style="width:52px;height:52px;background:linear-gradient(135deg,#818CF8,#4F46E5);',
      '           border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">',
      '        <svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24">',
      '          <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/>',
      '        </svg>',
      '      </div>',
      '      <h1 style="font-size:20px;font-weight:800;margin:0 0 4px;letter-spacing:-.4px;">SmartFeedback AI</h1>',
      '      <p style="font-size:13px;color:#6B7280;margin:0;">' + t('login_sub') + '</p>',
      '    </div>',

      '    <!-- Email/Password form -->',
      '    <form id="loginForm" style="margin-bottom:16px;">',
      '      <div style="margin-bottom:12px;">',
      '        <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">',
      '          ' + (lang === 'en' ? 'Email or username' : 'Email ou username') +
      '        </label>',
      '        <input id="loginEmail" type="text" autocomplete="username"',
      '               placeholder="' + (lang === 'en' ? 'myrestaurant or email@...' : 'monrestaurant ou email@...') + '"',
      '               style="width:100%;padding:9px 12px;border:1.5px solid #D1D5DB;border-radius:8px;',
      '                      font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;"',
      '               onfocus="this.style.borderColor=\'#4F46E5\'" onblur="this.style.borderColor=\'#D1D5DB\'">',
      '      </div>',
      '      <div style="margin-bottom:16px;">',
      '        <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">',
      '          ' + (lang === 'en' ? 'Password' : 'Mot de passe') +
      '        </label>',
      '        <div style="position:relative;">',
      '          <input id="loginPassword" type="password" autocomplete="current-password"',
      '                 placeholder="••••••••••••"',
      '                 style="width:100%;padding:9px 40px 9px 12px;border:1.5px solid #D1D5DB;border-radius:8px;',
      '                        font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;"',
      '                 onfocus="this.style.borderColor=\'#4F46E5\'" onblur="this.style.borderColor=\'#D1D5DB\'">',
      '          <button type="button" id="toggleLoginPwd"',
      '                  style="position:absolute;right:10px;top:50%;transform:translateY(-50%);',
      '                         background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;"',
      '                  title="' + (lang === 'en' ? 'Show/hide password' : 'Afficher/masquer') + '">',
      '            <svg id="eyeIcon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">',
      '              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
      '            </svg>',
      '          </button>',
      '        </div>',
      '      </div>',
      '      <div id="loginError" style="display:none;background:#FEF2F2;border:1px solid #FECACA;',
      '           border-radius:7px;padding:9px 12px;font-size:13px;color:#B91C1C;margin-bottom:12px;"></div>',
      '      <button type="submit" id="loginSubmit"',
      '              style="width:100%;background:#4F46E5;color:#fff;font-size:14px;font-weight:600;',
      '                     padding:11px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;">',
      '        ' + (lang === 'en' ? 'Sign in' : 'Se connecter') +
      '      </button>',
      '    </form>',

      '    <!-- Divider -->',
      '    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">',
      '      <div style="flex:1;height:1px;background:#E5E7EB;"></div>',
      '      <span style="font-size:12px;color:#9CA3AF;">' + (lang === 'en' ? 'or' : 'ou') + '</span>',
      '      <div style="flex:1;height:1px;background:#E5E7EB;"></div>',
      '    </div>',

      '    <!-- Google OAuth -->',
      '    <a href="' + getApiBase() + '/auth/google"',
      '       style="display:flex;align-items:center;justify-content:center;gap:10px;',
      '              background:#fff;color:#374151;font-size:13.5px;font-weight:600;',
      '              padding:10px 20px;border-radius:8px;text-decoration:none;',
      '              border:1.5px solid #D1D5DB;transition:border-color .2s;"',
      '       onmouseover="this.style.borderColor=\'#4285F4\'" onmouseout="this.style.borderColor=\'#D1D5DB\'">',
      '      <svg width="18" height="18" viewBox="0 0 48 48">',
      '        <path fill="#4285F4" d="M44.5 20H24v8h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>',
      '      </svg>',
      '      ' + t('login_google'),
      '    </a>',

      '    <p style="font-size:11px;color:#9CA3AF;text-align:center;margin:16px 0 0;">' + t('login_note') + '</p>',
      '  </div>',
      '</div>'
    ].join('');

    // Eye toggle for password field
    var toggleBtn = document.getElementById('toggleLoginPwd');
    var pwdInput  = document.getElementById('loginPassword');
    var eyeIcon   = document.getElementById('eyeIcon');
    if (toggleBtn && pwdInput) {
      toggleBtn.addEventListener('click', function() {
        var isHidden = pwdInput.type === 'password';
        pwdInput.type = isHidden ? 'text' : 'password';
        // Switch between eye and eye-off SVG
        eyeIcon.innerHTML = isHidden
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>' +
            '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>' +
            '<line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        toggleBtn.style.color = isHidden ? '#4F46E5' : '#9CA3AF';
      });
    }

    // Form submit handler
    var form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var email    = document.getElementById('loginEmail').value.trim();
        var password = document.getElementById('loginPassword').value;
        var errEl    = document.getElementById('loginError');
        var btn      = document.getElementById('loginSubmit');

        if (!email || !password) {
          errEl.textContent = lang === 'en' ? 'Please enter your email/username and password.' : 'Veuillez saisir votre email/username et mot de passe.';
          errEl.style.display = 'block';
          return;
        }

        btn.disabled = true;
        btn.textContent = lang === 'en' ? 'Signing in…' : 'Connexion…';
        errEl.style.display = 'none';

        fetch(getApiBase() + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        })
        .then(function(res) { return res.json().then(function(d) { return { status: res.status, data: d }; }); })
        .then(function(r) {
          if (r.status !== 200 || !r.data.token) {
            errEl.textContent = r.data.error || (lang === 'en' ? 'Incorrect credentials.' : 'Identifiants incorrects.');
            errEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = lang === 'en' ? 'Sign in' : 'Se connecter';
            return;
          }
          // Store JWT and reload
          localStorage.setItem('sfai_jwt', r.data.token);
          window.location.reload();
        })
        .catch(function() {
          errEl.textContent = lang === 'en' ? 'Connection error. Is the server running?' : 'Erreur de connexion. Le serveur est-il démarré ?';
          errEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = lang === 'en' ? 'Sign in' : 'Se connecter';
        });
      });
    }
  }

  return { render: render };
})();
window.LoginPage = LoginPage;
