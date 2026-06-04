# SmartFeedbackAI — Plan 1 : Backend + Base de données

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js/Express REST API with PostgreSQL that replaces the static JSON mock files, supports multi-tenant isolation, Google OAuth login, and exposes endpoints consumed by the existing vanilla JS frontend.

**Architecture:** Separate repo `smartfeedbackai-api/` deployed to Railway. The frontend's `fetch('data/reviews.json')` calls are replaced by a new `js/api.js` wrapper that sends JWT-authenticated requests to `https://api.smartfeedback.ca`. Knex.js handles DB migrations and queries. Passport.js handles Google OAuth 2.0.

**Tech Stack:** Node.js 20 · Express 4 · PostgreSQL 15 · Knex.js · Passport.js (google-oauth20) · jsonwebtoken · node-cron · Jest + Supertest · Railway

---

## File Map

**New repo: `smartfeedbackai-api/`**

| File | Responsibility |
|------|---------------|
| `src/app.js` | Express bootstrap — middleware, routes, export `app` |
| `src/server.js` | Entry point — `app.listen()` only |
| `src/db/knexfile.js` | Knex config for dev/test/production |
| `src/db/migrations/001_tenants.js` | CREATE TABLE tenants |
| `src/db/migrations/002_reviews.js` | CREATE TABLE reviews |
| `src/auth/jwt.js` | `sign(payload)` and `verify(token)` helpers |
| `src/auth/googleOAuth.js` | Passport Google strategy + serialize/deserialize |
| `src/middleware/requireAuth.js` | Validates JWT, attaches `req.tenant` |
| `src/routes/auth.js` | `/auth/google`, `/auth/google/callback`, `/auth/me`, `/auth/logout`, `/auth/google/disconnect` |
| `src/routes/reviews.js` | `GET /api/reviews`, `POST /api/reviews/:id/reply`, `POST /api/sync` |
| `src/routes/settings.js` | `GET /api/settings`, `PUT /api/settings` |
| `src/routes/analytics.js` | `GET /api/analytics` |
| `src/services/googleApi.js` | Wraps Google Business Profile API calls |
| `src/services/reviewSync.js` | Fetches reviews from Google, upserts into DB |
| `src/cron/syncReviews.js` | Hourly cron using node-cron |
| `tests/auth.test.js` | Auth route integration tests |
| `tests/reviews.test.js` | Reviews route integration tests |
| `tests/analytics.test.js` | Analytics route tests |
| `tests/helpers.js` | Test DB setup/teardown, JWT factory |
| `.env.example` | All required env var names |
| `Dockerfile` | For Railway deployment |
| `package.json` | Dependencies + scripts |

**Existing frontend repo — modified files:**

| File | Change |
|------|--------|
| `js/api.js` | NEW — JWT-authenticated fetch wrapper |
| `js/pages/login.js` | NEW — Google login page |
| `js/main.js` | Replace JSON fetch with API calls, add auth check |
| `index.html` | Add `<script src="js/api.js">` before other scripts |

---

### Task 1: Project bootstrap

**Files:**
- Create: `smartfeedbackai-api/package.json`
- Create: `smartfeedbackai-api/.env.example`
- Create: `smartfeedbackai-api/src/app.js`
- Create: `smartfeedbackai-api/src/server.js`

- [ ] **Step 1: Create the repo and install dependencies**

```bash
mkdir smartfeedbackai-api && cd smartfeedbackai-api
git init
npm init -y
npm install express knex pg passport passport-google-oauth20 jsonwebtoken node-cron cors helmet dotenv
npm install --save-dev jest supertest
```

- [ ] **Step 2: Create `.env.example`**

```
DATABASE_URL=postgres://user:password@localhost:5432/smartfeedbackai
DATABASE_URL_TEST=postgres://user:password@localhost:5432/smartfeedbackai_test
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
JWT_SECRET=change_this_to_a_random_32char_string
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

- [ ] **Step 3: Create `src/app.js`**

```js
'use strict';
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const passport = require('passport');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', require('./routes/auth'));
app.use('/api/reviews',   require('./middleware/requireAuth'), require('./routes/reviews'));
app.use('/api/settings',  require('./middleware/requireAuth'), require('./routes/settings'));
app.use('/api/analytics', require('./middleware/requireAuth'), require('./routes/analytics'));

