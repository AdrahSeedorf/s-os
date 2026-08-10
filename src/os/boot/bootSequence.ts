import { site } from '@/lib/config/site';

/**
 * The boot sequence script.
 *
 * Held as data rather than hardcoded in the component so the timing can be
 * reasoned about in one place — and so the total is verifiable by a test
 * rather than by watching it and guessing.
 *
 * The budget is a hard 2.5 seconds. A boot animation is a cost every visitor
 * pays before seeing anything of value, and the audience is people deciding
 * within seconds whether to keep reading. Impressive and brief beats cinematic.
 */

export interface BootLine {
  /** Milliseconds after boot begins that this line appears. */
  at: number;
  text: string;
  /** Rendered in the accent colour — used once, for the system's own name. */
  emphasis?: boolean;
}

export const BOOT_BUDGET_MS = 2500;
export const QUICK_BOOT_BUDGET_MS = 700;

export const bootLines: readonly BootLine[] = [
  { at: 260, text: `${site.name} — ${site.fullName}`, emphasis: true },
  { at: 620, text: 'Initialising developer environment…' },
  { at: 1020, text: 'Mounting portfolio volumes… C: D: E: F: G:' },
  { at: 1420, text: 'Loading installed programs…' },
  { at: 1800, text: 'Starting window manager…' },
  { at: 2120, text: 'Preparing desktop…' },
];

/** The shortened sequence for a returning visitor. */
export const quickBootLines: readonly BootLine[] = [
  { at: 120, text: `${site.name}`, emphasis: true },
  { at: 380, text: 'Resuming session…' },
];

export function getBootScript(quick: boolean): {
  lines: readonly BootLine[];
  budget: number;
} {
  return quick
    ? { lines: quickBootLines, budget: QUICK_BOOT_BUDGET_MS }
    : { lines: bootLines, budget: BOOT_BUDGET_MS };
}
