import { abilities, endings, events, getEventById, plots } from './gameData.js';

function clone(value) {
  return structuredClone(value);
}

function cap(value, min = 0, max = 5) {
  return Math.max(min, Math.min(max, value));
}

function choiceId(value) {
  return typeof value === 'string' ? value : value?.choiceId;
}

function targetId(value) {
  return typeof value === 'object' ? value?.targetId ?? null : null;
}

function addStatus(player, status) {
  if (player && !player.statuses.includes(status)) player.statuses.push(status);
}

function removeStatus(player, status) {
  if (!player) return;
  player.statuses = player.statuses.filter((item) => item !== status);
}

function addPersonalItem(player, item) {
  if (!player || player.inventory.includes(item)) return false;
  if (player.inventory.length >= 2) return false;
  player.inventory.push(item);
  return true;
}

function addGroupItem(game, item) {
  if (!game.groupInventory.includes(item)) game.groupInventory.push(item);
}

function removeItem(game, item) {
  const groupIndex = game.groupInventory.indexOf(item);
  if (groupIndex >= 0) {
    game.groupInventory.splice(groupIndex, 1);
    return true;
  }
  for (const player of game.players) {
    const index = player.inventory.indexOf(item);
    if (index >= 0) {
      player.inventory.splice(index, 1);
      return true;
    }
  }
  return false;
}

function hasItem(game, item) {
  return game.groupInventory.includes(item) || game.players.some((player) => player.inventory.includes(item));
}

function addGauge(game, key, amount) {
  const min = key === 'cohesion' ? -5 : 0;
  game.gauges[key] = cap((game.gauges[key] ?? 0) + amount, min, 5);
}

function loseLife(player, reason = 'environment') {
  if (!player) return false;
  if (player.statuses.includes('Protégé')) {
    removeStatus(player, 'Protégé');
    return false;
  }
  if (reason === 'environment' && player.statuses.includes('Endurant')) {
    removeStatus(player, 'Endurant');
    return false;
  }
  if (player.statuses.includes('Chance')) {
    removeStatus(player, 'Chance');
    return false;
  }
  player.lives = Math.max(0, player.lives - 1);
  if (player.lives === 0) addStatus(player, 'Séparé du groupe');
  return true;
}

function healPlayer(player, amount = 1) {
  if (!player) return;
  player.lives = Math.min(3, player.lives + amount);
  removeStatus(player, 'Blessé');
  removeStatus(player, 'Affaibli');
  if (player.lives > 0) removeStatus(player, 'Séparé du groupe');
}


const HIDDEN_PUBLIC_STATUSES = new Set(['Protégé', 'Endurant', 'Chance', 'Contaminé']);

const TALENT_CONTEXTS = {
  doctor: new Set(['save_nora', 'camp_tasks', 'rations', 'storm', 'jungle_ambush', 'ravine', 'outpost', 'medical_protocol', 'trapped', 'last_wave', 'bonus_fever', 'bonus_fire', 'bonus_current']),
  protector: new Set(['save_nora', 'shelter_fuselage_aftershock', 'jungle_ambush', 'ravine', 'storm', 'trapped', 'last_wave', 'bonus_fire', 'bonus_current']),
  tinkerer: new Set(['burning_crates', 'radio_voice', 'shelter_fuselage_aftershock', 'ravine', 'outpost', 'sabotage_clues', 'storm', 'generator', 'beacon_reply', 'boat_capacity', 'trapped', 'escape_route', 'last_wave', 'bonus_fire', 'bonus_silence']),
  scout: new Set(['choose_shelter', 'shelter_beach_tide', 'shelter_jungle_source', 'expedition', 'scout_route', 'ravine', 'outpost', 'storm', 'generator', 'escape_route']),
  observer: new Set(['missing_resource', 'radio_voice', 'sabotage_clues', 'judgment', 'revenge_offer', 'saboteur_cornered', 'uneasy_truce', 'black_dossier', 'final_choice']),
  negotiator: new Set(['save_nora', 'choose_shelter', 'missing_resource', 'expedition', 'judgment', 'storm', 'generator', 'trapped', 'escape_route', 'last_wave']),
  enduring: new Set(['impact_escape', 'burning_crates', 'save_nora', 'shelter_beach_tide', 'shelter_fuselage_aftershock', 'shelter_jungle_source', 'jungle_ambush', 'ravine', 'storm', 'trapped', 'last_wave', 'bonus_fever', 'bonus_fire', 'bonus_current']),
  lucky: new Set(['impact_escape', 'burning_crates', 'save_nora', 'rations', 'missing_resource', 'radio_voice', 'jungle_ambush', 'split_cache', 'ravine', 'judgment', 'storm', 'trapped', 'final_choice', 'last_wave']),
};

const AFTERLIFE_PROFILES = {
  isolated: {
    id: 'isolated',
    title: 'Survivant isolé',
    icon: '🌫️',
    briefing: "Tu es vivant, mais coupé du groupe. Une fois par chapitre, tu peux envoyer un signe, fouiller seul ou préparer ton retour.",
  },
  lost: {
    id: 'lost',
    title: 'Disparu dans la jungle',
    icon: '🌴',
    briefing: "Le groupe te croit perdu. Tu peux guider les autres, les égarer ou retrouver peu à peu le chemin du camp.",
  },
  prisoner: {
    id: 'prisoner',
    title: 'Prisonnier de la station',
    icon: '⛓️',
    briefing: "Tu es bloqué derrière les parois de la station. Tu peux agir sur ses systèmes, transmettre une preuve ou préparer une sortie.",
  },
  contaminated: {
    id: 'contaminated',
    title: 'Contaminé',
    icon: '☣️',
    briefing: "Ton état t’éloigne des autres. Tu peux résister, avertir le groupe ou céder à une action plus dangereuse.",
  },
  guardian: {
    id: 'guardian',
    title: 'Protecteur dans l’ombre',
    icon: '🕯️',
    briefing: "Ton sacrifice t’a séparé du groupe, mais tu peux encore protéger quelqu’un, inspirer les survivants ou tenter de revenir.",
  },
};

function isSeparatedPlayer(player) {
  return Boolean(player?.afterlife?.active) || (player?.lives ?? 0) <= 0 || player?.statuses?.includes('Séparé du groupe');
}

export function getActivePlayers(game) {
  return (game?.players ?? []).filter((player) => !isSeparatedPlayer(player));
}

function inferAfterlifeProfile(player, eventId) {
  if (player?.statuses?.includes('Contaminé') || ['bonus_fever', 'medical_protocol'].includes(eventId)) return AFTERLIFE_PROFILES.contaminated;
  if (['generator', 'beacon_reply', 'boat_capacity', 'medical_protocol', 'black_dossier', 'trapped'].includes(eventId)) return AFTERLIFE_PROFILES.prisoner;
  if (['shelter_jungle_source', 'jungle_ambush', 'split_cache', 'scout_route', 'ravine', 'outpost', 'bonus_tracks', 'bonus_cave'].includes(eventId)) return AFTERLIFE_PROFILES.lost;
  if (['save_nora', 'trapped', 'last_wave'].includes(eventId)) return AFTERLIFE_PROFILES.guardian;
  return AFTERLIFE_PROFILES.isolated;
}

function assignAfterlifeRoles(game, eventId, beforeLives = {}) {
  game.players.forEach((player) => {
    const justReachedZero = (beforeLives[player.id] ?? player.lives) > 0 && player.lives <= 0;
    if (!justReachedZero || player.afterlife?.active) return;
    const profile = inferAfterlifeProfile(player, eventId);
    player.afterlife = {
      ...profile,
      active: true,
      returnProgress: 0,
      lastActedChapter: null,
      enteredAtEvent: eventId,
      actionsTaken: [],
    };
    addStatus(player, 'Séparé du groupe');
    player.secrets.push(`${profile.title} : ${profile.briefing}`);
    game.history.push({ type: 'afterlife-entered', playerId: player.id, profileId: profile.id, eventId, at: new Date().toISOString() });
  });
}

export function getPendingAfterlifePlayers(game, event) {
  if (!game || !event) return [];
  return game.players.filter((player) => player.afterlife?.active && player.afterlife.lastActedChapter !== event.chapter);
}

export function getAfterlifeChoices(game, playerId, event) {
  const player = game?.players?.find((item) => item.id === playerId);
  if (!player?.afterlife?.active) return [];
  const common = [
    { id: 'return', icon: '🧭', label: 'Chercher un chemin de retour', description: 'Progresse vers un possible retour dans le groupe.' },
  ];
  const choices = {
    isolated: [
      { id: 'signal', icon: '🔦', label: 'Envoyer un signe discret', description: 'Le groupe gagne un indice de route ou de signal.' },
      { id: 'scavenge', icon: '🎒', label: 'Fouiller seul', description: 'Tu peux faire parvenir une petite ressource au groupe.' },
    ],
    lost: [
      { id: 'guide', icon: '🪶', label: 'Laisser une piste fiable', description: 'Le prochain danger de route sera mieux anticipé.' },
      { id: 'mislead', icon: '🕳️', label: 'Créer une fausse piste', description: 'Tu peux égarer le groupe sans révéler ton intervention.' },
    ],
    prisoner: [
      { id: 'unlock', icon: '🔧', label: 'Forcer un mécanisme', description: 'Une réparation ou une ouverture devient possible.' },
      { id: 'evidence', icon: '📼', label: 'Transmettre une preuve', description: 'Le groupe reçoit une information fiable contre un mensonge.' },
    ],
    contaminated: [
      { id: 'resist', icon: '🫁', label: 'Résister à la contamination', description: 'Tu avances vers un retour et stabilises ton état.' },
      { id: 'spread', icon: '☣️', label: 'Contaminer une réserve', description: 'Le danger augmente et ton action reste secrète.', requiresTarget: true, targetLabel: 'Qui subira les conséquences ?' },
    ],
    guardian: [
      { id: 'protect', icon: '🛡️', label: 'Protéger quelqu’un dans l’ombre', description: 'Une personne ignorera sa prochaine perte de vie.', requiresTarget: true, targetLabel: 'Qui veux-tu protéger ?' },
      { id: 'inspire', icon: '🕯️', label: 'Laisser un message d’espoir', description: 'La cohésion du groupe augmente.' },
    ],
  }[player.afterlife.id] ?? [];
  return [...choices, ...common];
}

