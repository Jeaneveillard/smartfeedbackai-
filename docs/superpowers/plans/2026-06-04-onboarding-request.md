# Onboarding Request & Client Storage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow prospects to submit an access request form; admin receives an email notification, reviews requests in the admin panel, and approves (creates account + sends invite) or rejects them. All client info is stored in the tenant profile, visible only to admin.

**Architecture:** Two repos — frontend (SmartFeedbackAI, Cloudflare Workers) and backend (smartfeedbackai-api, Render). Backend uses Express + Knex + PostgreSQL. Frontend is a vanilla JS IIFE SPA. New public route `POST /api/onboarding-requests` stores the request and emails admin. Three new admin routes handle listing, approval (reuses existing tenant creation logic), and rejection. Frontend gets a new `OnboardingPage` module and a "Demandes" tab in the admin panel.

**Tech Stack:** Node.js/Express, Knex.js migrations, PostgreSQL (Neon), nodemailer (SMTP Gmail), vanilla JS IIFE, CSS custom properties.

**Repos:**
- Frontend: `C:\Users\jeane\Desktop\Amboul\SmartFeedbackAI`
- Backend: `C:\Users\jeane\Desktop\Amboul\smartfeedbackai-api`

---

## Task 1 — Backend: DB Migrations

**Repo:** `smartfeedbackai-api`

**Files:**
- Create: `src/db/migrations/20260604000007_add_onboarding_requests.js`
- Create: `src/db/migrations/20260604000008_add_tenant_profile_fields.js`

- [ ] **Step 1: Create migration for `onboarding_requests` table**

```js
// src/db/migrations/20260604000007_add_onboarding_requests.js
exports.up = function(knex) {
  return knex.schema.createTable('onboarding_requests', t => {
    t.increments('id').primary();
    t.string('business_name', 200).notNullable();
    t.string('sector', 100).notNullable();
    t.string('contact_name', 200).notNullable();
    t.string('email', 200).notNullable();
    t.string('phone', 50);
    t.string('address', 300).notNullable();
    t.string('city', 100).notNullable();
    t.string('website', 300);
    t.string('status', 20).notNullable().defaultTo('pending');
    t.text('notes');
    t.timestampTz('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('onboarding_requests');
};
```

- [ ] **Step 2: Create migration for tenant profile fields**

```js
// src/db/migrations/20260604000008_add_tenant_profile_fields.js
exports.up = function(knex) {
  return knex.schema.table('tenants', t => {
    t.string('sector', 100);
    t.string('phone', 50);
    t.string('address', 300);
    t.string('city', 100);
    t.string('website', 300);
  });
};

exports.down = function(knex) {
  return knex.schema.table('tenants', t => {
    t.dropColumn('sector');
    t.dropColumn('phone');
    t.dropColumn('address');
    t.dropColumn('city');
    t.dropColumn('website');
  });
};
```

- [ ] **Step 3: Run migrations**

```bash
cd C:\Users\jeane\Desktop\Amboul\smartfeedbackai-api
npx knex migrate:latest --knexfile src/db/knexfile.js
```

Expected output:
```
Batch 4 run: 2 migrations
20260604000007_add_onboarding_requests
20260604000008_add_tenant_profile_fields
```

- [ ] **Step 4: Verify tables exist**

```bash
npx knex migrate:status --knexfile src/db/knexfile.js
```

Expected: both new migrations show `[X]` (completed).

- [ ] **Step 5: Commit**

```bash
cd C:\Users\jeane\Desktop\Amboul\smartfeedbackai-api
git add src/db/migrations/20260604000007_add_onboarding_requests.js src/db/migrations/20260604000008_add_tenant_profile_fields.js
git commit -m "feat: add onboarding_requests table and tenant profile fields"
```

---

## Task 2 — Backend: Public Onboarding Route

**Repo:** `smartfeedbackai-api`

**Files:**
- Create: `src/routes/onboarding.js`
- Modify: `src/app.js`

- [ ] **Step 1: Create `src/routes/onboarding.js`**

