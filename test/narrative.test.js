import test from 'node:test';
import assert from 'node:assert/strict';
import { events } from '../src/gameData.js';
import { createInitialGame } from '../src/gameEngine.js';
import { getChapterNarrative, getEndingNarrative, getEventNarrative, getResultNarrative } from '../src/narrative.js';

test('chaque chapitre possède une introduction immersive en plusieurs paragraphes', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: () => 0 });
  for (let chapter = 1; chapter <= 7; chapter += 1) {
    const paragraphs = getChapterNarrative(game, chapter);
    assert.ok(paragraphs.length >= 2);
    assert.ok(paragraphs.join(' ').length >= 180);
  }
});

test('chaque événement possède une scène narrative développée', () => {
  const game = createInitialGame({ names: ['A', 'B'], duration: 'long', random: () => 0 });
  for (const event of events) {
    const paragraphs = getEventNarrative(game, event);
    assert.ok(paragraphs.length >= 1, event.id);
    assert.ok(paragraphs.join(' ').length >= 110, event.id);
  }
});

test('les conséquences comportent une narration avant les effets techniques', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: () => 0 });
  const paragraphs = getResultNarrative(game, { eventId: 'save_nora', summary: ['Cohésion +2'] });
  assert.ok(paragraphs.length >= 1);
  assert.ok(paragraphs.join(' ').length >= 100);
});

test('les épilogues finaux sont développés et personnalisés', () => {
  const game = createInitialGame({ names: ['A', 'B'], random: () => 0 });
  game.flags.noraAlive = true;
  game.flags.evidenceState = 'revealed';
  game.gauges.cohesion = 4;
  game.ending = {
    id: 'duo_together',
    title: 'À deux jusqu’au bout',
    icon: '💞',
    escapedIds: ['p1', 'p2'],
    route: 'raft',
    truth: 'Une ancienne balise a perturbé les instruments.'
  };
  const paragraphs = getEndingNarrative(game);
  assert.ok(paragraphs.length >= 4);
  assert.ok(paragraphs.join(' ').length >= 550);
});
