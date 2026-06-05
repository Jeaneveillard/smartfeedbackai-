# Onboarding Request & Client Storage — Design Spec

**Date :** 2026-06-04
**Statut :** Approuvé

---

## Objectif

Permettre à un prospect de soumettre une demande d'accès en remplissant un formulaire public (établissement + contact). L'admin reçoit une notification email, consulte les demandes dans son panel, approuve ou rejette. L'approbation crée automatiquement le compte client et envoie le lien d'invitation. Toutes les informations du client sont stockées côté admin uniquement — jamais exposées au client.

---

## Flux complet

```
Landing page — CTA "Commencer gratuitement"
  ↓
OnboardingPage (inline swap, ← Retour)
  ↓ Soumet le formulaire (POST /api/onboarding-requests)
Backend : stocke la demande + email à jeaneveillard@gmail.com
  ↓
Client voit : "Demande envoyée ! Nous vous contacterons sous 24–48h."
  ↓
Admin ouvre panel → onglet "Demandes" (badge rouge = nb pending)
  ↓ Approuve → crée tenant (avec toutes les infos) + envoie invitation
  ↓ ou Rejette → note optionnelle, statut = rejected
```

---

## Section 1 — Formulaire public (`OnboardingPage`)

### Fichiers
- Créer : `js/pages/onboarding.js` (`window.OnboardingPage = { render }`)
- Créer : `css/pages/onboarding.css`
- Modifier : `index.html` (ajouter `<link>` + `<script>`)
- Modifier : `js/pages/landing.js` (CTA "Commencer gratuitement" → `OnboardingPage.render`)

### Champs du formulaire

| Champ | ID HTML | Type | Requis |
|---|---|---|---|
| Nom de l'établissement | `obBusinessName` | text | ✓ |
| Secteur d'activité | `obSector` | select | ✓ |
| Adresse complète | `obAddress` | text | ✓ |
| Ville | `obCity` | text | ✓ |
| Site web | `obWebsite` | url | — |
| Nom du contact | `obContactName` | text | ✓ |
| Email du contact | `obEmail` | email | ✓ |
| Téléphone | `obPhone` | tel | — |

**Secteurs (select) :** Restaurants, Hôtels & hébergements, Cliniques & santé, Salons & beauté, Fitness & sport, Commerce de détail, Garages & auto, Services professionnels

### Comportement

- Validation client : champs requis + format email avant envoi
- En cours : bouton désactivé + texte "Envoi en cours…"
- Succès (201) : remplace le formulaire par confirmation verte — *"Demande envoyée ! Nous vous contacterons sous 24–48h."*
- Doublon (409) : message orange — *"Une demande avec cet email existe déjà."*
- Erreur réseau/serveur : message rouge, bouton réactivé
- Bouton ← Retour flottant (classe `lp-back`) pour revenir à la landing

---

## Section 2 — Backend

### Nouvelle table `onboarding_requests`

```sql
CREATE TABLE onboarding_requests (
  id           SERIAL PRIMARY KEY,
  business_name VARCHAR(200) NOT NULL,
  sector        VARCHAR(100) NOT NULL,
  contact_name  VARCHAR(200) NOT NULL,
  email         VARCHAR(200) NOT NULL,
  phone         VARCHAR(50),
  address       VARCHAR(300) NOT NULL,
  city          VARCHAR(100) NOT NULL,
  website       VARCHAR(300),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Modifications table `tenants`

Nouvelles colonnes pour stocker le profil complet :

```sql
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS sector  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS phone   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address VARCHAR(300),
  ADD COLUMN IF NOT EXISTS city    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS website VARCHAR(300);
```

### Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/onboarding-requests` | public | Soumet une demande |
| GET | `/admin/onboarding-requests` | admin JWT | Liste toutes les demandes |
| POST | `/admin/onboarding-requests/:id/approve` | admin JWT | Approuve + crée tenant + invite |
| POST | `/admin/onboarding-requests/:id/reject` | admin JWT | Rejette avec notes optionnelles |

#### POST `/api/onboarding-requests`
- Body : `{ business_name, sector, contact_name, email, phone, address, city, website }`
- Vérifie doublon : `SELECT id FROM onboarding_requests WHERE email = $1 AND status = 'pending'` → 409 si trouvé
- Insère en base → status `pending`
- Envoie email à `jeaneveillard@gmail.com` (SMTP existant) :
  - Objet : `[SmartFeedback AI] Nouvelle demande — {business_name}`
  - Corps : tous les champs + lien `https://smartfeedbackai.jeaneveillard.workers.dev` (admin se connecte et va dans Demandes)
