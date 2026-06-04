# SmartFeedbackAI — Projet complet : Design Spec

**Date :** 2026-06-01  
**Statut :** Approuvé  
**Approche choisie :** C — SPA avec templates HTML injectés, multi-fichiers vanilla JS/CSS, scripts classiques

---

## 1. Contexte

Transformation du prototype mono-fichier `index.html` (dashboard + slide-over IA) en un projet structuré avec 4 pages complètes, données JSON, et module IA configurable (mock ou Claude API).

**Contraintes :**
- Vanilla JS + CSS uniquement, pas de framework
- Scripts classiques (`<script src="">`) — ouvre sans serveur
- Données mock dans des fichiers `.json` servis via `fetch()`
- Clé API Claude optionnelle, configurée dans les Paramètres, stockée en localStorage

---

## 2. Architecture

### 2.1 Structure des fichiers

```
SmartFeedbackAI/
├── index.html                    # Point d'entrée — <div id="app"> + chargement scripts
├── css/
│   ├── tokens.css                # Variables CSS (couleurs, spacing, shadows)
│   ├── base.css                  # Reset + styles globaux
│   ├── layout.css                # Sidebar + topnav
│   ├── components.css            # Boutons, badges, cards, slideover, toast, dropdown
│   └── pages/
│       ├── dashboard.css
│       ├── reviews.css
│       ├── analytics.css
│       └── settings.css
├── js/
│   ├── main.js                   # Bootstrap : charge données, init router + composants
│   ├── router.js                 # Hash routing — écoute hashchange, dispatche vers pages
│   ├── store.js                  # État global en mémoire + sync localStorage
│   ├── ai.js                     # Module IA : mock + Claude API configurable
│   ├── components/
│   │   ├── sidebar.js            # Rendu sidebar, active nav item selon hash
│   │   ├── topnav.js             # Topnav dynamique : titre, search, dropdown profil
│   │   ├── toast.js              # Notifications toast
│   │   └── slideover.js         # Slide-over réponse IA (réutilisé par dashboard + reviews)
│   └── pages/
│       ├── dashboard.js
│       ├── reviews.js
│       ├── analytics.js
│       └── settings.js
└── data/
    ├── reviews.json              # 20 avis mock
    └── settings.json             # Config par défaut
```

### 2.2 Routing (hash-based)

| Hash | Page |
|------|------|
| `#/` ou `#` (vide) | Tableau de bord |
| `#/reviews` | Tous les avis |
| `#/analytics` | Analytique IA |
| `#/settings` | Paramètres |

`router.js` écoute `window.addEventListener('hashchange')` + appel initial au chargement. Chaque route appelle `page.render(container)` qui injecte du HTML dans `document.querySelector('#app')`.

### 2.3 État global (`store.js`)

```js
Store = {
  reviews: [],          // chargé depuis data/reviews.json
  settings: {},         // chargé depuis data/settings.json + override localStorage
  publishedResponses: {}, // { reviewId: responseText } — persisté en localStorage
}
```

Accès : `Store.get(key)` / `Store.set(key, value)` (avec sync localStorage automatique pour `settings` et `publishedResponses`).

**Initialisation au démarrage (`main.js`) :**
1. `fetch('data/reviews.json')` → `Store.reviews`
2. `fetch('data/settings.json')` → fusionné avec `localStorage.settings` (localStorage a priorité)
3. `localStorage.publishedResponses` ré-appliqué sur `Store.reviews` : pour chaque `reviewId` présent, le review reçoit `status: 'responded'` et `response: text`

**Publication d'une réponse :**
- `Store.publishedResponses[reviewId] = responseText` → persisté localStorage
- `Store.reviews` mis à jour en mémoire : `status → 'responded'`, `response → text`

---

## 3. Pages

### 3.1 Tableau de bord (`pages/dashboard.js`)

Migré depuis le prototype, avec deux ajouts :

- **Carte "Avis urgent"** : affiche le ou les avis 1★–2★ sans réponse avec un indicateur rouge
- **Compteur animé** : le taux de réponse se met à jour dynamiquement selon les réponses publiées dans `Store.publishedResponses`

Composants utilisés : `slideover.js` (bouton "Générer une réponse IA").

### 3.2 Tous les avis (`pages/reviews.js`)

- **Barre de recherche** : filtre par nom d'auteur ou contenu du texte (insensible à la casse)
- **Filtres combinés** : source (google / tripadvisor / yelp / tous), étoiles (1–5 / tous), statut (pending / responded / tous)
- **Liste paginée** : 10 avis par page, boutons Précédent / Suivant
- **Slide-over IA** : sur chaque avis `pending` via `slideover.js`
- **Marquer répondu** : après publication, le statut passe à `responded` dans le Store (persisté)
- **Export CSV** : bouton en en-tête, exporte les avis actuellement filtrés (id, auteur, note, source, date, texte, statut)

