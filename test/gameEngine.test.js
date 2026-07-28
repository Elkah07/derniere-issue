import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGame, resolveEvent } from '../src/gameEngine.js';

test('crée une partie avec deux joueurs et trois vies', () => {
  const game = createInitialGame({ names: ['Kathie', 'Alyssia'] });
  assert.equal(game.players.length, 2);
  assert.equal(game.players[0].lives, 3);
  assert.equal(game.gauges.reserves, 2);
});

test('refuse une partie avec moins de deux joueurs', () => {
  assert.throws(() => createInitialGame({ names: ['Solo'] }), /deux joueurs/i);
});

test('aider et sécuriser augmente la cohésion sans blessure', () => {
  const game = createInitialGame({ names: ['A', 'B'] });
  const resolved = resolveEvent(game, 'impact_escape', { p1: 'help', p2: 'exit' });
  assert.equal(resolved.game.gauges.cohesion, 1);
  assert.deepEqual(resolved.game.players[0].statuses, []);
  assert.equal(resolved.game.eventIndex, 1);
});

test('deux choix identiques de caisse ne sauvent qu’une catégorie', () => {
  const game = createInitialGame({ names: ['A', 'B'] });
  game.eventIndex = 1;
  const resolved = resolveEvent(game, 'burning_crates', { p1: 'provisions', p2: 'provisions' });
  assert.equal(resolved.game.gauges.reserves, 4);
  assert.match(resolved.result.title, /Une seule caisse/i);
});

test('le volontaire perd une vie en sauvant Nora', () => {
  const game = createInitialGame({ names: ['A', 'B'] });
  game.eventIndex = 2;
  const resolved = resolveEvent(game, 'save_nora', { group: 'solo' }, { volunteerId: 'p2' });
  assert.equal(resolved.game.players[1].lives, 2);
  assert.equal(resolved.game.chapterComplete, true);
});
