# Audit des fins de Le Crash

Cet audit vérifie que les huit fins ne sont pas seulement présentes dans le code, mais qu’elles peuvent être atteintes après une partie complète et cohérente.

## 1. Tout le monde rentre

**Condition principale :** tous les survivants actifs quittent l’île par une route valide, sans qu’une fin liée au secret ou au faux sauvetage ne prenne le dessus.

**Parcours validé :** camp dans la jungle, expédition séparée, hangar maritime activé, capacité du bateau augmentée, puis embarquement de tous les survivants.

## 2. À deux jusqu’au bout

**Condition principale :** partie à deux, les deux joueurs quittent l’île, leurs derniers choix consistent à attendre ou donner leur place, et aucune trahison ciblée n’a eu lieu entre eux.

**Parcours validé :** refuge dans le fuselage, progression collective, radeau disponible, puis les deux joueurs attendent l’autre jusqu’au départ.

## 3. Le prix du siège

**Condition principale :** au moins deux survivants partent, mais la capacité disponible ne permet pas à tous les survivants actifs de quitter l’île.

**Parcours validé :** hangar ouvert, capsule secrète récupérée, places réservées et capacité insuffisante au moment de l’embarquement.

## 4. Le dernier survivant

**Condition principale :** une seule personne obtient une place sur une route d’évacuation valide.

**Parcours validé :** embarcation ouverte, capacité réduite par les choix précédents et priorité accordée à une seule personne.

## 5. Ceux qui restent

**Condition principale :** le groupe choisit réellement de rester et dispose d’un refuge et de réserves suffisants pour tenir après la tempête.

**Parcours validé :** ressources conservées, refuge renforcé, décision finale de rester sur l’île.

## 6. Le faux sauvetage

**Condition principale :** évacuation aérienne, intrigue liée à la cargaison ou au sabotage, preuves encore exploitables et absence d’attente d’une fréquence officielle.

**Parcours validé :** Nora sauvée, code connu, balise activée, transmission immédiate, puis arrivée de l’équipe liée à la station.

## 7. L’île garde son secret

**Condition principale :** au moins une personne s’échappe alors que les preuves ont été cachées ou détruites.

**Parcours validé :** boîte noire récupérée, dossier caché, départ en radeau avec la vérité gardée par une seule personne.

## 8. Personne ne repart vraiment

**Condition principale :** aucune personne ne quitte l’île et le groupe ne remplit pas les conditions d’une installation volontaire viable.

**Parcours validé :** ressources épuisées, route finale insuffisante et aucune solution secondaire exploitable.

## Cohérence corrigée

Trois incohérences ont été détectées et corrigées :

1. Une trahison entre les deux joueurs pouvait auparavant déboucher malgré tout sur **À deux jusqu’au bout**.
2. Le groupe pouvait attendre une fréquence officielle puis subir automatiquement **Le faux sauvetage**.
3. L’échec forcé d’une évacuation pouvait être présenté comme le choix volontaire **Ceux qui restent**.

## Couverture automatique

Le fichier `test/endingReachability.test.js` contient :

- huit parties complètes, une par fin ;
- un contrôle spécifique de loyauté pour la fin duo ;
- un contrôle de la fréquence officielle ;
- un contrôle de la différence entre rester volontairement et échouer à partir.
