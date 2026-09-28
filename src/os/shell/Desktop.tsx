'use client';

import { useEffect } from 'react';
import { Wallpaper } from '@/components/brand';
import { NotificationManager } from '@/os/notifications/NotificationManager';
import { WindowManager } from '@/os/window/WindowManager';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { DesktopGrid } from './DesktopGrid';
import { Taskbar } from './Taskbar';

/**
 * The S-OS desktop.
 *
 * Four layers, bottom to top: wallpaper, icon grid, windows, taskbar. The
 * ordering is enforced by the z-index scale in the design tokens rather than
 * by arbitrary numbers scattered through components, so shell chrome can never
 * end up underneath an application window.
 */
export function Desktop() {
  const openApp = useWindowStore((state) => state.openApp);
  const consumePendingApp = useSystemStore((state) => state.consumePendingApp);

  // Recruiter Mode and deep links queue an application during login. The
  // desktop opens it once, on arrival, then clears the queue.
  useEffect(() => {
    const pending = consumePendingApp();
    if (!pending) return;

    // Deep links may name either an application or a project.
    const opened = openApp(pending);
    if (opened === null) openApp('project', { projectId: pending });
  }, [consumePendingApp, openApp]);

  // h-full rather than h-screen: inside the monitor frame the viewport is
  // taller than the screen, and 100vh would push the taskbar behind the bezel.
  return (
    <div className="relative h-full overflow-hidden" data-shell="desktop">
      <Wallpaper />

      {/* The desktop's content is entirely dynamic, so without this the
          heading outline starts at the window titles and a screen-reader user
          navigating by heading has no idea what they are inside. Visually
          hidden because the wallpaper already says it to everyone else. */}
      <h1 className="sr-only">S-OS — Seedorf Obeng-Mireku</h1>

      {/* A skip link, because the desktop is a large interactive region and a
          keyboard visitor should be able to get past it. */}
      <a
        href="#sos-taskbar"
        className="focus:bg-accent-600 focus:text-primary sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-sm focus:px-3 focus:py-2 focus:text-[12px]"
      >
        Skip to taskbar
      </a>

      <main className="absolute inset-x-0 top-0 bottom-(--sos-taskbar-height)">
        <DesktopGrid />
        <WindowManager />
      </main>

      <Taskbar />

      <NotificationManager />
    </div>
  );
}
