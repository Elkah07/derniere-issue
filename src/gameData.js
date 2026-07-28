export const chapters = {
  1: {
    title: "L’impact",
    icon: '✈️',
    intro: "Le fuselage vient de s’immobiliser entre les arbres. Le feu progresse, les blessés appellent et chaque seconde compte.",
  },
  2: {
    title: 'Le premier camp',
    icon: '⛺',
    intro: "Le soleil se lève sur une île absente des cartes. Il faut trouver de l’eau, un refuge et comprendre ce que l’avion transportait.",
  },
  3: {
    title: 'La première nuit',
    icon: '🌒',
    intro: "La forêt se tait. Les réserves diminuent et les premiers soupçons s’installent autour du feu.",
  },
  4: {
    title: "L’exploration",
    icon: '🧭',
    intro: "Une structure métallique dépasse des arbres. Pour l’atteindre, il faudra quitter le camp et accepter de ne pas tout contrôler.",
  },
  5: {
    title: 'Le doute',
    icon: '👁️',
    intro: "Le câble de la radio a été sectionné. Accident, animal ou sabotage : les versions commencent à se fissurer.",
  },
  6: {
    title: "Le cœur de l’île",
    icon: '⚙️',
    intro: "La carte conduit à une station enfouie dans la roche. Ses systèmes peuvent encore fonctionner, mais pas tous.",
  },
  7: {
    title: "L’évacuation",
    icon: '🚁',
    intro: "La tempête recouvre l’île. Il ne reste plus assez de temps pour essayer plusieurs solutions.",
  },
};

export const abilities = [
  { id: 'doctor', title: 'Médecin', icon: '🩺', description: 'Rend une vie ou retire l’état Blessé à un joueur.', target: true },
  { id: 'protector', title: 'Protecteur', icon: '🛡️', description: 'Protège un joueur contre sa prochaine perte de vie.', target: true },
  { id: 'tinkerer', title: 'Bricoleur', icon: '🔧', description: 'Crée une réparation utilisable sur un appareil ou lors de l’évacuation.' },
  { id: 'scout', title: 'Éclaireur', icon: '🧭', description: 'Révèle un indice fiable sur le prochain événement.' },
  { id: 'observer', title: 'Observateur', icon: '🔍', description: 'Ajoute une preuve fiable au moment du jugement.' },
  { id: 'negotiator', title: 'Négociateur', icon: '🤝', description: 'Renforce immédiatement la cohésion du groupe.' },
  { id: 'enduring', title: 'Endurant', icon: '🪨', description: 'Ignore la prochaine perte de vie liée à l’environnement.' },
  { id: 'lucky', title: 'Chanceux', icon: '🍀', description: 'Annule la prochaine conséquence personnelle négative.' },
];

export const plots = {
  accident: {
    title: "L’accident",
    truth: "Une ancienne balise de l’île a perturbé les instruments. Aucun joueur n’a provoqué le crash.",
  },
  cargo: {
    title: 'La cargaison',
    truth: "Le pilote avait reçu l’ordre de survoler l’île pour livrer une mallette liée à la station.",
  },
  opportunist: {
    title: "L’opportuniste",
    truth: "Une personne du groupe a compris que les preuves pouvaient valoir plus cher que le sauvetage lui-même.",
  },
  saboteur: {
    title: 'Le sabotage',
    truth: "Une action volontaire a désactivé une partie du système de navigation avant l’impact.",
  },
};

const c = (id, label, icon, description, extra = {}) => ({ id, label, icon, description, ...extra });

