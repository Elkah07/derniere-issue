import { getEventById, plots } from './gameData.js';

const scenes = {
  impact_escape: [
    "Le fuselage s’est immobilisé dans un dernier hurlement de métal. Une rangée de sièges s’est couchée sur le côté et une fumée noire rampe déjà au plafond. Dans la lumière rouge des alarmes, personne ne distingue encore la sortie de la jungle qui entoure l’épave.",
    "Derrière vous, des blessés appellent. Plus loin, une porte de secours semble coincée. À vos pieds, plusieurs bagages éventrés laissent entrevoir des objets qui pourraient devenir précieux sur une île inconnue. Les flammes gagnent la cabine. Vous n’aurez le temps de faire qu’une seule chose."
  ],
  burning_crates: [
    "À peine dehors, une explosion secoue la soute. Quatre caisses glissent sur le sable au milieu des étincelles. Les marquages sont encore lisibles : provisions, matériel médical, communication et équipement de survie.",
    "La chaleur devient insoutenable. Deux caisses pourront peut-être être tirées assez loin avant que le feu n’engloutisse le reste. Chacun court vers ce qui lui paraît le plus important, sans savoir ce que les autres choisiront."
  ],
  save_nora: [
    "Un cri étouffé vient de l’arrière de l’appareil. Sous une plaque du fuselage, une hôtesse de bord est coincée jusqu’à la taille. Son badge porte le prénom Nora. Elle essaie de rester calme, mais le carburant en feu se rapproche le long du sable.",
    "« Ne perdez pas de temps à discuter », souffle-t-elle. La plaque est trop lourde pour une seule personne, sauf à y laisser une partie de ses forces. Partir maintenant sauverait le groupe. Rester pourrait sauver une vie, et peut-être bien davantage."
  ],
  choose_shelter: [
    "Le jour révèle enfin l’île : une plage étroite, une forêt compacte et des reliefs noyés dans la brume. Aucun bateau, aucune route, aucun signe évident d’habitation. Derrière vous, la carcasse de l’avion fume encore.",
    "La prochaine nuit arrivera vite. La plage offrirait une chance d’être vus. Le fuselage protégerait du vent. La jungle fournirait de l’eau et de la nourriture, mais quelque chose y bouge déjà entre les feuilles. Il faut choisir l’endroit qui deviendra votre premier refuge."
  ],
  camp_tasks: [
    "Le camp n’est encore qu’un cercle de bagages et de couvertures humides. Les gorges sont sèches, le soleil monte et l’épave continue de craquer à intervalles réguliers.",
    "Trois urgences se disputent les bras disponibles : chercher de l’eau avant la chaleur, consolider un abri avant la nuit, ou retourner dans l’avion pour récupérer ce que le feu n’a pas pris. Tout faire serait idéal. Tout faire correctement semble impossible."
  ],
  grey_case: [
    "Derrière un siège arraché, à moitié enfouie sous des papiers brûlés, une mallette métallique apparaît. Elle n’a ni nom ni étiquette de compagnie. Seulement un symbole noir, identique à celui gravé sur un composant de la radio.",
    "Elle est lourde, verrouillée, et suffisamment petite pour disparaître dans un sac. Personne ne regarde dans votre direction. Pendant quelques secondes, cette découverte n’appartient qu’à vous."
  ],
  rations: [
    "La première nuit tombe d’un seul coup. Autour du feu, les visages paraissent plus fatigués que quelques heures plus tôt. Les provisions sauvées sont alignées au centre du camp, et le calcul est simple : si personne ne se prive, elles ne tiendront pas longtemps.",
    "Chacun se sert à tour de rôle pendant que les autres détournent les yeux. Une portion de plus pourrait faire la différence demain. Une portion de moins pourrait préserver le groupe. Le bruit des emballages semble soudain beaucoup trop fort."
  ],
  missing_resource: [
    "Au réveil, un sac n’est plus à sa place. Une ration, un outil ou peut-être quelque chose de plus important manque à l’inventaire commun. Sur le sable humide, les traces ont été brouillées avant l’aube.",
    "Les explications se chevauchent. Quelqu’un accuse la marée. Un autre parle d’un animal. Les regards finissent par tomber sur les sacs personnels. Fouiller permettrait peut-être d’obtenir une réponse, mais certaines confiances ne se referment pas aussi facilement qu’une fermeture éclair."
  ],
  radio_voice: [
    "La radio s’allume seule. Un souffle saturé remplit le camp, puis une voix lointaine traverse les parasites : « Vol 714… ne suivez pas… la lumière… le signal n’est pas… »",
    "Le message se coupe. La diode continue pourtant de clignoter, comme si quelqu’un attendait une réponse. Nora, si elle est encore là, fixe l’appareil sans parler. Ce numéro de vol est le vôtre."
  ],
  expedition: [
    "Au-dessus de la canopée, une colonne métallique reflète le soleil. Cela pourrait être une antenne, une tour ou le vestige d’une installation abandonnée. C’est la première preuve que l’île n’a peut-être pas toujours été déserte.",
    "Partir nombreux rendrait le trajet plus sûr, mais laisserait le camp et les réserves sans surveillance. Se séparer préserverait le refuge, au prix d’informations différentes et de dangers vécus loin les uns des autres."
  ],
  ravine: [
    "La végétation s’interrompt brutalement devant une faille profonde. Le fond disparaît dans la brume et l’eau qui y coule ne fait presque aucun bruit. De l’autre côté, une porte métallique est prise dans les lianes.",
    "La corde permettrait un passage sûr, mais elle ne servira plus ensuite. Une passerelle coûterait des matériaux au refuge. Envoyer une seule personne préserverait les ressources, tout en la laissant seule face à ce qui se trouve derrière la porte."
  ],
  outpost: [
    "La porte ouvre sur un avant-poste noyé dans la poussière. Des écrans morts, des casiers renversés et des panneaux d’évacuation couvrent les murs. Lorsque le générateur tousse enfin, trois couloirs s’allument en même temps.",
    "Communications. Infirmerie. Archives. Une alarme indique que l’énergie ne tiendra que quelques minutes. Le groupe se disperse, chacun courant vers la réponse qu’il juge la plus urgente."
  ],
  clues: [
    "De retour au camp, le câble de la radio pend en deux morceaux. La coupure est nette. Trop nette pour une branche, pense quelqu’un à voix haute. Autour de l’appareil, la pluie a presque effacé les traces.",
    "Pourtant, chacun remarque un détail : de la boue, un fil de tissu, une empreinte, un outil déplacé, une heure qui ne correspond pas. Aucun indice ne raconte toute l’histoire. Chacun peut maintenant choisir la part de vérité qu’il apportera aux autres."
  ],
  judgment: [
    "Les indices sont posés au centre du camp. Ils ne s’accordent pas tous, et certains se contredisent franchement. La radio reste muette tandis que les soupçons, eux, deviennent bruyants.",
    "Accuser quelqu’un pourrait neutraliser une menace réelle. Cela pourrait aussi isoler un innocent au pire moment. Refuser le jugement protège peut-être le groupe d’une erreur, ou offre simplement au responsable une nuit de plus."
  ],
  storm: [
    "Le ciel se ferme au-dessus de l’île. Le vent soulève le sable, plie les arbres et transforme chaque bâche en voile prête à s’arracher. La tempête atteindra le camp avant la nuit.",
    "Il faut choisir ce qui mérite d’être sauvé : le refuge, la radio ou le temps gagné en quittant immédiatement les lieux. Dans le désordre, certains découvrent aussi une capsule de survie individuelle dissimulée dans l’épave. La garder pourrait sauver une personne. Elle réduirait les chances des autres."
  ],
  generator: [
    "La carte mène à une station creusée dans la roche. À l’intérieur, l’air sent l’ozone et la poussière froide. Un générateur de secours alimente encore trois systèmes, mais son écran affiche une réserve d’énergie presque vide.",
    "La balise pourrait appeler de l’aide. Le hangar maritime pourrait ouvrir une route par la mer. Le système médical pourrait remettre les plus faibles sur pied. Sans batterie supplémentaire, une seule lumière restera allumée."
  ],
  black_dossier: [
    "Le module de la boîte noire s’emboîte dans le terminal. Des dossiers chiffrés apparaissent, suivis du manifeste du vol et d’une série d’ordres qui n’auraient jamais dû se trouver dans un avion civil.",
    "Quelques lignes suffisent pour comprendre que la vérité changera la manière dont le groupe regarde le crash, et peut-être la personne qui se tient devant l’écran. Révéler les fichiers peut unir les survivants. Les cacher peut donner un pouvoir immense. Les détruire peut sauver des vies tout en condamnant la vérité."
  ],
  trapped: [
    "Une détonation secoue la station. Le plafond se fend et une poutre s’écrase dans le couloir. Derrière le nuage de poussière, une personne reste coincée tandis que les alarmes répètent que le secteur va être scellé.",
    "La libérer coûtera du temps, de l’énergie et peut-être une vie. Continuer rendrait l’évacuation plus simple. Personne ne dit à voix haute ce que chacun comprend déjà : cette décision reviendra avec vous, quelle que soit l’issue."
  ],
  escape_route: [
    "La tempête frappe maintenant toute l’île. Dans la salle de contrôle, les voyants encore actifs dessinent les seules routes que vos décisions ont laissées ouvertes.",
    "Un hélicoptère peut peut-être vous localiser. Une embarcation attend peut-être dans le hangar. Le refuge peut tenir, ou un radeau de fortune emporter quelques personnes. Ce n’est plus le moment d’imaginer la meilleure solution. Il faut choisir parmi celles que vous avez réellement construites."
  ],
  final_choice: [
    "Le départ commence dans le bruit du vent et des alarmes. Les places, les secondes et les mains disponibles se comptent maintenant une par une.",
    "Chacun reçoit une dernière possibilité que les autres ne verront pas : attendre, embarquer avant eux, donner sa place, emporter les preuves… ou, pour quelqu’un peut-être, condamner le départ. Les promesses faites autour du feu vont enfin rencontrer la réalité."
  ],
  last_wave: [
    "Une dernière vague frappe la côte et fait trembler les structures jusqu’à leurs fondations. Le passage se déforme. Les objets glissent. Derrière vous, l’île semble refermer toutes les routes à la fois.",
    "Le danger accumulé depuis le crash présente maintenant l’addition. Rester groupés, abandonner le matériel ou demander à quelqu’un de tenir le passage : il ne reste qu’un choix avant de découvrir qui s’en sort."
  ],
  shelter_beach_tide: [
    "La plage semblait être l’endroit le plus simple à défendre. À mesure que le soleil monte, la mer prouve le contraire. Les premières vagues lèchent déjà les couvertures et effacent les marques laissées autour des caisses.",
    "Au large, une lumière apparaît une seconde entre deux murs d’écume. Plus près, une caisse détachée de l’épave roule dans le courant. Déplacer le camp, répondre au signal ou sauver le matériel : la marée ne vous laissera pas tenter les trois."
  ],
  shelter_fuselage_aftershock: [
    "À l’intérieur du fuselage, la chaleur reste enfermée entre les parois. Un craquement sec traverse la cabine, puis plusieurs sièges basculent comme des dominos. Sous le plancher, le feu reprend autour d’une conduite éventrée.",
    "La porte du cockpit vient pourtant de s’ouvrir sous le choc. Dans la soute, des caisses encore intactes deviennent visibles. L’épave offre soudain plusieurs réponses, mais elle menace de se refermer sur ceux qui resteront trop longtemps."
  ],
  shelter_jungle_source: [
    "Le camp de jungle est à peine installé lorsqu’un bruit d’eau attire plusieurs personnes entre les racines. Une source claire coule dans une cuvette de pierre, suffisamment abondante pour changer les jours à venir.",
    "Les joueurs arrivent séparément par de petits sentiers. Personne ne sait qui a découvert la source en premier, qui a déjà rempli une gourde ni ce qui a été touché avant le retour au camp. L’eau peut devenir une ressource commune, un secret ou une arme silencieuse."
  ],
  jungle_ambush: [
    "Le groupe avance ensemble lorsque le fracas du camp retentit derrière les arbres. Des caisses tombent, une bâche se déchire et quelque chose pousse un cri bref près des réserves.",
    "La tour se trouve droit devant, presque accessible. Revenir protéger le camp ferait perdre cette piste. Continuer offrirait peut-être une issue, mais laisserait tout ce que vous possédez à la merci de ce qui fouille la plage."
  ],
  split_cache: [
    "Les deux équipes empruntent des chemins opposés et découvrent chacune une partie d’une ancienne cache de secours. Des rations, des balises et un plan incomplet sont répartis dans plusieurs coffres rongés par l’humidité.",
    "Pendant quelques minutes, chacun est loin du regard du reste du groupe. Il est possible de tout rapporter, de cacher une ressource ou de profiter de la séparation pour voler, mentir et envoyer quelqu’un vers un chemin dangereux."
  ],
  scout_route: [
    "L’éclaireur atteint seul une porte de maintenance presque invisible sous les lianes. Derrière, un tunnel descend vers la station et contourne entièrement la faille aperçue plus loin.",
    "Le plan fixé au mur pourrait sauver tout le groupe. Garder le passage secret garantirait cependant une route personnelle. Le condamner empêcherait quiconque de vérifier ce qui a été découvert ici."
  ],
  revenge_offer: [
    "L’isolement laisse à la personne accusée le temps de fouiller seule sous le camp. Elle découvre une carte plastifiée et une caisse que les autres n’avaient jamais remarquée.",
    "Elle peut revenir avec une solution malgré l’injustice, exiger qu’une personne paie le prix de l’accusation, ou modifier la carte avant de la rendre. La vengeance n’a pas besoin d’être spectaculaire pour changer tout un itinéraire."
  ],
  saboteur_cornered: [
    "Les accusations ont trouvé la bonne personne. Pendant que le groupe se rapproche, le saboteur reste quelques secondes seul près de la radio et des sacs personnels.",
    "Avouer peut encore préserver une partie du groupe. Fabriquer une preuve peut déplacer le soupçon. Endommager le signal peut transformer une défaite personnelle en catastrophe collective."
  ],
  uneasy_truce: [
    "Aucun verdict n’a tenu. Les indices restent au centre du cercle, entourés de personnes qui ne se regardent plus tout à fait de la même manière.",
    "Le groupe peut mettre les preuves en commun, imposer le silence ou confier l’autorité à une seule personne. La discussion ne déterminera peut-être pas la vérité, mais elle décidera qui aura le droit d’agir au prochain danger."
  ],
  beacon_reply: [
    "La balise s’allume dans un bourdonnement profond. Presque immédiatement, une voix demande votre code d’identification et exige que le module de la boîte noire soit préparé pour récupération.",
    "Répondre franchement peut accélérer les secours. Masquer l’identité du groupe protège les preuves. Attendre une autre fréquence évite peut-être un piège, mais le signal commence déjà à faiblir."
  ],
  boat_capacity: [
    "Le hangar s’ouvre sur une embarcation couverte de poussière. Le panneau de contrôle affiche moins de sièges que de survivants, mais plusieurs compartiments peuvent être démontés pour libérer de la place.",
    "Chacun inspecte une partie différente du bateau. Une place peut être réservée, offerte ou créée. Elle peut aussi être rendue inutilisable sans que les autres comprennent immédiatement pourquoi."
  ],
  medical_protocol: [
    "Le système médical déploie ses bras mécaniques et projette trois protocoles sur l’écran. Il peut sauver entièrement la personne la plus faible, protéger temporairement tout le groupe ou analyser les traces de contamination.",
    "L’énergie ne suffira qu’à une procédure. Soigner les blessures visibles est rassurant. Chercher une trahison invisible peut changer la manière dont chacun boira la prochaine gourde."
  ],
  bonus_rain: ["La pluie tropicale tombe sans prévenir, épaisse et tiède. Les récipients pourraient enfin se remplir, mais l’eau transforme déjà le sol du camp en boue et menace les attaches du refuge."],
  bonus_fever: ["Au milieu de la nuit, une personne se met à trembler malgré la chaleur. La fièvre grimpe vite. Utiliser les soins maintenant pourrait éviter le pire, mais personne ne sait ce que l’île réserve encore."],
  bonus_tracks: ["Des empreintes humaines apparaissent autour du camp. Elles ne viennent ni de la plage ni de votre sentier. Elles commencent près des réserves et disparaissent entre les arbres."],
  bonus_flare: ["Au large, une lumière monte lentement dans le ciel puis retombe derrière l’horizon. Ce pourrait être un appel au secours. Ce pourrait être une réponse à votre présence."],
  bonus_cave: ["Sous une paroi couverte de mousse, une grotte abrite des boîtes encore intactes. Le même symbole que celui de la mallette a été peint sur la roche, bien avant votre arrivée."],
  bonus_call: ["La radio grésille, puis prononce distinctement le nom d’une seule personne. Le reste du message est trop faible pour que les autres l’entendent."],
  bonus_fire: ["Une braise portée par le vent tombe sur le camp. En quelques secondes, les flammes courent vers les provisions, la radio et l’endroit où reposent les blessés."]
};

