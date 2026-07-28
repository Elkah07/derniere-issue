import { chapters, events, getEventById, setupOptions } from './gameData.js';
import { getChapterNarrative, getEndingNarrative, getEventNarrative, getResultNarrative, getStoryEchoes } from './narrative.js';
import {
  createInitialGame,
  getAvailableChoices,
  getCurrentEvent,
  getEventActorId,
  resolveEvent,
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
}

function toggleSetting(key) {
  ui.settings[key] = !ui.settings[key];
  saveSettings(ui.settings);
  applySettings();
  if (key === 'vibrations' && ui.settings.vibrations && navigator.vibrate) navigator.vibrate(35);
  render();
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
  ui.result = null;
  ui.draftChoices = {};
  ui.privateTurnIndex = 0;
  ui.passReady = false;
  ui.pendingChoice = null;
  ui.selectedGroupChoice = null;
  ui.actorId = ui.game.players[0]?.id ?? null;

  if (event.mode === 'group') {
    setScreen('groupChoice');
    return;
  }

  if (event.mode === 'privateOne') {
    ui.privateOrder = [getEventActorId(ui.game, event)];
  } else {
    ui.privateOrder = ui.game.players.map((player) => player.id);
  }
  setScreen('privateChoice');
}

function currentPrivatePlayer() {
  const id = ui.privateOrder[ui.privateTurnIndex];
  return ui.game.players.find((player) => player.id === id) ?? ui.game.players[0];
}

function submitPrivateChoice(choiceId, selectedTargetId = null) {
  const player = currentPrivatePlayer();
  ui.draftChoices[player.id] = selectedTargetId ? { choiceId, targetId: selectedTargetId } : choiceId;
  ui.pendingChoice = null;
  ui.passReady = false;

  if (ui.privateTurnIndex >= ui.privateOrder.length - 1) {
    const { game, result } = resolveEvent(ui.game, currentEvent().id, ui.draftChoices);
    ui.game = game;
    ui.result = result;
    saveGame(ui.game);
    setScreen('result');
    return;
  }

  ui.privateTurnIndex += 1;
  render();
}

