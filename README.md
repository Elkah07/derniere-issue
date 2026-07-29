# Dernière Issue · V0.8 consolidation

Application d’aventures narratives de survie sociale pour **2 à 8 joueurs**.

Première aventure : **Le Crash**.

## Nouveautés principales

### Talents secrets contextuels

Les anciens pouvoirs utilisables librement ont été remplacés par des **talents secrets contextuels**.

- Médecin n’intervient que lorsqu’une personne est blessée ou affaiblie.
- Protecteur et Endurant apparaissent avant une scène réellement dangereuse.
- Éclaireur apparaît avant un choix de route ou d’exploration.
- Observateur apparaît pendant les scènes de soupçon, de preuve ou de sabotage.
- Négociateur apparaît pendant certaines décisions collectives.
- Bricoleur apparaît face à un appareil, une structure ou une évacuation fragile.

Lorsqu’au moins un talent peut intervenir, **chaque joueur vérifie secrètement son écran**. Les autres ne peuvent donc pas deviner qui possède le talent utile.

Le joueur concerné peut :

- utiliser son talent ;
- le conserver pour une autre occasion ;
- choisir discrètement une cible lorsque le talent le demande.

Aucune liste publique des talents n’est disponible pendant la partie.

### Gameplay à zéro vie

Un joueur à zéro vie n’est plus éliminé. Il reçoit un parcours secret adapté à la situation :

- Survivant isolé ;
- Disparu dans la jungle ;
- Prisonnier de la station ;
- Contaminé ;
- Protecteur dans l’ombre.

Une fois par chapitre, il peut notamment :

- envoyer un signe ;
- guider ou égarer le groupe ;
- transmettre une preuve ;
- déverrouiller un mécanisme ;
- protéger quelqu’un ;
- saboter discrètement ;
- préparer son retour.

Deux actions de retour réussies permettent de rejoindre le groupe avec une vie.

### Audio assagi

- volume par défaut abaissé ;
- ambiances de fond très discrètes ;
- suppression des sons aléatoires répétitifs ;
- effets ponctuels associés aux événements exacts ;
- explosion pour les caisses en flammes ;
- effondrement pour le fuselage et la station ;
- radio, vague, tonnerre, générateur, alarme et fusée selon les scènes.

L’audio reste procédural et ne dépend d’aucun fichier ou service externe. Il peut être coupé entièrement ou séparément dans les réglages.

## Contenu de l’aventure

- 7 chapitres ;
- 40 événements possibles ;
- 12 scènes exclusives liées aux embranchements ;
- discussions orales ;
- chronos avec conséquences en cas d’inaction ;
- promesses publiques ;
- trahisons ciblées ;
- objectifs personnels secrets ;
- 8 issues principales ;
- sauvegarde locale automatique ;
- compatibilité avec les anciennes sauvegardes.

## Test local

Aucune installation n’est nécessaire pour jouer.

```bash
python -m http.server 4173
```

Puis ouvrir :

```text
http://localhost:4173
```

Vérifications techniques :

```bash
npm run check
npm test
```

## Mise à jour GitHub

1. Décompresser le ZIP.
2. Ouvrir le dépôt `derniere-issue`.
3. Cliquer sur **Add file > Upload files**.
4. Importer tout le contenu du dossier à la racine.
5. Remplacer les fichiers existants.
6. Valider avec **Commit changes**.

GitHub Pages republiera automatiquement la version depuis la branche `main`.
