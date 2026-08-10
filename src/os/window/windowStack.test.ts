import { describe, expect, it } from 'vitest';
import {
  Z_WINDOW_BASE,
  bringToFront,
  nextInCycle,
  removeFromStack,
  topMostVisible,
  zIndexFor,
} from './windowStack';
import { DEFAULT_CONSTRAINTS, type WindowInstance, type WindowState } from '@/types/window';

function makeWindow(id: string, state: WindowState = 'normal'): WindowInstance {
  return {
    id,
    appId: id,
    title: id,
    icon: 'document',
    state,
    bounds: { x: 0, y: 0, width: 400, height: 300 },
    restoreBounds: null,
    constraints: DEFAULT_CONSTRAINTS,
    params: {},
  };
}

const windows = {
  a: makeWindow('a'),
  b: makeWindow('b', 'minimised'),
  c: makeWindow('c'),
};

describe('stack order', () => {
  it('moves a window to the top on focus', () => {
    expect(bringToFront(['a', 'b', 'c'], 'a')).toEqual(['b', 'c', 'a']);
  });

  it('leaves the stack alone when the window is already on top', () => {
    const order = ['a', 'b', 'c'];
    expect(bringToFront(order, 'c')).toBe(order);
  });

  it('adds an unknown window at the top', () => {
    expect(bringToFront(['a'], 'z')).toEqual(['a', 'z']);
  });

  it('removes a window without disturbing the rest', () => {
    expect(removeFromStack(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });
});

describe('derived z-index', () => {
  // Derived from position rather than stored on the window: an incrementing
  // counter climbs forever and can produce ties after a close and reopen,
  // whereas an ordered list has exactly one window at the top by construction.
  it('increases with stack position', () => {
    const order = ['a', 'b', 'c'];
    expect(zIndexFor(order, 'a')).toBe(Z_WINDOW_BASE);
    expect(zIndexFor(order, 'c')).toBe(Z_WINDOW_BASE + 2);
  });

  it('never produces a tie', () => {
    const order = ['a', 'b', 'c', 'd'];
    const values = order.map((id) => zIndexFor(order, id));
    expect(new Set(values).size).toBe(values.length);
  });

  it('falls back to the base for an unknown window', () => {
    expect(zIndexFor(['a'], 'missing')).toBe(Z_WINDOW_BASE);
  });
});

describe('topmost visible window', () => {
  it('skips minimised windows', () => {
    expect(topMostVisible(['a', 'c', 'b'], windows)).toBe('c');
  });

  it('returns null when everything is minimised', () => {
    expect(topMostVisible(['b'], { b: windows.b })).toBeNull();
  });

  it('returns null for an empty stack', () => {
    expect(topMostVisible([], {})).toBeNull();
  });
});

describe('keyboard cycling', () => {
  it('moves to the next visible window and wraps', () => {
    expect(nextInCycle(['a', 'c'], windows, 'a')).toBe('c');
    expect(nextInCycle(['a', 'c'], windows, 'c')).toBe('a');
  });

  it('cycles backwards', () => {
    expect(nextInCycle(['a', 'c'], windows, 'a', -1)).toBe('c');
  });

  it('never lands on a minimised window', () => {
    expect(nextInCycle(['a', 'b', 'c'], windows, 'a')).toBe('c');
  });

  it('stays put when only one window is visible', () => {
    expect(nextInCycle(['a', 'b'], windows, 'a')).toBe('a');
  });

  it('returns null when there is nothing to cycle to', () => {
    expect(nextInCycle([], {}, null)).toBeNull();
  });
});
