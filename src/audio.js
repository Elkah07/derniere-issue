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

function campTheme(game) {
  const path = game?.flags?.branchPath ?? [];
  if (path.includes('camp:beach')) return 'beach';
  if (path.includes('camp:fuselage')) return 'fuselage';
  if (path.includes('camp:jungle')) return 'jungle';
  return 'camp';
}

export function selectAudioTheme({ screen, game, event } = {}) {
  if (['home', 'adventure', 'settings', 'rules', 'setup'].includes(screen)) return 'menu';
  if (['briefing', 'privateChoice'].includes(screen)) return 'secrets';
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
    this.settings = { sound: true, ambience: true, sfx: true, volume: 65 };
    this.lastSync = null;
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
    const volume = Math.max(0, Math.min(1, Number(this.settings.volume ?? 65) / 100));
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(this.settings.sound ? volume : 0, now + 0.18);
    this.ambienceGain.gain.linearRampToValueAtTime(this.settings.ambience === false ? 0 : 0.82, now + 0.18);
    this.sfxGain.gain.linearRampToValueAtTime(this.settings.sfx === false ? 0 : 0.9, now + 0.18);
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
    return this.unlocked;
  }

  createGraph(context) {
    this.context = context;
    this.masterGain = context.createGain();
    this.ambienceGain = context.createGain();
    this.sfxGain = context.createGain();
    this.masterGain.gain.value = Math.max(0, Math.min(1, Number(this.settings.volume ?? 65) / 100));
    this.ambienceGain.gain.value = this.settings.ambience === false ? 0 : 0.82;
    this.sfxGain.gain.value = this.settings.sfx === false ? 0 : 0.9;
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
    const volume = Math.max(0, Math.min(1, Number(this.settings.volume ?? 65) / 100));
    this.masterGain.gain.setTargetAtTime(this.settings.sound ? volume : 0, now, 0.08);
    this.ambienceGain.gain.setTargetAtTime(this.settings.ambience === false ? 0 : 0.82, now, 0.08);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfx === false ? 0 : 0.9, now, 0.08);
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
    this.timers.forEach((timer) => globalThis.clearInterval?.(timer));
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

  schedule(intervalMs, callback) {
    callback();
    const timer = globalThis.setInterval?.(callback, intervalMs);
    if (timer) this.timers.push(timer);
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
    this.noise({ color: 'brown', gain: 0.035, lowpass: 520, highpass: 35, lfoRate: 0.07, lfoDepth: 0.012 });
    this.tone({ frequency: 73.42, gain: 0.012, type: 'sine', lfoRate: 0.05, lfoDepth: 0.006 });
  }

  buildSecrets() {
    this.noise({ color: 'brown', gain: 0.018, lowpass: 380, highpass: 50, lfoRate: 0.12, lfoDepth: 0.008 });
    this.tone({ frequency: 92.5, gain: 0.007, type: 'sine' });
  }

  buildCrash() {
    this.noise({ color: 'crackle', gain: 0.14, lowpass: 5200, highpass: 650 });
    this.noise({ color: 'brown', gain: 0.055, lowpass: 210, highpass: 25, lfoRate: 0.16, lfoDepth: 0.02 });
    this.tone({ frequency: 46, gain: 0.016, type: 'sine', lfoRate: 0.22, lfoDepth: 0.008 });
  }

  buildCamp() {
    this.noise({ color: 'brown', gain: 0.035, lowpass: 760, highpass: 50, lfoRate: 0.09, lfoDepth: 0.012 });
    this.noise({ color: 'crackle', gain: 0.045, lowpass: 3800, highpass: 900 });
  }

  buildBeach() {
    this.noise({ color: 'white', gain: 0.075, lowpass: 980, highpass: 90, lfoRate: 0.105, lfoDepth: 0.055 });
    this.noise({ color: 'brown', gain: 0.028, lowpass: 520, highpass: 30, lfoRate: 0.055, lfoDepth: 0.012 });
  }

  buildFuselage() {
    this.noise({ color: 'crackle', gain: 0.095, lowpass: 4800, highpass: 620 });
    this.noise({ color: 'brown', gain: 0.04, lowpass: 300, highpass: 25, lfoRate: 0.12, lfoDepth: 0.018 });
    this.schedule(7200, () => this.play('metal', 0.5, true));
  }

  buildJungle() {
    this.noise({ color: 'brown', gain: 0.045, lowpass: 1600, highpass: 60, lfoRate: 0.08, lfoDepth: 0.018 });
    this.noise({ color: 'white', gain: 0.014, lowpass: 6500, highpass: 2400 });
    this.schedule(1700, () => {
      if (Math.random() > 0.24) this.chirp({ min: 1700, max: 3900, gain: 0.013 + Math.random() * 0.01 });
    });
  }

  buildNight() {
    this.noise({ color: 'brown', gain: 0.025, lowpass: 900, highpass: 45, lfoRate: 0.06, lfoDepth: 0.01 });
    this.schedule(1250, () => {
      if (Math.random() > 0.15) this.chirp({ min: 2600, max: 5300, duration: 0.045, gain: 0.012 });
    });
    this.noise({ color: 'white', gain: 0.008, lowpass: 5200, highpass: 1600, lfoRate: 0.18, lfoDepth: 0.004 });
  }

  buildExploration() {
    this.noise({ color: 'brown', gain: 0.045, lowpass: 1450, highpass: 70, lfoRate: 0.1, lfoDepth: 0.018 });
    this.schedule(2100, () => {
      if (Math.random() > 0.35) this.chirp({ min: 1200, max: 3000, duration: 0.09, gain: 0.011 });
    });
  }

  buildDoubt() {
    this.noise({ color: 'rain', gain: 0.082, lowpass: 7200, highpass: 350, lfoRate: 0.14, lfoDepth: 0.024 });
    this.noise({ color: 'brown', gain: 0.05, lowpass: 620, highpass: 40, lfoRate: 0.075, lfoDepth: 0.022 });
    this.tone({ frequency: 54, gain: 0.016, type: 'sine', lfoRate: 1.08, lfoDepth: 0.011 });
    this.schedule(11500, () => { if (Math.random() > 0.25) this.thunder(0.065); });
  }

  buildStation() {
    this.tone({ frequency: 50, gain: 0.022, type: 'sine' });
    this.tone({ frequency: 100, gain: 0.008, type: 'sine', detune: 5 });
    this.noise({ color: 'white', gain: 0.018, lowpass: 5200, highpass: 1100, lfoRate: 0.23, lfoDepth: 0.01 });
    this.schedule(5300, () => this.play('radio', 0.35, true));
  }

  buildEvacuation() {
    this.noise({ color: 'rain', gain: 0.11, lowpass: 8200, highpass: 300, lfoRate: 0.18, lfoDepth: 0.035 });
    this.noise({ color: 'brown', gain: 0.075, lowpass: 650, highpass: 25, lfoRate: 0.095, lfoDepth: 0.03 });
    this.tone({ frequency: 83, gain: 0.013, type: 'square', lfoRate: 0.72, lfoDepth: 0.012 });
    this.schedule(9000, () => { if (Math.random() > 0.2) this.thunder(0.1); });
  }

  buildEnding(hopeful) {
    if (hopeful) {
      this.noise({ color: 'white', gain: 0.04, lowpass: 900, highpass: 70, lfoRate: 0.095, lfoDepth: 0.026 });
      [146.83, 185, 220].forEach((frequency, index) => this.tone({ frequency, gain: 0.008 - (index * 0.001), type: 'sine' }));
    } else {
      this.noise({ color: 'brown', gain: 0.04, lowpass: 420, highpass: 25, lfoRate: 0.055, lfoDepth: 0.016 });
      [55, 65.41, 82.41].forEach((frequency, index) => this.tone({ frequency, gain: 0.009 - (index * 0.001), type: 'sine' }));
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

    if (name === 'click') beep({ from: 420, to: 540, duration: 0.045, gain: 0.018 });
    if (name === 'select') {
      beep({ from: 330, to: 440, duration: 0.07, gain: 0.035 });
      beep({ from: 440, to: 660, duration: 0.09, gain: 0.026, delay: 0.055 });
    }
    if (name === 'reveal') {
      beep({ from: 392, to: 523, duration: 0.18, gain: 0.038 });
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