const chapterBase = {
  1: [
    "La chute n’a duré que quelques secondes. Elle a pourtant séparé votre vie en deux : avant l’impact, et tout ce qui viendra après.",
    "La cabine est plongée dans une lumière rouge. Le métal gémit, le carburant brûle et les premières décisions doivent être prises avant même que chacun comprenne où l’avion s’est écrasé."
  ],
  2: [
    "Le soleil se lève sur une île qui ne figure sur aucune carte visible. La plage est vide, la mer trop agitée et la forêt suffisamment dense pour cacher une ville entière.",
    "Vous avez survécu à l’impact. Il faut maintenant transformer quelques objets sauvés et beaucoup de fatigue en un camp capable de tenir jusqu’à la prochaine nuit."
  ],
  3: [
    "La nuit efface l’horizon et donne à la forêt une présence presque humaine. Les bruits se rapprochent dès que les conversations s’arrêtent.",
    "Autour du feu, les réserves paraissent plus petites, les blessures plus sérieuses et les silences plus longs. La survie dépendra autant de ce que chacun partage que de ce qu’il décide de cacher."
  ],
  4: [
    "Au matin, la structure métallique au-dessus des arbres est toujours là. Elle promet des réponses, peut-être une radio intacte, peut-être la preuve que quelqu’un a vécu ici avant vous.",
    "L’exploration oblige le groupe à quitter ce qu’il a réussi à protéger. Plus vous avancez dans l’île, plus le camp devient lointain, et plus chaque objet emporté ressemble à une décision irréversible."
  ],
  5: [
    "Le retour ne ressemble pas à une victoire. Le câble de la radio a été sectionné et les versions de la nuit précédente ne s’emboîtent plus.",
    "Jusqu’ici, l’île était le danger commun. Désormais, chaque regard peut contenir une question : quelqu’un agit-il contre le groupe, ou la peur est-elle simplement en train de fabriquer son propre coupable ?"
  ],
  6: [
    "La station souterraine confirme que le crash n’est pas arrivé au milieu de nulle part. Des machines, des cartes et des dossiers prouvent que l’île a été observée, utilisée, puis abandonnée.",
    "Les réponses se trouvent enfin à portée de main. Mais l’énergie manque, les couloirs se dégradent et chaque vérité découverte peut devenir une raison supplémentaire de ne pas faire confiance aux secours."
  ],
  7: [
    "La tempête recouvre l’île et efface derrière vous les chemins empruntés depuis l’épave. Toutes les décisions précédentes convergent vers quelques voyants encore allumés dans la station.",
    "Il n’existe plus de solution parfaite. Seulement les routes que vous avez ouvertes, les personnes que vous avez protégées et les promesses que chacun est encore prêt à tenir lorsque les places deviennent réelles."
  ]
};

