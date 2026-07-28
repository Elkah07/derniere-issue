# Dernière Issue · Prototype V0.1

Application d’aventures narratives de survie sociale pour 2 à 8 joueurs.

**Première aventure : Le Crash.**

## Contenu de cette version

- Écran d’accueil Dernière Issue
- Création d’une partie de 2 à 8 joueurs
- Réglages de durée et de public
- 3 vies par joueur
- Jauges Réserves, Refuge, Signal, Danger et Cohésion
- Chapitre 1 de Le Crash jouable avec 3 événements
- Choix secrets en mode passe-et-joue
- Décision collective
- Conséquences, inventaires et états
- Sauvegarde automatique dans le navigateur
- Tests automatisés du moteur
- Déploiement automatique sur GitHub Pages

## Tester dans GitHub Codespaces

Aucune installation de dépendance n’est nécessaire.

```bash
python -m http.server 4173
```

Ouvrez ensuite le port **4173** proposé par Codespaces.

Pour vérifier le moteur :

```bash
npm run check
npm test
```

## Mettre le projet sur GitHub

1. Ouvrez le dépôt `derniere-issue`.
2. Importez tous les fichiers de ce dossier à la racine du dépôt.
3. Dans le dépôt, ouvrez **Settings > Pages**.
4. Dans **Build and deployment**, choisissez **GitHub Actions**.
5. Le workflow **Deploy to GitHub Pages** publiera automatiquement l’application à chaque modification de `main`.

L’adresse publique prendra généralement la forme :

```text
https://VOTRE-PSEUDO.github.io/derniere-issue/
```

## Firebase

Firebase n’est pas nécessaire pour ce prototype sur un seul appareil.

Il deviendra utile pour :

- créer des salles avec un code ;
- synchroniser plusieurs téléphones en temps réel ;
- stocker les parties en ligne ;
- permettre aux joueurs de se reconnecter ;
- ajouter des comptes ou des statistiques persistantes.
