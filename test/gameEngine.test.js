import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventById } from '../src/gameData.js';
import {
  createInitialGame,
  getAvailableChoices,
  getCurrentEvent,
  getEventActorId,
  resolveEvent,
  upgradeSavedGame,
  useAbility,
} from '../src/gameEngine.js';

function fixedRandom() {
  return 0.1;
}

function playAutomatically(duration = 'normal', names = ['A', 'B', 'C', 'D']) {
  let game = createInitialGame({ names, duration, random: fixedRandom });
  let guard = 0;
  while (!game.complete && guard < 60) {
    const event = getCurrentEvent(game);
    assert.ok(event, 'un événement doit rester disponible');
    const choices = {};
    const extra = {};

    if (event.mode === 'group') {
      const choice = getAvailableChoices(game, event)[0];
      assert.ok(choice, `choix disponible pour ${event.id}`);
      choices.group = choice.id;
      if (choice.requiresActor) extra.actorId = game.players[0].id;
    } else if (event.mode === 'privateOne') {
      const playerId = getEventActorId(game, event);
      const choice = getAvailableChoices(game, event, playerId)[0];
      choices[playerId] = choice.id;
    } else {
      for (const player of game.players) {
        const choice = getAvailableChoices(game, event, player.id)[0];
        choices[player.id] = choice.requiresTarget
          ? { choiceId: choice.id, targetId: game.players.find((item) => item.id !== player.id).id }
          : choice.id;
      }
    }

    ({ game } = resolveEvent(game, event.id, choices, extra));
    guard += 1;
  }
  return game;
}

test('crée une partie de deux joueurs avec trois vies et un briefing', () => {
  const game = createInitialGame({ names: ['Kathie', 'Alyssia'], random: fixedRandom });
  assert.equal(game.players.length, 2);
  assert.equal(game.players[0].lives, 3);
  assert.ok(game.players[0].ability.title);
  assert.ok(game.players[0].role.title);
  assert.equal(game.gauges.reserves, 2);
});

test('refuse une partie avec moins de deux joueurs', () => {
  assert.throws(() => createInitialGame({ names: ['Solo'] }), /deux joueurs/i);
});

test('le mode duo ne distribue jamais le rôle de saboteur', () => {
  for (const value of [0, 0.25, 0.5, 0.75, 0.99]) {
    const game = createInitialGame({ names: ['A', 'B'], random: () => value });
    assert.notEqual(game.plot.id, 'saboteur');
  }
});

test('aider et sécuriser augmente la cohésion sans blessure', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  const resolved = resolveEvent(game, 'impact_escape', { p1: 'help', p2: 'exit' });
  assert.equal(resolved.game.gauges.cohesion, 1);
  assert.deepEqual(resolved.game.players[0].statuses, []);
  assert.equal(resolved.game.eventIndex, 1);
});

test('deux choix identiques de caisse ne sauvent qu’une catégorie', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  game.eventIndex = 1;
  const resolved = resolveEvent(game, 'burning_crates', { p1: 'provisions', p2: 'provisions' });
  assert.equal(resolved.game.gauges.reserves, 4);
  assert.match(resolved.result.title, /Une seule caisse/i);
});

test('le volontaire perd une vie en sauvant Nora', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  game.eventIndex = 2;
  const resolved = resolveEvent(game, 'save_nora', { group: 'solo' }, { actorId: 'p2' });
  assert.equal(resolved.game.players[1].lives, 2);
  assert.equal(resolved.game.flags.noraAlive, true);
});

test('une capacité ne peut être utilisée qu’une fois', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: () => 0 });
  const first = useAbility(game, 'p1', 'p2');
  assert.equal(first.game.players[0].ability.used, true);
  assert.throws(() => useAbility(first.game, 'p1', 'p2'), /déjà été utilisée/i);
});

test('les routes d’évacuation sont filtrées selon les conditions', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  const event = getEventById('escape_route');
  const initial = getAvailableChoices(game, event).map((choice) => choice.id);
  assert.deepEqual(initial, ['stay']);
  game.flags.beaconActive = true;
  game.flags.codeKnown = true;
  game.gauges.signal = 4;
  const unlocked = getAvailableChoices(game, event).map((choice) => choice.id);
  assert.ok(unlocked.includes('air'));
});

test('les trois durées atteignent toutes une issue finale', () => {
  const short = playAutomatically('short', ['A', 'B']);
  const normal = playAutomatically('normal');
  const long = playAutomatically('long');
  assert.equal(short.eventSequence.length, 15);
  assert.equal(normal.eventSequence.length, 21);
  assert.equal(long.eventSequence.length, 28);
  assert.ok(short.complete && normal.complete && long.complete);
  assert.ok(short.ending?.id && normal.ending?.id && long.ending?.id);
});

test('une ancienne sauvegarde du chapitre 1 reprend au chapitre 2', () => {
  const legacy = {
    version: 1,
    settings: { duration: 'normal', audience: 'all' },
    players: [
      { name: 'A', lives: 3, statuses: [], inventory: [] },
      { name: 'B', lives: 2, statuses: ['Blessé'], inventory: ['Lampe'] },
    ],
    gauges: { reserves: 3, shelter: 0, signal: 1, danger: 2, cohesion: 1 },
    eventIndex: 3,
    chapterComplete: true,
    history: [{ flag: 'nora_saved' }],
  };
  const migrated = upgradeSavedGame(legacy);
  assert.equal(migrated.version, 4);
  assert.equal(migrated.eventIndex, 3);
  assert.equal(getCurrentEvent(migrated).chapter, 2);
  assert.equal(migrated.flags.noraAlive, true);
});
