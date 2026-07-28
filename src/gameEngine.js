function clone(value) {
  return structuredClone(value);
}

function addStatus(player, status) {
  if (!player.statuses.includes(status)) player.statuses.push(status);
}

function addInventory(player, item) {
  if (!player.inventory.includes(item) && player.inventory.length < 2) {
    player.inventory.push(item);
    return true;
  }
  return false;
}

export function createInitialGame({ names, duration = 'normal', audience = 'all' }) {
  const cleanNames = names.map((name) => name.trim()).filter(Boolean).slice(0, 8);
  if (cleanNames.length < 2) {
    throw new Error('Au moins deux joueurs sont nécessaires.');
  }

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    settings: { duration, audience },
    players: cleanNames.map((name, index) => ({
      id: `p${index + 1}`,
      name,
      lives: 3,
      statuses: [],
      inventory: [],
    })),
    gauges: {
      reserves: 2,
      shelter: 0,
      signal: 0,
      danger: 1,
      cohesion: 0,
    },
    eventIndex: 0,
    choices: {},
    history: [],
    chapterComplete: false,
  };
}

export function resolveEvent(game, eventId, choices, extra = {}) {
  const next = clone(game);
  const result = {
    title: '',
    summary: [],
    privateNotes: [],
  };

  if (eventId === 'impact_escape') {
    const values = Object.values(choices);
    const helpCount = values.filter((value) => value === 'help').length;
    const exitCount = values.filter((value) => value === 'exit').length;
    const searchers = Object.entries(choices)
      .filter(([, value]) => value === 'search')
      .map(([playerId]) => playerId);

    result.title = 'Vous échappez à l’épave';

    if (exitCount > 0) {
      result.summary.push('Une sortie a été sécurisée à temps.');
    } else {
      next.gauges.danger = Math.min(5, next.gauges.danger + 1);
      result.summary.push('Personne n’a sécurisé de sortie. Le danger augmente.');
    }

    if (helpCount >= Math.ceil(next.players.length / 2)) {
      next.gauges.cohesion = Math.min(5, next.gauges.cohesion + 1);
      result.summary.push('Assez de personnes ont aidé les blessés. La cohésion du groupe augmente.');
    } else if (exitCount === 0) {
      next.players.forEach((player) => addStatus(player, 'Blessé'));
      result.summary.push('Dans la panique, tout le groupe ressort blessé.');
    }

    const loot = ['Lampe', 'Couteau multifonction', 'Couverture thermique', 'Briquet étanche'];
    searchers.forEach((playerId, index) => {
      const player = next.players.find((item) => item.id === playerId);
      const item = loot[index % loot.length];
      if (player && addInventory(player, item)) {
        result.privateNotes.push(`${player.name} a récupéré : ${item}.`);
      }
    });

    if (values.every((value) => value === 'search')) {
      next.players.forEach((player) => addStatus(player, 'Blessé'));
      result.summary.push('Tout le monde a fouillé. Personne n’a aidé à évacuer correctement.');
    }
  }

  if (eventId === 'burning_crates') {
    const counts = Object.values(choices).reduce((acc, choice) => {
      acc[choice] = (acc[choice] ?? 0) + 1;
      return acc;
    }, {});

    const firstSeen = Object.values(choices).filter((value, index, all) => all.indexOf(value) === index);
    const selected = Object.entries(counts)
      .sort((a, b) => {
        const countDifference = b[1] - a[1];
        if (countDifference !== 0) return countDifference;
        return firstSeen.indexOf(a[0]) - firstSeen.indexOf(b[0]);
      })
      .slice(0, Math.min(2, Object.keys(counts).length))
      .map(([id]) => id);

    result.title = selected.length === 1 ? 'Une seule caisse est sauvée' : 'Deux caisses sont arrachées aux flammes';

    const effects = {
      provisions() {
        next.gauges.reserves = Math.min(5, next.gauges.reserves + 2);
        result.summary.push('Les provisions sont sauvées : Réserves +2.');
      },
      medical() {
        const target = next.players.find((player) => player.inventory.length < 2) ?? next.players[0];
        addInventory(target, 'Trousse de secours');
        result.summary.push(`Le matériel médical est sauvé. ${target.name} porte la trousse.`);
      },
      communication() {
        next.gauges.signal = Math.min(5, next.gauges.signal + 1);
        const target = next.players.find((player) => player.inventory.length < 2) ?? next.players[0];
        addInventory(target, 'Radio endommagée');
        result.summary.push(`La radio est sauvée : Signal +1. ${target.name} la transporte.`);
      },
      equipment() {
        const carrier = next.players.find((player) => player.inventory.length < 2) ?? next.players[0];
        addInventory(carrier, 'Corde');
        result.summary.push(`L’équipement est sauvé. ${carrier.name} récupère la corde.`);
      },
    };

    selected.forEach((id) => effects[id]?.());
  }

  if (eventId === 'save_nora') {
    const decision = choices.group;
    result.title = 'Le feu gagne du terrain';

    if (decision === 'save') {
      next.gauges.cohesion = Math.min(5, next.gauges.cohesion + 2);
      next.history.push({ flag: 'nora_saved' });
      result.summary.push('Vous unissez vos forces et libérez Nora. Cohésion +2.');
      result.summary.push('Nora vous devra la vie et pourra vous aider plus tard.');
    }

    if (decision === 'solo') {
      const volunteer = next.players.find((player) => player.id === extra.volunteerId) ?? next.players[0];
      volunteer.lives = Math.max(0, volunteer.lives - 1);
      next.gauges.cohesion = Math.min(5, next.gauges.cohesion + 1);
      next.history.push({ flag: 'nora_saved', volunteerId: volunteer.id });
      result.summary.push(`${volunteer.name} reste derrière et perd une vie pour sauver Nora.`);
      result.summary.push('Le groupe n’oubliera pas ce sacrifice. Cohésion +1.');
    }

    if (decision === 'abandon') {
      next.gauges.cohesion = Math.max(-5, next.gauges.cohesion - 1);
      next.history.push({ flag: 'nora_abandoned' });
      result.summary.push('Vous fuyez sans Nora. Cohésion -1.');
      result.summary.push('Une voix continue de vous appeler tandis que vous gagnez la plage.');
    }
  }

  next.history.push({
    eventId,
    choices,
    extra,
    resolvedAt: new Date().toISOString(),
  });
  next.choices = {};
  next.eventIndex += 1;
  next.chapterComplete = next.eventIndex >= 3;

  return { game: next, result };
}
