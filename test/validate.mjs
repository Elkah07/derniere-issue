import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../dossier-classe.json', import.meta.url), 'utf8'));

test('structure générale', () => {
  assert.equal(data.id, 'dossier-classe');
  assert.equal(data.chapters.length, 7);
  assert.equal(data.endings.length, 8);
  assert.equal(data.secretPlots.length, 4);
  assert.equal(data.talents.length, 8);
});

test('40 événements dont 12 branches et 7 imprévus', () => {
  assert.equal(data.events.length, 40);
  assert.equal(data.events.filter((event) => event.branch).length, 12);
  assert.equal(data.events.filter((event) => event.secondary).length, 7);
});

test('identifiants uniques', () => {
  const ids = data.events.map((event) => event.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('chaque événement est jouable', () => {
  for (const event of data.events) {
    assert.ok(event.scene.length >= 2, event.id);
    assert.ok(event.prompt.length > 10, event.id);
    assert.ok(event.choices.length >= 3, event.id);
    assert.ok(event.timeout?.narrative, event.id);
  }
});

test('les quatre bifurcations couvrent douze routes', () => {
  assert.equal(data.branchRules.length, 4);
  const routeCount = data.branchRules.reduce((sum, rule) => sum + Object.keys(rule.routes).length, 0);
  assert.equal(routeCount, 12);
});

test('duo sans taupe imposée', () => {
  const mole = data.secretPlots.find((plot) => plot.id === 'mole');
  assert.ok(mole.minPlayers >= 4);
});
