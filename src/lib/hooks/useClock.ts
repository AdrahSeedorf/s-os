'use client';

import { useSyncExternalStore } from 'react';

/**
 * The system clock, shared by the login screen and the taskbar tray.
 *
 * Implemented as one module-level store rather than a timer per component, for
 * two reasons. The tray clock is mounted for the entire session, so its cost
 * is permanent; and two components running independent timers would drift
 * apart and update on different frames.
 *
 * Ticks align to the next whole minute rather than running every second. The
 * display only shows minutes, so a per-second timer would wake React sixty
 * times an hour to render identical output.
 */

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let snapshot = 0;

function currentMinuteStamp(): number {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.getTime();
}

function tick(): void {
  snapshot = currentMinuteStamp();
  listeners.forEach((listener) => listener());
  schedule();
}

function schedule(): void {
  const now = new Date();
  const msUntilNextMinute = 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  timer = setTimeout(tick, msUntilNextMinute);
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    snapshot = currentMinuteStamp();
    schedule();
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    // Stop the timer once nothing is watching, so the clock does not keep the
    // page awake after the last consumer unmounts.
    if (listeners.size === 0 && timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
}

function getSnapshot(): number {
  return snapshot;
}

function getServerSnapshot(): number {
  // The server has no idea what time it is where the visitor is. Zero means
  // "unknown", and consumers render nothing until the client corrects it.
  return 0;
}

export interface ClockValue {
  time: string;
  date: string;
  /** For <time dateTime="…">, so the value is machine-readable too. */
  iso: string;
}

/** Returns null until the client knows the time. */
export function useClock(): ClockValue | null {
  const stamp = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (stamp === 0) return null;

  const now = new Date(stamp);

  return {
    time: now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    date: now.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    iso: now.toISOString(),
  };
}