```js
// src/routes/onboarding.js
'use strict';
const router       = require('express').Router();
const db           = require('../db');
const emailService = require('../services/emailService');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jeaneveillard@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/* POST /api/onboarding-requests — public, no auth */
router.post('/', async (req, res) => {
  const { business_name, sector, contact_name, email, phone, address, city, website } = req.body;

  if (!business_name || !sector || !contact_name || !email || !address || !city) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Format email invalide.' });
  }

  // Duplicate check — same email with pending status
  const existing = await db('onboarding_requests')
    .where({ email, status: 'pending' })
    .first();
  if (existing) {
    return res.status(409).json({ error: 'Une demande avec cet email est déjà en cours de traitement.' });
  }

  await db('onboarding_requests').insert({
    business_name,
    sector,
    contact_name,
    email,
    phone:   phone   || null,
    address,
    city,
    website: website || null,
    status:  'pending'
  });

  // Notify admin by email (non-blocking — failure doesn't affect response)
  const transporter = emailService.getTransporter();
  if (transporter) {
    const html = [
      '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>',
      '<body style="font-family:Inter,-apple-system,sans-serif;background:#F4F5F9;margin:0;padding:32px;">',
      '<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">',
      '<div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px 32px;">',
      '<div style="color:#fff;font-size:18px;font-weight:800;">SmartFeedback AI</div>',
      '<div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:4px;">Nouvelle demande d\'accès</div>',
      '</div>',
      '<div style="padding:28px 32px;">',
      '<h2 style="margin:0 0 20px;font-size:18px;font-weight:800;color:#111827;">📋 ' + business_name + '</h2>',
      '<table style="width:100%;border-collapse:collapse;font-size:13px;">',
      '<tr><td style="padding:8px 0;color:#6B7280;width:140px;">Secteur</td><td style="padding:8px 0;color:#111827;font-weight:600;">' + sector + '</td></tr>',
      '<tr><td style="padding:8px 0;color:#6B7280;">Adresse</td><td style="padding:8px 0;color:#111827;">' + address + ', ' + city + '</td></tr>',
      '<tr><td style="padding:8px 0;color:#6B7280;">Site web</td><td style="padding:8px 0;color:#111827;">' + (website || '—') + '</td></tr>',
      '<tr><td style="padding:8px 0;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:14px;">Contact</td><td style="padding:8px 0;color:#111827;font-weight:600;border-top:1px solid #E5E7EB;padding-top:14px;">' + contact_name + '</td></tr>',
      '<tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;color:#4F46E5;">' + email + '</td></tr>',
      '<tr><td style="padding:8px 0;color:#6B7280;">Téléphone</td><td style="padding:8px 0;color:#111827;">' + (phone || '—') + '</td></tr>',
      '</table>',
      '<a href="' + FRONTEND_URL + '" style="display:inline-block;margin-top:24px;background:#4F46E5;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">',
      'Traiter la demande dans le panel admin →',
      '</a>',
      '</div>',
      '</div></body></html>'
    ].join('');

    transporter.sendMail({
      from:    '"SmartFeedback AI" <' + (process.env.SMTP_FROM || process.env.SMTP_USER) + '>',
      to:      ADMIN_EMAIL,
      subject: '[SmartFeedback AI] Nouvelle demande — ' + business_name,
      html:    html
    }).catch(err => console.error('[onboarding] Email admin failed:', err.message));
  }

  res.status(201).json({ message: 'Demande reçue.' });
});

module.exports = router;
```

- [ ] **Step 2: Mount the route in `src/app.js`**

In `src/app.js`, add after the existing `app.use('/admin', ...)` line:

```js
app.use('/api/onboarding-requests', require('./routes/onboarding'));
```

The relevant section of `src/app.js` should look like:
```js
app.use('/auth', require('./routes/auth'));
app.use('/api/reviews',              require('./middleware/requireAuth'), require('./routes/reviews'));
app.use('/api/settings',             require('./middleware/requireAuth'), require('./routes/settings'));
app.use('/api/analytics',            require('./middleware/requireAuth'), require('./routes/analytics'));
app.use('/api/email',                require('./middleware/requireAuth'), require('./routes/email'));
app.use('/admin',                    require('./routes/admin').router);
app.use('/api/onboarding-requests',  require('./routes/onboarding'));
```

- [ ] **Step 3: Test the endpoint locally**

Start backend: `node src/server.js`

```bash
curl -X POST http://localhost:3001/api/onboarding-requests \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Le Bistro Test","sector":"Restaurants","contact_name":"Marie Dupont","email":"marie@bistro.com","phone":"514-555-0123","address":"123 rue Principale","city":"Montréal","website":"https://bistro.com"}'
```

