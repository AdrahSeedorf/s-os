import { create } from 'zustand';
import type { Rect, ResizeEdge, Viewport, WindowInstance } from '@/types/window';
import {
  cascadeBounds,
  clampToViewport,
  fitSize,
  maximisedBounds,
  refitToViewport,
  resizeFromEdge,
} from '@/os/window/geometry';
import {
  bringToFront,
  nextInCycle,
  removeFromStack,
  topMostVisible,
} from '@/os/window/windowStack';
import { getApp, resolveConstraints } from '@/os/registry/applications';

/**
 * Window manager state.
 *
 * Zustand rather than Context, for one measurable reason: dragging a window
 * updates its position up to sixty times a second, and Context re-renders
 * every consumer on every change. That would re-render all other windows, the
 * taskbar and the desktop on each frame of a drag. Zustand's selector
 * subscriptions confine the work to the window actually moving.
 *
 * All the arithmetic lives in geometry.ts and windowStack.ts. This file is
 * only the wiring, which keeps the interesting logic testable without React.
 */

export interface WindowStoreState {
  windows: Record<string, WindowInstance>;
  /** Stacking order, bottom to top. z-index is derived from position. */
  order: string[];
  /** Creation order, so taskbar buttons stay put as focus changes. */
  creationOrder: string[];
  focusedId: string | null;
  viewport: Viewport;
  /** Increments per launch, to cascade successive windows. */
  openCount: number;

  openApp: (appId: string, params?: Record<string, string>) => string | null;
  closeWindow: (id: string) => void;
  closeAll: () => void;
  focusWindow: (id: string) => void;
  minimise: (id: string) => void;
  maximise: (id: string) => void;
  restore: (id: string) => void;
  toggleMaximise: (id: string) => void;
  /** Taskbar click behaviour: restore, focus, or minimise as appropriate. */
  toggleFromTaskbar: (id: string) => void;
  setBounds: (id: string, bounds: Rect) => void;
  moveBy: (id: string, deltaX: number, deltaY: number) => void;
  resizeBy: (id: string, edge: ResizeEdge, deltaX: number, deltaY: number) => void;
  cycleFocus: (direction?: 1 | -1) => void;
  setViewport: (viewport: Viewport) => void;
}

const INITIAL_VIEWPORT: Viewport = { width: 1280, height: 800, taskbarHeight: 44 };

let instanceCounter = 0;
function nextWindowId(appId: string): string {
  instanceCounter += 1;
  return `${appId}-${instanceCounter}`;
}