function namesFromIds(game, ids = []) {
  return ids.map((id) => game.players.find((player) => player.id === id)?.name).filter(Boolean);
}

function historyChoice(game, eventId) {
  return [...(game.history ?? [])].reverse().find((entry) => entry.eventId === eventId) ?? null;
}

function choiceValues(entry) {
  if (!entry?.choices) return [];
  return Object.values(entry.choices).map((value) => typeof value === 'string' ? value : value?.choiceId).filter(Boolean);
}

export function getChapterNarrative(game, number) {
  const paragraphs = [...(chapterBase[number] ?? [])];
  const flags = game.flags ?? {};
  const gauges = game.gauges ?? {};

  if (number === 2) {
    paragraphs.push(flags.noraAlive
      ? "Nora marche avec difficulté, une main posée sur sa blessure. Elle connaît l’appareil mieux que vous et observe déjà le ciel, comme si elle cherchait quelque chose qu’elle n’ose pas encore nommer."
      : "Le groupe a quitté l’épave sans Nora. Personne ne revient sur la décision, mais le bruit du feu derrière vous ressemble encore à un appel auquel personne n’a répondu.");
  }
  if (number === 3) {
    const shelter = flags.shelterLocation === 'beach' ? 'sur la plage ouverte' : flags.shelterLocation === 'fuselage' ? 'contre la carcasse encore chaude' : 'à la lisière de la jungle';
    paragraphs.push(`Le camp a été installé ${shelter}. Avec ${gauges.reserves}/5 en réserves et un refuge à ${gauges.shelter}/5, chacun comprend que la nuit ne sera pas seulement une pause.`);
  }
  if (number === 4) {
    paragraphs.push(flags.briefcaseState === 'hidden'
      ? "Quelqu’un transporte toujours une découverte que le reste du groupe ignore. Son poids ne se mesure pas seulement dans un sac."
      : flags.hasBlackBox
        ? "La carte partielle et le module de la boîte noire donnent enfin une direction au groupe. Ils soulèvent aussi une question : pourquoi ces objets étaient-ils verrouillés ?"
        : "La mallette grise n’a encore livré aucun secret. Pourtant, son symbole semble désormais apparaître partout où l’île refuse de répondre simplement.");
  }
  if (number === 5) {
    paragraphs.push(gauges.cohesion >= 2
      ? "Jusqu’ici, le groupe a souvent choisi de s’entraider. Cela rend les soupçons plus difficiles à prononcer, mais peut-être aussi plus dangereux à ignorer."
      : "Les décisions précédentes ont laissé des fissures. À présent, le moindre détail peut devenir une preuve et le moindre silence, un aveu.");
  }
  if (number === 6) {
    paragraphs.push(flags.noraAlive
      ? "Nora reconnaît certains symboles de la station. « Le pilote a vu ça avant l’impact », murmure-t-elle. Pour la première fois, elle semble avoir plus peur des réponses que de l’île."
      : "Sans Nora, il manque une voix capable de relier les messages de l’avion aux installations de l’île. Le groupe devra décider avec des informations incomplètes.");
  }
  if (number === 7) {
    const routeHints = [];
    if (flags.beaconActive) routeHints.push('la balise répond encore');
    if (flags.boatActive) routeHints.push('le hangar maritime est ouvert');
    if (gauges.shelter >= 4) routeHints.push('le refuge peut tenir');
    paragraphs.push(routeHints.length
      ? `Vous avez laissé plusieurs portes entrouvertes : ${routeHints.join(', ')}. Reste à savoir si elles conduisent toutes au même salut.`
      : "Presque toutes les issues se sont refermées. Ce qui reste ne ressemble pas à un plan, mais parfois une dernière issue n’a pas besoin d’être élégante pour être réelle.");
  }
  return paragraphs;
}