Expected: `{"message":"Demande reçue."}` with status 201.

Test duplicate:
```bash
curl -X POST http://localhost:3001/api/onboarding-requests \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Le Bistro Test","sector":"Restaurants","contact_name":"Marie Dupont","email":"marie@bistro.com","phone":"","address":"123 rue","city":"Montréal"}'
```

Expected: `{"error":"Une demande avec cet email est déjà en cours de traitement."}` with status 409.

- [ ] **Step 4: Commit**

```bash
cd C:\Users\jeane\Desktop\Amboul\smartfeedbackai-api
git add src/routes/onboarding.js src/app.js
git commit -m "feat: add public POST /api/onboarding-requests with admin email notification"
```

---

## Task 3 — Backend: Admin Onboarding Endpoints

**Repo:** `smartfeedbackai-api`

**Files:**
- Modify: `src/routes/admin.js`

Add three new routes at the end of `src/routes/admin.js`, before the `module.exports` line.

- [ ] **Step 1: Add GET /admin/onboarding-requests**

```js
/* ─── GET /admin/onboarding-requests ─── list all requests ──────────────── */
router.get('/onboarding-requests', requireAdmin, async (_req, res) => {
  try {
    const requests = await db('onboarding_requests')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Add POST /admin/onboarding-requests/:id/approve**

```js
/* ─── POST /admin/onboarding-requests/:id/approve ───────────────────────── */
router.post('/onboarding-requests/:id/approve', requireAdmin, async (req, res) => {
  const { username, plan = 'beta' } = req.body;

  const request = await db('onboarding_requests').where({ id: req.params.id }).first();
  if (!request) return res.status(404).json({ error: 'Demande introuvable.' });
  if (request.status !== 'pending') return res.status(409).json({ error: 'Demande déjà traitée.' });

  if (!username) return res.status(400).json({ error: 'username requis.' });

  const existingEmail = await db('tenants').where({ email: request.email }).first();
  if (existingEmail) return res.status(409).json({ error: 'Un compte existe déjà pour cet email.' });

  const existingUser = await db('tenants').where({ username }).first();
  if (existingUser) return res.status(409).json({ error: 'Ce username est déjà pris.' });

  const inviteToken   = require('crypto').randomBytes(32).toString('hex');
  const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const frontendUrl   = process.env.FRONTEND_URL || 'http://localhost:3000';

  const [tenant] = await db('tenants').insert({
    name:              request.business_name,
    email:             request.email,
    username,
    plan,
    sector:            request.sector,
    phone:             request.phone,
    address:           request.address,
    city:              request.city,
    website:           request.website,
    active:            false,
    invite_token:      inviteToken,
    invite_expires_at: inviteExpires
  }).returning(['id', 'name', 'username', 'email', 'plan', 'active', 'created_at']);

  await db('onboarding_requests').where({ id: req.params.id }).update({ status: 'approved' });

  const inviteUrl = frontendUrl + '?invite=' + inviteToken;

  let emailSent = false;
  let emailError = null;
  try {
    await sendInviteEmail(request.email, request.business_name, username, inviteUrl, inviteExpires);
    emailSent = true;
  } catch (err) {
    emailError = err.message;
    console.error('[admin] Failed to send invite email:', err.message);
  }

  res.status(201).json({
    tenant,
    invite: {
      url:        inviteUrl,
      token:      inviteToken,
      expires:    inviteExpires,
      emailSent,
      emailError: emailError || undefined,
      note:       emailSent
        ? 'Email d\'invitation envoyé à ' + request.email + '. Lien valide 7 jours.'
        : 'Email non envoyé (SMTP). Partagez le lien manuellement.'
    }
  });
});
```

- [ ] **Step 3: Add POST /admin/onboarding-requests/:id/reject**

```js
/* ─── POST /admin/onboarding-requests/:id/reject ────────────────────────── */
router.post('/onboarding-requests/:id/reject', requireAdmin, async (req, res) => {
  const { notes } = req.body;
  const request = await db('onboarding_requests').where({ id: req.params.id }).first();
  if (!request) return res.status(404).json({ error: 'Demande introuvable.' });
  if (request.status !== 'pending') return res.status(409).json({ error: 'Demande déjà traitée.' });

  await db('onboarding_requests')
    .where({ id: req.params.id })
    .update({ status: 'rejected', notes: notes || null });

  res.json({ message: 'Demande rejetée.' });
});
```

- [ ] **Step 4: Update GET /admin/tenants to include profile fields**

Find this line in `src/routes/admin.js` (around line 108):

```js
      .select('id', 'name', 'username', 'email', 'active', 'plan', 'subscription_start', 'subscription_end', 'warning_sent', 'created_at', 'last_sync_at')
