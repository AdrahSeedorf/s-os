'use client';

import { useSyncExternalStore } from 'react';
import { usePreferencesStore } from '@/stores/preferencesStore';

const QUERY = '(prefers-reduced-motion: reduce)';

let mediaQuery: MediaQueryList | null = null;

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  mediaQuery ??= window.matchMedia(QUERY);
  return mediaQuery;
}

function subscribe(onChange: () => void): () => void {
  const query = getMediaQuery();
  if (!query) return () => {};

  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return getMediaQuery()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  // The server cannot know, and assuming "reduce" would strip animation for
  // everyone during the first paint. Assume full motion and correct on hydrate.
  return false;
}

/**
 * Whether motion should be suppressed.
 *
 * Two sources, and the visitor's explicit choice wins: the operating-system
 * `prefers-reduced-motion` setting, and the S-OS Settings override. Someone
 * with no system preference who simply finds the boot animation uncomfortable
 * can still switch it off.
 *
 * The design tokens already collapse CSS durations to zero in both cases. This
 * hook covers the imperative side — animation CSS cannot reach, and anything
 * that should be skipped outright rather than merely shortened.
 */
export function useReducedMotion(): boolean {
  const preference = usePreferencesStore((state) => state.motion);
  const systemPrefers = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return preference === 'reduced' || systemPrefers;
}
