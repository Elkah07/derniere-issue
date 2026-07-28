import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialGame,
  getAvailableChoices,
  getCurrentEvent,
  getEventActorId,
  resolveEvent,
} from '../src/gameEngine.js';

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}

function simulateCompletePath({ playerCount, duration, seed }) {
  const random = seededRandom(seed);
  let game = createInitialGame({
    names: Array.from({ length: playerCount }, (_, index) => `P${index + 1}`),
    duration,
    random,
  });

  let guard = 0;
  while (!game.complete && guard < 80) {
    const event = getCurrentEvent(game);
    assert.ok(event, 'le parcours doit toujours proposer un événement');
    const choices = {};
    const extra = {};

    if (event.mode === 'group') {
      const choice = pick(getAvailableChoices(game, event), random);
      choices.group = choice.id;
      if (choice.requiresActor) extra.actorId = pick(game.players, random).id;
    } else if (event.mode === 'privateOne') {
      const playerId = getEventActorId(game, event);
      const choice = pick(getAvailableChoices(game, event, playerId), random);
      choices[playerId] = choice.requiresTarget
        ? { choiceId: choice.id, targetId: pick(game.players.filter((player) => player.id !== playerId), random).id }
        : choice.id;
    } else {
      for (const player of game.players) {
        const choice = pick(getAvailableChoices(game, event, player.id), random);
        choices[player.id] = choice.requiresTarget
          ? { choiceId: choice.id, targetId: pick(game.players.filter((target) => target.id !== player.id), random).id }
          : choice.id;
      }
    }

    ({ game } = resolveEvent(game, event.id, choices, extra));
    guard += 1;
  }

  assert.equal(game.complete, true, 'le parcours complet doit atteindre une fin');
  return game;
}

const reachableEndings = [
  { id: 'no_return', title: 'Personne ne repart vraiment', playerCount: 2, duration: 'short', seed: 8126 },
  { id: 'everyone_home', title: 'Tout le monde rentre', playerCount: 2, duration: 'short', seed: 31883 },
  { id: 'false_rescue', title: 'Le faux sauvetage', playerCount: 2, duration: 'short', seed: 39802 },
  { id: 'those_who_stay', title: 'Ceux qui restent', playerCount: 2, duration: 'short', seed: 9 },
  { id: 'duo_together', title: 'À deux jusqu’au bout', playerCount: 2, duration: 'short', seed: 33 },
  { id: 'last_survivor', title: 'Le dernier survivant', playerCount: 2, duration: 'short', seed: 253615 },
  { id: 'island_secret', title: "L’île garde son secret", playerCount: 2, duration: 'normal', seed: 8127 },
  { id: 'seat_price', title: 'Le prix du siège', playerCount: 3, duration: 'short', seed: 8227 },
];

for (const scenario of reachableEndings) {
  test(`issue atteignable par un parcours complet : ${scenario.title}`, () => {
    const game = simulateCompletePath(scenario);
    assert.equal(game.ending.id, scenario.id);
    assert.equal(game.eventIndex, game.eventSequence.length);
    assert.ok(game.history.some((entry) => entry.eventId === 'escape_route'));
    assert.ok(game.history.some((entry) => entry.eventId === 'final_choice'));
    assert.ok(game.history.some((entry) => entry.eventId === 'last_wave'));
  });
}

test('la fin duo exige une loyauté réelle entre les deux joueurs', () => {
  const game = simulateCompletePath({ playerCount: 2, duration: 'short', seed: 79397 });
  assert.ok(game.betrayalLog.some((entry) => entry.actorId && entry.targetId));
  assert.notEqual(game.ending.id, 'duo_together');
});

test('attendre une fréquence officielle évite le faux sauvetage', () => {
  let game = createInitialGame({ names: ['A', 'B'], duration: 'short', random: () => 0.4 });
  game.plot = { id: 'cargo', specialPlayerId: 'p1' };
  game.flags.route = 'air';
  game.flags.beaconActive = true;
  game.flags.codeKnown = true;
  game.flags.waitedForOfficial = true;
  game.flags.evidenceState = 'revealed';
  game.flags.finalChoices = { p1: 'board', p2: 'board' };
  game.gauges.signal = 5;
  game.gauges.danger = 1;
  game.eventSequence = ['last_wave'];
  game.eventIndex = 0;

  ({ game } = resolveEvent(game, 'last_wave', { group: 'together' }));
  assert.equal(game.ending.id, 'everyone_home');
});

test('un échec d’évacuation forcé ne devient pas artificiellement une fin volontaire', () => {
  let game = createInitialGame({ names: ['A', 'B'], duration: 'short', random: () => 0.2 });
  game.flags.route = 'air';
  game.flags.routeFailed = true;
  game.flags.finalChoices = { p1: 'wait', p2: 'wait' };
  game.gauges.shelter = 3;
  game.gauges.reserves = 2;
  game.gauges.danger = 1;
  game.eventSequence = ['last_wave'];
  game.eventIndex = 0;

  ({ game } = resolveEvent(game, 'last_wave', { group: 'together' }));
  assert.equal(game.ending.requestedRoute, 'air');
  assert.equal(game.ending.id, 'no_return');
});
