'use client';

import { useIsMobileViewport } from '@/lib/hooks/useMediaQuery';
import { MobileShell } from '@/os/mobile/MobileShell';
import { Desktop } from './Desktop';
import { useUrlSync } from './useUrlSync';

/**
 * Picks the shell that suits the viewport.
 *
 * Boot and login are shared — they work at any size and are the same
 * experience either way. Only what happens after login differs, because
 * overlapping draggable windows are unusable on a phone and a dock is
 * pointless on a desktop.
 *
 * The switch is on viewport width rather than a device sniff: a phone in
 * landscape and a very narrow browser window have the same problem, and a
 * user-agent check answers a question nobody asked.
 */
export function Shell() {
  const isMobile = useIsMobileViewport();

  // Both shells share the window store, so the URL reflects whatever is
  // focused regardless of which presentation is on screen.
  useUrlSync();

  return isMobile ? <MobileShell /> : <Desktop />;
}
