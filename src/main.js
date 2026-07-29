import { audioDirector } from './audio.js';
import { chapters, events, getEventById, setupOptions } from './gameData.js';
import { getChapterNarrative, getEndingNarrative, getEventNarrative, getResultNarrative, getStoryEchoes } from './narrative.js';
import {
  createInitialGame,
  getAvailableChoices,
  getCurrentEvent,
  getEventActorId,
  getActivePlayers,
  getEligibleTalentPlayers,
  markTalentPrompted,
  getPendingAfterlifePlayers,
  getAfterlifeChoices,
  resolveAfterlifeAction,
  publicStatuses,
  resolveEvent,
  registerPromises,
  upgradeSavedGame,
  useAbility,
} from './gameEngine.js';
import {
  clearGame,
  loadGame,
  loadSettings,
  resetSettings,
  saveGame,
  saveSettings,
  saveSessionState,
  loadSessionState,
  clearSessionState,
} from './storage.js';

const app = document.querySelector('#app');
const upgradedSave = upgradeSavedGame(loadGame());
const restoredSession = loadSessionState();
if (upgradedSave) saveGame(upgradedSave);

let ui = {
  screen: 'home',
  game: upgradedSave,
  setup: {
    playerCount: 2,
    names: ['Joueur 1', 'Joueur 2'],
    duration: 'normal',
    audience: 'all',
  },
  settings: loadSettings(),
  briefingIndex: 0,
  briefingReady: false,
  privateOrder: [],
  privateTurnIndex: 0,
  passReady: false,
  draftChoices: {},
  pendingChoice: null,
  selectedGroupChoice: null,
  actorId: null,
  result: null,
  talentQueue: [],
  talentEligibleIds: [],
  talentIndex: 0,
  talentReady: false,
  talentTargetId: null,
  talentPrivateResult: null,
  afterlifeQueue: [],
  afterlifeIndex: 0,
  afterlifeReady: false,
  afterlifeTargetId: null,
  afterlifePrivateResult: null,
  discussionPromises: [],
  promiseDraft: { playerId: null, promiseId: null, targetId: '' },
  timedOutIds: [],
  timerHandle: null,
  timerDeadline: null,
  timerRemaining: null,
  timerPhase: null,
  lastTimerSoundSecond: null,
  timerPaused: false,
  timerExpireAction: null,
  timerTotalSeconds: null,
  confirmation: null,
  confirmationReturnScreen: null,
  pendingPrivateResolution: false,
  dossierPlayerId: null,
  dossierReady: false,
  dossierReturnScreen: 'game',
  restoredTimerPending: false,
};

let visualState = {
  lastSceneKey: '',
  lastCue: '',
};


function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function renderParagraphs(paragraphs, className = 'narrative-copy') {
  return `<div class="${className}">${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>`;
}



const GRAVE_CHOICE_IDS = new Set([
  'abandon', 'solo', 'sacrifice', 'continue', 'destroy', 'erase', 'damage',
  'contaminate', 'steal', 'misdirect', 'mislead', 'frame', 'sabotage',
  'capsule', 'reserve', 'extra', 'demand', 'board', 'collapse', 'decoy',
]);

const ACTIVE_SESSION_SCREENS = new Set([
  'discussion', 'privateChoice', 'privateMask', 'groupChoice', 'confirmChoice',
  'talentPrompt', 'afterlifePrompt', 'dossierSelect', 'privateDossier',
]);

function cohesionLabel(value) {
  if (value >= 4) return { label: 'Groupe soudé', tone: 'strong' };
  if (value >= 2) return { label: 'Confiance solide', tone: 'stable' };
  if (value >= 0) return { label: 'Confiance fragile', tone: 'fragile' };
  if (value >= -2) return { label: 'Tensions visibles', tone: 'tense' };
  return { label: 'Au bord de la rupture', tone: 'broken' };
}

function sanitizePublicSummaryLine(line) {
  const original = String(line ?? '');
  const cleaned = original
    .replace(/(?:,?\s*)Cohésion\s*[+-]\s*\d+\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,])/g, '$1')
    .trim();
  if (/Cohésion/i.test(original) && (!cleaned || cleaned.length < 12 || cleaned.endsWith(':'))) {
    return 'La confiance au sein du groupe évolue.';
  }
  return cleaned || 'La dynamique du groupe change.';
}

function getPublicResultSummary(result) {
  if (!result) return [];
  const source = Array.isArray(result.publicSummary)
    ? result.publicSummary
    : result.secret
      ? ['Certaines décisions ont été enregistrées sans être révélées. Leurs effets pourront apparaître plus tard.']
      : (result.summary ?? []);
  return source.map(sanitizePublicSummaryLine).filter(Boolean);
}

function getPublicResultNarrative(result) {
  if (result?.secret && !result?.publicNarrative) {
    return [
      'Les joueurs terminent leurs choix, mais tout ne se lit pas sur leurs visages.',
      'Une partie de ce qui vient de se passer restera dans l’ombre jusqu’à ce qu’un indice, une conséquence ou le bilan final la révèle.',
    ];
  }
  return result?.publicNarrative ?? getResultNarrative(ui.game, result);
}

function choiceNeedsConfirmation(choice) {
  if (!choice) return false;
  return GRAVE_CHOICE_IDS.has(choice.id)
    || /abandon|trahir|saboter|détruire|contaminer|voler|sacrifier|laisser|faire échouer|partir immédiatement/i.test(`${choice.label} ${choice.description}`);
}

function privateInventoryMarkup(player, compact = false) {
  const items = player?.inventory ?? [];
  const secrets = player?.secrets ?? [];
  return `<section class="private-inventory ${compact ? 'compact' : ''}">
    <p class="step">TON INVENTAIRE PRIVÉ</p>
    <div class="inventory">${items.length ? items.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Aucun objet personnel</span>'}</div>
    ${!compact && secrets.length ? `<details><summary>Rappels secrets (${secrets.length})</summary><ul>${secrets.map((secret) => `<li>${escapeHtml(secret)}</li>`).join('')}</ul></details>` : ''}
  </section>`;
}

function persistUiSession() {
  if (!ui.game || ui.game.complete || !ACTIVE_SESSION_SCREENS.has(ui.screen)) return;
  saveSessionState({
    eventId: currentEvent()?.id ?? null,
    screen: ui.screen,
    privateOrder: ui.privateOrder,
    privateTurnIndex: ui.privateTurnIndex,
    draftChoices: ui.draftChoices,
    pendingChoice: ui.pendingChoice,
    selectedGroupChoice: ui.selectedGroupChoice,
    actorId: ui.actorId,
    timedOutIds: ui.timedOutIds,
    discussionPromises: ui.discussionPromises,
    promiseDraft: ui.promiseDraft,
    talentQueue: ui.talentQueue,
    talentEligibleIds: ui.talentEligibleIds,
    talentIndex: ui.talentIndex,
    afterlifeQueue: ui.afterlifeQueue,
    afterlifeIndex: ui.afterlifeIndex,
    timerRemaining: ui.timerRemaining,
    timerPhase: ui.timerPhase,
    timerTotalSeconds: ui.timerTotalSeconds,
    pendingPrivateResolution: ui.pendingPrivateResolution,
    confirmation: ui.confirmation,
    confirmationReturnScreen: ui.confirmationReturnScreen,
    dossierPlayerId: ui.dossierPlayerId,
    dossierReturnScreen: ui.dossierReturnScreen,
    savedAt: Date.now(),
  });
}

function restoreUiSessionIfPossible() {
  if (!restoredSession || !ui.game || ui.game.complete) return;
  if (restoredSession.eventId !== currentEvent()?.id) {
    clearSessionState();
    return;
  }
  const allowed = ACTIVE_SESSION_SCREENS.has(restoredSession.screen) ? restoredSession.screen : 'game';
  Object.assign(ui, {
    screen: allowed,
    privateOrder: restoredSession.privateOrder ?? [],
    privateTurnIndex: restoredSession.privateTurnIndex ?? 0,
    draftChoices: restoredSession.draftChoices ?? {},
    pendingChoice: restoredSession.pendingChoice ?? null,
    selectedGroupChoice: restoredSession.selectedGroupChoice ?? null,
    actorId: restoredSession.actorId ?? null,
    timedOutIds: restoredSession.timedOutIds ?? [],
    discussionPromises: restoredSession.discussionPromises ?? [],
    promiseDraft: restoredSession.promiseDraft ?? ui.promiseDraft,
    talentQueue: restoredSession.talentQueue ?? [],
    talentEligibleIds: restoredSession.talentEligibleIds ?? [],
    talentIndex: restoredSession.talentIndex ?? 0,
    afterlifeQueue: restoredSession.afterlifeQueue ?? [],
    afterlifeIndex: restoredSession.afterlifeIndex ?? 0,
    timerRemaining: restoredSession.timerRemaining ?? null,
    timerPhase: restoredSession.timerPhase ?? null,
    timerTotalSeconds: restoredSession.timerTotalSeconds ?? null,
    timerPaused: Boolean(restoredSession.timerRemaining),
    restoredTimerPending: Boolean(restoredSession.timerRemaining),
    pendingPrivateResolution: restoredSession.pendingPrivateResolution ?? false,
    confirmation: restoredSession.confirmation ?? null,
    confirmationReturnScreen: restoredSession.confirmationReturnScreen ?? null,
    dossierPlayerId: restoredSession.dossierPlayerId ?? null,
    dossierReturnScreen: restoredSession.dossierReturnScreen ?? 'game',
    passReady: false,
    talentReady: false,
    afterlifeReady: false,
    dossierReady: false,
  });
}

