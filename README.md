# AppNBA

Une application web permettant de consulter les joueurs NBA, les scores des matchs passés et à venir, ainsi que les informations détaillées sur les équipes.

## Fonctionnalités

- Recherche de joueurs NBA avec affichage en temps réel.
- Affichage d'une fiche détaillée au clic sur un joueur (nom, équipe, poste).
- Consultation des scores NBA sur la semaine (matchs à venir et dernier match terminé).
- Affichage des détails d'un match et des équipes au clic sur une carte de match.
- Recherche d'équipe NBA avec fiche détaillée.
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
├── README.md
├── vercel.json
├── public/
│   ├── index.html      # Page principale
│   ├── style.css       # Mise en forme
│   └── script.js       # Logique de l'application
└── api/
    ├── players.js      # Proxy Node.js pour les joueurs
    ├── games.js        # Proxy Node.js pour les matchs
    └── teams.js        # Proxy Node.js pour les équipes
```

## Déploiement (via Vercel)

1. Créer un compte Vercel (https://vercel.com).
2. Connecter le dépôt GitHub contenant ce projet.
3. Définir la variable d'environnement `BALLDONTLIE_API_KEY` dans les paramètres du projet Vercel.
4. Vercel détecte automatiquement :
   - Le frontend via `public/index.html`
   - Les fonctions backend via `/api`

## Exemple d'utilisation

- Tapez un nom dans la barre de recherche pour voir les joueurs correspondants.
- Cliquez sur un joueur pour voir ses informations détaillées.
- Consultez les prochains matchs et le dernier match terminé sur la page d'accueil.
- Cliquez sur une carte de match pour afficher les détails des équipes.
- Recherchez une équipe NBA pour afficher sa fiche