export const useWindowStore = create<WindowStoreState>()((set, get) => ({
  windows: {},
  order: [],
  creationOrder: [],
  focusedId: null,
  viewport: INITIAL_VIEWPORT,
  openCount: 0,

  openApp: (appId, params = {}) => {
    const app = getApp(appId);
    if (!app) return null;

    const state = get();

    // Single-instance applications focus the window you already have rather
    // than giving you a second one to lose track of. Projects are the
    // exception, since comparing two side by side is reasonable.
    if (app.allowMultiple !== true) {
      const existing = Object.values(state.windows).find((window) => window.appId === appId);
      if (existing) {
        get().restore(existing.id);
        return existing.id;
      }
    }

    // Multi-instance apps still de-duplicate on their arguments: opening the
    // same project twice should focus it, not stack two identical windows.
    if (app.allowMultiple === true) {
      const identical = Object.values(state.windows).find(
        (window) =>
          window.appId === appId &&
          JSON.stringify(window.params) === JSON.stringify({ ...params, appId }),
      );
      if (identical) {
        get().restore(identical.id);
        return identical.id;
      }
    }

    const constraints = resolveConstraints(app);
    const size = fitSize(app.defaultSize, state.viewport, constraints);
    const bounds = cascadeBounds(size, state.viewport, state.openCount);
    const id = nextWindowId(appId);

    const instance: WindowInstance = {
      id,
      appId,
      title: app.title,
      icon: app.icon,
      state: 'normal',
      bounds,
      restoreBounds: null,
      constraints,
      // appId travels in params so an application can look itself up without
      // the shell having to pass its own definition down.
      params: { ...params, appId },
    };

    set({
      windows: { ...state.windows, [id]: instance },
      order: [...state.order, id],
      creationOrder: [...state.creationOrder, id],
      focusedId: id,
      openCount: state.openCount + 1,
    });

    return id;
  },

  closeWindow: (id) => {
    const state = get();
    if (!state.windows[id]) return;

    const windows = { ...state.windows };
    delete windows[id];

    const order = removeFromStack(state.order, id);

    set({
      windows,
      order: [...order],
      creationOrder: state.creationOrder.filter((entry) => entry !== id),
      // Focus falls to whatever is now on top, so closing a window never
      // leaves the desktop with nothing focused while windows remain.
      focusedId: state.focusedId === id ? topMostVisible(order, windows) : state.focusedId,
    });
  },

  closeAll: () => {
    set({ windows: {}, order: [], creationOrder: [], focusedId: null });
  },

  focusWindow: (id) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance || state.focusedId === id) return;

    set({ order: [...bringToFront(state.order, id)], focusedId: id });
  },

  minimise: (id) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance || instance.state === 'minimised') return;

    const windows = {
      ...state.windows,
      [id]: { ...instance, state: 'minimised' as const },
    };

    set({
      windows,
      // The window keeps its place in the stack, so restoring it returns it to
      // where it was instead of throwing it to the front.
      focusedId:
        state.focusedId === id ? topMostVisible(state.order, windows) : state.focusedId,
    });
  },

  maximise: (id) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance || !instance.constraints.maximisable) return;
    if (instance.state === 'maximised') return;

    set({
      windows: {
        ...state.windows,
        [id]: {
          ...instance,
          state: 'maximised',
          restoreBounds: instance.bounds,
          bounds: maximisedBounds(state.viewport),
        },
      },
      order: [...bringToFront(state.order, id)],
      focusedId: id,
    });
  },

  restore: (id) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance) return;

    const bounds =
      instance.state === 'maximised' && instance.restoreBounds
        ? clampToViewport(instance.restoreBounds, state.viewport)
        : instance.bounds;

    set({
      windows: {
        ...state.windows,
        [id]: { ...instance, state: 'normal', bounds, restoreBounds: null },
      },
      order: [...bringToFront(state.order, id)],
      focusedId: id,
    });
  },

  toggleMaximise: (id) => {
    const instance = get().windows[id];
    if (!instance) return;

    if (instance.state === 'maximised') get().restore(id);
    else get().maximise(id);
  },

  toggleFromTaskbar: (id) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance) return;

    // Three cases, matching how a real taskbar behaves: a minimised window
    // comes back, the focused window goes away, and anything else is brought
    // forward. Getting this wrong is the most noticeable taskbar bug there is.
    if (instance.state === 'minimised') {
      get().restore(id);
      return;
    }

    if (state.focusedId === id) {
      get().minimise(id);
      return;
    }

    get().focusWindow(id);
  },

  setBounds: (id, bounds) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance) return;

    set({
      windows: {
        ...state.windows,
        [id]: { ...instance, bounds: clampToViewport(bounds, state.viewport) },
      },
    });
  },

  moveBy: (id, deltaX, deltaY) => {
    const instance = get().windows[id];
    if (!instance || instance.state === 'maximised') return;

    get().setBounds(id, {
      ...instance.bounds,
      x: instance.bounds.x + deltaX,
      y: instance.bounds.y + deltaY,
    });
  },

  resizeBy: (id, edge, deltaX, deltaY) => {
    const state = get();
    const instance = state.windows[id];
    if (!instance || !instance.constraints.resizable) return;
    if (instance.state === 'maximised') return;

    const next = resizeFromEdge(instance.bounds, edge, deltaX, deltaY, instance.constraints);

    set({
      windows: { ...state.windows, [id]: { ...instance, bounds: next } },
    });
  },

  cycleFocus: (direction = 1) => {
    const state = get();
    const next = nextInCycle(state.order, state.windows, state.focusedId, direction);
    if (next !== null) get().focusWindow(next);
  },

  setViewport: (viewport) => {
    const state = get();

    // Every window is re-fitted, because a viewport that shrank can leave
    // windows larger than the screen or entirely out of reach — the state a
    // visitor arrives in after rotating a tablet.
    const windows: Record<string, WindowInstance> = {};

    for (const [id, instance] of Object.entries(state.windows)) {
      windows[id] =
        instance.state === 'maximised'
          ? { ...instance, bounds: maximisedBounds(viewport) }
          : {
              ...instance,
              bounds: refitToViewport(instance.bounds, viewport, instance.constraints),
            };
    }

    set({ viewport, windows });
  },
}));

/** Test helper. Resets the manager without reaching into store internals. */
export function resetWindowStore(): void {
  instanceCounter = 0;
  useWindowStore.setState({
    windows: {},
    order: [],
    creationOrder: [],
    focusedId: null,
    viewport: INITIAL_VIEWPORT,
    openCount: 0,
  });
}