function exportGameReport() {
  if (!ui.game) return;
  const report = {
    application: 'Dernière Issue',
    version: '0.8.1',
    generatedAt: new Date().toISOString(),
    progress: progressLabel(),
    currentEvent: currentEvent()?.id ?? null,
    settings: ui.game.settings,
    game: ui.game,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `derniere-issue-rapport-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function buildSceneLayer() {
  return `
    <div class="scene-gradient"></div>
    <div class="scene-water"></div>
    <div class="scene-fog"></div>
    <div class="scene-rain">${Array.from({ length: 18 }, (_, index) => `<span style="--x:${index * 6}; --d:${8 + (index % 6)}s; --delay:${(index % 5) * -1.3}s"></span>`).join('')}</div>
    <div class="scene-embers">${Array.from({ length: 14 }, (_, index) => `<span style="--x:${4 + index * 7}; --s:${6 + (index % 4) * 3}px; --d:${10 + (index % 5)}s; --delay:${(index % 4) * -2}s"></span>`).join('')}</div>
    <div class="scene-leaves">${Array.from({ length: 12 }, (_, index) => `<span style="--x:${index * 8}; --d:${11 + (index % 4)}s; --delay:${(index % 6) * -1.5}s"></span>`).join('')}</div>
    <div class="scene-scanlines"></div>
    <div class="scene-grid"></div>
    <div class="scene-lightning"></div>
    <div class="scene-spotlight"></div>
  `;
}

function ensureSceneLayer() {
  let layer = document.querySelector('.cinema-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'cinema-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = buildSceneLayer();
    document.body.appendChild(layer);
  }
  return layer;
}

function getSceneDescriptor(screen = ui.screen, game = ui.game, event = currentEvent()) {
  const classes = [`screen-${screen}`];
  let scene = 'menu';
  let cue = 'fade';

  if (['home', 'adventure', 'setup', 'settings', 'rules', 'briefing', 'talentPrompt', 'afterlifePrompt'].includes(screen)) {
    if (['briefing', 'talentPrompt', 'afterlifePrompt'].includes(screen)) {
      scene = 'briefing';
      cue = 'reveal';
    } else if (screen === 'adventure' || screen === 'setup') {
      scene = 'crash';
    } else {
      scene = 'menu';
    }
    return { key: `${screen}:${scene}`, classes: [...classes, `scene-${scene}`], cue };
  }

  if (screen === 'ending') {
    const endingId = game?.ending?.id ?? 'unknown';
    if (['everyone_home', 'duo_until_end'].includes(endingId)) scene = 'ending-hope';
    else if (['fake_rescue', 'island_secret'].includes(endingId)) scene = 'ending-unease';
    else scene = 'ending-dark';
    return { key: `${screen}:${endingId}`, classes: [...classes, `scene-${scene}`, `ending-${endingId}`], cue: 'ending' };
  }

  const chapter = event?.chapter ?? 0;
  if (chapter) classes.push(`chapter-${chapter}`);
  const shelter = game?.flags?.shelterLocation;

  if (chapter === 1) scene = 'crash';
  else if (chapter === 2) {
    if (shelter === 'beach' || (game?.flags?.branchPath ?? []).includes('camp:beach')) scene = 'beach';
    else if (shelter === 'fuselage' || (game?.flags?.branchPath ?? []).includes('camp:fuselage')) scene = 'fuselage';
    else scene = 'jungle';
  } else if (chapter === 3) scene = 'night';
  else if (chapter === 4) scene = 'jungle';
  else if (chapter === 5) scene = 'storm';
  else if (chapter === 6) scene = 'station';
  else if (chapter === 7) scene = 'evac';

  classes.push(`scene-${scene}`);
  if (game?.flags?.radioActive || ['radio_voice', 'shore_signal', 'mask_frequency'].includes(event?.id)) classes.push('scene-radio');
  if (game?.flags?.fuselageRisk) classes.push('scene-fire');
  if (game?.flags?.atStation || chapter >= 6) classes.push('scene-tech');
  if (event?.secondary) classes.push('scene-secondary');

  if (screen === 'result') {
    if (ui.result?.timedOut) cue = 'impact';
    else if (ui.result?.secret) cue = 'glitch';
    else cue = 'pulse';
  } else if (screen === 'chapter') cue = chapter === 1 ? 'impact' : 'fade';
  else if (screen === 'discussion') cue = 'pulse';
  else if (['privateChoice', 'groupChoice', 'talentPrompt', 'afterlifePrompt'].includes(screen)) cue = 'reveal';

  return { key: `${screen}:${event?.id ?? 'none'}:${scene}`, classes, cue };
}

function triggerVisualCue(cue = 'fade') {
  if (ui.settings.reducedMotion || ui.settings.cinematicFx === false) return;
  const activeCue = cue || 'fade';
  const className = `effect-${activeCue}`;
  document.body.classList.remove('effect-impact', 'effect-glitch', 'effect-pulse', 'effect-reveal', 'effect-ending', 'effect-fade');
  void document.body.offsetWidth;
  document.body.classList.add(className);
  window.setTimeout(() => document.body.classList.remove(className), activeCue === 'ending' ? 1400 : 820);
}

function applyStaggers() {
  const selectors = ['.menu-tile', '.adventure-card', '.player-card', '.choice-card', '.target-card', '.ability-card', '.reveal-player', '.gauge-card'];
  document.querySelectorAll(selectors.join(',')).forEach((element, index) => {
    element.style.setProperty('--stagger', String(Math.min(index, 12)));
  });
}

function applyVisualTheme() {
  ensureSceneLayer();
  const descriptor = getSceneDescriptor();
  document.body.className = document.body.className
    .split(' ')
    .filter((className) => className && !className.startsWith('scene-') && !className.startsWith('screen-') && !className.startsWith('chapter-') && !className.startsWith('ending-') && !className.startsWith('effect-'))
    .join(' ')
    .trim();
  descriptor.classes.forEach((className) => document.body.classList.add(className));
  document.body.classList.toggle('cinematic-fx-off', ui.settings.cinematicFx === false);
  app.classList.toggle('cinematic-fx-off', ui.settings.cinematicFx === false);
  applyStaggers();
  if (visualState.lastSceneKey !== descriptor.key) {
    triggerVisualCue(descriptor.cue);
    visualState.lastSceneKey = descriptor.key;
  }
}

function setScreen(screen, options = {}) {
  ui.screen = screen;
  if (!options.skipHistory) {
    const state = { derniereIssue: true, screen };
    if (options.replaceHistory) window.history?.replaceState?.(state, '');
    else window.history?.pushState?.(state, '');
  }
  window.scrollTo({ top: 0, behavior: ui.settings.reducedMotion ? 'auto' : 'smooth' });
  render();
}

function applySettings() {
  document.documentElement.classList.toggle('reduced-motion', ui.settings.reducedMotion);
  document.documentElement.classList.toggle('large-text', ui.settings.largeText);
  document.documentElement.classList.toggle('high-contrast', ui.settings.highContrast);
  document.documentElement.classList.toggle('cinematic-disabled', ui.settings.cinematicFx === false);
  audioDirector.configure(ui.settings);
}

function toggleSetting(key) {
  ui.settings[key] = !ui.settings[key];
  saveSettings(ui.settings);
  applySettings();
  if (key === 'vibrations' && ui.settings.vibrations && navigator.vibrate) navigator.vibrate(35);
  if (key === 'sound' && ui.settings.sound) audioDirector.unlock().then(() => audioDirector.play('reveal', 0.55));
  render();
}


function clearCountdown() {
  if (ui.timerHandle) window.clearInterval(ui.timerHandle);
  ui.timerHandle = null;
  ui.timerDeadline = null;
  ui.timerRemaining = null;
  ui.timerPhase = null;
  ui.timerExpireAction = null;
  ui.timerTotalSeconds = null;
  ui.timerPaused = false;
  ui.restoredTimerPending = false;
  ui.lastTimerSoundSecond = null;
  document.documentElement.classList.toggle('countdown-critical', false);
}

function stopCountdownInterval() {
  if (ui.timerHandle) window.clearInterval(ui.timerHandle);
  ui.timerHandle = null;
  ui.timerDeadline = null;
}

function updateCountdownDom() {
  const value = document.querySelector('[data-countdown-value]');
  const fill = document.querySelector('[data-countdown-fill]');
  if (value) value.textContent = ui.timerRemaining == null ? '∞' : String(ui.timerRemaining);
  if (fill) {
    const total = Number(fill.dataset.total ?? ui.timerTotalSeconds ?? 1);
    const percent = ui.timerRemaining == null ? 100 : Math.max(0, Math.min(100, (ui.timerRemaining / total) * 100));
    fill.style.width = `${percent}%`;
  }
  document.documentElement.classList.toggle('countdown-critical', ui.timerRemaining != null && ui.timerRemaining <= 5 && !ui.timerPaused);
}

function startCountdown(seconds, phase, onExpire, totalSeconds = seconds) {
  clearCountdown();
  if (!ui.settings.timers || !seconds) {
    ui.timerRemaining = null;
    updateCountdownDom();
    return;
  }
  ui.timerPhase = phase;
  ui.timerExpireAction = onExpire;
  ui.timerTotalSeconds = totalSeconds;
  ui.timerPaused = false;
  ui.timerRemaining = seconds;
  ui.timerDeadline = Date.now() + (seconds * 1000);
  const tick = () => {
    ui.timerRemaining = Math.max(0, Math.ceil((ui.timerDeadline - Date.now()) / 1000));
    updateCountdownDom();
    persistUiSession();
    if (ui.timerRemaining > 0 && ui.timerRemaining <= 5 && ui.lastTimerSoundSecond !== ui.timerRemaining) {
      ui.lastTimerSoundSecond = ui.timerRemaining;
      audioDirector.play('tick', 6 - ui.timerRemaining);
    }
    if (ui.timerRemaining <= 0) {
      const expire = ui.timerExpireAction;
      clearCountdown();
      if (ui.settings.vibrations && navigator.vibrate) navigator.vibrate([120, 70, 120]);
      audioDirector.play('timeout', 1);
      expire?.();
    }
  };
  tick();
  ui.timerHandle = window.setInterval(tick, 250);
}

function pauseCountdown() {
  if (!ui.settings.timers || ui.timerPaused || ui.timerRemaining == null) return;
  if (ui.timerDeadline) ui.timerRemaining = Math.max(1, Math.ceil((ui.timerDeadline - Date.now()) / 1000));
  stopCountdownInterval();
  ui.timerPaused = true;
  ui.restoredTimerPending = false;
  updateCountdownDom();
  render();
}

function resumeCountdown() {
  if (!ui.settings.timers || !ui.timerPaused || ui.timerRemaining == null) return;
  const remaining = ui.timerRemaining;
  const phase = ui.timerPhase;
  const expire = ui.timerExpireAction ?? (
    phase === 'discussion' ? startChoicePhase
      : phase === 'private-decision' ? submitPrivateTimeout
        : submitGroupTimeout
  );
  const total = ui.timerTotalSeconds ?? remaining;
  startCountdown(remaining, phase, expire, total);
  render();
}

function countdownMarkup(seconds, label) {
  if (!ui.settings.timers) return `<div class="countdown disabled"><span>⏳</span><div><strong>${escapeHtml(label)}</strong><small>Chrono désactivé dans les réglages</small></div></div>`;
  const remaining = ui.timerRemaining ?? seconds;
  const paused = ui.timerPaused || ui.restoredTimerPending;
  return `<div class="countdown ${paused ? 'paused' : ''}"><span>⏳</span><div class="countdown-copy"><strong>${escapeHtml(label)}</strong><small>${paused ? 'Le chrono est en pause. Reprenez quand tout le monde est prêt.' : 'Sans décision, la situation choisira à votre place.'}</small><div class="countdown-track"><i data-countdown-fill data-total="${ui.timerTotalSeconds ?? seconds}" style="width:${Math.max(0, Math.min(100, (remaining / (ui.timerTotalSeconds ?? seconds)) * 100))}%"></i></div></div><b data-countdown-value>${remaining}</b><button class="timer-control" data-action="${paused ? 'resume-timer' : 'pause-timer'}" type="button">${paused ? '▶ Reprendre' : 'Ⅱ Pause'}</button></div>`;
}

function currentEvent() {
  return getCurrentEvent(ui.game);
}

function progressLabel(game = ui.game) {
  if (!game) return 'Aucune partie en cours';
  if (game.complete) return `Aventure terminée · ${game.ending?.title ?? 'Issue découverte'}`;
  const event = getCurrentEvent(game);
  return `Chapitre ${event?.chapter ?? 7} · Étape ${Math.min(game.eventIndex + 1, game.eventSequence.length)}/${game.eventSequence.length}`;
}

function resumeGame() {
  if (!ui.game) return setScreen('adventure');
  if (ui.game.complete) return setScreen('ending');
  if (!ui.game.briefingComplete) return setScreen('briefing');
  if (ui.game.chapterTransition) return setScreen('chapter');
  return setScreen('game');
}

function startNewGame() {
  clearSessionState();
  const names = ui.setup.names.slice(0, ui.setup.playerCount);
  try {
    ui.game = createInitialGame({ names, duration: ui.setup.duration, audience: ui.setup.audience });
    ui.briefingIndex = 0;
    ui.briefingReady = false;
    ui.result = null;
    saveGame(ui.game);
    setScreen('briefing');
  } catch (error) {
    alert(error.message);
  }
}

function replaySameGame() {
  if (!ui.game) return setScreen('setup');
  ui.setup.playerCount = ui.game.players.length;
  ui.setup.names = ui.game.players.map((player) => player.name);
  ui.setup.duration = ui.game.settings.duration;
  ui.setup.audience = 'all';
  startNewGame();
}

function resetRun() {
  clearGame();
  clearSessionState();
  ui.game = null;
  ui.result = null;
  setScreen('home');
}

function enterChapter() {
  if (!ui.game) return;
  clearSessionState();
  ui.game.chapterTransition = null;
  saveGame(ui.game);
  setScreen('game');
}

function beginEvent() {
  clearSessionState();
  const event = currentEvent();
  if (!event) return;
  clearCountdown();
  ui.result = null;
  ui.draftChoices = {};
  ui.privateTurnIndex = 0;
  ui.passReady = false;
  ui.pendingChoice = null;
  ui.selectedGroupChoice = null;
  ui.actorId = getActivePlayers(ui.game)[0]?.id ?? ui.game.players[0]?.id ?? null;
  ui.timedOutIds = [];
  ui.talentQueue = [];
  ui.talentEligibleIds = [];
  ui.talentIndex = 0;
  ui.talentReady = false;
  ui.talentTargetId = null;
  ui.talentPrivateResult = null;
  ui.afterlifeQueue = [];
  ui.afterlifeIndex = 0;
  ui.afterlifeReady = false;
  ui.afterlifeTargetId = null;
  ui.afterlifePrivateResult = null;
  ui.discussionPromises = [];
  ui.promiseDraft = {
    playerId: getActivePlayers(ui.game)[0]?.id ?? ui.game.players[0]?.id ?? null,
    promiseId: event.promiseOptions?.[0]?.id ?? null,
    targetId: '',
  };

  if ((event.discussionSeconds ?? 0) > 0) {
    setScreen('discussion');
    startCountdown(event.discussionSeconds, 'discussion', startChoicePhase);
    return;
  }
  startChoicePhase();
}

function startChoicePhase() {
  clearCountdown();
  const event = currentEvent();
  if (!event) return;
  if (ui.discussionPromises.length) {
    ui.game = registerPromises(ui.game, event.id, ui.discussionPromises);
    saveGame(ui.game);
  }

  ui.talentEligibleIds = getEligibleTalentPlayers(ui.game, event).map((player) => player.id);
  ui.talentQueue = ui.talentEligibleIds.length ? getActivePlayers(ui.game).map((player) => player.id) : [];
  ui.talentIndex = 0;
  ui.talentReady = false;
  ui.talentTargetId = null;
  ui.talentPrivateResult = null;
  ui.afterlifeQueue = getPendingAfterlifePlayers(ui.game, event).map((player) => player.id);
  ui.afterlifeIndex = 0;
  ui.afterlifeReady = false;
  ui.afterlifeTargetId = null;
  ui.afterlifePrivateResult = null;
  openNextIntervention();
}

function openNextIntervention() {
  if (ui.talentIndex < ui.talentQueue.length) {
    setScreen('talentPrompt');
    return;
  }
  if (ui.afterlifeIndex < ui.afterlifeQueue.length) {
    setScreen('afterlifePrompt');
    return;
  }
  enterMainChoicePhase();
}

function enterMainChoicePhase() {
  const event = currentEvent();
  if (!event) return;
  const activePlayers = getActivePlayers(ui.game);
  ui.actorId = activePlayers[0]?.id ?? ui.game.players[0]?.id ?? null;

  if (event.mode === 'group') {
    setScreen('groupChoice');
    startCountdown(event.decisionSeconds ?? 25, 'decision', submitGroupTimeout);
    return;
  }

  if (event.mode === 'privateOne') {
    const actorId = getEventActorId(ui.game, event);
    ui.privateOrder = actorId ? [actorId] : [];
  } else {
    ui.privateOrder = activePlayers.map((player) => player.id);
  }

  if (!ui.privateOrder.length) {
    const { game, result } = resolveEvent(ui.game, event.id, {}, { timeout: true, timedOutIds: [] });
    ui.game = game;
    ui.result = result;
    saveGame(ui.game);
    setScreen('result');
    return;
  }
  ui.privateTurnIndex = 0;
  setScreen('privateChoice');
}

function currentTalentPlayer() {
  const id = ui.talentQueue[ui.talentIndex];
  return ui.game.players.find((player) => player.id === id) ?? null;
}

function advanceTalentWindow() {
  ui.talentIndex += 1;
  ui.talentReady = false;
  ui.talentTargetId = null;
  ui.talentPrivateResult = null;
  openNextIntervention();
}

function skipCurrentTalent() {
  const player = currentTalentPlayer();
  const event = currentEvent();
  if (player && event && getEligibleTalentPlayers(ui.game, event).some((candidate) => candidate.id === player.id)) {
    ui.game = markTalentPrompted(ui.game, player.id, event.id);
    saveGame(ui.game);
  }
  advanceTalentWindow();
}

function useCurrentTalent() {
  const player = currentTalentPlayer();
  const event = currentEvent();
  if (!player || !event) return;
  try {
    const targetId = ui.talentTargetId ?? player.id;
    const { game, result } = useAbility(ui.game, player.id, targetId, event.id);
    ui.game = game;
    ui.talentPrivateResult = result;
    saveGame(ui.game);
    audioDirector.play('secret', 0.32);
    render();
  } catch (error) {
    alert(error.message);
  }
}

function currentAfterlifePlayer() {
  const id = ui.afterlifeQueue[ui.afterlifeIndex];
  return ui.game.players.find((player) => player.id === id) ?? null;
}

function advanceAfterlifeWindow() {
  ui.afterlifeIndex += 1;
  ui.afterlifeReady = false;
  ui.afterlifeTargetId = null;
  ui.afterlifePrivateResult = null;
  openNextIntervention();
}

function useAfterlifeAction(actionId) {
  const player = currentAfterlifePlayer();
  const event = currentEvent();
  if (!player || !event) return;
  try {
    const { game, result } = resolveAfterlifeAction(ui.game, player.id, actionId, ui.afterlifeTargetId, event.id);
    ui.game = game;
    ui.afterlifePrivateResult = result;
    saveGame(ui.game);
    audioDirector.play('secret', 0.28);
    render();
  } catch (error) {
    alert(error.message);
  }
}

function addDiscussionPromise() {
  const event = currentEvent();
  const option = event?.promiseOptions?.find((item) => item.id === ui.promiseDraft.promiseId);
  if (!event || !option || !ui.promiseDraft.playerId) return;
  const duplicate = ui.discussionPromises.some((promise) => promise.playerId === ui.promiseDraft.playerId && promise.promiseId === option.id);
  if (duplicate) return;
  ui.discussionPromises.push({
    eventId: event.id,
    playerId: ui.promiseDraft.playerId,
    targetId: ui.promiseDraft.targetId || null,
    promiseId: option.id,
    label: option.label,
    expectedChoiceIds: option.expectedChoiceIds,
  });
  render();
}

function currentPrivatePlayer() {
  const id = ui.privateOrder[ui.privateTurnIndex];
  return ui.game.players.find((player) => player.id === id) ?? ui.game.players[0];
}

function playResolutionAudio() {
  // Les scènes fortes possèdent déjà leur propre effet. Aucun jingle générique n’est ajouté.
}

function requestChoiceConfirmation(type, choice, targetId = null) {
  if (!choice) return;
  if (ui.timerRemaining != null && !ui.timerPaused) pauseCountdown();
  ui.confirmation = {
    type,
    choiceId: choice.id,
    label: choice.label,
    description: choice.description,
    targetId,
  };
  ui.confirmationReturnScreen = type === 'group' ? 'groupChoice' : 'privateChoice';
  setScreen('confirmChoice');
}

function cancelChoiceConfirmation() {
  const returnScreen = ui.confirmationReturnScreen ?? 'game';
  ui.confirmation = null;
  ui.confirmationReturnScreen = null;
  setScreen(returnScreen);
  if (ui.timerPaused) window.setTimeout(resumeCountdown, 0);
}

function confirmChoiceSubmission() {
  const confirmation = ui.confirmation;
  ui.confirmation = null;
  ui.confirmationReturnScreen = null;
  if (!confirmation) return;
  if (confirmation.type === 'group') submitGroupChoice(true);
  else submitPrivateChoice(confirmation.choiceId, confirmation.targetId);
}

function submitPrivateChoice(choiceId, selectedTargetId = null, timedOut = false) {
  clearCountdown();
  const player = currentPrivatePlayer();
  ui.draftChoices[player.id] = selectedTargetId ? { choiceId, targetId: selectedTargetId } : choiceId;
  if (timedOut && !ui.timedOutIds.includes(player.id)) ui.timedOutIds.push(player.id);
  ui.pendingChoice = null;
  ui.passReady = false;
  ui.pendingPrivateResolution = ui.privateTurnIndex >= ui.privateOrder.length - 1;
  setScreen('privateMask');
}

function continueAfterPrivateMask() {
  if (ui.pendingPrivateResolution) {
    clearSessionState();
    const { game, result } = resolveEvent(ui.game, currentEvent().id, ui.draftChoices, { timeout: ui.timedOutIds.length > 0, timedOutIds: ui.timedOutIds });
    ui.game = game;
    ui.result = result;
    ui.pendingPrivateResolution = false;
    playResolutionAudio(result);
    saveGame(ui.game);
    setScreen('result');
    return;
  }
  ui.privateTurnIndex += 1;
  ui.pendingPrivateResolution = false;
  ui.passReady = false;
  setScreen('privateChoice');
}

function submitPrivateTimeout() {
  const event = currentEvent();
  submitPrivateChoice(event?.timeoutChoice ?? 'inaction', null, true);
}

function submitGroupChoice(skipConfirmation = false) {
  if (!ui.selectedGroupChoice) return;
  const event = currentEvent();
  const selected = event.choices.find((choice) => choice.id === ui.selectedGroupChoice);
  if (selected?.requiresActor && !ui.actorId) return;
  if (!skipConfirmation && choiceNeedsConfirmation(selected)) {
    requestChoiceConfirmation('group', selected);
    return;
  }
  clearCountdown();
  clearSessionState();
  const { game, result } = resolveEvent(
    ui.game,
    event.id,
    { group: ui.selectedGroupChoice },
    { actorId: ui.actorId, volunteerId: ui.actorId },
  );
  ui.game = game;
  ui.result = result;
  playResolutionAudio(result);
  saveGame(ui.game);
  setScreen('result');
}

function submitGroupTimeout() {
  const event = currentEvent();
  if (!event) return;
  const fallback = event.timeoutChoice ?? getAvailableChoices(ui.game, event)[0]?.id;
  clearSessionState();
  const { game, result } = resolveEvent(
    ui.game,
    event.id,
    { group: fallback },
    { actorId: ui.actorId, volunteerId: ui.actorId, timeout: true },
  );
  ui.game = game;
  ui.result = result;
  saveGame(ui.game);
  setScreen('result');
}

function gaugeCard(icon, label, value, min = 0) {
  const normalized = clamp(value - min, 0, 5 - min);
  const percentage = (normalized / (5 - min)) * 100;
  return `
    <div class="gauge-card">
      <div class="gauge-label"><span>${icon}</span>${label}</div>
      <div class="gauge-value">${value}/5</div>
      <div class="gauge-track"><div class="gauge-fill" style="width:${percentage}%"></div></div>
    </div>
  `;
}

function renderHome() {
  const hasSave = Boolean(ui.game);
  app.innerHTML = `
    <main class="menu-shell">
      <header class="menu-brand">
        <div class="brand-mark">⌁</div>
        <div><p class="kicker">VOS CHOIX. VOTRE HISTOIRE.</p><strong>DERNIÈRE <span>ISSUE</span></strong></div>
        <button class="icon-button" data-action="settings" aria-label="Ouvrir les réglages">⚙</button>
      </header>

      <section class="collection-intro">
        <p class="kicker">COLLECTION D’AVENTURES</p>
        <h1>Jusqu’où irez-vous<br><span>pour survivre ?</span></h1>
        <p>Entrez dans des histoires où chaque décision transforme le groupe, révèle des secrets et ouvre une issue différente.</p>
      </section>

      ${hasSave ? `
        <section class="continue-card">
          <div class="continue-icon">▶</div>
          <div class="continue-copy">
            <small>PARTIE EN COURS · LE CRASH</small>
            <strong>${ui.game.complete ? escapeHtml(ui.game.ending?.title) : 'Reprendre votre aventure'}</strong>
            <span>${escapeHtml(progressLabel())} · Sauvegarde automatique</span>
          </div>
          <button class="button primary" data-action="resume">${ui.game.complete ? 'Voir la fin' : 'Reprendre'}</button>
        </section>
      ` : ''}

      <section class="library-section">
        <div class="library-heading">
          <div><p class="kicker">CHOISIR UNE AVENTURE</p><h2>Les histoires</h2></div>
          <span>3 aventures · 1 disponible</span>
        </div>

        <button class="adventure-card crash-card" data-action="open-crash">
          <span class="card-art" aria-hidden="true"><i class="visual-sun"></i><i class="visual-plane">✈</i><i class="visual-island"></i></span>
          <span class="card-body">
            <span class="adventure-meta"><i>AVENTURE 01</i><i>COMPLÈTE</i></span>
            <strong>LE <em>CRASH</em></strong>
            <span>Après l’impact, l’île ne sera pas votre seul danger.</span>
            <span class="card-stats">2–8 joueurs <b>·</b> chemins variables <b>·</b> 8 issues</span>
            <span class="discover-link">Découvrir l’aventure <b>›</b></span>
          </span>
        </button>

        <div class="future-grid" aria-label="Prochaines aventures">
          <article class="adventure-card future-card classified-card">
            <span class="future-art"><i class="classified-stamp">CONFIDENTIEL</i><i class="classified-folder">▰</i><i class="classified-lines"></i></span>
            <span class="future-body"><span class="future-topline"><small>AVENTURE 02</small><i>BIENTÔT</i></span><strong>DOSSIER <em>CLASSÉ</em></strong><span class="future-pitch">Un dossier interdit. Des versions incompatibles. Quelqu’un sait déjà pourquoi vous êtes là.</span><span class="future-tags"><i>2–8 joueurs</i><i>Enquête</i><i>Secrets</i></span><span class="locked-link">◈ En préparation</span></span>
          </article>
          <article class="adventure-card future-card signal-card">
            <span class="future-art"><i class="signal-orbit"></i><i class="signal-tower">⌁</i><i class="signal-noise"></i></span>
            <span class="future-body"><span class="future-topline"><small>AVENTURE 03</small><i>BIENTÔT</i></span><strong>SIGNAL <em>PERDU</em></strong><span class="future-pitch">Un dernier message tourne en boucle, mais il ne semble pas destiné à tout le monde.</span><span class="future-tags"><i>2–8 joueurs</i><i>Survie</i><i>Mystère</i></span><span class="locked-link">◈ En préparation</span></span>
          </article>
        </div>
      </section>

      <nav class="menu-grid" aria-label="Menu principal">
        <button class="menu-tile" data-action="rules"><span class="tile-icon">?</span><span><strong>Comment jouer</strong><small>Principe et conseils</small></span></button>
        <button class="menu-tile" data-action="settings"><span class="tile-icon">⚙</span><span><strong>Réglages</strong><small>Confort et accessibilité</small></span></button>
        <div class="menu-tile status-tile"><span class="tile-icon">⌁</span><span><strong>Hors ligne</strong><small>Un seul téléphone suffit</small></span></div>
      </nav>
      <footer class="menu-footer">DERNIÈRE ISSUE · VERSION 0.8.1</footer>
    </main>
  `;
}

function renderAdventure() {
  const hasSave = Boolean(ui.game);
  app.innerHTML = `
    <main class="adventure-page">
      <header class="adventure-topbar">
        <button class="icon-button" data-action="home" aria-label="Retour">←</button>
        <div><p class="kicker">DERNIÈRE ISSUE</p><strong>FICHE AVENTURE</strong></div>
        <button class="icon-button" data-action="settings">⚙</button>
      </header>
      <section class="adventure-hero">
        <div class="adventure-visual"><span class="visual-sun"></span><span class="visual-plane">✈</span><span class="visual-island"></span></div>
        <div class="adventure-content">
          <div class="adventure-meta"><span>AVENTURE 01</span><span>7 CHAPITRES</span></div>
          <h1>LE<br><span>CRASH</span></h1>
          <p>Votre avion s’écrase sur une île inconnue. Les ressources manquent, les blessures s’accumulent et chacun cache peut-être quelque chose.</p>
        </div>
      </section>
      <section class="adventure-details">
        <div class="detail-stats"><div><span>♟</span><strong>2–8</strong><small>joueurs</small></div><div><span>▤</span><strong>7</strong><small>chapitres</small></div><div><span>◷</span><strong>8</strong><small>issues principales</small></div></div>
        <div class="adventure-pitch"><p class="kicker">VOTRE MISSION</p><h2>Survivre. Ensemble… peut-être.</h2><p>Explorez l’île, gérez les vies et les ressources, prenez des décisions secrètes et découvrez ce que l’avion transportait réellement.</p><div class="choice-warning"><span>!</span><p><strong>La présence d’un traître n’est jamais annoncée.</strong><br>Les soupçons peuvent être justifiés… ou détruire un groupe innocent.</p></div></div>
        <div class="adventure-actions">
          ${hasSave ? `<button class="button primary resume-button" data-action="resume"><span><small>${escapeHtml(progressLabel())}</small>${ui.game.complete ? 'Voir votre issue' : 'Reprendre Le Crash'}</span><b>›</b></button><button class="button secondary" data-action="new-game">Nouvelle partie</button>` : '<button class="button primary" data-action="new-game">Commencer Le Crash</button>'}
        </div>
      </section>
    </main>
  `;
}

function settingRow(key, icon, title, description) {
  const enabled = ui.settings[key];
  return `<button class="setting-row" data-setting="${key}" role="switch" aria-checked="${enabled}"><span class="setting-icon">${icon}</span><span class="setting-copy"><strong>${title}</strong><small>${description}</small></span><span class="switch ${enabled ? 'on' : ''}"><i></i></span></button>`;
}

function volumeRow() {
  const value = Number(ui.settings.volume ?? 65);
  return `<label class="volume-row"><span class="setting-icon">◖</span><span class="setting-copy"><strong>Volume général</strong><small>Ambiance et effets sonores</small></span><span class="volume-control"><input type="range" min="0" max="100" step="5" value="${value}" data-volume aria-label="Volume général"><b data-volume-value>${value}%</b></span></label>`;
}

function renderSettings() {
  app.innerHTML = `
    <main class="shell settings-shell">
      <header class="topbar"><button class="icon-button" data-action="home">←</button><div><p class="kicker">MENU PRINCIPAL</p><h2>Réglages</h2></div></header>
      <section class="settings-group"><p class="settings-label">AUDIO</p>${settingRow('sound', '♪', 'Univers sonore', 'Active ou coupe tous les sons')}${settingRow('ambience', '≈', 'Ambiances de fond', 'Mer, jungle, feu, pluie, radio et station')}${settingRow('sfx', '✦', 'Effets sonores', 'Choix, révélations, conséquences et chronos')}${volumeRow()}<button class="settings-action audio-preview" data-action="audio-preview"><span>Tester l’ambiance actuelle</span><b>▶</b></button></section>
      <section class="settings-group"><p class="settings-label">JEU</p>${settingRow('vibrations', '⌁', 'Vibrations', 'Retour tactile pendant les choix')}${settingRow('timers', '⏳', 'Chronos narratifs', 'Décisions sous pression et conséquences en cas d’inaction')}${settingRow('confirmRestart', '↺', 'Confirmer avant de recommencer', 'Évite d’effacer une partie par erreur')}</section>
      <section class="settings-group"><p class="settings-label">ACCESSIBILITÉ</p>${settingRow('largeText', 'Aa', 'Texte agrandi', 'Améliore la lisibilité')}${settingRow('highContrast', '◐', 'Contraste renforcé', 'Éclaircit les textes et contours')}${settingRow('cinematicFx', '✺', 'Animations cinématiques', 'Décors vivants, secousses, pluie, glitch et transitions')}${settingRow('reducedMotion', '◌', 'Réduire les animations', 'Limite les mouvements')}</section>
      <section class="settings-group danger-zone"><p class="settings-label">DONNÉES</p>${ui.game ? '<button class="settings-action" data-action="export-report"><span>Exporter le rapport de partie</span><b>⇩</b></button><button class="settings-action danger-text" data-action="delete-save"><span>Supprimer la partie en cours</span><b>›</b></button>' : '<div class="settings-empty">Aucune partie sauvegardée.</div>'}<button class="settings-action" data-action="reset-settings"><span>Réinitialiser les réglages</span><b>›</b></button></section>
      <p class="settings-note">La partie reste enregistrée uniquement dans ce navigateur.</p>
    </main>`;
}

function renderRules() {
  app.innerHTML = `
    <main class="shell rules-shell">
      <header class="topbar"><button class="icon-button" data-action="home">←</button><div><p class="kicker">DERNIÈRE ISSUE</p><h2>Comment jouer</h2></div></header>
      <section class="rules-hero panel"><span>2–8</span><div><strong>Un téléphone suffit</strong><p>Faites circuler l’appareil lors des choix et briefings secrets.</p></div></section>
      <section class="rules-list">
        <article><b>01</b><div><h3>Recevez votre briefing secret</h3><p>Chaque joueur découvre un talent et parfois un objectif personnel. Le talent n’apparaît ensuite que dans les scènes où il peut intervenir.</p></div></article>
        <article><b>02</b><div><h3>Parlez avant de choisir</h3><p>Le chrono lance une vraie discussion orale : négociez, promettez, accusez ou mentez.</p></div></article>
        <article><b>03</b><div><h3>Décidez sous pression</h3><p>Si personne ne valide à temps, l’histoire applique une conséquence adaptée à la scène.</p></div></article>
        <article><b>04</b><div><h3>Continuez même à zéro vie</h3><p>Un joueur séparé obtient un parcours secret : il peut guider, saboter, protéger ou préparer son retour.</p></div></article><article><b>05</b><div><h3>Ouvrez votre propre chemin</h3><p>Le camp, l’expédition, le jugement et les systèmes choisis déclenchent des événements exclusifs.</p></div></article>
      </section>
      <div class="tip-card"><span>!</span><p><strong>Conseil</strong> Ne montrez jamais un écran privé. Vous pouvez dire la vérité, mentir ou ne rien révéler.</p></div>
      <button class="button primary" data-action="home">Choisir une aventure</button>
    </main>`;
}

function renderSetup() {
  const nameInputs = Array.from({ length: ui.setup.playerCount }, (_, index) => `<label class="field player-field"><span>Joueur ${index + 1}</span><input data-player-name="${index}" maxlength="18" value="${escapeHtml(ui.setup.names[index] ?? `Joueur ${index + 1}`)}"></label>`).join('');
  const durationCards = setupOptions.durations.map((option) => `<button class="select-card ${ui.setup.duration === option.id ? 'selected' : ''}" data-duration="${option.id}"><strong>${option.label}</strong><span>${option.detail}</span></button>`).join('');
  app.innerHTML = `
    <main class="shell">
      <header class="topbar"><button class="icon-button" data-action="open-crash">←</button><div><p class="kicker">NOUVELLE PARTIE</p><h2>Préparer l’équipage</h2></div></header>
      <section class="panel"><div class="section-heading"><div><p class="step">01</p><h3>Combien êtes-vous ?</h3></div><div class="counter"><button data-action="less-player">−</button><strong>${ui.setup.playerCount}</strong><button data-action="more-player">+</button></div></div><div class="player-grid">${nameInputs}</div></section>
      <section class="panel"><div class="section-heading"><div><p class="step">02</p><h3>Durée</h3></div></div><div class="select-grid">${durationCards}</div></section>
      <button class="button primary sticky-action" data-action="start-game">Distribuer les briefings</button>
    </main>`;
}

function renderBriefing() {
  const player = ui.game.players[ui.briefingIndex];
  if (!ui.briefingReady) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card"><div class="privacy-icon">🔐</div><p class="kicker">BRIEFING SECRET ${ui.briefingIndex + 1}/${ui.game.players.length}</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>Cette carte révèle un talent secret et peut contenir un objectif personnel.</p><button class="button primary" data-action="reveal-briefing">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }
  app.innerHTML = `
    <main class="shell private-shell">
      <section class="briefing-card">
        <p class="kicker">BRIEFING DE ${escapeHtml(player.name).toUpperCase()}</p>
        <div class="briefing-symbol">${player.ability.icon}</div>
        <h2>${escapeHtml(player.ability.title)}</h2><p>${escapeHtml(player.ability.description)}</p><div class="private-ability-note"><strong>Garde ce talent secret.</strong><span>L’application te proposera automatiquement de l’utiliser uniquement lorsqu’il peut réellement intervenir.</span></div>
        <div class="role-card ${player.role.id === 'saboteur' ? 'danger-role' : ''}"><small>OBJECTIF PERSONNEL</small><strong>${escapeHtml(player.role.title)}</strong><p>${escapeHtml(player.role.briefing)}</p></div>
        <p class="privacy-hint">Ne montre pas cet écran aux autres joueurs.</p>
        <button class="button primary" data-action="next-briefing">${ui.briefingIndex === ui.game.players.length - 1 ? 'Commencer l’aventure' : 'Masquer et passer au suivant'}</button>
      </section>
    </main>`;
}

function renderChapter() {
  const number = ui.game.chapterTransition ?? currentEvent()?.chapter ?? 1;
  const chapter = chapters[number];
  app.innerHTML = `
    <main class="shell chapter-intro-shell">
      <section class="chapter-intro-card">
        <p class="kicker">LE CRASH · CHAPITRE ${number}/7</p>
        <div class="chapter-intro-icon">${chapter.icon}</div>
        <h1>${escapeHtml(chapter.title)}</h1>
        ${renderParagraphs(getChapterNarrative(ui.game, number), 'chapter-narrative')}
        ${number > 1 ? `<div class="chapter-state"><span>🥫 ${ui.game.gauges.reserves}/5</span><span>⛺ ${ui.game.gauges.shelter}/5</span><span>📡 ${ui.game.gauges.signal}/5</span><span>⚠️ ${ui.game.gauges.danger}/5</span></div>` : ''}
        <button class="button primary" data-action="enter-chapter">Commencer le chapitre ${number}</button>
      </section>
    </main>`;
}

function playerCard(player) {
  const visibleStatuses = publicStatuses(player);
  const separated = player.afterlife?.active;
  const stateLabel = separated ? 'Séparé du groupe · agit encore en secret' : (visibleStatuses.length ? visibleStatuses.join(' · ') : 'En état de jouer');
  return `<article class="player-card ${separated ? 'separated-player' : ''}"><div class="player-avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div><div class="player-main"><strong>${escapeHtml(player.name)}</strong><div class="lives">${'❤️'.repeat(player.lives)}${'🖤'.repeat(3 - player.lives)}</div><small>${escapeHtml(stateLabel)}</small></div><div class="private-item-count"><span>🔒 ${player.inventory.length} objet${player.inventory.length > 1 ? 's' : ''}</span><small>contenu privé</small></div></article>`;
}
function renderGame() {
  const event = currentEvent();
  if (!event) return ui.game.complete ? renderEnding() : renderHome();
  const chapter = chapters[event.chapter];
  const hint = ui.game.flags.scoutHint ? '<div class="scout-hint">🧭 Un détail du terrain révèle que ce choix peut modifier une route disponible plus tard.</div>' : '';
  app.innerHTML = `
    <main class="shell game-shell">
      <header class="topbar compact"><button class="icon-button" data-action="home">⌂</button><div><p class="kicker">DERNIÈRE ISSUE · LE CRASH</p><h2>Chapitre ${event.chapter} · ${escapeHtml(chapter.title)}</h2></div><button class="icon-button danger-button" data-action="reset">↺</button></header>
      <section class="gauges">${gaugeCard('🥫', 'Réserves', ui.game.gauges.reserves)}${gaugeCard('⛺', 'Refuge', ui.game.gauges.shelter)}${gaugeCard('📡', 'Signal', ui.game.gauges.signal)}${gaugeCard('⚠️', 'Danger', ui.game.gauges.danger)}</section>
      <section class="story-card"><div class="event-number">ÉTAPE ${ui.game.eventIndex + 1}/${ui.game.eventSequence.length}${event.secondary ? ' · IMPRÉVU' : ''}${event.branch ? ' · CHEMIN EXCLUSIF' : ''}</div><p class="kicker">CHAPITRE ${event.chapter} · ${escapeHtml(chapter.title).toUpperCase()}</p><h2>${escapeHtml(event.title)}</h2>${renderParagraphs(getEventNarrative(ui.game, event), 'event-narrative')}${hint}<div class="oral-cue"><span>🗣️</span><p><strong>Cette scène se joue à voix haute.</strong><br>${event.discussionSeconds ? `Vous aurez ${event.discussionSeconds} secondes pour discuter avant les choix.` : 'Lisez la scène, puis passez le téléphone pour les décisions privées.'}</p></div><button class="button primary" data-action="begin-event">${event.discussionSeconds ? 'Lancer la discussion' : 'Faire les choix'}</button></section>
      <section class="group-bag"><div><p class="step">RESSOURCES COMMUNES</p><div class="inventory common-inventory">${ui.game.groupInventory.length ? ui.game.groupInventory.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Aucun objet commun</span>'}</div></div><div class="group-tools"><span class="context-talent-note">✦ Les talents secrets apparaissent au moment utile</span><button class="button secondary small-button" data-action="private-dossiers">🔒 Dossiers privés</button></div></section>
      <section><div class="section-heading"><div><p class="step">SURVIVANTS</p><h3>État du groupe</h3></div><span class="cohesion-pill ${cohesionLabel(ui.game.gauges.cohesion).tone}">🤝 ${cohesionLabel(ui.game.gauges.cohesion).label}</span></div><div class="players-stack">${ui.game.players.map(playerCard).join('')}</div></section>
    </main>`;
}


function renderDiscussion() {
  const event = currentEvent();
  const promises = ui.discussionPromises.map((promise, index) => {
    const player = ui.game.players.find((item) => item.id === promise.playerId);
    const target = ui.game.players.find((item) => item.id === promise.targetId);
    return `<li><span><strong>${escapeHtml(player?.name ?? 'Joueur')}</strong> : ${escapeHtml(promise.label)}${target ? ` à ${escapeHtml(target.name)}` : ''}</span><button data-remove-promise="${index}" aria-label="Retirer">×</button></li>`;
  }).join('');
  const promisePanel = event.promiseOptions?.length ? `
    <section class="promise-panel">
      <div class="section-heading"><div><p class="step">PROMESSES PUBLIQUES</p><h3>Vous pouvez vous engager à voix haute</h3></div></div>
      <p>Une promesse enregistrée sera comparée au choix secret. La briser affectera la confiance et apparaîtra dans le bilan.</p>
      <div class="promise-form">
        <label><span>Qui promet ?</span><select data-promise-player>${getActivePlayers(ui.game).map((player) => `<option value="${player.id}" ${ui.promiseDraft.playerId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}</select></label>
        <label><span>Promesse</span><select data-promise-type>${event.promiseOptions.map((option) => `<option value="${option.id}" ${ui.promiseDraft.promiseId === option.id ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
        <label><span>À propos de quelqu’un ? <small>facultatif</small></span><select data-promise-target><option value="">Tout le groupe</option>${getActivePlayers(ui.game).filter((player) => player.id !== ui.promiseDraft.playerId).map((player) => `<option value="${player.id}" ${ui.promiseDraft.targetId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}</select></label>
        <button class="button secondary" data-action="add-promise">Enregistrer la promesse</button>
      </div>
      ${promises ? `<ul class="promise-list">${promises}</ul>` : '<p class="empty-promises">Aucune promesse enregistrée. Les paroles restent libres.</p>'}
    </section>` : '';

  app.innerHTML = `<main class="shell discussion-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · DISCUSSION ORALE</p><h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(event.prompt)}</p></header>${countdownMarkup(event.discussionSeconds ?? 60, 'Temps de discussion')}
    <section class="discussion-card"><div class="discussion-icon">🗣️</div><h3>Parlez-vous réellement</h3><p>Défendez une option, négociez un objet, demandez une preuve, formez une alliance ou mentez. L’application n’écoute rien : c’est à vous de convaincre les autres.</p><div class="discussion-rules"><span>Vous pouvez mentir</span><span>Vous pouvez garder le silence</span><span>Vous pouvez changer d’avis</span></div></section>
    ${promisePanel}
    <button class="button primary sticky-action" data-action="start-choice-phase">Passer aux choix maintenant</button></main>`;
}

function renderPrivateChoice() {
  const event = currentEvent();
  const player = currentPrivatePlayer();
  if (!ui.passReady) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card"><div class="privacy-icon">🙈</div><p class="kicker">CHOIX SECRET ${ui.privateTurnIndex + 1}/${ui.privateOrder.length}</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>Les autres joueurs ne doivent pas voir son choix ni son inventaire personnel.</p><button class="button primary" data-action="ready-private">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }

  const available = getAvailableChoices(ui.game, event, player.id);
  if (ui.pendingChoice) {
    const pending = available.find((choice) => choice.id === ui.pendingChoice);
    const targets = getActivePlayers(ui.game).filter((target) => target.id !== player.id).map((target) => `<button class="target-card" data-target-player="${target.id}"><span class="player-avatar">${escapeHtml(target.name.slice(0, 1).toUpperCase())}</span><strong>${escapeHtml(target.name)}</strong><span>›</span></button>`).join('');
    app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHOIX DE ${escapeHtml(player.name).toUpperCase()}</p><h2>${escapeHtml(pending.targetLabel ?? 'Choisis une personne')}</h2><p>Cette sélection restera secrète jusqu’à sa découverte éventuelle.</p></header>${privateInventoryMarkup(player, true)}<div class="target-stack">${targets}</div><button class="button secondary" data-action="cancel-target">Retour aux choix</button></main>`;
    return;
  }

  const cards = available.map((choice) => `<button class="choice-card ${choiceNeedsConfirmation(choice) ? 'grave-choice' : ''}" data-choice="${choice.id}" data-needs-target="${choice.requiresTarget ? 'true' : 'false'}"><span class="choice-icon">${choice.icon}</span><span class="choice-copy"><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.description)}</small></span><span class="choice-arrow">›</span></button>`).join('');
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · CHOIX SECRET</p><h2>${escapeHtml(player.name)}, à toi.</h2><p>${escapeHtml(event.prompt)}</p></header>${countdownMarkup(event.decisionSeconds ?? 20, 'Temps pour choisir')}${privateInventoryMarkup(player, true)}<div class="choice-stack">${cards}</div><p class="privacy-hint">🔒 Ton choix sera masqué avant de rendre le téléphone. Les décisions graves demandent une confirmation.</p></main>`;
}

function renderPrivateMask() {
  const player = currentPrivatePlayer();
  app.innerHTML = `<main class="shell private-shell"><section class="privacy-card mask-card"><div class="privacy-icon">✓</div><p class="kicker">CHOIX ENREGISTRÉ</p><h2>${escapeHtml(player.name)}, masque maintenant l’écran.</h2><p>Pose le téléphone face cachée ou vérifie que personne ne peut lire avant de continuer.</p><button class="button primary" data-action="private-mask-continue">L’écran est masqué</button></section></main>`;
}

function renderGroupChoice() {
  const event = currentEvent();
  const available = getAvailableChoices(ui.game, event);
  if (!available.length) ui.selectedGroupChoice = 'stay';
  const cards = available.map((choice) => `<button class="choice-card ${ui.selectedGroupChoice === choice.id ? 'selected' : ''} ${choiceNeedsConfirmation(choice) ? 'grave-choice' : ''}" data-group-choice="${choice.id}"><span class="choice-icon">${choice.icon}</span><span class="choice-copy"><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.description)}</small></span><span class="choice-check">${ui.selectedGroupChoice === choice.id ? '✓' : ''}</span></button>`).join('');
  const selected = available.find((choice) => choice.id === ui.selectedGroupChoice);
  const actorSelect = selected?.requiresActor ? `<label class="field volunteer-field"><span>${escapeHtml(selected.actorLabel ?? 'Qui agit ?')}</span><select data-actor>${getActivePlayers(ui.game).map((player) => `<option value="${player.id}" ${ui.actorId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}</select></label>` : '';
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · DÉCISION DU GROUPE</p><h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(event.prompt)}</p></header>${countdownMarkup(event.decisionSeconds ?? 25, 'Temps pour valider')}<div class="choice-stack">${cards}</div>${actorSelect}<button class="button primary sticky-action" data-action="confirm-group" ${ui.selectedGroupChoice ? '' : 'disabled'}>Valider la décision</button></main>`;
}

function renderChoiceConfirmation() {
  const choice = ui.confirmation;
  if (!choice) return setScreen(ui.confirmationReturnScreen ?? 'game');
  const target = choice.targetId ? ui.game.players.find((player) => player.id === choice.targetId) : null;
  app.innerHTML = `<main class="shell private-shell"><section class="privacy-card confirmation-card"><div class="privacy-icon">!</div><p class="kicker">DÉCISION IRRÉVERSIBLE</p><h2>Confirmer « ${escapeHtml(choice.label)} » ?</h2><p>${escapeHtml(choice.description)}</p>${target ? `<div class="confirmation-target">Cette décision vise <strong>${escapeHtml(target.name)}</strong>.</div>` : ''}<div class="confirmation-warning">Elle peut retirer une vie, abandonner quelqu’un, détruire une ressource ou modifier définitivement votre chemin.</div><button class="button danger-solid" data-action="confirm-dangerous-choice">Oui, confirmer</button><button class="button secondary" data-action="cancel-dangerous-choice">Revenir au choix</button></section></main>`;
}

function renderResult() {
  const publicSummary = getPublicResultSummary(ui.result);
  const summary = publicSummary.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  const narrative = getPublicResultNarrative(ui.result);
  const cohesion = cohesionLabel(ui.game.gauges.cohesion);
  const nextText = ui.game.complete ? 'Découvrir votre issue' : ui.game.chapterTransition ? `Terminer le chapitre ${ui.result.chapter ?? ''}` : 'Continuer';
  app.innerHTML = `<main class="shell result-shell"><section class="result-card"><div class="result-icon">✦</div><p class="kicker">CONSÉQUENCES</p><h2>${escapeHtml(ui.result.title)}</h2>${renderParagraphs(narrative, 'result-narrative')}<div class="mechanical-impact"><strong>Ce que le groupe peut constater</strong><ul>${summary}</ul></div>${ui.result.timedOut ? '<div class="timeout-result"><strong>⏳ Le temps a expiré.</strong><p>L’inaction a déclenché une conséquence propre à cette scène.</p></div>' : ''}${ui.result.secret ? '<div class="secret-result"><strong>Tout n’est pas encore visible.</strong><p>Les actions privées ne sont révélées que lorsqu’un indice, une victime ou le bilan final les expose.</p></div>' : ''}<div class="mini-gauges"><span>🥫 ${ui.game.gauges.reserves}/5</span><span>⛺ ${ui.game.gauges.shelter}/5</span><span>📡 ${ui.game.gauges.signal}/5</span><span>⚠️ ${ui.game.gauges.danger}/5</span><span class="cohesion-${cohesion.tone}">🤝 ${escapeHtml(cohesion.label)}</span></div><button class="button primary" data-action="continue">${escapeHtml(nextText)}</button></section></main>`;
}

function renderDossierSelect() {
  const cards = ui.game.players.map((player) => `<button class="target-card dossier-target" data-dossier-player="${player.id}"><span class="player-avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</span><span><strong>${escapeHtml(player.name)}</strong><small>Consulter son inventaire, son talent et ses rappels secrets</small></span><b>›</b></button>`).join('');
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">DOSSIERS PRIVÉS</p><h2>Qui souhaite consulter son dossier ?</h2><p>Choisissez un prénom, puis passez le téléphone. Le contenu suivant est strictement privé.</p></header><div class="target-stack">${cards}</div><button class="button secondary" data-action="close-dossiers">Retour au jeu</button></main>`;
}

function renderPrivateDossier() {
  const player = ui.game.players.find((item) => item.id === ui.dossierPlayerId) ?? ui.game.players[0];
  if (!ui.dossierReady) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card"><div class="privacy-icon">🔒</div><p class="kicker">DOSSIER PERSONNEL</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>Les autres joueurs doivent détourner les yeux.</p><button class="button primary" data-action="dossier-ready">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }
  const afterlife = player.afterlife?.active ? `<div class="role-card"><small>PARCOURS SÉPARÉ</small><strong>${escapeHtml(player.afterlife.title)}</strong><p>${escapeHtml(player.afterlife.briefing)}</p></div>` : '';
  app.innerHTML = `<main class="shell private-shell"><section class="briefing-card dossier-card"><p class="kicker">DOSSIER DE ${escapeHtml(player.name).toUpperCase()}</p><div class="briefing-symbol">${player.ability.icon}</div><h2>${escapeHtml(player.ability.title)}</h2><p>${escapeHtml(player.ability.description)}</p><div class="role-card ${player.role.id === 'saboteur' ? 'danger-role' : ''}"><small>OBJECTIF PERSONNEL</small><strong>${escapeHtml(player.role.title)}</strong><p>${escapeHtml(player.role.briefing)}</p></div>${afterlife}${privateInventoryMarkup(player)}<button class="button primary" data-action="dossier-mask">Masquer mon dossier</button></section></main>`;
}

function renderTalentPrompt() {
  const player = currentTalentPlayer();
  const event = currentEvent();
  if (!player || !event) return openNextIntervention();
  if (!ui.talentReady) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card"><div class="privacy-icon">✦</div><p class="kicker">FENÊTRE DE TALENT SECRET</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>Chaque joueur vérifie ses options secrètes. Les autres doivent détourner les yeux.</p><button class="button primary" data-action="talent-ready">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }

  const isEligible = getEligibleTalentPlayers(ui.game, event).some((candidate) => candidate.id === player.id);
  if (!isEligible) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card private-power-card"><div class="privacy-icon">◇</div><p class="kicker">VÉRIFICATION SECRÈTE</p><h2>Aucune intervention ici</h2><p>Ton talent ne correspond pas à cette scène, ou il a déjà été utilisé. Garde cette information pour toi.</p><button class="button primary" data-action="talent-continue">Masquer et passer au suivant</button></section></main>`;
    return;
  }

  const activeTargets = getActivePlayers(ui.game);
  const preferredTarget = activeTargets.find((target) => target.lives < 3 || target.statuses.length) ?? activeTargets[0] ?? player;
  if (!ui.talentTargetId) ui.talentTargetId = preferredTarget?.id ?? player.id;
  const targetSelect = player.ability.target
    ? `<label class="field private-ability-target"><span>Cible du talent</span><select data-talent-target>${activeTargets.map((target) => `<option value="${target.id}" ${ui.talentTargetId === target.id ? 'selected' : ''}>${escapeHtml(target.name)}</option>`).join('')}</select></label>`
    : '';
  const confirmation = ui.talentPrivateResult
    ? `<div class="private-power-confirmation"><strong>Talent utilisé discrètement.</strong><p>${ui.talentPrivateResult.summary.map((line) => escapeHtml(line)).join('<br>')}</p><small>Les autres voient seulement les conséquences que l’histoire rend visibles.</small></div><button class="button primary" data-action="talent-continue">Masquer et continuer</button>`
    : `<div class="context-window"><small>POURQUOI MAINTENANT ?</small><p>Cette scène correspond réellement à ton talent. Tu peux l’utiliser maintenant ou le conserver pour une autre occasion.</p></div>${targetSelect}<button class="button primary" data-action="talent-use">Utiliser mon talent</button><button class="button secondary" data-action="talent-skip">Le conserver</button>`;
  app.innerHTML = `<main class="shell private-shell"><section class="privacy-card private-power-card"><div class="privacy-icon">${player.ability.icon}</div><p class="kicker">TALENT SECRET · ${escapeHtml(event.title).toUpperCase()}</p><h2>${escapeHtml(player.ability.title)}</h2><p>${escapeHtml(player.ability.description)}</p>${confirmation}</section></main>`;
}

