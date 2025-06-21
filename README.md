# AppNBA – E6 ClientLeger

# Consultation de données NBA

Projet réalisé dans le cadre de l’épreuve E6 « Conception et développement d’applications » du BTS SIO (option SLAM).

## 🧑‍💻 Auteur

**Nom :** Nathan GUILLAUMOT  
**Candidat :** 02444878466  
**Établissement :** Efrei Paris  
**Année :** Session 2025

---

## 📌 Objectif

Créer une application web permettant de consulter des données issues de la NBA via une API externe. Le but est d’intégrer les contraintes d’API gratuite, afficher dynamiquement les prochains matchs, les scores en cours, le dernier match terminé, ainsi que les informations sur les joueurs et équipes.

---

## 🛠️ Technologies utilisées

- HTML / CSS / JavaScript
- API : [https://www.balldontlie.io/](https://www.balldontlie.io/)
- Hébergement : Vercel

---

## 🗃️ Structure du projet

```
AppNBA/
│
├── public/
│   ├── index.html           # Fichier HTML principal
│   ├── style.css            # Feuille de style principale
│   ├── script.js            # Script JS principal
│   ├── api/
│   │   ├── games.js         # Récupération des matchs
│   │   ├── players.js       # Récupération des joueurs
│   │   └── teams.js         # Récupération des équipes
```

---

## ⚙️ Fonctionnalités principales

- 🔍 **Recherche de joueurs** avec affichage des détails (équipe, position…)
- 🏀 **Affichage des prochains matchs** NBA avec statut (à venir, en cours, terminé)
- 📆 **Dernier match terminé** mis en avant
- 📋 **Recherche d’équipes NBA** et consultation des détails (ville, division, conférence…)
- 📊 **Détails des équipes participantes** à chaque match cliquable
- ⏱️ Mise à jour automatique des scores (dans la limite des requêtes API)

---

## 🚀 Utilisation en ligne

Le projet est accessible directement via ce lien Vercel :  
🌐 [https://app-nba-nu.vercel.app/](https://app-nba-nu.vercel.app/)

---

## 🚀 Lancer le projet en local (facultatif)

1. Télécharger ou cloner le dépôt :

   ```bash
   git clone https://github.com/NahtanG/AppNBA.git
   cd AppNBA/public
   ```

2. Ouvrir le fichier `index.html` dans un navigateur :
   ```bash
   start index.html  # (Windows)
   open index.html   # (macOS)
   ```

> 💡 Si vous rencontrez des problèmes liés au CORS, il est recommandé d’utiliser une solution côté backend ou d’héberger le projet (déjà fait via Vercel).

---

## 📦 Dépendances externes

Ce projet utilise uniquement des appels HTTP (`fetch`) vers l'API balldontlie.io. Aucune dépendance externe ni installation de packages n’est nécessaire.

---

## 🔒 Limitations de l’API gratuite

- ⚠️ Maximum **5 requêtes par minute**
- 📂 Endpoints disponibles : `players`, `teams`, `games`
- Aucune statistique détaillée sur les performances des joueurs

---

## ✅ Projet conforme au BTS SIO E6

Le projet respecte les exigences du BTS SIO :

- Intégration API tierce
- Interaction utilisateur en temps réel
- Interface réactive et informative
- Architecture modulaire (fichiers organisés)
- Versionné avec Git (hébergé sur GitHub)

---

## 📎 Lien vers le dépôt GitHub

🔗 [https://github.com/NahtanG/AppNBA](https://github.com/NahtanG/AppNBA)
