export const events = [
  {
    id: 'impact_escape',
    chapter: 1,
    number: 1,
    title: "Sortir de l’épave",
    eyebrow: 'CHAPITRE 1 · L’IMPACT',
    narrative:
      "Le bruit est assourdissant. Une odeur de carburant envahit la cabine. Vous êtes vivants, mais le feu progresse et les blessés appellent à l’aide.",
    prompt: 'Que fais-tu dans les premières secondes ?',
    mode: 'privateEach',
    choices: [
      {
        id: 'help',
        label: 'Aider les blessés',
        icon: '🤝',
        description: 'Tu privilégies les autres, au risque de rester plus longtemps dans la cabine.',
      },
      {
        id: 'exit',
        label: 'Sécuriser une sortie',
        icon: '🚪',
        description: 'Tu cherches une issue praticable pour permettre au groupe de sortir.',
      },
      {
        id: 'search',
        label: 'Fouiller les bagages',
        icon: '🎒',
        description: 'Tu tentes de récupérer quelque chose d’utile avant que l’épave brûle.',
      },
    ],
  },
  {
    id: 'burning_crates',
    chapter: 1,
    number: 2,
    title: 'Les caisses en flammes',
    eyebrow: 'CHAPITRE 1 · L’IMPACT',
    narrative:
      "Le feu atteint la soute. Il reste quelques secondes pour sauver du matériel, mais tout ne pourra pas être emporté.",
    prompt: 'Quelle caisse essaies-tu de sauver ?',
    mode: 'privateEach',
    choices: [
      {
        id: 'provisions',
        label: 'Provisions',
        icon: '🥫',
        description: 'De l’eau et de la nourriture pour tenir plusieurs jours.',
      },
      {
        id: 'medical',
        label: 'Matériel médical',
        icon: '🩹',
        description: 'Une trousse de secours et quelques antidouleurs.',
      },
      {
        id: 'communication',
        label: 'Communication',
        icon: '📻',
        description: 'Une radio endommagée et du matériel de signalement.',
      },
      {
        id: 'equipment',
        label: 'Équipement',
        icon: '🪢',
        description: 'Une corde, une lampe et quelques outils.',
      },
    ],
  },
  {
    id: 'save_nora',
    chapter: 1,
    number: 3,
    title: 'Nora',
    eyebrow: 'CHAPITRE 1 · L’IMPACT',
    narrative:
      "Une hôtesse de bord est coincée sous une partie du fuselage. Elle vous supplie de ne pas partir. Le feu se rapproche.",
    prompt: 'Le groupe doit prendre une décision.',
    mode: 'group',
    choices: [
      {
        id: 'save',
        label: 'La sauver ensemble',
        icon: '🛟',
        description: 'Le groupe prend le risque de rester plus longtemps dans l’épave.',
      },
      {
        id: 'solo',
        label: 'Un volontaire reste',
        icon: '❤️‍🔥',
        description: 'Une personne perdra une vie pour libérer Nora.',
      },
      {
        id: 'abandon',
        label: 'L’abandonner',
        icon: '🌫️',
        description: 'Vous fuyez immédiatement, mais ce choix laissera une trace.',
      },
    ],
  },
];

export const setupOptions = {
  durations: [
    { id: 'short', label: 'Courte', detail: '20 à 25 min' },
    { id: 'normal', label: 'Normale', detail: '35 à 45 min' },
    { id: 'long', label: 'Longue', detail: '50 à 60 min' },
  ],
  audiences: [
    { id: 'family', label: 'Famille', detail: 'Tension modérée' },
    { id: 'all', label: 'Tout public', detail: 'Version principale' },
    { id: 'adult', label: 'Adultes', detail: 'Choix plus durs' },
  ],
};
