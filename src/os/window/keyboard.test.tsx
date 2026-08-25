import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OSWindow } from './OSWindow';
import { WindowManager } from './WindowManager';
import { resetWindowStore, useWindowStore } from '@/stores/windowStore';
import { DEFAULT_CONSTRAINTS, type WindowInstance } from '@/types/window';

/**
 * Keyboard operability and focus placement.
 *
 * The brief makes full keyboard control a hard constraint, and the S-OS
 * project page claims it publicly — so these are tests of a promise rather
 * than of an implementation detail. Each one pins a defect the M15 audit
 * found, because "we fixed it once" is not a guarantee.
 */

const store = () => useWindowStore.getState();

beforeEach(() => {
  resetWindowStore();
});

function makeWindow(overrides: Partial<WindowInstance> = {}): WindowInstance {
  return {
    id: 'w1',
    appId: 'about',
    title: 'About Seedorf',
    icon: 'about',
    state: 'normal',
    bounds: { x: 100, y: 100, width: 480, height: 360 },
    restoreBounds: null,
    params: {},
    constraints: DEFAULT_CONSTRAINTS,
    ...overrides,
  };
}

describe('window focus placement', () => {
  it('puts real focus on a window that becomes focused, not just the styling', async () => {
    // The defect: the store tracked focusedId, the border changed, and the
    // keyboard stayed wherever it had been. F6, a taskbar click and the
    // promotion after a close all went through this path.
    const instance = makeWindow();
    const { rerender } = render(<OSWindow instance={instance} isFocused={false} />);

    const dialog = screen.getByRole('dialog', { name: 'About Seedorf' });
    expect(dialog).not.toHaveFocus();

    rerender(<OSWindow instance={instance} isFocused />);
    expect(dialog).toHaveFocus();
  });

  it('does not snatch focus back from a control inside the window', async () => {
    // The containment guard. Without it, any re-render while focused would
    // eject the user from whatever they were typing in.
    const user = userEvent.setup();
    const instance = makeWindow({ appId: 'contact', title: 'Contact' });

    const { rerender } = render(<OSWindow instance={instance} isFocused />);

    // Applications are code-split, so the body arrives after a tick — find*
    // rather than get*, or this asserts against the Suspense fallback.
    const inputs = await screen.findAllByRole('textbox');
    const first = inputs[0];
    expect(first).toBeDefined();
    if (!first) return;

    await user.click(first);
    expect(first).toHaveFocus();

    rerender(<OSWindow instance={{ ...instance }} isFocused />);
    expect(first).toHaveFocus();
  });
});

describe('window keyboard control', () => {
  it('moves the window with Alt and an arrow key', async () => {
    const user = userEvent.setup();
    const id = store().openApp('about');
    expect(id).not.toBeNull();
    if (!id) return;

    render(<WindowManager />);
    const before = store().windows[id]?.bounds.x ?? 0;

    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');
    expect(store().windows[id]?.bounds.x).toBeGreaterThan(before);
  });

  it('resizes with Alt, Shift and an arrow key', async () => {
    const user = userEvent.setup();
    const id = store().openApp('about');
    if (!id) return;

    render(<WindowManager />);
    const before = store().windows[id]?.bounds.width ?? 0;

    await user.keyboard('{Alt>}{Shift>}{ArrowRight}{/Shift}{/Alt}');
    expect(store().windows[id]?.bounds.width).toBeGreaterThan(before);
  });

  it('leaves Alt+arrow alone inside a text field', async () => {
    // On macOS these are word-navigation keys. Moving the window instead
    // would silently break editing in the Contact form and the terminal.
    const user = userEvent.setup();
    const id = store().openApp('contact');
    if (!id) return;

    render(<WindowManager />);
    const before = store().windows[id]?.bounds.x;

    const input = (await screen.findAllByRole('textbox'))[0];
    expect(input).toBeDefined();
    if (!input) return;

    await user.click(input);
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(store().windows[id]?.bounds.x).toBe(before);
  });

  it('closes the focused window with Escape', async () => {
    const user = userEvent.setup();
    const id = store().openApp('about');
    if (!id) return;

    render(<WindowManager />);
    await user.keyboard('{Escape}');

    expect(store().windows[id]).toBeUndefined();
  });

  it('does not close the window when Escape is pressed in a text field', async () => {
    const user = userEvent.setup();
    const id = store().openApp('contact');
    if (!id) return;

    render(<WindowManager />);

    const input = (await screen.findAllByRole('textbox'))[0];
    if (!input) return;

    await user.click(input);
    await user.keyboard('{Escape}');

    expect(store().windows[id]).toBeDefined();
  });

  it('cycles windows with F6 and takes the keyboard with it', async () => {
    const user = userEvent.setup();
    const first = store().openApp('about');
    const second = store().openApp('terminal');
    expect(first).not.toBe(second);

    render(<WindowManager />);
    expect(store().focusedId).toBe(second);

    await user.keyboard('{F6}');
    expect(store().focusedId).toBe(first);

    const dialogs = screen.getAllByRole('dialog');
    const focused = dialogs.find((dialog) => dialog.dataset['windowId'] === store().focusedId);
    expect(focused).toBeDefined();
    expect(focused).toHaveFocus();
  });
});
