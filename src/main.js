import { events, setupOptions } from './gameData.js';
import { createInitialGame, resolveEvent } from './gameEngine.js';
import {
  clearGame,
  loadGame,
  loadSettings,
  resetSettings,
  saveGame,
  saveSettings,
} from './storage.js';

const app = document.querySelector('#app');

let ui = {
  screen: 'home',
  game: loadGame(),
  setup: {
    playerCount: 2,
    names: ['Joueur 1', 'Joueur 2'],
    duration: 'normal',
    audience: 'all',
  },
  privatePlayerIndex: 0,
  passReady: false,
  draftChoices: {},
  result: null,
  selectedGroupChoice: null,
  volunteerId: null,
  settings: loadSettings(),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
  return ui.game ? events[ui.game.eventIndex] : null;
}

function startNewGame() {
  const names = ui.setup.names.slice(0, ui.setup.playerCount);
  try {
    ui.game = createInitialGame({
      names,
      duration: ui.setup.duration,
      audience: ui.setup.audience,
    });
    saveGame(ui.game);
    ui.privatePlayerIndex = 0;
    ui.passReady = false;
    ui.draftChoices = {};
    ui.result = null;
    setScreen('game');
  } catch (error) {
    alert(error.message);
  }
}

function resetRun() {
  clearGame();
  ui.game = null;
  ui.result = null;
  ui.draftChoices = {};
  ui.privatePlayerIndex = 0;
  ui.passReady = false;
  setScreen('home');
}

function beginEvent() {
  const event = currentEvent();
  ui.result = null;
  ui.draftChoices = {};
  ui.privatePlayerIndex = 0;
  ui.passReady = false;
  ui.selectedGroupChoice = null;
  ui.volunteerId = ui.game.players[0]?.id ?? null;
  setScreen(event.mode === 'privateEach' ? 'privateChoice' : 'groupChoice');
}

function submitPrivateChoice(choiceId) {
  const player = ui.game.players[ui.privatePlayerIndex];
  ui.draftChoices[player.id] = choiceId;
  ui.passReady = false;

  if (ui.privatePlayerIndex >= ui.game.players.length - 1) {
    const { game, result } = resolveEvent(ui.game, currentEvent().id, ui.draftChoices);
    ui.game = game;
    ui.result = result;
    saveGame(ui.game);
    setScreen('result');
    return;
  }

  ui.privatePlayerIndex += 1;
  render();
}

function submitGroupChoice() {
  if (!ui.selectedGroupChoice) return;
  if (ui.selectedGroupChoice === 'solo' && !ui.volunteerId) return;

  const { game, result } = resolveEvent(
    ui.game,
    currentEvent().id,
    { group: ui.selectedGroupChoice },
    { volunteerId: ui.volunteerId },
  );
  ui.game = game;
  ui.result = result;
  saveGame(ui.game);
  setScreen('result');
}

function gaugeCard(icon, label, value, min = 0) {
  const normalized = clamp(value - min, 0, 5 - min);
  const percentage = ((normalized) / (5 - min)) * 100;
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
  const progress = hasSave
    ? `${ui.game.chapterComplete ? 3 : Math.min((ui.game.eventIndex ?? 0) + 1, 3)}/3 événements`
    : 'Aucune partie en cours';
  app.innerHTML = `
    <main class="menu-shell">
      <header class="menu-brand">
        <div class="brand-mark">✈</div>
        <div><p class="kicker">AVENTURES NARRATIVES</p><strong>DERNIÈRE <span>ISSUE</span></strong></div>
        <button class="icon-button" data-action="settings" aria-label="Ouvrir les réglages">⚙</button>
      </header>

      <section class="featured-adventure">
        <div class="adventure-visual" aria-hidden="true">
          <span class="visual-sun"></span><span class="visual-plane">✈</span>
          <span class="visual-island"></span>
        </div>
        <div class="adventure-content">
          <div class="adventure-meta"><span>AVENTURE 01</span><span>2–8 JOUEURS</span></div>
          <h1>LE<br><span>CRASH</span></h1>
          <p>Votre avion s’écrase sur une île inconnue. Chaque décision peut sauver le groupe… ou le briser.</p>
          ${hasSave ? `
            <button class="button primary resume-button" data-action="resume">
              <span><small>PARTIE EN COURS</small>Reprendre l’aventure</span><b>›</b>
            </button>
            <div class="save-progress"><span style="width:${ui.game.chapterComplete ? 100 : ((ui.game.eventIndex ?? 0) / 3) * 100}%"></span></div>
            <p class="save-caption">${progress} · Sauvegarde automatique</p>
          ` : '<button class="button primary" data-action="new-game">Commencer l’aventure</button>'}
        </div>
      </section>

      <nav class="menu-grid" aria-label="Menu principal">
        <button class="menu-tile" data-action="new-game"><span class="tile-icon">＋</span><span><strong>Nouvelle partie</strong><small>Créer un nouvel équipage</small></span></button>
        <button class="menu-tile" data-action="rules"><span class="tile-icon">?</span><span><strong>Comment jouer</strong><small>Principe et conseils</small></span></button>
        <button class="menu-tile" data-action="settings"><span class="tile-icon">⚙</span><span><strong>Réglages</strong><small>Confort et accessibilité</small></span></button>
        <div class="menu-tile status-tile"><span class="tile-icon">⌁</span><span><strong>Hors ligne</strong><small>Jouez sur un seul téléphone</small></span></div>
      </nav>

      <footer class="menu-footer">VERSION 0.1 · LE CRASH</footer>
    </main>
  `;
}