export const events = [
  {
    id: 'impact_escape', chapter: 1, number: 1, essential: true, mode: 'privateEach', title: "Sortir de l’épave",
    narrative: "Une odeur de carburant envahit la cabine. Le feu progresse et les blessés appellent à l’aide.",
    prompt: 'Que fais-tu dans les premières secondes ?',
    choices: [
      c('help', 'Aider les blessés', '🤝', 'Tu privilégies les autres, au risque de rester plus longtemps.'),
      c('exit', 'Sécuriser une sortie', '🚪', 'Tu cherches une issue praticable pour tout le monde.'),
      c('search', 'Fouiller les bagages', '🎒', 'Tu récupères peut-être un objet avant que le feu gagne.'),
    ],
  },
  {
    id: 'burning_crates', chapter: 1, number: 2, mode: 'privateEach', title: 'Les caisses en flammes',
    narrative: "Le feu atteint la soute. Le groupe ne pourra sauver que deux catégories de matériel.",
    prompt: 'Quelle caisse essaies-tu de sauver ?',
    choices: [
      c('provisions', 'Provisions', '🥫', 'Eau et nourriture pour plusieurs jours.'),
      c('medical', 'Matériel médical', '🩹', 'Une trousse de secours et des antidouleurs.'),
      c('communication', 'Communication', '📻', 'Une radio endommagée et du matériel de signalement.'),
      c('equipment', 'Équipement', '🪢', 'Une corde, une lampe et quelques outils.'),
    ],
  },
  {
    id: 'save_nora', chapter: 1, number: 3, essential: true, mode: 'group', title: 'Nora',
    narrative: "Une hôtesse de bord est coincée sous le fuselage. Le feu se rapproche.",
    prompt: 'Le groupe doit prendre une décision.',
    choices: [
      c('save', 'La sauver ensemble', '🛟', 'Vous unissez vos forces et prenez du retard.'),
      c('solo', 'Un volontaire reste', '❤️‍🔥', 'Une personne perdra une vie pour la libérer.', { requiresActor: true, actorLabel: 'Qui se porte volontaire ?' }),
      c('abandon', 'L’abandonner', '🌫️', 'Vous fuyez immédiatement, mais ce choix laissera une trace.'),
    ],
  },
  {
    id: 'choose_shelter', chapter: 2, number: 4, essential: true, mode: 'group', title: 'Choisir le refuge',
    narrative: "La mer est agitée et le fuselage brûle encore. Il faut décider où passer la nuit.",
    prompt: 'Où installez-vous le camp ?',
    choices: [
      c('beach', 'La plage', '🏖️', 'Plus visible pour les secours, mais exposée aux tempêtes.'),
      c('fuselage', 'Le fuselage', '✈️', 'Protection immédiate, au risque de rester près du feu.'),
      c('jungle', 'La lisière de la jungle', '🌴', 'Ressources proches, visibilité faible et animaux.'),
    ],
  },
  {
    id: 'camp_tasks', chapter: 2, number: 5, mode: 'privateEach', title: 'Les trois tâches',
    narrative: "Le groupe doit chercher de l’eau, construire et retourner dans l’épave. Tout ne sera pas fait correctement.",
    prompt: 'Quelle mission choisis-tu ?',
    choices: [
      c('water', 'Chercher de l’eau', '💧', 'Augmente les réserves si la mission réussit.'),
      c('build', 'Construire le refuge', '🔨', 'Renforce la protection du camp.'),
      c('wreck', "Explorer l’épave", '🔦', 'Permet de trouver un objet, mais l’endroit reste dangereux.'),
    ],
  },
  {
    id: 'grey_case', chapter: 2, number: 6, essential: true, mode: 'privateOne', actorRule: 'briefcaseFinder', title: 'La mallette grise',
    narrative: "Derrière un siège arraché, une mallette métallique porte le même symbole que la radio.",
    prompt: 'Que fais-tu de cette découverte ?',
    choices: [
      c('show', 'La montrer au groupe', '👥', 'La mallette devient une ressource commune.'),
      c('hide', 'La cacher', '🕶️', 'Tu la gardes secrètement dans ton inventaire.'),
      c('open', 'Tenter de l’ouvrir', '🔓', 'Un outil, une clé ou l’aide de Nora facilitera l’ouverture.'),
    ],
  },
  {
    id: 'rations', chapter: 3, number: 7, essential: true, mode: 'privateEach', title: 'Le partage des rations',
    narrative: "Les provisions sont maigres. Chacun doit décider ce qu’il prend pendant que les autres détournent les yeux.",
    prompt: 'Que fais-tu ?',
    choices: [
      c('share', 'Partager équitablement', '🥣', 'Tu acceptes une portion plus petite pour préserver le groupe.'),
      c('own', 'Prendre seulement ta part', '🍞', 'Tu ne donnes rien, mais tu ne voles rien.'),
      c('extra', 'Prendre une ration supplémentaire', '🤫', 'Tu te renforces au prix des réserves communes.'),
    ],
  },
  {
    id: 'missing_resource', chapter: 3, number: 8, mode: 'group', title: 'Quelque chose a disparu',
    narrative: "Au matin, une ressource manque. Un sac a été déplacé et personne ne donne la même version.",
    prompt: 'Comment réagit le groupe ?',
    choices: [
      c('search', 'Fouiller tous les sacs', '🔎', 'Les objets cachés peuvent être révélés, mais la confiance chute.'),
      c('interrogate', 'Interroger une personne', '🗣️', 'Vous exigez une explication sans tout fouiller.'),
      c('ignore', 'Ne rien faire', '🤐', 'Vous préservez la paix, mais un voleur conserve son avantage.'),
    ],
  },
  {
    id: 'radio_voice', chapter: 3, number: 9, essential: true, mode: 'group', title: 'La voix dans la radio',
    narrative: "La radio grésille : « Vol 714… ne suivez pas… la lumière… le signal n’est pas… » Puis le silence.",
    prompt: 'Que faites-vous ?',
    choices: [
      c('answer', 'Répondre immédiatement', '📡', 'Le signal augmente, mais quelque chose peut vous localiser.'),
      c('listen', 'Écouter sans répondre', '🎧', 'Une seule personne recevra un fragment du message.'),
      c('destroy', 'Détruire la radio', '🔨', 'Vous réduisez le danger, mais perdez un moyen d’appeler les secours.'),
    ],
  },
  {
    id: 'expedition', chapter: 4, number: 10, essential: true, mode: 'group', title: 'Former l’expédition',
    narrative: "Une colonne métallique dépasse des arbres. Une grande équipe sera plus sûre, mais laissera le camp sans défense.",
    prompt: 'Comment partez-vous ?',
    choices: [
      c('together', 'Partir tous ensemble', '👣', 'Le trajet sera plus sûr, mais le camp restera vide.'),
      c('split', 'Se séparer', '↔️', 'Une partie explore pendant que l’autre protège les réserves.'),
      c('small', 'Envoyer un éclaireur', '🧭', 'Une seule personne prend le risque.', { requiresActor: true, actorLabel: 'Qui part en éclaireur ?' }),
    ],
  },
  {
    id: 'ravine', chapter: 4, number: 11, mode: 'group', title: 'La faille',
    narrative: "Une profonde faille coupe le chemin. De l’autre côté, une porte métallique apparaît entre les lianes.",
    prompt: 'Comment traversez-vous ?',
    choices: [
      c('rope', 'Utiliser la corde', '🪢', 'Passage sûr, mais la corde sera consommée.'),
      c('bridge', 'Construire une passerelle', '🪵', 'Vous utilisez une partie des matériaux du refuge.'),
      c('solo', 'Faire traverser une personne', '🧗', 'Une personne obtient seule ce qui se trouve derrière.', { requiresActor: true, actorLabel: 'Qui traverse seul ?' }),
      c('turnback', 'Faire demi-tour', '↩️', 'Personne ne se blesse, mais le signal ne progressera pas ici.'),
    ],
  },
  {
    id: 'outpost', chapter: 4, number: 12, essential: true, mode: 'privateEach', title: "L’avant-poste",
    narrative: "Le générateur ne tiendra que quelques minutes. Chacun se précipite vers une salle.",
    prompt: 'Quelle salle explores-tu ?',
    choices: [
      c('communications', 'Salle des communications', '📡', 'Une batterie et du matériel de signalement.'),
      c('infirmary', 'Infirmerie', '🩺', 'Des soins pour les blessés.'),
      c('archives', 'Archives', '🗺️', 'Une carte de l’île et une carte d’accès.'),
    ],
  },
  {
    id: 'clues', chapter: 5, number: 13, mode: 'privateEach', title: 'Les indices',
    narrative: "Le câble de la radio est sectionné. Chaque personne remarque un détail différent autour du camp.",
    prompt: 'Que fais-tu de ton indice ?',
    choices: [
      c('reveal', 'Le révéler fidèlement', '💬', 'Tu donnes au groupe ce que tu as réellement observé.'),
      c('hide', 'Le garder pour toi', '🤐', 'Tu conserves un avantage pour la suite.'),
      c('distort', 'Modifier légèrement ton récit', '🎭', 'Tu influences les soupçons sans mentir totalement.'),
    ],
  },
  {
    id: 'judgment', chapter: 5, number: 14, essential: true, mode: 'privateEach', title: 'Le jugement',
    narrative: "Le groupe doit décider s’il existe réellement un responsable. Les regards se croisent.",
    prompt: 'Quelle est ta position ?',
    choices: [
      c('accuse', 'Accuser quelqu’un', '⚖️', 'Tu désignes une personne comme responsable.', { requiresTarget: true, targetLabel: 'Qui accuses-tu ?' }),
      c('accident', 'Déclarer que c’est un accident', '🧩', 'Tu refuses de condamner quelqu’un sans preuve.'),
      c('refuse', 'Refuser de participer', '🚫', 'Tu ne donnes aucun nom et quittes la discussion.'),
    ],
  },
  {
    id: 'storm', chapter: 5, number: 15, essential: true, mode: 'privateEach', title: 'La tempête',
    narrative: "Une tempête approche. Pendant que le groupe organise le camp, chacun peut aussi penser à sa propre survie.",
    prompt: 'Que choisis-tu de faire ?',
    choices: [
      c('reinforce', 'Renforcer le refuge', '⛺', 'Tu consacres tes forces à protéger le camp.'),
      c('radio', 'Protéger la radio', '📻', 'Tu t’assures que le signal survive à la pluie.'),
      c('move', "Quitter le camp", '🏃', 'Tu pousses le groupe vers l’avant-poste.'),
      c('capsule', 'Prendre une capsule en secret', '🛟', 'Tu sécurises une place personnelle, au détriment de la capacité collective.'),
    ],
  },
  {
    id: 'generator', chapter: 6, number: 16, essential: true, mode: 'group', title: 'Le générateur',
    narrative: "Trois systèmes attendent de l’énergie. Sans batterie, un seul peut être activé.",
    prompt: 'Quel système alimentez-vous ?',
    choices: [
      c('beacon', 'La balise de secours', '📡', 'Signal +2 et possibilité de sauvetage aérien.'),
      c('boat', 'Le hangar maritime', '🚤', 'Débloque une embarcation d’urgence.'),
      c('medical', 'Le système médical', '❤️', 'Soigne l’ensemble du groupe.'),
      c('beacon_boat', 'Balise + hangar', '🔋', 'La batterie permet d’activer deux systèmes.', { requiresBattery: true }),
      c('beacon_medical', 'Balise + soins', '🔋', 'La batterie permet d’activer deux systèmes.', { requiresBattery: true }),
      c('boat_medical', 'Hangar + soins', '🔋', 'La batterie permet d’activer deux systèmes.', { requiresBattery: true }),
    ],
  },
  {
    id: 'black_dossier', chapter: 6, number: 17, mode: 'privateOne', actorRule: 'evidenceHolder', title: 'Le dossier noir',
    narrative: "Le module de la boîte noire s’insère dans l’ordinateur. Les fichiers peuvent révéler pourquoi l’avion se trouvait ici.",
    prompt: 'Que fais-tu de la vérité ?',
    choices: [
      c('reveal', 'Tout révéler', '📂', 'Le groupe découvre ce que contient le dossier.'),
      c('hide', 'Cacher les preuves', '🕶️', 'Tu conserves la vérité pour toi.'),
      c('destroy', 'Détruire le dossier', '🔥', 'La preuve disparaît et certains dangers s’éloignent.'),
    ],
  },
  {
    id: 'trapped', chapter: 6, number: 18, essential: true, mode: 'group', title: 'La personne piégée',
    narrative: "La station s’effondre. Une personne reste prisonnière sous une poutre tandis que l’alarme hurle.",
    prompt: 'Que fait le groupe ?',
    choices: [
      c('rescue', 'Organiser un sauvetage', '🧯', 'Vous perdez du temps et augmentez le danger.'),
      c('continue', 'Poursuivre sans attendre', '🚪', 'La route est plus facile, mais quelqu’un reste derrière.'),
      c('sacrifice', 'Se sacrifier pour la libérer', '❤️‍🔥', 'Une personne perd une vie pour réussir immédiatement.', { requiresActor: true, actorLabel: 'Qui prend le risque ?' }),
    ],
  },
  {
    id: 'escape_route', chapter: 7, number: 19, essential: true, mode: 'group', title: 'Les routes disponibles',
    narrative: "La station tremble. L’application ne montre que les solutions encore réellement accessibles.",
    prompt: 'Quelle route choisissez-vous ?',
    choices: [
      c('air', 'Le sauvetage aérien', '🚁', 'Nécessite la balise, le code et un signal suffisant.', { route: true }),
      c('boat', "L’embarcation", '🚤', 'Nécessite le hangar et du carburant ou des réserves.', { route: true }),
      c('shelter', 'Attendre dans le refuge', '⛺', 'Nécessite un refuge solide et des réserves.', { route: true }),
      c('raft', "Le radeau d’urgence", '🛶', 'Nécessite une corde ou du matériel. Deux places maximum.', { route: true }),
      c('stay', 'Rester ensemble sur l’île', '🔥', 'Vous renoncez au départ immédiat et protégez le groupe.', { route: true }),
    ],
  },
  {
    id: 'final_choice', chapter: 7, number: 20, essential: true, mode: 'privateEach', title: 'Le dernier choix',
    narrative: "Au moment d’embarquer, chacun reçoit une dernière possibilité. Personne ne verra le choix des autres avant qu’il ne soit trop tard.",
    prompt: 'Que fais-tu ?',
    choices: [
      c('wait', 'Attendre tout le monde', '🤝', 'Tu refuses de partir sans le groupe.'),
      c('board', 'Embarquer immédiatement', '🏃', 'Tu t’assures une place avant les autres.'),
      c('give', 'Donner ta place', '🎟️', 'Tu désignes une personne à sauver en priorité.', { requiresTarget: true, targetLabel: 'À qui donnes-tu ta place ?' }),
      c('proof', 'Prendre la preuve', '💼', 'Tu emportes le dossier, même si cela ralentit le départ.'),
      c('sabotage', 'Faire échouer le départ', '✂️', 'Cette option n’apparaît que pour le saboteur.', { saboteurOnly: true }),
    ],
  },
  {
    id: 'last_wave', chapter: 7, number: 21, essential: true, mode: 'group', title: 'La dernière vague',
    narrative: "La mer frappe la côte et les structures cèdent. Le niveau de danger décide maintenant du prix à payer.",
    prompt: 'Comment affrontez-vous le dernier obstacle ?',
    choices: [
      c('together', 'Rester groupés', '🫂', 'Vous refusez de laisser une personne seule.'),
      c('lighten', 'Abandonner le matériel', '🎒', 'Vous perdez des objets pour gagner du temps.'),
      c('volunteer', 'Un volontaire tient le passage', '🧱', 'Une personne prend le risque pour sécuriser le départ.', { requiresActor: true, actorLabel: 'Qui tient le passage ?' }),
    ],
  },

  // Événements exclusifs injectés par le moteur selon les décisions majeures.
  {
    id: 'shelter_beach_tide', chapter: 2, number: '4A', branch: true, mode: 'group', title: 'La marée monte',
    narrative: "Le camp de plage offre une vue dégagée sur l’horizon, mais l’eau gagne déjà plusieurs mètres. Au large, une lueur apparaît entre deux vagues tandis qu’une caisse détachée de l’épave dérive vers les rochers.",
    prompt: 'Vous ne pourrez sauver qu’une seule opportunité avant que la marée n’engloutisse le camp.',
    choices: [
      c('signal', 'Allumer un feu de signal', '🔥', 'Vous misez sur la lueur au large et rendez votre position visible.'),
      c('crate', 'Récupérer la caisse', '📦', 'Deux personnes affrontent le courant pour sauver du matériel.'),
      c('move', 'Déplacer le camp en hauteur', '🏃', 'Vous abandonnez la plage avant que la mer ne vous piège.'),
    ],
  },
  {
    id: 'shelter_fuselage_aftershock', chapter: 2, number: '4B', branch: true, mode: 'group', title: 'Le fuselage se referme',
    narrative: "Un grondement traverse la carcasse. Une partie du plafond s’affaisse, le feu reprend sous les sièges et la porte du cockpit s’entrouvre pendant quelques secondes. Rester ici peut renforcer le camp ou livrer une vérité, mais l’épave devient un piège.",
    prompt: 'Quelle urgence prend le dessus ?',
    choices: [
      c('extinguish', 'Étouffer l’incendie', '🧯', 'Vous sécurisez durablement le refuge.'),
      c('cockpit', 'Forcer le cockpit', '🧭', 'Vous cherchez le journal de bord et la trajectoire du pilote.'),
      c('cargo', 'Fouiller la soute', '🧰', 'Vous tentez de récupérer du matériel avant l’effondrement.'),
    ],
  },
  {
    id: 'shelter_jungle_source', chapter: 2, number: '4C', branch: true, mode: 'privateEach', title: 'La source cachée',
    narrative: "À quelques mètres du camp, une source claire jaillit entre les racines. Elle suffirait à tout le groupe, mais chacun arrive par un sentier différent. Pendant quelques instants, personne ne sait exactement ce que les autres ont trouvé ni ce qu’ils versent dans leurs gourdes.",
    prompt: 'Que fais-tu avant de retourner au camp ?',
    choices: [
      c('share', 'Révéler la source', '💧', 'Tu rapportes l’eau et indiques le chemin au groupe.'),
      c('hide', 'Cacher une réserve personnelle', '🤫', 'Tu remplis une gourde et prétends n’avoir rien trouvé.'),
      c('contaminate', 'Saboter la gourde de quelqu’un', '☠️', 'Tu verses un fruit irritant dans la gourde d’une personne.', { requiresTarget: true, targetLabel: 'Quelle personne vises-tu ?' }),
    ],
  },
  {
    id: 'jungle_ambush', chapter: 4, number: '10A', branch: true, mode: 'group', title: 'Le camp sans défense',
    narrative: "Partis ensemble, vous entendez derrière vous le fracas de caisses renversées. Quelque chose fouille le camp. Devant, la tour métallique n’est plus qu’à quelques centaines de mètres. Faire demi-tour protège les réserves. Continuer peut ouvrir la seule route vers les secours.",
    prompt: 'Le groupe doit choisir immédiatement.',
    choices: [
      c('return', 'Revenir défendre le camp', '↩️', 'Vous sauvez les réserves, mais perdez la piste de la tour.'),
      c('continue', 'Continuer vers la tour', '🗼', 'Vous abandonnez une partie du camp pour atteindre l’installation.'),
      c('decoy', 'Laisser un volontaire faire diversion', '🪤', 'Une personne retourne seule attirer la menace ailleurs.', { requiresActor: true, actorLabel: 'Qui fait diversion ?' }),
    ],
  },
  {
    id: 'split_cache', chapter: 4, number: '10B', branch: true, mode: 'privateEach', title: 'La cache entre les deux chemins',
    narrative: "Les deux équipes découvrent presque au même moment une cache ancienne : nourriture, balises et un plan incomplet. Personne ne voit exactement ce que les autres emportent. Vous pouvez rapporter votre découverte, la garder ou utiliser la séparation pour affaiblir quelqu’un.",
    prompt: 'Que fais-tu avant que les équipes se rejoignent ?',
    choices: [
      c('report', 'Tout rapporter au groupe', '📣', 'Tu partages ce que tu as trouvé.'),
      c('hide', 'Cacher une ration', '🎒', 'Tu gardes une ressource pour toi.'),
      c('steal', 'Voler un objet à quelqu’un', '🫳', 'Tu profites de la séparation pour fouiller un sac.', { requiresTarget: true, targetLabel: 'Qui veux-tu voler ?' }),
      c('misdirect', 'Envoyer quelqu’un sur une fausse piste', '🪧', 'Tu donnes volontairement une mauvaise direction.', { requiresTarget: true, targetLabel: 'Qui veux-tu égarer ?' }),
    ],
  },
  {
    id: 'scout_route', chapter: 4, number: '10C', branch: true, mode: 'privateOne', actorRule: 'expeditionScout', title: 'Seul devant la porte',
    narrative: "L’éclaireur atteint seul une porte de service. Un plan de maintenance indique un tunnel qui contourne la faille. Il peut ramener cette information, la cacher pour garder un avantage, ou condamner le tunnel afin que personne ne puisse suivre le même chemin.",
    prompt: 'Que fais-tu de cette route secrète ?',
    choices: [
      c('reveal', 'Révéler le tunnel', '🗺️', 'Tout le groupe évitera la faille.'),
      c('hide', 'Garder le passage secret', '🔒', 'Tu conserves une route personnelle vers la station.'),
      c('collapse', 'Condamner le tunnel', '💥', 'Tu empêches les autres de l’utiliser et augmentes le danger.'),
    ],
  },
  {
    id: 'revenge_offer', chapter: 5, number: '14A', branch: true, mode: 'privateOne', actorRule: 'falseAccused', title: 'L’offre de revanche',
    narrative: "Isolée à tort, la personne accusée découvre une caisse cachée sous le camp et une carte permettant d’éviter la tempête. Elle peut revenir aider le groupe, exiger réparation ou modifier discrètement la carte avant de la rendre.",
    prompt: 'Que fais-tu de l’avantage que le groupe vient de te donner ?',
    choices: [
      c('forgive', 'Revenir aider le groupe', '🤝', 'Tu partages la carte malgré l’accusation.'),
      c('demand', 'Exiger un objet en réparation', '⚖️', 'Tu ne donnes la carte qu’en échange de l’objet d’une personne.', { requiresTarget: true, targetLabel: 'À qui demandes-tu réparation ?' }),
      c('mislead', 'Falsifier la carte', '🕳️', 'Tu envoies le groupe vers une route plus dangereuse.'),
    ],
  },
  {
    id: 'saboteur_cornered', chapter: 5, number: '14B', branch: true, mode: 'privateOne', actorRule: 'specialPlayer', title: 'Le saboteur acculé',
    narrative: "Les preuves se resserrent autour de la bonne personne. Avant d’être fouillée, elle dispose de quelques secondes seule près de la radio. Elle peut avouer, tenter de désigner un autre responsable ou utiliser sa dernière liberté pour endommager le signal.",
    prompt: 'Comment réagis-tu lorsque le groupe se rapproche de la vérité ?',
    choices: [
      c('confess', 'Avouer et coopérer', '👐', 'Tu révèles une partie du plan et bloques le prochain sabotage.'),
      c('frame', 'Faire porter la faute à quelqu’un', '🎭', 'Tu places une preuve dans le sac d’une personne.', { requiresTarget: true, targetLabel: 'Qui veux-tu faire accuser ?' }),
      c('damage', 'Endommager la radio', '✂️', 'Tu sacrifies une possibilité de sabotage pour réduire le signal.'),
    ],
  },
  {
    id: 'uneasy_truce', chapter: 5, number: '14C', branch: true, mode: 'group', title: 'La trêve fragile',
    narrative: "Aucune majorité ne s’est formée. Le groupe peut enterrer les soupçons, placer toutes les preuves au centre du camp ou confier temporairement la décision à une seule personne. Chaque solution apaise une tension et en crée une autre.",
    prompt: 'Comment continuez-vous malgré le doute ?',
    choices: [
      c('evidence', 'Mettre les preuves en commun', '📂', 'Les secrets utiles deviennent publics.'),
      c('silence', 'Interdire les accusations', '🤐', 'La cohésion remonte, mais un responsable reste libre.'),
      c('leader', 'Nommer un responsable', '🧭', 'Une personne contrôlera la prochaine décision.', { requiresActor: true, actorLabel: 'Qui reçoit cette autorité ?' }),
    ],
  },
  {
    id: 'beacon_reply', chapter: 6, number: '16A', branch: true, mode: 'group', title: 'Quelqu’un répond à la balise',
    narrative: "La balise s’allume et un code d’identification apparaît. Une voix réclame immédiatement le module de la boîte noire avant d’envoyer des secours. Le groupe peut répondre franchement, masquer une partie du signal ou attendre une fréquence officielle.",
    prompt: 'Que transmettez-vous ?',
    choices: [
      c('truth', 'Envoyer le véritable code', '📡', 'Vous maximisez les chances d’être localisés.'),
      c('mask', 'Masquer votre identité', '🎛️', 'Vous protégez les preuves, mais affaiblissez le signal.'),
      c('wait', 'Attendre une autre fréquence', '⏳', 'Vous évitez peut-être un faux sauvetage, au risque de perdre du temps.'),
    ],
  },
  {
    id: 'boat_capacity', chapter: 6, number: '16B', branch: true, mode: 'privateEach', title: 'Les places du hangar',
    narrative: "L’embarcation s’ouvre sur une rangée de sièges étroits. Le panneau indique une capacité inférieure au nombre de survivants, mais certains compartiments peuvent être libérés. Chacun inspecte le bateau séparément et peut réserver une place, aider quelqu’un ou cacher la véritable capacité.",
    prompt: 'Que fais-tu dans le hangar ?',
    choices: [
      c('free', 'Libérer les compartiments', '🔧', 'Tu travailles pour augmenter la capacité collective.'),
      c('reserve', 'Réserver ta place', '🪑', 'Tu marques discrètement un siège pour toi.'),
      c('give', 'Garantir une place à quelqu’un', '🎟️', 'Tu protèges une personne en priorité.', { requiresTarget: true, targetLabel: 'À qui garantis-tu une place ?' }),
      c('sabotage', 'Réduire la capacité', '🕳️', 'Tu rends un siège inutilisable.', { saboteurOnly: true }),
    ],
  },
  {
    id: 'medical_protocol', chapter: 6, number: '16C', branch: true, mode: 'group', title: 'Le protocole médical',
    narrative: "Le système médical ne peut pas tout faire. Il peut stabiliser la personne la plus faible, réveiller les réserves physiques de tout le groupe au prix de l’énergie restante, ou analyser les traces de contamination trouvées dans la jungle.",
    prompt: 'Quel protocole lancez-vous ?',
    choices: [
      c('weakest', 'Sauver la personne la plus faible', '❤️', 'Une personne récupère complètement.'),
      c('all', 'Stimuler tout le groupe', '⚡', 'Tout le monde gagne une protection, mais le danger augmente.'),
      c('analysis', 'Analyser la contamination', '🧪', 'Les sabotages par poison sont révélés et soignés.'),
    ],
  },
  // Événements secondaires ajoutés uniquement en partie longue.
  {
    id: 'bonus_rain', chapter: 2, number: 'B1', secondary: true, mode: 'group', title: 'La pluie',
    narrative: "Une pluie tropicale tombe brutalement. Elle peut remplir les récipients ou fragiliser le camp.",
    prompt: 'Que privilégiez-vous ?',
    choices: [c('water', 'Récupérer l’eau', '🌧️', 'Réserves +1.'), c('shelter', 'Protéger le refuge', '⛺', 'Refuge +1.')],
  },
  {
    id: 'bonus_fever', chapter: 3, number: 'B2', secondary: true, mode: 'group', title: 'La fièvre',
    narrative: "Une personne tremble de fièvre. La trousse peut être utilisée maintenant ou conservée.",
    prompt: 'Que faites-vous ?',
    choices: [c('treat', 'Utiliser les soins', '💊', 'Retire une blessure ou rend une vie.'), c('keep', 'Conserver la trousse', '🎒', 'La personne devient Affaiblie.')],
  },
  {
    id: 'bonus_tracks', chapter: 4, number: 'B3', secondary: true, mode: 'group', title: 'Les traces',
    narrative: "Des empreintes humaines apparaissent près du camp, puis disparaissent vers la forêt.",
    prompt: 'Comment réagissez-vous ?',
    choices: [c('follow', 'Les suivre', '👣', 'Vous obtenez un indice, mais Danger +1.'), c('erase', 'Les effacer', '🧹', 'Cohésion +1, aucun risque immédiat.')],
  },
  {
    id: 'bonus_flare', chapter: 5, number: 'B4', secondary: true, mode: 'group', title: 'La fusée au large',
    narrative: "Une lumière apparaît en mer. Elle peut appartenir à des secours ou à quelqu’un qui vous observe.",
    prompt: 'Utilisez-vous une fusée ?',
    choices: [c('signal', 'Répondre', '🚨', 'Signal +1 et Danger +1.'), c('hide', 'Rester cachés', '🌑', 'Danger -1.')],
  },
  {
    id: 'bonus_cave', chapter: 4, number: 'B5', secondary: true, mode: 'group', title: 'La grotte',
    narrative: "Une grotte contient des réserves et le même symbole que la mallette.",
    prompt: 'Que prenez-vous ?',
    choices: [c('food', 'Les réserves', '🥫', 'Réserves +1.'), c('symbol', 'Étudier le symbole', '🗿', 'Un indice fiable sur la station.')],
  },
  {
    id: 'bonus_call', chapter: 6, number: 'B6', secondary: true, mode: 'privateOne', actorRule: 'random', title: "L’appel privé",
    narrative: "La radio prononce le nom d’une seule personne, puis diffuse une instruction que les autres n’entendent pas.",
    prompt: 'Que fais-tu du message ?',
    choices: [c('share', 'Le partager', '📣', 'Cohésion +1.'), c('keep', 'Le garder secret', '🔒', 'Tu obtiens un indice personnel.')],
  },
  {
    id: 'bonus_fire', chapter: 2, number: 'B7', secondary: true, mode: 'group', title: "L’incendie",
    narrative: "Une braise atteint le camp. Il faut sauver les provisions, la radio ou les personnes blessées.",
    prompt: 'Que sauvez-vous en priorité ?',
    choices: [c('food', 'Les provisions', '🥫', 'Évite une perte de réserves.'), c('radio', 'La radio', '📻', 'Évite une perte de signal.'), c('people', 'Les blessés', '🫂', 'Retire l’état Blessé à une personne.')],
  },
];


