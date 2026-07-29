import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAudioTheme } from '../src/audio.js';

test('le thème suit les chapitres principaux', () => {
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 1 } }), 'crash');
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 3 } }), 'night');
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 6 } }), 'station');
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 7 } }), 'evacuation');
});

test('le chapitre 2 reflète réellement le camp choisi', () => {
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 2 }, game: { flags: { branchPath: ['camp:beach'] } } }), 'beach');
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 2 }, game: { flags: { branchPath: ['camp:fuselage'] } } }), 'fuselage');
  assert.equal(selectAudioTheme({ screen: 'game', event: { chapter: 2 }, game: { flags: { branchPath: ['camp:jungle'] } } }), 'jungle');
});

test('les fins heureuses et sombres ont des ambiances distinctes', () => {
  assert.equal(selectAudioTheme({ screen: 'ending', game: { ending: { id: 'everyone_home' } } }), 'endingHope');
  assert.equal(selectAudioTheme({ screen: 'ending', game: { ending: { id: 'duo_together' } } }), 'endingHope');
  assert.equal(selectAudioTheme({ screen: 'ending', game: { ending: { id: 'false_rescue' } } }), 'endingDark');
});

test('les scènes fortes déclenchent un effet ponctuel adapté', async () => {
  const { selectEventCue } = await import('../src/audio.js');
  assert.equal(selectEventCue('burning_crates'), 'explosion');
  assert.equal(selectEventCue('trapped'), 'collapse');
  assert.equal(selectEventCue('last_wave'), 'waveImpact');
  assert.equal(selectEventCue('radio_voice'), 'radioMessage');
});

test('les ambiances ne programment plus de bruits aléatoires répétitifs', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/audio.js', import.meta.url), 'utf8');
  assert.equal(source.includes('this.schedule('), false);
});