function settingRow(key, icon, title, description) {
  const enabled = ui.settings[key];
  return `
    <button class="setting-row" data-setting="${key}" role="switch" aria-checked="${enabled}">
      <span class="setting-icon">${icon}</span>
      <span class="setting-copy"><strong>${title}</strong><small>${description}</small></span>
      <span class="switch ${enabled ? 'on' : ''}"><i></i></span>
    </button>
  `;
}

function renderSettings() {
  app.innerHTML = `
    <main class="shell settings-shell">
      <header class="topbar">
        <button class="icon-button" data-action="home" aria-label="Retour au menu">←</button>
        <div><p class="kicker">MENU PRINCIPAL</p><h2>Réglages</h2></div>
      </header>

      <section class="settings-group">
        <p class="settings-label">JEU</p>
        ${settingRow('sound', '♪', 'Sons du jeu', 'Effets sonores et ambiance')}
        ${settingRow('vibrations', '⌁', 'Vibrations', 'Retour tactile pendant les choix')}
        ${settingRow('confirmRestart', '↺', 'Confirmer avant de recommencer', 'Évite d’effacer une partie par erreur')}
      </section>

      <section class="settings-group">
        <p class="settings-label">ACCESSIBILITÉ</p>
        ${settingRow('largeText', 'Aa', 'Texte agrandi', 'Améliore la lisibilité des histoires')}
        ${settingRow('highContrast', '◐', 'Contraste renforcé', 'Éclaircit les textes et les contours')}
        ${settingRow('reducedMotion', '◌', 'Réduire les animations', 'Limite les mouvements de l’interface')}
      </section>

      <section class="settings-group danger-zone">
        <p class="settings-label">DONNÉES</p>
        ${ui.game ? '<button class="settings-action danger-text" data-action="delete-save"><span>Supprimer la partie en cours</span><b>›</b></button>' : '<div class="settings-empty">Aucune partie sauvegardée.</div>'}
        <button class="settings-action" data-action="reset-settings"><span>Réinitialiser les réglages</span><b>›</b></button>
      </section>
      <p class="settings-note">Les réglages et la partie sont enregistrés uniquement sur cet appareil.</p>
    </main>
  `;
}

function renderRules() {
  app.innerHTML = `
    <main class="shell rules-shell">
      <header class="topbar">
        <button class="icon-button" data-action="home" aria-label="Retour au menu">←</button>
        <div><p class="kicker">LE CRASH</p><h2>Comment jouer</h2></div>
      </header>
      <section class="rules-hero panel">
        <span>2–8</span><div><strong>Un téléphone suffit</strong><p>Installez-vous ensemble et faites circuler l’appareil lors des choix secrets.</p></div>
      </section>
      <section class="rules-list">
        <article><b>01</b><div><h3>Découvrez l’histoire</h3><p>Chaque chapitre confronte votre groupe à des événements et des décisions.</p></div></article>
        <article><b>02</b><div><h3>Choisissez sans tout révéler</h3><p>Certains choix sont collectifs, d’autres sont secrets et personnels.</p></div></article>
        <article><b>03</b><div><h3>Survivez aux conséquences</h3><p>Vos vies, ressources, objets et relations évoluent selon vos décisions.</p></div></article>
      </section>
      <div class="tip-card"><span>!</span><p><strong>Conseil</strong> Ne lisez jamais l’écran d’un autre joueur pendant un choix secret.</p></div>
      <button class="button primary" data-action="new-game">Préparer l’équipage</button>
    </main>
  `;
}