function renderAfterlifePrompt() {
  const player = currentAfterlifePlayer();
  const event = currentEvent();
  if (!player?.afterlife?.active || !event) return advanceAfterlifeWindow();
  if (!ui.afterlifeReady) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card afterlife-card"><div class="privacy-icon">${player.afterlife.icon}</div><p class="kicker">PARCOURS SÉPARÉ</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>À zéro vie, la partie ne s’arrête pas. Cette personne agit désormais loin du groupe.</p><button class="button primary" data-action="afterlife-ready">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }

  if (ui.afterlifePrivateResult) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card afterlife-card"><div class="privacy-icon">${player.afterlife.icon}</div><p class="kicker">ACTION EFFECTUÉE DANS L’OMBRE</p><h2>${escapeHtml(player.afterlife.title)}</h2><div class="private-power-confirmation"><p>${ui.afterlifePrivateResult.summary.map((line) => escapeHtml(line)).join('<br>')}</p><small>Ton intervention ne sera pas attribuée publiquement.</small></div><button class="button primary" data-action="afterlife-continue">Masquer et continuer</button></section></main>`;
    return;
  }

  const choices = getAfterlifeChoices(ui.game, player.id, event);
  const targetChoices = getActivePlayers(ui.game).filter((target) => target.id !== player.id);
  if (!ui.afterlifeTargetId) ui.afterlifeTargetId = targetChoices[0]?.id ?? null;
  const needsTarget = choices.some((choice) => choice.requiresTarget);
  const targetSelect = needsTarget && targetChoices.length
    ? `<label class="field private-ability-target"><span>Cible possible</span><select data-afterlife-target>${targetChoices.map((target) => `<option value="${target.id}" ${ui.afterlifeTargetId === target.id ? 'selected' : ''}>${escapeHtml(target.name)}</option>`).join('')}</select></label>`
    : '';
  const cards = choices.map((choice) => `<button class="choice-card afterlife-choice" data-afterlife-action="${choice.id}"><span class="choice-icon">${choice.icon}</span><span class="choice-copy"><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.description)}</small></span><span class="choice-arrow">›</span></button>`).join('');
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">ACTION SECRÈTE · CHAPITRE ${event.chapter}</p><h2>${escapeHtml(player.afterlife.title)}</h2><p>${escapeHtml(player.afterlife.briefing)}</p><div class="return-progress"><span>Retour vers le groupe</span><b>${Math.min(2, player.afterlife.returnProgress ?? 0)}/2</b></div></header>${targetSelect}<div class="choice-stack">${cards}</div></main>`;
}


