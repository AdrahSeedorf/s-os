'use client';

import { useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Search } from 'lucide-react';
import { ProgramIcon } from '@/components/icons';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  buildFileSystem,
  getBreadcrumbs,
  listChildren,
  parentPath,
  toDisplayPath,
} from '@/lib/content/filesystem';
import { openFsNode } from '@/os/shell/openTarget';
import type { AppProps } from '@/os/registry/applications';
import type { FsNode } from '@/types/filesystem';

const ROOT = 'C:';

/** "3 items", or "1 item of 3" while a filter is narrowing the list. */
function describeCount(shown: number, total: number, filter: string): string {
  const noun = shown === 1 ? 'item' : 'items';
  return filter.trim() && shown !== total ? `${shown} ${noun} of ${total}` : `${shown} ${noun}`;
}

/**
 * File Explorer.
 *
 * Also serves as My Computer and as the Documents window — those are not
 * separate applications, only Explorer opened at a different path. Building
 * three windows that each duplicate a tree, a breadcrumb and a content pane
 * would have been three times the code and three places for the behaviour to
 * diverge.
 *
 * Everything shown comes from the virtual filesystem, which is derived from
 * the content registry — so a project added to the registry appears here with
 * no change to this file.
 */
export function ExplorerApp({ params }: AppProps) {
  const fs = useMemo(() => buildFileSystem(), []);

  const initialPath = params['path'] && fs.index.has(params['path']) ? params['path'] : ROOT;

  // History is kept as a stack with a cursor, exactly like a browser: going
  // back then navigating somewhere new discards the forward entries.
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [cursor, setCursor] = useState(0);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const listRef = useRef<HTMLUListElement>(null);
  const path = history[cursor] ?? ROOT;

  const navigate = (next: string) => {
    if (next === path || !fs.index.has(next)) return;

    setHistory((entries) => [...entries.slice(0, cursor + 1), next]);
    setCursor((value) => value + 1);
    setFilter('');
    setSelected(null);
  };

  const children = listChildren(fs, path);
  const visible = filter.trim()
    ? children.filter((node) => node.name.toLowerCase().includes(filter.trim().toLowerCase()))
    : children;

  const open = (node: FsNode) => {
    openFsNode(node, { onNavigate: navigate });
  };

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const index = visible.findIndex((node) => node.path === selected);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = Math.min(visible.length - 1, Math.max(0, index + delta));
      const next = visible[nextIndex];

      if (next) {
        setSelected(next.path);
        listRef.current
          ?.querySelector<HTMLButtonElement>(`[data-node-path="${CSS.escape(next.path)}"]`)
          ?.focus();
      }
      return;
    }

    // Backspace goes up a level, as it does in Windows Explorer.
    if (event.key === 'Backspace') {
      event.preventDefault();
      const up = parentPath(path);
      if (up) navigate(up);
    }
  };

  const upPath = parentPath(path);

  return (
    <div className="flex h-full flex-col">
      <header className="border-glass-border flex shrink-0 items-center gap-1.5 border-b px-2 py-1.5">
        <IconButton
          label="Back"
          variant="chrome"
          size="sm"
          disabled={cursor === 0}
          onClick={() => setCursor((value) => Math.max(0, value - 1))}
        >
          <ArrowLeft size={15} />
        </IconButton>

        <IconButton
          label="Forward"
          variant="chrome"
          size="sm"
          disabled={cursor >= history.length - 1}
          onClick={() => setCursor((value) => Math.min(history.length - 1, value + 1))}
        >
          <ArrowRight size={15} />
        </IconButton>

        <IconButton
          label="Up one level"
          variant="chrome"
          size="sm"
          disabled={upPath === undefined}
          onClick={() => upPath && navigate(upPath)}
        >
          <ArrowUp size={15} />
        </IconButton>

        {/* The address bar is a breadcrumb of buttons rather than a text
            field: nobody is going to type a path into a fictional filesystem,
            but jumping back two levels is genuinely useful. */}
        <nav
          aria-label="Location"
          className="sos-inset ml-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto rounded-sm px-2 py-1"
        >
          {getBreadcrumbs(fs, path).map((node, index) => (
            <span key={node.path} className="flex shrink-0 items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="text-disabled px-0.5 text-[11px]">
                  \
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => navigate(node.path)}
                className="text-secondary hover:text-primary rounded-xs px-1 py-0.5 font-mono text-[11.5px] transition-colors"
              >
                {node.name}
              </button>
            </span>
          ))}
        </nav>

        <div className="relative w-40 shrink-0">
          <Search
            size={13}
            aria-hidden="true"
            className="text-disabled pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
          />
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter"
            aria-label={`Filter items in ${toDisplayPath(path)}`}
            className="sos-inset text-primary placeholder:text-disabled h-7 w-full rounded-sm pr-2 pl-7 text-[11.5px]"
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Drives"
          className="border-glass-border w-44 shrink-0 overflow-auto border-r p-1.5"
        >
          <ul className="flex flex-col gap-0.5">
            {fs.drives.map((drive) => (
              <li key={drive.id}>
                <button
                  type="button"
                  onClick={() => navigate(drive.path)}
                  aria-current={path.startsWith(drive.path) ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors',
                    path.startsWith(drive.path) ? 'bg-glass-active' : 'hover:bg-glass',
                  )}
                >
                  <ProgramIcon icon={drive.icon} size={16} />
                  <span className="truncate text-[11.5px]">{drive.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 overflow-auto p-2">
          {visible.length === 0 ? (
            <p className="text-muted p-6 text-center text-[12.5px]">
              {filter.trim() ? `Nothing here matches “${filter}”.` : 'This folder is empty.'}
            </p>
          ) : (
            <ul
              ref={listRef}
              onKeyDown={onListKeyDown}
              aria-label={`Contents of ${toDisplayPath(path)}`}
              className="flex flex-col"
            >
              {visible.map((node) => (
                <li key={node.path}>
                  <button
                    type="button"
                    data-node-path={node.path}
                    tabIndex={node.path === selected || selected === null ? 0 : -1}
                    onClick={() => setSelected(node.path)}
                    onFocus={() => setSelected(node.path)}
                    onDoubleClick={() => open(node)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        open(node);
                      }
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-left transition-colors',
                      node.path === selected ? 'bg-accent-500/22' : 'hover:bg-glass',
                    )}
                  >
                    <ProgramIcon icon={node.icon} size={20} />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px]">{node.name}</span>
                      {node.description ? (
                        <span className="text-muted block truncate text-[11px]">
                          {node.description}
                        </span>
                      ) : null}
                    </span>

                    {node.kind === 'file' && node.sizeLabel ? (
                      <span className="text-disabled shrink-0 font-mono text-[11px]">
                        {node.sizeLabel}
                      </span>
                    ) : (
                      <span className="text-disabled shrink-0 text-[11px]">
                        {node.kind === 'file'
                          ? ''
                          : `${listChildren(fs, node.path).length} items`}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {/* One string per cell rather than interpolated fragments: split text
          nodes are awkward to assert on and are read out disjointedly by some
          screen readers. */}
      <footer className="border-glass-border text-muted flex shrink-0 items-center justify-between gap-3 border-t px-3 py-1.5 text-[11px]">
        <span>{describeCount(visible.length, children.length, filter)}</span>
        <span className="font-mono">{toDisplayPath(path)}</span>
      </footer>
    </div>
  );
}
