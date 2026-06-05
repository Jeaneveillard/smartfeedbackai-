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
        '<td style="padding:12px 16px;text-align:center;">' +
          '<div style="font-size:14px;font-weight:700;color:#111827;">' + (t.total || 0) + '</div>' +
          '<div style="font-size:11px;color:var(--txt3);">total</div>' +
        '</td>' +
        '<td style="padding:12px 16px;text-align:center;">' +
          (t.pending > 0
            ? '<div style="background:#FEF2F2;color:#B91C1C;font-size:13px;font-weight:800;padding:3px 10px;border-radius:12px;display:inline-block;">' + t.pending + ' 🔴</div>'
            : '<div style="background:#ECFDF5;color:#059669;font-size:12px;font-weight:700;padding:3px 10px;border-radius:12px;display:inline-block;">✓</div>') +
        '</td>' +
        '<td style="padding:12px 16px;">' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="btn btn-soft admin-start" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" data-name="' + esc(t.name) + '" style="font-size:11.5px;padding:4px 10px;">+30j</button>' +
            '<button class="btn btn-soft admin-start90" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" style="font-size:11.5px;padding:4px 10px;">+90j</button>' +
            (t.active
              ? '<button class="btn btn-danger admin-deactivate" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" style="font-size:11.5px;padding:4px 10px;">Désactiver</button>'
              : '<button class="btn btn-soft admin-activate" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" style="font-size:11.5px;padding:4px 10px;">Activer</button>') +
            '<button class="btn btn-ghost admin-reset-pw" data-id="' + esc(t.id) + '" data-email="' + esc(t.email) + '" data-username="' + esc(t.username || t.email) + '" data-name="' + esc(t.name) + '" style="font-size:11.5px;padding:4px 10px;">🔑</button>' +
            '<button class="btn btn-soft admin-preview" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '" style="font-size:11.5px;padding:4px 10px;color:var(--primary);">👁 Voir</button>' +
            '<button class="btn btn-soft admin-profile" data-id="' + esc(t.id) + '" data-tenant=\'' + JSON.stringify({name:t.name,email:t.email,sector:t.sector||'',phone:t.phone||'',address:t.address||'',city:t.city||'',website:t.website||'',plan:t.plan||'',created_at:t.created_at}).replace(/'/g,'&#39;') + '\' style="font-size:11.5px;padding:4px 10px;">📋 Profil</button>' +
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
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:center;">Avis</th>' +
            '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:center;">En attente</th>' +
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
            var pw = data.tempPassword; // only present if email failed
            var emailSent = data.emailSent;
            var modal = document.createElement('div');
            modal.style.cssText =
              'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;' +
              'display:flex;align-items:center;justify-content:center;';
            modal.innerHTML =
              '<div style="background:#fff;border-radius:12px;padding:28px 32px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);">' +
                '<div style="font-size:16px;font-weight:800;margin-bottom:6px;">🔑 Réinitialisation du mot de passe</div>' +
                '<div style="font-size:13px;color:#6B7280;margin-bottom:16px;">Pour <strong>' + esc(name) + '</strong> (@' + esc(username) + ')</div>' +
                (emailSent
                  ? '<div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:#065F46;">✅ Email envoyé au client avec le nouveau mot de passe.</div>'
                  : '<div style="background:#FEF3C7;border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:#92400E;">⚠️ Email non envoyé (SMTP). Partagez manuellement :</div>') +
                (pw
                  ? '<div style="margin-bottom:16px;">' +
                      '<div style="display:flex;gap:8px;align-items:center;">' +
                        '<div style="position:relative;flex:1;">' +
                          '<input id="pwdModalInput" type="password" value="' + esc(pw) + '" readonly ' +
                            'style="width:100%;padding:10px 40px 10px 12px;border:1.5px solid #E5E7EB;border-radius:8px;' +
                            'font-size:15px;font-family:monospace;letter-spacing:2px;box-sizing:border-box;background:#F9FAFB;">' +
                          '<button id="pwdEyeBtn" type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9CA3AF;padding:4px;">' +
                            '<svg id="pwdEyeIco" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
                          '</button>' +
                        '</div>' +
                        '<button id="pwdCopyBtn" class="btn btn-soft" style="white-space:nowrap;font-size:12px;padding:8px 14px;">Copier</button>' +
                      '</div>' +
                    '</div>'
                  : '') +
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

    /* Preview — view dashboard as client */
    container.querySelectorAll('.admin-preview').forEach(function(el) {
      el.addEventListener('click', function() {
        var id   = el.getAttribute('data-id');
        var name = el.getAttribute('data-name');
        el.disabled = true; el.textContent = '…';

        API.post('/admin/tenants/' + id + '/preview', {})
          .then(function(data) {
            // Save admin JWT so we can return
            localStorage.setItem('sfai_jwt_admin', localStorage.getItem('sfai_jwt'));
            localStorage.setItem('sfai_preview_name', name);
            localStorage.setItem('sfai_jwt', data.token);
            window.location.reload();
          })
          .catch(function() {
            Toast.show('Erreur', 'error');
            el.disabled = false; el.textContent = '👁 Voir';
          });
      });
    });

    /* Profile modal */
    container.querySelectorAll('.admin-profile').forEach(function(el) {
      el.addEventListener('click', function() {
        var t;
        try { t = JSON.parse(el.getAttribute('data-tenant')); } catch(e) { return; }
        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML =
          '<div style="background:#fff;border-radius:12px;padding:28px 32px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);">' +
            '<div style="font-size:16px;font-weight:800;margin-bottom:4px;">📋 ' + esc(t.name) + '</div>' +
            '<div style="font-size:12px;color:#6B7280;margin-bottom:20px;">Profil complet — visible admin uniquement</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
              '<tr><td style="padding:7px 0;color:#6B7280;width:110px;">Secteur</td><td style="padding:7px 0;font-weight:600;">' + esc(t.sector || '—') + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Email</td><td style="padding:7px 0;">' + esc(t.email) + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Téléphone</td><td style="padding:7px 0;">' + esc(t.phone || '—') + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Adresse</td><td style="padding:7px 0;">' + esc(t.address || '—') + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Ville</td><td style="padding:7px 0;">' + esc(t.city || '—') + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Site web</td><td style="padding:7px 0;">' + esc(t.website || '—') + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Plan</td><td style="padding:7px 0;">' + esc(t.plan || '—') + '</td></tr>' +
              '<tr><td style="padding:7px 0;color:#6B7280;">Créé le</td><td style="padding:7px 0;">' + fmtDate(t.created_at) + '</td></tr>' +
            '</table>' +
            '<button id="profileClose" class="btn btn-primary" style="width:100%;margin-top:20px;">Fermer</button>' +
          '</div>';
        document.body.appendChild(modal);
        modal.querySelector('#profileClose').addEventListener('click', function() { document.body.removeChild(modal); });
        modal.addEventListener('click', function(e) { if (e.target === modal) document.body.removeChild(modal); });
      });
    });
  }

  /* ─── Render requests tab ─────────────────────────────────────────────── */
  function renderRequests(container, requests) {
    var pending = requests.filter(function(r) { return r.status === 'pending'; }).length;

    var rows = requests.map(function(r) {
      var statusBadge = r.status === 'pending'
        ? '<span style="background:#FEF3C7;color:#D97706;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">En attente</span>'
        : r.status === 'approved'
          ? '<span style="background:#ECFDF5;color:#059669;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">Approuvée</span>'
          : '<span style="background:#FEF2F2;color:#B91C1C;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">Rejetée</span>';

      var actions = r.status === 'pending'
        ? '<button class="btn btn-primary ob-approve" data-id="' + esc(r.id) + '" data-name="' + esc(r.business_name) + '" data-email="' + esc(r.email) + '" style="font-size:11.5px;padding:4px 12px;">Approuver</button>' +
          '<button class="btn btn-danger ob-reject" data-id="' + esc(r.id) + '" style="font-size:11.5px;padding:4px 10px;margin-left:6px;">Rejeter</button>'
        : '—';

      return '<tr style="border-bottom:1px solid var(--border-faint);">' +
        '<td style="padding:12px 16px;">' +
          '<div style="font-weight:600;font-size:13.5px;">' + esc(r.business_name) + '</div>' +
          '<div style="font-size:12px;color:var(--txt3);margin-top:2px;">' + esc(r.sector) + '</div>' +
        '</td>' +
        '<td style="padding:12px 16px;font-size:12px;color:var(--txt2);">' + esc(r.city) + '</td>' +
        '<td style="padding:12px 16px;font-size:12px;">' +
          '<div style="font-weight:600;">' + esc(r.contact_name) + '</div>' +
          '<div style="color:var(--txt3);">' + esc(r.email) + '</div>' +
        '</td>' +
        '<td style="padding:12px 16px;font-size:12px;color:var(--txt3);">' + fmtDate(r.created_at) + '</td>' +
        '<td style="padding:12px 16px;">' + statusBadge + '</td>' +
        '<td style="padding:12px 16px;">' + actions + '</td>' +
      '</tr>';
    }).join('');

    container.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<div>' +
          '<h2 style="font-size:16px;font-weight:800;margin:0 0 4px;">Demandes d\'accès (' + requests.length + ')</h2>' +
          '<p style="font-size:13px;color:var(--txt2);margin:0;">' + pending + ' en attente de traitement</p>' +
        '</div>' +
      '</div>' +
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;">' +
        (requests.length === 0
          ? '<div style="padding:40px;text-align:center;color:var(--txt3);">Aucune demande reçue.</div>'
          : '<table style="width:100%;border-collapse:collapse;">' +
              '<thead><tr style="background:var(--bg);">' +
                '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Établissement</th>' +
                '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Ville</th>' +
                '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Contact</th>' +
                '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Date</th>' +
                '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Statut</th>' +
                '<th style="padding:10px 16px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;text-align:left;">Actions</th>' +
              '</tr></thead>' +
              '<tbody>' + rows + '</tbody>' +
            '</table>') +
      '</div>';

    /* Approve button */
    container.querySelectorAll('.ob-approve').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id   = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name');
        var suggestedUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML =
          '<div style="background:#fff;border-radius:12px;padding:28px 32px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);">' +
            '<div style="font-size:16px;font-weight:800;margin-bottom:6px;">✅ Approuver la demande</div>' +
            '<div style="font-size:13px;color:#6B7280;margin-bottom:20px;">' + esc(name) + '</div>' +
            '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">USERNAME</label>' +
            '<input id="approveUsername" type="text" value="' + esc(suggestedUsername) + '" class="form-input" style="margin-bottom:14px;">' +
            '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">PLAN</label>' +
            '<select id="approvePlan" class="form-input" style="margin-bottom:20px;">' +
              '<option value="beta">Bêta</option>' +
              '<option value="pro">Pro</option>' +
              '<option value="business">Business</option>' +
            '</select>' +
            '<div id="approveResult" style="display:none;margin-bottom:14px;"></div>' +
            '<div style="display:flex;gap:10px;">' +
              '<button id="approveConfirm" class="btn btn-primary" style="flex:1;">Créer le compte &amp; envoyer l\'invitation</button>' +
              '<button id="approveCancel" class="btn btn-ghost">Annuler</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(modal);

        modal.querySelector('#approveCancel').addEventListener('click', function() { document.body.removeChild(modal); });
        modal.addEventListener('click', function(e) { if (e.target === modal) document.body.removeChild(modal); });

        modal.querySelector('#approveConfirm').addEventListener('click', function() {
          var username   = modal.querySelector('#approveUsername').value.trim();
          var plan       = modal.querySelector('#approvePlan').value;
          var resEl      = modal.querySelector('#approveResult');
          var confirmBtn = modal.querySelector('#approveConfirm');
          if (!username) { Toast.show('Username requis', 'error'); return; }

          confirmBtn.disabled = true; confirmBtn.textContent = 'Création…';

          API.post('/admin/onboarding-requests/' + id + '/approve', { username: username, plan: plan })
            .then(function(data) {
              var inviteUrl = data.invite ? data.invite.url : '';
              var emailSent = data.invite && data.invite.emailSent;
              resEl.style.display = '';
              resEl.innerHTML =
                '<div style="background:#ECFDF5;border:1px solid #6EE7B7;border-radius:8px;padding:14px;">' +
                  '<div style="font-size:13px;font-weight:700;color:#065F46;margin-bottom:8px;">✅ Compte créé !</div>' +
                  (emailSent
                    ? '<div style="font-size:12px;color:#065F46;margin-bottom:8px;">📧 Invitation envoyée à ' + esc(data.tenant ? data.tenant.email : '') + '</div>'
                    : '<div style="font-size:12px;color:#92400E;margin-bottom:8px;">⚠️ Email non envoyé. Partagez le lien :</div>') +
                  '<input type="text" value="' + esc(inviteUrl) + '" readonly style="width:100%;padding:7px 10px;border:1px solid #D1D5DB;border-radius:6px;font-size:11px;font-family:monospace;box-sizing:border-box;">' +
                '</div>';
              confirmBtn.textContent = 'Fermer';
              confirmBtn.disabled = false;
              confirmBtn.onclick = function() {
                document.body.removeChild(modal);
                loadTab(container);
              };
            })
            .catch(function(err) {
              Toast.show(err.message || 'Erreur', 'error');
              confirmBtn.disabled = false; confirmBtn.textContent = 'Créer le compte & envoyer l\'invitation';
            });
        });
      });
    });

    /* Reject button */
    container.querySelectorAll('.ob-reject').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id    = btn.getAttribute('data-id');
        var notes = window.prompt('Note de rejet (optionnel) :') || '';
        API.post('/admin/onboarding-requests/' + id + '/reject', { notes: notes })
          .then(function() {
            Toast.show('Demande rejetée', 'info');
            loadTab(container);
          })
          .catch(function() { Toast.show('Erreur', 'error'); });
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

      /* Beta duration */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px 22px;margin-bottom:16px;">' +
        '<div style="font-size:13.5px;font-weight:700;margin-bottom:4px;">⏳ Durée de la période bêta</div>' +
        '<div style="font-size:12.5px;color:var(--txt2);margin-bottom:12px;">Nombre de jours accordés automatiquement aux nouveaux comptes bêta lors de leur première activation.</div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<input class="form-input" type="number" id="betaDaysInput" min="1" max="365" style="width:100px;" placeholder="7">' +
          '<button class="btn btn-primary" id="saveBetaDaysBtn" style="font-size:12.5px;">Enregistrer</button>' +
          '<span id="betaDaysStatus" style="font-size:12.5px;"></span>' +
        '</div>' +
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
          'Callback  : https://smartfeedbackai-api.onrender.com/auth/google/callback' +
        '</div>' +
        '<a href="https://console.cloud.google.com" target="_blank" class="btn btn-ghost" style="margin-top:10px;font-size:12px;">Ouvrir Google Cloud Console →</a>' +
      '</div>';

    /* Beta days — load current value then wire save */
    var betaInput  = container.querySelector('#betaDaysInput');
    var betaSaveBtn = container.querySelector('#saveBetaDaysBtn');
    var betaStatus = container.querySelector('#betaDaysStatus');
    API.get('/admin/config')
      .then(function(cfg) { if (betaInput) betaInput.value = cfg.beta_days || 7; })
      .catch(function()   { if (betaInput) betaInput.value = 7; });

    if (betaSaveBtn) {
      betaSaveBtn.addEventListener('click', function() {
        var days = parseInt(betaInput.value, 10);
        if (!days || days < 1 || days > 365) { Toast.show('Valeur invalide (1–365)', 'error'); return; }
        betaSaveBtn.disabled = true; betaSaveBtn.textContent = '…';
        API.patch('/admin/config', { beta_days: days })
          .then(function() {
            betaStatus.textContent = '✅ Enregistré';
            betaStatus.style.color = '#059669';
            betaSaveBtn.disabled = false; betaSaveBtn.textContent = 'Enregistrer';
            setTimeout(function() { betaStatus.textContent = ''; }, 3000);
          })
          .catch(function(err) {
            betaStatus.textContent = '❌ ' + (err.message || 'Erreur');
            betaStatus.style.color = '#EF4444';
            betaSaveBtn.disabled = false; betaSaveBtn.textContent = 'Enregistrer';
          });
      });
    }

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
      '<div style="display:flex;gap:3px;margin-bottom:20px;" id="adminTabBar"></div>' +
      '<div id="adminTabContent"></div>';

    function buildTabBar(pendingCount) {
      var badge = pendingCount > 0
        ? ' <span style="background:#EF4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:4px;">' + pendingCount + '</span>'
        : '';
      container.querySelector('#adminTabBar').innerHTML =
        '<div class="f-tab' + (currentTab === 'clients' ? ' active' : '') + '" data-tab="clients" style="cursor:pointer;">👥 Clients</div>' +
        '<div class="f-tab' + (currentTab === 'requests' ? ' active' : '') + '" data-tab="requests" style="cursor:pointer;">📋 Demandes' + badge + '</div>' +
        '<div class="f-tab' + (currentTab === 'config' ? ' active' : '') + '" data-tab="config" style="cursor:pointer;">⚙️ Configuration</div>';

      container.querySelectorAll('.f-tab[data-tab]').forEach(function(tab) {
        tab.addEventListener('click', function() {
          currentTab = tab.getAttribute('data-tab');
          container.querySelectorAll('.f-tab[data-tab]').forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          loadTab(container.querySelector('#adminTabContent'));
        });
      });
    }

    loadTab(container.querySelector('#adminTabContent'));

    API.get('/admin/onboarding-requests')
      .then(function(requests) {
        var pending = requests.filter(function(r) { return r.status === 'pending'; }).length;
        buildTabBar(pending);
      })
      .catch(function() { buildTabBar(0); });
  }

  function loadTab(tabContent) {
    tabContent.innerHTML = '<div style="padding:20px;text-align:center;color:var(--txt3);">Chargement…</div>';
    if (currentTab === 'clients') {
      API.get('/admin/tenants')
        .then(function(tenants) { renderClients(tabContent, tenants); })
        .catch(function() { tabContent.innerHTML = '<p style="color:var(--red);padding:20px;">Erreur de chargement.</p>'; });
    } else if (currentTab === 'requests') {
      API.get('/admin/onboarding-requests')
        .then(function(requests) { renderRequests(tabContent, requests); })
        .catch(function() { tabContent.innerHTML = '<p style="color:var(--red);padding:20px;">Erreur de chargement.</p>'; });
    } else {
      renderConfig(tabContent);
    }
  }

  return { render: render };
})();

window.AdminPage = AdminPage;