export function resolveAfterlifeAction(game, playerId, actionId, selectedTargetId = null, eventId = null) {
  const next = clone(game);
  const player = next.players.find((item) => item.id === playerId);
  const event = getEventById(eventId) ?? getCurrentEvent(next);
  if (!player?.afterlife?.active) throw new Error('Ce joueur ne possède pas de parcours séparé actif.');
  if (!event) throw new Error('Aucun événement actif.');
  if (player.afterlife.lastActedChapter === event.chapter) throw new Error('Cette intervention a déjà été utilisée pendant ce chapitre.');
  const available = getAfterlifeChoices(next, playerId, event);
  const action = available.find((item) => item.id === actionId);
  if (!action) throw new Error('Action séparée indisponible.');
  const target = next.players.find((item) => item.id === selectedTargetId && item.id !== playerId);
  const result = { title: `${player.afterlife.icon} ${player.afterlife.title}`, summary: [], secret: true };

  if (actionId === 'signal') {
    addGauge(next, 'signal', 1);
    next.flags.scoutHint = true;
    result.summary.push('Un signe discret atteint le groupe : Signal +1.');
  }
  if (actionId === 'scavenge') {
    addGauge(next, 'reserves', 1);
    result.summary.push('Une petite réserve est déposée près du camp : Réserves +1.');
  }
  if (actionId === 'guide') {
    next.flags.scoutHint = true;
    addGauge(next, 'cohesion', 1);
    result.summary.push('Une piste fiable guide les survivants : Cohésion +1.');
  }
  if (actionId === 'mislead') {
    addGauge(next, 'danger', 1);
    recordBetrayal(next, player.id, null, 'Fausse piste laissée depuis la jungle', event.id, false);
    result.summary.push('Une fausse piste détourne le groupe : Danger +1.');
  }
  if (actionId === 'unlock') {
    next.flags.repairToken = true;
    addGroupItem(next, 'Mécanisme déverrouillé');
    result.summary.push('Un mécanisme cède dans la station. Une réparation de fortune devient disponible.');
  }
  if (actionId === 'evidence') {
    next.flags.observerProof = true;
    result.summary.push('Une preuve fiable parvient au groupe.');
  }
  if (actionId === 'resist') {
    removeStatus(player, 'Contaminé');
    player.afterlife.returnProgress += 1;
    result.summary.push('La contamination recule et le chemin du retour se précise.');
  }
  if (actionId === 'spread') {
    addGauge(next, 'danger', 1);
    if (target) addStatus(target, 'Contaminé');
    recordBetrayal(next, player.id, target?.id ?? null, 'Contamination depuis l’isolement', event.id, false);
    result.summary.push(target ? `${target.name} est exposé à une contamination.` : 'Une réserve est contaminée : Danger +1.');
  }
  if (actionId === 'protect') {
    const protectedTarget = target ?? getActivePlayers(next)[0];
    if (protectedTarget) addStatus(protectedTarget, 'Protégé');
    result.summary.push(protectedTarget ? `${protectedTarget.name} reçoit une protection invisible.` : 'La protection ne trouve aucune cible.');
  }
  if (actionId === 'inspire') {
    addGauge(next, 'cohesion', 1);
    result.summary.push('Un message inattendu redonne du courage : Cohésion +1.');
  }
  if (actionId === 'return') {
    player.afterlife.returnProgress += 1;
    result.summary.push('Tu avances vers le groupe sans encore pouvoir le rejoindre.');
  }

  if (player.afterlife.returnProgress >= 2) {
    player.lives = 1;
    player.afterlife.active = false;
    removeStatus(player, 'Séparé du groupe');
    removeStatus(player, 'Laissé derrière');
    addStatus(player, 'Revenu de justesse');
    result.summary.push(`${player.name} retrouve le groupe avec une vie.`);
  }

  player.afterlife.lastActedChapter = event.chapter;
  player.afterlife.actionsTaken.push({ actionId, eventId: event.id, chapter: event.chapter, targetId: target?.id ?? null });
  next.history.push({ type: 'afterlife-action', playerId, actionId, targetId: target?.id ?? null, eventId: event.id, chapter: event.chapter, at: new Date().toISOString() });
  return { game: next, result };
}

function abilityIsContextual(game, player, event) {
  if (!player || !event || player.ability?.used || isSeparatedPlayer(player)) return false;
  const prompted = player.ability.promptedEvents ?? [];
  if (prompted.includes(event.id)) return false;
  const allowed = TALENT_CONTEXTS[player.ability.id];
  if (!allowed?.has(event.id)) return false;
  if (player.ability.id === 'doctor') {
    return game.players.some((candidate) => candidate.lives < 3 || candidate.statuses.some((status) => ['Blessé', 'Affaibli', 'Contaminé'].includes(status)));
  }
  return true;
}

export function getEligibleTalentPlayers(game, event) {
  if (!game || !event) return [];
  return game.players.filter((player) => abilityIsContextual(game, player, event));
}

export function markTalentPrompted(game, playerId, eventId) {
  const next = clone(game);
  const player = next.players.find((item) => item.id === playerId);
  if (!player) return next;
  player.ability.promptedEvents ??= [];
  if (!player.ability.promptedEvents.includes(eventId)) player.ability.promptedEvents.push(eventId);
  return next;
}

export function publicStatuses(player) {
  return (player?.statuses ?? []).filter((status) => !HIDDEN_PUBLIC_STATUSES.has(status) && status !== 'Séparé du groupe');
}

function pick(array, random = Math.random) {
  return array[Math.floor(random() * array.length)] ?? array[0];
}

function shuffled(array, random = Math.random) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function buildEventSequence(duration) {
  const core = events.filter((event) => !event.secondary && !event.branch);
  if (duration === 'short') return core.filter((event) => event.essential).map((event) => event.id);
  if (duration !== 'long') return core.map((event) => event.id);

  const bonusByChapter = new Map();
  events.filter((event) => event.secondary).forEach((event) => {
    if (!bonusByChapter.has(event.chapter)) bonusByChapter.set(event.chapter, []);
    bonusByChapter.get(event.chapter).push(event.id);
  });

  const sequence = [];
  core.forEach((event) => {
    sequence.push(event.id);
    const chapterEvents = core.filter((candidate) => candidate.chapter === event.chapter);
    const isLastOfChapter = chapterEvents.at(-1)?.id === event.id;
    if (isLastOfChapter) sequence.push(...(bonusByChapter.get(event.chapter) ?? []));
  });
  return sequence;
}

function assignPlot(players, random = Math.random) {
  const options = players.length >= 4
    ? ['accident', 'cargo', 'opportunist', 'saboteur']
    : ['accident', 'cargo', 'opportunist'];
  const plotId = pick(options, random);
  const specialPlayer = plotId === 'accident' ? null : pick(players, random);

  players.forEach((player) => {
    player.role = {
      id: 'survivor',
      title: 'Survivant',
      briefing: "Tu n’as reçu aucun objectif opposé au groupe. Ta manière de jouer reste entièrement libre.",
    };
  });

  if (specialPlayer && plotId === 'cargo') {
    specialPlayer.role = {
      id: 'cargo_keeper',
      title: 'Lié à la cargaison',
      briefing: "Tu sais que l’avion transportait une mallette importante. Retrouve-la et décide plus tard si le groupe mérite la vérité.",
    };
  }
  if (specialPlayer && plotId === 'opportunist') {
    specialPlayer.role = {
      id: 'opportunist',
      title: 'Opportuniste',
      briefing: "Tu peux gagner une victoire personnelle en quittant l’île avec les preuves, même si le groupe n’approuve pas.",
    };
  }
  if (specialPlayer && plotId === 'saboteur') {
    specialPlayer.role = {
      id: 'saboteur',
      title: 'Saboteur',
      briefing: "Empêche le signal d’atteindre son plein potentiel et tente de faire disparaître les preuves. Tu ne peux provoquer que deux sabotages directs.",
    };
  }

  return { id: plotId, specialPlayerId: specialPlayer?.id ?? null };
}

export function createInitialGame({ names, duration = 'normal', audience = 'all', random = Math.random }) {
  const cleanNames = names.map((name) => name.trim()).filter(Boolean).slice(0, 8);
  if (cleanNames.length < 2) throw new Error('Au moins deux joueurs sont nécessaires.');

  const abilityPool = shuffled(abilities, random);
  const players = cleanNames.map((name, index) => ({
    id: `p${index + 1}`,
    name,
    lives: 3,
    statuses: [],
    inventory: [],
    secrets: [],
    ability: { ...abilityPool[index % abilityPool.length], used: false, promptedEvents: [] },
    role: null,
    afterlife: null,
  }));
  const plot = assignPlot(players, random);
  const briefcaseFinder = pick(players, random)?.id ?? players[0].id;
  const radioListener = pick(players, random)?.id ?? players[0].id;

  return {
    version: 6,
    createdAt: new Date().toISOString(),
    settings: { duration, audience },
    players,
    plot,
    gauges: { reserves: 2, shelter: 0, signal: 0, danger: 1, cohesion: 0 },
    groupInventory: [],
    relations: Object.fromEntries(players.map((player) => [player.id, Object.fromEntries(players.filter((other) => other.id !== player.id).map((other) => [other.id, 0]))])),
    betrayalLog: [],
    flags: {
      noraAlive: false,
      noraAbandoned: false,
      briefcaseFinder,
      radioListener,
      briefcaseState: 'unknown',
      briefcaseOwner: null,
      hasBlackBox: false,
      hasMap: false,
      hasBattery: false,
      hasAccessCard: false,
      codeKnown: false,
      beaconActive: false,
      boatActive: false,
      evidenceState: 'unknown',
      evidenceHolder: null,
      shelterLocation: null,
      capsuleCount: 0,
      sabotageUsed: 0,
      sabotageBlocked: false,
      sabotageSuccess: false,
      repairToken: false,
      observerProof: false,
      scoutHint: false,
      leftBehind: null,
      route: null,
      routeFailed: false,
      escapedIds: [],
      finalChoices: {},
      promises: [],
      branchPath: [],
      expeditionScout: null,
      falseAccused: null,
      framedPlayer: null,
      boatSeatClaims: {},
      timedOutDecisions: 0,
    },
    eventSequence: buildEventSequence(duration),
    eventIndex: 0,
    history: [],
    briefingComplete: false,
    chapterTransition: 1,
    complete: false,
    ending: null,
  };
}

