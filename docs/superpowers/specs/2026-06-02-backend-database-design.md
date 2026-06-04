# SmartFeedbackAI — Spec 1 : Backend + Base de données

**Date :** 2026-06-02  
**Statut :** Approuvé  
**Stack :** Node.js · Express · PostgreSQL · Railway  
**Prérequis :** Aucun (point de départ)  
**Spec suivante :** `2026-06-02-google-integration-design.md` (dépend de cette spec)

---

## 1. Objectif

Construire l'API REST multi-tenant qui remplacera les fichiers JSON statiques du frontend. Chaque établissement (tenant) a ses propres données isolées. Le frontend vanilla JS s'y connecte via une couche `js/api.js`.

---

## 2. Structure du projet

```
smartfeedbackai-api/
├── src/
│   ├── db/
│   │   ├── knexfile.js          # Config Knex (dev / production)
│   │   └── migrations/
│   │       ├── 001_tenants.js
│   │       └── 002_reviews.js
│   ├── auth/
│   │   ├── googleOAuth.js       # Passport.js Google Strategy
│   │   └── jwt.js               # Sign / verify JWT
│   ├── middleware/
│   │   └── requireAuth.js       # Vérifie JWT, attache req.tenant
│   ├── routes/
│   │   ├── auth.js              # /auth/*
│   │   ├── reviews.js           # /api/reviews
│   │   ├── settings.js          # /api/settings
│   │   └── analytics.js         # /api/analytics
│   ├── services/
│   │   ├── googleApi.js         # Wrappeur Google Business Profile API
│   │   └── reviewSync.js        # Logique de synchronisation
│   ├── cron/
│   │   └── syncReviews.js       # Cron horaire
│   └── app.js                   # Bootstrap Express
├── .env.example
├── package.json
└── Dockerfile                   # Pour Railway
```

---

## 3. Schéma de base de données

### Table `tenants`

```sql
CREATE TABLE tenants (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(255) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  google_access_token  TEXT,
  google_refresh_token TEXT,
  google_account_id    VARCHAR(255),
  google_location_id   VARCHAR(255),
  settings             JSONB DEFAULT '{}',
  last_sync_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `reviews`

```sql
CREATE TABLE reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  google_review_id VARCHAR(255) UNIQUE NOT NULL,
  author           VARCHAR(255),
  author_initials  VARCHAR(10),
  rating           INTEGER CHECK (rating BETWEEN 1 AND 5),
  text             TEXT,
  date             TIMESTAMPTZ,
  source           VARCHAR(50) DEFAULT 'google',
  status           VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','responded')),
  response         TEXT,
  responded_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_tenant_id ON reviews (tenant_id);
