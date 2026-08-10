import { beforeEach, describe, expect, it } from 'vitest';
import { resetWindowStore, useWindowStore } from './windowStore';

const store = () => useWindowStore.getState();

beforeEach(() => {
  resetWindowStore();
});

describe('opening applications', () => {
  it('opens a window and focuses it', () => {
    const id = store().openApp('terminal');

    expect(id).not.toBeNull();
    expect(store().focusedId).toBe(id);
    expect(Object.keys(store().windows)).toHaveLength(1);
  });

  it('ignores an unknown application', () => {
    expect(store().openApp('not-a-real-app')).toBeNull();
    expect(Object.keys(store().windows)).toHaveLength(0);
  });

  it('focuses the existing window instead of opening a second one', () => {
    // Opening Terminal twice should give you the terminal you already have,
    // not a duplicate to lose track of.
    const first = store().openApp('terminal');
    store().openApp('about');
    const second = store().openApp('terminal');

    expect(second).toBe(first);
    expect(Object.keys(store().windows)).toHaveLength(2);
    expect(store().focusedId).toBe(first);
  });

  it('allows several project windows at once', () => {
    const first = store().openApp('project', { projectId: 's-os' });
    const second = store().openApp('project', { projectId: 'hotel-manager' });

    expect(second).not.toBe(first);
    expect(Object.keys(store().windows)).toHaveLength(2);
  });

  it('focuses an already open project rather than duplicating it', () => {
    const first = store().openApp('project', { projectId: 's-os' });
    const again = store().openApp('project', { projectId: 's-os' });

    expect(again).toBe(first);
    expect(Object.keys(store().windows)).toHaveLength(1);
  });

  it('passes the application id through to the window', () => {
    const id = store().openApp('about');
    expect(store().windows[id ?? '']?.params['appId']).toBe('about');
  });

  it('cascades successive windows so they do not stack exactly', () => {
    const first = store().openApp('about');
    const second = store().openApp('skills');

    const a = store().windows[first ?? '']?.bounds;
    const b = store().windows[second ?? '']?.bounds;

    expect(b?.x).not.toBe(a?.x);
  });
});

describe('focus', () => {
  it('moves the focused window to the top of the stack', () => {
    const first = store().openApp('about');
    store().openApp('skills');

    store().focusWindow(first ?? '');
    expect(store().order.at(-1)).toBe(first);
  });

  it('cycles between visible windows', () => {
    const first = store().openApp('about');
    const second = store().openApp('skills');

    expect(store().focusedId).toBe(second);
    store().cycleFocus();
    expect(store().focusedId).toBe(first);
  });
});

describe('minimise, maximise and restore', () => {
  it('hands focus to the window below when one is minimised', () => {
    const first = store().openApp('about');
    const second = store().openApp('skills');

    store().minimise(second ?? '');

    expect(store().windows[second ?? '']?.state).toBe('minimised');
    expect(store().focusedId).toBe(first);
  });

  it('remembers where a maximised window came from', () => {
    const id = store().openApp('about') ?? '';
    const original = store().windows[id]?.bounds;

    store().maximise(id);
    expect(store().windows[id]?.state).toBe('maximised');

    store().restore(id);
    expect(store().windows[id]?.state).toBe('normal');
    expect(store().windows[id]?.bounds).toEqual(original);
  });

  it('refuses to maximise a window that forbids it', () => {
    // Contact is a fixed-size form; stretching it to full screen would leave
    // a 500px form floating in a sea of empty glass.
    const id = store().openApp('contact') ?? '';
    store().maximise(id);
    expect(store().windows[id]?.state).toBe('normal');
  });

  it('restores a minimised window to the front', () => {
    const first = store().openApp('about') ?? '';
    store().openApp('skills');
    store().minimise(first);

    store().restore(first);

    expect(store().windows[first]?.state).toBe('normal');
    expect(store().focusedId).toBe(first);
  });
});

describe('taskbar behaviour', () => {
  it('minimises the window that is already focused', () => {
    const id = store().openApp('about') ?? '';
    store().toggleFromTaskbar(id);
    expect(store().windows[id]?.state).toBe('minimised');
  });

  it('restores a minimised window', () => {
    const id = store().openApp('about') ?? '';
    store().minimise(id);

    store().toggleFromTaskbar(id);
    expect(store().windows[id]?.state).toBe('normal');
  });

  it('brings an unfocused window forward rather than minimising it', () => {
    const first = store().openApp('about') ?? '';
    store().openApp('skills');

    store().toggleFromTaskbar(first);

    expect(store().windows[first]?.state).toBe('normal');
    expect(store().focusedId).toBe(first);
  });
});

describe('closing', () => {
  it('passes focus to whatever is now on top', () => {
    const first = store().openApp('about') ?? '';
    const second = store().openApp('skills') ?? '';

    store().closeWindow(second);

    expect(store().windows[second]).toBeUndefined();
    expect(store().focusedId).toBe(first);
  });

  it('leaves nothing focused once the last window closes', () => {
    const id = store().openApp('about') ?? '';
    store().closeWindow(id);

    expect(store().focusedId).toBeNull();
    expect(store().order).toEqual([]);
  });

  it('removes the window from the taskbar order too', () => {
    const id = store().openApp('about') ?? '';
    store().closeWindow(id);
    expect(store().creationOrder).toEqual([]);
  });
});

describe('moving and resizing', () => {
  it('moves a window by a delta', () => {
    const id = store().openApp('about') ?? '';
    const before = store().windows[id]?.bounds.x ?? 0;

    store().moveBy(id, 40, 0);
    expect(store().windows[id]?.bounds.x).toBe(before + 40);
  });

  it('refuses to move a maximised window', () => {
    const id = store().openApp('about') ?? '';
    store().maximise(id);
    const before = store().windows[id]?.bounds;

    store().moveBy(id, 40, 40);
    expect(store().windows[id]?.bounds).toEqual(before);
  });

  it('keeps a window dragged far off-screen reachable', () => {
    const id = store().openApp('about') ?? '';
    store().moveBy(id, 99_999, 99_999);

    const bounds = store().windows[id]?.bounds;
    expect(bounds?.x).toBeLessThan(store().viewport.width);
    expect(bounds?.y).toBeLessThan(store().viewport.height);
  });
});

describe('viewport changes', () => {
  it('re-fits every window when the viewport shrinks', () => {
    const id = store().openApp('explorer') ?? '';
    store().setViewport({ width: 500, height: 420, taskbarHeight: 44 });

    const bounds = store().windows[id]?.bounds;
    expect(bounds?.width).toBeLessThanOrEqual(500);
  });

  it('keeps a maximised window filling the new work area', () => {
    const id = store().openApp('about') ?? '';
    store().maximise(id);
    store().setViewport({ width: 900, height: 700, taskbarHeight: 44 });

    expect(store().windows[id]?.bounds).toEqual({ x: 0, y: 0, width: 900, height: 656 });
  });
});