- Retourne 201 `{ message: 'Demande reçue' }`

#### GET `/admin/onboarding-requests`
- Auth middleware admin requis
- Retourne toutes les demandes triées par `created_at DESC`
- Champs : id, business_name, sector, contact_name, email, phone, address, city, website, status, notes, created_at

#### POST `/admin/onboarding-requests/:id/approve`
- Body : `{ username, plan }` (username suggéré depuis business_name, plan depuis le choix admin)
- Appelle la logique existante de création de tenant (`/admin/tenants`) avec les infos de la demande
- Stocke aussi sector, phone, address, city, website dans le nouveau tenant
- Marque la demande `status = 'approved'`
- Retourne `{ tenant, invite }` (même format que `/admin/tenants`)

#### POST `/admin/onboarding-requests/:id/reject`
- Body : `{ notes }` (optionnel)
- Marque `status = 'rejected'`, stocke les notes
- Retourne 200 `{ message: 'Demande rejetée' }`

### Email de notification admin
```
Objet : [SmartFeedback AI] Nouvelle demande — {business_name}

Établissement : {business_name}
Secteur       : {sector}
Adresse       : {address}, {city}
Site web      : {website || '—'}

Contact       : {contact_name}
Email         : {email}
Téléphone     : {phone || '—'}

Soumis le     : {created_at}

→ Connectez-vous pour approuver ou rejeter cette demande.
```

---

## Section 3 — Panel admin (`admin.js`)

### Nouvel onglet "Demandes"

- Ajouté à côté de l'onglet "Clients" existant
- Badge rouge avec le nombre de demandes `pending` (se met à 0 quand toutes traitées)
- Chargement : `GET /admin/onboarding-requests` au clic sur l'onglet

### Liste des demandes

Chaque ligne affiche :
- Nom de l'établissement + secteur
- Ville
- Nom contact + email
- Date de soumission
- Statut : badge `pending` (orange) / `approved` (vert) / `rejected` (rouge)

### Actions par demande

**Approuver** (statut `pending` uniquement) :
- Ouvre un mini-formulaire inline pré-rempli avec :
  - Nom (depuis `business_name`)
  - Email (depuis `email`)
  - Username suggéré (slug du `business_name`, ex: `lebistroparis`)
  - Plan (select : starter / pro / admin)
- Bouton "Créer le compte & envoyer l'invitation"
- Appelle `POST /admin/onboarding-requests/:id/approve`
- Affiche le lien d'invitation comme dans l'onglet Clients existant

**Rejeter** (statut `pending` uniquement) :
- Demande une note optionnelle (textarea)
- Appelle `POST /admin/onboarding-requests/:id/reject`
- Met à jour le badge

### Onglet "Clients" — profil complet

- Bouton "Voir le profil" sur chaque ligne de client
- Affiche un panneau avec : nom, secteur, adresse, ville, téléphone, email, site web, plan, date création
- Visible admin uniquement — aucune route exposée côté client

---

## Sécurité

- `POST /api/onboarding-requests` est public mais rate-limité (existant sur Render)
- Les routes `/admin/*` utilisent le middleware JWT admin existant
- Les infos client (adresse, tel, etc.) ne sont jamais retournées dans les routes client (`/api/me`, `/api/settings`, etc.)

---

## Fichiers touchés

### Frontend
| Fichier | Action |
|---|---|
| `js/pages/onboarding.js` | Créer |
| `css/pages/onboarding.css` | Créer |
| `index.html` | Modifier (ajouter link + script) |
| `js/pages/landing.js` | Modifier (CTAs "signup" → OnboardingPage) |
| `js/pages/admin.js` | Modifier (onglet Demandes + profil client) |

### Backend (repo `smartfeedbackai-api`)
| Fichier | Action |
|---|---|
| `migrations/add_onboarding_requests.sql` | Créer |
| `migrations/add_tenant_profile_fields.sql` | Créer |
| `routes/onboarding.js` | Créer |
| `server.js` ou `routes/index.js` | Modifier (monter les nouvelles routes) |
