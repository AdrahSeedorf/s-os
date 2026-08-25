/**
 * Input tokeniser.
 *
 * Handles quoted arguments, because several things in S-OS have spaces in
 * their names — `cd "Systems & Tooling"` has to work, and splitting on
 * whitespace alone would make half the filesystem unreachable from the
 * terminal.
 */

export interface ParsedCommand {
  name: string;
  args: readonly string[];
  /** The original input, kept for the scrollback echo. */
  raw: string;
}

export function tokenise(input: string): readonly string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (const character of input) {
    if (quote) {
      if (character === quote) quote = null;
      else current += character;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (/\s/.test(character)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += character;
  }

  if (current) tokens.push(current);
  return tokens;
}

export function parse(input: string): ParsedCommand | null {
  const tokens = tokenise(input);
  const [name, ...args] = tokens;

  if (!name) return null;

  return { name: name.toLowerCase(), args, raw: input };
}
