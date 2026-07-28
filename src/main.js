import { audioDirector } from './audio.js';
import { chapters, events, getEventById, setupOptions } from './gameData.js';
import { getChapterNarrative, getEndingNarrative, getEventNarrative, getResultNarrative, getStoryEchoes } from './narrative.js';
import {
  createInitialGame,
  getAvailableChoices,
  getCurrentEvent,
  getEventActorId,
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
} from './storage.js';

const app = document.querySelector('#app');
const upgradedSave = upgradeSavedGame(loadGame());
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
  abilityResult: null,
  abilityTargets: {},
  discussionPromises: [],
  promiseDraft: { playerId: null, promiseId: null, targetId: '' },
  timedOutIds: [],
  timerHandle: null,
  timerDeadline: null,
  timerRemaining: null,
  timerPhase: null,
  lastTimerSoundSecond: null,
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

function setScreen(screen) {
  ui.screen = screen;
  window.scrollTo({ top: 0, behavior: ui.settings.reducedMotion ? 'auto' : 'smooth' });
  render();
}

function applySettings() {
  document.documentElement.classList.toggle('reduced-motion', ui.settings.reducedMotion);
  document.documentElement.classList.toggle('large-text', ui.settings.largeText);
  document.documentElement.classList.toggle('high-contrast', ui.settings.highContrast);
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
  ui.lastTimerSoundSecond = null;
  document.documentElement.classList.toggle('countdown-critical', false);
}

function updateCountdownDom() {
  const value = document.querySelector('[data-countdown-value]');
  const fill = document.querySelector('[data-countdown-fill]');
  if (value) value.textContent = ui.timerRemaining == null ? '∞' : String(ui.timerRemaining);
  if (fill) {
    const total = Number(fill.dataset.total ?? 1);
    const percent = ui.timerRemaining == null ? 100 : Math.max(0, Math.min(100, (ui.timerRemaining / total) * 100));
    fill.style.width = `${percent}%`;
  }
  document.documentElement.classList.toggle('countdown-critical', ui.timerRemaining != null && ui.timerRemaining <= 5);
}

function startCountdown(seconds, phase, onExpire) {
  clearCountdown();
  if (!ui.settings.timers || !seconds) {
    ui.timerRemaining = null;
    updateCountdownDom();
    return;
  }
  ui.timerPhase = phase;
  ui.timerDeadline = Date.now() + (seconds * 1000);
  const tick = () => {
    ui.timerRemaining = Math.max(0, Math.ceil((ui.timerDeadline - Date.now()) / 1000));
    updateCountdownDom();
    if (ui.timerRemaining > 0 && ui.timerRemaining <= 5 && ui.lastTimerSoundSecond !== ui.timerRemaining) {
      ui.lastTimerSoundSecond = ui.timerRemaining;
      audioDirector.play('tick', 6 - ui.timerRemaining);
    }
    if (ui.timerRemaining <= 0) {
      clearCountdown();
      if (ui.settings.vibrations && navigator.vibrate) navigator.vibrate([120, 70, 120]);
      audioDirector.play('timeout', 1);
      onExpire();
    }
  };
  tick();
  ui.timerHandle = window.setInterval(tick, 250);
}

function countdownMarkup(seconds, label) {
  if (!ui.settings.timers) return `<div class="countdown disabled"><span>⏳</span><div><strong>${escapeHtml(label)}</strong><small>Chrono désactivé dans les réglages</small></div></div>`;
  const remaining = ui.timerRemaining ?? seconds;
  return `<div class="countdown"><span>⏳</span><div class="countdown-copy"><strong>${escapeHtml(label)}</strong><small>Sans décision, la situation choisira à votre place.</small><div class="countdown-track"><i data-countdown-fill data-total="${seconds}" style="width:${Math.max(0, Math.min(100, (remaining / seconds) * 100))}%"></i></div></div><b data-countdown-value>${remaining}</b></div>`;
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
  ui.setup.audience = ui.game.settings.audience;
  startNewGame();
}

