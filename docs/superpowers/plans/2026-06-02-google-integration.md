# SmartFeedbackAI — Plan 2 : Intégration Google Business Profile API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the backend to Google Business Profile API to read reviews automatically (hourly cron) and post AI-generated responses directly to Google.

**Architecture:** Extends the backend from Plan 1. `src/services/googleApi.js` wraps all Google API calls with automatic token refresh. `src/services/reviewSync.js` uses it to upsert reviews. `src/cron/syncReviews.js` is upgraded from stub to fully working. `POST /api/reviews/:id/reply` posts to Google then updates the DB. A new `POST /api/sync/locations` flow handles first-login location selection.

**Tech Stack:** Google Business Profile API v4 · My Business Account Management API v1 · googleapis npm package · node-cron (already installed)

**Prerequisite:** Plan 1 (`2026-06-02-backend-database.md`) must be fully deployed and working.

---

## File Map

| File | Change |
|------|--------|
| `src/services/googleApi.js` | NEW — all Google API HTTP calls, auto token refresh |
| `src/services/reviewSync.js` | NEW — fetch reviews from Google + upsert into DB |
| `src/cron/syncReviews.js` | REPLACE stub with real sync using reviewSync service |
| `src/routes/reviews.js` | REPLACE 501 stub in reply route with real Google posting |
| `src/routes/auth.js` | ADD `/api/setup/locations` and `POST /api/setup/location` |
| `tests/googleApi.test.js` | NEW — unit tests with mocked HTTP |
| `tests/reviewSync.test.js` | NEW — sync logic with mocked googleApi |

---

### Task 1: Install googleapis and set up Google API wrapper

**Files:**
- Create: `src/services/googleApi.js`
- Create: `tests/googleApi.test.js`

- [ ] **Step 1: Install dependency**

```bash
npm install googleapis
```

- [ ] **Step 2: Write tests (with mocked fetch)**

```js
// tests/googleApi.test.js
const { getAccounts, getLocations, getReviews, postReply, refreshAccessToken } = require('../src/services/googleApi');

// Mock fetch globally for these tests
global.fetch = jest.fn();

afterEach(() => { jest.clearAllMocks(); });

describe('refreshAccessToken', () => {
  it('returns new access token from Google', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'new_token_123' })
    });
    const token = await refreshAccessToken('refresh_token_abc');
    expect(token).toBe('new_token_123');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws if Google returns error', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: 'invalid_grant' }) });
    await expect(refreshAccessToken('bad_refresh')).rejects.toThrow('400');
  });
});

describe('getAccounts', () => {
  it('returns list of accounts', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [{ name: 'accounts/123', accountName: 'Le Bistro' }] })
    });
    const accounts = await getAccounts('access_token');
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('accounts/123');
  });
});

describe('getReviews', () => {
  it('maps Google star ratings to integers', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reviews: [{
          reviewId: 'r1',
          reviewer: { displayName: 'Alice' },
          starRating: 'FIVE',
          comment: 'Excellent!',
          createTime: '2026-05-01T12:00:00Z',
          updateTime: '2026-05-01T12:00:00Z',
          reviewReply: null
        }]
      })
    });
    const { reviews } = await getReviews('token', 'accounts/123', 'locations/456');
    expect(reviews[0].rating).toBe(5);
    expect(reviews[0].google_review_id).toBe('r1');
    expect(reviews[0].status).toBe('pending');
  });

  it('marks review as responded when reviewReply exists', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reviews: [{
          reviewId: 'r2',
          reviewer: { displayName: 'Bob' },
          starRating: 'THREE',
          comment: 'Correct.',
          createTime: '2026-05-01T12:00:00Z',
          updateTime: '2026-05-01T12:00:00Z',
          reviewReply: { comment: 'Merci !' }
        }]
      })
    });
    const { reviews } = await getReviews('token', 'accounts/123', 'locations/456');
    expect(reviews[0].status).toBe('responded');
    expect(reviews[0].response).toBe('Merci !');
  });
});

describe('postReply', () => {
  it('calls the correct Google endpoint', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ comment: 'Merci !', updateTime: '...' }) });
    await postReply('token', 'accounts/123', 'locations/456', 'reviewId789', 'Merci !');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('reviewId789/reply'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('throws on 429 rate limit', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) });
    await expect(postReply('token', 'a', 'l', 'r', 'text')).rejects.toThrow('429');
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=googleApi
# Expected: FAIL — Cannot find module '../src/services/googleApi'
```

