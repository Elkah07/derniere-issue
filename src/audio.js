const THEME_LABELS = {
  silent: 'Silence',
  menu: 'Souffle de l’île',
  secrets: 'Murmures étouffés',
  crash: 'Épave en flammes',
  camp: 'Camp improvisé',
  beach: 'Vagues et vent marin',
  fuselage: 'Métal et braises',
  jungle: 'Jungle tropicale',
  night: 'Première nuit',
  exploration: 'Forêt profonde',
  doubt: 'Orage et tension',
  station: 'Station souterraine',
  evacuation: 'Tempête finale',
  endingHope: 'Après la tempête',
  endingDark: 'L’île referme ses portes',
};

const EVENT_CUES = {
  impact_escape: 'impact',
  burning_crates: 'explosion',
  save_nora: 'metal',
  shelter_beach_tide: 'wave',
  shelter_fuselage_aftershock: 'collapse',
  shelter_jungle_source: 'jungleCue',
  radio_voice: 'radioMessage',
  expedition: 'jungleCue',
  ravine: 'stone',
  outpost: 'powerUp',
  clues: 'radioCut',
  storm: 'thunderShort',
  generator: 'generator',
  black_dossier: 'data',
  trapped: 'collapse',
  escape_route: 'alarm',
  final_choice: 'alarm',
  last_wave: 'waveImpact',
  jungle_ambush: 'jungleCue',
  split_cache: 'stone',
  scout_route: 'jungleCue',
  saboteur_cornered: 'radioCut',
  beacon_reply: 'radioMessage',
  boat_capacity: 'metal',
  medical_protocol: 'powerUp',
  bonus_rain: 'rainCue',
  bonus_flare: 'flare',
  bonus_call: 'radioMessage',
  bonus_fire: 'fireBurst',
};

export function selectEventCue(eventId) {
  return EVENT_CUES[eventId] ?? null;
}

function campTheme(game) {
  const path = game?.flags?.branchPath ?? [];
  if (path.includes('camp:beach')) return 'beach';
  if (path.includes('camp:fuselage')) return 'fuselage';
  if (path.includes('camp:jungle')) return 'jungle';
  return 'camp';
}

export function selectAudioTheme({ screen, game, event } = {}) {
  if (['home', 'adventure', 'settings', 'rules', 'setup'].includes(screen)) return 'menu';
  if (['briefing', 'privateChoice', 'talentPrompt', 'afterlifePrompt'].includes(screen)) return 'secrets';
  if (screen === 'ending') {
    const hopeful = new Set(['everyone_home', 'duo_together', 'those_who_stay']);
    return hopeful.has(game?.ending?.id) ? 'endingHope' : 'endingDark';
  }

  const chapter = Number(event?.chapter ?? game?.chapterTransition ?? 1);
  if (chapter === 1) return 'crash';
  if (chapter === 2) return campTheme(game);
  if (chapter === 3) return 'night';
  if (chapter === 4) return 'exploration';
  if (chapter === 5) return 'doubt';
  if (chapter === 6) return 'station';
  if (chapter === 7) return 'evacuation';
  return 'menu';
}

function audioContextClass() {
  return globalThis.AudioContext ?? globalThis.webkitAudioContext ?? null;
}