function renderEnding() {
  const ending = ui.game.ending;
  const escaped = ending.escapedIds.map((id) => ui.game.players.find((player) => player.id === id)?.name).filter(Boolean);
  const stayed = ui.game.players.filter((player) => !ending.escapedIds.includes(player.id)).map((player) => player.name);
  const epilogue = getEndingNarrative(ui.game);
  const echoes = getStoryEchoes(ui.game);
  const roleReveal = ui.game.players.map((player) => `<article class="reveal-player"><div class="player-avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(player.role.title)} · ${escapeHtml(player.ability.title)}${player.afterlife ? ` · ${escapeHtml(player.afterlife.title)}` : ''}</span><small>${player.lives} vie${player.lives > 1 ? 's' : ''} restante${player.lives > 1 ? 's' : ''}</small></div></article>`).join('');
  const betrayalReveal = (ui.game.betrayalLog ?? []).map((item) => {
    const actor = ui.game.players.find((player) => player.id === item.actorId)?.name ?? 'Une personne';
    const victim = ui.game.players.find((player) => player.id === item.targetId)?.name;
    return `<li><strong>${escapeHtml(actor)}</strong> : ${escapeHtml(item.label)}${victim ? ` contre <strong>${escapeHtml(victim)}</strong>` : ''}</li>`;
  }).join('');
  const brokenPromises = (ui.game.flags.promises ?? []).filter((promise) => promise.resolved && !promise.honored).map((promise) => {
    const player = ui.game.players.find((item) => item.id === promise.playerId)?.name ?? 'Une personne';
    return `<li><strong>${escapeHtml(player)}</strong> avait promis : « ${escapeHtml(promise.label)} ».</li>`;
  }).join('');
  app.innerHTML = `
    <main class="shell ending-shell">
      <section class="ending-hero"><p class="kicker">VOTRE DERNIÈRE ISSUE</p><div class="ending-icon">${ending.icon}</div><h1>${escapeHtml(ending.title)}</h1>${renderParagraphs(epilogue, 'ending-epilogue')}</section>
      <section class="ending-panel"><p class="step">BILAN DE L’ÉVACUATION</p><div class="ending-lists"><div><strong>Ont quitté l’île</strong><p>${escaped.length ? escapeHtml(escaped.join(', ')) : 'Personne'}</p></div><div><strong>Sont restés</strong><p>${stayed.length ? escapeHtml(stayed.join(', ')) : 'Personne'}</p></div></div><div class="final-gauges">${gaugeCard('🥫', 'Réserves', ui.game.gauges.reserves)}${gaugeCard('📡', 'Signal', ui.game.gauges.signal)}${gaugeCard('⚠️', 'Danger', ui.game.gauges.danger)}</div></section>
      ${echoes.length ? `<section class="memory-panel"><p class="step">LES CHOIX QUI VOUS ONT SUIVIS</p><ul>${echoes.map((echo) => `<li>${escapeHtml(echo)}</li>`).join('')}</ul></section>` : ''}
      ${(betrayalReveal || brokenPromises) ? `<section class="betrayal-panel"><p class="step">PROMESSES ET TRAHISONS RÉVÉLÉES</p>${brokenPromises ? `<h3>Promesses brisées</h3><ul>${brokenPromises}</ul>` : ''}${betrayalReveal ? `<h3>Actions contre les autres</h3><ul>${betrayalReveal}</ul>` : ''}</section>` : ''}
      <section class="truth-panel"><p class="step">CE QUI S’EST RÉELLEMENT PASSÉ</p><h2>${escapeHtml(ui.game.plot.id === 'accident' ? 'Il n’y avait aucun traître.' : ui.game.plot.id === 'saboteur' ? 'Un saboteur se trouvait parmi vous.' : 'Une personne avait un objectif caché.')}</h2><p>${escapeHtml(ending.truth)}</p></section>
      <section><div class="section-heading"><div><p class="step">RÉVÉLATION</p><h3>Rôles, talents et parcours séparés</h3></div></div><div class="reveal-list">${roleReveal}</div></section>
      <section class="ending-actions"><button class="button primary" data-action="replay">Rejouer avec le même groupe</button><button class="button secondary" data-action="export-report">Exporter le rapport complet</button><button class="button secondary" data-action="finish-home">Retour aux aventures</button></section>
    </main>`;
}

