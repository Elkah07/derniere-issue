# Validation V0.5

- Version : 0.5.0
- 40 événements enregistrés
- 12 événements de branche exclusifs
- 27 scènes avec discussion orale chronométrée
- 32 scènes avec délai de décision
- 7 scènes avec promesses publiques vérifiables
- 7 événements comportant des choix ciblant un autre joueur
- Matrice de confiance entre tous les joueurs
- Journal des trahisons et des promesses
- Migration automatique des sauvegardes antérieures
- 21 tests automatisés validés
- 45 simulations aléatoires complètes sans blocage
- 9 simulations supplémentaires où tous les chronos expirent
- 54 parties complètes simulées au total

## Cas couverts par les tests

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

## Commandes de validation

```bash
npm run check
npm test
```
