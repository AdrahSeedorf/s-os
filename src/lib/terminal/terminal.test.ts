import { describe, expect, it } from 'vitest';
import { buildFileSystem } from '@/lib/content/filesystem';
import { getSnapshot, resetContentSnapshot, setContentSnapshot } from '@/lib/content';
import { commandNames, commands, findCommand } from './commands';
import { parse, tokenise } from './parser';
import { commonPrefix, complete, execute } from './session';
import type { TerminalContext } from './types';

const fs = buildFileSystem();
const at = (cwd: string): TerminalContext => ({ cwd, fs });
const root = at('C:');

/** All output from a command, joined, for substring assertions. */
const textOf = (input: string, context: TerminalContext = root): string =>
  execute(input, context)
    .lines.map((entry) => entry.text)
    .join('\n');

describe('tokenising', () => {
  it('splits on whitespace', () => {
    expect(tokenise('open projects')).toEqual(['open', 'projects']);
  });

  it('keeps quoted arguments together', () => {
    // Half the filesystem has spaces in its names, so this is not decoration:
    // without it, `cd "Systems & Tooling"` is unreachable.
    expect(tokenise('cd "Systems & Tooling"')).toEqual(['cd', 'Systems & Tooling']);
  });

  it('handles single quotes too', () => {
    expect(tokenise("open 'About Seedorf'")).toEqual(['open', 'About Seedorf']);
  });

  it('collapses repeated whitespace', () => {
    expect(tokenise('  ls    D:  ')).toEqual(['ls', 'D:']);
  });

  it('returns nothing for an empty line', () => {
    expect(parse('   ')).toBeNull();
  });

  it('lowercases the command but not the arguments', () => {
    const parsed = parse('OPEN S-OS.exe');
    expect(parsed?.name).toBe('open');
    expect(parsed?.args).toEqual(['S-OS.exe']);
  });
});

describe('command table', () => {
  it('gives every command a summary', () => {
    for (const command of commands) {
      expect(command.summary.length, command.name).toBeGreaterThan(0);
    }
  });

  it('has no duplicate names or aliases', () => {
    const names = commands.flatMap((command) => [command.name, ...(command.aliases ?? [])]);
    expect(new Set(names).size).toBe(names.length);
  });

  it('resolves aliases', () => {
    expect(findCommand('dir')?.name).toBe('ls');
    expect(findCommand('cls')?.name).toBe('clear');
    expect(findCommand('ver')?.name).toBe('version');
  });

  it('keeps easter eggs out of help', () => {
    // They should reward exploration, not be listed like features.
    const help = textOf('help');
    expect(help).not.toContain('matrix');
    expect(help).not.toContain('sudo');
  });

  it('lists every visible command in help', () => {
    const help = textOf('help');
    for (const command of commands.filter((entry) => !entry.hidden)) {
      expect(help).toContain(command.name);
    }
  });
});

describe('unknown input', () => {
  it('reports an unrecognised command and points somewhere useful', () => {
    const result = execute('frobnicate', root);

    expect(result.lines[0]?.kind).toBe('error');
    expect(result.lines.map((entry) => entry.text).join(' ')).toContain('help');
  });

  it('does nothing for a blank line', () => {
    expect(execute('', root).lines).toEqual([]);
  });
});

describe('content commands', () => {
  it('whoami reports the real profile', () => {
    expect(textOf('whoami')).toContain('Seedorf Obeng-Mireku');
  });

  it('projects lists every installed program', () => {
    const output = textOf('projects');
    expect(output).toContain('S-OS.exe');
    expect(output).toContain('Hotel734.exe');
  });

  it('projects filters by status', () => {
    // S-OS is in development, so a stable filter that still lists it would
    // mean the filter is being ignored rather than applied.
    const output = textOf('projects stable');
    expect(output).toContain('LibraryManager.jar');
    expect(output).not.toContain('S-OS.exe');
  });

  it('projects reports an unknown status rather than showing everything', () => {
    expect(execute('projects nonsense', root).lines[0]?.kind).toBe('error');
  });

  it('skills uses named levels, never percentages', () => {
    const output = textOf('skills');
    expect(output).toMatch(/Proficient|Experienced|Learning/);
    expect(output).not.toMatch(/\d+%/);
  });

  it('experience states the gap plainly', () => {
    expect(textOf('experience')).toContain('No industry experience yet');
  });

  it('resume opens the viewer when a file exists', () => {
    expect(execute('resume', root).effects?.[0]).toEqual({
      type: 'open-app',
      appId: 'resume',
    });
  });

  it('resume explains itself when there is no file', () => {
    const snapshot = getSnapshot();
    const documents = snapshot.documents.map((document) => {
      if (document.kind !== 'resume') return document;
      const { src: _src, ...rest } = document;
      return rest;
    });
    setContentSnapshot({ ...snapshot, documents });

    try {
      expect(textOf('resume')).toContain('being finalised');
    } finally {
      resetContentSnapshot();
    }
  });

  it('github opens the registered profile', () => {
    const result = execute('github', root);
    expect(result.effects?.[0]).toMatchObject({ type: 'open-url' });
  });

  it('github reports a missing link rather than opening nothing', () => {
    // Injected through the content seam rather than asserting today's data, so
    // the empty state stays covered even now that a real link exists.
    const snapshot = getSnapshot();
    const { github: _github, ...profile } = snapshot.profile;
    setContentSnapshot({ ...snapshot, profile });

    try {
      const result = execute('github', root);
      expect(result.lines[0]?.kind).toBe('error');
      expect(result.effects ?? []).toEqual([]);
    } finally {
      resetContentSnapshot();
    }
  });
});

