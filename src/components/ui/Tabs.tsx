'use client';

import { useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabDefinition {
  id: string;
  label: string;
  /** Hidden entirely when false — used to drop sections a project has no
   *  content for, rather than showing an empty tab. */
  available?: boolean;
  content: ReactNode;
}

export interface TabsProps {
  tabs: readonly TabDefinition[];
  activeId: string;
  onChange: (id: string) => void;
  label: string;
}

/**
 * A tab list following the WAI-ARIA tabs pattern.
 *
 * The part people usually miss is keyboard behaviour: the tab list is a single
 * tab stop, and Left/Right move between tabs with Home and End jumping to the
 * ends. Making every tab its own tab stop technically works and makes a
 * ten-tab interface miserable to get past.
 */
export function Tabs({ tabs, activeId, onChange, label }: TabsProps) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const visible = tabs.filter((tab) => tab.available !== false);
  const active = visible.find((tab) => tab.id === activeId) ?? visible[0];

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const currentIndex = visible.findIndex((tab) => tab.id === active?.id);
    if (currentIndex === -1) return;

    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let nextIndex: number | null = null;

    if (event.key in moves) {
      nextIndex = (currentIndex + (moves[event.key] ?? 0) + visible.length) % visible.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = visible.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const next = visible[nextIndex];
    if (!next) return;

    onChange(next.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tab-id="${CSS.escape(next.id)}"]`)
      ?.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="border-glass-border flex shrink-0 gap-0.5 overflow-x-auto border-b px-3"
      >
        {visible.map((tab) => {
          const isActive = tab.id === active?.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2 text-[12.5px] whitespace-nowrap transition-colors',
                isActive
                  ? 'border-accent-400 text-primary'
                  : 'text-muted hover:text-secondary border-transparent',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${active.id}`}
          aria-labelledby={`${baseId}-tab-${active.id}`}
          tabIndex={0}
          className="min-h-0 flex-1 overflow-auto"
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
