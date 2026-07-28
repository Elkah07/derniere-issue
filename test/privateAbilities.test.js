import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('les capacités ne sont plus affichées dans une liste publique', () => {
  assert.equal(main.includes('data-action="abilities"'), false);
  assert.equal(main.includes('Capacités du groupe'), false);
});

test('l’utilisation passe par un dossier privé et un écran masqué', () => {
  assert.equal(main.includes('data-action="ability-select"'), true);
  assert.equal(main.includes('DOSSIER STRICTEMENT PRIVÉ'), true);
  assert.equal(main.includes('Utiliser secrètement maintenant'), true);
  assert.equal(main.includes('Masquer et revenir à l’aventure'), true);
});
