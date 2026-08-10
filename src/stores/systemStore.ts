import { create } from 'zustand';

/**
 * The S-OS session state machine.
 *
 * Phases are modelled explicitly rather than as a pile of booleans. With
 * `isBooting`, `isLoggedIn` and `isShuttingDown` as separate flags, states like
 * "booting while shutting down" are representable but meaningless, and every
 * consumer has to remember the correct combination. One phase makes the
 * impossible states unrepresentable and the transitions testable in isolation.
 *
 *   off ──power on──► booting ──complete──► login ──enter──► desktop
 *                                             ▲                 │
 *                                             └──── log off ◄────┤
 *                                                                │
 *   off ◄── shutdown ◄─────────── shutting-down ◄────────────────┘
 */

export type SystemPhase = 'off' | 'booting' | 'login' | 'desktop' | 'shutting-down';

/**
 * How the visitor entered. Not authentication — S-OS has no accounts and
 * nothing to protect. It records intent, so the shell can open Recruiter Mode
 * immediately for someone who asked for it and stay out of the way otherwise.
 */
export type SessionKind = 'guest' | 'demo' | 'recruiter';

export interface SystemState {
  phase: SystemPhase;
  session: SessionKind | null;
  /** True when the boot animation was shortened for a returning visitor. */
  quickBoot: boolean;
  /** Set when entry should open an application immediately — a deep link, or
   *  Recruiter Mode. Consumed and cleared by the shell once handled. */
  pendingAppId: string | null;
  loginError: string | null;

  powerOn: (options?: { quick?: boolean }) => void;
  completeBoot: () => void;
  /** Jump straight past boot. Used by the skip control and by deep links,
   *  where a visitor arriving from a job application should not sit through a
   *  startup animation. */
  skipBoot: () => void;
  enterDesktop: (session: SessionKind, options?: { appId?: string }) => void;
  attemptLogin: (username: string, password: string) => boolean;
  logOff: () => void;
  restart: () => void;
  shutdown: () => void;
  completeShutdown: () => void;
  consumePendingApp: () => string | null;
  clearLoginError: () => void;
}

/**
 * The demo credentials, displayed on the login screen rather than hidden.
 *
 * Making a visitor guess a password is a puzzle nobody agreed to solve, and
 * the account grants nothing — every route in is equivalent. The credentials
 * exist for the texture of the thing, not for access control.
 */
export const DEMO_CREDENTIALS = {
  username: 'guest',
  password: 'portfolio',
} as const;

export const useSystemStore = create<SystemState>()((set, get) => ({
  phase: 'off',
  session: null,
  quickBoot: false,
  pendingAppId: null,
  loginError: null,

  powerOn: (options) => {
    set({
      phase: 'booting',
      quickBoot: options?.quick ?? false,
      session: null,
      loginError: null,
    });
  },

  completeBoot: () => {
    if (get().phase !== 'booting') return;
    set({ phase: 'login' });
  },

  skipBoot: () => {
    const { phase } = get();
    if (phase !== 'booting' && phase !== 'off') return;
    set({ phase: 'login' });
  },

  enterDesktop: (session, options) => {
    set({
      phase: 'desktop',
      session,
      loginError: null,
      pendingAppId: options?.appId ?? (session === 'recruiter' ? 'recruiter' : null),
    });
  },

  attemptLogin: (username, password) => {
    const matches =
      username.trim().toLowerCase() === DEMO_CREDENTIALS.username &&
      password === DEMO_CREDENTIALS.password;

    if (!matches) {
      set({ loginError: 'The username or password is incorrect.' });
      return false;
    }

    get().enterDesktop('demo');
    return true;
  },

  logOff: () => {
    set({ phase: 'login', session: null, pendingAppId: null, loginError: null });
  },

  restart: () => {
    // Returning to a shortened boot rather than the full sequence: a restart is
    // a deliberate act by someone already inside, not a first impression.
    set({ phase: 'booting', quickBoot: true, session: null, pendingAppId: null });
  },

  shutdown: () => {
    set({ phase: 'shutting-down', session: null, pendingAppId: null });
  },

  completeShutdown: () => {
    if (get().phase !== 'shutting-down') return;
    set({ phase: 'off', quickBoot: false });
  },

  consumePendingApp: () => {
    const { pendingAppId } = get();
    if (pendingAppId !== null) set({ pendingAppId: null });
    return pendingAppId;
  },

  clearLoginError: () => set({ loginError: null }),
}));

/** Test helper. Resets the machine without reaching into store internals. */
export function resetSystemStore(): void {
  useSystemStore.setState({
    phase: 'off',
    session: null,
    quickBoot: false,
    pendingAppId: null,
    loginError: null,
  });
}