export function getEventNarrative(game, event) {
  const base = scenes[event.id] ?? [event.narrative];
  const paragraphs = [...base];
  if (event.id === 'radio_voice' && !game.groupInventory.includes('Radio endommagée')) {
    paragraphs.push("L’appareil est endommagé et ne devrait même pas fonctionner. C’est précisément ce qui rend le message plus inquiétant.");
  }
  if (event.id === 'trapped') {
    const target = game.flags.noraAlive
      ? 'Nora'
      : [...game.players].sort((a, b) => a.lives - b.lives)[0]?.name;
    if (target) paragraphs[0] = paragraphs[0].replace('une personne', target);
  }
  return paragraphs.filter(Boolean);
}

const resultLead = {
  impact_escape: "Lorsque le groupe atteint enfin l’air libre, le souffle de l’incendie chasse tout le monde jusqu’à la lisière des arbres.",
  burning_crates: "Les flammes referment la soute quelques secondes après votre passage. Ce qui n’a pas été tiré sur le sable disparaît dans un grondement sourd.",
  save_nora: "La décision est prise avant que le feu n’atteigne la plaque de métal. Personne ne pourra prétendre plus tard qu’il restait davantage de temps.",
  choose_shelter: "Les premiers éléments du camp sont déplacés vers l’endroit choisi. En quelques minutes, le paysage commence déjà à ressembler à une décision collective.",
  camp_tasks: "Le groupe se disperse. Lorsque chacun revient, le soleil a changé de côté et personne ne possède exactement la même version de la journée.",
  grey_case: "La mallette disparaît un instant derrière un siège et une décision silencieuse est prise loin du regard des autres.",
  rations: "Les portions sont distribuées dans un silence presque cérémoniel. Certains emballages restent pourtant plus légers que prévu.",
  missing_resource: "La recherche d’une réponse modifie immédiatement l’ambiance du camp. Ce qui était commun devient soudain personnel.",
  radio_voice: "Le dernier parasite s’éteint. Pendant quelques secondes, personne n’ose toucher à la radio.",
  expedition: "Le départ divise le camp entre ceux qui avancent vers l’inconnu et ceux qui regardent les arbres se refermer derrière eux.",
  ravine: "La faille finit par céder un passage, mais elle exige quelque chose en échange.",
  outpost: "Le générateur s’arrête dans un claquement sec. Les portes se referment une à une, laissant au groupe seulement ce qu’il a eu le temps d’emporter.",
  clues: "Les récits sont prononcés tour à tour. Certains détails se complètent. D’autres semblent avoir été soigneusement déplacés.",
  judgment: "Le verdict tombe sans rendre la vérité plus simple. Une personne se retrouve au centre du cercle, ou le doute reste assis parmi vous.",
  storm: "Lorsque la pluie frappe enfin, le camp n’est déjà plus le même. Les priorités choisies deviennent visibles dans ce qui tient encore debout.",
  generator: "Le générateur gémit, puis dirige ses dernières réserves d’énergie vers les systèmes choisis. Les autres écrans s’éteignent définitivement.",
  black_dossier: "Le terminal attend une dernière commande. Puis l’écran change, et avec lui la quantité de vérité que le groupe pourra emporter.",
  trapped: "La poussière retombe assez pour révéler le résultat. Le couloir, lui, continue de se refermer.",
  escape_route: "Le choix est validé sur le panneau de contrôle. Une route s’allume tandis que les autres passent au rouge.",
  final_choice: "Les décisions secrètes se croisent au même instant. Certaines mains attendent les autres. Certaines cherchent déjà la première place libre.",
  last_wave: "La vague se retire enfin. Derrière elle, il ne reste plus de décision à prendre, seulement les conséquences de toutes les précédentes.",
};