const eventFlow = {
  impact_escape: { discussionSeconds: 35, decisionSeconds: 20, timeoutChoice: 'inaction', timeoutSummary: "La fumée impose sa décision. Les personnes restées figées ressortent blessées." },
  burning_crates: { discussionSeconds: 30, decisionSeconds: 18, timeoutChoice: 'inaction', timeoutSummary: "Les flammes gagnent une caisse pendant l’hésitation." },
  save_nora: { discussionSeconds: 50, decisionSeconds: 20, timeoutChoice: 'abandon', timeoutEffects: { cohesion: -1 }, timeoutSummary: "La structure cède avant qu’un accord ne soit trouvé. Nora disparaît derrière les flammes." },
  choose_shelter: { discussionSeconds: 60, decisionSeconds: 25, timeoutChoice: 'beach', timeoutEffects: { danger: 1, shelter: -1 }, timeoutSummary: "La nuit tombe pendant la dispute. Le groupe improvise un camp exposé sur la plage." },
  shelter_beach_tide: { discussionSeconds: 40, decisionSeconds: 18, timeoutChoice: 'move', timeoutEffects: { reserves: -1 }, timeoutSummary: "La marée emporte une caisse avant que le camp ne soit déplacé." },
  shelter_fuselage_aftershock: { discussionSeconds: 35, decisionSeconds: 18, timeoutChoice: 'extinguish', timeoutEffects: { danger: 1 }, timeoutSummary: "L’effondrement vous force à agir dans la panique." },
  shelter_jungle_source: { discussionSeconds: 45, decisionSeconds: 20, timeoutChoice: 'inaction', timeoutEffects: { cohesion: -1 }, timeoutSummary: "Les retardataires reviennent sans eau et éveillent les soupçons.", promiseOptions: [
    { id: 'share', label: 'Je révélerai la source au groupe', expectedChoiceIds: ['share'] },
    { id: 'no_harm', label: 'Je ne toucherai à la gourde de personne', expectedChoiceIds: ['share', 'hide'] },
  ] },
  grey_case: { discussionSeconds: 0, decisionSeconds: 22, timeoutChoice: 'hide', timeoutSummary: "Le bruit approche. La mallette est cachée sans explication." },
  rations: { discussionSeconds: 60, decisionSeconds: 18, timeoutChoice: 'inaction', timeoutEffects: { reserves: -1 }, timeoutSummary: "Une ration reste ouverte puis se renverse pendant que personne ne décide.", promiseOptions: [
    { id: 'share', label: 'Je partagerai équitablement', expectedChoiceIds: ['share'] },
    { id: 'no_steal', label: 'Je ne prendrai rien de plus', expectedChoiceIds: ['share', 'own'] },
  ] },
  missing_resource: { discussionSeconds: 65, decisionSeconds: 25, timeoutChoice: 'ignore', timeoutEffects: { cohesion: -1 }, timeoutSummary: "La discussion tourne court. La disparition reste impunie et la confiance baisse." },
  radio_voice: { discussionSeconds: 30, decisionSeconds: 12, timeoutChoice: 'listen', timeoutEffects: { signal: -1 }, timeoutSummary: "La fréquence s’éteint avant qu’une réponse ne soit envoyée." },
  expedition: { discussionSeconds: 70, decisionSeconds: 25, timeoutChoice: 'small', timeoutEffects: { danger: 1 }, timeoutSummary: "Faute d’accord, une personne part seule au dernier moment." },
  jungle_ambush: { discussionSeconds: 25, decisionSeconds: 12, timeoutChoice: 'continue', timeoutEffects: { reserves: -2 }, timeoutSummary: "Le camp est fouillé pendant l’hésitation. Deux unités de réserves disparaissent." },
  split_cache: { discussionSeconds: 50, decisionSeconds: 20, timeoutChoice: 'inaction', timeoutEffects: { danger: 1 }, timeoutSummary: "Les équipes tardent à se rejoindre et la nuit les rattrape.", promiseOptions: [
    { id: 'report', label: 'Je rapporterai tout ce que je trouve', expectedChoiceIds: ['report'] },
    { id: 'no_betrayal', label: 'Je ne volerai ni ne tromperai personne', expectedChoiceIds: ['report', 'hide'] },
  ] },
  scout_route: { discussionSeconds: 0, decisionSeconds: 20, timeoutChoice: 'hide', timeoutSummary: "L’éclaireur garde le tunnel pour lui faute d’avoir pris une décision claire." },
  ravine: { discussionSeconds: 45, decisionSeconds: 18, timeoutChoice: 'turnback', timeoutEffects: { danger: 1 }, timeoutSummary: "Le soleil baisse. Le groupe doit faire demi-tour dans la précipitation." },
  outpost: { discussionSeconds: 35, decisionSeconds: 18, timeoutChoice: 'inaction', timeoutSummary: "Le générateur s’éteint avant que les retardataires n’entrent dans une salle." },
  clues: { discussionSeconds: 55, decisionSeconds: 20, timeoutChoice: 'inaction', timeoutEffects: { cohesion: -1 }, timeoutSummary: "Le silence devient lui-même suspect.", promiseOptions: [
    { id: 'truth', label: 'Je raconterai exactement ce que j’ai vu', expectedChoiceIds: ['reveal'] },
  ] },
  judgment: { discussionSeconds: 90, decisionSeconds: 25, timeoutChoice: 'inaction', timeoutEffects: { cohesion: -1, signal: -1 }, timeoutSummary: "Le groupe ne tranche pas. Le câble reste coupé et les soupçons s’enveniment." },
  revenge_offer: { discussionSeconds: 0, decisionSeconds: 22, timeoutChoice: 'mislead', timeoutSummary: "La colère décide à la place de la personne accusée : la carte est falsifiée." },
  saboteur_cornered: { discussionSeconds: 0, decisionSeconds: 18, timeoutChoice: 'damage', timeoutSummary: "Acculé, le saboteur endommage la radio avant d’être maîtrisé." },
  uneasy_truce: { discussionSeconds: 55, decisionSeconds: 20, timeoutChoice: 'silence', timeoutEffects: { danger: 1 }, timeoutSummary: "La trêve se résume à un silence tendu qui laisse le danger progresser." },
  storm: { discussionSeconds: 55, decisionSeconds: 18, timeoutChoice: 'inaction', timeoutEffects: { danger: 1, shelter: -1 }, timeoutSummary: "La tempête frappe avant la fin des préparatifs.", promiseOptions: [
    { id: 'protect', label: 'Je consacrerai mon choix au groupe', expectedChoiceIds: ['reinforce', 'radio', 'move'] },
    { id: 'no_capsule', label: 'Je ne prendrai pas de capsule secrète', expectedChoiceIds: ['reinforce', 'radio', 'move'] },
  ] },
  generator: { discussionSeconds: 75, decisionSeconds: 22, timeoutChoice: 'medical', timeoutEffects: { signal: -1 }, timeoutSummary: "Le générateur perd de la puissance. Le système médical s’active par défaut." },
  beacon_reply: { discussionSeconds: 40, decisionSeconds: 15, timeoutChoice: 'wait', timeoutEffects: { signal: -1 }, timeoutSummary: "La fréquence change avant votre réponse." },
  boat_capacity: { discussionSeconds: 55, decisionSeconds: 18, timeoutChoice: 'inaction', timeoutEffects: { cohesion: -1 }, timeoutSummary: "Les sièges ne sont pas réorganisés à temps.", promiseOptions: [
    { id: 'free', label: 'Je travaillerai à libérer des places', expectedChoiceIds: ['free'] },
    { id: 'no_reserve', label: 'Je ne réserverai pas ma place en secret', expectedChoiceIds: ['free', 'give'] },
  ] },
  medical_protocol: { discussionSeconds: 35, decisionSeconds: 18, timeoutChoice: 'weakest', timeoutSummary: "Le système traite automatiquement la personne la plus faible." },
  black_dossier: { discussionSeconds: 0, decisionSeconds: 25, timeoutChoice: 'hide', timeoutSummary: "Le terminal se verrouille. La personne devant l’écran conserve seule ce qu’elle a lu." },
  trapped: { discussionSeconds: 35, decisionSeconds: 12, timeoutChoice: 'continue', timeoutEffects: { cohesion: -2 }, timeoutSummary: "La porte se ferme. La personne piégée reste derrière." },
  escape_route: { discussionSeconds: 80, decisionSeconds: 25, timeoutChoice: 'stay', timeoutEffects: { danger: 1 }, timeoutSummary: "Aucune route n’est engagée avant l’effondrement. Le groupe doit rester sur l’île." },
  final_choice: { discussionSeconds: 70, decisionSeconds: 15, timeoutChoice: 'inaction', timeoutSummary: "Les personnes qui hésitent ne sont pas prioritaires lors du départ.", promiseOptions: [
    { id: 'wait', label: 'Je n’abandonnerai personne', expectedChoiceIds: ['wait', 'give'] },
    { id: 'no_rush', label: 'Je ne me précipiterai pas pour embarquer', expectedChoiceIds: ['wait', 'give', 'proof'] },
  ] },
  last_wave: { discussionSeconds: 25, decisionSeconds: 10, timeoutChoice: 'together', timeoutEffects: { danger: 1 }, timeoutSummary: "La vague frappe avant votre décision. Le groupe encaisse le choc ensemble." },
};

