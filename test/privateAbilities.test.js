import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('les talents ne sont plus affichés ni activables depuis une liste publique', () => {
  assert.equal(main.includes('data-action="abilities"'), false);
  assert.equal(main.includes('data-action="ability-select"'), false);
  assert.equal(main.includes('Capacités du groupe'), false);
  assert.equal(main.includes('Utiliser secrètement maintenant'), false);
});

test('les talents sont proposés automatiquement dans une fenêtre privée contextuelle', () => {
  assert.equal(main.includes('FENÊTRE DE TALENT SECRET'), true);
  assert.equal(main.includes('data-action="talent-use"'), true);
  assert.equal(main.includes('Le conserver'), true);
  assert.equal(main.includes('POURQUOI MAINTENANT ?'), true);
});

test('un joueur à zéro vie reçoit une action privée au lieu de quitter la partie', () => {
  assert.equal(main.includes('PARCOURS SÉPARÉ'), true);
  assert.equal(main.includes('À zéro vie, la partie ne s’arrête pas'), true);
  assert.equal(main.includes('data-afterlife-action'), true);
});
