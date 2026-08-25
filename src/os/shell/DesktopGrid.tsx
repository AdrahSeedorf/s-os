'use client';

import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ProgramIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { useWindowStore } from '@/stores/windowStore';
import { getDesktopItems, type DesktopItem } from './desktopItems';

/**
 * The desktop icon grid.
 *
 * Behaves like a real desktop — single click selects, double click opens —
 * while remaining fully operable from the keyboard, which is where most
 * desktop metaphors on the web fall down.
 *
 * Uses a roving tabindex: the grid holds one tab stop, and the arrow keys move
 * between icons within it. Giving fourteen icons fourteen tab stops would mean
 * a keyboard visitor has to press Tab fourteen times to reach the taskbar.
 */
export function DesktopGrid() {
  const items = getDesktopItems();
  const openApp = useWindowStore((state) => state.openApp);

  const [selectedKey, setSelectedKey] = useState<string | null>(items[0]?.key ?? null);
  const containerRef = useRef<HTMLUListElement>(null);

  const open = (item: DesktopItem) => {
    openApp(item.appId, item.params ?? {});
  };

  const focusItem = (key: string) => {
    setSelectedKey(key);
    const element = containerRef.current?.querySelector<HTMLButtonElement>(
      `[data-item-key="${CSS.escape(key)}"]`,
    );
    element?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const currentIndex = items.findIndex((item) => item.key === selectedKey);
    if (currentIndex === -1) return;

    // The grid flows top-to-bottom in columns, like a real desktop, so
    // ArrowDown is the "next item" direction and ArrowRight jumps a column.
    const columnLength = countRows(containerRef.current);

    const moves: Record<string, number> = {
      ArrowDown: 1,
      ArrowUp: -1,
      ArrowRight: columnLength,
      ArrowLeft: -columnLength,
    };

    const delta = moves[event.key];
    if (delta === undefined) return;

    event.preventDefault();
    const nextIndex = Math.min(items.length - 1, Math.max(0, currentIndex + delta));
    const next = items[nextIndex];
    if (next) focusItem(next.key);
  };

  return (
    <ul
      ref={containerRef}
      onKeyDown={onKeyDown}
      data-desktop-grid
      aria-label="Desktop"
      className="absolute inset-0 grid w-fit auto-cols-max grid-flow-col content-start gap-1 p-3"
      style={{ gridTemplateRows: 'repeat(auto-fill, minmax(92px, max-content))' }}
    >
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            data-item-key={item.key}
            // Roving tabindex: only the selected icon is a tab stop.
            tabIndex={item.key === selectedKey ? 0 : -1}
            aria-describedby={`${item.key}-description`}
            onClick={() => setSelectedKey(item.key)}
            onDoubleClick={() => open(item)}
            onFocus={() => setSelectedKey(item.key)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open(item);
              }
            }}
            className={cn(
              'flex w-[86px] flex-col items-center gap-1.5 rounded-sm px-1.5 py-2 text-center',
              'transition-colors duration-(--sos-duration-fast)',
              item.key === selectedKey
                ? 'bg-accent-500/22 ring-accent-400/45 ring-1'
                : 'hover:bg-glass',
            )}
          >
            <ProgramIcon icon={item.icon} size={38} />
            <span
              className={cn(
                'text-[11px] leading-tight break-words',
                // Icon labels sit directly on the wallpaper, so they carry
                // their own shadow rather than relying on it staying dark.
                'text-primary [text-shadow:0_1px_3px_rgb(0_0_0/0.85)]',
              )}
            >
              {item.label}
            </span>
            <span id={`${item.key}-description`} className="sr-only">
              {item.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** How many icons fit in a column, so ArrowRight moves a full column across.
 *  Measured rather than assumed, because it depends on the viewport height. */
function countRows(container: HTMLElement | null): number {
  if (!container) return 1;

  const rows = getComputedStyle(container).gridTemplateRows.split(' ').length;
  return Math.max(1, rows);
}