function createNoiseBuffer(context, seconds = 4, color = 'white') {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = (Math.random() * 2) - 1;
    if (color === 'brown') {
      last = (last + (0.02 * white)) / 1.02;
      data[i] = last * 3.5;
    } else if (color === 'crackle') {
      const burst = Math.random() > 0.994 ? ((Math.random() * 2) - 1) : 0;
      data[i] = burst + (white * 0.018);
    } else if (color === 'rain') {
      const drop = Math.random() > 0.985 ? white * Math.random() : 0;
      data[i] = (white * 0.12) + drop;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

export class AudioDirector {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.ambienceGain = null;
    this.sfxGain = null;
    this.themeBus = null;
    this.currentTheme = null;
    this.pendingTheme = null;
    this.nodes = [];
    this.timers = [];
    this.settings = { sound: true, ambience: true, sfx: true, volume: 42 };
    this.lastSync = null;
    this.lastCueKey = null;
    this.pendingCue = null;
    this.unlocked = false;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.context) return;
        if (document.hidden) this.context.suspend().catch(() => {});
        else if (this.settings.sound) this.context.resume().catch(() => {});
      });
    }
  }

  configure(settings = {}) {
    this.settings = { ...this.settings, ...settings };
    if (!this.context) return;
    const now = this.context.currentTime;
    const volume = Math.max(0, Math.min(1, Number(this.settings.volume ?? 42) / 100));
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(this.settings.sound ? volume : 0, now + 0.18);
    this.ambienceGain.gain.linearRampToValueAtTime(this.settings.ambience === false ? 0 : 0.14, now + 0.18);
    this.sfxGain.gain.linearRampToValueAtTime(this.settings.sfx === false ? 0 : 0.52, now + 0.18);
    if (!this.settings.sound || this.settings.ambience === false) this.fadeTheme(0.2);
    else if (this.lastSync) this.sync(this.lastSync);
  }

  async unlock() {
    if (!this.settings.sound) return false;
    const Context = audioContextClass();
    if (!Context) return false;
    if (!this.context) this.createGraph(new Context());
    if (this.context.state === 'suspended') await this.context.resume().catch(() => {});
    this.unlocked = this.context.state === 'running';
    if (this.unlocked && this.pendingTheme) this.setTheme(this.pendingTheme);
    if (this.unlocked && this.pendingCue) {
      const cue = this.pendingCue;
      this.pendingCue = null;
      this.play(cue.name, cue.intensity ?? 0.7);
    }
    return this.unlocked;
  }

  createGraph(context) {
    this.context = context;
    this.masterGain = context.createGain();
    this.ambienceGain = context.createGain();
    this.sfxGain = context.createGain();
    this.masterGain.gain.value = Math.max(0, Math.min(1, Number(this.settings.volume ?? 42) / 100));
    this.ambienceGain.gain.value = this.settings.ambience === false ? 0 : 0.14;
    this.sfxGain.gain.value = this.settings.sfx === false ? 0 : 0.52;
    this.ambienceGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(context.destination);
  }

  sync(payload = {}) {
    this.lastSync = payload;
    this.configureWithoutSync(payload.settings ?? {});
    const theme = selectAudioTheme(payload);
    this.pendingTheme = theme;
    if (!this.context || !this.unlocked || !this.settings.sound || this.settings.ambience === false) return;
    this.setTheme(theme);
  }

  configureWithoutSync(settings = {}) {
    this.settings = { ...this.settings, ...settings };
    if (!this.context) return;
    const now = this.context.currentTime;
    const volume = Math.max(0, Math.min(1, Number(this.settings.volume ?? 42) / 100));
    this.masterGain.gain.setTargetAtTime(this.settings.sound ? volume : 0, now, 0.08);
    this.ambienceGain.gain.setTargetAtTime(this.settings.ambience === false ? 0 : 0.14, now, 0.08);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfx === false ? 0 : 0.52, now, 0.08);
  }

  getThemeLabel(theme = this.currentTheme ?? this.pendingTheme ?? 'silent') {
    return THEME_LABELS[theme] ?? THEME_LABELS.silent;
  }

  setTheme(theme) {
    if (!this.context || this.currentTheme === theme) return;
    this.stopTheme(0.45);
    this.currentTheme = theme;
    if (theme === 'silent') return;

    const bus = this.context.createGain();
    bus.gain.setValueAtTime(0, this.context.currentTime);
    bus.gain.linearRampToValueAtTime(1, this.context.currentTime + 1.25);
    bus.connect(this.ambienceGain);
    this.themeBus = bus;

    const builders = {
      menu: () => this.buildMenu(),
      secrets: () => this.buildSecrets(),
      crash: () => this.buildCrash(),
      camp: () => this.buildCamp(),
      beach: () => this.buildBeach(),
      fuselage: () => this.buildFuselage(),
      jungle: () => this.buildJungle(),
      night: () => this.buildNight(),
      exploration: () => this.buildExploration(),
      doubt: () => this.buildDoubt(),
      station: () => this.buildStation(),
      evacuation: () => this.buildEvacuation(),
      endingHope: () => this.buildEnding(true),
      endingDark: () => this.buildEnding(false),
    };
    builders[theme]?.();
  }

  stopTheme(fadeSeconds = 0.3) {
    if (!this.context) return;
    const now = this.context.currentTime;
    if (this.themeBus) {
      const bus = this.themeBus;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.linearRampToValueAtTime(0, now + fadeSeconds);
      globalThis.setTimeout?.(() => {
        try { bus.disconnect(); } catch {}
      }, (fadeSeconds * 1000) + 80);
    }
    this.nodes.forEach((node) => {
      try { node.stop?.(now + fadeSeconds + 0.05); } catch {}
      globalThis.setTimeout?.(() => {
        try { node.disconnect?.(); } catch {}
      }, (fadeSeconds * 1000) + 100);
    });
    this.nodes = [];
    this.timers.forEach((timer) => { globalThis.clearInterval?.(timer); globalThis.clearTimeout?.(timer); });
    this.timers = [];
    this.themeBus = null;
    this.currentTheme = null;
  }

  fadeTheme(seconds = 0.2) {
    this.stopTheme(seconds);
  }

  track(node) {
    this.nodes.push(node);
    return node;
  }

  noise({ color = 'white', gain = 0.08, lowpass = 1200, highpass = 0, q = 0.7, rate = 1, lfoRate = 0, lfoDepth = 0 } = {}) {
    if (!this.context || !this.themeBus) return null;
    const source = this.track(this.context.createBufferSource());
    source.buffer = createNoiseBuffer(this.context, 5, color);
    source.loop = true;
    source.playbackRate.value = rate;

    const high = this.context.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = highpass;
    const low = this.context.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = lowpass;
    low.Q.value = q;
    const amp = this.context.createGain();
    amp.gain.value = gain;

    source.connect(high);
    high.connect(low);
    low.connect(amp);
    amp.connect(this.themeBus);

    if (lfoRate > 0 && lfoDepth > 0) {
      const lfo = this.track(this.context.createOscillator());
      const lfoGain = this.context.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(amp.gain);
      lfo.start();
    }
    source.start();
    return source;
  }

  tone({ frequency = 110, gain = 0.025, type = 'sine', detune = 0, lfoRate = 0, lfoDepth = 0 } = {}) {
    if (!this.context || !this.themeBus) return null;
    const oscillator = this.track(this.context.createOscillator());
    const amp = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    amp.gain.value = gain;
    oscillator.connect(amp);
    amp.connect(this.themeBus);
    if (lfoRate > 0 && lfoDepth > 0) {
      const lfo = this.track(this.context.createOscillator());
      const lfoGain = this.context.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(amp.gain);
      lfo.start();
    }
    oscillator.start();
    return oscillator;
  }

  schedule(minMs, callback, maxMs = minMs, immediate = false) {
    const run = () => {
      if (!this.themeBus || !this.context) return;
      callback();
      const delay = minMs + (Math.random() * Math.max(0, maxMs - minMs));
      const timer = globalThis.setTimeout?.(run, delay);
      if (timer) this.timers.push(timer);
    };
    if (immediate) run();
    else {
      const delay = minMs + (Math.random() * Math.max(0, maxMs - minMs));
      const timer = globalThis.setTimeout?.(run, delay);
      if (timer) this.timers.push(timer);
    }
  }

  cueScene({ screen, event, result } = {}) {
    if (!event || !['game', 'result'].includes(screen)) return;
    const phase = screen === 'result' ? 'result' : 'event';
    const key = `${phase}:${event.id}:${result?.timedOut ? 'timeout' : result?.secret ? 'secret' : 'normal'}`;
    if (this.lastCueKey === key) return;
    this.lastCueKey = key;

    let name = phase === 'event' ? selectEventCue(event.id) : null;
    if (phase === 'result' && result?.timedOut) name = 'timeout';
    if (phase === 'result' && result?.secret) name = 'secret';
    if (!name) return;

    const cue = { name, intensity: phase === 'event' ? 0.5 : 0.38 };
    if (!this.context || !this.unlocked) {
      this.pendingCue = cue;
      return;
    }
    this.play(cue.name, cue.intensity);
  }


  chirp({ min = 1600, max = 3400, duration = 0.07, gain = 0.018 } = {}) {
    if (!this.context || !this.themeBus || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const amp = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(min + Math.random() * (max - min), now);
    osc.frequency.exponentialRampToValueAtTime(max + (Math.random() * 500), now + duration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(this.themeBus);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  thunder(gain = 0.09) {
    if (!this.context || !this.themeBus) return;
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    source.buffer = createNoiseBuffer(this.context, 2.6, 'brown');
    const low = this.context.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 180;
    const amp = this.context.createGain();
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.05);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    source.connect(low);
    low.connect(amp);
    amp.connect(this.themeBus);
    source.start(now);
    source.stop(now + 2.6);
  }

  buildMenu() {
    this.noise({ color: 'brown', gain: 0.004, lowpass: 440, highpass: 35, lfoRate: 0.04, lfoDepth: 0.004 });
  }

  buildSecrets() {
    this.noise({ color: 'brown', gain: 0.003, lowpass: 330, highpass: 55, lfoRate: 0.07, lfoDepth: 0.003 });
  }

  buildCrash() {
    this.noise({ color: 'crackle', gain: 0.008, lowpass: 4200, highpass: 850 });
    this.noise({ color: 'brown', gain: 0.004, lowpass: 180, highpass: 25, lfoRate: 0.07, lfoDepth: 0.004 });
  }

  buildCamp() {
    this.noise({ color: 'brown', gain: 0.004, lowpass: 650, highpass: 55, lfoRate: 0.05, lfoDepth: 0.004 });
  }

  buildBeach() {
    this.noise({ color: 'white', gain: 0.007, lowpass: 780, highpass: 100, lfoRate: 0.065, lfoDepth: 0.01 });
  }

  buildFuselage() {
    this.noise({ color: 'crackle', gain: 0.006, lowpass: 4100, highpass: 800 });
    this.noise({ color: 'brown', gain: 0.004, lowpass: 260, highpass: 30, lfoRate: 0.05, lfoDepth: 0.004 });
  }

  buildJungle() {
    this.noise({ color: 'brown', gain: 0.0045, lowpass: 1250, highpass: 75, lfoRate: 0.045, lfoDepth: 0.004 });
  }

  buildNight() {
    this.noise({ color: 'brown', gain: 0.0035, lowpass: 720, highpass: 50, lfoRate: 0.035, lfoDepth: 0.003 });
  }

  buildExploration() {
    this.noise({ color: 'brown', gain: 0.004, lowpass: 1100, highpass: 80, lfoRate: 0.045, lfoDepth: 0.004 });
  }

  buildDoubt() {
    this.noise({ color: 'rain', gain: 0.007, lowpass: 6200, highpass: 420, lfoRate: 0.06, lfoDepth: 0.006 });
    this.noise({ color: 'brown', gain: 0.0035, lowpass: 500, highpass: 45, lfoRate: 0.04, lfoDepth: 0.004 });
  }

  buildStation() {
    this.tone({ frequency: 50, gain: 0.0025, type: 'sine' });
    this.noise({ color: 'white', gain: 0.0025, lowpass: 4200, highpass: 1400, lfoRate: 0.08, lfoDepth: 0.002 });
  }

  buildEvacuation() {
    this.noise({ color: 'rain', gain: 0.006, lowpass: 7200, highpass: 360, lfoRate: 0.07, lfoDepth: 0.008 });
    this.noise({ color: 'brown', gain: 0.0045, lowpass: 540, highpass: 30, lfoRate: 0.05, lfoDepth: 0.006 });
  }

  buildEnding(hopeful) {
    if (hopeful) {
      this.noise({ color: 'white', gain: 0.004, lowpass: 780, highpass: 90, lfoRate: 0.05, lfoDepth: 0.005 });
    } else {
      this.noise({ color: 'brown', gain: 0.004, lowpass: 360, highpass: 30, lfoRate: 0.04, lfoDepth: 0.004 });
    }
  }


  play(name, intensity = 1, throughTheme = false) {
    if (!this.context || !this.unlocked || !this.settings.sound || this.settings.sfx === false) return;
    const output = throughTheme && this.themeBus ? this.themeBus : this.sfxGain;
    if (!output) return;
    const now = this.context.currentTime;
    const gainScale = Math.max(0.15, Math.min(1.5, intensity));

    const beep = ({ from, to = from, duration = 0.08, gain = 0.05, type = 'sine', delay = 0 }) => {
      const start = now + delay;
      const oscillator = this.context.createOscillator();
      const amp = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(from, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.exponentialRampToValueAtTime(gain * gainScale, start + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(amp);
      amp.connect(output);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    };

    const noiseBurst = ({ duration = 0.45, gain = 0.05, lowpass = 900, highpass = 25, color = 'brown', delay = 0 } = {}) => {
      const start = now + delay;
      const source = this.context.createBufferSource();
      source.buffer = createNoiseBuffer(this.context, duration + 0.12, color);
      const high = this.context.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.value = highpass;
      const low = this.context.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = lowpass;
      const amp = this.context.createGain();
      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.exponentialRampToValueAtTime(gain * gainScale, start + 0.015);
      amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(high);
      high.connect(low);
      low.connect(amp);
      amp.connect(output);
      source.start(start);
      source.stop(start + duration + 0.08);
    };

    if (name === 'click') beep({ from: 420, to: 520, duration: 0.035, gain: 0.009 });
    if (name === 'select') {
      beep({ from: 330, to: 440, duration: 0.07, gain: 0.02 });
      beep({ from: 440, to: 660, duration: 0.09, gain: 0.014, delay: 0.055 });
    }
    if (name === 'reveal') {
      beep({ from: 392, to: 523, duration: 0.18, gain: 0.022 });
      beep({ from: 523, to: 784, duration: 0.24, gain: 0.03, delay: 0.12 });
    }
    if (name === 'chapter') {
      beep({ from: 98, to: 147, duration: 0.65, gain: 0.055, type: 'triangle' });
      beep({ from: 147, to: 220, duration: 0.8, gain: 0.035, type: 'sine', delay: 0.12 });
    }
    if (name === 'tick') beep({ from: 780, to: 720, duration: 0.055, gain: 0.028 + (intensity * 0.004), type: 'square' });
    if (name === 'timeout') {
      beep({ from: 180, to: 72, duration: 0.55, gain: 0.075, type: 'sawtooth' });
      beep({ from: 95, to: 58, duration: 0.7, gain: 0.045, type: 'square', delay: 0.12 });
    }
    if (name === 'result') {
      beep({ from: 220, to: 330, duration: 0.2, gain: 0.04 });
      beep({ from: 330, to: 494, duration: 0.25, gain: 0.028, delay: 0.13 });
    }
    if (name === 'secret') {
      beep({ from: 420, to: 190, duration: 0.38, gain: 0.032, type: 'triangle' });
    }
    if (name === 'ending') {
      [146.83, 185, 220, 293.66].forEach((frequency, index) => beep({ from: frequency, to: frequency * 1.015, duration: 1.25, gain: 0.025, delay: index * 0.08 }));
    }
    if (name === 'metal') {
      beep({ from: 510, to: 85, duration: 0.42, gain: 0.025, type: 'square' });
      beep({ from: 290, to: 70, duration: 0.62, gain: 0.018, type: 'triangle', delay: 0.08 });
    }
    if (name === 'impact') {
      noiseBurst({ duration: 0.34, gain: 0.055, lowpass: 260, color: 'brown' });
      beep({ from: 84, to: 42, duration: 0.38, gain: 0.026, type: 'sine' });
    }
    if (name === 'explosion') {
      noiseBurst({ duration: 0.58, gain: 0.095, lowpass: 420, color: 'brown' });
      noiseBurst({ duration: 0.24, gain: 0.038, lowpass: 4800, highpass: 700, color: 'white', delay: 0.018 });
      beep({ from: 72, to: 34, duration: 0.62, gain: 0.038, type: 'sine' });
    }
    if (name === 'collapse' || name === 'stone') {
      noiseBurst({ duration: 0.7, gain: 0.06, lowpass: 340, color: 'brown' });
      beep({ from: 190, to: 48, duration: 0.56, gain: 0.025, type: 'triangle' });
    }
    if (name === 'wave' || name === 'splash' || name === 'waveImpact') {
      noiseBurst({ duration: name === 'waveImpact' ? 1.0 : 0.62, gain: name === 'waveImpact' ? 0.07 : 0.045, lowpass: 1300, highpass: 90, color: 'white' });
      if (name === 'waveImpact') beep({ from: 96, to: 46, duration: 0.65, gain: 0.026, type: 'sine' });
    }
    if (name === 'fireBurst') {
      noiseBurst({ duration: 0.55, gain: 0.04, lowpass: 5400, highpass: 800, color: 'crackle' });
    }
    if (name === 'radioMessage' || name === 'radioCut') {
      noiseBurst({ duration: 0.28, gain: 0.025, lowpass: 4200, highpass: 900, color: 'white' });
      beep({ from: name === 'radioCut' ? 520 : 680, to: name === 'radioCut' ? 90 : 720, duration: 0.16, gain: 0.018, type: 'square', delay: 0.05 });
    }
    if (name === 'thunderShort') {
      noiseBurst({ duration: 0.72, gain: 0.06, lowpass: 240, color: 'brown' });
    }
    if (name === 'alarm') {
      beep({ from: 690, to: 690, duration: 0.16, gain: 0.022, type: 'square' });
      beep({ from: 560, to: 560, duration: 0.16, gain: 0.018, type: 'square', delay: 0.22 });
    }
    if (name === 'generator' || name === 'powerUp' || name === 'powerDown') {
      const up = name !== 'powerDown';
      beep({ from: up ? 55 : 180, to: up ? 180 : 48, duration: 0.48, gain: 0.022, type: 'sine' });
      if (up) beep({ from: 220, to: 440, duration: 0.18, gain: 0.012, delay: 0.35 });
    }
    if (name === 'data') {
      [620, 760, 910].forEach((frequency, index) => beep({ from: frequency, to: frequency * 1.02, duration: 0.055, gain: 0.012, type: 'square', delay: index * 0.065 }));
    }
    if (name === 'rainCue') {
      noiseBurst({ duration: 0.42, gain: 0.018, lowpass: 5200, highpass: 500, color: 'rain' });
    }
    if (name === 'flare') {
      noiseBurst({ duration: 0.14, gain: 0.025, lowpass: 5600, highpass: 900, color: 'white' });
      beep({ from: 220, to: 980, duration: 0.32, gain: 0.012, type: 'sine', delay: 0.02 });
    }
    if (name === 'jungleCue') {
      this.chirp({ min: 900, max: 1800, duration: 0.06, gain: 0.004 });
    }

    if (name === 'radio') {
      const source = this.context.createBufferSource();
      source.buffer = createNoiseBuffer(this.context, 0.38, 'white');
      const band = this.context.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 2200;
      band.Q.value = 1.2;
      const amp = this.context.createGain();
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(0.025 * gainScale, now + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      source.connect(band);
      band.connect(amp);
      amp.connect(output);
      source.start(now);
      source.stop(now + 0.39);
    }
  }
}

export const audioDirector = new AudioDirector();