describe('filesystem navigation', () => {
  it('lists the current directory', () => {
    const output = textOf('ls');
    expect(output).toContain('System');
    expect(output).toContain('Programs');
  });

  it('accepts dir as an alias', () => {
    expect(textOf('dir')).toContain('System');
  });

  it('lists another path without changing directory', () => {
    const result = execute('ls D:', root);
    expect(result.cwd).toBeUndefined();
    expect(result.lines.map((entry) => entry.text).join('\n')).toContain('University');
  });

  it('changes directory', () => {
    expect(execute('cd System', root).cwd).toBe('C:/System');
  });

  it('walks back up with ..', () => {
    expect(execute('cd ..', at('C:/System')).cwd).toBe('C:');
  });

  it('refuses to cd into a file', () => {
    const result = execute('cd S-OS.exe', at('D:/Systems & Tooling'));
    expect(result.lines[0]?.kind).toBe('error');
    expect(result.cwd).toBeUndefined();
  });

  it('reports a path that does not exist', () => {
    expect(execute('cd nowhere', root).lines[0]?.kind).toBe('error');
  });

  it('handles a quoted path with spaces', () => {
    expect(execute('cd "Systems & Tooling"', at('D:')).cwd).toBe('D:/Systems & Tooling');
  });

  it('prints the working directory with backslashes', () => {
    expect(textOf('pwd', at('C:/System'))).toBe('C:\\System');
  });
});

describe('open', () => {
  it('launches an application by id', () => {
    const result = execute('open terminal', root);
    expect(result.effects?.[0]).toEqual({ type: 'open-app', appId: 'terminal' });
  });

  it('launches a project by executable name', () => {
    const result = execute('open S-OS.exe', root);
    expect(result.effects?.[0]).toEqual({
      type: 'open-app',
      appId: 'project',
      params: { projectId: 's-os' },
    });
  });

  it('prefers an application over a same-named directory', () => {
    // `open projects` should give the Projects browser, not a listing of D:.
    const result = execute('open projects', root);
    expect(result.effects?.[0]).toEqual({ type: 'open-app', appId: 'projects' });
  });

  it('falls back to opening a path in Explorer', () => {
    const result = execute('open System', root);
    expect(result.effects?.[0]).toEqual({
      type: 'open-app',
      appId: 'explorer',
      params: { path: 'C:/System' },
    });
  });

  it('reports something it cannot find', () => {
    expect(execute('open frobnicate', root).lines[0]?.kind).toBe('error');
  });

  it('requires an argument', () => {
    expect(execute('open', root).lines[0]?.kind).toBe('error');
  });
});

describe('search', () => {
  it('uses the same index as the Start menu', () => {
    const output = textOf('search typescript');
    expect(output).toContain('skill');
    expect(output).toContain('project');
  });

  it('says so when nothing matches', () => {
    expect(textOf('search zzzzqqqq')).toContain('No results');
  });
});

describe('effects', () => {
  it('clear asks the shell to clear rather than clearing itself', () => {
    expect(execute('clear', root).effects?.[0]).toEqual({ type: 'clear' });
  });

  it('exit asks the shell to close the window', () => {
    expect(execute('exit', root).effects?.[0]).toEqual({ type: 'close' });
  });

  it('never returns an effect that runs arbitrary code', () => {
    // The whole safety story of the terminal: every effect is one of four
    // known shapes, all of which stay inside S-OS.
    const allowed = new Set(['open-app', 'open-url', 'clear', 'close']);

    for (const command of commands) {
      const result = command.run([], root);
      for (const effect of result.effects ?? []) {
        expect(allowed.has(effect.type), `${command.name} → ${effect.type}`).toBe(true);
      }
    }
  });
});

describe('easter eggs', () => {
  it('rewards sudo hire-seedorf', () => {
    expect(textOf('sudo hire-seedorf')).toContain('Permission granted');
  });

  it('denies other sudo requests', () => {
    expect(textOf('sudo rm -rf /')).toContain('Permission denied');
  });

  it('credits state that no Microsoft assets are used', () => {
    expect(textOf('credits')).toContain('no Microsoft assets');
  });
});

describe('tab completion', () => {
  it('completes command names', () => {
    expect(complete('pro', root)).toContain('projects');
  });

  it('completes directories after cd', () => {
    expect(complete('cd Sys', root)).toEqual(['System']);
  });

  it('does not offer files to cd', () => {
    expect(complete('cd ', at('D:/Systems & Tooling'))).toEqual([]);
  });

  it('completes project names after open', () => {
    expect(complete('open S-OS', root)).toContain('S-OS.exe');
  });

  it('returns nothing for a command that takes no completable argument', () => {
    expect(complete('whoami ', root)).toEqual([]);
  });

  it('finds the longest common prefix', () => {
    expect(commonPrefix(['project', 'projects'])).toBe('project');
    expect(commonPrefix(['alpha', 'beta'])).toBe('');
    expect(commonPrefix(['only'])).toBe('only');
    expect(commonPrefix([])).toBe('');
  });

  it('offers every command name when completion starts from nothing', () => {
    expect(complete('', root).length).toBe(commandNames().length);
  });
});