export function upgradeSavedGame(saved) {
  if (!saved) return null;
  if (saved.version >= 3 && Array.isArray(saved.eventSequence)) {
    const upgraded = clone(saved);
    upgraded.version = 6;
    upgraded.relations ??= Object.fromEntries(upgraded.players.map((player) => [player.id, Object.fromEntries(upgraded.players.filter((other) => other.id !== player.id).map((other) => [other.id, 0]))]));
    upgraded.betrayalLog ??= [];
    upgraded.flags ??= {};
    upgraded.flags.promises ??= [];
    upgraded.flags.branchPath ??= [];
    upgraded.flags.expeditionScout ??= null;
    upgraded.flags.falseAccused ??= null;
    upgraded.flags.framedPlayer ??= null;
    upgraded.flags.boatSeatClaims ??= {};
    upgraded.flags.timedOutDecisions ??= 0;
    upgraded.players.forEach((player) => {
      player.ability ??= { id: 'lucky', title: 'Chanceux', icon: '🍀', description: 'Annule une conséquence personnelle.', used: false };
      player.ability.promptedEvents ??= [];
      player.afterlife ??= null;
      if (player.lives <= 0 && !player.afterlife?.active) {
        const profile = AFTERLIFE_PROFILES.isolated;
        player.afterlife = { ...profile, active: true, returnProgress: 0, lastActedChapter: null, enteredAtEvent: 'migration', actionsTaken: [] };
        addStatus(player, 'Séparé du groupe');
      }
    });
    return upgraded;
  }

  const migrated = createInitialGame({
    names: saved.players?.map((player) => player.name) ?? ['Joueur 1', 'Joueur 2'],
    duration: saved.settings?.duration ?? 'normal',
    audience: saved.settings?.audience ?? 'all',
    random: () => 0,
  });

  migrated.players = migrated.players.map((player, index) => ({
    ...player,
    lives: saved.players?.[index]?.lives ?? 3,
    statuses: saved.players?.[index]?.statuses ?? [],
    inventory: saved.players?.[index]?.inventory ?? [],
  }));
  migrated.gauges = { ...migrated.gauges, ...(saved.gauges ?? {}) };
  migrated.history = saved.history ?? [];
  migrated.briefingComplete = true;
  migrated.plot = { id: 'accident', specialPlayerId: null };
  migrated.players.forEach((player) => {
    player.role = { id: 'survivor', title: 'Survivant', briefing: 'La partie a été reprise depuis une ancienne sauvegarde.' };
  });

  const noraSaved = migrated.history.some((item) => item.flag === 'nora_saved');
  const noraAbandoned = migrated.history.some((item) => item.flag === 'nora_abandoned');
  migrated.flags.noraAlive = noraSaved;
  migrated.flags.noraAbandoned = noraAbandoned;

  const legacyIndex = Math.max(0, Number(saved.eventIndex ?? 0));
  migrated.eventIndex = Math.min(legacyIndex, migrated.eventSequence.length);
  if (saved.chapterComplete && migrated.eventIndex <= 3) migrated.eventIndex = 3;
  const next = getCurrentEvent(migrated);
  migrated.chapterTransition = next?.chapter ?? null;
  return migrated;
}

export function getCurrentEvent(game) {
  if (!game || game.complete) return null;
  return getEventById(game.eventSequence[game.eventIndex]);
}

export function getEventActorId(game, event) {
  if (!event || event.mode !== 'privateOne') return null;
  let candidateId = null;
  if (event.actorRule === 'briefcaseFinder') candidateId = game.flags.briefcaseFinder;
  if (event.actorRule === 'evidenceHolder') candidateId = game.flags.evidenceHolder || game.flags.briefcaseOwner || game.flags.briefcaseFinder;
  if (event.actorRule === 'random') {
    const active = getActivePlayers(game);
    const pool = active.length ? active : game.players;
    const index = (game.eventIndex + pool.length) % pool.length;
    candidateId = pool[index]?.id;
  }
  if (event.actorRule === 'expeditionScout') candidateId = game.flags.expeditionScout;
  if (event.actorRule === 'falseAccused') candidateId = game.flags.falseAccused;
  if (event.actorRule === 'specialPlayer') candidateId = game.plot.specialPlayerId;
  const candidate = game.players.find((player) => player.id === candidateId);
  if (candidate && !isSeparatedPlayer(candidate)) return candidate.id;
  const fallback = getActivePlayers(game)[0] ?? game.players[0];
  return fallback?.id ?? null;
}

function routeIsAvailable(game, routeId) {
  if (routeId === 'air') return game.gauges.signal >= 4 && game.flags.beaconActive && game.flags.codeKnown;
  if (routeId === 'boat') return game.flags.boatActive && (game.gauges.reserves >= 1 || hasItem(game, 'Bidon de carburant'));
  if (routeId === 'shelter') return game.gauges.shelter >= 4 && game.gauges.reserves >= 2;
  if (routeId === 'raft') return hasItem(game, 'Corde') || hasItem(game, 'Équipement') || game.flags.repairToken;
  if (routeId === 'stay') return true;
  return false;
}

export function getAvailableChoices(game, event, playerId = null) {
  if (!event) return [];
  return event.choices.filter((choice) => {
    if (choice.requiresBattery && !game.flags.hasBattery && !hasItem(game, 'Batterie')) return false;
    if (choice.saboteurOnly) return game.players.find((player) => player.id === playerId)?.role?.id === 'saboteur';
    if (choice.route) return routeIsAvailable(game, choice.id);
    return true;
  });
}

export function useAbility(game, playerId, selectedTargetId = null, eventId = null) {
  const next = clone(game);
  const player = next.players.find((item) => item.id === playerId);
  if (!player) throw new Error('Joueur introuvable.');
  if (player.ability.used) throw new Error('Cette capacité a déjà été utilisée.');
  const event = getEventById(eventId) ?? getCurrentEvent(next);
  if (!abilityIsContextual(next, player, event)) throw new Error('Ce talent ne peut pas intervenir dans cette scène.');

  const target = next.players.find((item) => item.id === selectedTargetId && !isSeparatedPlayer(item)) ?? player;
  const result = { title: `${player.ability.icon} ${player.ability.title}`, summary: [] };

  switch (player.ability.id) {
    case 'doctor':
      healPlayer(target, 1);
      result.summary.push(`${target.name} récupère une vie et ses blessures sont stabilisées.`);
      break;
    case 'protector':
      addStatus(target, 'Protégé');
      result.summary.push(`${target.name} ignorera sa prochaine perte de vie.`);
      break;
    case 'tinkerer':
      next.flags.repairToken = true;
      addGroupItem(next, 'Réparation de fortune');
      result.summary.push('Une réparation de fortune pourra sauver un appareil ou une route d’évacuation.');
      break;
    case 'scout':
      next.flags.scoutHint = true;
      result.summary.push('Le prochain danger important sera signalé avant sa résolution.');
      break;
    case 'observer':
      next.flags.observerProof = true;
      result.summary.push('Une preuve fiable sera disponible lors du jugement ou contre un sabotage final.');
      break;
    case 'negotiator':
      addGauge(next, 'cohesion', 1);
      result.summary.push('La cohésion du groupe augmente de 1.');
      break;
    case 'enduring':
      addStatus(player, 'Endurant');
      result.summary.push(`${player.name} ignorera la prochaine perte de vie environnementale.`);
      break;
    case 'lucky':
      addStatus(player, 'Chance');
      result.summary.push(`${player.name} annulera sa prochaine conséquence personnelle négative.`);
      break;
    default:
      result.summary.push('La capacité est utilisée.');
  }

  player.ability.used = true;
  player.ability.promptedEvents ??= [];
  if (event && !player.ability.promptedEvents.includes(event.id)) player.ability.promptedEvents.push(event.id);
  next.history.push({ type: 'ability', playerId, abilityId: player.ability.id, eventId: event?.id ?? null, at: new Date().toISOString() });
  return { game: next, result };
}

function rankChoices(choices) {
  const order = [];
  const counts = {};
  Object.values(choices).forEach((value) => {
    const id = choiceId(value);
    if (!id) return;
    if (!(id in counts)) order.push(id);
    counts[id] = (counts[id] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]));
}

function firstTargetByLife(game) {
  return [...game.players].sort((a, b) => a.lives - b.lives)[0] ?? game.players[0];
}

function truthText(game) {
  return plots[game.plot.id]?.truth ?? plots.accident.truth;
}

function applySystem(game, id, result) {
  if (id === 'beacon') {
    game.flags.beaconActive = true;
    addGauge(game, 'signal', 2);
    result.summary.push('La balise de secours est activée : Signal +2.');
  }
  if (id === 'boat') {
    game.flags.boatActive = true;
    result.summary.push('Le hangar maritime s’ouvre. Une embarcation devient disponible.');
  }
  if (id === 'medical') {
    game.players.forEach((player) => healPlayer(player, 1));
    result.summary.push('Le système médical soigne l’ensemble du groupe.');
  }
}


function relationValue(game, fromId, toId) {
  return game.relations?.[fromId]?.[toId] ?? 0;
}

function changeTrust(game, observerId, subjectId, amount) {
  if (!observerId || !subjectId || observerId === subjectId) return;
  game.relations ??= {};
  game.relations[observerId] ??= {};
  game.relations[observerId][subjectId] = cap((game.relations[observerId][subjectId] ?? 0) + amount, -3, 3);
}

function recordSupport(game, actorId, targetId, label, eventId) {
  if (targetId) changeTrust(game, targetId, actorId, 1);
  game.history.push({ type: 'support', actorId, targetId, label, eventId, at: new Date().toISOString() });
}

function recordBetrayal(game, actorId, targetId, label, eventId, discovered = true) {
  if (targetId) {
    changeTrust(game, targetId, actorId, -2);
    const target = game.players.find((player) => player.id === targetId);
    if (discovered) addStatus(target, 'Méfiant');
  }
  game.betrayalLog ??= [];
  game.betrayalLog.push({ actorId, targetId, label, eventId, discovered, at: new Date().toISOString() });
  addGauge(game, 'cohesion', -1);
}

export function registerPromises(game, eventId, promises = []) {
  const next = clone(game);
  next.flags.promises ??= [];
  const validPlayerIds = new Set(next.players.map((player) => player.id));
  promises.forEach((promise) => {
    if (!validPlayerIds.has(promise.playerId)) return;
    if (promise.targetId && !validPlayerIds.has(promise.targetId)) return;
    next.flags.promises.push({
      id: `${eventId}-${promise.playerId}-${next.flags.promises.length + 1}`,
      eventId,
      playerId: promise.playerId,
      targetId: promise.targetId ?? null,
      promiseId: promise.promiseId,
      label: promise.label,
      expectedChoiceIds: [...(promise.expectedChoiceIds ?? [])],
      resolved: false,
    });
  });
  return next;
}

