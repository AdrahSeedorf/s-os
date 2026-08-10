import type { Rect, ResizeEdge, Size, Viewport, WindowConstraints } from '@/types/window';

/**
 * Window geometry — pure functions, no DOM, no React.
 *
 * Everything a window manager gets wrong lives here: windows dragged off the
 * screen and unrecoverable, resize handles that invert the window when dragged
 * past their opposite edge, maximised windows hidden behind the taskbar. Each
 * of those is a bug in arithmetic, not in rendering, so keeping the arithmetic
 * separate means it can be tested exhaustively in milliseconds.
 */

/** How much of a window's title bar must remain reachable. Drag a window
 *  almost entirely off-screen and this is what stays, so it can be dragged
 *  back — the single most common way a naive window manager loses a window. */
export const MIN_VISIBLE_X = 96;
export const MIN_VISIBLE_Y = 4;

/** Offset between successively opened windows, so they do not stack exactly. */
export const CASCADE_STEP = 28;
const CASCADE_WRAP = 6;

export function clampSize(size: Size, constraints: WindowConstraints): Size {
  return {
    width: Math.max(constraints.minWidth, Math.round(size.width)),
    height: Math.max(constraints.minHeight, Math.round(size.height)),
  };
}

/** The usable desktop area, excluding the taskbar. */
export function workArea(viewport: Viewport): Rect {
  return {
    x: 0,
    y: 0,
    width: viewport.width,
    height: Math.max(0, viewport.height - viewport.taskbarHeight),
  };
}

/**
 * Keep a window reachable.
 *
 * Deliberately not "keep it fully on screen": dragging a window partly past
 * the right edge is normal and useful. The rule is only that enough of the
 * title bar stays within the work area to grab it again, and that it can never
 * go above the top edge, where it would be impossible to reach.
 */
export function clampToViewport(bounds: Rect, viewport: Viewport): Rect {
  const area = workArea(viewport);

  const maxX = area.width - MIN_VISIBLE_X;
  const minX = MIN_VISIBLE_X - bounds.width;
  const maxY = area.height - viewport.taskbarHeight / 2 - MIN_VISIBLE_Y;

  return {
    ...bounds,
    x: Math.round(Math.min(maxX, Math.max(minX, bounds.x))),
    y: Math.round(Math.min(maxY, Math.max(0, bounds.y))),
  };
}

/** Bounds for a maximised window: the whole work area, taskbar excluded. */
export function maximisedBounds(viewport: Viewport): Rect {
  return workArea(viewport);
}

/** Shrink a requested size to fit a small viewport, preserving the minimums. */
export function fitSize(size: Size, viewport: Viewport, constraints: WindowConstraints): Size {
  const area = workArea(viewport);

  return clampSize(
    {
      width: Math.min(size.width, Math.max(constraints.minWidth, area.width - 32)),
      height: Math.min(size.height, Math.max(constraints.minHeight, area.height - 32)),
    },
    constraints,
  );
}

export function centredBounds(size: Size, viewport: Viewport): Rect {
  const area = workArea(viewport);

  return {
    x: Math.round((area.width - size.width) / 2),
    y: Math.round((area.height - size.height) / 2),
    width: size.width,
    height: size.height,
  };
}

/**
 * Where the next window should open.
 *
 * Cascades from the centred position and wraps after a few steps, so opening
 * ten windows does not march the tenth off the bottom-right corner.
 */
export function cascadeBounds(size: Size, viewport: Viewport, index: number): Rect {
  const base = centredBounds(size, viewport);
  const step = (index % CASCADE_WRAP) * CASCADE_STEP;
  const start = Math.floor(CASCADE_WRAP / 2) * CASCADE_STEP;

  return clampToViewport(
    { ...base, x: base.x - start + step, y: base.y - start + step },
    viewport,
  );
}

/**
 * Apply a resize gesture from one edge.
 *
 * The subtle case is dragging an edge past its opposite: without care the
 * window inverts, or the far edge creeps along with the near one. Each axis is
 * resolved by computing the fixed edge first, then clamping the moving edge
 * against it — so a window pinned at its minimum size stays put rather than
 * sliding.
 */
export function resizeFromEdge(
  bounds: Rect,
  edge: ResizeEdge,
  deltaX: number,
  deltaY: number,
  constraints: WindowConstraints,
): Rect {
  let { x, y, width, height } = bounds;

  if (edge.includes('e')) {
    width = Math.max(constraints.minWidth, bounds.width + deltaX);
  }

  if (edge.includes('w')) {
    const right = bounds.x + bounds.width;
    width = Math.max(constraints.minWidth, bounds.width - deltaX);
    x = right - width;
  }

  if (edge.includes('s')) {
    height = Math.max(constraints.minHeight, bounds.height + deltaY);
  }

  if (edge.includes('n')) {
    const bottom = bounds.y + bounds.height;
    height = Math.max(constraints.minHeight, bounds.height - deltaY);
    y = bottom - height;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Re-fit a window after the viewport changes.
 *
 * Called on resize and on orientation change. A window larger than the new
 * viewport is shrunk rather than merely repositioned, because a window bigger
 * than the screen cannot be made reachable by moving it.
 */
export function refitToViewport(
  bounds: Rect,
  viewport: Viewport,
  constraints: WindowConstraints,
): Rect {
  const area = workArea(viewport);

  const width = Math.max(constraints.minWidth, Math.min(bounds.width, area.width));
  const height = Math.max(constraints.minHeight, Math.min(bounds.height, area.height));

  return clampToViewport({ ...bounds, width, height }, viewport);
}

export function rectsEqual(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
