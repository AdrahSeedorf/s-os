import { site } from '@/lib/config/site';
import { listChildren, toDisplayPath } from '@/lib/content/filesystem';
import { getProjects } from '@/lib/content';
import { getLaunchableApps } from '@/os/registry/applications';
import { commandNames, findCommand } from './commands';
import { parse } from './parser';
import {
  accent,
  blank,
  error,
  line,
  muted,
  type CommandResult,
  type TerminalContext,
} from './types';

/**
 * The terminal session.
 *
 * Pure: `execute` takes an input string and a context, and returns lines,
 * effects and possibly a new working directory. Nothing here opens a window,
 * touches the DOM or reads a store — the component applies the effects.
 *
 * The payoff is the same as with the window manager's geometry: the whole
 * command surface can be tested in milliseconds without rendering anything.
 */

export function banner(): CommandResult['lines'] {
  return [
    accent(`${site.name} Developer Console`),
    muted(`${site.fullName} — version ${site.version}`),
    blank(),
    muted("Type 'help' for commands, or 'whoami' to start."),
    blank(),
  ];
}

export function prompt(cwd: string): string {
  return `${toDisplayPath(cwd)}>`;
}

export function execute(input: string, context: TerminalContext): CommandResult {
  const parsed = parse(input);

  // A bare Enter echoes the prompt and nothing else, like a real shell.
  if (!parsed) return { lines: [] };

  const command = findCommand(parsed.name);

  if (!command) {
    return {
      lines: [
        error(`'${parsed.name}' is not recognised as an internal or external command.`),
        muted("Type 'help' to see what is available."),
      ],
    };
  }

  return command.run(parsed.args, context);
}

/**
 * Tab completion.
 *
 * Completes command names on the first token, and paths or program names on
 * the argument of the commands where that makes sense. Returns every candidate
 * so the component can either complete a unique match or list the options.
 */
export function complete(input: string, context: TerminalContext): readonly string[] {
  const trailingSpace = /\s$/.test(input);
  const tokens = input.trimStart().split(/\s+/);
  const [name, ...args] = tokens;

  // Still typing the command itself.
  if (tokens.length <= 1 && !trailingSpace) {
    const prefix = (name ?? '').toLowerCase();
    return commandNames().filter((candidate) => candidate.startsWith(prefix));
  }

  const command = findCommand(name ?? '');
  if (!command) return [];

  const partial = (trailingSpace ? '' : (args.at(-1) ?? '')).toLowerCase();

  if (command.name === 'cd' || command.name === 'ls') {
    return listChildren(context.fs, context.cwd)
      .filter((node) => node.kind !== 'file')
      .map((node) => node.name)
      .filter((candidate) => candidate.toLowerCase().startsWith(partial));
  }

  if (command.name === 'open') {
    const apps = getLaunchableApps().map((app) => app.id);
    const projects = getProjects().map((project) => project.executable);
    const here = listChildren(context.fs, context.cwd).map((node) => node.name);

    return [...apps, ...projects, ...here].filter((candidate) =>
      candidate.toLowerCase().startsWith(partial),
    );
  }

  if (command.name === 'help') {
    return commandNames().filter((candidate) => candidate.startsWith(partial));
  }

  return [];
}

/**
 * Longest common prefix of the candidates.
 *
 * What a shell actually does on Tab with several matches: fill in as far as
 * everything agrees, then stop and let the visitor decide. Completing to the
 * first match instead would be confidently wrong most of the time.
 */
export function commonPrefix(candidates: readonly string[]): string {
  if (candidates.length === 0) return '';

  const first = candidates[0] ?? '';
  let length = first.length;

  for (const candidate of candidates.slice(1)) {
    let index = 0;
    while (index < length && index < candidate.length && first[index] === candidate[index]) {
      index += 1;
    }
    length = index;
  }

  return first.slice(0, length);
}

export { line, blank, error, accent, muted };
