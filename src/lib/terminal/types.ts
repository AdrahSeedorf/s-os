import type { FileSystem, FsPath } from '@/types/filesystem';

/**
 * Terminal types.
 *
 * The interpreter is pure: it takes an input string and a context, and returns
 * output lines plus a list of *effects* describing what the shell should do —
 * open a window, follow a link, clear the screen. It never touches the window
 * store or the DOM itself.
 *
 * That separation is the whole reason the terminal can be tested exhaustively
 * without rendering anything, and it is also what stops the command table
 * quietly becoming a second, competing way to launch applications.
 */

export type OutputKind = 'input' | 'output' | 'accent' | 'error' | 'muted';

export interface OutputLine {
  kind: OutputKind;
  text: string;
}

export type TerminalEffect =
  | { type: 'open-app'; appId: string; params?: Record<string, string> }
  | { type: 'open-url'; url: string }
  | { type: 'clear' }
  | { type: 'close' };

export interface TerminalContext {
  cwd: FsPath;
  fs: FileSystem;
}

export interface CommandResult {
  lines: OutputLine[];
  effects?: readonly TerminalEffect[];
  /** Set when the command changes directory. */
  cwd?: FsPath;
}

export interface Command {
  name: string;
  /** Alternate spellings — `dir` for `ls`, `ver` for `version`. */
  aliases?: readonly string[];
  summary: string;
  usage?: string;
  /** Kept out of `help`. Used for the easter eggs, which should reward
   *  exploration rather than be listed like features. */
  hidden?: boolean;
  run: (args: readonly string[], context: TerminalContext) => CommandResult;
}

export const line = (text: string, kind: OutputKind = 'output'): OutputLine => ({ kind, text });
export const blank = (): OutputLine => ({ kind: 'output', text: '' });
export const error = (text: string): OutputLine => ({ kind: 'error', text });
export const accent = (text: string): OutputLine => ({ kind: 'accent', text });
export const muted = (text: string): OutputLine => ({ kind: 'muted', text });
