'use client';

import { Suspense, useEffect, useState } from 'react';
import { ChevronLeft, Layers, X } from 'lucide-react';
import { Avatar, SosWordmark, Wallpaper } from '@/components/brand';
import { ProgramIcon } from '@/components/icons';
import { Badge, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { getProfile } from '@/lib/content';
import { AVAILABILITY_LABEL } from '@/types/content';
import { NotificationManager } from '@/os/notifications/NotificationManager';
import { applications, getApp } from '@/os/registry/applications';
import { getDesktopItems } from '@/os/shell/desktopItems';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { DOCK_APP_IDS } from './dockApps';

/**
 * S-OS Mobile.
 *
 * Not a shrunken desktop. Applications open full-screen, the Start menu
 * becomes a home grid, and the taskbar becomes a dock — the conventions people
 * already have on a phone.
 *
 * Crucially it runs on the *same window store* as the desktop. Every "open
 * this project" button written for the desktop already works here, because
 * launching is a store action and only the presentation differs. The mobile
 * shell simply renders the focused window full-screen instead of positioning
 * it, and the fact that applications never knew they were in a window is what
 * makes that a layout change rather than a rewrite.
 */
export function MobileShell() {
  const windows = useWindowStore((state) => state.windows);
  const creationOrder = useWindowStore((state) => state.creationOrder);
  const focusedId = useWindowStore((state) => state.focusedId);
  const openApp = useWindowStore((state) => state.openApp);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimise = useWindowStore((state) => state.minimise);

  const consumePendingApp = useSystemStore((state) => state.consumePendingApp);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    const pending = consumePendingApp();
    if (!pending) return;

    const opened = openApp(pending);
    if (opened === null) openApp('project', { projectId: pending });
  }, [consumePendingApp, openApp]);

  const active = focusedId ? windows[focusedId] : undefined;
  const activeVisible = active && active.state !== 'minimised' ? active : undefined;
  const openCount = creationOrder.length;

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden" data-shell="mobile">
      <Wallpaper />

      {activeVisible ? (
        <MobileAppView
          title={activeVisible.title}
          icon={activeVisible.icon}
          openCount={openCount}
          onBack={() => minimise(activeVisible.id)}
          onClose={() => closeWindow(activeVisible.id)}
          onSwitcher={() => setSwitcherOpen(true)}
        >
          <ActiveApp id={activeVisible.id} />
        </MobileAppView>
      ) : (
        <MobileHome
          onLaunch={openApp}
          openCount={openCount}
          onSwitcher={() => setSwitcherOpen(true)}
        />
      )}

      {switcherOpen ? (
        <AppSwitcher
          onDismiss={() => setSwitcherOpen(false)}
          onSelect={(id) => {
            focusWindow(id);
            setSwitcherOpen(false);
          }}
          onClose={closeWindow}
        />
      ) : null}

      <NotificationManager />
    </div>
  );
}

/** Renders the application component for a window, full-screen. */
function ActiveApp({ id }: { id: string }) {
  const instance = useWindowStore((state) => state.windows[id]);
  if (!instance) return null;

  const app = getApp(instance.appId);
  if (!app) return null;

  const Body = app.component;

  // Applications are code-split, so the mobile shell needs the same boundary
  // the desktop windows have.
  return (
    <Suspense
      fallback={
        <div role="status" className="flex h-full items-center justify-center p-8">
          <p className="text-muted text-[12.5px]">Starting {app.title}…</p>
        </div>
      }
    >
      <Body windowId={instance.id} params={instance.params} />
    </Suspense>
  );
}

