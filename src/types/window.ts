/**
 * Window manager types.
 *
 * Geometry is kept as plain data with no DOM references, which is what allows
 * the whole of the window manager's logic to be tested without a browser.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

/** The area windows may occupy. The taskbar is excluded rather than overlaid,
 *  so a maximised window never hides behind it. */
export interface Viewport {
  width: number;
  height: number;
  taskbarHeight: number;
}

export interface WindowConstraints {
  minWidth: number;
  minHeight: number;
  resizable: boolean;
  maximisable: boolean;
}

export type WindowState = 'normal' | 'minimised' | 'maximised';

/** The eight resize handles, named as compass directions. */
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface WindowInstance {
  /** Unique per open window. Distinct from appId, because some applications
   *  may have several windows open at once. */
  id: string;
  appId: string;
  title: string;
  icon: string;
  state: WindowState;
  bounds: Rect;
  /** Where to return to when un-maximising. Null while in normal state. */
  restoreBounds: Rect | null;
  constraints: WindowConstraints;
  /** Application-specific arguments — which project to show, which path to
   *  open. Kept as strings so a window can be described by a URL. */
  params: Readonly<Record<string, string>>;
}

export const DEFAULT_CONSTRAINTS: WindowConstraints = {
  minWidth: 320,
  minHeight: 200,
  resizable: true,
  maximisable: true,
};