CREATE INDEX idx_reviews_status    ON reviews (tenant_id, status);
```

---

## 4. API REST

Toutes les routes `/api/*` requièrent le middleware `requireAuth` (JWT valide).

### Auth

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/auth/google` | Redirige vers Google OAuth |
| `GET` | `/auth/google/callback` | Reçoit code → échange tokens → retourne JWT |
| `GET` | `/auth/me` | Infos du tenant connecté |
| `DELETE` | `/auth/logout` | Invalide la session côté client (JWT stateless) |
| `DELETE` | `/auth/google/disconnect` | Révoque les tokens Google, efface `google_access_token` + `google_refresh_token` en DB |

### Reviews

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/reviews` | Liste paginée. Query params: `page`, `source`, `status`, `rating`, `q` |
| `POST` | `/api/reviews/:id/reply` | Body: `{ text }`. Poste sur Google + met à jour DB |
| `POST` | `/api/sync` | Déclenche une sync manuelle immédiate |

### Settings

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/settings` | Retourne `tenants.settings` JSONB |
| `PUT` | `/api/settings` | Met à jour `tenants.settings` (merge partiel) |

### Analytics

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/analytics` | Stats calculées : NPS, taux réponse, note moyenne, répartition sources, top mots-clés |

---

## 5. Authentification Google (Passport.js)

```js
// Variables d'environnement requises
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.smartfeedback.ca/auth/google/callback
JWT_SECRET=...           // 32+ caractères aléatoires
DATABASE_URL=...         // Fourni par Railway PostgreSQL
```

**Flux :**
1. `GET /auth/google` → Passport redirige vers Google avec scopes `openid email profile https://www.googleapis.com/auth/business.manage`
2. Google redirige vers `/auth/google/callback?code=...`
3. Passport échange le code pour `access_token` + `refresh_token`
4. Backend : `INSERT INTO tenants ... ON CONFLICT (email) DO UPDATE` avec les nouveaux tokens
5. Backend signe un JWT `{ tenantId, email, exp: 7j }` et le redirige vers le frontend : `https://app.smartfeedback.ca/?token=JWT`
6. Frontend stocke le JWT dans `localStorage('sfai_jwt')`

---

## 6. Cron job — Synchronisation horaire

**Fichier :** `src/cron/syncReviews.js`  
**Fréquence :** `0 * * * *` (toutes les heures)

```
Pour chaque tenant WHERE google_refresh_token IS NOT NULL :
  1. Si access_token expiré (vérifié via essai) → refresh via OAuth2
  2. GET /v4/accounts/{acct}/locations/{loc}/reviews
     → filtrer reviews avec updateTime > last_sync_at
  3. Pour chaque avis :
     INSERT INTO reviews (...) ON CONFLICT (google_review_id) DO UPDATE
  4. UPDATE tenants SET last_sync_at = NOW()
  5. Logger résultat (nb nouveaux avis, erreurs éventuelles)
```

**Gestion des erreurs :**

| Code | Action |
|------|--------|
| `401` | Refresh automatique du token. Si refresh échoue : marquer tenant `needs_reauth` |
| `403` | Permissions révoquées. Marquer tenant, ne pas retry |
| `429` | Attendre 60s puis retry (max 3 fois) |
| `5xx` | Retry 3× avec backoff exponentiel (5s, 15s, 45s) |

---

## 7. Migration frontend

**Nouveau fichier :** `js/api.js` (ajouté à `index.html` avant `main.js`)

```js
const API_BASE = 'https://api.smartfeedback.ca';

const API = {
  _token: () => localStorage.getItem('sfai_jwt'),
  _headers: () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API._token() }),
  get:  (path)       => fetch(API_BASE + path, { headers: API._headers() }).then(API._handle),
  post: (path, body) => fetch(API_BASE + path, { method: 'POST', headers: API._headers(), body: JSON.stringify(body) }).then(API._handle),
  put:  (path, body) => fetch(API_BASE + path, { method: 'PUT',  headers: API._headers(), body: JSON.stringify(body) }).then(API._handle),
  _handle: (r) => { if (r.status === 401) { localStorage.removeItem('sfai_jwt'); Router.navigate('/login'); return; } return r.json(); }
};
window.API = API;
```

**Changements dans `main.js` :**
- Vérifier JWT au démarrage via `GET /auth/me`
- Si pas de JWT ou JWT invalide → afficher page Login
- Remplacer `fetch('data/reviews.json')` par `API.get('/api/reviews')`
- Remplacer `fetch('data/settings.json')` par `API.get('/api/settings')`

**Nouvelle page Login :** `js/pages/login.js` — affiche le bouton "Continuer avec Google" qui redirige vers `/auth/google`.

---

## 8. Déploiement Railway

**Services Railway :**
1. **API** — repo `smartfeedbackai-api`, build automatique depuis GitHub
2. **PostgreSQL** — plugin Railway, `DATABASE_URL` injecté automatiquement

**Variables d'environnement à configurer dans Railway :**
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
JWT_SECRET
NODE_ENV=production
FRONTEND_URL=https://app.smartfeedback.ca
```

---

## 9. Hors scope de cette spec

- TripAdvisor et Yelp (Spec future)
- Système de notifications email/SMS
- Dashboard admin multi-établissements
- Facturation et abonnements
- Tests automatisés (Jest)
