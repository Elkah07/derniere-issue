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