function resultEcho(game, eventId) {
  const flags = game.flags;
  if (eventId === 'save_nora') {
    return flags.noraAlive
      ? "Nora reste quelques secondes à genoux sur le sable. « Je n’oublierai pas ça », dit-elle. Puis, plus bas : « Et je crois que le pilote savait où nous allions. »"
      : "Le groupe s’éloigne sans se retourner. Pourtant, bien après que l’épave a disparu derrière les arbres, personne ne parvient à oublier la dernière voix restée près du feu.";
  }
  if (eventId === 'grey_case' && flags.briefcaseState === 'hidden') return "Le groupe ne voit revenir qu’une silhouette couverte de poussière. La mallette, elle, change désormais l’équilibre de la partie sans que les autres sachent même qu’elle existe.";
  if (eventId === 'grey_case' && flags.hasBlackBox) return "Nora pâlit en voyant le module. « Ce n’était pas dans le manifeste passagers », affirme-t-elle. La carte partielle indique une zone au nord de l’île.";
  if (eventId === 'judgment' && game.gauges.cohesion < 0) return "Même lorsque la discussion se termine, personne ne reprend sa place habituelle autour du feu. La distance entre les survivants est devenue plus facile à mesurer que celle jusqu’aux secours.";
  if (eventId === 'black_dossier' && flags.evidenceState === 'revealed') return `Le silence qui suit est plus lourd que l’alarme. ${plots[game.plot.id]?.truth ?? ''}`;
  if (eventId === 'black_dossier' && flags.evidenceState === 'hidden') return "Le terminal s’éteint avant que les autres puissent lire. Quelqu’un quitte la pièce avec une vérité que le groupe croit encore inaccessible.";
  if (eventId === 'black_dossier' && flags.evidenceState === 'destroyed') return "Les fichiers disparaissent ligne après ligne. Le danger immédiat recule, mais personne ne pourra jamais prouver ce qui s’est réellement passé ici.";
  if (eventId === 'trapped' && flags.leftBehind) return "La porte de sécurité se referme entre le groupe et la personne abandonnée. Le bruit du verrou accompagne les survivants jusqu’au couloir suivant.";
  if (eventId === 'final_choice' && flags.sabotageSuccess) return "Quelque part dans le mécanisme, un geste discret vient de transformer une issue fragile en piège. Les autres continuent pourtant d’avancer, sans savoir que la route est déjà compromise.";
  if (eventId === 'final_choice' && flags.sabotageBlocked) return "Un détail ne colle pas. Une main intervient au bon moment, une pièce est remise en place, et la tentative disparaît avant de condamner tout le monde.";
  return null;
}

function playerName(game, id) {
  return game.players.find((player) => player.id === id)?.name ?? 'Une personne';
}

