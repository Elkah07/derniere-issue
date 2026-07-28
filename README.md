# Dernière Issue · V0.5 sociale et à embranchements

Application d’aventures narratives de survie sociale pour **2 à 8 joueurs**.

**Première aventure complète : Le Crash.**

## Nouveautés de la V0.5

- Phases de **discussion orale** intégrées à 27 scènes
- Chronos de discussion et de décision
- Conséquences spécifiques lorsque le temps expire
- Réglage permettant de désactiver les chronos pour l’accessibilité
- Promesses publiques enregistrées avant certains choix secrets
- Promesses tenues ou brisées avec impact sur la cohésion et la confiance
- Relations de confiance suivies entre chaque paire de joueurs
- Journal des trahisons ciblées
- Les joueurs les plus trahis ou les moins fiables peuvent perdre la priorité lors d’une évacuation limitée
- **12 scènes exclusives** injectées selon les choix importants
- Le choix du camp, de l’expédition, du jugement et du générateur ouvre réellement des chemins différents
- Certaines branches retirent totalement des scènes communes devenues inutiles
- Des actions permettent de voler un joueur précis, l’envoyer sur une fausse piste, contaminer sa gourde, fabriquer une preuve contre lui ou réserver une place à son détriment
- Bilan final enrichi avec les promesses brisées, les trahisons, les décisions expirées et le chemin réellement suivi

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
- Migration des sauvegardes V0.3 et V0.4 vers la V0.5

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
