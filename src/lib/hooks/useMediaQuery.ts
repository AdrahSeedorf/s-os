'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a media query.
 *
 * MediaQueryList objects are cached per query, because `useSyncExternalStore`
 * calls `getSnapshot` on every render and constructing a fresh MediaQueryList
 * each time would be wasteful — and, worse, would give a new object identity
 * to anything that compared them.
 */
const cache = new Map<string, MediaQueryList>();

function getQuery(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;

  const existing = cache.get(query);
  if (existing) return existing;

  const created = window.matchMedia(query);
  cache.set(query, created);
  return created;
}

export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = (onChange: () => void) => {
    const list = getQuery(query);
    if (!list) return () => {};

    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => getQuery(query)?.matches ?? serverFallback,
    () => serverFallback,
  );
}

/**
 * The breakpoint at which S-OS switches to the mobile shell.
 *
 * 768px rather than a device sniff: what matters is whether there is room for
 * overlapping windows, not what the browser claims to be running on. A phone
 * in landscape and a very small browser window have the same problem and get
 * the same answer.
 */
export const MOBILE_BREAKPOINT = 768;

export function useIsMobileViewport(): boolean {
  // The server assumes desktop. Assuming mobile would mean every crawler and
  // link preview saw the reduced shell.
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, false);
}