function submitGroupChoice() {
  if (!ui.selectedGroupChoice) return;
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
            <span class="card-stats">2–8 joueurs <b>·</b> 7 chapitres <b>·</b> 8 issues</span>
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
      <footer class="menu-footer">DERNIÈRE ISSUE · VERSION 0.3.0</footer>
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

function renderSettings() {
  app.innerHTML = `
    <main class="shell settings-shell">
      <header class="topbar"><button class="icon-button" data-action="home">←</button><div><p class="kicker">MENU PRINCIPAL</p><h2>Réglages</h2></div></header>
      <section class="settings-group"><p class="settings-label">JEU</p>${settingRow('sound', '♪', 'Sons du jeu', 'Effets sonores et ambiance')}${settingRow('vibrations', '⌁', 'Vibrations', 'Retour tactile pendant les choix')}${settingRow('confirmRestart', '↺', 'Confirmer avant de recommencer', 'Évite d’effacer une partie par erreur')}</section>
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
        <article><b>02</b><div><h3>Choisissez sans tout montrer</h3><p>Les décisions publiques et secrètes modifient l’histoire, les vies et les ressources.</p></div></article>
        <article><b>03</b><div><h3>Atteignez une issue</h3><p>Les sept chapitres mènent à huit fins principales et à un bilan complet.</p></div></article>
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
      <section class="story-card"><div class="event-number">ÉTAPE ${ui.game.eventIndex + 1}/${ui.game.eventSequence.length}${event.secondary ? ' · IMPRÉVU' : ''}</div><p class="kicker">CHAPITRE ${event.chapter} · ${escapeHtml(chapter.title).toUpperCase()}</p><h2>${escapeHtml(event.title)}</h2>${renderParagraphs(getEventNarrative(ui.game, event), 'event-narrative')}${hint}<button class="button primary" data-action="begin-event">Faire les choix</button></section>
      <section class="group-bag"><div><p class="step">RESSOURCES COMMUNES</p><div class="inventory common-inventory">${ui.game.groupInventory.length ? ui.game.groupInventory.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Aucun objet commun</span>'}</div></div><button class="button secondary small-button" data-action="abilities">Capacités</button></section>
      <section><div class="section-heading"><div><p class="step">SURVIVANTS</p><h3>État du groupe</h3></div><span class="cohesion-pill">🤝 Cohésion ${ui.game.gauges.cohesion}</span></div><div class="players-stack">${ui.game.players.map(playerCard).join('')}</div></section>
    </main>`;
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
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · CHOIX SECRET</p><h2>${escapeHtml(player.name)}, à toi.</h2><p>${escapeHtml(event.prompt)}</p></header><div class="choice-stack">${cards}</div><p class="privacy-hint">🔒 Ton choix sera caché pendant la résolution.</p></main>`;
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
  app.innerHTML = `<main class="shell private-shell"><header class="choice-header"><p class="kicker">CHAPITRE ${event.chapter} · DÉCISION DU GROUPE</p><h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(event.prompt)}</p></header><div class="choice-stack">${cards}</div>${actorSelect}<button class="button primary sticky-action" data-action="confirm-group" ${ui.selectedGroupChoice ? '' : 'disabled'}>Valider la décision</button></main>`;
}

function renderResult() {
  const summary = ui.result.summary.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  const narrative = getResultNarrative(ui.game, ui.result);
  const nextText = ui.game.complete ? 'Découvrir votre issue' : ui.game.chapterTransition ? `Terminer le chapitre ${ui.result.chapter ?? ''}` : 'Continuer';
  app.innerHTML = `<main class="shell result-shell"><section class="result-card"><div class="result-icon">✦</div><p class="kicker">CONSÉQUENCES</p><h2>${escapeHtml(ui.result.title)}</h2>${renderParagraphs(narrative, 'result-narrative')}<div class="mechanical-impact"><strong>Ce que cela change</strong><ul>${summary}</ul></div>${ui.result.secret ? '<div class="secret-result"><strong>Une partie de cette conséquence reste secrète.</strong><p>La vérité pourra apparaître plus tard dans l’aventure ou dans le bilan final.</p></div>' : ''}<div class="mini-gauges"><span>🥫 ${ui.game.gauges.reserves}/5</span><span>⛺ ${ui.game.gauges.shelter}/5</span><span>📡 ${ui.game.gauges.signal}/5</span><span>⚠️ ${ui.game.gauges.danger}/5</span><span>🤝 ${ui.game.gauges.cohesion}</span></div><button class="button primary" data-action="continue">${escapeHtml(nextText)}</button></section></main>`;
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
  app.innerHTML = `
    <main class="shell ending-shell">
      <section class="ending-hero"><p class="kicker">VOTRE DERNIÈRE ISSUE</p><div class="ending-icon">${ending.icon}</div><h1>${escapeHtml(ending.title)}</h1>${renderParagraphs(epilogue, 'ending-epilogue')}</section>
      <section class="ending-panel"><p class="step">BILAN DE L’ÉVACUATION</p><div class="ending-lists"><div><strong>Ont quitté l’île</strong><p>${escaped.length ? escapeHtml(escaped.join(', ')) : 'Personne'}</p></div><div><strong>Sont restés</strong><p>${stayed.length ? escapeHtml(stayed.join(', ')) : 'Personne'}</p></div></div><div class="final-gauges">${gaugeCard('🥫', 'Réserves', ui.game.gauges.reserves)}${gaugeCard('📡', 'Signal', ui.game.gauges.signal)}${gaugeCard('⚠️', 'Danger', ui.game.gauges.danger)}</div></section>
      ${echoes.length ? `<section class="memory-panel"><p class="step">LES CHOIX QUI VOUS ONT SUIVIS</p><ul>${echoes.map((echo) => `<li>${escapeHtml(echo)}</li>`).join('')}</ul></section>` : ''}
      <section class="truth-panel"><p class="step">CE QUI S’EST RÉELLEMENT PASSÉ</p><h2>${escapeHtml(ui.game.plot.id === 'accident' ? 'Il n’y avait aucun traître.' : ui.game.plot.id === 'saboteur' ? 'Un saboteur se trouvait parmi vous.' : 'Une personne avait un objectif caché.')}</h2><p>${escapeHtml(ending.truth)}</p></section>
      <section><div class="section-heading"><div><p class="step">RÉVÉLATION</p><h3>Rôles et capacités</h3></div></div><div class="reveal-list">${roleReveal}</div></section>
      <section class="ending-actions"><button class="button primary" data-action="replay">Rejouer avec le même groupe</button><button class="button secondary" data-action="finish-home">Retour aux aventures</button></section>
    </main>`;
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
  if (ui.screen === 'privateChoice') renderPrivateChoice();
  if (ui.screen === 'groupChoice') renderGroupChoice();
  if (ui.screen === 'result') renderResult();
  if (ui.screen === 'abilities') renderAbilities();
  if (ui.screen === 'ending') renderEnding();
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  const action = target.dataset.action;

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
  if (action === 'start-game') startNewGame();
  if (action === 'reveal-briefing') {
    ui.briefingReady = true;
    render();
  }
  if (action === 'next-briefing') {
    ui.briefingReady = false;
    if (ui.briefingIndex >= ui.game.players.length - 1) {
      ui.game.briefingComplete = true;
      saveGame(ui.game);
      setScreen('chapter');
    } else {
      ui.briefingIndex += 1;
      render();
    }
  }
  if (action === 'enter-chapter') enterChapter();
  if (action === 'begin-event') beginEvent();
  if (action === 'ready-private') {
    ui.passReady = true;
    render();
  }
  if (action === 'cancel-target') {
    ui.pendingChoice = null;
    render();
  }
  if (action === 'confirm-group') submitGroupChoice();
  if (action === 'continue') {
    if (ui.game.complete) setScreen('ending');
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

  if (target.dataset.choice) {
    const choice = getAvailableChoices(ui.game, currentEvent(), currentPrivatePlayer().id).find((item) => item.id === target.dataset.choice);
    if (choice?.requiresTarget) {
      ui.pendingChoice = choice.id;
      render();
    } else submitPrivateChoice(target.dataset.choice);
  }
  if (target.dataset.targetPlayer) submitPrivateChoice(ui.pendingChoice, target.dataset.targetPlayer);
  if (target.dataset.groupChoice) {
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
});

app.addEventListener('change', (event) => {
  if (event.target.matches('[data-actor]')) ui.actorId = event.target.value;
  if (event.target.dataset.abilityTarget) ui.abilityTargets[event.target.dataset.abilityTarget] = event.target.value;
});

render();
