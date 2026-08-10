import { create } from 'zustand';

/**
 * Visitor preferences, persisted to localStorage.
 *
 * Kept separate from the session store because the lifetimes differ: a session
 * ends when you log off, whereas a preference should survive a year. Splitting
 * them also keeps subscriptions narrow — the taskbar clock has no reason to
 * re-render when someone unmutes the system.
 *
 * Nothing sensitive is ever stored here. It is a portfolio, not an account.
 */

export type MotionPreference = 'system' | 'reduced';
export type ContrastPreference = 'normal' | 'high';

export interface Preferences {
  /** Muted by default, always. Browsers block autoplay anyway, and unexpected
   *  audio in an open-plan office is how a recruiter closes the tab. */
  soundEnabled: boolean;
  volume: number;
  motion: MotionPreference;
  contrast: ContrastPreference;
  /** Lets returning visitors skip straight to a short boot. */
  hasBootedBefore: boolean;
}

export interface PreferencesState extends Preferences {
  /** False until localStorage has been read. Components must not render
   *  preference-dependent output before this flips, or the server markup and
   *  the first client render disagree and React throws a hydration error. */
  hydrated: boolean;

  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setMotion: (motion: MotionPreference) => void;
  setContrast: (contrast: ContrastPreference) => void;
  markBooted: () => void;
  hydrate: () => void;
  reset: () => void;
}

const STORAGE_KEY = 's-os:preferences';

export const defaultPreferences: Preferences = {
  soundEnabled: false,
  volume: 0.4,
  motion: 'system',
  contrast: 'normal',
  hasBootedBefore: false,
};

function readStored(): Partial<Preferences> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};

    // Validated field by field. Stored data is untrusted input: it may be from
    // an older schema, hand-edited, or corrupt, and a bad value should fall
    // back to the default rather than put the OS in an impossible state.
    const candidate = parsed as Record<string, unknown>;
    const result: Partial<Preferences> = {};

    if (typeof candidate['soundEnabled'] === 'boolean') {
      result.soundEnabled = candidate['soundEnabled'];
    }
    if (typeof candidate['volume'] === 'number' && Number.isFinite(candidate['volume'])) {
      result.volume = Math.min(1, Math.max(0, candidate['volume']));
    }
    if (candidate['motion'] === 'system' || candidate['motion'] === 'reduced') {
      result.motion = candidate['motion'];
    }
    if (candidate['contrast'] === 'normal' || candidate['contrast'] === 'high') {
      result.contrast = candidate['contrast'];
    }
    if (typeof candidate['hasBootedBefore'] === 'boolean') {
      result.hasBootedBefore = candidate['hasBootedBefore'];
    }

    return result;
  } catch {
    // Private browsing, disabled storage, or malformed JSON. Defaults are fine.
    return {};
  }
}

function persist(preferences: Preferences): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage can be full or blocked. Losing a preference is not worth an error.
  }
}

function snapshot(state: PreferencesState): Preferences {
  return {
    soundEnabled: state.soundEnabled,
    volume: state.volume,
    motion: state.motion,
    contrast: state.contrast,
    hasBootedBefore: state.hasBootedBefore,
  };
}

export const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  ...defaultPreferences,
  hydrated: false,

  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    persist(snapshot(get()));
  },

  setVolume: (volume) => {
    set({ volume: Math.min(1, Math.max(0, volume)) });
    persist(snapshot(get()));
  },

  setMotion: (motion) => {
    set({ motion });
    persist(snapshot(get()));
  },

  setContrast: (contrast) => {
    set({ contrast });
    persist(snapshot(get()));
  },

  markBooted: () => {
    if (get().hasBootedBefore) return;
    set({ hasBootedBefore: true });
    persist(snapshot(get()));
  },

  hydrate: () => {
    if (get().hydrated) return;
    set({ ...readStored(), hydrated: true });
  },

  reset: () => {
    set({ ...defaultPreferences });
    persist(defaultPreferences);
  },
}));