function MobileAppView({
  title,
  icon,
  openCount,
  onBack,
  onClose,
  onSwitcher,
  children,
}: {
  title: string;
  icon: string;
  openCount: number;
  onBack: () => void;
  onClose: () => void;
  onSwitcher: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-app relative flex h-full flex-col">
      <header className="border-glass-border bg-chrome flex shrink-0 items-center gap-2 border-b px-2 py-2">
        <IconButton label="Back to home" variant="chrome" onClick={onBack}>
          <ChevronLeft size={20} />
        </IconButton>

        <ProgramIcon icon={icon} size={20} />
        <h1 className="min-w-0 flex-1 truncate text-[14px] font-medium">{title}</h1>

        {openCount > 1 ? (
          <IconButton
            label={`Switch app — ${openCount} open`}
            variant="chrome"
            onClick={onSwitcher}
          >
            <Layers size={18} />
          </IconButton>
        ) : null}

        <IconButton label={`Close ${title}`} variant="danger" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function MobileHome({
  onLaunch,
  openCount,
  onSwitcher,
}: {
  onLaunch: (appId: string, params?: Record<string, string>) => unknown;
  openCount: number;
  onSwitcher: () => void;
}) {
  const profile = getProfile();

  // The same derived list the desktop uses, plus everything else launchable —
  // a phone has no Start menu to fall back to, so the home grid has to hold
  // the full set rather than a curated few.
  const featured = getDesktopItems();
  const others = applications.filter(
    (app) =>
      app.hidden !== true &&
      !featured.some((item) => item.appId === app.id && item.params === undefined),
  );

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-3 px-5 pt-6 pb-4">
        <SosWordmark size="sm" />
        <div className="flex items-center gap-3.5">
          <div className="border-accent-400/40 size-14 shrink-0 overflow-hidden rounded-full border">
            <Avatar size={56} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[19px] font-semibold">{profile.name}</h1>
            <p className="text-accent-200 text-[13px]">{profile.title}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent" dot>
            {AVAILABILITY_LABEL[profile.availability]}
          </Badge>
          <Badge>{profile.location}</Badge>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
        <AppGrid
          items={featured.map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            onOpen: () => onLaunch(item.appId, item.params ?? {}),
          }))}
        />

        {others.length > 0 ? (
          <>
            <h2 className="text-muted px-1 pt-5 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
              All programs
            </h2>
            <AppGrid
              items={others.map((app) => ({
                key: app.id,
                label: app.name,
                icon: app.icon,
                onOpen: () => onLaunch(app.id, {}),
              }))}
            />
          </>
        ) : null}
      </div>

      <Dock onLaunch={onLaunch} openCount={openCount} onSwitcher={onSwitcher} />
    </div>
  );
}

function AppGrid({
  items,
}: {
  items: readonly { key: string; label: string; icon: string; onOpen: () => void }[];
}) {
  return (
    <ul className="grid grid-cols-4 gap-1 sm:grid-cols-5">
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            onClick={item.onOpen}
            className="active:bg-glass flex w-full flex-col items-center gap-1.5 rounded-md px-1 py-3 text-center transition-colors"
          >
            <ProgramIcon icon={item.icon} size={40} />
            <span className="text-primary text-[10.5px] leading-tight break-words [text-shadow:0_1px_3px_rgb(0_0_0/0.8)]">
              {item.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Dock({
  onLaunch,
  openCount,
  onSwitcher,
}: {
  onLaunch: (appId: string, params?: Record<string, string>) => unknown;
  openCount: number;
  onSwitcher: () => void;
}) {
  return (
    <nav
      aria-label="Dock"
      className="bg-taskbar border-glass-border flex shrink-0 items-center justify-around gap-1 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-(--sos-glass-blur)"
    >
      {DOCK_APP_IDS.map((id) => {
        const app = getApp(id);
        if (!app) return null;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onLaunch(id, {})}
            className="active:bg-glass flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 transition-colors"
          >
            <ProgramIcon icon={app.icon} size={26} />
            <span className="text-secondary text-[10px]">{app.name.split(' ')[0]}</span>
          </button>
        );
      })}

      {openCount > 0 ? (
        <button
          type="button"
          onClick={onSwitcher}
          className="active:bg-glass flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 transition-colors"
          aria-label={`Open apps — ${openCount}`}
        >
          <span className="relative">
            <Layers size={26} aria-hidden="true" className="text-accent-300" />
            <span className="bg-accent-500 text-inverse absolute -top-1 -right-1.5 rounded-full px-1 text-[9px] font-semibold">
              {openCount}
            </span>
          </span>
          <span className="text-secondary text-[10px]">Open</span>
        </button>
      ) : null}
    </nav>
  );
}

function AppSwitcher({
  onDismiss,
  onSelect,
  onClose,
}: {
  onDismiss: () => void;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const windows = useWindowStore((state) => state.windows);
  const creationOrder = useWindowStore((state) => state.creationOrder);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <div
      className="bg-void/70 absolute inset-0 flex flex-col justify-end"
      style={{ zIndex: 'var(--sos-z-start-menu)' }}
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-label="Open applications"
        className="sos-menu max-h-[70%] overflow-auto rounded-t-lg p-3"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-muted px-1 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
          Open applications
        </h2>

        <ul className="flex flex-col gap-1">
          {creationOrder.map((id) => {
            const instance = windows[id];
            if (!instance) return null;

            return (
              <li key={id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  className={cn(
                    'active:bg-glass-strong flex min-w-0 flex-1 items-center gap-2.5 rounded-sm px-2.5 py-2.5 text-left transition-colors',
                  )}
                >
                  <ProgramIcon icon={instance.icon} size={22} />
                  <span className="truncate text-[13px]">{instance.title}</span>
                </button>

                <IconButton
                  label={`Close ${instance.title}`}
                  variant="danger"
                  onClick={() => onClose(id)}
                >
                  <X size={16} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