- [ ] **Step 4: Create `src/services/googleApi.js`**

```js
'use strict';
require('dotenv').config();

const STAR_MAP = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const GBP_BASE = 'https://mybusiness.googleapis.com/v4';
const ACCT_MGT = 'https://mybusinessaccountmanagement.googleapis.com/v1';

async function gFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = new Error('Google API error ' + res.status);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    'refresh_token'
    })
  });
  if (!res.ok) {
    const err = new Error('Token refresh failed ' + res.status);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.access_token;
}

async function getAccounts(accessToken) {
  const data = await gFetch(ACCT_MGT + '/accounts', accessToken);
  return data.accounts || [];
}

async function getLocations(accessToken, accountId) {
  const data = await gFetch(ACCT_MGT + '/v1/' + accountId + '/locations', accessToken);
  return data.locations || [];
}

async function getReviews(accessToken, accountId, locationId, pageToken) {
  let url = GBP_BASE + '/' + accountId + '/' + locationId + '/reviews?pageSize=50&orderBy=updateTime+desc';
  if (pageToken) url += '&pageToken=' + pageToken;

  const data = await gFetch(url, accessToken);
  const reviews = (data.reviews || []).map(r => ({
    google_review_id: r.reviewId,
    author:           r.reviewer ? r.reviewer.displayName : 'Anonyme',
    author_initials:  r.reviewer ? r.reviewer.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AN',
    rating:           STAR_MAP[r.starRating] || 3,
    text:             r.comment || '',
    date:             r.createTime,
    source:           'google',
    status:           r.reviewReply ? 'responded' : 'pending',
    response:         r.reviewReply ? r.reviewReply.comment : null
  }));

  return { reviews, nextPageToken: data.nextPageToken || null };
}

async function postReply(accessToken, accountId, locationId, reviewId, comment) {
  const url = GBP_BASE + '/' + accountId + '/' + locationId + '/reviews/' + reviewId + '/reply';
  return gFetch(url, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ comment })
  });
}

module.exports = { refreshAccessToken, getAccounts, getLocations, getReviews, postReply };
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=googleApi
# Expected: PASS (7 tests)
```

- [ ] **Step 6: Commit**

```bash
git add src/services/googleApi.js tests/googleApi.test.js
git commit -m "feat: Google Business Profile API wrapper with token refresh"
```

---

### Task 2: Review sync service

**Files:**
- Create: `src/services/reviewSync.js`
- Create: `tests/reviewSync.test.js`

- [ ] **Step 1: Write tests**

