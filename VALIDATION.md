## Validation V0.7

# Validation V0.5.1

- Version : 0.5.1
- 40 événements enregistrés
- 12 événements de branche exclusifs
- 27 scènes avec discussion orale chronométrée
- 32 scènes avec délai de décision
- 7 scènes avec promesses publiques vérifiables
- 7 événements comportant des choix ciblant un autre joueur
- Matrice de confiance entre tous les joueurs
- Journal des trahisons et des promesses
- Migration automatique des sauvegardes antérieures
- **8 fins sur 8 atteignables par un parcours complet reproductible**
- **32 tests automatisés validés**
- 45 simulations aléatoires complètes sans blocage
- 9 simulations supplémentaires où tous les chronos expirent
- 54 simulations générales complètes, auxquelles s’ajoutent 8 parcours dédiés aux fins

## Issues auditées

- Tout le monde rentre
- À deux jusqu’au bout
- Le prix du siège
- Le dernier survivant
- Ceux qui restent
- Le faux sauvetage
- L’île garde son secret
- Personne ne repart vraiment

Chaque issue possède désormais un test qui joue une partie entière depuis le crash jusqu’à la dernière vague. Les tests ne modifient pas directement la fin et passent par les choix, les branches, les routes et les conséquences normales du moteur.

## Corrections apportées pendant l’audit

- La fin **À deux jusqu’au bout** est refusée lorsqu’un des deux joueurs a réellement trahi l’autre pendant la partie.
- Le choix **Attendre une fréquence officielle** empêche désormais le faux sauvetage de se déclencher automatiquement.
- La fin **Ceux qui restent** exige que le groupe ait réellement choisi de rester. L’échec forcé d’une autre route mène à une autre issue.
- La route initialement demandée et la route finalement utilisée sont toutes deux conservées dans l’issue pour faciliter les futurs bilans narratifs.

## Cas couverts par les autres tests

- parties de 2, 4 et 8 joueurs
- durées courte, normale et longue
- absence de saboteur imposé en duo
- ouverture des branches liées au camp et à l’expédition
- suppression d’événements communs lorsqu’une branche les contourne
- promesse brisée enregistrée comme trahison
- modification de la confiance entre deux joueurs
- trahison ciblée avec perte de vie et état narratif
- conséquence automatique en cas d’inaction
- toutes les durées atteignent une issue
- anciennes sauvegardes reprises correctement
- introductions, événements, conséquences et épilogues immersifs

## Commandes de validation

```bash
npm run check
npm test
```
