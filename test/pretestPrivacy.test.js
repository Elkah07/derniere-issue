import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const engine = fs.readFileSync(new URL('../src/gameEngine.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const sw = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

test('les inventaires personnels ne sont plus listés sur les cartes publiques', () => {
  assert.match(main, /contenu privé/);
  assert.match(main, /privateInventoryMarkup/);
  assert.doesNotMatch(main, /player\.inventory\.map\(\(item\).*player-card/s);
});

test('la cohésion publique utilise des états qualitatifs et non une valeur brute', () => {
  assert.match(main, /Groupe soudé/);
  assert.match(main, /Confiance fragile/);
  assert.match(main, /Au bord de la rupture/);
  assert.doesNotMatch(main, /Cohésion \$\{ui\.game\.gauges\.cohesion\}/);
});

test('les conséquences secrètes acceptent un résumé public séparé', () => {
  assert.match(engine, /publicSummary: null/);
  assert.match(main, /getPublicResultSummary/);
  assert.match(main, /Tout n’est pas encore visible/);
});

test('les choix graves demandent une confirmation et les choix privés sont remasqués', () => {
  assert.match(main, /DÉCISION IRRÉVERSIBLE/);
  assert.match(main, /private-mask-continue/);
  assert.match(main, /GRAVE_CHOICE_IDS/);
});

test('les chronos peuvent être mis en pause et repris', () => {
  assert.match(main, /function pauseCountdown/);
  assert.match(main, /function resumeCountdown/);
  assert.match(main, /data-action="\$\{paused \? 'resume-timer' : 'pause-timer'\}"/);
});

test('le faux réglage de public a été retiré de la préparation de partie', () => {
  assert.doesNotMatch(main, /<h3>Public<\/h3>/);
  assert.doesNotMatch(main, /data-audience/);
});

test('la version est installable et prévoit un cache hors ligne', () => {
  assert.match(index, /manifest\.webmanifest/);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.icons.length, 2);
  assert.match(sw, /caches\.open/);
  assert.match(main, /serviceWorker\.register/);
});

test('un rapport de partie peut être exporté pour le playtest', () => {
  assert.match(main, /function exportGameReport/);
  assert.match(main, /Exporter le rapport/);
});
