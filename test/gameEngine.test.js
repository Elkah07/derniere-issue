import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventById } from '../src/gameData.js';
import {
  createInitialGame,
  getAvailableChoices,
  getCurrentEvent,
  getEventActorId,
  resolveEvent,
  registerPromises,
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
  assert.ok(short.eventSequence.length >= 18);
  assert.ok(normal.eventSequence.length >= 21);
  assert.ok(long.eventSequence.length >= 28);
  assert.ok(short.flags.branchPath.length >= 4);
  assert.ok(normal.flags.branchPath.length >= 4);
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
  assert.equal(migrated.version, 5);
  assert.equal(migrated.eventIndex, 3);
  assert.equal(getCurrentEvent(migrated).chapter, 2);
  assert.equal(migrated.flags.noraAlive, true);
});


test('le choix du camp ouvre une scène exclusive et retire la tâche générique', () => {
  const game = createInitialGame({ names: ['A', 'B'], duration: 'normal', random: fixedRandom });
  game.eventIndex = game.eventSequence.indexOf('choose_shelter');
  const resolved = resolveEvent(game, 'choose_shelter', { group: 'jungle' });
  assert.equal(getCurrentEvent(resolved.game).id, 'shelter_jungle_source');
  assert.equal(resolved.game.eventSequence.includes('camp_tasks'), false);
  assert.ok(resolved.game.flags.branchPath.includes('camp:jungle'));
});

test('se séparer ouvre la cache et évite la faille commune', () => {
  const game = createInitialGame({ names: ['A', 'B', 'C'], duration: 'normal', random: fixedRandom });
  game.eventIndex = game.eventSequence.indexOf('expedition');
  const resolved = resolveEvent(game, 'expedition', { group: 'split' });
  assert.equal(getCurrentEvent(resolved.game).id, 'split_cache');
  assert.equal(resolved.game.eventSequence.includes('ravine'), false);
});

test('une promesse brisée est enregistrée comme trahison', () => {
  let game = createInitialGame({ names: ['A', 'B'], duration: 'normal', random: fixedRandom });
  game = registerPromises(game, 'rations', [{
    playerId: 'p1',
    targetId: 'p2',
    promiseId: 'share',
    label: 'Je partagerai équitablement',
    expectedChoiceIds: ['share'],
  }]);
  game.eventIndex = game.eventSequence.indexOf('rations');
  const resolved = resolveEvent(game, 'rations', { p1: 'extra', p2: 'share' });
  assert.equal(resolved.game.flags.promises[0].honored, false);
  assert.ok(resolved.game.betrayalLog.some((item) => item.actorId === 'p1' && item.targetId === 'p2'));
  assert.ok(resolved.game.relations.p2.p1 < 0);
});

test('une absence de décision déclenche la conséquence du chrono', () => {
  const game = createInitialGame({ names: ['A', 'B'], duration: 'normal', random: fixedRandom });
  game.eventIndex = game.eventSequence.indexOf('save_nora');
  const resolved = resolveEvent(game, 'save_nora', {}, { timeout: true });
  assert.equal(resolved.result.timedOut, true);
  assert.equal(resolved.game.flags.noraAbandoned, true);
  assert.equal(resolved.game.flags.timedOutDecisions, 1);
  assert.ok(resolved.result.summary.some((line) => /temps|structure|flammes/i.test(line)));
});

test('une trahison ciblée modifie réellement la victime', () => {
  const game = createInitialGame({ names: ['A', 'B', 'C'], duration: 'normal', random: fixedRandom });
  game.eventSequence.splice(0, game.eventSequence.length, 'split_cache');
  game.eventIndex = 0;
  const resolved = resolveEvent(game, 'split_cache', {
    p1: { choiceId: 'misdirect', targetId: 'p2' },
    p2: 'report',
    p3: 'hide',
  });
  assert.equal(resolved.game.players[1].lives, 2);
  assert.ok(resolved.game.players[1].statuses.includes('Perdu dans la jungle'));
  assert.ok(resolved.game.betrayalLog.some((item) => item.targetId === 'p2'));
});
