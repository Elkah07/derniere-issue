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