for (const event of events) {
  const flow = eventFlow[event.id];
  if (flow) Object.assign(event, flow);
}

export const endings = {
  everyone_home: { title: 'Tout le monde rentre', icon: '🌅', text: "Tous les survivants quittent l’île ensemble. Les choix solidaires ont laissé une issue ouverte jusqu’au bout." },
  duo_together: { title: "À deux jusqu’au bout", icon: '💞', text: "Vous avez refusé de partir séparément. Ce choix révèle une solution permettant finalement de sauver le duo." },
  seat_price: { title: 'Le prix du siège', icon: '🦺', text: "Une partie du groupe s’échappe. Les autres restent derrière avec les conséquences de vos décisions." },
  last_survivor: { title: 'Le dernier survivant', icon: '🌴', text: "Une seule personne quitte l’île. Elle emporte avec elle la vérité, ou ce qu’elle choisira d’en raconter." },
  those_who_stay: { title: 'Ceux qui restent', icon: '🔥', text: "Le groupe choisit de rester uni. Le refuge tient, et une lumière apparaît finalement à l’horizon." },
  false_rescue: { title: 'Le faux sauvetage', icon: '📡', text: "Le signal attire une équipe liée à la station. Vous êtes évacués, mais les preuves sont immédiatement confisquées." },
  island_secret: { title: "L’île garde son secret", icon: '💼', text: "Les survivants s’échappent, mais la vérité disparaît. Le monde considérera le crash comme un accident ordinaire." },
  no_return: { title: 'Personne ne repart vraiment', icon: '🏝️', text: "Toutes les routes échouent. Les survivants restent sur l’île et transforment le refuge en nouveau départ." },
};

export const setupOptions = {
  durations: [
    { id: 'short', label: 'Courte', detail: '15 événements essentiels' },
    { id: 'normal', label: 'Normale', detail: '21 événements complets' },
    { id: 'long', label: 'Longue', detail: '21 événements + imprévus' },
  ],
  audiences: [
    { id: 'family', label: 'Famille', detail: 'Formulations plus douces' },
    { id: 'all', label: 'Tout public', detail: 'Version principale' },
    { id: 'adult', label: 'Adultes', detail: 'Conséquences plus directes' },
  ],
};

export function getEventById(id) {
  return events.find((event) => event.id === id) ?? null;
}
