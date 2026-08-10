'use client';

import { useSyncExternalStore } from 'react';

/** Never changes, so the subscription never needs to fire. */
const subscribe = () => () => {};

/**
 * True only after hydration.
 *
 * S-OS reads localStorage for preferences and the clock for the time, neither
 * of which exists on the server. Rendering either during hydration makes the
 * server markup and the first client render disagree, which React reports as a
 * hydration error and resolves by discarding the server output.
 *
 * Implemented with useSyncExternalStore rather than an effect that calls
 * setState: the server snapshot is false and the client snapshot is true, so
 * React resolves the difference during hydration instead of scheduling an
 * extra render pass afterwards.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
