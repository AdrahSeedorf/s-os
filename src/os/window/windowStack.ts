import type { WindowInstance } from '@/types/window';

/**
 * Window stacking order — pure array operations.
 *
 * The stack is an ordered list of window ids, bottom to top. z-index is
 * *derived* from a window's position in that list rather than stored on the
 * window.
 *
 * The alternative — giving each window a z-index number and incrementing a
 * counter on focus — is the common implementation and it is subtly broken. The
 * counter climbs forever, values drift apart, and nothing stops two windows
 * sharing a value after a close-and-reopen. An ordered list cannot produce a
 * tie, needs no counter, and makes "which window is on top" a question with
 * exactly one answer: the last element.
 */

/** Windows start above the desktop and stay below the taskbar and menus. */
export const Z_WINDOW_BASE = 100;

export function bringToFront(order: readonly string[], id: string): readonly string[] {
  if (!order.includes(id)) return [...order, id];
  if (order.at(-1) === id) return order;

  return [...order.filter((entry) => entry !== id), id];
}

export function removeFromStack(order: readonly string[], id: string): readonly string[] {
  return order.filter((entry) => entry !== id);
}

export function zIndexFor(order: readonly string[], id: string): number {
  const index = order.indexOf(id);
  return index === -1 ? Z_WINDOW_BASE : Z_WINDOW_BASE + index;
}

/**
 * The window that should receive focus — topmost, ignoring minimised ones.
 *
 * Minimised windows keep their place in the stack rather than being removed,
 * so restoring one returns it to where it was instead of throwing it to the
 * front. That matches how real desktops behave and avoids a jarring reshuffle.
 */
export function topMostVisible(
  order: readonly string[],
  windows: Readonly<Record<string, WindowInstance>>,
): string | null {
  for (let index = order.length - 1; index >= 0; index -= 1) {
    const id = order[index];
    if (id === undefined) continue;

    const instance = windows[id];
    if (instance && instance.state !== 'minimised') return id;
  }

  return null;
}

/**
 * The next window when cycling with the keyboard.
 *
 * Cycles only visible windows, and wraps. Returns null when there is nothing
 * to cycle to, so the caller can leave focus where it is rather than moving it
 * somewhere arbitrary.
 */
export function nextInCycle(
  order: readonly string[],
  windows: Readonly<Record<string, WindowInstance>>,
  currentId: string | null,
  direction: 1 | -1 = 1,
): string | null {
  const visible = order.filter((id) => {
    const instance = windows[id];
    return instance !== undefined && instance.state !== 'minimised';
  });

  if (visible.length === 0) return null;
  if (visible.length === 1) return visible[0] ?? null;

  const currentIndex = currentId === null ? -1 : visible.indexOf(currentId);
  if (currentIndex === -1) return visible.at(-1) ?? null;

  const nextIndex = (currentIndex + direction + visible.length) % visible.length;
  return visible[nextIndex] ?? null;
}

/** Windows in the order the taskbar should list them — creation order, so
 *  buttons do not jump around every time focus changes. */
export function taskbarOrder(
  order: readonly string[],
  windows: Readonly<Record<string, WindowInstance>>,
  creationOrder: readonly string[],
): readonly WindowInstance[] {
  void order;

  return creationOrder
    .map((id) => windows[id])
    .filter((instance): instance is WindowInstance => instance !== undefined);
}
