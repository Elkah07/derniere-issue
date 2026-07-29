# Dernière Issue · V0.8.1 pré-test

Application d’aventures narratives de survie sociale pour **2 à 8 joueurs**. Première aventure : **Le Crash**.

## Corrections pré-test

### Confidentialité
- Les objets personnels ne sont plus nommés sur l’écran public.
- Les fiches publiques indiquent uniquement le nombre d’objets privés.
- Un écran neutre **Dossiers privés** permet à chaque joueur de consulter son inventaire, son talent, son objectif et ses rappels secrets en passe-et-joue.
- L’inventaire personnel apparaît également pendant le choix privé du joueur.
- Après chaque choix privé, un écran demande de masquer le téléphone avant de continuer.

### Cohésion et conséquences secrètes
- La valeur numérique de cohésion n’est plus affichée.
- Elle est remplacée par : Groupe soudé, Confiance solide, Confiance fragile, Tensions visibles ou Au bord de la rupture.
- Les variations exactes de cohésion sont retirées des résumés publics.
- Les actions secrètes peuvent posséder un résumé public distinct de leur véritable conséquence.
- Les sabotages, vols et actions cachées ne sont plus systématiquement annoncés dès leur exécution.

### Sécurité d’utilisation
- Les décisions graves demandent une confirmation.
- Les chronos peuvent être mis en pause et repris.
- Une phase de choix interrompue est sauvegardée localement et reprise avec le chrono en pause.
- Le bouton Retour du téléphone ramène vers un écran sûr de l’application au lieu de la quitter brutalement.
- Un rapport JSON complet de la partie peut être exporté depuis les réglages ou l’écran final.

### Fonctionnalités auparavant trompeuses
- Le sélecteur Famille / Tout public / Adultes a été retiré : il ne modifiait pas réellement le scénario.
- Il pourra revenir plus tard avec de vraies variantes éditoriales.

### Installation et hors ligne
- Manifest PWA et icônes 192/512 ajoutés.
- Service worker avec cache hors ligne ajouté.
- L’application peut être installée depuis le navigateur après le premier chargement en ligne.

## Contenu conservé
- 7 chapitres
- 40 événements, dont 12 scènes exclusives de branche
- 8 fins atteignables
- discussions orales, chronos et promesses
- trahisons ciblées
- talents secrets contextuels
- gameplay actif à zéro vie
- sauvegarde automatique
- audio et animations désactivables

## Tester localement

```bash
python -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

Vérifications :

```bash
npm run check
npm test
```

## Mise à jour GitHub

Décompresser le ZIP puis importer tout le contenu à la racine du dépôt avec **Add file > Upload files**. GitHub Pages republiera automatiquement la branche `main`.

Firebase n’est toujours pas nécessaire pour le mode passe-et-joue sur un seul appareil.
