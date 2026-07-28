# Dernière Issue · V0.6 ambiance dynamique

Application d’aventures narratives de survie sociale pour **2 à 8 joueurs**.

**Première aventure complète : Le Crash.**

## Nouveautés de la V0.6

- Ambiances de fond générées en temps réel, sans fichier audio externe
- Univers sonore différent pour chaque chapitre
- Ambiance spécifique au camp choisi : plage, fuselage ou jungle
- Feu, craquements, vagues, vent, insectes, pluie, tonnerre, radio et bourdonnement de la station
- Épilogue sonore plus lumineux ou plus sombre selon l’issue obtenue
- Effets pour les briefings, choix, révélations, conséquences et transitions de chapitre
- Sons de compte à rebours pendant les cinq dernières secondes
- Alerte sonore lorsque le temps expire
- Réglages séparés pour l’ambiance, les effets et le volume général
- Bouton flottant pour couper ou réactiver rapidement les sons
- Fonctionnement intégralement hors ligne grâce à la Web Audio API
- Toute la V0.5.1 reste présente : embranchements, discussions, trahisons et huit fins auditées

Le détail de l’univers sonore est disponible dans :

```text
AUDIO.md
```

## Structure narrative

Le moteur contient maintenant **40 événements**, dont :

- 21 événements principaux historiques
- 7 imprévus de partie longue
- 12 événements de branche exclusifs

Une partie ne joue jamais les 40 événements. Elle construit sa propre séquence selon les décisions prises.

### Grandes bifurcations

1. **Lieu du camp**
   - plage : marée, signal au large et caisse dérivante
   - fuselage : incendie, cockpit et cargaison
   - jungle : source secrète, réserves cachées et sabotage possible

2. **Organisation de l’expédition**
   - groupe réuni : camp attaqué puis faille
   - groupe séparé : cache secrète, vols et fausses pistes
   - éclaireur seul : tunnel révélé, caché ou détruit

3. **Jugement**
   - innocent accusé : occasion de pardon ou de vengeance
   - saboteur identifié : aveu, fausse preuve ou sabotage d’urgence
   - aucun verdict : trêve fragile et autorité temporaire

4. **Systèmes de la station**
   - balise : réponse ambiguë et choix de transmission
   - hangar : capacité réelle, places réservées et sabotage possible
   - médical : soin, protection ou révélation d’une contamination

## Contenu général

- 7 chapitres jouables du crash à l’évacuation
- 3 durées : courte, normale et longue
- Briefings secrets en passe-et-joue
- Intrigues : accident, cargaison, opportuniste ou saboteur
- Aucun saboteur imposé à deux joueurs
- 8 capacités utilisables une fois par partie
- 3 vies par joueur, états et inventaires personnels
- Jauges Réserves, Refuge, Signal, Danger et Cohésion
- Nora, la mallette grise, la boîte noire et la station souterraine
- Routes d’évacuation débloquées par les décisions précédentes
- 8 issues principales
- Épilogues dynamiques et révélation finale
- Sauvegarde automatique dans le navigateur
- Migration des sauvegardes antérieures vers la V0.6

L’arbre conceptuel initial reste disponible dans :

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
2. Dans `derniere-issue`, cliquez sur **Add file > Upload files**.
3. Importez tout le contenu du dossier à la racine.
4. Acceptez le remplacement des fichiers existants.
5. Validez avec **Commit changes**.

GitHub Pages étant configuré sur `main` et `/(root)`, la version sera republiée automatiquement.

## Firebase

Firebase n’est pas nécessaire pour ce mode passe-et-joue sur un seul appareil. Il deviendra utile pour les salles en ligne, un téléphone par joueur, la synchronisation en direct et les comptes.

## Audit des issues

Le détail des conditions, des parcours validés et des corrections se trouve dans :

```text
AUDIT-FINS.md
```
