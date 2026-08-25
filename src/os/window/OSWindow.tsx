'use client';

import {
  Suspense,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Maximize2, Minus, Square, X } from 'lucide-react';
import { ProgramIcon } from '@/components/icons';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { getApp } from '@/os/registry/applications';
import { useWindowStore } from '@/stores/windowStore';
import type { ResizeEdge, WindowInstance } from '@/types/window';
import { zIndexFor } from './windowStack';
import { useWindowGesture } from './useWindowGesture';
import { useSound } from '@/lib/audio/useSound';

/** How far the arrow keys move or resize a window per press. */
const KEYBOARD_STEP = 16;
const KEYBOARD_STEP_LARGE = 64;

const RESIZE_HANDLES: readonly { edge: ResizeEdge; className: string; cursor: string }[] = [
  { edge: 'n', className: 'top-0 left-2 right-2 h-1.5', cursor: 'cursor-ns-resize' },
  { edge: 's', className: 'bottom-0 left-2 right-2 h-1.5', cursor: 'cursor-ns-resize' },
  { edge: 'w', className: 'left-0 top-2 bottom-2 w-1.5', cursor: 'cursor-ew-resize' },
  { edge: 'e', className: 'right-0 top-2 bottom-2 w-1.5', cursor: 'cursor-ew-resize' },
  { edge: 'nw', className: 'top-0 left-0 size-3', cursor: 'cursor-nwse-resize' },
  { edge: 'ne', className: 'top-0 right-0 size-3', cursor: 'cursor-nesw-resize' },
  { edge: 'sw', className: 'bottom-0 left-0 size-3', cursor: 'cursor-nesw-resize' },
  { edge: 'se', className: 'bottom-0 right-0 size-3', cursor: 'cursor-nwse-resize' },
];

export interface OSWindowProps {
  instance: WindowInstance;
  isFocused: boolean;
}

/**
 * A single application window.
 *
 * Two things this deliberately does that most web "window" components skip:
 *
 *   1. It is a labelled dialog with managed focus, so a screen-reader user is
 *      told which program opened and lands inside it.
 *   2. It can be moved and resized entirely from the keyboard. Drag-only
 *      window management is the most common accessibility failure in an
 *      operating-system metaphor, and it is not a hard one to avoid.
 *
 * The application inside knows nothing about any of this — which is precisely
 * why the same components will render full-screen in the mobile shell.
 */