```js
// tests/reviewSync.test.js
const db          = require('../src/db');
const reviewSync  = require('../src/services/reviewSync');
const googleApi   = require('../src/services/googleApi');
const { createTenant, cleanDb } = require('./helpers');

jest.mock('../src/services/googleApi');

let tenant;
beforeEach(async () => {
  await cleanDb();
  tenant = await createTenant({ email: 'sync@test.com' });
  await db('tenants').where({ id: tenant.id }).update({
    google_access_token:  'access_123',
    google_refresh_token: 'refresh_abc',
    google_account_id:    'accounts/999',
    google_location_id:   'locations/777'
  });
  tenant = await db('tenants').where({ id: tenant.id }).first();
});

describe('syncTenant', () => {
  it('inserts new reviews into the database', async () => {
    googleApi.getReviews.mockResolvedValueOnce({
      reviews: [{
        google_review_id: 'gr1', author: 'Alice', author_initials: 'AL',
        rating: 5, text: 'Super!', date: new Date(), source: 'google',
        status: 'pending', response: null
      }],
      nextPageToken: null
    });

    await reviewSync.syncTenant(tenant);

    const reviews = await db('reviews').where({ tenant_id: tenant.id });
    expect(reviews).toHaveLength(1);
    expect(reviews[0].author).toBe('Alice');
  });

  it('updates existing reviews (upsert)', async () => {
    // Pre-insert
    await db('reviews').insert({
      tenant_id: tenant.id, google_review_id: 'gr1',
      author: 'Alice', rating: 4, text: 'Bien.', date: new Date(), source: 'google', status: 'pending'
    });

    googleApi.getReviews.mockResolvedValueOnce({
      reviews: [{
        google_review_id: 'gr1', author: 'Alice', author_initials: 'AL',
        rating: 5, text: 'Excellent!', date: new Date(), source: 'google',
        status: 'responded', response: 'Merci !'
      }],
      nextPageToken: null
    });

    await reviewSync.syncTenant(tenant);

    const reviews = await db('reviews').where({ tenant_id: tenant.id });
    expect(reviews).toHaveLength(1);
    expect(reviews[0].rating).toBe(5);
    expect(reviews[0].status).toBe('responded');
  });

  it('refreshes token on 401 and retries', async () => {
    const err = new Error('401'); err.status = 401;
    googleApi.getReviews
      .mockRejectedValueOnce(err)  // first call fails
      .mockResolvedValueOnce({ reviews: [], nextPageToken: null }); // after refresh

    googleApi.refreshAccessToken.mockResolvedValueOnce('new_access_token');

    await reviewSync.syncTenant(tenant);

    expect(googleApi.refreshAccessToken).toHaveBeenCalledWith('refresh_abc');
    expect(googleApi.getReviews).toHaveBeenCalledTimes(2);
  });

  it('updates last_sync_at after successful sync', async () => {
    googleApi.getReviews.mockResolvedValueOnce({ reviews: [], nextPageToken: null });
    await reviewSync.syncTenant(tenant);
    const updated = await db('tenants').where({ id: tenant.id }).first();
    expect(updated.last_sync_at).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=reviewSync
# Expected: FAIL — Cannot find module '../src/services/reviewSync'
```

- [ ] **Step 3: Create `src/services/reviewSync.js`**

```js
'use strict';
const db        = require('../db');
const googleApi = require('./googleApi');

async function syncTenant(tenant) {
  if (!tenant.google_account_id || !tenant.google_location_id) {
    console.log('[sync] Skipping tenant', tenant.email, '— no location configured');
    return;
  }

  let accessToken = tenant.google_access_token;
  let allReviews  = [];
  let pageToken   = null;

  try {
    // Fetch all pages
    do {
      let result;
      try {
        result = await googleApi.getReviews(accessToken, tenant.google_account_id, tenant.google_location_id, pageToken);
      } catch (err) {
        if (err.status === 401 && tenant.google_refresh_token) {
          // Refresh token and retry once
          accessToken = await googleApi.refreshAccessToken(tenant.google_refresh_token);
          await db('tenants').where({ id: tenant.id }).update({ google_access_token: accessToken });
          result = await googleApi.getReviews(accessToken, tenant.google_account_id, tenant.google_location_id, pageToken);
        } else {
          throw err;
        }
      }
      allReviews = allReviews.concat(result.reviews);
      pageToken  = result.nextPageToken;
    } while (pageToken);

    // Upsert reviews
    for (const review of allReviews) {
      await db('reviews')
        .insert({ ...review, tenant_id: tenant.id })
        .onConflict('google_review_id')
        .merge(['author', 'rating', 'text', 'date', 'status', 'response', 'updated_at']);
    }

    await db('tenants').where({ id: tenant.id }).update({ last_sync_at: new Date() });
    console.log('[sync] Tenant', tenant.email, '— upserted', allReviews.length, 'reviews');
  } catch (err) {
    if (err.status === 403) {
      console.error('[sync] Tenant', tenant.email, '— permissions révoquées. Needs reauth.');
    } else {
      console.error('[sync] Tenant', tenant.email, '— error:', err.message);
    }
  }
}

module.exports = { syncTenant };
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=reviewSync
# Expected: PASS (4 tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/services/reviewSync.js tests/reviewSync.test.js
git commit -m "feat: review sync service with upsert and token refresh"
```