```

Replace with:

```js
      .select('id', 'name', 'username', 'email', 'active', 'plan', 'subscription_start', 'subscription_end', 'warning_sent', 'created_at', 'last_sync_at', 'sector', 'phone', 'address', 'city', 'website')
```

- [ ] **Step 5: Test the admin routes locally**

Get JWT first via login, then:

```bash
# List requests
curl http://localhost:3001/admin/onboarding-requests \
  -H "Authorization: Bearer <ADMIN_JWT>"

# Approve
curl -X POST http://localhost:3001/admin/onboarding-requests/1/approve \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"username":"lebistrotest","plan":"beta"}'

# Reject
curl -X POST http://localhost:3001/admin/onboarding-requests/1/reject \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Hors zone de service"}'
```

Expected: GET returns array, approve returns `{ tenant, invite }`, reject returns `{ message }`.

- [ ] **Step 6: Commit and push**

```bash
cd C:\Users\jeane\Desktop\Amboul\smartfeedbackai-api
git add src/routes/admin.js
git commit -m "feat: add admin onboarding-requests list/approve/reject endpoints"
git push origin master
```

---

## Task 4 — Frontend: OnboardingPage Module

**Repo:** `SmartFeedbackAI`

**Files:**
- Create: `css/pages/onboarding.css`
- Create: `js/pages/onboarding.js`

- [ ] **Step 1: Create `css/pages/onboarding.css`**

```css
/* ─── Onboarding Request Page ─── */
.ob-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg, #F4F5F9);
  padding: 40px 16px;
}

.ob-card {
  background: #fff;
  border: 1px solid var(--border, #E5E7EB);
  border-radius: 14px;
  padding: 36px 32px;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
}

.ob-logo {
  text-align: center;
  margin-bottom: 28px;
}

.ob-logo-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #818CF8, #4F46E5);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.ob-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -.4px;
}

.ob-subtitle {
  font-size: 13px;
  color: var(--txt2, #6B7280);
  margin: 0;
}

.ob-section-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary, #4F46E5);
  text-transform: uppercase;
  letter-spacing: .8px;
  margin: 24px 0 12px;
}

.ob-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ob-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ob-field.full {
  grid-column: 1 / -1;
}

.ob-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--txt1, #374151);
}

