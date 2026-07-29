import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventById } from '../src/gameData.js';
import {
  createInitialGame,
  getEligibleTalentPlayers,
  getPendingAfterlifePlayers,
  resolveAfterlifeAction,
  resolveEvent,
  useAbility,
} from '../src/gameEngine.js';

const fixedRandom = () => 0.2;

test('un talent non pertinent est refusé puis devient disponible au bon événement', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  game.players[0].ability = { id: 'observer', title: 'Observateur', icon: '🔍', description: 'Observe', used: false, promptedEvents: [] };
  assert.equal(getEligibleTalentPlayers(game, getEventById('impact_escape')).some((p) => p.id === 'p1'), false);
  assert.equal(getEligibleTalentPlayers(game, getEventById('judgment')).some((p) => p.id === 'p1'), true);
  assert.throws(() => useAbility(game, 'p1', 'p1', 'impact_escape'), /ne peut pas intervenir/i);
});

test('atteindre zéro vie crée un parcours séparé actif', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  game.players[0].lives = 1;
  game.eventIndex = game.eventSequence.indexOf('save_nora');
  const { game: next } = resolveEvent(game, 'save_nora', { group: 'solo' }, { actorId: 'p1' });
  assert.equal(next.players[0].lives, 0);
  assert.equal(next.players[0].afterlife.active, true);
  assert.equal(next.players[0].afterlife.id, 'guardian');
  assert.ok(next.players[0].statuses.includes('Séparé du groupe'));
});

test('un joueur séparé agit une fois par chapitre et peut revenir', () => {
  let game = createInitialGame({ names: ['A', 'B'], random: fixedRandom });
  game.players[0].lives = 0;
  game.players[0].statuses.push('Séparé du groupe');
  game.players[0].afterlife = { id: 'lost', title: 'Disparu dans la jungle', icon: '🌴', briefing: 'Test', active: true, returnProgress: 0, lastActedChapter: null, enteredAtEvent: 'test', actionsTaken: [] };
  game.eventIndex = game.eventSequence.indexOf('expedition');
  const event4 = getEventById('expedition');
  assert.equal(getPendingAfterlifePlayers(game, event4).length, 1);
  ({ game } = resolveAfterlifeAction(game, 'p1', 'return', null, 'expedition'));
  assert.equal(game.players[0].afterlife.returnProgress, 1);
  assert.equal(getPendingAfterlifePlayers(game, event4).length, 0);
  game.players[0].afterlife.lastActedChapter = 4;
  game.eventIndex = game.eventSequence.indexOf('judgment');
  ({ game } = resolveAfterlifeAction(game, 'p1', 'return', null, 'judgment'));
  assert.equal(game.players[0].lives, 1);
  assert.equal(game.players[0].afterlife.active, false);
  assert.ok(game.players[0].statuses.includes('Revenu de justesse'));
});
