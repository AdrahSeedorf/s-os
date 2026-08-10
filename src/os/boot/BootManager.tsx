'use client';

import { useEffect, type ReactNode } from 'react';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useSystemStore } from '@/stores/systemStore';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { PoweredOffScreen, ShuttingDownScreen } from './PowerScreen';

/**
 * Owns the session lifecycle and decides what the visitor sees.
 *
 * Wraps the desktop rather than living inside it, so the desktop never has to
 * know whether the system is booting. `children` is the desktop, mounted only
 * once the session reaches that phase.
 */
export function BootManager({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();

  const phase = useSystemStore((state) => state.phase);
  const powerOn = useSystemStore((state) => state.powerOn);
  const enterDesktop = useSystemStore((state) => state.enterDesktop);

  const hydratePreferences = usePreferencesStore((state) => state.hydrate);
  const preferencesReady = usePreferencesStore((state) => state.hydrated);
  const hasBootedBefore = usePreferencesStore((state) => state.hasBootedBefore);
  const markBooted = usePreferencesStore((state) => state.markBooted);
  const contrast = usePreferencesStore((state) => state.contrast);
  const motion = usePreferencesStore((state) => state.motion);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  // Preferences are applied to the document element so the design tokens can
  // respond. Doing it here rather than in each component means one place to
  // look, and no component can forget.
  useEffect(() => {
    if (!preferencesReady) return;
    const root = document.documentElement;

    root.dataset['contrast'] = contrast === 'high' ? 'high' : '';
    root.dataset['motion'] = motion === 'reduced' ? 'reduced' : '';

    if (contrast !== 'high') delete root.dataset['contrast'];
    if (motion !== 'reduced') delete root.dataset['motion'];
  }, [preferencesReady, contrast, motion]);

  /**
   * Decide the entry point once preferences are known.
   *
   * A deep link bypasses boot and login entirely. Someone arriving on
   * `?app=hotel-manager` from a job application asked for a specific thing;
   * making them sit through a startup animation to reach it would be the exact
   * failure this whole design is meant to avoid.
   */
  useEffect(() => {
    if (!preferencesReady) return;
    if (useSystemStore.getState().phase !== 'off') return;

    const params = new URLSearchParams(window.location.search);
    const requestedApp = params.get('app');

    if (requestedApp) {
      enterDesktop('guest', { appId: requestedApp });
      markBooted();
      return;
    }

    if (params.get('recruiter') !== null) {
      enterDesktop('recruiter');
      markBooted();
      return;
    }

    powerOn({ quick: hasBootedBefore });
    markBooted();
  }, [preferencesReady, hasBootedBefore, powerOn, enterDesktop, markBooted]);

  // Until the client has hydrated there is nothing meaningful to show, and
  // rendering a guess would mismatch the server output.
  if (!hydrated || !preferencesReady) {
    return <div className="bg-void fixed inset-0" aria-hidden="true" />;
  }

  switch (phase) {
    case 'off':
      return <PoweredOffScreen />;
    case 'booting':
      return <BootScreen />;
    case 'login':
      return <LoginScreen />;
    case 'shutting-down':
      return <ShuttingDownScreen />;
    case 'desktop':
      return <>{children}</>;
  }
}