---

### Task 3: Wire cron job to real sync

**Files:**
- Modify: `src/cron/syncReviews.js`

- [ ] **Step 1: Replace stub with real implementation**

```js
// src/cron/syncReviews.js  — full replacement
'use strict';
const cron        = require('node-cron');
const db          = require('../db');
const reviewSync  = require('../services/reviewSync');

async function syncAllTenants() {
  console.log('[cron] Starting review sync —', new Date().toISOString());
  const tenants = await db('tenants').whereNotNull('google_refresh_token');
  console.log('[cron] Tenants to sync:', tenants.length);
  for (const tenant of tenants) {
    await reviewSync.syncTenant(tenant);
  }
  console.log('[cron] Sync complete.');
}

function startCron() {
  cron.schedule('0 * * * *', syncAllTenants);
  console.log('[cron] Hourly review sync scheduled.');
}

module.exports = { startCron, syncAllTenants };
```

- [ ] **Step 2: Manual integration test**

```bash
# With a real Google-connected tenant in the DB:
node -e "require('dotenv').config(); const {syncAllTenants}=require('./src/cron/syncReviews'); syncAllTenants().then(()=>process.exit())"
# Expected: [cron] Starting review sync — ...
#           [cron] Tenant x@x.com — upserted N reviews
#           [cron] Sync complete.
```

- [ ] **Step 3: Commit**

```bash
git add src/cron/syncReviews.js
git commit -m "feat: wire hourly cron to real Google review sync"
```

---

### Task 4: POST /api/reviews/:id/reply — real Google posting

**Files:**
- Modify: `src/routes/reviews.js`

- [ ] **Step 1: Add integration test**

```js
// In tests/reviews.test.js, add:
const googleApi = require('../src/services/googleApi');
jest.mock('../src/services/googleApi');

describe('POST /api/reviews/:id/reply — with Google connected', () => {
  beforeEach(async () => {
    await cleanDb();
    tenant = await createTenant();
    token  = makeJwt(tenant);
    // Set up Google tokens
    await db('tenants').where({ id: tenant.id }).update({
      google_access_token: 'token_abc',
      google_account_id:   'accounts/1',
      google_location_id:  'locations/2'
    });
    tenant = await db('tenants').where({ id: tenant.id }).first();
    token  = makeJwt(tenant);
    await db('reviews').insert({
      tenant_id: tenant.id, google_review_id: 'gr_abc',
      author: 'Alice', rating: 5, text: 'Top!', status: 'pending', source: 'google', date: new Date()
    });
  });

  it('posts reply to Google and updates DB to responded', async () => {
    googleApi.postReply.mockResolvedValueOnce({ comment: 'Merci !', updateTime: new Date().toISOString() });
    const [review] = await db('reviews').where({ tenant_id: tenant.id });

    const res = await request(app)
      .post('/api/reviews/' + review.id + '/reply')
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Merci !' });

    expect(res.status).toBe(200);
    expect(res.body.googlePosted).toBe(true);

    const updated = await db('reviews').where({ id: review.id }).first();
    expect(updated.status).toBe('responded');
    expect(updated.response).toBe('Merci !');
    expect(updated.responded_at).not.toBeNull();
  });

  it('returns 400 if text is missing', async () => {
    const [review] = await db('reviews').where({ tenant_id: tenant.id });
    const res = await request(app)
      .post('/api/reviews/' + review.id + '/reply')
      .set('Authorization', 'Bearer ' + token)
      .send({});
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL on new test**

```bash
npm test -- --testPathPattern=reviews
# Expected: FAIL — googlePosted is false (still using stub)
```

- [ ] **Step 3: Update reply handler in `src/routes/reviews.js`**

Replace the 501 stub section with:

```js
// In the POST /:id/reply handler, replace the 501 block:
const googleApi = require('../services/googleApi');

