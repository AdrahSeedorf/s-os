'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { Rect, ResizeEdge, WindowConstraints } from '@/types/window';
import { resizeFromEdge } from './geometry';
import { useWindowStore } from '@/stores/windowStore';

/**
 * Drag and resize gestures.
 *
 * The important decision here is that a gesture in progress does not touch
 * React at all. Moving a window writes a CSS transform straight to the DOM
 * node on each pointer event, and only the final position is committed to the
 * store on release.
 *
 * Committing every frame would be correct but slow: each move would re-render
 * the window and everything subscribed to its bounds, sixty times a second,
 * while the browser also recalculates layout. A transform stays on the
 * compositor and costs almost nothing, and the store still ends up as the
 * single source of truth the moment the gesture ends.
 */

interface GestureOptions {
  windowId: string;
  elementRef: RefObject<HTMLElement | null>;
  bounds: Rect;
  constraints: WindowConstraints;
  /** Maximised windows neither move nor resize. */
  disabled: boolean;
}

interface GestureState {
  pointerId: number;
  startX: number;
  startY: number;
  startBounds: Rect;
  edge: ResizeEdge | null;
}

export function useWindowGesture({
  windowId,
  elementRef,
  bounds,
  constraints,
  disabled,
}: GestureOptions) {
  const gesture = useRef<GestureState | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  const setBounds = useWindowStore((state) => state.setBounds);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  // A gesture interrupted by unmount must not leave listeners on window.
  useEffect(() => () => cleanup.current?.(), []);

  const begin = useCallback(
    (event: ReactPointerEvent<HTMLElement>, edge: ResizeEdge | null) => {
      // Primary button only, and never while maximised.
      if (disabled || event.button !== 0) return;
      if (edge !== null && !constraints.resizable) return;

      const element = elementRef.current;
      if (!element) return;

      focusWindow(windowId);
      event.preventDefault();

      const state: GestureState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startBounds: bounds,
        edge,
      };
      gesture.current = state;
      element.style.willChange = edge === null ? 'transform' : 'width, height';

      const onMove = (moveEvent: globalThis.PointerEvent) => {
        if (moveEvent.pointerId !== state.pointerId) return;

        const deltaX = moveEvent.clientX - state.startX;
        const deltaY = moveEvent.clientY - state.startY;

        if (edge === null) {
          element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
          return;
        }

        const next = resizeFromEdge(state.startBounds, edge, deltaX, deltaY, constraints);
        element.style.left = `${next.x}px`;
        element.style.top = `${next.y}px`;
        element.style.width = `${next.width}px`;
        element.style.height = `${next.height}px`;
      };

      const onEnd = (endEvent: globalThis.PointerEvent) => {
        if (endEvent.pointerId !== state.pointerId) return;

        const deltaX = endEvent.clientX - state.startX;
        const deltaY = endEvent.clientY - state.startY;

        const finalBounds =
          edge === null
            ? {
                ...state.startBounds,
                x: state.startBounds.x + deltaX,
                y: state.startBounds.y + deltaY,
              }
            : resizeFromEdge(state.startBounds, edge, deltaX, deltaY, constraints);

        // Strip the inline styles so React resumes control on the next render,
        // then hand the result to the store.
        element.style.transform = '';
        element.style.left = '';
        element.style.top = '';
        element.style.width = '';
        element.style.height = '';
        element.style.willChange = '';

        setBounds(windowId, finalBounds);
        gesture.current = null;
        detach();
      };

      const detach = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);
        cleanup.current = null;
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onEnd);
      window.addEventListener('pointercancel', onEnd);
      cleanup.current = detach;
    },
    [bounds, constraints, disabled, elementRef, focusWindow, setBounds, windowId],
  );

  const onDragStart = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => begin(event, null),
    [begin],
  );

  const onResizeStart = useCallback(
    (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => begin(event, edge),
    [begin],
  );

  return { onDragStart, onResizeStart };
}
