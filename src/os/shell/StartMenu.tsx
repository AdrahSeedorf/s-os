'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { ChevronRight, LogOut, Power, RotateCcw, Search } from 'lucide-react';
import { ProgramIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { getProfile } from '@/lib/content';
import { SEARCH_KIND_LABEL, searchGrouped } from '@/lib/search';
import { applications } from '@/os/registry/applications';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { getProgramGroups } from './allPrograms';

interface LaunchTarget {
  appId: string;
  params?: Record<string, string> | undefined;
}

/**
 * The S-OS Start menu.
 *
 * Two views in one panel: the default list of pinned programs and All
 * Programs, and — the moment anything is typed — search results across every
 * kind of content. Typing is the fastest route to anything in the system, so
 * the field takes focus as soon as the menu opens.
 */
export function StartMenu({ onDismiss }: { onDismiss: () => void }) {
  const profile = getProfile();
  const openApp = useWindowStore((state) => state.openApp);

  const logOff = useSystemStore((state) => state.logOff);
  const restart = useSystemStore((state) => state.restart);
  const shutdown = useSystemStore((state) => state.shutdown);

  const [query, setQuery] = useState('');
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => searchGrouped(query, { limit: 14 }), [query]);
  const flatResults = useMemo(() => groups.flatMap((group) => group.results), [groups]);
  const isSearching = query.trim().length > 0;

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Reset the highlighted result when the query changes, adjusted during
  // render rather than in an effect. An effect would render the stale
  // selection first and correct it immediately afterwards — a wasted pass, and
  // a visible flicker of the wrong row being highlighted.
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  const launch = (target: LaunchTarget) => {
    openApp(target.appId, target.params ?? {});
    onDismiss();
  };

  // Arrow keys walk the results while focus stays in the search field, which
  // is how every OS launcher behaves and what anyone typing expects.
  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!isSearching || flatResults.length === 0) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + delta + flatResults.length) % flatResults.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const result = flatResults[activeIndex];
      if (result) launch({ appId: result.appId, params: result.params });
    }
  };

  return (
    <div
      className="sos-menu absolute bottom-[calc(100%+8px)] left-0 flex max-h-[min(78vh,660px)] w-[min(92vw,26rem)] flex-col overflow-hidden rounded-md"
      role="dialog"
      aria-label="Start menu"
    >
      <header className="border-glass-border flex items-center gap-3 border-b px-4 py-3">
        <div className="border-accent-400/40 bg-accent-800/50 flex size-10 items-center justify-center rounded-full border">
          <ProgramIcon icon="about" size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">{profile.displayName}</p>
          <p className="text-muted truncate text-[11px]">{profile.title}</p>
        </div>
      </header>

      <div className="border-glass-border border-b p-2.5">
        <div className="relative">
          <Search
            size={14}
            aria-hidden="true"
            className="text-disabled pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search programs, projects and skills…"
            aria-label="Search S-OS"
            aria-controls="sos-start-results"
            className="sos-inset text-primary placeholder:text-disabled focus:border-accent-500/70 h-9 w-full rounded-sm pr-3 pl-8 text-[12.5px]"
          />
        </div>
      </div>

      <div id="sos-start-results" className="min-h-0 flex-1 overflow-auto p-2">
        {isSearching ? (
          flatResults.length === 0 ? (
            <p className="text-muted px-2 py-6 text-center text-[12px]">
              Nothing matches “{query}”.
            </p>
          ) : (
            groups.map((group) => (
              <section key={group.kind} className="mb-2">
                <h3 className="text-disabled px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {SEARCH_KIND_LABEL[group.kind]}
                </h3>
                <ul>
                  {group.results.map((result) => {
                    const index = flatResults.indexOf(result);
                    return (
                      <li key={result.id}>
                        <MenuRow
                          icon={result.icon}
                          label={result.title}
                          description={result.subtitle}
                          active={index === activeIndex}
                          onSelect={() =>
                            launch({ appId: result.appId, params: result.params })
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )
        ) : showAllPrograms ? (
          <AllPrograms onLaunch={launch} onBack={() => setShowAllPrograms(false)} />
        ) : (
          <PinnedPrograms onLaunch={launch} onShowAll={() => setShowAllPrograms(true)} />
        )}
      </div>

      <footer className="border-glass-border flex items-center justify-between gap-1 border-t px-2 py-2">
        <PowerAction label="Log off" onSelect={logOff}>
          <LogOut size={14} />
        </PowerAction>
        <PowerAction label="Restart" onSelect={restart}>
          <RotateCcw size={14} />
        </PowerAction>
        <PowerAction label="Shut down" onSelect={shutdown}>
          <Power size={14} />
        </PowerAction>
      </footer>
    </div>
  );
}

function PinnedPrograms({
  onLaunch,
  onShowAll,
}: {
  onLaunch: (target: LaunchTarget) => void;
  onShowAll: () => void;
}) {
  const pinned = applications.filter(
    (app) => app.desktopShortcut === true || app.pinned === true,
  );

  return (
    <div>
      <ul>
        {pinned.map((app) => (
          <li key={app.id}>
            <MenuRow
              icon={app.icon}
              label={app.name}
              description={app.description}
              onSelect={() => onLaunch({ appId: app.id })}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onShowAll}
        className="hover:bg-glass-strong mt-1 flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left transition-colors"
      >
        <span className="text-[12.5px] font-medium">All Programs</span>
        <ChevronRight size={14} aria-hidden="true" className="text-muted" />
      </button>
    </div>
  );
}

function AllPrograms({
  onLaunch,
  onBack,
}: {
  onLaunch: (target: LaunchTarget) => void;
  onBack: () => void;
}) {
  const groups = getProgramGroups();

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="hover:bg-glass-strong mb-1 flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left transition-colors"
      >
        <ChevronRight size={14} aria-hidden="true" className="text-muted rotate-180" />
        <span className="text-[12.5px] font-medium">Back</span>
      </button>

      {groups.map((group) => (
        <section key={group.key} className="mb-2">
          <h3 className="text-disabled px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
            {group.label}
          </h3>
          <ul>
            {group.entries.map((entry) => (
              <li key={entry.key}>
                <MenuRow
                  icon={entry.icon}
                  label={entry.label}
                  description={entry.description}
                  onSelect={() => onLaunch({ appId: entry.appId, params: entry.params })}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function MenuRow({
  icon,
  label,
  description,
  active = false,
  onSelect,
}: {
  icon: string;
  label: string;
  description: string;
  active?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? true : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-left transition-colors',
        active ? 'bg-accent-600/35' : 'hover:bg-glass-strong',
      )}
    >
      <ProgramIcon icon={icon} size={20} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[12.5px]">{label}</span>
        <span className="text-muted truncate text-[11px]">{description}</span>
      </span>
    </button>
  );
}

function PowerAction({
  label,
  onSelect,
  children,
}: {
  label: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-muted hover:bg-glass-strong hover:text-primary flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-[11.5px] transition-colors"
    >
      <span aria-hidden="true">{children}</span>
      {label}
    </button>
  );
}
