import { describe, expect, it } from 'vitest';
import {
  MIN_VISIBLE_X,
  cascadeBounds,
  centredBounds,
  clampSize,
  clampToViewport,
  fitSize,
  maximisedBounds,
  refitToViewport,
  resizeFromEdge,
  workArea,
} from './geometry';
import { DEFAULT_CONSTRAINTS, type Viewport } from '@/types/window';

const viewport: Viewport = { width: 1280, height: 800, taskbarHeight: 44 };

describe('work area', () => {
  it('excludes the taskbar, so a maximised window is never hidden behind it', () => {
    expect(workArea(viewport)).toEqual({ x: 0, y: 0, width: 1280, height: 756 });
  });

  it('maximises to exactly the work area', () => {
    expect(maximisedBounds(viewport)).toEqual(workArea(viewport));
  });
});

describe('size constraints', () => {
  it('never returns a window smaller than its minimum', () => {
    expect(clampSize({ width: 10, height: 10 }, DEFAULT_CONSTRAINTS)).toEqual({
      width: DEFAULT_CONSTRAINTS.minWidth,
      height: DEFAULT_CONSTRAINTS.minHeight,
    });
  });

  it('shrinks an oversized window to fit a small viewport', () => {
    const small: Viewport = { width: 500, height: 400, taskbarHeight: 44 };
    const fitted = fitSize({ width: 900, height: 700 }, small, DEFAULT_CONSTRAINTS);

    expect(fitted.width).toBeLessThan(500);
    expect(fitted.height).toBeLessThan(400);
  });

  it('respects minimums even when the viewport is smaller than them', () => {
    const tiny: Viewport = { width: 200, height: 200, taskbarHeight: 44 };
    const fitted = fitSize({ width: 900, height: 700 }, tiny, DEFAULT_CONSTRAINTS);

    expect(fitted.width).toBe(DEFAULT_CONSTRAINTS.minWidth);
    expect(fitted.height).toBe(DEFAULT_CONSTRAINTS.minHeight);
  });
});

describe('keeping windows reachable', () => {
  // The classic window-manager bug: drag a window off the edge and it can
  // never be retrieved. These tests are the guard against it.
  it('leaves a grabbable strip when dragged off the right edge', () => {
    const clamped = clampToViewport({ x: 5000, y: 100, width: 400, height: 300 }, viewport);
    expect(clamped.x).toBeLessThanOrEqual(viewport.width - MIN_VISIBLE_X);
  });

  it('leaves a grabbable strip when dragged off the left edge', () => {
    const clamped = clampToViewport({ x: -5000, y: 100, width: 400, height: 300 }, viewport);
    expect(clamped.x + 400).toBeGreaterThanOrEqual(MIN_VISIBLE_X);
  });

  it('never lets a title bar go above the top edge', () => {
    const clamped = clampToViewport({ x: 100, y: -500, width: 400, height: 300 }, viewport);
    expect(clamped.y).toBe(0);
  });

  it('never lets a window fall past the bottom of the work area', () => {
    const clamped = clampToViewport({ x: 100, y: 5000, width: 400, height: 300 }, viewport);
    expect(clamped.y).toBeLessThan(workArea(viewport).height);
  });

  it('leaves a window that is already in bounds untouched', () => {
    const bounds = { x: 120, y: 90, width: 400, height: 300 };
    expect(clampToViewport(bounds, viewport)).toEqual(bounds);
  });
});

describe('placement', () => {
  it('centres a window in the work area', () => {
    const centred = centredBounds({ width: 400, height: 300 }, viewport);
    expect(centred.x).toBe(440);
    expect(centred.y).toBe(228);
  });

  it('offsets successive windows so they do not stack exactly', () => {
    const first = cascadeBounds({ width: 400, height: 300 }, viewport, 0);
    const second = cascadeBounds({ width: 400, height: 300 }, viewport, 1);

    expect(second.x).toBeGreaterThan(first.x);
    expect(second.y).toBeGreaterThan(first.y);
  });

  it('wraps the cascade instead of marching windows off the corner', () => {
    const positions = Array.from({ length: 12 }, (_, index) =>
      cascadeBounds({ width: 400, height: 300 }, viewport, index),
    );

    for (const position of positions) {
      expect(position.x).toBeLessThan(viewport.width);
      expect(position.y).toBeLessThan(viewport.height);
    }
  });
});

describe('resizing from an edge', () => {
  const bounds = { x: 100, y: 100, width: 400, height: 300 };

  it('grows to the right without moving the left edge', () => {
    const next = resizeFromEdge(bounds, 'e', 50, 0, DEFAULT_CONSTRAINTS);
    expect(next).toEqual({ x: 100, y: 100, width: 450, height: 300 });
  });

  it('moves the left edge while pinning the right', () => {
    const next = resizeFromEdge(bounds, 'w', 50, 0, DEFAULT_CONSTRAINTS);
    expect(next.x).toBe(150);
    expect(next.width).toBe(350);
    expect(next.x + next.width).toBe(bounds.x + bounds.width);
  });

  it('moves the top edge while pinning the bottom', () => {
    const next = resizeFromEdge(bounds, 'n', 40, 40, DEFAULT_CONSTRAINTS);
    expect(next.y).toBe(140);
    expect(next.y + next.height).toBe(bounds.y + bounds.height);
  });

  it('resizes both axes from a corner', () => {
    const next = resizeFromEdge(bounds, 'se', 60, 40, DEFAULT_CONSTRAINTS);
    expect(next.width).toBe(460);
    expect(next.height).toBe(340);
  });

  it('stops at the minimum rather than inverting the window', () => {
    const next = resizeFromEdge(bounds, 'e', -5000, 0, DEFAULT_CONSTRAINTS);
    expect(next.width).toBe(DEFAULT_CONSTRAINTS.minWidth);
  });

  it('keeps the pinned edge still once the minimum is reached', () => {
    // Dragging the west edge far past the east edge must not push the window
    // sideways: the right edge is fixed, so the left edge simply stops.
    const next = resizeFromEdge(bounds, 'w', 5000, 0, DEFAULT_CONSTRAINTS);

    expect(next.width).toBe(DEFAULT_CONSTRAINTS.minWidth);
    expect(next.x + next.width).toBe(bounds.x + bounds.width);
  });
});

describe('viewport changes', () => {
  it('shrinks a window larger than the new viewport', () => {
    const small: Viewport = { width: 600, height: 500, taskbarHeight: 44 };
    const refitted = refitToViewport(
      { x: 0, y: 0, width: 1200, height: 900 },
      small,
      DEFAULT_CONSTRAINTS,
    );

    expect(refitted.width).toBeLessThanOrEqual(small.width);
    expect(refitted.height).toBeLessThanOrEqual(small.height - small.taskbarHeight);
  });

  it('pulls an out-of-reach window back after the viewport shrinks', () => {
    const small: Viewport = { width: 600, height: 500, taskbarHeight: 44 };
    const refitted = refitToViewport(
      { x: 1100, y: 700, width: 400, height: 300 },
      small,
      DEFAULT_CONSTRAINTS,
    );

    expect(refitted.x).toBeLessThanOrEqual(small.width - MIN_VISIBLE_X);
    expect(refitted.y).toBeLessThan(small.height);
  });
});
