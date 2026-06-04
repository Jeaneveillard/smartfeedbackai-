# Landing Page — Design Spec
**Date :** 2026-06-04  
**Statut :** Approuvé

---

## Contexte

SmartFeedbackAI est une application SaaS multi-tenant de gestion des avis clients, propulsée par l'IA (Claude / Anthropic). Elle s'adresse à **tout type d'entreprise** recevant des avis en ligne (restaurants, hôtels, cliniques, salons, commerces, garages, services professionnels, etc.). L'app est déployée sur Netlify : `https://splendid-peony-c3e6ce.netlify.app`.

Actuellement, un visiteur non authentifié arrive directement sur la page de connexion (`LoginPage`). L'objectif est d'intercaler une landing page marketing avant le login pour présenter l'app aux nouveaux clients potentiels.

---

## Décisions de design

| Décision | Choix retenu | Raison |
|---|---|---|
| Emplacement | Intégrée au SPA existant | Pas de nouveau repo/domaine à gérer |
| Approche | Remplacement du login pour visiteurs non auth | Suit le pattern existant, 2 fichiers seulement |
| Style hero | Dégradé blanc→indigo + mini aperçu produit | Moderne, montre le produit en action dès le premier regard |
| Sections | Nav + Hero + Secteurs + Sources + Features + Témoignages + FAQ + CTA + Footer | Landing complète pour convaincre un nouveau client |
| Tarifs | Pas de section tarifs pour l'instant | À ajouter quand les plans seront définis |
| Langue | Français (comme le reste de l'app) | Cohérence ; l'i18n peut être ajouté plus tard |

---

## Architecture

### Comportement utilisateur

```
Visiteur non authentifié
  └─> main.js détecte: pas de JWT + pas demo mode
        └─> Affiche LandingPage.render(app)
              ├─> Bouton "Se connecter" → swap vers LoginPage.render(app)
              └─> Bouton "Commencer gratuitement" → swap vers SignupPage.render(app)

Utilisateur connecté
  └─> Comportement inchangé (dashboard via router)
```

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `js/pages/landing.js` | Module IIFE `window.LandingPage = { render }` |
| `css/pages/landing.css` | Styles de la landing (tokens CSS réutilisés) |

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `index.html` | Ajouter `<link>` et `<script>` pour landing |
| `js/main.js` | Dans le bloc `if (!jwt)`, appeler `LandingPage.render()` au lieu de `LoginPage.render()` |

### Pattern d'implémentation

`landing.js` suit le pattern IIFE existant (pas d'ES modules) :

```js
window.LandingPage = (function() {
  'use strict';

  function render(container) {
    container.innerHTML = /* HTML de la landing */;
    // attacher les event listeners pour les boutons CTA
    document.getElementById('landingLoginBtn')
      .addEventListener('click', function() { LoginPage.render(container); });
    document.getElementById('landingSignupBtn')
      .addEventListener('click', function() { SignupPage.render(container); });
  }

  return { render: render };
})();
```

Les boutons CTA appellent directement `LoginPage.render()` ou `SignupPage.render()` sur le même `container` — pas de rechargement de page, pas de changement d'URL.

---

## Sections de la landing page

### 1. Barre de navigation (sticky)
- Logo SmartFeedback AI (icône + texte)
- Bouton ghost "Se connecter" → `LoginPage.render()`
- Bouton primary "Commencer gratuitement" → `SignupPage.render()`

### 2. Hero
- Badge "Propulsé par Claude AI (Anthropic)"
- Titre : "Gérez tous vos avis clients avec l'**intelligence artificielle**" (mot clé en indigo)
- Sous-titre générique couvrant tous les secteurs
- 2 CTA : "Commencer gratuitement" (primary) + "Se connecter →" (ghost)
- Mini-aperçu du dashboard : une review card avec réponse IA + 3 stats (% répondus, note moyenne, en attente)
- Fond dégradé `#fff → #EEF2FF → #C7D2FE`

### 3. Secteurs supportés
- Label "Pour tous les secteurs qui reçoivent des avis clients"
- 8 chips : 🍽️ Restaurants · 🏨 Hôtels · 🏥 Cliniques · 💇 Salons · 🏋️ Fitness · 🛍️ Commerce · 🚗 Garages · ⚖️ Services pro

### 4. Plateformes supportées
- Label "Connecté à vos plateformes d'avis"
- 3 logos : Google · TripAdvisor · Yelp

### 5. Fonctionnalités (6 cartes — grille 3×2)
1. Réponses IA en 1 clic
2. Tableau de bord centralisé
3. Analytique IA
4. Ton personnalisable (professionnel / chaleureux / formel / décontracté)
5. Sécurité & confidentialité (RGPD)
6. Alertes en temps réel

### 6. Témoignages (3 cartes — secteurs variés)
- Restaurant (Sophie Laurent, Lyon)
- Clinique médicale (Dr. Rousseau, Montréal)
- Hôtel (Karim Mansouri, Paris)

### 7. FAQ (5 questions — réponses toujours visibles, pas d'accordéon)
Questions et réponses toujours affichées (pas de toggle). Icône `+` décorative à droite du titre.
1. Pour quel type d'entreprise ?
2. Comment les réponses sont-elles générées ?
3. Puis-je modifier avant publication ?
4. Quelles plateformes ?
5. Comment démarrer ?

### 8. CTA final
- Fond dégradé sombre (`#1E1B4B → #4F46E5`)
- Titre : "Prêt à maîtriser votre réputation en ligne ?"
- 2 boutons : "Commencer gratuitement" (blanc) + "Se connecter" (outline blanc)

### 9. Footer
- Copyright · Liens : Confidentialité · Contrat · Contact

---

## CSS

- Toutes les couleurs utilisent les custom properties de `css/tokens.css` (`--primary`, `--bg`, `--border`, etc.)
- Responsive : colonne unique sous 640px (même breakpoint que le reste de l'app)
- Pas de dépendance externe (pas de framework CSS)
- `css/pages/landing.css` importé dans `index.html` aux côtés des autres pages

---

## Sécurité

- Aucune donnée utilisateur n'est injectée dans la landing (page 100% statique)
- Les boutons CTA utilisent `addEventListener`, pas `onclick` inline
- Aucun appel API sur cette page

---

## Ce qui est hors scope

- Internationalisation (FR/EN) — peut être ajouté plus tard via `I18n`
- Section tarifs — à ajouter quand les plans seront définis
- Animations d'entrée (scroll reveal) — amélioration future
- Formulaire de contact ou démo — amélioration future
