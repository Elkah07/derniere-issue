import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialGame,
  getActivePlayers,
  getAvailableChoices,
  getCurrentEvent,
  getEligibleTalentPlayers,
  getEventActorId,
  getPendingAfterlifePlayers,
  resolveAfterlifeAction,
  resolveEvent,
  useAbility,
} from '../src/gameEngine.js';

function firstTarget(game, playerId) {
  return getActivePlayers(game).find((player) => player.id !== playerId)?.id ?? playerId;
}

function automaticChoices(game, event) {
  const choices = {};
  const extra = {};
  if (event.mode === 'group') {
    const choice = getAvailableChoices(game, event)[0];
    choices.group = choice?.id ?? event.timeoutChoice ?? 'stay';
    if (choice?.requiresActor) extra.actorId = getActivePlayers(game)[0]?.id ?? game.players[0].id;
  } else if (event.mode === 'privateOne') {
    const playerId = getEventActorId(game, event);
    const choice = getAvailableChoices(game, event, playerId)[0];
    choices[playerId] = choice?.requiresTarget
      ? { choiceId: choice.id, targetId: firstTarget(game, playerId) }
      : (choice?.id ?? event.timeoutChoice ?? 'inaction');
  } else {
    getActivePlayers(game).forEach((player) => {
      const choice = getAvailableChoices(game, event, player.id)[0];
      choices[player.id] = choice?.requiresTarget
        ? { choiceId: choice.id, targetId: firstTarget(game, player.id) }
        : (choice?.id ?? event.timeoutChoice ?? 'inaction');
    });
  }
  return { choices, extra };
}

test('les talents contextuels et parcours séparés cohabitent sur une partie complète', () => {
  let game = createInitialGame({ names: ['A', 'B', 'C', 'D'], duration: 'normal', random: () => 0.31 });
  game.players[0].lives = 0;
  game.players[0].statuses.push('Séparé du groupe');
  game.players[0].afterlife = {
    id: 'lost', title: 'Disparu dans la jungle', icon: '🌴', briefing: 'Test', active: true,
    returnProgress: 0, lastActedChapter: null, enteredAtEvent: 'test', actionsTaken: [],
  };

  let guard = 0;
  let afterlifeActions = 0;
  let talentsUsed = 0;
  while (!game.complete && guard < 80) {
    const event = getCurrentEvent(game);
    assert.ok(event);

    for (const player of getPendingAfterlifePlayers(game, event)) {
      ({ game } = resolveAfterlifeAction(game, player.id, 'return', null, event.id));
      afterlifeActions += 1;
    }

    const talent = getEligibleTalentPlayers(game, event)[0];
    if (talent) {
      const target = firstTarget(game, talent.id);
      try {
        ({ game } = useAbility(game, talent.id, target, event.id));
        talentsUsed += 1;
      } catch {
        // Une cible peut devenir invalide entre deux fenêtres; la partie doit tout de même continuer.
      }
    }

    const { choices, extra } = automaticChoices(game, event);
    ({ game } = resolveEvent(game, event.id, choices, extra));
    guard += 1;
  }

  assert.equal(game.complete, true);
  assert.ok(game.ending?.id);
  assert.ok(afterlifeActions >= 2);
  assert.ok(talentsUsed >= 1);
  assert.equal(game.players[0].lives >= 1, true);
});
