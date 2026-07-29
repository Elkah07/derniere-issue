# Intégration dans Dernière Issue

Ce pack contient le contenu complet de **Dossier Classé**, mais ne modifie pas encore le moteur actif de `Dernière Issue`.

## Pourquoi le module reste séparé

Le moteur actuel de la V0.8.1 contient encore plusieurs règles codées spécifiquement pour **Le Crash** : Nora, les jauges Réserves/Refuge/Signal/Danger, les objets de l’île et les routes d’évacuation. L’intégrer directement sans refactorisation créerait deux moteurs parallèles fragiles.

## Étape technique recommandée

1. Extraire une interface générique `AdventureDefinition`.
2. Déplacer les règles propres au Crash dans `adventures/le-crash/`.
3. Charger les jauges, chapitres, événements, talents, effets et issues depuis le module actif.
4. Ajouter `adventures/dossier-classe/dossierClasse.js`.
5. Faire apparaître la carte Aventure 02 comme jouable uniquement après les tests de non-régression.

## Fichiers fournis

- `dossier-classe.json` : contenu portable et lisible par des outils.
- `src/dossierClasse.js` : export JavaScript prêt pour l’application.
- `DOSSIER-CLASSE-COMPLET.md` : bible narrative complète.
- `ARBRE-NARRATIF.md` : vue des grandes bifurcations.
- `test/validate.mjs` : contrôle de structure.
- `preview.html` : aperçu du contenu dans un navigateur.

## Contrat de données minimal

Chaque événement contient un identifiant unique, un chapitre, un mode de décision, une scène, un prompt, des choix, un chrono éventuel et une conséquence d’inaction. Les effets sont décrits de manière déclarative et devront être traduits par le moteur générique.
