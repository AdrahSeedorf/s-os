'use client';

import { useEffect } from 'react';
import { Wallpaper } from '@/components/brand';
import { ProgramIcon } from '@/components/icons';
import { Badge } from '@/components/ui';
import { BootManager } from '@/os/boot/BootManager';
import { SessionBar } from '@/os/boot/SessionBar';
import { getLaunchableApps } from '@/os/registry/applications';
import { WindowManager } from '@/os/window/WindowManager';
import { getProjects } from '@/lib/content';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';

/**
 * Milestone 4 review page.
 *
 * A temporary launcher over the wallpaper, so the window manager can be
 * exercised before the desktop and taskbar exist. Milestone 5 replaces the
 * launcher with real desktop icons and a taskbar.
 */
export default function SosPage() {
  return (
    <BootManager>
      <Desktop />
    </BootManager>
  );
}

function Desktop() {
  const openApp = useWindowStore((state) => state.openApp);
  const openWindows = useWindowStore((state) => state.creationOrder.length);
  const consumePendingApp = useSystemStore((state) => state.consumePendingApp);
  const projects = getProjects();

  // Recruiter Mode and deep links queue an application at login. The desktop
  // opens it once, on arrival.
  useEffect(() => {
    const pending = consumePendingApp();
    if (pending) openApp(pending);
  }, [consumePendingApp, openApp]);

  return (
    <div className="relative h-screen overflow-hidden">
      <Wallpaper />

      <div className="relative flex h-full flex-col gap-5 overflow-auto p-6 pb-16">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="dev" dot>
            Milestone 4
          </Badge>
          <p className="text-secondary text-[13px]">
            Window manager — drag the title bar, drag any edge, double-click to maximise.
          </p>
          <p className="text-disabled text-[12px]">
            Keyboard: <kbd className="font-mono">F6</kbd> cycles ·{' '}
            <kbd className="font-mono">Alt</kbd>+arrows moves ·{' '}
            <kbd className="font-mono">Alt</kbd>+<kbd className="font-mono">Shift</kbd>+arrows
            resizes · <kbd className="font-mono">Esc</kbd> closes
          </p>
        </div>

        <SessionBar />

        <section className="flex flex-col gap-2">
          <h2 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
            Programs · {openWindows} open
          </h2>
          <div className="flex flex-wrap gap-2">
            {getLaunchableApps().map((app) => (
              <LaunchTile
                key={app.id}
                icon={app.icon}
                label={app.name}
                onLaunch={() => openApp(app.id)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
            Installed projects
          </h2>
          <div className="flex flex-wrap gap-2">
            {projects.map((project) => (
              <LaunchTile
                key={project.id}
                icon={project.icon}
                label={project.executable}
                onLaunch={() => openApp('project', { projectId: project.id })}
              />
            ))}
          </div>
        </section>
      </div>

      <WindowManager />
    </div>
  );
}

function LaunchTile({
  icon,
  label,
  onLaunch,
}: {
  icon: string;
  label: string;
  onLaunch: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLaunch}
      className="sos-glass hover:bg-glass-strong flex w-28 flex-col items-center gap-2 rounded-md p-3 text-center transition-colors"
    >
      <ProgramIcon icon={icon} size={32} />
      <span className="text-secondary text-[11px] leading-tight break-words">{label}</span>
    </button>
  );
}
