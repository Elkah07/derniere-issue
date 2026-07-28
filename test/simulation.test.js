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

function simulate({ playerCount, duration, seed }) {
  const random = seededRandom(seed);
  let game = createInitialGame({
    names: Array.from({ length: playerCount }, (_, index) => `P${index + 1}`),
    duration,
    random,
  });

  let guard = 0;
  while (!game.complete && guard < 60) {
    const event = getCurrentEvent(game);
    assert.ok(event, 'la simulation doit toujours trouver le prochain événement');
    const choices = {};
    const extra = {};

    if (event.mode === 'group') {
      const choice = pick(getAvailableChoices(game, event), random);
      choices.group = choice.id;
      if (choice.requiresActor) extra.actorId = pick(game.players, random).id;
    } else if (event.mode === 'privateOne') {
      const playerId = getEventActorId(game, event);
      const choice = pick(getAvailableChoices(game, event, playerId), random);
      choices[playerId] = choice.id;
    } else {
      for (const player of game.players) {
        const choice = pick(getAvailableChoices(game, event, player.id), random);
        if (choice.requiresTarget) {
          const targets = game.players.filter((target) => target.id !== player.id);
          choices[player.id] = { choiceId: choice.id, targetId: pick(targets, random).id };
        } else {
          choices[player.id] = choice.id;
        }
      }
    }

    ({ game } = resolveEvent(game, event.id, choices, extra));
    guard += 1;
  }

  return game;
}

test('45 simulations variées terminent sans blocage', () => {
  const endings = new Set();
  for (const playerCount of [2, 4, 8]) {
    for (const duration of ['short', 'normal', 'long']) {
      for (const seed of [7, 19, 42, 77, 123]) {
        const game = simulate({ playerCount, duration, seed });
        assert.equal(game.complete, true);
        assert.ok(game.ending?.id);
        assert.equal(game.eventIndex, game.eventSequence.length);
        endings.add(game.ending.id);
      }
    }
  }
  assert.ok(endings.size >= 4, 'les simulations doivent atteindre plusieurs issues différentes');
});