function renderSetup() {
  const nameInputs = Array.from({ length: ui.setup.playerCount }, (_, index) => `
    <label class="field player-field">
      <span>Joueur ${index + 1}</span>
      <input data-player-name="${index}" maxlength="18" value="${escapeHtml(ui.setup.names[index] ?? `Joueur ${index + 1}`)}" />
    </label>
  `).join('');

  const durationCards = setupOptions.durations.map((option) => `
    <button class="select-card ${ui.setup.duration === option.id ? 'selected' : ''}" data-duration="${option.id}">
      <strong>${option.label}</strong><span>${option.detail}</span>
    </button>
  `).join('');

  const audienceCards = setupOptions.audiences.map((option) => `
    <button class="select-card ${ui.setup.audience === option.id ? 'selected' : ''}" data-audience="${option.id}">
      <strong>${option.label}</strong><span>${option.detail}</span>
    </button>
  `).join('');

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <button class="icon-button" data-action="home" aria-label="Retour">←</button>
        <div><p class="kicker">NOUVELLE PARTIE</p><h2>Préparer l’équipage</h2></div>
      </header>

      <section class="panel">
        <div class="section-heading">
          <div><p class="step">01</p><h3>Combien êtes-vous ?</h3></div>
          <div class="counter">
            <button data-action="less-player" aria-label="Retirer un joueur">−</button>
            <strong>${ui.setup.playerCount}</strong>
            <button data-action="more-player" aria-label="Ajouter un joueur">+</button>
          </div>
        </div>
        <div class="player-grid">${nameInputs}</div>
      </section>

      <section class="panel">
        <div class="section-heading"><div><p class="step">02</p><h3>Durée de l’aventure</h3></div></div>
        <div class="select-grid">${durationCards}</div>
      </section>

      <section class="panel">
        <div class="section-heading"><div><p class="step">03</p><h3>Public</h3></div></div>
        <div class="select-grid">${audienceCards}</div>
      </section>

      <button class="button primary sticky-action" data-action="start-game">Commencer le crash</button>
    </main>
  `;
}

function renderGame() {
  const event = currentEvent();
  if (!event || ui.game.chapterComplete) {
    renderChapterComplete();
    return;
  }

  const playerCards = ui.game.players.map((player) => `
    <article class="player-card">
      <div class="player-avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div>
      <div class="player-main">
        <strong>${escapeHtml(player.name)}</strong>
        <div class="lives">${'❤️'.repeat(player.lives)}${'🖤'.repeat(3 - player.lives)}</div>
        <small>${player.statuses.length ? player.statuses.join(' · ') : 'En état de jouer'}</small>
      </div>
      <div class="inventory">${player.inventory.length ? player.inventory.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Inventaire vide</span>'}</div>
    </article>
  `).join('');

  app.innerHTML = `
    <main class="shell game-shell">
      <header class="topbar compact">
        <button class="icon-button" data-action="home" aria-label="Accueil">⌂</button>
        <div><p class="kicker">DERNIÈRE ISSUE · LE CRASH</p><h2>Chapitre 1 · L’impact</h2></div>
        <button class="icon-button danger-button" data-action="reset" aria-label="Réinitialiser">↺</button>
      </header>

      <section class="gauges">
        ${gaugeCard('🥫', 'Réserves', ui.game.gauges.reserves)}
        ${gaugeCard('⛺', 'Refuge', ui.game.gauges.shelter)}
        ${gaugeCard('📡', 'Signal', ui.game.gauges.signal)}
        ${gaugeCard('⚠️', 'Danger', ui.game.gauges.danger)}
      </section>

      <section class="story-card">
        <div class="event-number">ÉVÉNEMENT ${event.number}/3</div>
        <p class="kicker">${event.eyebrow}</p>
        <h2>${event.title}</h2>
        <p>${event.narrative}</p>
        <button class="button primary" data-action="begin-event">Faire les choix</button>
      </section>

      <section>
        <div class="section-heading"><div><p class="step">SURVIVANTS</p><h3>État du groupe</h3></div></div>
        <div class="players-stack">${playerCards}</div>
      </section>
    </main>
  `;
}

function renderPrivateChoice() {
  const event = currentEvent();
  const player = ui.game.players[ui.privatePlayerIndex];

  if (!ui.passReady) {
    app.innerHTML = `
      <main class="shell private-shell">
        <section class="privacy-card">
          <div class="privacy-icon">🙈</div>
          <p class="kicker">CHOIX SECRET ${ui.privatePlayerIndex + 1}/${ui.game.players.length}</p>
          <h2>Passe le téléphone à<br><span>${escapeHtml(player.name)}</span></h2>
          <p>Les autres joueurs ne doivent pas voir son choix.</p>
          <button class="button primary" data-action="ready-private">Je suis ${escapeHtml(player.name)}</button>
        </section>
      </main>
    `;
    return;
  }

  const choices = event.choices.map((choice) => `
    <button class="choice-card" data-choice="${choice.id}">
      <span class="choice-icon">${choice.icon}</span>
      <span class="choice-copy"><strong>${choice.label}</strong><small>${choice.description}</small></span>
      <span class="choice-arrow">›</span>
    </button>
  `).join('');

  app.innerHTML = `
    <main class="shell private-shell">
      <header class="choice-header">
        <p class="kicker">${event.eyebrow}</p>
        <h2>${escapeHtml(player.name)}, à toi.</h2>
        <p>${event.prompt}</p>
      </header>
      <div class="choice-stack">${choices}</div>
      <p class="privacy-hint">🔒 Ton choix sera caché jusqu’à la résolution.</p>
    </main>
  `;
}

function renderGroupChoice() {
  const event = currentEvent();
  const choices = event.choices.map((choice) => `
    <button class="choice-card ${ui.selectedGroupChoice === choice.id ? 'selected' : ''}" data-group-choice="${choice.id}">
      <span class="choice-icon">${choice.icon}</span>
      <span class="choice-copy"><strong>${choice.label}</strong><small>${choice.description}</small></span>
      <span class="choice-check">${ui.selectedGroupChoice === choice.id ? '✓' : ''}</span>
    </button>
  `).join('');

  const volunteerSelect = ui.selectedGroupChoice === 'solo' ? `
    <label class="field volunteer-field">
      <span>Qui se porte volontaire ?</span>
      <select data-volunteer>
        ${ui.game.players.map((player) => `<option value="${player.id}" ${ui.volunteerId === player.id ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}
      </select>
    </label>
  ` : '';

  app.innerHTML = `
    <main class="shell private-shell">
      <header class="choice-header">
        <p class="kicker">${event.eyebrow}</p>
        <h2>${event.title}</h2>
        <p>${event.narrative}</p>
      </header>
      <div class="choice-stack">${choices}</div>
      ${volunteerSelect}
      <button class="button primary sticky-action" data-action="confirm-group" ${ui.selectedGroupChoice ? '' : 'disabled'}>Valider la décision</button>
    </main>
  `;
}

function renderResult() {
  const summary = ui.result.summary.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  const notes = ui.result.privateNotes.length
    ? `<div class="secret-result"><strong>Objets récupérés</strong>${ui.result.privateNotes.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>`
    : '';

  app.innerHTML = `
    <main class="shell result-shell">
      <section class="result-card">
        <div class="result-icon">✦</div>
        <p class="kicker">CONSÉQUENCES</p>
        <h2>${escapeHtml(ui.result.title)}</h2>
        <ul>${summary}</ul>
        ${notes}
        <div class="mini-gauges">
          <span>🥫 ${ui.game.gauges.reserves}/5</span>
          <span>📡 ${ui.game.gauges.signal}/5</span>
          <span>⚠️ ${ui.game.gauges.danger}/5</span>
          <span>🤝 ${ui.game.gauges.cohesion}</span>
        </div>
        <button class="button primary" data-action="continue">${ui.game.chapterComplete ? 'Voir le bilan du chapitre' : 'Continuer'}</button>
      </section>
    </main>
  `;
}

function renderChapterComplete() {
  const noraSaved = ui.game.history.some((item) => item.flag === 'nora_saved');
  const noraAbandoned = ui.game.history.some((item) => item.flag === 'nora_abandoned');
  const players = ui.game.players.map((player) => `
    <div class="final-player">
      <strong>${escapeHtml(player.name)}</strong>
      <span>${'❤️'.repeat(player.lives)}${'🖤'.repeat(3 - player.lives)}</span>
      <small>${player.inventory.length ? player.inventory.join(', ') : 'Aucun objet'}</small>
    </div>
  `).join('');

  app.innerHTML = `
    <main class="shell result-shell">
      <section class="chapter-card">
        <p class="kicker">FIN DU PROTOTYPE V0.1</p>
        <div class="chapter-badge">1</div>
        <h1>Vous avez survécu<br><span>à l’impact.</span></h1>
        <p>
          ${noraSaved ? 'Nora marche avec vous vers la plage. Elle sait des choses sur ce vol.' : ''}
          ${noraAbandoned ? 'Derrière vous, l’épave s’effondre. Personne ne prononce le nom de Nora.' : ''}
        </p>

        <div class="final-gauges">
          ${gaugeCard('🥫', 'Réserves', ui.game.gauges.reserves)}
          ${gaugeCard('📡', 'Signal', ui.game.gauges.signal)}
          ${gaugeCard('⚠️', 'Danger', ui.game.gauges.danger)}
        </div>

        <div class="final-players">${players}</div>

        <div class="coming-next">
          <strong>Prochaine étape</strong>
          <p>Chapitre 2 : Le premier camp, avec le choix du refuge, les missions et la mallette grise.</p>
        </div>

        <button class="button primary" data-action="restart">Rejouer le chapitre</button>
        <button class="button secondary" data-action="home">Retour à l’accueil</button>
      </section>
    </main>
  `;
}

function render() {
  applySettings();
  if (ui.screen === 'home') renderHome();
  if (ui.screen === 'settings') renderSettings();
  if (ui.screen === 'rules') renderRules();
  if (ui.screen === 'setup') renderSetup();
  if (ui.screen === 'game') renderGame();
  if (ui.screen === 'privateChoice') renderPrivateChoice();
  if (ui.screen === 'groupChoice') renderGroupChoice();
  if (ui.screen === 'result') renderResult();
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'new-game') setScreen('setup');
  if (action === 'settings') setScreen('settings');
  if (action === 'rules') setScreen('rules');
  if (action === 'resume') setScreen(ui.game.chapterComplete ? 'game' : 'game');
  if (action === 'home') setScreen('home');
  if (action === 'less-player') {
    ui.setup.playerCount = clamp(ui.setup.playerCount - 1, 2, 8);
    ui.setup.names = ui.setup.names.slice(0, ui.setup.playerCount);
    render();
  }
  if (action === 'more-player') {
    ui.setup.playerCount = clamp(ui.setup.playerCount + 1, 2, 8);
    while (ui.setup.names.length < ui.setup.playerCount) {
      ui.setup.names.push(`Joueur ${ui.setup.names.length + 1}`);
    }
    render();
  }
  if (action === 'start-game') startNewGame();
  if (action === 'begin-event') beginEvent();
  if (action === 'ready-private') {
    ui.passReady = true;
    render();
  }
  if (action === 'confirm-group') submitGroupChoice();
  if (action === 'continue') setScreen('game');
  if (action === 'restart') {
    clearGame();
    startNewGame();
  }
  if (action === 'reset') {
    if (!ui.settings.confirmRestart || confirm('Recommencer cette partie depuis le début ?')) resetRun();
  }
  if (action === 'delete-save') {
    if (confirm('Supprimer définitivement la partie en cours ?')) {
      clearGame();
      ui.game = null;
      render();
    }
  }
  if (action === 'reset-settings') {
    if (confirm('Réinitialiser tous les réglages ?')) {
      ui.settings = resetSettings();
      applySettings();
      render();
    }
  }

  if (target.dataset.setting) toggleSetting(target.dataset.setting);

  if (target.dataset.duration) {
    ui.setup.duration = target.dataset.duration;
    render();
  }
  if (target.dataset.audience) {
    ui.setup.audience = target.dataset.audience;
    render();
  }
  if (target.dataset.choice) submitPrivateChoice(target.dataset.choice);
  if (target.dataset.groupChoice) {
    ui.selectedGroupChoice = target.dataset.groupChoice;
    render();
  }
});

app.addEventListener('input', (event) => {
  const index = event.target.dataset.playerName;
  if (index !== undefined) {
    ui.setup.names[Number(index)] = event.target.value;
  }
});

app.addEventListener('change', (event) => {
  if (event.target.matches('[data-volunteer]')) {
    ui.volunteerId = event.target.value;
  }
});

render();
