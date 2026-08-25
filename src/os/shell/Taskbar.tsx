'use client';

import { useEffect, useRef, useState } from 'react';
import { SosMark } from '@/components/brand';
import { ProgramIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { applications, getApp } from '@/os/registry/applications';
import { useWindowStore } from '@/stores/windowStore';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';

/**
 * The S-OS taskbar.
 *
 * The behaviour that matters is the running-window button: clicking it must
 * restore a minimised window, minimise the focused one, and bring anything
 * else forward. Getting those three cases wrong is the most immediately
 * noticeable bug a taskbar can have, and the logic lives in the window store
 * where it is unit tested rather than in this component.
 */
export function Taskbar() {
  const windows = useWindowStore((state) => state.windows);
  const creationOrder = useWindowStore((state) => state.creationOrder);
  const focusedId = useWindowStore((state) => state.focusedId);
  const openApp = useWindowStore((state) => state.openApp);
  const toggleFromTaskbar = useWindowStore((state) => state.toggleFromTaskbar);

  const pinned = applications.filter((app) => app.pinned === true);
  const running = creationOrder.map((id) => windows[id]).filter((entry) => entry !== undefined);

  return (
    // A landmark, not a div. The taskbar is the shell's persistent navigation
    // and the target of the skip link, and a bare div is neither announced nor
    // reachable by landmark navigation.
    //
    // tabIndex={-1} is what actually makes the skip link work: browsers only
    // move focus to a fragment target that can hold focus, so without it
    // "Skip to taskbar" scrolls and then leaves the keyboard back at the top.
    <nav
      id="sos-taskbar"
      tabIndex={-1}
      aria-label="Taskbar"
      data-focus-custom
      className="bg-taskbar border-glass-border absolute inset-x-0 bottom-0 flex h-(--sos-taskbar-height) items-center gap-1 border-t px-1.5 outline-none backdrop-blur-(--sos-glass-blur)"
      style={{ zIndex: 'var(--sos-z-taskbar)' }}
    >
      <StartButton />

      <div className="bg-glass-border mx-1 h-6 w-px" aria-hidden="true" />

      <div role="group" aria-label="Pinned programs" className="flex items-center gap-0.5">
        {pinned.map((app) => (
          <button
            key={app.id}
            type="button"
            title={app.name}
            aria-label={`Open ${app.name}`}
            onClick={() => openApp(app.id)}
            className="hover:bg-glass-strong flex size-9 items-center justify-center rounded-sm transition-colors"
          >
            <ProgramIcon icon={app.icon} size={20} />
          </button>
        ))}
      </div>

      <div className="bg-glass-border mx-1 h-6 w-px" aria-hidden="true" />

      <div
        role="group"
        aria-label="Open windows"
        className="flex min-w-0 flex-1 items-center gap-1"
      >
        {running.map((instance) => {
          const isFocused = focusedId === instance.id;
          const isMinimised = instance.state === 'minimised';

          return (
            <button
              key={instance.id}
              type="button"
              onClick={() => toggleFromTaskbar(instance.id)}
              // aria-pressed communicates the focused state to a screen reader,
              // which cannot see the highlight or the underline.
              aria-pressed={isFocused}
              className={cn(
                'flex h-9 max-w-52 min-w-0 flex-1 items-center gap-2 rounded-sm px-2.5 text-left',
                'border-b-2 transition-colors duration-(--sos-duration-fast)',
                isFocused
                  ? 'bg-glass-active border-accent-400'
                  : isMinimised
                    ? 'hover:bg-glass border-transparent bg-transparent opacity-65'
                    : 'bg-glass border-glass-border-strong hover:bg-glass-strong',
              )}
            >
              <ProgramIcon icon={instance.icon} size={16} />
              <span className="truncate text-[12px]">{instance.title}</span>
              {isMinimised ? <span className="sr-only">(minimised)</span> : null}
            </button>
          );
        })}
      </div>

      <SystemTray />
      <ShowDesktopButton />
    </nav>
  );
}

/**
 * The Start button and its menu.
 *
 * The button owns only the open state and the two ways anyone expects to
 * dismiss a menu — clicking away, and Escape. Everything inside is the
 * StartMenu's business.
 */
function StartButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Focus returns to the button that opened the menu, rather than being
      // dropped on the body where the next Tab starts from the top of the page.
      buttonRef.current?.focus();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Ctrl+Escape opens Start, as it does on Windows.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key !== 'Escape') return;
      event.preventDefault();
      setOpen((value) => !value);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Start"
        className={cn(
          'flex h-9 items-center gap-2 rounded-sm px-2.5 transition-colors',
          open ? 'bg-glass-active' : 'hover:bg-glass-strong',
        )}
      >
        <SosMark size={20} />
        <span className="text-[12.5px] font-medium">Start</span>
      </button>

      {open ? <StartMenu onDismiss={() => setOpen(false)} /> : null}
    </div>
  );
}

/** The sliver at the far right of a Windows taskbar. Minimises everything, and
 *  restores it if nothing has changed since. */
function ShowDesktopButton() {
  const windows = useWindowStore((state) => state.windows);
  const minimise = useWindowStore((state) => state.minimise);
  const restore = useWindowStore((state) => state.restore);
  const lastMinimised = useRef<string[]>([]);

  const onClick = () => {
    const visible = Object.values(windows).filter((entry) => entry.state !== 'minimised');

    if (visible.length > 0) {
      lastMinimised.current = visible.map((entry) => entry.id);
      visible.forEach((entry) => minimise(entry.id));
      return;
    }

    lastMinimised.current.forEach((id) => restore(id));
    lastMinimised.current = [];
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Show desktop"
      title="Show desktop"
      className="border-glass-border hover:bg-glass-strong ml-1 h-9 w-3 rounded-xs border-l transition-colors"
    />
  );
}

/** Exported for the tests, which assert the registry and taskbar agree. */
export function getPinnedApps() {
  return applications.filter((app) => app.pinned === true).map((app) => getApp(app.id));
}