function applyPromiseOutcomes(game, event, choices, result) {
  const promises = (game.flags.promises ?? []).filter((promise) => promise.eventId === event.id && !promise.resolved);
  if (!promises.length) return;
  let kept = 0;
  let broken = 0;
  promises.forEach((promise) => {
    const actual = choiceId(choices[promise.playerId]);
    const honored = promise.expectedChoiceIds.includes(actual);
    promise.resolved = true;
    promise.actualChoiceId = actual ?? 'inaction';
    promise.honored = honored;
    const actor = game.players.find((player) => player.id === promise.playerId);
    const target = game.players.find((player) => player.id === promise.targetId);
    if (honored) {
      kept += 1;
      if (target) recordSupport(game, actor?.id, target.id, promise.label, event.id);
    } else {
      broken += 1;
      recordBetrayal(game, actor?.id, target?.id ?? null, `Promesse brisée : ${promise.label}`, event.id, true);
    }
  });
  if (kept) {
    addGauge(game, 'cohesion', 1);
    result.summary.push(`${kept} promesse${kept > 1 ? 's ont' : ' a'} été tenue${kept > 1 ? 's' : ''}. Cohésion +1.`);
  }
  if (broken) result.summary.push(`${broken} promesse${broken > 1 ? 's ont' : ' a'} été brisée${broken > 1 ? 's' : ''}.`);
}

function insertAfterCurrent(game, eventIds) {
  const unique = eventIds.filter((id) => id && !game.eventSequence.includes(id));
  if (!unique.length) return;
  game.eventSequence.splice(game.eventIndex + 1, 0, ...unique);
}

function removeFutureEvent(game, eventId) {
  const index = game.eventSequence.indexOf(eventId, game.eventIndex + 1);
  if (index >= 0) game.eventSequence.splice(index, 1);
}

function applyTimeoutEffects(game, event, result, timedOutIds = [], groupTimedOut = false) {
  const anyTimeout = groupTimedOut || timedOutIds.length > 0;
  if (!anyTimeout) return;
  game.flags.timedOutDecisions = (game.flags.timedOutDecisions ?? 0) + (groupTimedOut ? 1 : timedOutIds.length);
  const effects = event.timeoutEffects ?? {};
  Object.entries(effects).forEach(([key, amount]) => addGauge(game, key, amount));
  timedOutIds.forEach((id) => {
    const player = game.players.find((item) => item.id === id);
    addStatus(player, 'Hésitant');
    if (event.id === 'impact_escape') addStatus(player, 'Blessé');
    if (event.id === 'rations' && game.gauges.reserves <= 1) loseLife(player);
  });
  if (event.timeoutSummary) result.summary.push(event.timeoutSummary);
}

function applyBranching(game, eventId, choices, extra, result) {
  game.flags.branchPath ??= [];
  if (eventId === 'choose_shelter') {
    const choice = choiceId(choices.group);
    removeFutureEvent(game, 'camp_tasks');
    const branch = ({ beach: 'shelter_beach_tide', fuselage: 'shelter_fuselage_aftershock', jungle: 'shelter_jungle_source' })[choice];
    insertAfterCurrent(game, [branch]);
    game.flags.branchPath.push(`camp:${choice}`);
    result.summary.push('Ce choix ouvre un événement exclusif au prochain écran.');
  }

  if (eventId === 'expedition') {
    const choice = choiceId(choices.group);
    removeFutureEvent(game, 'ravine');
    if (choice === 'together') insertAfterCurrent(game, ['jungle_ambush', 'ravine']);
    if (choice === 'split') insertAfterCurrent(game, ['split_cache']);
    if (choice === 'small') insertAfterCurrent(game, ['scout_route', 'ravine']);
    game.flags.branchPath.push(`expedition:${choice}`);
  }

  if (eventId === 'scout_route') {
    const actorId = getEventActorId(game, getEventById(eventId));
    const decision = choiceId(choices[actorId] ?? Object.values(choices)[0]);
    if (decision === 'reveal') removeFutureEvent(game, 'ravine');
  }

  if (eventId === 'judgment') {
    if (game.flags.falseAccused) insertAfterCurrent(game, ['revenge_offer']);
    else if (game.flags.sabotageBlocked && game.plot.id === 'saboteur') insertAfterCurrent(game, ['saboteur_cornered']);
    else insertAfterCurrent(game, ['uneasy_truce']);
    game.flags.branchPath.push(`judgment:${game.flags.falseAccused ? 'false' : game.flags.sabotageBlocked ? 'correct' : 'unresolved'}`);
  }

  if (eventId === 'generator') {
    if (!game.flags.hasBlackBox) removeFutureEvent(game, 'black_dossier');
    const decision = choiceId(choices.group) ?? '';
    const branchEvents = [];
    if (decision.includes('beacon')) branchEvents.push('beacon_reply');
    if (decision.includes('boat')) branchEvents.push('boat_capacity');
    if (decision.includes('medical')) branchEvents.push('medical_protocol');
    insertAfterCurrent(game, branchEvents);
    game.flags.branchPath.push(`systems:${decision}`);
  }
}

function determineEnding(game) {
  const active = getActivePlayers(game).filter((player) => game.flags.leftBehind !== player.id);
  const requestedRoute = game.flags.route ?? 'stay';
  let route = requestedRoute;
  const routeFailed = game.flags.routeFailed || game.flags.sabotageSuccess;

  const backup = () => {
    if (route !== 'boat' && routeIsAvailable(game, 'boat')) return 'boat';
    if (route !== 'shelter' && routeIsAvailable(game, 'shelter')) return 'shelter';
    if (route !== 'raft' && routeIsAvailable(game, 'raft')) return 'raft';
    return 'stay';
  };

  if (routeFailed) route = backup();

  const finalEntries = Object.entries(game.flags.finalChoices ?? {});
  const immediate = finalEntries.filter(([, value]) => choiceId(value) === 'board').map(([id]) => id);
  const proof = finalEntries.filter(([, value]) => choiceId(value) === 'proof').map(([id]) => id);
  const waiters = finalEntries.filter(([, value]) => choiceId(value) === 'wait').map(([id]) => id);
  const gifts = finalEntries
    .filter(([, value]) => choiceId(value) === 'give')
    .map(([, value]) => targetId(value))
    .filter(Boolean);

  const boatClaims = Object.values(game.flags.boatSeatClaims ?? {}).filter(Boolean);
  const trustScore = (playerId) => game.players.reduce((total, observer) => total + relationValue(game, observer.id, playerId), 0);
  const trustedOrder = [...active].sort((a, b) => trustScore(b.id) - trustScore(a.id)).map((player) => player.id);
  const priority = [...new Set([...immediate, ...boatClaims, ...gifts, ...proof, ...waiters, ...trustedOrder])];
  let capacity = 0;
  if (route === 'air') capacity = active.length;
  if (route === 'boat') capacity = Math.max(1, active.length - game.flags.capsuleCount + (game.flags.boatCapacityBonus ?? 0));
  if (route === 'raft') capacity = 2;
  capacity = Math.max(0, capacity - (game.flags.capacityPenalty ?? 0));
  if (route === 'shelter' || route === 'stay') capacity = 0;

  const escapedIds = priority.filter((id) => active.some((player) => player.id === id)).slice(0, capacity);
  game.flags.escapedIds = escapedIds;
  game.flags.route = route;

  const allActiveEscaped = active.length > 0 && escapedIds.length === active.length;
  const duoIds = new Set(game.players.map((player) => player.id));
  const duoBetrayal = game.betrayalLog.some((entry) =>
    entry.actorId && entry.targetId && duoIds.has(entry.actorId) && duoIds.has(entry.targetId)
  );
  const duoChoices = game.players.length === 2
    && finalEntries.length === 2
    && finalEntries.every(([, value]) => ['wait', 'give'].includes(choiceId(value)))
    && escapedIds.length === 2
    && !duoBetrayal;

  let endingId = 'no_return';
  if (duoChoices) endingId = 'duo_together';
  else if (
    route === 'air'
    && ['cargo', 'saboteur'].includes(game.plot.id)
    && game.flags.evidenceState !== 'destroyed'
    && !game.flags.waitedForOfficial
  ) endingId = 'false_rescue';
  else if (escapedIds.length > 0 && ['hidden', 'destroyed'].includes(game.flags.evidenceState)) endingId = 'island_secret';
  else if (allActiveEscaped && !game.flags.leftBehind) endingId = 'everyone_home';
  else if (escapedIds.length === 1) endingId = 'last_survivor';
  else if (escapedIds.length > 1 && escapedIds.length < active.length) endingId = 'seat_price';
  else if (requestedRoute === 'stay' && game.gauges.shelter >= 2 && game.gauges.reserves >= 1) endingId = 'those_who_stay';

  return {
    id: endingId,
    ...endings[endingId],
    escapedIds,
    route,
    requestedRoute,
    truth: truthText(game),
  };
}

