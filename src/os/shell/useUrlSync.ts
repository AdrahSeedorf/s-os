'use client';

import { useEffect } from 'react';
import { useWindowStore } from '@/stores/windowStore';

/**
 * Keeps the address bar in step with the focused window.
 *
 * Without this, every visitor shares the same URL no matter what they are
 * looking at, and there is no way to send someone to one project. With it,
 * focusing the Hotel Manager window makes the address bar read
 * `?app=hotel-734`, and that URL reopens exactly that window.
 *
 * Uses history.replaceState rather than the Next router deliberately. Pushing
 * a route would remount the shell and tear down every open window; replacing
 * the URL in place changes the address bar and nothing else. It also keeps the
 * browser Back button meaning "leave S-OS" rather than "undo my last window
 * focus", which is what someone who arrived from a job application expects.
 */
export function useUrlSync(): void {
  const focusedId = useWindowStore((state) => state.focusedId);
  const windows = useWindowStore((state) => state.windows);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const instance = focusedId ? windows[focusedId] : undefined;
    const url = new URL(window.location.href);

    if (!instance || instance.state === 'minimised') {
      url.searchParams.delete('app');
    } else {
      // Projects are addressed by project id rather than by the generic
      // "project" app id, so the URL says what it opens.
      const value = instance.params['projectId'] ?? instance.appId;
      url.searchParams.set('app', value);
    }

    const next = `${url.pathname}${url.search}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, '', next);
    }
  }, [focusedId, windows]);
}