export function OSWindow({ instance, isFocused }: OSWindowProps) {
  const elementRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const sound = useSound();

  const order = useWindowStore((state) => state.order);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimise = useWindowStore((state) => state.minimise);
  const toggleMaximise = useWindowStore((state) => state.toggleMaximise);
  const moveBy = useWindowStore((state) => state.moveBy);
  const resizeBy = useWindowStore((state) => state.resizeBy);

  const app = getApp(instance.appId);
  const Body = app?.component;
  const isMaximised = instance.state === 'maximised';

  const { onDragStart, onResizeStart } = useWindowGesture({
    windowId: instance.id,
    elementRef,
    bounds: instance.bounds,
    constraints: instance.constraints,
    disabled: isMaximised,
  });

  // Mount only: a window announces its arrival once, not on every focus
  // change. Silent unless the visitor has turned sound on.
  useEffect(() => {
    sound('window-open');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- opening happens once
  }, []);

  /**
   * Keep real focus with the focused window.
   *
   * This runs on every change of `isFocused`, not just on mount. F6 cycling,
   * a taskbar click and the promotion that happens when the window above is
   * closed all move `focusedId` in the store — and without this the window
   * would *look* focused while the keyboard was still somewhere else
   * entirely, which is the worst of both worlds for a screen-reader user.
   *
   * The containment check is what stops it being obnoxious: if focus is
   * already inside, the user put it there, and stealing it back to the frame
   * would eject them from a text field on every re-render.
   */
  useEffect(() => {
    if (!isFocused) return;

    const element = elementRef.current;
    if (!element || element.contains(document.activeElement)) return;

    element.focus({ preventScroll: true });
  }, [isFocused]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const isTextEntry =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (event.key === 'Escape' && !isTextEntry) {
      event.preventDefault();
      sound('window-close');
      closeWindow(instance.id);
      return;
    }

    // Alt+arrows move the window; adding Shift resizes it. Alt is used because
    // arrows alone must stay available for scrolling the application inside.
    //
    // Text entry is exempt: Alt+Left and Alt+Right are word navigation in a
    // field on macOS, and silently moving the window instead would break the
    // Contact form and the terminal for anyone who edits by keyboard.
    if (isTextEntry) return;
    if (!event.altKey || !event.key.startsWith('Arrow')) return;
    if (isMaximised) return;

    event.preventDefault();
    const step = event.ctrlKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;

    const deltas: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };

    const delta = deltas[event.key];
    if (!delta) return;

    if (event.shiftKey) {
      resizeBy(instance.id, 'se', delta[0], delta[1]);
    } else {
      moveBy(instance.id, delta[0], delta[1]);
    }
  };

  return (
    <section
      ref={elementRef}
      role="dialog"
      aria-labelledby={titleId}
      // Not modal: several windows are open at once and the desktop behind
      // stays usable, so trapping focus would be a lie and a nuisance.
      aria-modal={false}
      tabIndex={-1}
      data-focus-custom
      data-window-id={instance.id}
      onPointerDown={() => focusWindow(instance.id)}
      onKeyDown={onKeyDown}
      style={{
        left: instance.bounds.x,
        top: instance.bounds.y,
        width: instance.bounds.width,
        height: instance.bounds.height,
        zIndex: zIndexFor(order, instance.id),
      }}
      className={cn(
        'absolute flex flex-col overflow-hidden rounded-(--sos-radius-window) outline-none',
        'motion-safe:animate-[sos-window-open_var(--sos-duration-normal)_var(--ease-out-os)]',
        isFocused
          ? 'bg-chrome shadow-window-focused border-glass-border-strong border'
          : 'bg-chrome-inactive shadow-window border-glass-border border',
        'backdrop-blur-(--sos-glass-blur)',
      )}
    >
      <header
        onPointerDown={onDragStart}
        onDoubleClick={() => {
          if (!instance.constraints.maximisable) return;
          sound(isMaximised ? 'window-minimise' : 'window-maximise');
          toggleMaximise(instance.id);
        }}
        className={cn(
          'flex h-(--sos-titlebar-height) shrink-0 items-center gap-2 pr-1 pl-2.5 select-none',
          'border-glass-border border-b',
          isMaximised ? '' : 'cursor-grab active:cursor-grabbing',
          isFocused ? 'bg-glass-strong' : 'bg-glass',
        )}
      >
        <ProgramIcon icon={instance.icon} size={16} />

        <h2
          id={titleId}
          className={cn(
            'flex-1 truncate text-[12.5px] font-medium',
            isFocused ? 'text-primary' : 'text-muted',
          )}
        >
          {instance.title}
        </h2>

        <div className="flex items-center gap-0.5">
          <IconButton
            label={`Minimise ${instance.title}`}
            variant="chrome"
            size="sm"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              sound('window-minimise');
              minimise(instance.id);
            }}
          >
            <Minus size={13} />
          </IconButton>

          {instance.constraints.maximisable ? (
            <IconButton
              label={`${isMaximised ? 'Restore' : 'Maximise'} ${instance.title}`}
              variant="chrome"
              size="sm"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => {
                sound(isMaximised ? 'window-minimise' : 'window-maximise');
                toggleMaximise(instance.id);
              }}
            >
              {isMaximised ? <Square size={11} /> : <Maximize2 size={11} />}
            </IconButton>
          ) : null}

          <IconButton
            label={`Close ${instance.title}`}
            variant="danger"
            size="sm"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              sound('window-close');
              closeWindow(instance.id);
            }}
          >
            <X size={13} />
          </IconButton>
        </div>
      </header>

      <div className="bg-app min-h-0 flex-1 overflow-auto">
        {Body ? (
          // Each application is its own chunk, so opening a window may need a
          // network round trip. The boundary is per window rather than global:
          // one program loading must never blank a program already open.
          <Suspense fallback={<AppLoading title={instance.title} />}>
            <Body windowId={instance.id} params={instance.params} />
          </Suspense>
        ) : (
          <p className="text-muted p-6 text-[13px]">This program failed to start.</p>
        )}
      </div>

      {instance.constraints.resizable && !isMaximised
        ? RESIZE_HANDLES.map((handle) => (
            <div
              key={handle.edge}
              onPointerDown={onResizeStart(handle.edge)}
              className={cn('absolute z-10', handle.className, handle.cursor)}
              // Keyboard users resize with Alt+Shift+arrows instead; exposing
              // eight unlabelled drag targets to a screen reader would be noise.
              aria-hidden="true"
            />
          ))
        : null}
    </section>
  );
}

/**
 * Shown while an application's chunk is in flight.
 *
 * A live region rather than a silent spinner: a screen-reader user gets told
 * the program is starting, instead of landing in an empty dialog and being
 * left to guess whether anything happened.
 */
function AppLoading({ title }: { title: string }) {
  return (
    <div role="status" className="flex h-full items-center justify-center p-8">
      <p className="text-muted text-[12.5px]">Starting {title}…</p>
    </div>
  );
}