export function resolveEvent(game, eventId, choices = {}, extra = {}) {
  const next = clone(game);
  const beforeLives = Object.fromEntries(next.players.map((player) => [player.id, player.lives]));
  const event = getEventById(eventId);
  if (!event) throw new Error(`Événement inconnu : ${eventId}`);
  choices = clone(choices ?? {});
  const timedOutIds = [...(extra.timedOutIds ?? [])];
  const groupTimedOut = Boolean(extra.timeout && event.mode === 'group');
  if (groupTimedOut && !choiceId(choices.group)) choices.group = event.timeoutChoice ?? event.choices[0]?.id;
  if (extra.timeout && event.mode === 'privateOne') {
    const playerId = getEventActorId(next, event);
    if (!choiceId(choices[playerId])) {
      choices[playerId] = event.timeoutChoice ?? 'inaction';
      timedOutIds.push(playerId);
    }
  }
  if (event.mode === 'privateEach') {
    getActivePlayers(next).forEach((player) => {
      if (!choiceId(choices[player.id])) {
        choices[player.id] = extra.timeout ? (event.timeoutChoice ?? 'inaction') : 'inaction';
        if (extra.timeout && !timedOutIds.includes(player.id)) timedOutIds.push(player.id);
      }
    });
  }
  const result = { eventId, chapter: event.chapter, title: event.title, summary: [], publicSummary: null, secret: false, timedOut: groupTimedOut || timedOutIds.length > 0 };
  const ids = Object.values(choices).map(choiceId);
  const actor = next.players.find((player) => player.id === (extra.actorId ?? extra.volunteerId));

  switch (eventId) {
    case 'impact_escape': {
      const helpCount = ids.filter((id) => id === 'help').length;
      const exitCount = ids.filter((id) => id === 'exit').length;
      const searchers = Object.entries(choices).filter(([, value]) => choiceId(value) === 'search').map(([id]) => id);
      result.title = "Vous échappez à l’épave";
      if (exitCount > 0) result.summary.push('Une sortie est sécurisée à temps.');
      else {
        addGauge(next, 'danger', 1);
        result.summary.push('Personne ne sécurise la sortie : Danger +1.');
      }
      if (helpCount >= Math.ceil(next.players.length / 2)) {
        addGauge(next, 'cohesion', 1);
        result.summary.push('Les blessés sont évacués et la cohésion augmente.');
      } else if (exitCount === 0) {
        next.players.forEach((player) => addStatus(player, 'Blessé'));
        result.summary.push('Le groupe ressort blessé dans la panique.');
      }
      const loot = ['Lampe', 'Couteau multifonction', 'Couverture thermique', 'Briquet étanche'];
      searchers.forEach((id, index) => addPersonalItem(next.players.find((player) => player.id === id), loot[index % loot.length]));
      if (searchers.length) result.summary.push(`${searchers.length} objet${searchers.length > 1 ? 's sont' : ' est'} récupéré${searchers.length > 1 ? 's' : ''} dans les bagages.`);
      break;
    }

    case 'burning_crates': {
      const selected = rankChoices(choices).slice(0, Math.min(2, new Set(ids).size)).map(([id]) => id);
      result.title = selected.length === 1 ? 'Une seule caisse est sauvée' : 'Deux caisses sont sauvées';
      selected.forEach((id) => {
        if (id === 'provisions') {
          addGauge(next, 'reserves', 2);
          result.summary.push('Provisions : Réserves +2.');
        }
        if (id === 'medical') {
          addGroupItem(next, 'Trousse de secours');
          addGroupItem(next, 'Antidouleur');
          result.summary.push('La trousse médicale rejoint les ressources communes.');
        }
        if (id === 'communication') {
          addGauge(next, 'signal', 1);
          addGroupItem(next, 'Radio endommagée');
          result.summary.push('La radio est sauvée : Signal +1.');
        }
        if (id === 'equipment') {
          addGroupItem(next, 'Corde');
          addGroupItem(next, 'Lampe');
          result.summary.push('La corde et la lampe sont sauvées.');
        }
      });
      break;
    }

    case 'save_nora': {
      const decision = choiceId(choices.group);
      if (decision === 'save') {
        next.flags.noraAlive = true;
        addGauge(next, 'cohesion', 2);
        result.summary.push('Nora est libérée. Cohésion +2.');
      } else if (decision === 'solo') {
        const volunteer = actor ?? next.players[0];
        loseLife(volunteer);
        next.flags.noraAlive = true;
        addGauge(next, 'cohesion', 1);
        result.summary.push(`${volunteer.name} perd une vie pour sauver Nora.`);
      } else {
        next.flags.noraAbandoned = true;
        addGauge(next, 'cohesion', -1);
        result.summary.push('Le groupe abandonne Nora. Cohésion -1.');
      }
      break;
    }

    case 'choose_shelter': {
      const decision = choiceId(choices.group);
      next.flags.shelterLocation = decision;
      if (decision === 'beach') {
        next.flags.beachSignalBonus = true;
        result.summary.push('Le camp est visible depuis la mer. Les futurs signaux seront plus efficaces.');
      }
      if (decision === 'fuselage') {
        addGauge(next, 'shelter', 1);
        next.flags.fuselageRisk = true;
        result.summary.push('Le fuselage offre un abri immédiat : Refuge +1.');
      }
      if (decision === 'jungle') {
        addGauge(next, 'reserves', 1);
        addGauge(next, 'danger', 1);
        result.summary.push('La jungle fournit des ressources, mais rapproche le danger.');
      }
      break;
    }

    case 'shelter_beach_tide': {
      const decision = choiceId(choices.group);
      if (decision === 'signal') {
        addGauge(next, 'signal', 2);
        addGauge(next, 'danger', 1);
        next.flags.beachSignalBonus = true;
        result.summary.push('Le feu est visible au large : Signal +2, Danger +1.');
      } else if (decision === 'crate') {
        addGauge(next, 'reserves', 2);
        addGroupItem(next, 'Gilet de sauvetage');
        result.summary.push('La caisse contient des vivres et un gilet : Réserves +2.');
      } else {
        addGauge(next, 'shelter', 1);
        next.flags.shelterLocation = 'cliff';
        result.summary.push('Le camp est déplacé au-dessus de la marée : Refuge +1.');
      }
      break;
    }

    case 'shelter_fuselage_aftershock': {
      const decision = choiceId(choices.group);
      if (decision === 'extinguish') {
        addGauge(next, 'shelter', 2);
        next.flags.fuselageRisk = false;
        result.summary.push('Le feu est maîtrisé et la carcasse devient un véritable refuge : Refuge +2.');
      } else if (decision === 'cockpit') {
        next.flags.codeKnown = next.flags.noraAlive;
        next.flags.hasMap = true;
        addGroupItem(next, 'Journal de bord');
        result.summary.push('Le cockpit révèle une route volontaire vers l’île et une fréquence de secours.');
      } else {
        addGroupItem(next, 'Bidon de carburant');
        addGroupItem(next, 'Équipement');
        addGauge(next, 'danger', 1);
        result.summary.push('Du carburant et des outils sont récupérés avant l’effondrement : Danger +1.');
      }
      break;
    }

    case 'shelter_jungle_source': {
      const shares = ids.filter((id) => id === 'share').length;
      const hiders = Object.entries(choices).filter(([, value]) => choiceId(value) === 'hide').map(([id]) => id);
      const attacks = Object.entries(choices).filter(([, value]) => choiceId(value) === 'contaminate');
      if (shares) {
        addGauge(next, 'reserves', shares >= Math.ceil(next.players.length / 2) ? 2 : 1);
        result.summary.push(`La source devient accessible au groupe : Réserves +${shares >= Math.ceil(next.players.length / 2) ? 2 : 1}.`);
      }
      hiders.forEach((id) => {
        const player = next.players.find((item) => item.id === id);
        addPersonalItem(player, 'Gourde cachée');
        player.secrets.push('Tu as caché une réserve d’eau personnelle.');
      });
      if (hiders.length) result.summary.push(`${hiders.length} personne${hiders.length > 1 ? 's cachent' : ' cache'} une gourde.`);
      attacks.forEach(([actorId, value]) => {
        const victimId = targetId(value);
        const victim = next.players.find((player) => player.id === victimId);
        addStatus(victim, 'Contaminé');
        recordBetrayal(next, actorId, victimId, 'Gourde contaminée', eventId, false);
      });
      if (attacks.length) {
        result.secret = true;
        result.publicSummary = shares ? ['La source rapporte de l’eau au groupe. Tout le monde ne révèle pas ce qu’il en a fait.'] : ['La source est explorée, mais aucun bilan fiable ne peut être établi.'];
        result.summary.push('Au moins une gourde a été sabotée sans que la victime ne le sache.');
      }
      break;
    }

    case 'camp_tasks': {
      const counts = Object.fromEntries(rankChoices(choices));
      const water = counts.water ?? 0;
      const build = counts.build ?? 0;
      const wreck = counts.wreck ?? 0;
      if (water) {
        addGauge(next, 'reserves', water >= 2 ? 2 : 1);
        result.summary.push(`La recherche d’eau rapporte Réserves +${water >= 2 ? 2 : 1}.`);
      }
      if (build) {
        addGauge(next, 'shelter', build >= 3 ? 2 : 1);
        result.summary.push(`Le camp est renforcé : Refuge +${build >= 3 ? 2 : 1}.`);
      }
      if (wreck) {
        addGroupItem(next, hasItem(next, 'Couteau multifonction') ? 'Bidon de carburant' : 'Boussole');
        result.summary.push("L’épave livre un nouvel objet utile.");
        if (wreck === 1) addGauge(next, 'danger', 1);
      }
      break;
    }

    case 'grey_case': {
      const playerId = getEventActorId(next, event);
      const finder = next.players.find((player) => player.id === playerId) ?? next.players[0];
      const decision = choiceId(choices[playerId] ?? Object.values(choices)[0]);
      next.flags.briefcaseOwner = finder.id;
      result.secret = decision !== 'show';
      if (result.secret) result.publicSummary = ['La personne qui a fait la découverte ne montre pas clairement ce qu’elle a trouvé.'];
      if (decision === 'show') {
        next.flags.briefcaseState = 'shared';
        addGroupItem(next, 'Mallette grise');
        addGauge(next, 'cohesion', 1);
        result.summary.push('La mallette est confiée au groupe. Cohésion +1.');
      } else if (decision === 'hide') {
        next.flags.briefcaseState = 'hidden';
        addPersonalItem(finder, 'Mallette grise');
        finder.secrets.push('Tu as caché la mallette grise.');
        result.summary.push('La personne qui a fait la découverte revient au camp sans rien montrer.');
      } else {
        const canOpen = hasItem(next, 'Couteau multifonction') || hasItem(next, "Carte d’accès") || next.flags.noraAlive;
        if (canOpen) {
          next.flags.briefcaseState = 'opened';
          next.flags.hasBlackBox = true;
          next.flags.hasMap = true;
          addGroupItem(next, 'Module de la boîte noire');
          addGroupItem(next, 'Carte partielle');
          result.summary.push('La mallette s’ouvre : un module de boîte noire et une carte apparaissent.');
        } else {
          next.flags.briefcaseState = 'hidden';
          addGauge(next, 'danger', 1);
          addPersonalItem(finder, 'Mallette grise');
          result.summary.push('La serrure résiste et le bruit attire quelque chose : Danger +1.');
        }
      }
      break;
    }

    case 'rations': {
      const share = ids.filter((id) => id === 'share').length;
      const extraCount = ids.filter((id) => id === 'extra').length;
      if (share >= Math.ceil(next.players.length / 2)) {
        addGauge(next, 'cohesion', next.players.length === 2 && share === 2 ? 2 : 1);
        const hurt = next.players.find((player) => player.statuses.includes('Blessé'));
        removeStatus(hurt, 'Blessé');
        result.summary.push('La majorité partage. La cohésion augmente et une blessure est stabilisée.');
      }
      if (extraCount) {
        addGauge(next, 'reserves', -extraCount);
        result.summary.push(`${extraCount} ration${extraCount > 1 ? 's supplémentaires disparaissent' : ' supplémentaire disparaît'} des réserves.`);
      }
      if (extraCount >= 2) {
        addGauge(next, 'cohesion', -1);
        result.summary.push('Plusieurs vols sont découverts : Cohésion -1.');
      }
      break;
    }

    case 'missing_resource': {
      const decision = choiceId(choices.group);
      if (decision === 'search') {
        addGauge(next, 'cohesion', -2);
        next.flags.bagsSearched = true;
        if (next.flags.briefcaseState === 'hidden') {
          next.flags.briefcaseState = 'shared';
          removeItem(next, 'Mallette grise');
          addGroupItem(next, 'Mallette grise');
          result.summary.push('La mallette cachée est découverte pendant la fouille.');
        }
        result.summary.push('Tous les sacs sont fouillés : Cohésion -2.');
      } else if (decision === 'interrogate') {
        addGauge(next, 'cohesion', -1);
        result.summary.push('L’interrogatoire ne livre qu’une version incomplète. Cohésion -1.');
      } else {
        if (next.plot.id === 'saboteur') addGauge(next, 'signal', -1);
        result.summary.push('Le groupe laisse l’affaire en suspens. La personne responsable conserve son avantage.');
      }
      break;
    }

    case 'radio_voice': {
      const decision = choiceId(choices.group);
      if (decision === 'answer') {
        addGauge(next, 'signal', next.flags.beachSignalBonus ? 2 : 1);
        addGauge(next, 'danger', 1);
        result.summary.push(`Vous répondez : Signal +${next.flags.beachSignalBonus ? 2 : 1}, Danger +1.`);
      } else if (decision === 'listen') {
        const listener = next.players.find((player) => player.id === next.flags.radioListener) ?? next.players[0];
        const messages = [
          'Le pilote avait changé de trajectoire.',
          "Quelqu’un savait que l’île était ici.",
          'La balise principale se trouve au nord.',
          'Ce message a été enregistré plusieurs années plus tôt.',
        ];
        listener.secrets.push(messages[next.eventIndex % messages.length]);
        result.summary.push('Une seule personne entend un fragment supplémentaire du message.');
      } else {
        addGauge(next, 'danger', -1);
        addGauge(next, 'signal', -1);
        removeItem(next, 'Radio endommagée');
        result.summary.push('La radio est détruite : Danger -1, Signal -1.');
      }
      break;
    }

    case 'expedition': {
      const decision = choiceId(choices.group);
      if (decision === 'together') {
        addGauge(next, 'reserves', -1);
        addGauge(next, 'cohesion', 1);
        result.summary.push('Le groupe voyage ensemble : Cohésion +1, Réserves -1.');
      } else if (decision === 'split') {
        next.flags.splitExpedition = true;
        result.summary.push('Le groupe se divise. Le camp reste protégé, mais les informations seront différentes.');
      } else {
        const explorer = actor ?? next.players[0];
        addStatus(explorer, 'Éclaireur isolé');
        next.flags.expeditionScout = explorer.id;
        explorer.secrets.push('Tu as aperçu une seconde entrée vers la station.');
        addGauge(next, 'danger', 1);
        result.summary.push(`${explorer.name} part seul et découvre une seconde entrée. Danger +1.`);
      }
      break;
    }

    case 'jungle_ambush': {
      const decision = choiceId(choices.group);
      if (decision === 'return') {
        addGauge(next, 'signal', -1);
        result.summary.push('Le groupe sauve le camp, mais perd la piste de la tour : Signal -1.');
        removeFutureEvent(next, 'ravine');
      } else if (decision === 'continue') {
        addGauge(next, 'reserves', -2);
        next.flags.hasMap = true;
        result.summary.push('La tour est atteinte, mais le camp est pillé : Réserves -2.');
      } else {
        const volunteer = actor ?? next.players[0];
        loseLife(volunteer);
        addGauge(next, 'cohesion', 1);
        result.summary.push(`${volunteer.name} fait diversion et perd une vie. Le groupe conserve ses réserves.`);
      }
      break;
    }

    case 'split_cache': {
      const reporters = ids.filter((id) => id === 'report').length;
      const hiders = Object.entries(choices).filter(([, value]) => choiceId(value) === 'hide').map(([id]) => id);
      const stealers = Object.entries(choices).filter(([, value]) => choiceId(value) === 'steal');
      const liars = Object.entries(choices).filter(([, value]) => choiceId(value) === 'misdirect');
      if (reporters) {
        addGauge(next, 'reserves', 1);
        next.flags.hasMap = true;
        addGauge(next, 'cohesion', 1);
        result.summary.push('Une partie de la cache est partagée : Réserves +1, Cohésion +1.');
      }
      hiders.forEach((id) => {
        const player = next.players.find((item) => item.id === id);
        addPersonalItem(player, 'Ration cachée');
        player.secrets.push('Tu as caché une ration découverte pendant la séparation.');
      });
      stealers.forEach(([actorId, value]) => {
        const victimId = targetId(value);
        const actorPlayer = next.players.find((player) => player.id === actorId);
        const victim = next.players.find((player) => player.id === victimId);
        const stolen = victim?.inventory.shift();
        if (stolen) addPersonalItem(actorPlayer, stolen);
        else addPersonalItem(actorPlayer, 'Objet volé');
        recordBetrayal(next, actorId, victimId, 'Vol pendant l’expédition séparée', eventId, false);
      });
      liars.forEach(([actorId, value]) => {
        const victimId = targetId(value);
        const victim = next.players.find((player) => player.id === victimId);
        addStatus(victim, 'Perdu dans la jungle');
        loseLife(victim);
        recordBetrayal(next, actorId, victimId, 'Fausse piste dans la jungle', eventId, true);
      });
      if (stealers.length || liars.length) {
        result.secret = stealers.length > 0;
        if (result.secret) result.publicSummary = ['L’expédition revient divisée. Certains objets et certaines versions ne correspondent plus.'];
        result.summary.push('La séparation a été utilisée pour trahir une ou plusieurs personnes.');
      }
      break;
    }

    case 'scout_route': {
      const playerId = getEventActorId(next, event);
      const scout = next.players.find((player) => player.id === playerId) ?? next.players[0];
      const decision = choiceId(choices[playerId] ?? Object.values(choices)[0]);
      if (decision === 'reveal') {
        next.flags.hasMap = true;
        addGauge(next, 'cohesion', 1);
        result.summary.push(`${scout.name} révèle le tunnel. Le groupe contournera la faille.`);
      } else if (decision === 'hide') {
        scout.secrets.push('Tu connais seul un tunnel vers la station.');
        addPersonalItem(scout, 'Plan du tunnel');
        result.secret = true;
        result.publicSummary = ['L’éclaireur revient sans annoncer de nouveau passage.'];
        result.summary.push('L’éclaireur revient sans révéler la route secrète.');
      } else {
        addGauge(next, 'danger', 2);
        addGauge(next, 'cohesion', -1);
        scout.secrets.push('Tu as volontairement condamné le tunnel.');
        result.secret = true;
        result.publicSummary = ['Le tunnel s’effondre brutalement. La cause exacte reste inconnue.', 'Danger +2.'];
        result.summary.push('Le tunnel s’effondre. Danger +2.');
      }
      break;
    }

    case 'ravine': {
      const decision = choiceId(choices.group);
      if (decision === 'rope') {
        if (removeItem(next, 'Corde')) result.summary.push('La corde permet un passage sûr, puis devient inutilisable.');
        else {
          addGauge(next, 'danger', 1);
          result.summary.push('Vous improvisez sans vraie corde : Danger +1.');
        }
      } else if (decision === 'bridge') {
        addGauge(next, 'shelter', -1);
        result.summary.push('Des matériaux du camp servent à la passerelle : Refuge -1.');
      } else if (decision === 'solo') {
        const explorer = actor ?? next.players[0];
        addPersonalItem(explorer, 'Clé métallique');
        addGauge(next, 'danger', 1);
        result.summary.push(`${explorer.name} traverse seul et récupère une clé. Danger +1.`);
      } else {
        next.flags.signalBlockedChapter4 = true;
        result.summary.push('Le groupe fait demi-tour. Aucun risque, mais aucun progrès vers l’antenne.');
      }
      break;
    }

    case 'outpost': {
      const selected = rankChoices(choices).slice(0, Math.min(2, new Set(ids).size)).map(([id]) => id);
      selected.forEach((id) => {
        if (id === 'communications' && !next.flags.signalBlockedChapter4) {
          addGauge(next, 'signal', 1);
          next.flags.hasBattery = true;
          addGroupItem(next, 'Batterie');
          result.summary.push('La salle des communications fournit une batterie et Signal +1.');
        }
        if (id === 'infirmary') {
          healPlayer(firstTargetByLife(next), 1);
          next.players.filter((player) => player.statuses.includes('Blessé')).slice(0, 2).forEach((player) => removeStatus(player, 'Blessé'));
          result.summary.push('L’infirmerie soigne le groupe.');
        }
        if (id === 'archives') {
          next.flags.hasMap = true;
          next.flags.hasAccessCard = true;
          addGroupItem(next, "Carte d’accès");
          addGroupItem(next, "Carte de l’île");
          result.summary.push('Les archives révèlent la station souterraine et une carte d’accès.');
        }
      });
      if (!selected.length) result.summary.push('Le générateur s’arrête avant qu’une salle soit fouillée.');
      break;
    }

    case 'clues': {
      const revealCount = ids.filter((id) => id === 'reveal').length;
      const hideCount = ids.filter((id) => id === 'hide').length;
      const distortCount = ids.filter((id) => id === 'distort').length;
      const clues = [
        'Une trace de boue mène vers la radio.',
        'Un outil a été déplacé pendant la nuit.',
        "L’empreinte ne correspond à aucun joueur.",
        'Le câble était déjà fragilisé avant la coupure.',
        'Un morceau de tissu est resté accroché au boîtier.',
        'Une heure donnée dans les témoignages est impossible.',
      ];
      next.players.forEach((player, index) => player.secrets.push(clues[index % clues.length]));
      if (revealCount >= Math.ceil(next.players.length / 2)) addGauge(next, 'cohesion', 1);
      if (distortCount) addGauge(next, 'cohesion', -1);
      next.flags.clueQuality = revealCount - distortCount;
      result.summary.push(`${revealCount} indice${revealCount > 1 ? 's sont révélés' : ' est révélé'}, ${hideCount} gardé${hideCount > 1 ? 's' : ''} secret${hideCount > 1 ? 's' : ''}.`);
      if (distortCount) result.summary.push('Au moins un récit a été volontairement déformé.');
      break;
    }

    case 'judgment': {
      const accusations = {};
      let accidentVotes = 0;
      Object.values(choices).forEach((value) => {
        const id = choiceId(value);
        if (id === 'accuse' && targetId(value)) accusations[targetId(value)] = (accusations[targetId(value)] ?? 0) + 1;
        if (id === 'accident') accidentVotes += 1;
      });
      const [accusedId, accusationCount = 0] = Object.entries(accusations).sort((a, b) => b[1] - a[1])[0] ?? [];
      const majority = Math.floor(next.players.length / 2) + 1;
      if (accusedId && accusationCount >= majority) {
        const accused = next.players.find((player) => player.id === accusedId);
        addStatus(accused, 'Isolé');
        if (accusedId === next.plot.specialPlayerId && next.plot.id === 'saboteur') {
          next.flags.sabotageBlocked = true;
          addGauge(next, 'cohesion', 1);
          result.summary.push(`${accused.name} est isolé avec raison. Un futur sabotage est bloqué.`);
        } else if (next.flags.observerProof && next.plot.id === 'saboteur') {
          next.flags.sabotageBlocked = true;
          result.summary.push('La preuve de l’Observateur empêche le véritable saboteur d’agir librement.');
        } else {
          next.flags.falseAccused = accusedId;
          addGauge(next, 'cohesion', -2);
          result.summary.push(`${accused.name} est isolé sans preuve suffisante : Cohésion -2.`);
        }
      } else if (accidentVotes >= majority) {
        if (next.plot.id === 'saboteur') {
          addGauge(next, 'signal', -1);
          result.summary.push('Le groupe conclut à un accident. Le saboteur profite du doute : Signal -1.');
        } else {
          addGauge(next, 'cohesion', 1);
          result.summary.push('Le groupe refuse une accusation injuste : Cohésion +1.');
        }
      } else {
        result.summary.push('Aucune majorité ne se forme. Les soupçons restent ouverts.');
      }
      break;
    }

    case 'revenge_offer': {
      const playerId = getEventActorId(next, event);
      const accused = next.players.find((player) => player.id === playerId) ?? next.players[0];
      const decision = choiceId(choices[playerId] ?? Object.values(choices)[0]);
      if (decision === 'forgive') {
        next.flags.hasMap = true;
        removeStatus(accused, 'Isolé');
        addGauge(next, 'cohesion', 2);
        result.summary.push(`${accused.name} partage la carte malgré l’accusation : Cohésion +2.`);
      } else if (decision === 'demand') {
        const victimId = targetId(choices[playerId]);
        const victim = next.players.find((player) => player.id === victimId);
        const payment = victim?.inventory.shift() ?? next.groupInventory.shift();
        if (payment) addPersonalItem(accused, payment);
        next.flags.hasMap = true;
        recordBetrayal(next, accused.id, victimId, 'Réparation imposée après une fausse accusation', eventId, true);
        result.summary.push(`${accused.name} obtient réparation avant de remettre la carte.`);
      } else {
        addGauge(next, 'danger', 2);
        next.flags.mapFalsified = true;
        recordBetrayal(next, accused.id, null, 'Carte falsifiée par vengeance', eventId, false);
        result.secret = true;
        result.publicSummary = ['La carte est remise au groupe. Sa fiabilité ne peut pas encore être vérifiée.'];
        result.summary.push('La carte rendue au groupe contient une fausse route : Danger +2.');
      }
      break;
    }

    case 'saboteur_cornered': {
      const playerId = getEventActorId(next, event);
      const saboteur = next.players.find((player) => player.id === playerId) ?? next.players[0];
      const decision = choiceId(choices[playerId] ?? Object.values(choices)[0]);
      if (decision === 'confess') {
        next.flags.sabotageBlocked = true;
        addGauge(next, 'cohesion', 1);
        saboteur.secrets.push('Tu as avoué une partie du sabotage.');
        result.summary.push(`${saboteur.name} avoue et livre une fréquence de la station.`);
      } else if (decision === 'frame') {
        const victimId = targetId(choices[playerId]);
        next.flags.framedPlayer = victimId;
        addStatus(next.players.find((player) => player.id === victimId), 'Soupçonné');
        recordBetrayal(next, saboteur.id, victimId, 'Preuve fabriquée', eventId, false);
        result.secret = true;
        result.publicSummary = ['Un nouvel indice apparaît, mais son origine reste impossible à confirmer.'];
        result.summary.push('Une fausse preuve est placée dans un sac.');
      } else {
        addGauge(next, 'signal', -2);
        next.flags.sabotageUsed += 1;
        result.summary.push('La radio est endommagée avant l’isolement : Signal -2.');
      }
      break;
    }

    case 'uneasy_truce': {
      const decision = choiceId(choices.group);
      if (decision === 'evidence') {
        next.flags.observerProof = true;
        addGauge(next, 'cohesion', 1);
        result.summary.push('Les indices utiles deviennent publics : Cohésion +1.');
      } else if (decision === 'silence') {
        addGauge(next, 'cohesion', 1);
        if (next.plot.id === 'saboteur') addGauge(next, 'signal', -1);
        result.summary.push('Les accusations cessent, mais un éventuel responsable garde sa liberté.');
      } else {
        const leader = actor ?? next.players[0];
        next.flags.temporaryLeader = leader.id;
        addStatus(leader, 'Responsable du groupe');
        result.summary.push(`${leader.name} contrôlera la prochaine décision publique.`);
      }
      break;
    }

    case 'storm': {
      const counts = Object.fromEntries(rankChoices(choices));
      const capsulePlayers = Object.entries(choices).filter(([, value]) => choiceId(value) === 'capsule').map(([id]) => id);
      capsulePlayers.forEach((id) => {
        const player = next.players.find((item) => item.id === id);
        addPersonalItem(player, 'Capsule de survie');
        player.secrets.push('Tu as pris une capsule de survie individuelle.');
      });
      next.flags.capsuleCount += capsulePlayers.length;
      const strategy = ['reinforce', 'radio', 'move'].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))[0];
      if ((counts[strategy] ?? 0) === 0) {
        addGauge(next, 'danger', 1);
        addGauge(next, 'cohesion', -1);
        result.summary.push('Tout le monde privilégie sa survie personnelle : Danger +1, Cohésion -1.');
      } else if (strategy === 'reinforce') {
        const paid = removeItem(next, 'Corde') || next.gauges.reserves > 0;
        if (!paid) addGauge(next, 'shelter', 1);
        else {
          if (!hasItem(next, 'Corde')) addGauge(next, 'reserves', -1);
          addGauge(next, 'shelter', 2);
        }
        result.summary.push('Le refuge est renforcé avant la tempête.');
      } else if (strategy === 'radio') {
        addGauge(next, 'signal', 1);
        addGauge(next, 'shelter', -1);
        result.summary.push('La radio est protégée : Signal +1, Refuge -1.');
      } else {
        next.flags.atStation = true;
        addGauge(next, 'danger', 1);
        result.summary.push('Le groupe quitte le camp sous la tempête : Danger +1.');
      }
      if (capsulePlayers.length) result.summary.push(`${capsulePlayers.length} capsule${capsulePlayers.length > 1 ? 's ont' : ' a'} disparu sans explication.`);
      break;
    }

    case 'generator': {
      const decision = choiceId(choices.group);
      const systems = decision.split('_').filter((id) => ['beacon', 'boat', 'medical'].includes(id));
      systems.forEach((id) => applySystem(next, id, result));
      if (systems.length > 1) {
        removeItem(next, 'Batterie');
        next.flags.hasBattery = false;
        result.summary.push('La batterie est entièrement consommée.');
      }
      break;
    }

    case 'beacon_reply': {
      const decision = choiceId(choices.group);
      if (decision === 'truth') {
        addGauge(next, 'signal', 2);
        if (next.flags.codeKnown) next.flags.officialFrequency = true;
        result.summary.push('Le code complet est envoyé : Signal +2.');
      } else if (decision === 'mask') {
        addGauge(next, 'signal', 1);
        next.flags.identityMasked = true;
        result.summary.push('Le signal est masqué : Signal +1, preuves protégées.');
      } else {
        addGauge(next, 'signal', -1);
        next.flags.waitedForOfficial = true;
        result.summary.push('Le groupe attend une fréquence officielle : Signal -1.');
      }
      break;
    }

    case 'boat_capacity': {
      const freeCount = ids.filter((id) => id === 'free').length;
      const reservers = Object.entries(choices).filter(([, value]) => choiceId(value) === 'reserve').map(([id]) => id);
      const gifts = Object.entries(choices).filter(([, value]) => choiceId(value) === 'give');
      const sabotages = Object.entries(choices).filter(([, value]) => choiceId(value) === 'sabotage');
      next.flags.boatCapacityBonus = Math.floor(freeCount / 2);
      if (freeCount) result.summary.push(`${freeCount} personne${freeCount > 1 ? 's libèrent' : ' libère'} les compartiments du bateau.`);
      reservers.forEach((id) => {
        next.flags.boatSeatClaims[id] = id;
        next.players.find((player) => player.id === id)?.secrets.push('Tu as réservé une place dans le bateau.');
      });
      gifts.forEach(([actorId, value]) => {
        const victimId = targetId(value);
        next.flags.boatSeatClaims[actorId] = victimId;
        recordSupport(next, actorId, victimId, 'Place garantie dans le bateau', eventId);
      });
      sabotages.forEach(([actorId]) => {
        next.flags.capacityPenalty = (next.flags.capacityPenalty ?? 0) + 1;
        recordBetrayal(next, actorId, null, 'Siège rendu inutilisable', eventId, false);
      });
      if (reservers.length) result.summary.push(`${reservers.length} place${reservers.length > 1 ? 's sont réservées' : ' est réservée'} en secret.`);
      if (sabotages.length) {
        result.secret = true;
        result.publicSummary = ['Le comptage des places reste incertain jusqu’au départ.'];
        result.summary.push('Un siège a été rendu inutilisable.');
      }
      break;
    }

    case 'medical_protocol': {
      const decision = choiceId(choices.group);
      if (decision === 'weakest') {
        const target = firstTargetByLife(next);
        healPlayer(target, 3);
        result.summary.push(`${target.name} est entièrement stabilisé.`);
      } else if (decision === 'all') {
        next.players.forEach((player) => addStatus(player, 'Protégé'));
        addGauge(next, 'danger', 1);
        result.summary.push('Tout le groupe reçoit une protection, mais la surcharge augmente le danger.');
      } else {
        const contaminated = next.players.filter((player) => player.statuses.includes('Contaminé'));
        contaminated.forEach((player) => removeStatus(player, 'Contaminé'));
        const revealed = next.betrayalLog.filter((item) => item.label === 'Gourde contaminée');
        revealed.forEach((item) => { item.discovered = true; });
        if (revealed.length) addGauge(next, 'cohesion', -1);
        result.summary.push(revealed.length ? 'Le système révèle qui a saboté les gourdes.' : 'Aucune contamination volontaire n’est détectée.');
      }
      break;
    }

    case 'black_dossier': {
      const playerId = getEventActorId(next, event);
      const holder = next.players.find((player) => player.id === playerId) ?? next.players[0];
      const decision = choiceId(choices[playerId] ?? Object.values(choices)[0]);
      next.flags.evidenceHolder = holder.id;
      if (decision === 'reveal') {
        next.flags.evidenceState = 'revealed';
        addGauge(next, 'cohesion', 1);
        result.summary.push(truthText(next));
        result.summary.push('La vérité est partagée avec tout le groupe. Cohésion +1.');
      } else if (decision === 'hide') {
        next.flags.evidenceState = 'hidden';
        addPersonalItem(holder, 'Preuve du crash');
        holder.secrets.push(truthText(next));
        result.secret = true;
        result.publicSummary = ['Le terminal est refermé avant que le groupe puisse lire le dossier.'];
        result.summary.push('Le terminal est refermé avant que le groupe puisse lire le dossier.');
      } else {
        next.flags.evidenceState = 'destroyed';
        addGauge(next, 'danger', -1);
        result.summary.push('Le dossier est détruit. La vérité disparaît, mais le danger diminue.');
      }
      break;
    }

    case 'trapped': {
      const trapped = next.flags.noraAlive ? null : firstTargetByLife(next);
      const trappedName = next.flags.noraAlive ? 'Nora' : trapped.name;
      const decision = choiceId(choices.group);
      if (decision === 'rescue') {
        addGauge(next, 'danger', 1);
        if (next.flags.noraAlive) next.flags.codeKnown = true;
        else removeStatus(trapped, 'Séparé du groupe');
        result.summary.push(`${trappedName} est sauvé${trappedName === 'Nora' ? 'e' : ''}. Danger +1.`);
      } else if (decision === 'continue') {
        next.flags.leftBehind = next.flags.noraAlive ? 'nora' : trapped.id;
        addGauge(next, 'cohesion', -2);
        if (!next.flags.noraAlive) addStatus(trapped, 'Laissé derrière');
        result.summary.push(`${trappedName} reste dans la station. Cohésion -2.`);
      } else {
        const volunteer = actor ?? next.players[0];
        loseLife(volunteer);
        addGauge(next, 'cohesion', 1);
        if (next.flags.noraAlive) next.flags.codeKnown = true;
        result.summary.push(`${volunteer.name} perd une vie et libère ${trappedName}.`);
      }
      if (next.flags.noraAlive && decision !== 'continue') {
        next.flags.codeKnown = true;
        result.summary.push('Nora révèle le véritable code de secours.');
      }
      break;
    }

    case 'escape_route': {
      const decision = choiceId(choices.group);
      next.flags.route = routeIsAvailable(next, decision) ? decision : 'stay';
      result.summary.push(`Route choisie : ${event.choices.find((choice) => choice.id === next.flags.route)?.label ?? 'Rester sur l’île'}.`);
      break;
    }

    case 'final_choice': {
      next.flags.finalChoices = clone(choices);
      const sabotageEntry = Object.entries(choices).find(([, value]) => choiceId(value) === 'sabotage');
      if (sabotageEntry) {
        next.flags.sabotageUsed += 1;
        const blocked = next.flags.sabotageBlocked || next.flags.observerProof || next.flags.repairToken || next.flags.noraAlive || next.gauges.cohesion >= 3;
        next.flags.sabotageSuccess = !blocked;
        result.summary.push(blocked ? 'Une tentative de sabotage est déjouée.' : 'Quelqu’un a compromis le départ sans être arrêté.');
      }
      const waitCount = ids.filter((id) => id === 'wait').length;
      const boardCount = ids.filter((id) => id === 'board').length;
      const proofCount = ids.filter((id) => id === 'proof').length;
      result.summary.push(`${waitCount} personne${waitCount > 1 ? 's attendent' : ' attend'} le groupe, ${boardCount} tente${boardCount > 1 ? 'nt' : ''} d’embarquer immédiatement.`);
      if (proofCount) result.summary.push(`${proofCount} personne${proofCount > 1 ? 's emportent' : ' emporte'} les preuves.`);
      break;
    }

    case 'last_wave': {
      const decision = choiceId(choices.group);
      if (next.gauges.danger <= 2) {
        result.summary.push('Le départ se déroule sans nouvelle perte.');
      } else if (next.gauges.danger === 3) {
        if (decision === 'lighten') {
          next.groupInventory = [];
          next.players.forEach((player) => { player.inventory = []; });
          result.summary.push('Le matériel est abandonné et le groupe gagne assez de temps.');
        } else {
          addGauge(next, 'reserves', -1);
          result.summary.push('La dernière vague emporte une partie des réserves.');
        }
      } else if (next.gauges.danger === 4) {
        if (decision === 'volunteer') {
          const volunteer = actor ?? next.players[0];
          loseLife(volunteer);
          result.summary.push(`${volunteer.name} perd une vie pour maintenir le passage ouvert.`);
        } else {
          next.flags.capacityPenalty = 1;
          result.summary.push('Le chaos réduit d’une place la capacité de la route choisie.');
        }
      } else {
        const repaired = next.flags.repairToken;
        if (repaired) {
          next.flags.repairToken = false;
          result.summary.push('La réparation de fortune empêche l’effondrement de la route.');
        } else {
          next.flags.routeFailed = true;
          result.summary.push('La première route échoue. Le groupe doit se rabattre sur une solution secondaire.');
        }
      }
      next.complete = true;
      next.ending = determineEnding(next);
      result.title = next.ending.title;
      result.summary.push(next.ending.text);
      break;
    }

    case 'bonus_rain': {
      const decision = choiceId(choices.group);
      addGauge(next, decision === 'water' ? 'reserves' : 'shelter', 1);
      result.summary.push(decision === 'water' ? 'Les récipients sont remplis : Réserves +1.' : 'Le camp est protégé : Refuge +1.');
      break;
    }
    case 'bonus_fever': {
      const decision = choiceId(choices.group);
      const target = firstTargetByLife(next);
      if (decision === 'treat' && removeItem(next, 'Trousse de secours')) {
        healPlayer(target, 1);
        result.summary.push(`${target.name} est soigné grâce à la trousse.`);
      } else {
        addStatus(target, 'Affaibli');
        result.summary.push(`${target.name} devient Affaibli.`);
      }
      break;
    }
    case 'bonus_tracks': {
      const decision = choiceId(choices.group);
      if (decision === 'follow') {
        addGauge(next, 'danger', 1);
        next.flags.hasMap = true;
        result.summary.push('Les traces mènent vers la station : Danger +1.');
      } else {
        addGauge(next, 'cohesion', 1);
        result.summary.push('Le groupe sécurise le camp : Cohésion +1.');
      }
      break;
    }
    case 'bonus_flare': {
      const decision = choiceId(choices.group);
      if (decision === 'signal') {
        addGauge(next, 'signal', 1);
        addGauge(next, 'danger', 1);
        result.summary.push('La fusée répond à la lumière : Signal +1, Danger +1.');
      } else {
        addGauge(next, 'danger', -1);
        result.summary.push('Le groupe reste caché : Danger -1.');
      }
      break;
    }
    case 'bonus_cave': {
      const decision = choiceId(choices.group);
      if (decision === 'food') addGauge(next, 'reserves', 1);
      else next.flags.observerProof = true;
      result.summary.push(decision === 'food' ? 'La grotte fournit Réserves +1.' : 'Le symbole confirme un lien avec la station.');
      break;
    }
    case 'bonus_call': {
      const playerId = getEventActorId(next, event);
      const listener = next.players.find((player) => player.id === playerId) ?? next.players[0];
      const decision = choiceId(choices[playerId] ?? Object.values(choices)[0]);
      if (decision === 'share') addGauge(next, 'cohesion', 1);
      else listener.secrets.push('Le message affirme que la première équipe de secours ne sera pas officielle.');
      result.summary.push(decision === 'share' ? 'Le message est partagé : Cohésion +1.' : 'Le contenu du message reste secret.');
      break;
    }
    case 'bonus_fire': {
      const decision = choiceId(choices.group);
      if (decision === 'food') result.summary.push('Les provisions sont sauvées.');
      if (decision === 'radio') result.summary.push('La radio échappe aux flammes.');
      if (decision === 'people') {
        removeStatus(next.players.find((player) => player.statuses.includes('Blessé')), 'Blessé');
        result.summary.push('Une personne blessée est mise à l’abri.');
      }
      break;
    }

    default:
      result.summary.push('La décision est enregistrée.');
  }

  applyPromiseOutcomes(next, event, choices, result);
  applyTimeoutEffects(next, event, result, timedOutIds, groupTimedOut);
  applyBranching(next, eventId, choices, extra, result);
  assignAfterlifeRoles(next, eventId, beforeLives);
  const newlySeparated = next.players.filter((player) => (beforeLives[player.id] ?? player.lives) > 0 && player.lives <= 0 && player.afterlife?.active);
  newlySeparated.forEach((player) => result.summary.push(`${player.name} est séparé du groupe, mais continue désormais un parcours secret.`));
  if (next.flags.scoutHint) next.flags.scoutHint = false;
  next.history.push({ eventId, choices: clone(choices), extra: { ...clone(extra), timedOutIds }, resolvedAt: new Date().toISOString() });
  next.eventIndex += 1;
  if (!next.complete) {
    const upcoming = getCurrentEvent(next);
    if (upcoming && upcoming.chapter !== event.chapter) next.chapterTransition = upcoming.chapter;
  }

  return { game: next, result };
}
