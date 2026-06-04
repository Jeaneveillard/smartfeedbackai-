# SmartFeedbackAI — Spec 2 : Intégration Google Business Profile API

**Date :** 2026-06-02  
**Statut :** Approuvé  
**Dépend de :** `2026-06-02-backend-database-design.md` (doit être implémenté en premier)  
**API Google :** Google Business Profile API v4 + My Business Account Management API v1

---

## 1. Objectif

Connecter SmartFeedbackAI à Google Business Profile pour :
1. **Lire** automatiquement les avis Google de l'établissement (sync horaire)
2. **Publier** les réponses générées par l'IA directement sur Google

---

## 2. Prérequis Google Cloud

### Création du projet Google Cloud

1. Créer un projet sur [console.cloud.google.com](https://console.cloud.google.com)
2. Activer les APIs suivantes :
   - `My Business Account Management API`
   - `My Business Business Information API`
   - `My Business Reviews API` (Google Business Profile API v4)
3. Créer des identifiants OAuth 2.0 de type "Application Web"
4. Ajouter les URIs de redirection autorisées :
   - `http://localhost:3001/auth/google/callback` (dev)
   - `https://api.smartfeedback.ca/auth/google/callback` (production)

### Vérification de l'application

> ⚠️ Le scope `business.manage` est **sensible**. Google exige une vérification avant d'autoriser des utilisateurs en dehors du mode test.
> - **Mode test :** jusqu'à 100 utilisateurs listés manuellement dans la console Google — suffisant pour le MVP
> - **Production :** soumettre la demande de vérification (délai 1-4 semaines, nécessite politique de confidentialité + domaine vérifié)

---

## 3. OAuth 2.0 — Scopes et paramètres

```js
// Scopes demandés lors de la connexion
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/business.manage'
];

// Paramètres importants
access_type: 'offline'   // Obligatoire pour obtenir refresh_token
prompt: 'consent'        // Force l'affichage du consentement (nécessaire pour refresh_token)
```

---

## 4. Séquence d'initialisation — Premier login

Lors du premier login d'un tenant, il faut :

1. Récupérer son `account_id` Google Business
2. Lister ses établissements pour lui laisser choisir lequel connecter (si plusieurs)
3. Stocker le `location_id` choisi dans `tenants.google_location_id`

```
POST /auth/google/callback :
  1. Échanger code → tokens
  2. GET /v1/accounts → account_id
  3. GET /v1/accounts/{account_id}/locations → liste des établissements
  4. Si 1 seul → sélection automatique
     Si plusieurs → retourner la liste au frontend pour choix
  5. POST /api/setup/location { locationId } → sauvegarder
  6. Lancer sync initiale immédiate (derniers 90 jours d'avis)
  7. Retourner JWT
```

**Nouveau endpoint nécessaire :**

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/setup/locations` | Liste les établissements Google du tenant |
| `POST` | `/api/setup/location` | Body: `{ locationId }`. Enregistre le choix |

---

## 5. Lecture des avis — Détail technique

### Endpoint Google

```
GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
  ?pageSize=50
  &orderBy=updateTime desc
Authorization: Bearer {access_token}
```

### Structure d'une réponse Google

```json
{
  "reviews": [
    {
      "reviewId": "AbFvOqkABC123...",
      "reviewer": {
        "displayName": "Sophie Martin",
        "profilePhotoUrl": "https://..."
      },
      "starRating": "FIVE",
      "comment": "Excellent restaurant !",
      "createTime": "2026-05-28T14:23:00Z",
      "updateTime": "2026-05-28T14:23:00Z",
      "reviewReply": null
    }
  ],
  "nextPageToken": "..."
}
```

### Mapping vers le schéma DB

| Champ Google | Champ DB |
|-------------|---------|
| `reviewId` | `google_review_id` |
| `reviewer.displayName` | `author` |
| `starRating` (FIVE/FOUR/…) | `rating` (5/4/3/2/1) |
| `comment` | `text` |
| `createTime` | `date` |
| `reviewReply.comment` | `response` |
| `reviewReply != null` | `status = 'responded'` |

```js
// Conversion starRating → integer
const STAR_MAP = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
```

### Pagination

Google retourne max 50 avis par page. Si `nextPageToken` est présent, refaire la requête avec `&pageToken={token}` jusqu'à épuisement.

---

## 6. Publication d'une réponse — Détail technique

### Endpoint Google

```
PUT https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply
Authorization: Bearer {access_token}
Content-Type: application/json

{ "comment": "Merci beaucoup pour votre avis..." }
```

### Réponse Google

- `200 OK` → réponse publiée. Body : `{ "comment": "...", "updateTime": "..." }`
- `403 Forbidden` → permissions insuffisantes ou avis supprimé
- `429 Too Many Requests` → rate limit (5 req/s)

### Flux backend complet (`POST /api/reviews/:id/reply`)

```
1. Vérifier JWT → récupérer tenant
2. Charger review depuis DB (vérifier tenant_id = tenant.id)
3. Récupérer google_access_token (refresh si expiré)
4. PUT .../{reviewId}/reply → { comment: text }
5. Si 200 : UPDATE reviews SET status='responded', response=text, responded_at=NOW()
6. Retourner { success: true } au frontend
7. Si erreur Google : retourner erreur HTTP appropriée
```

---

## 7. Refresh automatique du token

```js
// services/googleApi.js
async function getValidToken(tenant) {
  // Tenter un appel léger — si 401, refresh
  try {
    return tenant.google_access_token;
  } catch (err) {
    if (err.status !== 401) throw err;
    // Refresh
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: tenant.google_refresh_token,
        grant_type:    'refresh_token'
      })
    });
    const { access_token } = await res.json();
    await db('tenants').where({ id: tenant.id }).update({ google_access_token: access_token });
    return access_token;
  }
}
```

---

## 8. Quotas et limites

| Opération | Limite Google | Impact sur SmartFeedback |
|-----------|--------------|--------------------------|
| Lecture avis | 5 000 req/jour/projet | 50 tenants × 24h = 1 200 req — OK |
| Écriture réponses | 5 req/s | Ajouter `setTimeout(200ms)` entre les réponses en batch |
| Listing comptes | 1 000 req/jour | Seulement à la connexion — OK |

---

## 9. Statut de connexion Google dans l'UI

Dans l'onglet **Intégrations** des Paramètres, le statut Google passe de mock à réel :

| État | Affichage | Action |
|------|-----------|--------|
| Non connecté | Badge gris "Déconnecté" | Bouton "Connecter avec Google" → `/auth/google` |
| Connecté | Badge vert "Connecté · Dernière sync: il y a Xmin" | Bouton "Déconnecter" + "Synchroniser maintenant" |
| Erreur token | Badge orange "Reconnexion requise" | Bouton "Reconnecter" |

---

## 10. Hors scope de cette spec

- Gestion de plusieurs établissements par compte Google
- Réponse automatique sans validation humaine
- Analytics avancés sur les performances des réponses
- Intégration TripAdvisor / Yelp