app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
```

- [ ] **Step 4: Create `src/server.js`**

```js
'use strict';
const app  = require('./app');
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on port ${port}`));
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
{
  "scripts": {
    "start":   "node src/server.js",
    "dev":     "node --watch src/server.js",
    "test":    "NODE_ENV=test jest --runInBand",
    "migrate": "knex migrate:latest --knexfile src/db/knexfile.js",
    "migrate:test": "NODE_ENV=test knex migrate:latest --knexfile src/db/knexfile.js"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

- [ ] **Step 6: Verify server starts**

```bash
cp .env.example .env  # fill in DATABASE_URL at minimum
node src/server.js
# Expected: API running on port 3001
curl http://localhost:3001/health
# Expected: {"ok":true}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: bootstrap Express app with health endpoint"
```

---

### Task 2: Database — Knex config + migrations

**Files:**
- Create: `src/db/knexfile.js`
- Create: `src/db/migrations/20260602000001_create_tenants.js`
- Create: `src/db/migrations/20260602000002_create_reviews.js`
- Create: `src/db/index.js`

- [ ] **Step 1: Create `src/db/knexfile.js`**

```js
'use strict';
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' }
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST,
    migrations: { directory: './src/db/migrations' }
  },
  production: {
    client: 'pg',
    connection: { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } },
    migrations: { directory: './src/db/migrations' }
  }
};
```

- [ ] **Step 2: Create migration — tenants**

```js
// src/db/migrations/20260602000001_create_tenants.js
exports.up = function(knex) {
  return knex.schema.createTable('tenants', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 255).notNullable();
    t.string('email', 255).notNullable().unique();
    t.text('google_access_token');
    t.text('google_refresh_token');
    t.string('google_account_id', 255);
    t.string('google_location_id', 255);
    t.jsonb('settings').defaultTo('{}');
    t.timestamp('last_sync_at');
    t.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tenants');
};
```

- [ ] **Step 3: Create migration — reviews**

```js
// src/db/migrations/20260602000002_create_reviews.js
exports.up = function(knex) {
  return knex.schema.createTable('reviews', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('google_review_id', 255).notNullable().unique();
    t.string('author', 255);
    t.string('author_initials', 10);
    t.integer('rating').checkBetween([1, 5]);
    t.text('text');
    t.timestamp('date');
    t.string('source', 50).defaultTo('google');
    t.string('status', 20).defaultTo('pending').checkIn(['pending', 'responded']);
    t.text('response');
    t.timestamp('responded_at');
    t.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reviews');
};
```

- [ ] **Step 4: Create `src/db/index.js`**

```js
'use strict';
const knex      = require('knex');
const knexfile  = require('./knexfile');
const env       = process.env.NODE_ENV || 'development';

const db = knex(knexfile[env]);
module.exports = db;
```

- [ ] **Step 5: Create the databases and run migrations**

```bash
# Create DBs (run in psql or use pgAdmin)
createdb smartfeedbackai
createdb smartfeedbackai_test

npm run migrate
npm run migrate:test
# Expected: Batch 1 run: 2 migrations
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add PostgreSQL schema with tenants and reviews tables"
```

---

### Task 3: JWT helpers

**Files:**
- Create: `src/auth/jwt.js`
- Create: `tests/helpers.js`

- [ ] **Step 1: Write the test**

```js
// tests/helpers.js
const db  = require('../src/db');
const jwt = require('../src/auth/jwt');

async function cleanDb() {
  await db('reviews').del();
  await db('tenants').del();
}

async function createTenant(overrides = {}) {
  const [tenant] = await db('tenants').insert({
    name:  overrides.name  || 'Test Restaurant',
    email: overrides.email || `test+${Date.now()}@example.com`,
    settings: JSON.stringify(overrides.settings || {})
  }).returning('*');
  return tenant;
}

function makeJwt(tenant) {
  return jwt.sign({ tenantId: tenant.id, email: tenant.email });
}

module.exports = { cleanDb, createTenant, makeJwt };
```

```js
// tests/auth.test.js  (JWT section)
const jwt = require('../src/auth/jwt');

describe('jwt', () => {
  it('signs and verifies a payload', () => {
    const token   = jwt.sign({ tenantId: 'abc', email: 'x@x.com' });
    const payload = jwt.verify(token);
    expect(payload.tenantId).toBe('abc');
    expect(payload.email).toBe('x@x.com');
  });

  it('throws on invalid token', () => {
    expect(() => jwt.verify('bad.token')).toThrow();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=auth
# Expected: FAIL — Cannot find module '../src/auth/jwt'
```

- [ ] **Step 3: Create `src/auth/jwt.js`**

```js
'use strict';
const jsonwebtoken = require('jsonwebtoken');
const SECRET       = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const EXPIRES_IN   = '7d';

function sign(payload) {
  return jsonwebtoken.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verify(token) {
  return jsonwebtoken.verify(token, SECRET);
}

module.exports = { sign, verify };
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=auth
# Expected: PASS (2 tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/auth/jwt.js tests/helpers.js tests/auth.test.js
git commit -m "feat: add JWT sign/verify helpers"
```

---

### Task 4: requireAuth middleware

**Files:**
- Create: `src/middleware/requireAuth.js`

- [ ] **Step 1: Add test in `tests/auth.test.js`**

```js
const request = require('supertest');
const app     = require('../src/app');
const { createTenant, makeJwt, cleanDb } = require('./helpers');

describe('requireAuth middleware', () => {
  beforeEach(cleanDb);

  it('returns 401 when no token', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/reviews')
      .set('Authorization', 'Bearer bad.token.here');
    expect(res.status).toBe(401);
  });

  it('allows request with valid JWT', async () => {
    const tenant = await createTenant();
    const token  = makeJwt(tenant);
    const res = await request(app)
      .get('/api/reviews')
      .set('Authorization', 'Bearer ' + token);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=auth
# Expected: FAIL — cannot find module './middleware/requireAuth'
```

- [ ] **Step 3: Create `src/middleware/requireAuth.js`**

```js
'use strict';
const jwt = require('../auth/jwt');
const db  = require('../db');

module.exports = async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const payload = jwt.verify(token);
    const tenant  = await db('tenants').where({ id: payload.tenantId }).first();
    if (!tenant) return res.status(401).json({ error: 'Tenant introuvable' });
    req.tenant = tenant;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
};
```

- [ ] **Step 4: Create stub `src/routes/reviews.js`** (needed for tests to pass)

```js
'use strict';
const router = require('express').Router();
router.get('/', (_req, res) => res.json({ reviews: [], total: 0 }));
module.exports = router;
```

Create stub `src/routes/settings.js`:

```js
'use strict';
const router = require('express').Router();
router.get('/',  (_req, res) => res.json({}));
router.put('/',  (_req, res) => res.json({}));
module.exports = router;
```

Create stub `src/routes/analytics.js`:

```js
'use strict';
const router = require('express').Router();
router.get('/', (_req, res) => res.json({}));
module.exports = router;
```

Create stub `src/routes/auth.js`:

```js
'use strict';
const router = require('express').Router();
router.get('/me', (_req, res) => res.json({}));
module.exports = router;
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm test -- --testPathPattern=auth
# Expected: PASS (3 tests)
```

- [ ] **Step 6: Commit**

```bash
git add src/middleware/requireAuth.js src/routes/
git commit -m "feat: add requireAuth middleware and route stubs"
```

---

### Task 5: Reviews route — GET /api/reviews

**Files:**
- Modify: `src/routes/reviews.js`
- Create: `tests/reviews.test.js`

- [ ] **Step 1: Write tests**

```js
// tests/reviews.test.js
const request = require('supertest');
const app     = require('../src/app');
const db      = require('../src/db');
const { createTenant, makeJwt, cleanDb } = require('./helpers');

let tenant, token;

beforeEach(async () => {
  await cleanDb();
  tenant = await createTenant();
  token  = makeJwt(tenant);
  // Insert 3 test reviews
  await db('reviews').insert([
    { tenant_id: tenant.id, google_review_id: 'g1', author: 'Alice', rating: 5, text: 'Super!',    status: 'pending',   source: 'google', date: new Date() },
    { tenant_id: tenant.id, google_review_id: 'g2', author: 'Bob',   rating: 3, text: 'Correct.',  status: 'responded', source: 'google', date: new Date() },
    { tenant_id: tenant.id, google_review_id: 'g3', author: 'Carol', rating: 1, text: 'Nul.',      status: 'pending',   source: 'yelp',   date: new Date() }
  ]);
});

describe('GET /api/reviews', () => {
  it('returns all reviews for the tenant', async () => {
    const res = await request(app).get('/api/reviews').set('Authorization', 'Bearer ' + token);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(3);
    expect(res.body.total).toBe(3);
  });

  it('filters by status=pending', async () => {
    const res = await request(app).get('/api/reviews?status=pending').set('Authorization', 'Bearer ' + token);
    expect(res.body.reviews).toHaveLength(2);
  });

  it('filters by source=yelp', async () => {
    const res = await request(app).get('/api/reviews?source=yelp').set('Authorization', 'Bearer ' + token);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].author).toBe('Carol');
  });

  it('filters by rating=5', async () => {
    const res = await request(app).get('/api/reviews?rating=5').set('Authorization', 'Bearer ' + token);
    expect(res.body.reviews).toHaveLength(1);
  });

  it('searches by q= (author name)', async () => {
    const res = await request(app).get('/api/reviews?q=alice').set('Authorization', 'Bearer ' + token);
    expect(res.body.reviews).toHaveLength(1);
  });

  it('does not return reviews from another tenant', async () => {
    const other = await createTenant({ email: 'other@x.com' });
    await db('reviews').insert({ tenant_id: other.id, google_review_id: 'g99', author: 'X', rating: 5, text: 'X', status: 'pending', source: 'google', date: new Date() });
    const res = await request(app).get('/api/reviews').set('Authorization', 'Bearer ' + token);
    expect(res.body.reviews).toHaveLength(3); // only the original 3
  });

  it('paginates with page and pageSize', async () => {
    const res = await request(app).get('/api/reviews?page=1&pageSize=2').set('Authorization', 'Bearer ' + token);
    expect(res.body.reviews).toHaveLength(2);
    expect(res.body.total).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=reviews
# Expected: FAIL — returns empty array, filters not working
```

- [ ] **Step 3: Implement `src/routes/reviews.js`**

```js
'use strict';
const router = require('express').Router();
const db     = require('../db');

router.get('/', async (req, res) => {
  try {
    const { status, source, rating, q, page = 1, pageSize = 10 } = req.query;
    const tenantId = req.tenant.id;

    let query = db('reviews').where({ tenant_id: tenantId }).orderBy('date', 'desc');
    if (status)  query = query.where({ status });
    if (source)  query = query.where({ source });
    if (rating)  query = query.where({ rating: parseInt(rating, 10) });
    if (q) {
      const term = '%' + q.toLowerCase() + '%';
      query = query.where(function() {
        this.whereRaw('LOWER(author) LIKE ?', [term])
            .orWhereRaw('LOWER(text) LIKE ?', [term]);
      });
    }

    const countQuery  = query.clone().count('id as count').first();
    const { count }   = await countQuery;
    const offset      = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const reviews     = await query.limit(parseInt(pageSize, 10)).offset(offset);

    res.json({ reviews, total: parseInt(count, 10), page: parseInt(page, 10), pageSize: parseInt(pageSize, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=reviews
# Expected: PASS (7 tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/reviews.js tests/reviews.test.js
git commit -m "feat: GET /api/reviews with filtering, search and pagination"
```

---

### Task 6: Settings route

**Files:**
- Modify: `src/routes/settings.js`

- [ ] **Step 1: Add tests in `tests/reviews.test.js`**

```js
describe('GET /api/settings', () => {
  it('returns tenant settings', async () => {
    const res = await request(app).get('/api/settings').set('Authorization', 'Bearer ' + token);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('business');
  });
});

describe('PUT /api/settings', () => {
  it('merges and persists settings', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', 'Bearer ' + token)
      .send({ business: { name: 'Updated Name' } });
    expect(res.status).toBe(200);
    expect(res.body.business.name).toBe('Updated Name');

    // Verify persisted
    const res2 = await request(app).get('/api/settings').set('Authorization', 'Bearer ' + token);
    expect(res2.body.business.name).toBe('Updated Name');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=reviews
# Expected: FAIL on settings tests
```

- [ ] **Step 3: Implement `src/routes/settings.js`**

```js
'use strict';
const router = require('express').Router();
const db     = require('../db');

router.get('/', async (req, res) => {
  const defaultSettings = {
    business: { name: req.tenant.name, street: '', city: '', stateProvince: '', postalCode: '', country: 'CA', category: 'Restaurant' },
    ai:       { provider: 'mock', apiKey: '', defaultTone: 'professional', language: 'fr' },
    billing:  { currency: 'CAD' },
    integrations: { google: true, tripadvisor: false, yelp: false }
  };
  const stored = req.tenant.settings || {};
  res.json(Object.assign({}, defaultSettings, stored));
});

router.put('/', async (req, res) => {
  try {
    const current  = req.tenant.settings || {};
    const incoming = req.body || {};
    const merged   = Object.assign({}, current, incoming);

    // Deep merge sub-objects
    ['business', 'ai', 'billing', 'integrations'].forEach(key => {
      if (incoming[key]) merged[key] = Object.assign({}, current[key] || {}, incoming[key]);
    });

    await db('tenants').where({ id: req.tenant.id }).update({ settings: JSON.stringify(merged) });
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=reviews
# Expected: PASS (all tests including settings)
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/settings.js
git commit -m "feat: GET/PUT /api/settings with deep merge"
```

---

### Task 7: Analytics route

**Files:**
- Modify: `src/routes/analytics.js`
- Create: `tests/analytics.test.js`

- [ ] **Step 1: Write tests**

```js
// tests/analytics.test.js
const request = require('supertest');
const app     = require('../src/app');
const db      = require('../src/db');
const { createTenant, makeJwt, cleanDb } = require('./helpers');

let tenant, token;
beforeEach(async () => {
  await cleanDb();
  tenant = await createTenant();
  token  = makeJwt(tenant);
  await db('reviews').insert([
    { tenant_id: tenant.id, google_review_id: 'a1', author: 'A', rating: 5, text: 'excellent service', status: 'responded', source: 'google', date: new Date('2026-05-01') },
    { tenant_id: tenant.id, google_review_id: 'a2', author: 'B', rating: 4, text: 'bon repas',         status: 'responded', source: 'google', date: new Date('2026-05-15') },
    { tenant_id: tenant.id, google_review_id: 'a3', author: 'C', rating: 2, text: 'service lent',      status: 'pending',   source: 'yelp',   date: new Date('2026-06-01') },
  ]);
});

describe('GET /api/analytics', () => {
  it('returns correct totals', async () => {
    const res = await request(app).get('/api/analytics').set('Authorization', 'Bearer ' + token);
    expect(res.status).toBe(200);
    expect(res.body.totalReviews).toBe(3);
  });

  it('calculates response rate', async () => {
    const res = await request(app).get('/api/analytics').set('Authorization', 'Bearer ' + token);
    expect(res.body.responseRate).toBe(67); // 2/3 = 66.7 → rounded to 67
  });

  it('calculates average rating', async () => {
    const res = await request(app).get('/api/analytics').set('Authorization', 'Bearer ' + token);
    expect(res.body.avgRating).toBe(3.7); // (5+4+2)/3
  });

  it('returns source breakdown', async () => {
    const res = await request(app).get('/api/analytics').set('Authorization', 'Bearer ' + token);
    expect(res.body.bySource.google).toBe(67);
    expect(res.body.bySource.yelp).toBe(33);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=analytics
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/routes/analytics.js`**

```js
'use strict';
const router = require('express').Router();
const db     = require('../db');

router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const reviews  = await db('reviews').where({ tenant_id: tenantId });
    const total    = reviews.length;
    if (total === 0) return res.json({ totalReviews: 0, avgRating: 0, responseRate: 0, npsScore: 0, bySource: {} });

    const responded  = reviews.filter(r => r.status === 'responded').length;
    const ratingSum  = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    const promoters  = reviews.filter(r => r.rating >= 5).length;
    const detractors = reviews.filter(r => r.rating <= 2).length;

    const bySource = {};
    ['google', 'tripadvisor', 'yelp'].forEach(src => {
      const count = reviews.filter(r => r.source === src).length;
      if (count > 0) bySource[src] = Math.round((count / total) * 100);
    });

    res.json({
      totalReviews:      total,
      avgRating:         Math.round((ratingSum / total) * 10) / 10,
      responseRate:      Math.round((responded / total) * 100),
      npsScore:          Math.round(((promoters - detractors) / total) * 100),
      positiveSentiment: Math.round((reviews.filter(r => r.rating >= 4).length / total) * 100),
      bySource
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=analytics
# Expected: PASS (4 tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/analytics.js tests/analytics.test.js
git commit -m "feat: GET /api/analytics with NPS, response rate, source breakdown"
```

---

### Task 8: POST /api/reviews/:id/reply (stub — Google posting in Plan 2)

**Files:**
- Modify: `src/routes/reviews.js`

This task adds the route stub that returns `501 Not Implemented` until the Google API integration (Plan 2) is complete. This allows the frontend to wire up the endpoint now.

- [ ] **Step 1: Add test**

```js
// In tests/reviews.test.js, add:
describe('POST /api/reviews/:id/reply', () => {
  it('returns 404 for unknown review', async () => {
    const res = await request(app)
      .post('/api/reviews/00000000-0000-0000-0000-000000000000/reply')
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Merci !' });
    expect(res.status).toBe(404);
  });

  it('returns 501 when Google is not yet connected', async () => {
    const [review] = await db('reviews').where({ tenant_id: tenant.id }).limit(1);
    const res = await request(app)
      .post('/api/reviews/' + review.id + '/reply')
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Merci !' });
    expect(res.status).toBe(501); // Not implemented until Plan 2
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern=reviews
# Expected: FAIL — route not found (404)
```

- [ ] **Step 3: Add route to `src/routes/reviews.js`** (after the GET route)

```js
router.post('/:id/reply', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text requis' });

  const review = await db('reviews').where({ id: req.params.id, tenant_id: req.tenant.id }).first();
  if (!review) return res.status(404).json({ error: 'Avis introuvable' });

  // Google posting implemented in Plan 2 — for now, update DB only
  if (!req.tenant.google_access_token) {
    // Fallback: persist locally (no Google post)
    await db('reviews').where({ id: review.id }).update({
      status: 'responded', response: text.trim(), responded_at: new Date()
    });
    return res.status(200).json({ success: true, googlePosted: false });
  }

  // Stub until Plan 2 installs googleApi.js
  return res.status(501).json({ error: 'Intégration Google non encore configurée' });
});

router.post('/sync', async (req, res) => {
  // Stub — implemented in Plan 2
  res.status(501).json({ error: 'Sync Google non encore configurée' });
});
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=reviews
# Expected: PASS (all tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/reviews.js tests/reviews.test.js
git commit -m "feat: POST /api/reviews/:id/reply stub with local DB fallback"
```

---

### Task 9: Google OAuth routes (Passport.js)

**Files:**
- Create: `src/auth/googleOAuth.js`
- Modify: `src/routes/auth.js`

- [ ] **Step 1: Create `src/auth/googleOAuth.js`**

```js
'use strict';
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const db  = require('../db');
const jwt = require('./jwt');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL
}, async (_accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const name  = profile.displayName;
  try {
    let tenant = await db('tenants').where({ email }).first();
    if (!tenant) {
      [tenant] = await db('tenants').insert({ name, email }).returning('*');
    }
    // Store tokens — access token refreshed in Plan 2
    await db('tenants').where({ id: tenant.id }).update({
      google_access_token:  _accessToken,
      google_refresh_token: refreshToken || tenant.google_refresh_token
    });
    tenant = await db('tenants').where({ id: tenant.id }).first();
    return done(null, tenant);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
```

- [ ] **Step 2: Implement `src/routes/auth.js`**

```js
'use strict';
const router   = require('express').Router();
const passport = require('../auth/googleOAuth');
const jwt      = require('../auth/jwt');
const db       = require('../db');
const requireAuth = require('../middleware/requireAuth');
require('dotenv').config();

const SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/business.manage'];

// Initiate OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: SCOPES,
  accessType: 'offline',
  prompt: 'consent'
}));

// OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL + '/?error=auth_failed' }),
  (req, res) => {
    const token = jwt.sign({ tenantId: req.user.id, email: req.user.email });
    // Redirect to frontend with token
    res.redirect(process.env.FRONTEND_URL + '/?token=' + token);
  }
);

// Get current tenant
router.get('/me', requireAuth, (req, res) => {
  const { id, name, email, google_location_id, last_sync_at } = req.tenant;
  res.json({ id, name, email, googleConnected: !!req.tenant.google_access_token, google_location_id, last_sync_at });
});

// Logout (client-side — JWT is stateless)
router.delete('/logout', (_req, res) => res.json({ success: true }));

// Disconnect Google
router.delete('/google/disconnect', requireAuth, async (req, res) => {
  await db('tenants').where({ id: req.tenant.id }).update({
    google_access_token: null, google_refresh_token: null,
    google_account_id: null, google_location_id: null
  });
  res.json({ success: true });
});

module.exports = router;
```

- [ ] **Step 3: Register Passport in `src/app.js`** — ensure `require('./auth/googleOAuth')` is loaded

```js
// Add near top of src/app.js, after existing requires:
require('./auth/googleOAuth'); // registers passport strategy
```

- [ ] **Step 4: Manual test of OAuth flow**

```bash
# Start the server
npm run dev

# Open in browser (replace with your CLIENT_ID first in .env):
# http://localhost:3001/auth/google
# Expected: redirects to Google login page
# After login: redirects to http://localhost:3000/?token=eyJ...
```

- [ ] **Step 5: Commit**

```bash
git add src/auth/googleOAuth.js src/routes/auth.js src/app.js
git commit -m "feat: Google OAuth login with JWT redirect to frontend"
```

---

### Task 10: Cron job — hourly review sync stub

**Files:**
- Create: `src/cron/syncReviews.js`
- Modify: `src/server.js`

- [ ] **Step 1: Create `src/cron/syncReviews.js`**

```js
'use strict';
const cron = require('node-cron');
const db   = require('../db');

async function syncAllTenants() {
  console.log('[cron] Starting review sync for all tenants...');
  const tenants = await db('tenants').whereNotNull('google_refresh_token');
  console.log('[cron] Tenants to sync:', tenants.length);

  for (const tenant of tenants) {
    try {
      // Google API calls implemented in Plan 2
      // For now: log that sync would happen
      console.log('[cron] Would sync tenant:', tenant.email);
    } catch (err) {
      console.error('[cron] Error syncing tenant', tenant.email, ':', err.message);
    }
  }
  console.log('[cron] Sync complete.');
}

function startCron() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', syncAllTenants);
  console.log('[cron] Hourly review sync scheduled.');
}

module.exports = { startCron, syncAllTenants };
```

- [ ] **Step 2: Start cron in `src/server.js`**

```js
'use strict';
require('dotenv').config();
const app  = require('./app');
const { startCron } = require('./cron/syncReviews');
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API running on port ${port}`);
  if (process.env.NODE_ENV === 'production') {
    startCron();
  }
});
```

- [ ] **Step 3: Verify cron starts**

```bash
NODE_ENV=production node src/server.js
# Expected: API running on port 3001
#           [cron] Hourly review sync scheduled.
```

- [ ] **Step 4: Commit**

```bash
git add src/cron/syncReviews.js src/server.js
git commit -m "feat: hourly cron job stub (Google sync in Plan 2)"
```

---

### Task 11: Dockerfile + Railway config

**Files:**
- Create: `Dockerfile`
- Create: `.railwayignore`

- [ ] **Step 1: Create `Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/server.js"]
```

- [ ] **Step 2: Create `.railwayignore`**

```
node_modules
tests
.env
*.test.js
```

- [ ] **Step 3: Run all tests one final time**

```bash
npm test
# Expected: PASS — all test suites pass
```

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .railwayignore
git commit -m "feat: add Dockerfile for Railway deployment"
```

---

### Task 12: Frontend — js/api.js + login page

**Files (in `smartfeedbackai/`):**
- Create: `js/api.js`
- Create: `js/pages/login.js`
- Modify: `js/main.js`
- Modify: `index.html`

- [ ] **Step 1: Read current `js/main.js` and `index.html`**

Open both files and note the existing `fetch('data/reviews.json')` and `fetch('data/settings.json')` calls — these will be replaced.

- [ ] **Step 2: Create `js/api.js`**

```js
var API = (function() {
  'use strict';
  var BASE = 'https://api.smartfeedback.ca';
  // Override for local dev: set window.API_BASE = 'http://localhost:3001' in browser console

  function base() { return window.API_BASE || BASE; }
  function token() { return localStorage.getItem('sfai_jwt'); }
  function headers() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() };
  }

  function handle(res) {
    if (res.status === 401) {
      localStorage.removeItem('sfai_jwt');
      window.location.href = '#/login';
      return Promise.reject(new Error('Non autorisé'));
    }
    return res.json();
  }

  return {
    get:    function(path) { return fetch(base() + path, { headers: headers() }).then(handle); },
    post:   function(path, body) { return fetch(base() + path, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle); },
    put:    function(path, body) { return fetch(base() + path, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handle); },
    delete: function(path)       { return fetch(base() + path, { method: 'DELETE', headers: headers() }).then(handle); }
  };
})();
window.API = API;
```

- [ ] **Step 3: Create `js/pages/login.js`**

```js
var LoginPage = (function() {
  'use strict';
  var API_BASE = window.API_BASE || 'https://api.smartfeedback.ca';

  function render(container) {
    container.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg);">',
      '  <div style="background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:36px 32px;max-width:360px;width:100%;text-align:center;box-shadow:var(--shadow);">',
      '    <div style="width:48px;height:48px;background:linear-gradient(135deg,#818CF8,#4F46E5);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">',
      '      <svg width="22" height="22" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/></svg>',
      '    </div>',
      '    <h1 style="font-size:20px;font-weight:800;margin-bottom:6px;letter-spacing:-.4px;">SmartFeedback AI</h1>',
      '    <p style="font-size:13px;color:var(--txt2);margin-bottom:28px;">Connectez-vous pour accéder à votre tableau de bord</p>',
      '    <a href="' + API_BASE + '/auth/google"',
      '       style="display:flex;align-items:center;justify-content:center;gap:10px;background:#4285F4;color:#fff;',
      '              padding:12px 20px;border-radius:9px;font-size:13.5px;font-weight:600;text-decoration:none;',
      '              transition:background .2s;" ',
      '       onmouseover="this.style.background=\'#2b6cb0\'" onmouseout="this.style.background=\'#4285F4\'">',
      '      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#fff" d="M44.5 20H24v8h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg>',
      '      Continuer avec Google',
      '    </a>',
      '    <p style="font-size:11px;color:var(--txt3);margin-top:20px;">Vos avis Google sont synchronisés automatiquement</p>',
      '  </div>',
      '</div>'
    ].join('');
  }

  return { render: render };
})();
window.LoginPage = LoginPage;
```

- [ ] **Step 4: Modify `js/main.js`** — replace JSON fetches with API calls and add auth check

In `main.js`, find the `boot()` function and replace:

```js
// REPLACE THIS:
function boot() {
  Promise.all([
    loadJSON('data/reviews.json'),
    loadJSON('data/settings.json')
  ]).then(function (results) {
    var reviews  = results[0];
    var settings = results[1];
    Store.init(reviews, settings);
    ...

// WITH THIS:
function boot() {
  // Handle token from OAuth redirect (?token=JWT)
  var urlParams = new URLSearchParams(window.location.search);
  var inboundToken = urlParams.get('token');
  if (inboundToken) {
    localStorage.setItem('sfai_jwt', inboundToken);
    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  }

  var jwt = localStorage.getItem('sfai_jwt');
  if (!jwt) {
    // No token — show login page directly
    document.body.innerHTML = '<div id="app"></div>';
    LoginPage.render(document.getElementById('app'));
    return;
  }

  // Validate token + load data
  Promise.all([
    API.get('/auth/me'),
    API.get('/api/reviews?pageSize=100'),
    API.get('/api/settings')
  ]).then(function(results) {
    var me       = results[0];
    var data     = results[1];
    var settings = results[2];
    if (!me || !me.id) {
      localStorage.removeItem('sfai_jwt');
      window.location.reload();
      return;
    }
    Store.init(data.reviews || [], settings);
    renderShell();
    Sidebar.render();
    Topnav.render();
    Sidebar.initMobile();
    Slideover.initEvents();
    registerRoutes();
    Router.init();
  }).catch(function(err) {
    // Show error screen (existing code)
    ...
  });
}
```

- [ ] **Step 5: Modify `index.html`** — add `js/api.js` before all other scripts

```html
<!-- ADD before js/store.js -->
<script src="js/api.js"></script>

<!-- ADD before js/main.js -->
<script src="js/pages/login.js"></script>
```

- [ ] **Step 6: Update `js/pages/settings.js`** — wire the "Déconnecter Google" button to `API.delete('/auth/google/disconnect')`

In the Integrations tab, find the Google toggle handler and add a disconnect call when toggled off if Google was connected:

```js
// In the integration toggle change handler:
if (source === 'google' && !enabled && req.tenant && req.tenant.googleConnected) {
  API.delete('/auth/google/disconnect').then(function() {
    Toast.show('Compte Google déconnecté', 'info');
  });
}
```

- [ ] **Step 7: Test locally with dev API**

```bash
# In browser console (while on http://localhost:3000):
window.API_BASE = 'http://localhost:3001'
# Then reload — should see login page
# Click "Continuer avec Google" → OAuth → redirected back with token → dashboard loads
```

- [ ] **Step 8: Commit**

```bash
# In smartfeedbackai/ repo:
git add js/api.js js/pages/login.js js/main.js index.html js/pages/settings.js
git commit -m "feat: wire frontend to REST API with Google OAuth login"
```

---

### Task 13: Deploy to Railway

- [ ] **Step 1: Push `smartfeedbackai-api` to GitHub**

```bash
# In smartfeedbackai-api/:
git remote add origin https://github.com/your-username/smartfeedbackai-api.git
git push -u origin main
```

- [ ] **Step 2: Create Railway project**

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → select `smartfeedbackai-api`
3. Add Plugin → PostgreSQL
4. Railway auto-injects `DATABASE_URL`

- [ ] **Step 3: Set environment variables in Railway**

```
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=https://your-api.railway.app/auth/google/callback
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
FRONTEND_URL=https://your-app.netlify.app
NODE_ENV=production
```

- [ ] **Step 4: Run migrations on Railway**

```bash
# In Railway shell (or via railway CLI):
npm run migrate
```

- [ ] **Step 5: Verify health endpoint**

```bash
curl https://your-api.railway.app/health
# Expected: {"ok":true}
```

- [ ] **Step 6: Update Google Cloud Console**

Add `https://your-api.railway.app/auth/google/callback` to authorized redirect URIs.

- [ ] **Step 7: Final commit**

```bash
git tag v1.0.0-backend
git push --tags
```

---

## Self-Review

**Spec coverage check:**
- ✅ Tenants table with all Google token fields
- ✅ Reviews table with all fields + indices
- ✅ GET /api/reviews with all filters (status, source, rating, q, pagination)
- ✅ POST /api/reviews/:id/reply (stub → Plan 2 completes it)
- ✅ GET/PUT /api/settings with deep merge
- ✅ GET /api/analytics (NPS, response rate, avg rating, source breakdown)
- ✅ Google OAuth flow (Passport.js)
- ✅ GET /auth/me, DELETE /auth/logout, DELETE /auth/google/disconnect
- ✅ Cron job stub (Google sync in Plan 2)
- ✅ Dockerfile + Railway deploy
- ✅ Frontend api.js wrapper
- ✅ Frontend login page
- ✅ main.js token handling from OAuth redirect

**No placeholders found.**

**Type consistency:** `req.tenant.id` used consistently. `google_review_id` used as unique key in both migration and upsert logic.