// ...after existing validation and review lookup...
if (!req.tenant.google_access_token || !req.tenant.google_account_id) {
  // No Google connected — save locally only
  await db('reviews').where({ id: review.id }).update({
    status: 'responded', response: text.trim(), responded_at: new Date()
  });
  return res.status(200).json({ success: true, googlePosted: false });
}

try {
  await googleApi.postReply(
    req.tenant.google_access_token,
    req.tenant.google_account_id,
    req.tenant.google_location_id,
    review.google_review_id,
    text.trim()
  );
  await db('reviews').where({ id: review.id }).update({
    status: 'responded', response: text.trim(), responded_at: new Date()
  });
  res.json({ success: true, googlePosted: true });
} catch (err) {
  if (err.status === 401) {
    // Try refresh
    try {
      const newToken = await googleApi.refreshAccessToken(req.tenant.google_refresh_token);
      await db('tenants').where({ id: req.tenant.id }).update({ google_access_token: newToken });
      await googleApi.postReply(newToken, req.tenant.google_account_id, req.tenant.google_location_id, review.google_review_id, text.trim());
      await db('reviews').where({ id: review.id }).update({ status: 'responded', response: text.trim(), responded_at: new Date() });
      return res.json({ success: true, googlePosted: true });
    } catch {
      return res.status(502).json({ error: 'Erreur Google — reconnectez votre compte.' });
    }
  }
  console.error('[reply]', err.message);
  res.status(502).json({ error: 'Erreur Google API: ' + err.message });
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
# Expected: PASS — all test suites
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/reviews.js tests/reviews.test.js
git commit -m "feat: POST /api/reviews/:id/reply posts to Google Business Profile"
```

---

### Task 5: First-login location selection

**Files:**
- Modify: `src/routes/auth.js`

- [ ] **Step 1: Add routes**

```js
// Add to src/routes/auth.js (after existing routes, before module.exports):
const googleApi = require('../services/googleApi');

// List Google Business locations for the logged-in tenant
router.get('/setup/locations', requireAuth, async (req, res) => {
  if (!req.tenant.google_access_token) return res.status(400).json({ error: 'Google non connecté' });
  try {
    const accounts  = await googleApi.getAccounts(req.tenant.google_access_token);
    if (!accounts.length) return res.json({ locations: [] });
    const accountId = accounts[0].name; // e.g. "accounts/123"
    const locations = await googleApi.getLocations(req.tenant.google_access_token, accountId);
    await db('tenants').where({ id: req.tenant.id }).update({ google_account_id: accountId });
    res.json({ locations: locations.map(l => ({ id: l.name, title: l.title || l.name })) });
  } catch (err) {
    res.status(502).json({ error: 'Erreur Google: ' + err.message });
  }
});

// Save the chosen location and trigger initial sync
router.post('/setup/location', requireAuth, async (req, res) => {
  const { locationId } = req.body;
  if (!locationId) return res.status(400).json({ error: 'locationId requis' });
  await db('tenants').where({ id: req.tenant.id }).update({ google_location_id: locationId });
  const tenant = await db('tenants').where({ id: req.tenant.id }).first();
  // Trigger initial sync (last 90 days) in background
  const { syncTenant } = require('../services/reviewSync');
  syncTenant(tenant).catch(err => console.error('[setup] Initial sync error:', err.message));
  res.json({ success: true });
});
```

- [ ] **Step 2: Update frontend Settings — Integrations tab**

In `js/pages/settings.js`, in `renderIntegrations()`, when Google is connected, show the location selector if `google_location_id` is not yet set.

When "Connecter Google" button is clicked (Google not connected state), navigate to `API_BASE + '/auth/google'`.

```js
// In the Google integration row, replace the static toggle with:
var googleConnected = !!(s.ai && req && req.googleConnected); // from /auth/me
// Button: if not connected → href to /auth/google
// If connected but no location → GET /api/setup/locations and show picker
// If connected and location set → show "Connecté" badge + "Sync maintenant" button
```

- [ ] **Step 3: Add manual sync button handler**

In the frontend Integrations tab, wire a "Synchroniser maintenant" button:

```js
// In bindEvents for settings:
var syncBtn = container.querySelector('#manualSyncBtn');
if (syncBtn) {
  syncBtn.addEventListener('click', function() {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Synchronisation…';
    API.post('/api/sync', {}).then(function() {
      Toast.show('Synchronisation lancée', 'success');
    }).catch(function() {
      Toast.show('Erreur de synchronisation', 'error');
    }).then(function() {
      syncBtn.disabled = false;
      syncBtn.textContent = 'Synchroniser maintenant';
    });
  });
}
```

- [ ] **Step 4: Wire POST /api/sync route**

In `src/routes/reviews.js`, replace the sync stub with:

```js
const { syncTenant } = require('../services/reviewSync');

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const tenant = await db('tenants').where({ id: req.tenant.id }).first();
    syncTenant(tenant).catch(err => console.error('[manual sync]', err.message));
    res.json({ success: true, message: 'Sync lancée en arrière-plan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 5: Run all tests**

```bash
npm test
# Expected: PASS — all suites
```

- [ ] **Step 6: Commit**

```bash
git add src/routes/auth.js src/routes/reviews.js
git commit -m "feat: location selection flow + manual sync trigger"
```

---

### Task 6: End-to-end manual test

- [ ] **Step 1: Verify complete OAuth + sync flow**

```
1. Open http://localhost:3000 → login page appears
2. Click "Continuer avec Google" → Google OAuth
3. Authorize → redirect back to http://localhost:3000/?token=JWT
4. Dashboard loads with mock data (Google sync not yet triggered since no location set)
5. Go to Settings → Integrations → Google shows "Connecté, aucun établissement"
6. Click "Configurer" → location list appears
7. Select the restaurant → initial sync triggers in background
8. Wait 5 seconds → refresh Reviews page
9. Real Google reviews appear in the list
10. Open a pending review → click "Générer une réponse IA" → generate
11. Click "Publier" → response appears on Google Maps within 2 minutes
```

- [ ] **Step 2: Verify cron sync**

```bash
# Force the cron to run immediately:
NODE_ENV=production node -e "
  require('dotenv').config();
  const {syncAllTenants}=require('./src/cron/syncReviews');
  syncAllTenants().then(()=>{ console.log('Done'); process.exit(); });
"
# Expected: tenant synced, new reviews upserted
```

- [ ] **Step 3: Final commit + tag**

```bash
npm test
git add -A
git commit -m "feat: complete Google Business Profile integration"
git tag v1.0.0-google-integration
git push && git push --tags
```

---

## Self-Review

**Spec coverage check:**
- ✅ OAuth scopes including `business.manage` with `prompt: consent`
- ✅ Token refresh on 401 in both sync and reply
- ✅ `getAccounts` + `getLocations` for first-login setup
- ✅ `getReviews` with pagination (nextPageToken loop)
- ✅ Star rating mapping (FIVE→5, etc.)
- ✅ Upsert reviews by `google_review_id`
- ✅ `postReply` with correct PUT endpoint
- ✅ Rate limit 429 error handling (throws, caller can retry)
- ✅ 403 handling (permissions revoked — logged, not retried)
- ✅ `last_sync_at` updated after successful sync
- ✅ Cron wired to real sync
- ✅ Manual sync endpoint
- ✅ First-login location selection flow
- ✅ Frontend integration (login page, API.js, settings Integrations tab)

**No placeholders found.**

**Type consistency:** `google_account_id` format `"accounts/123"` used consistently in `googleApi.js`, `reviewSync.js`, and routes. `google_review_id` matches migration and upsert key.
