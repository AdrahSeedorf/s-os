'use client';

import { useCallback } from 'react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { play } from './engine';
import type { SoundId } from './design';

/**
 * The one way anything in S-OS makes a noise.
 *
 * Returns a stable function so it can be dropped into an event handler
 * without adding a dependency that changes every render. The preference is
 * read through selectors, so a component that plays sounds still does not
 * re-render when the volume changes — only when it actually needs to.
 *
 * Note what this hook does *not* do: it never plays anything on mount, and it
 * has no effect that fires on state change. Every sound in the system is the
 * direct consequence of something a visitor did, which is both the correct
 * design and the only design browsers permit.
 */
export function useSound(): (id: SoundId) => void {
  const enabled = usePreferencesStore((state) => state.soundEnabled);
  const volume = usePreferencesStore((state) => state.volume);

  return useCallback(
    (id: SoundId) => {
      play(id, { enabled, volume });
    },
    [enabled, volume],
  );
}
