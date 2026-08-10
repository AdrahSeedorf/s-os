'use client';

import { useEffect } from 'react';
import { useWindowStore } from '@/stores/windowStore';
import { OSWindow } from './OSWindow';

/**
 * Renders every open window and owns the desktop-wide keyboard shortcuts.
 *
 * Windows are rendered in creation order rather than stacking order, and
 * layering is done with z-index. Reordering the DOM to match the stack would
 * unmount and remount an application every time it was focused, throwing away
 * its scroll position and any state it holds.
 */
export function WindowManager() {
  const windows = useWindowStore((state) => state.windows);
  const creationOrder = useWindowStore((state) => state.creationOrder);
  const focusedId = useWindowStore((state) => state.focusedId);
  const setViewport = useWindowStore((state) => state.setViewport);
  const cycleFocus = useWindowStore((state) => state.cycleFocus);

  // Keep the window manager's idea of the viewport in step with the browser,
  // so windows are re-fitted when the window is resized or a tablet rotates.
  useEffect(() => {
    const taskbarHeight = readTaskbarHeight();

    const sync = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        taskbarHeight,
      });
    };

    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [setViewport]);

  /**
   * F6 cycles windows, Shift+F6 goes back.
   *
   * Alt+Tab and Ctrl+Tab both belong to the browser and cannot be intercepted
   * reliably, so S-OS uses the key Windows itself assigns to "cycle panes".
   * It is listed in the keyboard shortcuts panel, because an undiscoverable
   * shortcut may as well not exist.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'F6') return;
      event.preventDefault();
      cycleFocus(event.shiftKey ? -1 : 1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cycleFocus]);

  return (
    <>
      {creationOrder.map((id) => {
        const instance = windows[id];
        if (!instance || instance.state === 'minimised') return null;

        return <OSWindow key={id} instance={instance} isFocused={focusedId === id} />;
      })}
    </>
  );
}

/** Reads the taskbar height from the design tokens, so the value is not
 *  duplicated between CSS and TypeScript. */
function readTaskbarHeight(): number {
  if (typeof window === 'undefined') return 44;

  const value = getComputedStyle(document.documentElement).getPropertyValue(
    '--sos-taskbar-height',
  );
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 44;
}