function renderAudioControl() {
  const enabled = ui.settings.sound;
  const label = enabled ? audioDirector.getThemeLabel() : 'Sons coupés';
  app.insertAdjacentHTML('beforeend', `<button class="audio-fab ${enabled ? 'active' : 'muted'}" data-action="toggle-sound" aria-label="${enabled ? 'Couper les sons' : 'Activer les sons'}" title="${escapeHtml(label)}"><span>${enabled ? '♪' : '×'}</span><small>${escapeHtml(label)}</small></button>`);
}

function render() {
  applySettings();
  if (ui.screen === 'home') renderHome();
  if (ui.screen === 'adventure') renderAdventure();
  if (ui.screen === 'settings') renderSettings();
  if (ui.screen === 'rules') renderRules();
  if (ui.screen === 'setup') renderSetup();
  if (ui.screen === 'briefing') renderBriefing();
  if (ui.screen === 'chapter') renderChapter();
  if (ui.screen === 'game') renderGame();
  if (ui.screen === 'discussion') renderDiscussion();
  if (ui.screen === 'privateChoice') renderPrivateChoice();
  if (ui.screen === 'privateMask') renderPrivateMask();
  if (ui.screen === 'groupChoice') renderGroupChoice();
  if (ui.screen === 'confirmChoice') renderChoiceConfirmation();
  if (ui.screen === 'dossierSelect') renderDossierSelect();
  if (ui.screen === 'privateDossier') renderPrivateDossier();
  if (ui.screen === 'result') renderResult();
  if (ui.screen === 'talentPrompt') renderTalentPrompt();
  if (ui.screen === 'afterlifePrompt') renderAfterlifePrompt();
  if (ui.screen === 'ending') renderEnding();
  applyVisualTheme();
  audioDirector.sync({ screen: ui.screen, game: ui.game, event: currentEvent(), settings: ui.settings });
  audioDirector.cueScene({ screen: ui.screen, game: ui.game, event: currentEvent(), result: ui.result });
  persistUiSession();
  renderAudioControl();
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  const action = target.dataset.action;
  audioDirector.unlock();
  if (['new-game', 'open-crash', 'settings', 'rules', 'home', 'finish-home', 'replay', 'reset', 'delete-save'].includes(action)) clearCountdown();

  if (action === 'toggle-sound') {
    toggleSetting('sound');
    return;
  }
  if (action === 'audio-preview') {
    audioDirector.unlock().then((ready) => {
      if (ready) {
        audioDirector.sync({ screen: ui.screen, game: ui.game, event: currentEvent(), settings: ui.settings });
        audioDirector.play('reveal', 0.9);
      }
    });
  }

  if (action === 'new-game') setScreen('setup');
  if (action === 'open-crash') setScreen('adventure');
  if (action === 'settings') setScreen('settings');
  if (action === 'rules') setScreen('rules');
  if (action === 'resume') resumeGame();
  if (action === 'home') setScreen('home');
  if (action === 'less-player') {
    ui.setup.playerCount = clamp(ui.setup.playerCount - 1, 2, 8);
    ui.setup.names = ui.setup.names.slice(0, ui.setup.playerCount);
    render();
  }
  if (action === 'more-player') {
    ui.setup.playerCount = clamp(ui.setup.playerCount + 1, 2, 8);
    while (ui.setup.names.length < ui.setup.playerCount) ui.setup.names.push(`Joueur ${ui.setup.names.length + 1}`);
    render();
  }
  if (action === 'start-game') { audioDirector.play('reveal', 0.8); startNewGame(); }
  if (action === 'reveal-briefing') {
    audioDirector.play('reveal', 0.85);
    ui.briefingReady = true;
    render();
  }
  if (action === 'next-briefing') {
    ui.briefingReady = false;
    if (ui.briefingIndex >= ui.game.players.length - 1) {
      ui.game.briefingComplete = true;
      saveGame(ui.game);
      audioDirector.play('chapter', 0.9);
      setScreen('chapter');
    } else {
      ui.briefingIndex += 1;
      render();
    }
  }
  if (action === 'enter-chapter') { audioDirector.play('chapter', 0.9); enterChapter(); }
  if (action === 'begin-event') beginEvent();
  if (action === 'ready-private') {
    audioDirector.play('reveal', 0.5);
    ui.passReady = true;
    const shouldResume = ui.timerPaused && ui.timerRemaining != null;
    render();
    if (shouldResume) resumeCountdown();
    else startCountdown(currentEvent()?.decisionSeconds ?? 20, 'private-decision', submitPrivateTimeout);
  }
  if (action === 'private-mask-continue') continueAfterPrivateMask();
  if (action === 'pause-timer') pauseCountdown();
  if (action === 'resume-timer') resumeCountdown();
  if (action === 'confirm-dangerous-choice') confirmChoiceSubmission();
  if (action === 'cancel-dangerous-choice') cancelChoiceConfirmation();
  if (action === 'private-dossiers') { ui.dossierReturnScreen = ui.screen; ui.dossierReady = false; setScreen('dossierSelect'); }
  if (action === 'close-dossiers') setScreen(ui.dossierReturnScreen ?? 'game');
  if (action === 'dossier-ready') { ui.dossierReady = true; render(); }
  if (action === 'dossier-mask') { ui.dossierReady = false; setScreen('dossierSelect'); }
  if (action === 'export-report') exportGameReport();
  if (action === 'start-choice-phase') startChoicePhase();
  if (action === 'add-promise') addDiscussionPromise();
  if (action === 'cancel-target') {
    ui.pendingChoice = null;
    render();
  }
  if (action === 'confirm-group') submitGroupChoice();
  if (action === 'continue') {
    if (ui.game.complete) { audioDirector.play('ending', 1); setScreen('ending'); }
    else if (ui.game.chapterTransition) setScreen('chapter');
    else setScreen('game');
  }
  if (action === 'talent-ready') { ui.talentReady = true; render(); }
  if (action === 'talent-use') useCurrentTalent();
  if (action === 'talent-skip') skipCurrentTalent();
  if (action === 'talent-continue') advanceTalentWindow();
  if (action === 'afterlife-ready') { ui.afterlifeReady = true; render(); }
  if (action === 'afterlife-continue') advanceAfterlifeWindow();
  if (action === 'back-game') setScreen('game');
  if (action === 'replay') replaySameGame();
  if (action === 'finish-home') setScreen('home');
  if (action === 'reset' && (!ui.settings.confirmRestart || confirm('Recommencer cette partie depuis le début ?'))) resetRun();
  if (action === 'delete-save' && confirm('Supprimer définitivement la partie en cours ?')) {
    clearGame(); clearSessionState(); ui.game = null; render();
  }
  if (action === 'reset-settings' && confirm('Réinitialiser tous les réglages ?')) {
    ui.settings = resetSettings(); applySettings(); render();
  }

  if (target.dataset.setting) toggleSetting(target.dataset.setting);
  if (target.dataset.duration) { ui.setup.duration = target.dataset.duration; render(); }

  if (target.dataset.removePromise !== undefined) {
    ui.discussionPromises.splice(Number(target.dataset.removePromise), 1);
    render();
  }

  if (target.dataset.dossierPlayer) { ui.dossierPlayerId = target.dataset.dossierPlayer; ui.dossierReady = false; setScreen('privateDossier'); }

  if (target.dataset.choice) {
    audioDirector.play('select', 0.42);
    const choice = getAvailableChoices(ui.game, currentEvent(), currentPrivatePlayer().id).find((item) => item.id === target.dataset.choice);
    if (choice?.requiresTarget) {
      ui.pendingChoice = choice.id;
      render();
    } else if (choiceNeedsConfirmation(choice)) requestChoiceConfirmation('private', choice);
    else submitPrivateChoice(target.dataset.choice);
  }
  if (target.dataset.targetPlayer) {
    audioDirector.play('select', 0.42);
    const choice = getAvailableChoices(ui.game, currentEvent(), currentPrivatePlayer().id).find((item) => item.id === ui.pendingChoice);
    if (choiceNeedsConfirmation(choice)) requestChoiceConfirmation('private', choice, target.dataset.targetPlayer);
    else submitPrivateChoice(ui.pendingChoice, target.dataset.targetPlayer);
  }
  if (target.dataset.afterlifeAction) useAfterlifeAction(target.dataset.afterlifeAction);
  if (target.dataset.groupChoice) {
    audioDirector.play('select', 0.42);
    ui.selectedGroupChoice = target.dataset.groupChoice;
    const selected = currentEvent().choices.find((choice) => choice.id === ui.selectedGroupChoice);
    if (selected?.requiresActor && !ui.actorId) ui.actorId = ui.game.players[0]?.id;
    render();
  }
});

