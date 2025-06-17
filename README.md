# AppNBA

Une application web permettant de consulter les joueurs NBA et les scores des matchs passés, avec un affichage de fiche détaillée.

## Fonctionnalités

- Recherche de joueurs NBA avec affichage en temps réel.
- Affichage d'une fiche détaillée au clic sur un joueur (nom, équipe, poste).
- Consultation des scores NBA par date sélectionnée.
- Backend proxy Node.js (hébergé sur Vercel) pour contourner les problèmes de CORS.
- Interface responsive et épurée.

## Technologies utilisées

- HTML, CSS, JavaScript
- API publique : [balldontlie.io](https://www.balldontlie.io/)
- Backend Node.js pour appels API (dossier `/api`)
- Hébergement prévu sur [vercel.com](https://vercel.com)

## Structure du projet

```
AppNBA/
│
├── index.html         # Page principale
├── style.css          # Mise en forme
├── script.js          # Logique de l'application
└── api/
    └── players.js     # Proxy Node.js pour contourner le CORS
```

## Déploiement (via Vercel)

1. Créer un compte Vercel (https://vercel.com).
2. Connecter le dépôt GitHub contenant ce projet.
3. Vercel détecte automatiquement :
   - Le frontend via `index.html`
   - Les fonctions backend via `/api`

## Exemple d'utilisation

- Tapez un nom dans la barre de recherche pour voir les joueurs correspondants.
- Cliquez sur un joueur pour voir ses informations.
- Sélectionnez une date et cliquez sur "Afficher les scores" pour consulter les résultats de la journée.
