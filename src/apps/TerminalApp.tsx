'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils/cn';
import { buildFileSystem } from '@/lib/content/filesystem';
import { banner, commonPrefix, complete, execute, prompt } from '@/lib/terminal/session';
import type { OutputLine, TerminalEffect } from '@/lib/terminal/types';
import { useWindowStore } from '@/stores/windowStore';
import type { AppProps } from '@/os/registry/applications';

const LINE_TONE: Record<OutputLine['kind'], string> = {
  input: 'text-primary',
  output: 'text-secondary',
  accent: 'text-accent-300',
  error: 'text-status-danger',
  muted: 'text-muted',
};

/** Cap the scrollback. An unbounded log is a slow memory leak in a window a
 *  visitor might leave open, and nobody scrolls back two thousand lines. */
const MAX_LINES = 500;

/**
 * The S-OS Developer Console.
 *
 * All the interesting logic lives in lib/terminal, which is pure and tested
 * separately. This component does three things: render the scrollback, keep
 * the input focused, and apply the effects the interpreter returns.
 */
export function TerminalApp({ windowId }: AppProps) {
  const fs = useMemo(() => buildFileSystem(), []);

  const [lines, setLines] = useState<OutputLine[]>(() => [...banner()]);
  const [cwd, setCwd] = useState('C:');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openApp = useWindowStore((state) => state.openApp);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  // Keep the newest output in view.
  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [lines]);

  const append = (next: readonly OutputLine[]) => {
    setLines((current) => [...current, ...next].slice(-MAX_LINES));
  };

  const applyEffects = (effects: readonly TerminalEffect[]) => {
    for (const effect of effects) {
      switch (effect.type) {
        case 'open-app':
          openApp(effect.appId, effect.params ?? {});
          break;
        case 'open-url':
          window.open(effect.url, '_blank', 'noopener,noreferrer');
          break;
        case 'clear':
          setLines([]);
          break;
        case 'close':
          closeWindow(windowId);
          break;
      }
    }
  };

  const submit = () => {
    const raw = input;
    append([{ kind: 'input', text: `${prompt(cwd)} ${raw}` }]);

    const result = execute(raw, { cwd, fs });
    append(result.lines);
    if (result.cwd) setCwd(result.cwd);
    if (result.effects) applyEffects(result.effects);

    if (raw.trim()) setHistory((entries) => [...entries, raw]);
    setHistoryIndex(null);
    setInput('');
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
      return;
    }

    // Tab completes as far as every candidate agrees, then lists the options —
    // what a real shell does. Completing to the first match would be
    // confidently wrong most of the time.
    if (event.key === 'Tab') {
      event.preventDefault();
      const candidates = complete(input, { cwd, fs });
      if (candidates.length === 0) return;

      const tokens = input.split(/\s+/);
      const prefix = commonPrefix(candidates);

      if (candidates.length === 1 || prefix.length > (tokens.at(-1)?.length ?? 0)) {
        const completed = candidates.length === 1 ? (candidates[0] ?? '') : prefix;
        tokens[tokens.length - 1] = completed;
        setInput(tokens.join(' ') + (candidates.length === 1 ? ' ' : ''));
        return;
      }

      append([
        { kind: 'input', text: `${prompt(cwd)} ${input}` },
        { kind: 'muted', text: `  ${candidates.join('   ')}` },
      ]);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (history.length === 0) return;
      event.preventDefault();

      const nextIndex =
        event.key === 'ArrowUp'
          ? Math.max(0, (historyIndex ?? history.length) - 1)
          : Math.min(history.length, (historyIndex ?? history.length) + 1);

      setHistoryIndex(nextIndex);
      setInput(nextIndex >= history.length ? '' : (history[nextIndex] ?? ''));
      return;
    }

    // Ctrl+L clears, Ctrl+C abandons the current line — both muscle memory.
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setLines([]);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      append([{ kind: 'input', text: `${prompt(cwd)} ${input}^C` }]);
      setInput('');
    }
  };

  return (
    <div
      className="bg-inset flex h-full flex-col font-mono text-[12.5px] leading-relaxed"
      // Clicking anywhere in the terminal focuses the input, as a terminal
      // should. The input itself is a real field, so this is a convenience
      // rather than the only way in.
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-3">
        {/* The scrollback is a log: polite live region so a screen reader
            announces command output without interrupting. */}
        <div aria-live="polite" aria-atomic="false">
          {lines.map((entry, index) => (
            <p
              key={`${index}-${entry.text}`}
              className={cn('break-words whitespace-pre-wrap', LINE_TONE[entry.kind])}
            >
              {entry.text || ' '}
            </p>
          ))}
        </div>

        <div className="flex items-baseline gap-2">
          <label htmlFor={`terminal-input-${windowId}`} className="text-accent-300 shrink-0">
            {prompt(cwd)}
          </label>
          <input
            id={`terminal-input-${windowId}`}
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal input"
            // A terminal exists to be typed into, and the window manager has
            // already moved focus to this window — so taking it from the
            // window body to the prompt is what the visitor expects.
            autoFocus
            className="text-primary min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