.ob-label .ob-req {
  color: var(--red, #EF4444);
  margin-left: 2px;
}

.ob-input {
  padding: 9px 12px;
  border: 1.5px solid var(--border, #D1D5DB);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  width: 100%;
  background: #fff;
  color: var(--txt1, #111827);
}

.ob-input:focus {
  border-color: var(--primary, #4F46E5);
}

.ob-error {
  display: none;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 7px;
  padding: 9px 12px;
  font-size: 13px;
  color: #B91C1C;
  margin-top: 14px;
}

.ob-submit {
  width: 100%;
  background: var(--primary, #4F46E5);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  margin-top: 20px;
}

.ob-submit:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.ob-success {
  text-align: center;
  padding: 40px 20px;
}

.ob-success-icon {
  width: 64px;
  height: 64px;
  background: #D1FAE5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 28px;
}

.ob-success h2 {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 10px;
}

.ob-success p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 540px) {
  .ob-card { padding: 28px 18px; }
  .ob-grid { grid-template-columns: 1fr; }
  .ob-field.full { grid-column: 1; }
}
```

- [ ] **Step 2: Create `js/pages/onboarding.js`**

```js
var OnboardingPage = (function() {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
```

- [ ] **Step 3: Commit**

```bash
cd C:\Users\jeane\Desktop\Amboul\SmartFeedbackAI
git add css/pages/onboarding.css js/pages/onboarding.js
git commit -m "feat: add OnboardingPage module with establishment request form"
```

---

## Task 5 — Frontend: Wire OnboardingPage into HTML and Landing

**Repo:** `SmartFeedbackAI`

**Files:**
- Modify: `index.html`
- Modify: `js/pages/landing.js`

- [ ] **Step 1: Add CSS link and script tag to `index.html`**

In `index.html`, after `<link rel="stylesheet" href="css/pages/landing.css">`, add:

```html
    <link rel="stylesheet" href="css/pages/onboarding.css">
```

After `<script src="js/pages/landing.js"></script>`, add:

```html
    <script src="js/pages/onboarding.js"></script>
```

The scripts section should look like:
```html
    <script src="js/pages/login.js"></script>
    <script src="js/pages/signup.js"></script>
    <script src="js/pages/landing.js"></script>
    <script src="js/pages/onboarding.js"></script>
    <script src="js/pages/privacy.js"></script>
    <script src="js/pages/contract.js"></script>

    <!-- Bootstrap — must be last -->
    <script src="js/main.js"></script>
```

- [ ] **Step 2: Update `showAuth` in `js/pages/landing.js`**

In `js/pages/landing.js`, replace the entire `showAuth` function:

```js
  function showAuth(container, page) {
    if (page === 'onboarding' && window.OnboardingPage) {
      OnboardingPage.render(container);
    } else if (window.LoginPage) {
      LoginPage.render(container);
    }
    var back = document.createElement('button');
    back.className = 'lp-back';
    back.innerHTML = '← Retour';
    back.addEventListener('click', function() { render(container); });
    container.appendChild(back);
  }
```

Then update the CTA listeners section (currently all call `showAuth(container, 'login')`):

```js
    on('lpNavLogin',   function() { showAuth(container, 'login'); });
    on('lpNavSignup',  function() { showAuth(container, 'onboarding'); });
    on('lpHeroLogin',  function() { showAuth(container, 'login'); });
    on('lpHeroSignup', function() { showAuth(container, 'onboarding'); });
    on('lpCtaLogin',   function() { showAuth(container, 'login'); });
    on('lpCtaSignup',  function() { showAuth(container, 'onboarding'); });
```

- [ ] **Step 3: Test locally**

```bash
cd C:\Users\jeane\Desktop\Amboul\SmartFeedbackAI
npx serve .
```

Open http://localhost:3000 in an incognito window (no JWT). Verify:
- "Se connecter" → login form appears with ← Retour button
- "Commencer gratuitement" → onboarding form appears with ← Retour button
- ← Retour → returns to landing page
- Submit form with missing required field → error message displayed
- Submit form with all fields → success message displayed

- [ ] **Step 4: Commit**

```bash
cd C:\Users\jeane\Desktop\Amboul\SmartFeedbackAI
git add index.html js/pages/landing.js
git commit -m "feat: wire OnboardingPage to landing CTAs and index.html"
```

---

## Task 6 — Frontend: Admin "Demandes" Tab + Client Profile

**Repo:** `SmartFeedbackAI`

**Files:**
- Modify: `js/pages/admin.js`

Three changes in `admin.js`:
1. Add `renderRequests` function
2. Add "Demandes" tab in `render()`
3. Add case in `loadTab()`
4. Add "Voir le profil" modal in `bindClientEvents()`

- [ ] **Step 1: Add `renderRequests` function**

Add this function after `renderClients` and before `renderConfig` in `admin.js`:

```js
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
          var username = modal.querySelector('#approveUsername').value.trim();
          var plan     = modal.querySelector('#approvePlan').value;
          var resEl    = modal.querySelector('#approveResult');
          var confirmBtn = modal.querySelector('#approveConfirm');
          if (!username) { Toast.show('Username requis', 'error'); return; }

          confirmBtn.disabled = true; confirmBtn.textContent = 'Création…';

          API.post('/admin/onboarding-requests/' + id + '/approve', { username: username, plan: plan })
            .then(function(data) {
              var inviteUrl  = data.invite ? data.invite.url : '';
              var emailSent  = data.invite && data.invite.emailSent;
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
        var id = btn.getAttribute('data-id');
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
```

- [ ] **Step 2: Update `render()` to add the "Demandes" tab with pending badge**

In `render()`, find:
```js
      '<div style="display:flex;gap:3px;margin-bottom:20px;">' +
        '<div class="f-tab' + (currentTab === 'clients' ? ' active' : '') + '" data-tab="clients" style="cursor:pointer;">👥 Clients</div>' +
        '<div class="f-tab' + (currentTab === 'config' ? ' active' : '') + '" data-tab="config" style="cursor:pointer;">⚙️ Configuration</div>' +
      '</div>' +
```

Replace with:
```js
      '<div style="display:flex;gap:3px;margin-bottom:20px;" id="adminTabBar"></div>' +
```

Then after `loadTab(container.querySelector('#adminTabContent'));`, add:

```js
    /* Build tab bar dynamically with pending badge */
    API.get('/admin/onboarding-requests').then(function(requests) {
      var pending = requests.filter(function(r) { return r.status === 'pending'; }).length;
      var badge = pending > 0
        ? ' <span style="background:#EF4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:4px;">' + pending + '</span>'
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
    }).catch(function() {
      container.querySelector('#adminTabBar').innerHTML =
        '<div class="f-tab' + (currentTab === 'clients' ? ' active' : '') + '" data-tab="clients" style="cursor:pointer;">👥 Clients</div>' +
        '<div class="f-tab' + (currentTab === 'requests' ? ' active' : '') + '" data-tab="requests" style="cursor:pointer;">📋 Demandes</div>' +
        '<div class="f-tab' + (currentTab === 'config' ? ' active' : '') + '" data-tab="config" style="cursor:pointer;">⚙️ Configuration</div>';

      container.querySelectorAll('.f-tab[data-tab]').forEach(function(tab) {
        tab.addEventListener('click', function() {
          currentTab = tab.getAttribute('data-tab');
          container.querySelectorAll('.f-tab[data-tab]').forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          loadTab(container.querySelector('#adminTabContent'));
        });
      });
    });
```

Also remove the old tab-switching block that comes after:
```js
    /* Tab switching */
    container.querySelectorAll('.f-tab[data-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        currentTab = tab.getAttribute('data-tab');
        container.querySelectorAll('.f-tab[data-tab]').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        loadTab(container.querySelector('#adminTabContent'));
      });
    });
```

- [ ] **Step 3: Update `loadTab()` to handle 'requests'**

Find `loadTab`:
```js
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
```

Replace with:
```js
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
```

- [ ] **Step 4: Add "Voir le profil" button to the clients table**

In `renderClients`, in the row actions `<td>`, after the `'👁 Voir'` preview button, add:

```js
            '<button class="btn btn-soft admin-profile" data-id="' + esc(t.id) + '" data-tenant=\'' + JSON.stringify({name:t.name,email:t.email,sector:t.sector||'',phone:t.phone||'',address:t.address||'',city:t.city||'',website:t.website||'',plan:t.plan||'',created_at:t.created_at}).replace(/'/g,'&#39;') + '\' style="font-size:11.5px;padding:4px 10px;">📋 Profil</button>' +
```

Then in `bindClientEvents`, add the profile modal handler:

```js
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
```

- [ ] **Step 5: Test admin panel locally**

```bash
npx serve .
```

1. Log in as admin (jean / Amboul2026!)
2. Go to Administration → verify 3 tabs: "Clients", "Demandes", "Configuration"
3. Click "Demandes" → verify list loads (empty or with test request)
4. Submit a test request from landing page (incognito) → verify badge appears on tab
5. Click "Approuver" → fill username, click create → verify invite link appears
6. Click "Clients" → click "📋 Profil" on a client → verify modal shows address/sector/phone

- [ ] **Step 6: Commit and push frontend**

```bash
cd C:\Users\jeane\Desktop\Amboul\SmartFeedbackAI
git add js/pages/admin.js
git commit -m "feat: add Demandes tab, approve/reject flow, and client profile modal in admin"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Public form with 8 fields (business_name, sector, address, city, website, contact_name, email, phone)
- ✅ "Commencer gratuitement" → OnboardingPage
- ✅ Backend stores request + emails admin on submission
- ✅ Admin panel: new "Demandes" tab with pending badge
- ✅ Approve: creates tenant with full profile + sends invite
- ✅ Reject: marks rejected with optional notes
- ✅ Tenant table stores sector/phone/address/city/website
- ✅ "Voir le profil" button in Clients tab (admin only)
- ✅ Client fields never returned in client-facing routes

**No placeholders:** All code is complete and explicit.

**Type consistency:** `onboarding_requests.id` is integer SERIAL (used as string in URL params — consistent with Node.js behavior). `tenants.id` is UUID (unchanged).