### 3.3 Analytique IA (`pages/analytics.js`)

Calculé dynamiquement depuis `Store.reviews` :

| Bloc | Détail |
|------|--------|
| **4 KPIs** | Score NPS, % sentiment positif, taux de réponse, délai moyen (mock fixe) |
| **Graphique barres** | Note moyenne par mois (6 derniers mois, calculé depuis les dates des avis) |
| **Répartition sources** | % google / tripadvisor / yelp (barres horizontales) |
| **Mots-clés récurrents** | Top 6 mots extraits des textes d'avis (hors stopwords FR), taille proportionnelle à la fréquence |
| **3 Insights IA** | Phrases générées depuis les données (templates paramétrés, pas d'appel API) |

### 3.4 Paramètres (`pages/settings.js`)

Navigation par onglets (4 sections) :

| Onglet | Contenu |
|--------|---------|
| **Établissement** | Nom, adresse, catégorie, langue des réponses |
| **Intégrations** | Google / TripAdvisor / Yelp — toggle on/off (mock, pas de vraie connexion OAuth) |
| **IA & Réponses** | Clé API Claude (input masqué + bouton "Tester"), ton par défaut, langue |
| **Abonnement** | Plan actuel (Plan Pro), CTA upgrade (statique) |

Sauvegarde : bouton "Enregistrer" → `Store.set('settings', {...})` → persisté localStorage.

---

## 4. Composants partagés

### `components/sidebar.js`
- Rendu HTML de la sidebar (logo, nav items, biz row)
- Lit `window.location.hash` pour activer le bon item
- Ré-active l'item actif à chaque `hashchange`

### `components/topnav.js`
- Titre et sous-titre dynamiques selon la page courante
- Recherche (forwarde l'événement `input` vers la page active si elle écoute)
- Dropdown profil (toggle + fermeture au clic extérieur)
- Hamburger mobile

### `components/slideover.js`
- Reçoit `{ name, rating, text }` via `Slideover.open({ ... })`
- Sélection du ton (4 options)
- Appelle `AI.generate({ rating, tone, name, text })` → animation `typeText()`
- Boutons : Régénérer, Modifier, Publier
- À la publication : appelle `onPublish(responseText)` callback fourni par la page appelante

### `components/toast.js`
- `Toast.show(message, type)` — types : `success`, `error`, `info`
- Auto-masquage après 3.6s

---

## 5. Module IA (`js/ai.js`)

```js
AI.generate({ rating, tone, name, text }) → Promise<string>
```

**Mode mock** (aucune clé configurée) :
- `RESPONSES[rating][tone]` — 20 combinaisons (5 notes × 4 tons)
- `{name}` remplacé par le nom du client
- Délai simulé : 1 200–2 200ms (random)
- Retourne la chaîne de texte

**Mode Claude API** (clé présente dans `Store.settings.ai.apiKey`) :
- Modèle : `claude-haiku-4-5-20251001` (rapide, économique)
- Prompt système : contexte restaurant francophone, ton demandé
- Prompt utilisateur : avis + instruction de réponse
- Appel `fetch` direct vers `https://api.anthropic.com/v1/messages`
- Header `x-api-key` + `anthropic-dangerous-direct-browser-access: true`
- En cas d'erreur API → fallback silencieux sur le mock

---

## 6. Données mock

### `data/reviews.json` — 20 avis

Champs : `id`, `author`, `initials`, `color` (gradient CSS), `rating` (1–5), `date` (ISO), `source` (`google`|`tripadvisor`|`yelp`), `status` (`pending`|`responded`), `text`, `response` (null ou string).

Répartition : 14 × 5★, 5 × 4★, 4 × 3★, 2 × 2★, 1 × 1★ — sources : 12 Google, 5 TripAdvisor, 3 Yelp.

### `data/settings.json` — config par défaut

```json
{
  "business": { "name": "Le Petit Bistro", "address": "12 rue de Rivoli, Paris", "category": "Restaurant" },
  "ai": { "apiKey": "", "defaultTone": "professional", "language": "fr" },
  "integrations": { "google": true, "tripadvisor": true, "yelp": false }
}
```

---

## 7. Responsive

Breakpoints identiques au prototype :

| Breakpoint | Comportement |
|---|---|
| `≤ 1100px` | Colonne droite passe sous les avis |
| `≤ 860px` | Summary cards en 2 colonnes |
| `≤ 640px` | Sidebar masquée (hamburger), layout une colonne, search masqué |

---

## 8. Ce qui n'est PAS dans le scope

- Authentification / login
- Backend ou base de données réelle
- Synchronisation en temps réel avec Google/TripAdvisor/Yelp (mock uniquement)
- Tests automatisés
- Build/bundling (Vite, Webpack, etc.)