app.addEventListener('input', (event) => {
  const index = event.target.dataset.playerName;
  if (index !== undefined) ui.setup.names[Number(index)] = event.target.value;
  if (event.target.matches('[data-volume]')) {
    ui.settings.volume = Number(event.target.value);
    saveSettings(ui.settings);
    audioDirector.configure(ui.settings);
    const label = document.querySelector('[data-volume-value]');
    if (label) label.textContent = `${ui.settings.volume}%`;
  }
});

app.addEventListener('change', (event) => {
  if (event.target.matches('[data-actor]')) ui.actorId = event.target.value;
  if (event.target.matches('[data-talent-target]')) ui.talentTargetId = event.target.value;
  if (event.target.matches('[data-afterlife-target]')) ui.afterlifeTargetId = event.target.value;
  if (event.target.matches('[data-promise-player]')) {
    ui.promiseDraft.playerId = event.target.value;
    if (ui.promiseDraft.targetId === event.target.value) ui.promiseDraft.targetId = '';
    render();
  }
  if (event.target.matches('[data-promise-type]')) ui.promiseDraft.promiseId = event.target.value;
  if (event.target.matches('[data-promise-target]')) ui.promiseDraft.targetId = event.target.value;
});


restoreUiSessionIfPossible();
if (window.history?.replaceState) window.history.replaceState({ derniereIssue: true, screen: ui.screen }, '');
window.addEventListener?.('popstate', () => {
  clearCountdown();
  if (ui.screen === 'home') {
    window.history?.pushState?.({ derniereIssue: true, screen: 'home' }, '');
    render();
    return;
  }
  const safeScreen = ui.game ? (ui.game.complete ? 'ending' : 'game') : 'home';
  setScreen(safeScreen, { replaceHistory: true });
});

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}

render();
