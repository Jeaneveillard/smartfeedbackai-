var AdminPage = (function () {
  'use strict';

  var currentTab = 'clients';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(v) {
    if (!v) return '–';
    return new Date(v).toISOString().split('T')[0];
  }

  function daysLeft(endStr) {
    if (!endStr) return null;
    var end   = new Date(fmtDate(endStr));
    var today = new Date(new Date().toISOString().split('T')[0]);
    return Math.ceil((end - today) / 86400000);
  }

  function subBadge(tenant) {
    var end = tenant.subscription_end;
    if (!end) return '<span style="font-size:11px;color:var(--txt3);">–</span>';
    var d = daysLeft(end);
    if (d < 0)      return '<span style="background:#FEF2F2;color:#B91C1C;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">Expiré ' + Math.abs(d) + 'j</span>';
    if (d <= 7)     return '<span style="background:#FEF3C7;color:#D97706;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">J-' + d + '</span>';
    return '<span style="background:#ECFDF5;color:#059669;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">' + d + ' j</span>';
  }

  /* ─── Render clients tab ──────────────────────────────────────────────── */
  function renderClients(container, tenants) {
    var rows = tenants.map(function (t) {
      var statusDot = t.active
        ? '<span style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block;margin-right:6px;"></span>'
        : '<span style="width:8px;height:8px;border-radius:50%;background:#EF4444;display:inline-block;margin-right:6px;"></span>';

      return '<tr class="admin-row" data-id="' + esc(t.id) + '" style="border-bottom:1px solid var(--border-faint);">' +
        '<td style="padding:12px 16px;">' +
          '<div style="font-weight:600;font-size:13.5px;">' + statusDot + esc(t.name) + '</div>' +
          '<div style="font-size:12px;color:var(--txt3);margin-top:2px;">@' + esc(t.username || t.email) + '</div>' +
        '</td>' +
        '<td style="padding:12px 16px;font-size:12px;color:var(--txt2);">' +
          '<span style="background:var(--primary-light);color:var(--primary);padding:2px 8px;border-radius:12px;font-weight:600;">' + esc(t.plan || 'beta') + '</span>' +
        '</td>' +
        '<td style="padding:12px 16px;font-size:12px;">' +
          '<div style="color:var(--txt2);">' + fmtDate(t.subscription_start) + '</div>' +
          '<div style="color:var(--txt2);">' + fmtDate(t.subscription_end) + '</div>' +
        '</td>' +
        '<td style="padding:12px 16px;">' + subBadge(t) + '</td>' +
        '<td style="padding:12px 16px;">' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="btn btn-soft admin-start" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" data-name="' + esc(t.name) + '" style="font-size:11.5px;padding:4px 10px;">+30j</button>' +
            '<button class="btn btn-soft admin-start90" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" style="font-size:11.5px;padding:4px 10px;">+90j</button>' +
            (t.active
              ? '<button class="btn btn-danger admin-deactivate" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" style="font-size:11.5px;padding:4px 10px;">Désactiver</button>'
              : '<button class="btn btn-soft admin-activate" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" style="font-size:11.5px;padding:4px 10px;">Activer</button>') +
            '<button class="btn btn-ghost admin-reset-pw" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" data-username="' + esc(t.username || t.email) + '" data-name="' + esc(t.name) + '" style="font-size:11.5px;padding:4px 10px;">🔑</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    container.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<div>' +
          '<h2 style="font-size:16px;font-weight:800;margin:0 0 4px;">Clients (' + tenants.length + ')</h2>' +
          '<p style="font-size:13px;color:var(--txt2);margin:0;">Gérez les accès et abonnements</p>' +
        '</div>' +
        '<button class="btn btn-primary" id="adminCreateBtn">' +
          '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          ' Nouveau client' +
        '</button>' +
      '</div>' +

      /* New client form (hidden by default) */
      '<div id="adminCreateForm" style="display:none;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;margin-bottom:20px;">' +
        '<div style="font-size:13px;font-weight:700;margin-bottom:14px;">Créer un compte client</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 120px auto;gap:10px;align-items:end;">' +
          '<div>' +
            '<label style="font-size:11px;font-weight:600;color:var(--txt2);display:block;margin-bottom:4px;">NOM DE L\'ÉTABLISSEMENT</label>' +
            '<input class="form-input" type="text" id="newClientName" placeholder="Le Bon Café">' +
          '</div>' +
          '<div>' +
            '<label style="font-size:11px;font-weight:600;color:var(--txt2);display:block;margin-bottom:4px;">USERNAME</label>' +
            '<input class="form-input" type="text" id="newClientUsername" placeholder="ex: lebistro, cafeduport">' +
            '<small style="font-size:10px;color:var(--txt3);">Visible par le client, unique</small>' +
          '</div>' +
          '<div>' +
            '<label style="font-size:11px;font-weight:600;color:var(--txt2);display:block;margin-bottom:4px;">EMAIL</label>' +
            '<input class="form-input" type="email" id="newClientEmail" placeholder="resto@gmail.com">' +
          '</div>' +
          '<div>' +
            '<label style="font-size:11px;font-weight:600;color:var(--txt2);display:block;margin-bottom:4px;">PLAN</label>' +
            '<select class="form-input" id="newClientPlan">' +
              '<option value="beta">Bêta</option>' +
              '<option value="pro">Pro</option>' +
              '<option value="business">Business</option>' +
            '</select>' +
          '</div>' +
          '<button class="btn btn-primary" id="adminCreateSubmit">Créer</button>' +
        '</div>' +
        '<div id="adminCreateResult" style="margin-top:12px;display:none;"></div>' +
      '</div>' +

      /* Clients table */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;">' +
        '<table style="width:100%;border-collapse:collapse;">' +
          '<thead><tr style="background:var(--bg);">' +
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Client</th>' +
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Plan</th>' +
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Début / Fin</th>' +
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Jours</th>' +
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Actions</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';

    bindClientEvents(container);
  }

  function bindClientEvents(container) {
    /* Toggle create form */
    var createBtn = container.querySelector('#adminCreateBtn');
    var createForm = container.querySelector('#adminCreateForm');
    if (createBtn && createForm) {
      createBtn.addEventListener('click', function () {
        createForm.style.display = createForm.style.display === 'none' ? '' : 'none';
      });
    }

    /* Submit new client */
    var submitBtn = container.querySelector('#adminCreateSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var name     = document.getElementById('newClientName').value.trim();
        var username = document.getElementById('newClientUsername').value.trim();
        var email    = document.getElementById('newClientEmail').value.trim();
        var plan     = document.getElementById('newClientPlan').value;
        var res      = document.getElementById('adminCreateResult');
        if (!name || !email || !username) { Toast.show('Nom, username et email requis', 'error'); return; }
        submitBtn.disabled = true; submitBtn.textContent = 'Création…';
        API.post('/admin/tenants', { name: name, email: email, username: username, plan: plan })
          .then(function (data) {
            res.style.display = '';
            var inviteUrl  = data.invite ? data.invite.url : '';
            var emailSent  = data.invite && data.invite.emailSent;
            var emailError = data.invite && data.invite.emailError;
            var emailNote  = emailSent
              ? '<div style="font-size:12px;background:#ECFDF5;border:1px solid #6EE7B7;padding:7px 10px;border-radius:6px;color:#065F46;margin-bottom:8px;">' +
                '📧 Email d\'invitation envoyé automatiquement à ' + esc(data.tenant ? data.tenant.email : '') + '</div>'
              : '<div style="font-size:12px;background:#FEF3C7;border:1px solid #FDE68A;padding:7px 10px;border-radius:6px;color:#92400E;margin-bottom:8px;">' +
                '⚠️ Email non envoyé (SMTP non configuré). Partagez ce lien manuellement.' +
                (emailError ? '<br><span style="font-size:11px;opacity:.8;">' + esc(emailError) + '</span>' : '') + '</div>';
            res.innerHTML =
              '<div style="background:#ECFDF5;border:1px solid #6EE7B7;border-radius:8px;padding:16px;">' +
              '<div style="font-size:13px;font-weight:700;color:#065F46;margin-bottom:10px;">✅ Compte créé !</div>' +
              emailNote +
              '<div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;">🔗 Lien d\'invitation (à conserver) :</div>' +
              '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">' +
                '<input id="inviteUrlInput" type="text" value="' + esc(inviteUrl) + '" readonly ' +
                  'style="flex:1;padding:8px 10px;border:1px solid #D1D5DB;border-radius:6px;font-size:12px;font-family:monospace;background:#F9FAFB;color:#374151;">' +
                '<button id="copyInviteBtn" class="btn btn-soft" style="font-size:12px;padding:6px 12px;white-space:nowrap;">Copier</button>' +
              '</div>' +
              '<div style="font-size:12px;color:#374151;margin-bottom:4px;">Username : <strong>@' + esc(data.tenant ? data.tenant.username : '') + '</strong></div>' +
              '<div style="font-size:11.5px;color:#6B7280;padding:7px 10px;border-radius:6px;margin-top:4px;">' +
                'Le client choisira son propre mot de passe en cliquant le lien. Valide 7 jours, usage unique.' +
              '</div>' +
              '</div>';
            document.getElementById('newClientName').value     = '';
            document.getElementById('newClientUsername').value = '';
            document.getElementById('newClientEmail').value    = '';
            submitBtn.disabled = false; submitBtn.textContent = 'Créer';
            // Copy button
            var copyBtn = document.getElementById('copyInviteBtn');
            if (copyBtn) {
              copyBtn.addEventListener('click', function() {
                var input = document.getElementById('inviteUrlInput');
                if (input) {
                  navigator.clipboard.writeText(input.value).then(function() {
                    copyBtn.textContent = '✓ Copié !';
                    setTimeout(function() { copyBtn.textContent = 'Copier'; }, 2000);
                  });
                }
              });
            }
            setTimeout(function () { render(container.parentElement); }, 8000);
          })
          .catch(function (err) {
            Toast.show(err.message || 'Erreur de création', 'error');
            submitBtn.disabled = false; submitBtn.textContent = 'Créer';
          });
      });
    }

    /* +30j / +90j */
    function extendSub(el, days) {
      var id = el.getAttribute('data-id');
      el.disabled = true; el.textContent = '…';
      API.post('/admin/subscriptions/' + id + '/extend', { days: days })
        .then(function () {
          Toast.show((days === 30 ? '30 jours' : '90 jours') + ' ajoutés', 'success');
          setTimeout(function () { render(container.parentElement); }, 1000);
        })
        .catch(function () { Toast.show('Erreur', 'error'); el.disabled = false; el.textContent = '+' + days + 'j'; });
    }
    container.querySelectorAll('.admin-start').forEach(function (el) { el.addEventListener('click', function () { extendSub(el, 30); }); });
    container.querySelectorAll('.admin-start90').forEach(function (el) { el.addEventListener('click', function () { extendSub(el, 90); }); });

    /* Deactivate / Activate */
    function toggleActive(el, active) {
      var id = el.getAttribute('data-id');
      el.disabled = true;
      API.put('/admin/tenants/' + id, { active: active })
        .then(function () {
          Toast.show(active ? 'Compte réactivé' : 'Compte désactivé', active ? 'success' : 'info');
          setTimeout(function () { render(container.parentElement); }, 800);
        })
        .catch(function () { Toast.show('Erreur', 'error'); el.disabled = false; });
    }
    container.querySelectorAll('.admin-deactivate').forEach(function (el) { el.addEventListener('click', function () { toggleActive(el, false); }); });
    container.querySelectorAll('.admin-activate').forEach(function (el) { el.addEventListener('click', function () { toggleActive(el, true); }); });

    /* Reset password — shows persistent box with eye toggle */
    container.querySelectorAll('.admin-reset-pw').forEach(function (el) {
      el.addEventListener('click', function () {
        var id       = el.getAttribute('data-id');
        var email    = el.getAttribute('data-email');
        var username = el.getAttribute('data-username') || email;
        var name     = el.getAttribute('data-name') || username;
        if (!confirm('Générer un nouveau mot de passe pour @' + username + ' ?')) return;
        el.disabled = true; el.textContent = '…';

        API.post('/admin/tenants/' + id + '/reset-password', {})
          .then(function (data) {
            var pw = data.credentials.password;
            // Show modal-style box
            var modal = document.createElement('div');
            modal.style.cssText =
              'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;' +
              'display:flex;align-items:center;justify-content:center;';
            modal.innerHTML =
              '<div style="background:#fff;border-radius:12px;padding:28px 32px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);">' +
                '<div style="font-size:16px;font-weight:800;margin-bottom:6px;">🔑 Nouveau mot de passe</div>' +
                '<div style="font-size:13px;color:#6B7280;margin-bottom:20px;">Pour <strong>' + esc(name) + '</strong> (@' + esc(username) + ')</div>' +
                '<div style="margin-bottom:16px;">' +
                  '<label style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:6px;">Mot de passe</label>' +
                  '<div style="display:flex;gap:8px;align-items:center;">' +
                    '<div style="position:relative;flex:1;">' +
                      '<input id="pwdModalInput" type="password" value="' + esc(pw) + '" readonly ' +
                        'style="width:100%;padding:10px 40px 10px 12px;border:1.5px solid #E5E7EB;border-radius:8px;' +
                        'font-size:15px;font-family:monospace;letter-spacing:2px;box-sizing:border-box;background:#F9FAFB;">' +
                      '<button id="pwdEyeBtn" type="button" ' +
                        'style="position:absolute;right:10px;top:50%;transform:translateY(-50%);' +
                        'background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;">' +
                        '<svg id="pwdEyeIco" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
                          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' +
                        '</svg>' +
                      '</button>' +
                    '</div>' +
                    '<button id="pwdCopyBtn" class="btn btn-soft" style="white-space:nowrap;font-size:12px;padding:8px 14px;">Copier</button>' +
                  '</div>' +
                '</div>' +
                '<p style="font-size:12px;color:#F59E0B;margin:0 0 20px;">⚠️ Partagez ce mot de passe maintenant — il ne sera plus disponible.</p>' +
                '<button id="pwdCloseBtn" class="btn btn-primary" style="width:100%;">Fermer</button>' +
              '</div>';
            document.body.appendChild(modal);

            // Eye toggle
            var inp  = modal.querySelector('#pwdModalInput');
            var eye  = modal.querySelector('#pwdEyeBtn');
            var ico  = modal.querySelector('#pwdEyeIco');
            eye.addEventListener('click', function() {
              var hidden = inp.type === 'password';
              inp.type = hidden ? 'text' : 'password';
              inp.style.letterSpacing = hidden ? 'normal' : '2px';
              ico.innerHTML = hidden
                ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>' +
                  '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>' +
                  '<line x1="1" y1="1" x2="23" y2="23"/>'
                : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
              eye.style.color = hidden ? '#4F46E5' : '#9CA3AF';
            });

            // Copy
            modal.querySelector('#pwdCopyBtn').addEventListener('click', function() {
              navigator.clipboard.writeText(pw).then(function() {
                var btn = modal.querySelector('#pwdCopyBtn');
                btn.textContent = '✓ Copié !';
                setTimeout(function() { btn.textContent = 'Copier'; }, 2000);
              });
            });

            // Close
            modal.querySelector('#pwdCloseBtn').addEventListener('click', function() {
              document.body.removeChild(modal);
            });
            modal.addEventListener('click', function(e) {
              if (e.target === modal) document.body.removeChild(modal);
            });

            el.disabled = false; el.textContent = '🔑';
          })
          .catch(function () { Toast.show('Erreur', 'error'); el.disabled = false; el.textContent = '🔑'; });
      });
    });
  }

  /* ─── Render config tab ───────────────────────────────────────────────── */
  function renderConfig(container) {
    container.innerHTML =
      '<h2 style="font-size:16px;font-weight:800;margin:0 0 20px;">Configuration</h2>' +

      /* Admin secret */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px 22px;margin-bottom:16px;">' +
        '<div style="font-size:13.5px;font-weight:700;margin-bottom:4px;">🔐 Clé Admin</div>' +
        '<div style="font-size:12.5px;color:var(--txt2);margin-bottom:10px;">Utilisée pour accéder aux routes /admin/* via l\'API.</div>' +
        '<input class="form-input" type="password" id="adminSecretDisplay" value="sfai-admin-Amboul2026!" style="max-width:360px;font-family:monospace;" readonly>' +
        '<button class="btn btn-ghost" style="margin-left:8px;font-size:12px;" onclick="this.previousElementSibling.type=this.previousElementSibling.type===\'password\'?\'text\':\'password\'">Afficher</button>' +
      '</div>' +

      /* SMTP */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px 22px;margin-bottom:16px;">' +
        '<div style="font-size:13.5px;font-weight:700;margin-bottom:4px;">📧 Notifications Email (SMTP)</div>' +
        '<div style="font-size:12.5px;color:var(--txt2);margin-bottom:14px;">Configuré dans le fichier <code style="background:var(--bg);padding:1px 6px;border-radius:4px;">.env</code> du backend.</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:560px;">' +
          '<div><label style="font-size:11px;font-weight:600;color:var(--txt2);display:block;margin-bottom:4px;">SMTP HOST</label>' +
          '<input class="form-input" value="smtp.gmail.com" readonly style="background:var(--bg);"></div>' +
          '<div><label style="font-size:11px;font-weight:600;color:var(--txt2);display:block;margin-bottom:4px;">FROM</label>' +
          '<input class="form-input" value="jeaneveillard@gmail.com" readonly style="background:var(--bg);"></div>' +
        '</div>' +
        '<button class="btn btn-soft" id="testSmtpBtn" style="margin-top:12px;font-size:12.5px;">Tester la connexion email</button>' +
        '<span id="smtpTestResult" style="margin-left:10px;font-size:12.5px;"></span>' +
      '</div>' +

      /* Google OAuth */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px 22px;">' +
        '<div style="font-size:13.5px;font-weight:700;margin-bottom:4px;">🔑 Google OAuth</div>' +
        '<div style="font-size:12.5px;color:var(--txt2);margin-bottom:10px;">Identifiants du projet Google Cloud → SmartFeedback AI.</div>' +
        '<div style="background:var(--bg);border-radius:8px;padding:12px 14px;font-size:12px;font-family:monospace;color:var(--txt2);">' +
          'Client ID : 542914056011-7drpfjs105nc69ishahaim75...apps.googleusercontent.com<br>' +
          'Callback  : http://localhost:3001/auth/google/callback' +
        '</div>' +
        '<a href="https://console.cloud.google.com" target="_blank" class="btn btn-ghost" style="margin-top:10px;font-size:12px;">Ouvrir Google Cloud Console →</a>' +
      '</div>';

    /* Test SMTP */
    var testBtn = container.querySelector('#testSmtpBtn');
    if (testBtn) {
      testBtn.addEventListener('click', function () {
        var result = container.querySelector('#smtpTestResult');
        testBtn.disabled = true; testBtn.textContent = 'Test…';
        API.get('/api/email/test')
          .then(function (data) {
            result.textContent = data.ok ? '✅ Connexion OK' : '❌ Erreur : ' + data.reason;
            result.style.color = data.ok ? '#059669' : '#EF4444';
            testBtn.disabled = false; testBtn.textContent = 'Tester la connexion email';
          })
          .catch(function () {
            result.textContent = '❌ Erreur réseau';
            result.style.color = '#EF4444';
            testBtn.disabled = false; testBtn.textContent = 'Tester la connexion email';
          });
      });
    }
  }

  /* ─── Main render ─────────────────────────────────────────────────────── */
  function render(container) {
    var me = window.Store ? Store.get('me') : null;
    if (!me || !me.isAdmin) {
      container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--txt2);">Accès réservé à l\'administrateur.</div>';
      return;
    }

    container.innerHTML =
      '<div class="page-header">' +
        '<h1 class="page-title">Administration</h1>' +
        '<p class="page-sub">Gestion des clients et de la configuration</p>' +
      '</div>' +
      '<div style="display:flex;gap:3px;margin-bottom:20px;">' +
        '<div class="f-tab' + (currentTab === 'clients' ? ' active' : '') + '" data-tab="clients" style="cursor:pointer;">👥 Clients</div>' +
        '<div class="f-tab' + (currentTab === 'config' ? ' active' : '') + '" data-tab="config" style="cursor:pointer;">⚙️ Configuration</div>' +
      '</div>' +
      '<div id="adminTabContent"></div>';

    /* Tab switching */
    container.querySelectorAll('.f-tab[data-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        currentTab = tab.getAttribute('data-tab');
        container.querySelectorAll('.f-tab[data-tab]').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        loadTab(container.querySelector('#adminTabContent'));
      });
    });

    loadTab(container.querySelector('#adminTabContent'));
  }

  function loadTab(tabContent) {
    if (currentTab === 'clients') {
      tabContent.innerHTML = '<div style="padding:20px;text-align:center;color:var(--txt3);">Chargement…</div>';
      API.get('/admin/tenants')
        .then(function (tenants) { renderClients(tabContent, tenants); })
        .catch(function () { tabContent.innerHTML = '<p style="color:var(--red);padding:20px;">Erreur de chargement.</p>'; });
    } else {
      renderConfig(tabContent);
    }
  }

  return { render: render };
})();

window.AdminPage = AdminPage;
