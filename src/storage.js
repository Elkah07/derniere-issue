const STORAGE_KEY = 'derniere-issue-save-v01';
const SETTINGS_KEY = 'derniere-issue-settings-v01';

export const defaultSettings = {
  sound: true,
  ambience: true,
  sfx: true,
  volume: 42,
  vibrations: true,
  reducedMotion: false,
  cinematicFx: true,
  largeText: false,
  highContrast: false,
  confirmRestart: true,
  timers: true,
};

export function saveGame(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearGame() {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...defaultSettings };

  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
  return { ...defaultSettings };
}