function rankedDecisionIds(entry) {
  const counts = new Map();
  choiceValues(entry).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function decisionNarrative(game, eventId) {
  const entry = historyChoice(game, eventId);
  if (!entry) return null;
  const values = choiceValues(entry);
  const group = typeof entry.choices?.group === 'string' ? entry.choices.group : entry.choices?.group?.choiceId;
  const actor = playerName(game, entry.extra?.actorId ?? entry.extra?.volunteerId);

  if (eventId === 'impact_escape') {
    const helpers = Object.entries(entry.choices).filter(([, value]) => (typeof value === 'string' ? value : value?.choiceId) === 'help').map(([id]) => playerName(game, id));
    const exits = values.filter((value) => value === 'exit').length;
    const searchers = Object.entries(entry.choices).filter(([, value]) => (typeof value === 'string' ? value : value?.choiceId) === 'search').map(([id]) => playerName(game, id));
    const parts = [];
    if (helpers.length) parts.push(`${helpers.join(', ')} se tourne${helpers.length > 1 ? 'nt' : ''} vers les blessés au lieu de courir immédiatement vers l’extérieur.`);
    parts.push(exits ? 'Une issue est dégagée avant que la fumée ne remplisse entièrement la cabine.' : 'Aucune sortie n’est préparée : le groupe doit arracher son passage dans la fumée et le métal brûlant.');
    if (searchers.length) parts.push(`${searchers.join(', ')} ressort${searchers.length > 1 ? 'ent' : ''} avec ce qu’il a été possible de saisir dans les bagages éventrés.`);
    return parts.join(' ');
  }
  if (eventId === 'burning_crates') {
    const labels = { provisions: 'les provisions', medical: 'le matériel médical', communication: 'la caisse de communication', equipment: "l’équipement de survie" };
    const selected = rankedDecisionIds(entry).slice(0, Math.min(2, new Set(values).size)).map((id) => labels[id]);
    return selected.length === 1
      ? `Tout le monde se précipite vers ${selected[0]}. La caisse est sauvée, mais les trois autres disparaissent dans les flammes.`
      : `Le groupe parvient à tirer ${selected.join(' et ')} hors de la zone en feu. Le reste de la soute s’effondre avant qu’une troisième tentative soit possible.`;
  }
  if (eventId === 'save_nora') {
    if (group === 'save') return "Plusieurs mains se glissent sous la plaque. Au troisième effort, le métal se soulève assez pour que Nora rampe jusqu’au sable, le visage couvert de suie.";
    if (group === 'solo') return `${actor} reste auprès de Nora pendant que les autres reculent. La plaque finit par céder, mais l’effort laisse une blessure que personne ne pourra ignorer.`;
    return "Le groupe recule devant les flammes. Nora disparaît derrière la fumée tandis que chacun cherche une raison de ne pas se retourner.";
  }
  if (eventId === 'choose_shelter') {
    const text = { beach: 'sur la plage, face à la mer', fuselage: 'contre le fuselage, encore tiède sous les mains', jungle: 'à la lisière de la jungle, sous les premières ombres' }[group];
    return `Les bagages, couvertures et caisses sauvées sont transportés ${text}. Ce lieu devient votre camp, avec tous les avantages et les risques que vous venez d’accepter.`;
  }
  if (eventId === 'camp_tasks') {
    const counts = { water: 0, build: 0, wreck: 0 };
    values.forEach((value) => { if (value in counts) counts[value] += 1; });
    return `${counts.water} personne${counts.water > 1 ? 's cherchent' : ' cherche'} de l’eau, ${counts.build} travaille${counts.build > 1 ? 'nt' : ''} sur le refuge et ${counts.wreck} retourne${counts.wreck > 1 ? 'nt' : ''} dans l’épave. La répartition façonne directement ce que le groupe possède à la tombée du jour.`;
  }
  if (eventId === 'grey_case') {
    const finderId = Object.keys(entry.choices)[0];
    const finder = playerName(game, finderId);
    const choice = values[0];
    if (choice === 'show') return `${finder} revient avec la mallette dans les bras et la pose au centre du camp. À partir de cet instant, son secret appartient officiellement à tout le monde.`;
    if (choice === 'hide') return `${finder} glisse la mallette hors de vue et revient les mains apparemment vides. Le métal pèse désormais dans son sac et dans chaque conversation qui suivra.`;
    return game.flags.hasBlackBox
      ? `${finder} force la serrure. À l’intérieur, un module de boîte noire et une carte partielle apparaissent sous la mousse de protection.`
      : `${finder} insiste sur la serrure jusqu’à ce qu’un bruit réponde dans la forêt. La mallette reste fermée, mais votre présence paraît moins secrète qu’avant.`;
  }
  if (eventId === 'rations') {
    const shared = values.filter((value) => value === 'share').length;
    const extra = values.filter((value) => value === 'extra').length;
    if (shared === values.length) return "Toutes les portions sont réduites de la même manière. Personne ne mange à sa faim, mais personne ne détourne non plus les yeux avec honte.";
    if (extra) return `${extra} main${extra > 1 ? 's prennent' : ' prend'} davantage que prévu. Les réserves baissent, et les emballages déplacés rendent le geste plus difficile à nier.`;
    return "Chacun prend exactement sa part. Le partage est correct, sans être généreux, et le camp s’endort avec une paix fragile.";
  }
  if (eventId === 'missing_resource') {
    if (group === 'search') return "Les sacs sont vidés les uns après les autres sur le sol. Même lorsqu’un objet réapparaît, personne ne récupère intacte la confiance qui vient d’être fouillée avec lui.";
    if (group === 'interrogate') return "Une personne est placée au centre des questions. Ses réponses donnent une chronologie, mais pas la certitude recherchée.";
    return "Le groupe range les sacs sans ouvrir le débat. La paix est préservée pour quelques heures, et le doute trouve une place silencieuse près du feu.";
  }
  if (eventId === 'radio_voice') {
    if (group === 'answer') return "Une voix du groupe annonce votre position dans le micro. La radio répond par un souffle, puis un bip régulier qui prouve que le message a été reçu quelque part.";
    if (group === 'listen') return "Le volume est baissé et tout le monde retient son souffle. Un fragment supplémentaire parvient à une seule personne avant que la fréquence ne disparaisse.";
    return "Un coup suffit à briser le boîtier. Le silence qui suit est rassurant pendant une seconde, puis ressemble surtout à une porte définitivement fermée.";
  }
  if (eventId === 'expedition') {
    if (group === 'together') return "Tout le groupe quitte le camp en file serrée. Chaque bruit est affronté à plusieurs, mais derrière vous les réserves restent seules.";
    if (group === 'split') return "Le groupe se partage. Ceux qui restent voient les explorateurs disparaître entre les arbres, et chacun commence une version différente de la même journée.";
    return `${actor} part avec le strict nécessaire. Les autres restent au camp en attendant un retour qu’ils ne peuvent ni accélérer ni garantir.`;
  }
  if (eventId === 'ravine') {
    if (group === 'rope') return "La corde est tendue au-dessus du vide. Chacun traverse lentement, sans regarder le fond, jusqu’à ce que les fibres soient trop abîmées pour être réutilisées.";
    if (group === 'bridge') return "Des planches et des renforts du camp sont assemblés au-dessus de la faille. Le passage tient, mais le refuge vient de perdre une partie de sa solidité.";
    if (group === 'solo') return `${actor} s’engage seul sur la paroi. Lorsque ses pieds touchent l’autre côté, la distance qui le sépare du groupe semble soudain beaucoup plus grande que la faille.`;
    return "Le groupe marque l’endroit puis rebrousse chemin. Personne ne tombe, mais la porte métallique demeure de l’autre côté avec ses réponses.";
  }
  if (eventId === 'outpost') {
    const counts = { communications: 0, infirmary: 0, archives: 0 };
    values.forEach((value) => { if (value in counts) counts[value] += 1; });
    const visited = Object.entries(counts).filter(([, count]) => count).map(([id, count]) => `${count} vers ${id === 'communications' ? 'les communications' : id === 'infirmary' ? "l’infirmerie" : 'les archives'}`);
    return `Au signal de l’alarme, les survivants se dispersent : ${visited.join(', ')}. Lorsque l’électricité s’arrête, chacun revient avec seulement ce qu’il a eu le temps d’arracher à la station.`;
  }
  if (eventId === 'clues') {
    const reveal = values.filter((value) => value === 'reveal').length;
    const hide = values.filter((value) => value === 'hide').length;
    const distort = values.filter((value) => value === 'distort').length;
    return `${reveal} indice${reveal > 1 ? 's sont racontés' : ' est raconté'} fidèlement, ${hide} reste${hide > 1 ? 'nt' : ''} dans le silence et ${distort} récit${distort > 1 ? 's changent' : ' change'} légèrement de forme. La vérité arrive au jugement déjà fragmentée.`;
  }
  if (eventId === 'judgment') {
    const accusations = Object.entries(entry.choices).filter(([, value]) => (typeof value === 'string' ? value : value?.choiceId) === 'accuse');
    const targets = accusations.map(([, value]) => playerName(game, value?.targetId));
    if (targets.length) return `Les accusations prononcent ${[...new Set(targets)].join(', ')}. La discussion ne ressemble plus à une enquête : elle devient une décision sur la personne à qui le groupe refusera désormais sa confiance.`;
    return "Aucun nom n’obtient assez de voix. Le groupe évite peut-être une erreur, mais le câble de la radio reste coupé et la question sans réponse.";
  }
  if (eventId === 'storm') {
    const counts = { reinforce: 0, radio: 0, move: 0, capsule: 0 };
    values.forEach((value) => { if (value in counts) counts[value] += 1; });
    return `${counts.reinforce} personne${counts.reinforce > 1 ? 's renforcent' : ' renforce'} le refuge, ${counts.radio} protège${counts.radio > 1 ? 'nt' : ''} la radio et ${counts.move} pousse${counts.move > 1 ? 'nt' : ''} au départ. Pendant ce temps, ${counts.capsule} capsule${counts.capsule > 1 ? 's disparaissent' : ' disparaît'} discrètement de l’épave.`;
  }
  if (eventId === 'generator') {
    const labels = { beacon: 'la balise de secours', boat: 'le hangar maritime', medical: 'le système médical', beacon_boat: 'la balise et le hangar maritime', beacon_medical: 'la balise et le système médical', boat_medical: 'le hangar maritime et le système médical' };
    return `Les câbles sont déplacés vers ${labels[group] ?? 'le système choisi'}. Les installations retenues reprennent vie tandis que les autres s’éteignent une dernière fois.`;
  }
  if (eventId === 'black_dossier') {
    const holder = playerName(game, Object.keys(entry.choices)[0]);
    const choice = values[0];
    if (choice === 'reveal') return `${holder} laisse les fichiers défiler sur l’écran. Les autres lisent la vérité en même temps, sans possibilité de revenir à l’ignorance.`;
    if (choice === 'hide') return `${holder} coupe l’écran avant l’arrivée du groupe. La preuve reste personnelle et peut désormais valoir une place, une protection ou une future trahison.`;
    return `${holder} confirme l’effacement. Les fichiers disparaissent du terminal, et la station perd avec eux la seule version complète du crash.`;
  }
  if (eventId === 'trapped') {
    const target = game.flags.leftBehind === 'nora' ? 'Nora' : game.flags.leftBehind ? playerName(game, game.flags.leftBehind) : game.flags.noraAlive ? 'Nora' : 'la personne piégée';
    if (group === 'rescue') return `Le groupe revient sous la poutre et libère ${target} avant la fermeture du secteur. Les secondes perdues se transforment immédiatement en danger supplémentaire.`;
    if (group === 'continue') return `La porte se referme avec ${target} de l’autre côté. Personne ne peut plus transformer ce choix en simple retard.`;
    return `${actor} se glisse sous la structure, accepte le choc et libère ${target}. Le couloir est franchi, mais le sacrifice reste visible sur chaque pas.`;
  }
  if (eventId === 'escape_route') {
    const labels = { air: 'le sauvetage aérien', boat: "l’embarcation du hangar", shelter: 'le refuge', raft: "le radeau d’urgence", stay: "la décision de rester sur l’île" };
    return `Le groupe engage toutes ses dernières ressources vers ${labels[game.flags.route] ?? labels[group]}. Cette route existe parce que vos choix précédents l’ont laissée ouverte.`;
  }
  if (eventId === 'final_choice') {
    const waiters = values.filter((value) => value === 'wait').length;
    const boarders = values.filter((value) => value === 'board').length;
    const givers = values.filter((value) => value === 'give').length;
    const proof = values.filter((value) => value === 'proof').length;
    return `${waiters} personne${waiters > 1 ? 's refusent' : ' refuse'} de partir sans le groupe, ${boarders} cherche${boarders > 1 ? 'nt' : ''} à embarquer immédiatement, ${givers} offre${givers > 1 ? 'nt' : ''} une place et ${proof} choisit${proof > 1 ? 'sent' : ''} d’emporter la vérité. Ces gestes déterminent désormais qui compte comme survivant.`;
  }
  if (eventId === 'last_wave') {
    if (group === 'lighten') return "Les sacs, outils et souvenirs sont jetés sans tri. Le groupe gagne les secondes dont il avait besoin, au prix de tout ce qui ne peut pas être porté.";
    if (group === 'volunteer') return `${actor} reste au passage pendant que les autres avancent. Chaque seconde tenue ouverte devient une chance supplémentaire pour le groupe.`;
    return "Tout le monde se serre et avance ensemble. Le groupe refuse de gagner du temps en laissant une personne seule face à la vague.";
  }
  return null;
}

export function getResultNarrative(game, result) {
  const eventId = result.eventId;
  const paragraphs = [];
  if (resultLead[eventId]) paragraphs.push(resultLead[eventId]);
  const decision = decisionNarrative(game, eventId);
  if (decision) paragraphs.push(decision);
  const echo = resultEcho(game, eventId);
  if (echo && echo !== decision) paragraphs.push(echo);
  if (!paragraphs.length && result.summary?.length) {
    paragraphs.push("La décision est prise. Ses effets se font sentir immédiatement, même si certaines conséquences ne se révéleront que plus tard.");
  }
  return paragraphs;
}

function routeName(route) {
  return ({ air: 'le sauvetage aérien', boat: "l’embarcation", shelter: 'le refuge', raft: "le radeau d’urgence", stay: "l’île elle-même" })[route] ?? 'la dernière route disponible';
}

export function getEndingNarrative(game) {
  const ending = game.ending;
  const escaped = namesFromIds(game, ending.escapedIds);
  const stayed = game.players.filter((player) => !ending.escapedIds.includes(player.id)).map((player) => player.name);
  const route = routeName(ending.route);
  const paragraphs = [];
  const escapedText = escaped.length ? escaped.join(', ') : 'Personne';
  const stayedText = stayed.length ? stayed.join(', ') : 'personne';

  const openings = {
    everyone_home: `Au dernier moment, ${route} tient. Les moteurs, les pales ou les amarres couvrent le bruit de la tempête tandis que ${escapedText} quitte enfin l’île. Pendant quelques secondes, personne ne parle. Il suffit de regarder la côte diminuer pour comprendre que vous êtes réellement en train de survivre.`,
    duo_together: `La place semble d’abord insuffisante. Pourtant, aucun des deux joueurs ne part. Ce refus oblige à chercher une autre solution, à déplacer une cloison, libérer un compartiment ou maintenir le système quelques secondes de plus. Lorsque l’île commence à s’éloigner, vous êtes encore deux.`,
    seat_price: `${route} fonctionne, mais pas pour tout le monde. ${escapedText} parvient à partir tandis que ${stayedText} reste sur l’île. Il n’y a pas de véritable adieu, seulement des regards échangés dans le bruit du vent et la certitude que ce départ aura toujours un prix.`,
    last_survivor: `${escapedText} est la seule personne à franchir la dernière limite. L’île disparaît derrière la pluie, emportant les voix, les promesses et les versions contradictoires de ce qui s’est passé. Survivre seul donne du temps. Cela ne donne pas forcément une réponse.`,
    those_who_stay: `Le groupe renonce au départ immédiat. Les portes sont consolidées, les réserves rassemblées et chacun reprend une place dans le refuge. Lorsque la tempête frappe, la structure tient. Au matin, ${stayedText} est toujours là. Une lumière bouge pourtant sur l’horizon.`,
    false_rescue: `L’hélicoptère qui traverse les nuages porte bien le symbole aperçu dans la station. Des hommes en tenue sombre descendent avant même l’arrêt des pales. Ils vous font monter, récupèrent la boîte noire et confisquent chaque appareil capable d’avoir enregistré une preuve. Vous êtes sauvés. Du moins, officiellement.`,
    island_secret: `${route} vous arrache à l’île, mais pas avec toute la vérité. Les fichiers ont disparu, la preuve est cachée ou la boîte noire reste derrière. Lorsque les secours demanderont ce qui a causé le crash, chacun devra choisir entre ce qu’il sait et ce qu’il peut encore prouver.`,
    no_return: `La dernière route échoue. Les voyants passent au rouge et l’île referme ses accès sous la tempête. Pourtant, ${stayedText} survit à la nuit. Le refuge, les réserves et les connaissances acquises transforment peu à peu le naufrage en installation durable. Vous ne repartez pas. Pas encore.`
  };
  paragraphs.push(openings[ending.id] ?? ending.text);

  if (game.flags.noraAlive && game.flags.leftBehind !== 'nora') {
    paragraphs.push("Nora survit avec le groupe. Une fois le danger passé, elle raconte enfin ce qu’elle avait compris dans le cockpit : le changement de trajectoire, le symbole de la station et la peur du pilote lorsqu’il a aperçu l’île. Sa présence n’a pas seulement sauvé un code. Elle a donné un témoin à votre histoire.");
  } else if (game.flags.noraAbandoned || game.flags.leftBehind === 'nora') {
    paragraphs.push("Nora ne se trouve pas parmi ceux qui atteignent cette issue. Son absence demeure dans le récit comme une porte laissée ouverte derrière vous. Certaines réponses, certains codes et peut-être une autre version du crash sont restés avec elle.");
  }

  paragraphs.push(game.ending.truth);

  if (game.flags.evidenceState === 'revealed') {
    paragraphs.push("La vérité a été partagée avant le départ. Aucun survivant ne peut désormais prétendre qu’il ne savait pas. Cette connaissance vous unit peut-être, ou vous condamne à raconter exactement la même histoire au monde extérieur.");
  } else if (game.flags.evidenceState === 'hidden') {
    const holder = game.players.find((player) => player.id === game.flags.evidenceHolder)?.name ?? 'Une personne du groupe';
    paragraphs.push(`${holder} emporte encore une preuve que les autres n’ont jamais vue. Elle pourra innocenter le groupe, exposer l’opération menée sur l’île, ou devenir une monnaie d’échange. La partie est terminée, mais ce secret, lui, vient seulement de commencer.`);
  } else if (game.flags.evidenceState === 'destroyed') {
    paragraphs.push("Les preuves ont été détruites. L’île conservera sa version des faits et le monde extérieur recevra une histoire plus simple : un appareil disparu, quelques survivants, beaucoup de zones d’ombre.");
  }

  if (game.gauges.cohesion >= 3) {
    paragraphs.push("Malgré la peur, le groupe a continué à choisir la solidarité assez souvent pour qu’elle devienne une véritable ressource. Au moment décisif, personne n’a eu besoin de demander deux fois qui devait tendre la main.");
  } else if (game.gauges.cohesion <= 0) {
    paragraphs.push("Vous atteignez cette fin avec une confiance brisée. Les survivants connaissent les vols, les accusations et les abandons qui ont jalonné le chemin. Quitter l’île ne signifie pas forcément quitter ce qui s’y est passé.");
  }

  return paragraphs.filter(Boolean);
}

export function getStoryEchoes(game) {
  const echoes = [];
  if (game.flags.noraAlive) echoes.push('Nora a été sauvée de l’épave.');
  if (game.flags.noraAbandoned) echoes.push('Nora a été abandonnée près du fuselage.');
  if (game.flags.briefcaseState === 'hidden') echoes.push('La mallette a été cachée au groupe.');
  if (game.flags.briefcaseState === 'opened') echoes.push('La mallette a révélé la boîte noire et une carte.');
  if (game.flags.bagsSearched) echoes.push('Les sacs personnels ont été fouillés.');
  if (game.flags.leftBehind) echoes.push('Une personne a été laissée dans la station.');
  if (game.flags.sabotageSuccess) echoes.push('Le départ a été secrètement compromis.');
  const broken = (game.flags.promises ?? []).filter((promise) => promise.resolved && !promise.honored);
  if (broken.length) echoes.push(`${broken.length} promesse${broken.length > 1 ? 's ont' : ' a'} été brisée${broken.length > 1 ? 's' : ''} après une discussion publique.`);
  const betrayals = game.betrayalLog ?? [];
  if (betrayals.length) echoes.push(`${betrayals.length} trahison${betrayals.length > 1 ? 's ciblées ont' : ' ciblée a'} modifié les relations du groupe.`);
  if ((game.flags.timedOutDecisions ?? 0) > 0) echoes.push(`${game.flags.timedOutDecisions} décision${game.flags.timedOutDecisions > 1 ? 's ont' : ' a'} été prise par l’urgence faute de réponse à temps.`);
  if ((game.flags.branchPath ?? []).length) echoes.push(`Votre chemin : ${game.flags.branchPath.join(' → ')}.`);
  return echoes;
}
