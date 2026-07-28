# Dernière Issue · V0.3

Application d’aventures narratives de survie sociale pour **2 à 8 joueurs**.

**Première aventure complète : Le Crash.**

## Contenu de cette version

- Menu principal conçu comme une collection d’aventures
- Fiche complète de **Le Crash**
- 7 chapitres jouables du crash à l’évacuation
- 21 événements principaux
- 7 événements secondaires pour la partie longue
- 3 durées : courte, normale et longue
- Briefings secrets distribués en passe-et-joue
- Intrigues secrètes : accident, cargaison, opportuniste ou saboteur
- Aucun saboteur imposé dans les parties à 2 joueurs
- 8 capacités utilisables une fois par partie
- Choix collectifs, choix secrets et choix ciblant un autre joueur
- 3 vies par joueur, états, inventaires personnels et ressources communes
- Jauges Réserves, Refuge, Signal, Danger et Cohésion
- Nora, la mallette grise, la boîte noire et la station souterraine
- Routes d’évacuation débloquées selon les décisions précédentes
- 8 issues principales
- Révélation finale des rôles et de la vérité sur le crash
- Sauvegarde et reprise automatiques dans le navigateur
- Migration des anciennes sauvegardes arrêtées après le chapitre 1
- 11 tests automatisés, dont 45 simulations complètes sans blocage

L’arbre conceptuel des issues est disponible dans :

```text
assets/arbre-des-issues-le-crash.png
```

## Tester dans GitHub Codespaces

Aucune dépendance n’est nécessaire pour jouer.

```bash
python -m http.server 4173
```

Ouvrez ensuite le port **4173** proposé par Codespaces.

Pour vérifier le moteur :

```bash
npm run check
npm test
```

## Mise à jour du dépôt GitHub

1. Décompressez le ZIP livré.
2. Dans le dépôt `derniere-issue`, cliquez sur **Add file > Upload files**.
3. Importez le contenu du dossier à la racine du dépôt.
4. Acceptez le remplacement des fichiers existants.
5. Validez avec **Commit changes**.

GitHub Pages étant déjà configuré sur `main` et `/(root)`, la nouvelle version sera publiée automatiquement.

## Firebase

Firebase n’est toujours pas nécessaire pour le mode actuel sur un seul appareil.

Il deviendra utile pour :

- créer des salles avec un code ;
- utiliser un téléphone par joueur ;
- synchroniser les choix en direct ;
- permettre la reconnexion à une partie ;
- ajouter des comptes et statistiques en ligne.