function resetRun() {
  clearGame();
  ui.game = null;
  ui.result = null;
  setScreen('home');
}

function enterChapter() {
  if (!ui.game) return;
  ui.game.chapterTransition = null;
  saveGame(ui.game);
  setScreen('game');
}

function beginEvent() {
  const event = currentEvent();
  if (!event) return;
  clearCountdown();
  ui.result = null;
  ui.draftChoices = {};
  ui.privateTurnIndex = 0;
  ui.passReady = false;
  ui.pendingChoice = null;
  ui.selectedGroupChoice = null;
  ui.actorId = ui.game.players[0]?.id ?? null;
  ui.timedOutIds = [];
  ui.discussionPromises = [];
  ui.promiseDraft = {
    playerId: ui.game.players[0]?.id ?? null,
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

  if (event.mode === 'group') {
    setScreen('groupChoice');
    startCountdown(event.decisionSeconds ?? 25, 'decision', submitGroupTimeout);
    return;
  }

  if (event.mode === 'privateOne') ui.privateOrder = [getEventActorId(ui.game, event)];
  else ui.privateOrder = ui.game.players.map((player) => player.id);
  setScreen('privateChoice');
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

function playResolutionAudio(result) {
  if (!result || result.timedOut) return;
  audioDirector.play(result.secret ? 'secret' : 'result', result.secret ? 0.8 : 1);
}

function submitPrivateChoice(choiceId, selectedTargetId = null, timedOut = false) {
  clearCountdown();
  const player = currentPrivatePlayer();
  ui.draftChoices[player.id] = selectedTargetId ? { choiceId, targetId: selectedTargetId } : choiceId;
  if (timedOut && !ui.timedOutIds.includes(player.id)) ui.timedOutIds.push(player.id);
  ui.pendingChoice = null;
  ui.passReady = false;

  if (ui.privateTurnIndex >= ui.privateOrder.length - 1) {
    const { game, result } = resolveEvent(ui.game, currentEvent().id, ui.draftChoices, { timeout: ui.timedOutIds.length > 0, timedOutIds: ui.timedOutIds });
    ui.game = game;
    ui.result = result;
    playResolutionAudio(result);
    saveGame(ui.game);
    setScreen('result');
    return;
  }

  ui.privateTurnIndex += 1;
  render();
}

function submitPrivateTimeout() {
  const event = currentEvent();
  submitPrivateChoice(event?.timeoutChoice ?? 'inaction', null, true);
}

function submitGroupChoice() {
  if (!ui.selectedGroupChoice) return;
  clearCountdown();
  const event = currentEvent();
  const selected = event.choices.find((choice) => choice.id === ui.selectedGroupChoice);
  if (selected?.requiresActor && !ui.actorId) return;

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

function usePlayerAbility(playerId) {
  try {
    const targetId = ui.abilityTargets[playerId] ?? playerId;
    const { game, result } = useAbility(ui.game, playerId, targetId);
    ui.game = game;
    ui.abilityResult = result;
    saveGame(ui.game);
    render();
  } catch (error) {
    alert(error.message);
  }
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
      <footer class="menu-footer">DERNIÈRE ISSUE · VERSION 0.6</footer>
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
      <section class="settings-group"><p class="settings-label">ACCESSIBILITÉ</p>${settingRow('largeText', 'Aa', 'Texte agrandi', 'Améliore la lisibilité')}${settingRow('highContrast', '◐', 'Contraste renforcé', 'Éclaircit les textes et contours')}${settingRow('reducedMotion', '◌', 'Réduire les animations', 'Limite les mouvements')}</section>
      <section class="settings-group danger-zone"><p class="settings-label">DONNÉES</p>${ui.game ? '<button class="settings-action danger-text" data-action="delete-save"><span>Supprimer la partie en cours</span><b>›</b></button>' : '<div class="settings-empty">Aucune partie sauvegardée.</div>'}<button class="settings-action" data-action="reset-settings"><span>Réinitialiser les réglages</span><b>›</b></button></section>
      <p class="settings-note">La partie reste enregistrée uniquement dans ce navigateur.</p>
    </main>`;
}

function renderRules() {
  app.innerHTML = `
    <main class="shell rules-shell">
      <header class="topbar"><button class="icon-button" data-action="home">←</button><div><p class="kicker">DERNIÈRE ISSUE</p><h2>Comment jouer</h2></div></header>
      <section class="rules-hero panel"><span>2–8</span><div><strong>Un téléphone suffit</strong><p>Faites circuler l’appareil lors des choix et briefings secrets.</p></div></section>
      <section class="rules-list">
        <article><b>01</b><div><h3>Recevez votre briefing</h3><p>Chaque joueur découvre une capacité et parfois un objectif personnel.</p></div></article>
        <article><b>02</b><div><h3>Parlez avant de choisir</h3><p>Le chrono lance une vraie discussion orale : négociez, promettez, accusez ou mentez.</p></div></article>
        <article><b>03</b><div><h3>Décidez sous pression</h3><p>Si personne ne valide à temps, l’histoire applique une conséquence adaptée à la scène.</p></div></article>
        <article><b>04</b><div><h3>Ouvrez votre propre chemin</h3><p>Le camp, l’expédition, le jugement et les systèmes choisis déclenchent des événements exclusifs.</p></div></article>
      </section>
      <div class="tip-card"><span>!</span><p><strong>Conseil</strong> Ne montrez jamais un écran privé. Vous pouvez dire la vérité, mentir ou ne rien révéler.</p></div>
      <button class="button primary" data-action="home">Choisir une aventure</button>
    </main>`;
}

function renderSetup() {
  const nameInputs = Array.from({ length: ui.setup.playerCount }, (_, index) => `<label class="field player-field"><span>Joueur ${index + 1}</span><input data-player-name="${index}" maxlength="18" value="${escapeHtml(ui.setup.names[index] ?? `Joueur ${index + 1}`)}"></label>`).join('');
  const durationCards = setupOptions.durations.map((option) => `<button class="select-card ${ui.setup.duration === option.id ? 'selected' : ''}" data-duration="${option.id}"><strong>${option.label}</strong><span>${option.detail}</span></button>`).join('');
  const audienceCards = setupOptions.audiences.map((option) => `<button class="select-card ${ui.setup.audience === option.id ? 'selected' : ''}" data-audience="${option.id}"><strong>${option.label}</strong><span>${option.detail}</span></button>`).join('');
  app.innerHTML = `
    <main class="shell">
      <header class="topbar"><button class="icon-button" data-action="open-crash">←</button><div><p class="kicker">NOUVELLE PARTIE</p><h2>Préparer l’équipage</h2></div></header>
      <section class="panel"><div class="section-heading"><div><p class="step">01</p><h3>Combien êtes-vous ?</h3></div><div class="counter"><button data-action="less-player">−</button><strong>${ui.setup.playerCount}</strong><button data-action="more-player">+</button></div></div><div class="player-grid">${nameInputs}</div></section>
      <section class="panel"><div class="section-heading"><div><p class="step">02</p><h3>Durée</h3></div></div><div class="select-grid">${durationCards}</div></section>
      <section class="panel"><div class="section-heading"><div><p class="step">03</p><h3>Public</h3></div></div><div class="select-grid">${audienceCards}</div></section>
      <button class="button primary sticky-action" data-action="start-game">Distribuer les briefings</button>
    </main>`;
}

function renderBriefing() {
  const player = ui.game.players[ui.briefingIndex];
  if (!ui.briefingReady) {
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card"><div class="privacy-icon">🔐</div><p class="kicker">BRIEFING SECRET ${ui.briefingIndex + 1}/${ui.game.players.length}</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>Cette carte révèle une capacité et peut contenir un objectif secret.</p><button class="button primary" data-action="reveal-briefing">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }
  app.innerHTML = `
    <main class="shell private-shell">
      <section class="briefing-card">
        <p class="kicker">BRIEFING DE ${escapeHtml(player.name).toUpperCase()}</p>
        <div class="briefing-symbol">${player.ability.icon}</div>
        <h2>${escapeHtml(player.ability.title)}</h2><p>${escapeHtml(player.ability.description)}</p>
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
  return `<article class="player-card"><div class="player-avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div><div class="player-main"><strong>${escapeHtml(player.name)}</strong><div class="lives">${'❤️'.repeat(player.lives)}${'🖤'.repeat(3 - player.lives)}</div><small>${player.statuses.length ? escapeHtml(player.statuses.join(' · ')) : 'En état de jouer'}</small></div><div class="inventory">${player.inventory.length ? player.inventory.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Inventaire vide</span>'}</div></article>`;
}

function renderGame() {
  const event = currentEvent();
  if (!event) return ui.game.complete ? renderEnding() : renderHome();
  const chapter = chapters[event.chapter];
  const hint = ui.game.flags.scoutHint ? '<div class="scout-hint">🧭 L’Éclaireur pressent que ce choix peut modifier une route disponible plus tard.</div>' : '';
  app.innerHTML = `
    <main class="shell game-shell">
      <header class="topbar compact"><button class="icon-button" data-action="home">⌂</button><div><p class="kicker">DERNIÈRE ISSUE · LE CRASH</p><h2>Chapitre ${event.chapter} · ${escapeHtml(chapter.title)}</h2></div><button class="icon-button danger-button" data-action="reset">↺</button></header>
      <section class="gauges">${gaugeCard('🥫', 'Réserves', ui.game.gauges.reserves)}${gaugeCard('⛺', 'Refuge', ui.game.gauges.shelter)}${gaugeCard('📡', 'Signal', ui.game.gauges.signal)}${gaugeCard('⚠️', 'Danger', ui.game.gauges.danger)}</section>
      <section class="story-card"><div class="event-number">ÉTAPE ${ui.game.eventIndex + 1}/${ui.game.eventSequence.length}${event.secondary ? ' · IMPRÉVU' : ''}${event.branch ? ' · CHEMIN EXCLUSIF' : ''}</div><p class="kicker">CHAPITRE ${event.chapter} · ${escapeHtml(chapter.title).toUpperCase()}</p><h2>${escapeHtml(event.title)}</h2>${renderParagraphs(getEventNarrative(ui.game, event), 'event-narrative')}${hint}<div class="oral-cue"><span>🗣️</span><p><strong>Cette scène se joue à voix haute.</strong><br>${event.discussionSeconds ? `Vous aurez ${event.discussionSeconds} secondes pour discuter avant les choix.` : 'Lisez la scène, puis passez le téléphone pour les décisions privées.'}</p></div><button class="button primary" data-action="begin-event">${event.discussionSeconds ? 'Lancer la discussion' : 'Faire les choix'}</button></section>
      <section class="group-bag"><div><p class="step">RESSOURCES COMMUNES</p><div class="inventory common-inventory">${ui.game.groupInventory.length ? ui.game.groupInventory.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Aucun objet commun</span>'}</div></div><button class="button secondary small-button" data-action="abilities">Capacités</button></section>
      <section><div class="section-heading"><div><p class="step">SURVIVANTS</p><h3>État du groupe</h3></div><span class="cohesion-pill">🤝 Cohésion ${ui.game.gauges.cohesion}</span></div><div class="players-stack">${ui.game.players.map(playerCard).join('')}</div></section>
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
        <label><span>Qui promet ?</span><select data-promise-player>${ui.game.players.map((player) => `<option value="${player.id}" ${ui.promiseDraft.playerId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}</select></label>
        <label><span>Promesse</span><select data-promise-type>${event.promiseOptions.map((option) => `<option value="${option.id}" ${ui.promiseDraft.promiseId === option.id ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
        <label><span>À propos de quelqu’un ? <small>facultatif</small></span><select data-promise-target><option value="">Tout le groupe</option>${ui.game.players.filter((player) => player.id !== ui.promiseDraft.playerId).map((player) => `<option value="${player.id}" ${ui.promiseDraft.targetId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}</select></label>
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
    app.innerHTML = `<main class="shell private-shell"><section class="privacy-card"><div class="privacy-icon">🙈</div><p class="kicker">CHOIX SECRET ${ui.privateTurnIndex + 1}/${ui.privateOrder.length}</p><h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2><p>Les autres joueurs ne doivent pas voir son choix.</p><button class="button primary" data-action="ready-private">Je suis ${escapeHtml(player.name)}</button></section></main>`;
    return;
  }

  const available = getAvailableChoices(ui.game, event, player.id);
  if (ui.pendingChoice) {
    const pending = available.find((choice) => choice.id === ui.pendingChoice);
    const targets = ui.game.players.filter((target) => target.id !== player.id).map((target) => `<button class="target-card" data-target-player="${target.id}"><span class="player-avatar">${escapeHtml(target.name.slice(0, 1).toUpperCase())}</span><strong>${escapeHtml(target.name)}</strong><span>›</span></button>`).join('');
    app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHOIX DE ${escapeHtml(player.name).toUpperCase()}</p><h2>${escapeHtml(pending.targetLabel ?? 'Choisis une personne')}</h2><p>Cette sélection restera secrète jusqu’à la résolution.</p></header><div class="target-stack">${targets}</div><button class="button secondary" data-action="cancel-target">Retour aux choix</button></main>`;
    return;
  }

  const cards = available.map((choice) => `<button class="choice-card" data-choice="${choice.id}" data-needs-target="${choice.requiresTarget ? 'true' : 'false'}"><span class="choice-icon">${choice.icon}</span><span class="choice-copy"><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.description)}</small></span><span class="choice-arrow">›</span></button>`).join('');
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · CHOIX SECRET</p><h2>${escapeHtml(player.name)}, à toi.</h2><p>${escapeHtml(event.prompt)}</p></header>${countdownMarkup(event.decisionSeconds ?? 20, 'Temps pour choisir')}<div class="choice-stack">${cards}</div><p class="privacy-hint">🔒 Ton choix sera caché pendant la résolution. À zéro, l’inaction aura une conséquence.</p></main>`;
}

function renderGroupChoice() {
  const event = currentEvent();
  const available = getAvailableChoices(ui.game, event);
  if (!available.length) {
    ui.selectedGroupChoice = 'stay';
  }
  const cards = available.map((choice) => `<button class="choice-card ${ui.selectedGroupChoice === choice.id ? 'selected' : ''}" data-group-choice="${choice.id}"><span class="choice-icon">${choice.icon}</span><span class="choice-copy"><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.description)}</small></span><span class="choice-check">${ui.selectedGroupChoice === choice.id ? '✓' : ''}</span></button>`).join('');
  const selected = available.find((choice) => choice.id === ui.selectedGroupChoice);
  const actorSelect = selected?.requiresActor ? `<label class="field volunteer-field"><span>${escapeHtml(selected.actorLabel ?? 'Qui agit ?')}</span><select data-actor>${ui.game.players.map((player) => `<option value="${player.id}" ${ui.actorId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}</select></label>` : '';
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · DÉCISION DU GROUPE</p><h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(event.prompt)}</p></header>${countdownMarkup(event.decisionSeconds ?? 25, 'Temps pour valider')}<div class="choice-stack">${cards}</div>${actorSelect}<button class="button primary sticky-action" data-action="confirm-group" ${ui.selectedGroupChoice ? '' : 'disabled'}>Valider la décision</button></main>`;
}

function renderResult() {
  const summary = ui.result.summary.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  const narrative = getResultNarrative(ui.game, ui.result);
  const nextText = ui.game.complete ? 'Découvrir votre issue' : ui.game.chapterTransition ? `Terminer le chapitre ${ui.result.chapter ?? ''}` : 'Continuer';
  app.innerHTML = `<main class="shell result-shell"><section class="result-card"><div class="result-icon">✦</div><p class="kicker">CONSÉQUENCES</p><h2>${escapeHtml(ui.result.title)}</h2>${renderParagraphs(narrative, 'result-narrative')}<div class="mechanical-impact"><strong>Ce que cela change</strong><ul>${summary}</ul></div>${ui.result.timedOut ? '<div class="timeout-result"><strong>⏳ Le temps a expiré.</strong><p>L’inaction a déclenché une conséquence propre à cette scène.</p></div>' : ''}${ui.result.secret ? '<div class="secret-result"><strong>Une partie de cette conséquence reste secrète.</strong><p>La vérité pourra apparaître plus tard dans l’aventure ou dans le bilan final.</p></div>' : ''}<div class="mini-gauges"><span>🥫 ${ui.game.gauges.reserves}/5</span><span>⛺ ${ui.game.gauges.shelter}/5</span><span>📡 ${ui.game.gauges.signal}/5</span><span>⚠️ ${ui.game.gauges.danger}/5</span><span>🤝 ${ui.game.gauges.cohesion}</span></div><button class="button primary" data-action="continue">${escapeHtml(nextText)}</button></section></main>`;
}

function renderAbilities() {
  const notice = ui.abilityResult ? `<div class="ability-notice"><strong>${escapeHtml(ui.abilityResult.title)}</strong>${ui.abilityResult.summary.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>` : '';
  const cards = ui.game.players.map((player) => {
    const targetSelect = player.ability.target && !player.ability.used ? `<select data-ability-target="${player.id}">${ui.game.players.map((target) => `<option value="${target.id}" ${(ui.abilityTargets[player.id] ?? player.id) === target.id ? 'selected' : ''}>${escapeHtml(target.name)}</option>`).join('')}</select>` : '';
    return `<article class="ability-card ${player.ability.used ? 'used' : ''}"><div class="ability-icon">${player.ability.icon}</div><div><small>${escapeHtml(player.name)}</small><h3>${escapeHtml(player.ability.title)}</h3><p>${escapeHtml(player.ability.description)}</p>${targetSelect}</div><button class="button ${player.ability.used ? 'secondary' : 'primary'}" data-use-ability="${player.id}" ${player.ability.used ? 'disabled' : ''}>${player.ability.used ? 'Déjà utilisée' : 'Utiliser maintenant'}</button></article>`;
  }).join('');
  app.innerHTML = `<main class="shell abilities-shell"><header class="topbar"><button class="icon-button" data-action="back-game">←</button><div><p class="kicker">LE CRASH</p><h2>Capacités du groupe</h2></div></header>${notice}<p class="abilities-help">Chaque capacité ne peut être utilisée qu’une seule fois. Son utilisation est publique.</p><div class="abilities-list">${cards}</div></main>`;
}

function renderEnding() {
  const ending = ui.game.ending;
  const escaped = ending.escapedIds.map((id) => ui.game.players.find((player) => player.id === id)?.name).filter(Boolean);
  const stayed = ui.game.players.filter((player) => !ending.escapedIds.includes(player.id)).map((player) => player.name);
  const epilogue = getEndingNarrative(ui.game);
  const echoes = getStoryEchoes(ui.game);
  const roleReveal = ui.game.players.map((player) => `<article class="reveal-player"><div class="player-avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(player.role.title)} · ${escapeHtml(player.ability.title)}</span><small>${player.lives} vie${player.lives > 1 ? 's' : ''} restante${player.lives > 1 ? 's' : ''}</small></div></article>`).join('');
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
      <section><div class="section-heading"><div><p class="step">RÉVÉLATION</p><h3>Rôles et capacités</h3></div></div><div class="reveal-list">${roleReveal}</div></section>
      <section class="ending-actions"><button class="button primary" data-action="replay">Rejouer avec le même groupe</button><button class="button secondary" data-action="finish-home">Retour aux aventures</button></section>
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
  if (ui.screen === 'groupChoice') renderGroupChoice();
  if (ui.screen === 'result') renderResult();
  if (ui.screen === 'abilities') renderAbilities();
  if (ui.screen === 'ending') renderEnding();
  audioDirector.sync({ screen: ui.screen, game: ui.game, event: currentEvent(), settings: ui.settings });
  renderAudioControl();
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  const action = target.dataset.action;
  audioDirector.unlock().then((ready) => {
    if (ready && action !== 'audio-preview' && action !== 'toggle-sound') audioDirector.play('click', 0.55);
  });
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
    render();
    startCountdown(currentEvent()?.decisionSeconds ?? 20, 'private-decision', submitPrivateTimeout);
  }
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
  if (action === 'abilities') {
    ui.abilityResult = null;
    setScreen('abilities');
  }
  if (action === 'back-game') setScreen('game');
  if (action === 'replay') replaySameGame();
  if (action === 'finish-home') setScreen('home');
  if (action === 'reset' && (!ui.settings.confirmRestart || confirm('Recommencer cette partie depuis le début ?'))) resetRun();
  if (action === 'delete-save' && confirm('Supprimer définitivement la partie en cours ?')) {
    clearGame(); ui.game = null; render();
  }
  if (action === 'reset-settings' && confirm('Réinitialiser tous les réglages ?')) {
    ui.settings = resetSettings(); applySettings(); render();
  }

  if (target.dataset.setting) toggleSetting(target.dataset.setting);
  if (target.dataset.duration) { ui.setup.duration = target.dataset.duration; render(); }
  if (target.dataset.audience) { ui.setup.audience = target.dataset.audience; render(); }

  if (target.dataset.removePromise !== undefined) {
    ui.discussionPromises.splice(Number(target.dataset.removePromise), 1);
    render();
  }

  if (target.dataset.choice) {
    audioDirector.play('select', 0.75);
    const choice = getAvailableChoices(ui.game, currentEvent(), currentPrivatePlayer().id).find((item) => item.id === target.dataset.choice);
    if (choice?.requiresTarget) {
      ui.pendingChoice = choice.id;
      render();
    } else submitPrivateChoice(target.dataset.choice);
  }
  if (target.dataset.targetPlayer) { audioDirector.play('select', 0.75); submitPrivateChoice(ui.pendingChoice, target.dataset.targetPlayer); }
  if (target.dataset.groupChoice) {
    audioDirector.play('select', 0.75);
    ui.selectedGroupChoice = target.dataset.groupChoice;
    const selected = currentEvent().choices.find((choice) => choice.id === ui.selectedGroupChoice);
    if (selected?.requiresActor && !ui.actorId) ui.actorId = ui.game.players[0]?.id;
    render();
  }
  if (target.dataset.useAbility) usePlayerAbility(target.dataset.useAbility);
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
  if (event.target.dataset.abilityTarget) ui.abilityTargets[event.target.dataset.abilityTarget] = event.target.value;
  if (event.target.matches('[data-promise-player]')) {
    ui.promiseDraft.playerId = event.target.value;
    if (ui.promiseDraft.targetId === event.target.value) ui.promiseDraft.targetId = '';
    render();
  }
  if (event.target.matches('[data-promise-type]')) ui.promiseDraft.promiseId = event.target.value;
  if (event.target.matches('[data-promise-target]')) ui.promiseDraft.targetId = event.target.value;
});

render();
