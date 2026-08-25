/**
 * The keyboard shortcuts S-OS defines, as data.
 *
 * Kept here rather than inline in the application for the same reason the
 * projects are: one list, read by everything that needs it, so a shortcut
 * cannot be implemented and then go undocumented. A shortcut nobody can
 * discover may as well not exist — which is the whole argument for the
 * keyboard being a first-class input in an operating-system metaphor rather
 * than an afterthought bolted on at the end.
 */

export interface Shortcut {
  readonly keys: string;
  readonly action: string;
  /** Why it is this key and not the obvious one. Omitted where obvious. */
  readonly note?: string;
}

export interface ShortcutGroup {
  readonly title: string;
  readonly shortcuts: readonly Shortcut[];
}

export const SHORTCUT_GROUPS: readonly ShortcutGroup[] = [
  {
    title: 'Windows',
    shortcuts: [
      {
        keys: 'F6',
        action: 'Cycle to the next window',
        note: 'Alt+Tab and Ctrl+Tab belong to the browser and cannot be intercepted reliably.',
      },
      { keys: 'Shift + F6', action: 'Cycle to the previous window' },
      { keys: 'Escape', action: 'Close the focused window' },
      {
        keys: 'Alt + Arrows',
        action: 'Move the focused window',
        note: 'Arrows alone stay free for scrolling the application inside.',
      },
      { keys: 'Alt + Shift + Arrows', action: 'Resize the focused window' },
      { keys: 'Ctrl + Alt + Arrows', action: 'Move in larger steps' },
    ],
  },
  {
    title: 'Desktop and menus',
    shortcuts: [
      { keys: 'Arrows', action: 'Move between desktop icons' },
      { keys: 'Enter', action: 'Open the selected icon' },
      { keys: 'Tab', action: 'Move between the desktop, windows and the taskbar' },
    ],
  },
  {
    title: 'Terminal',
    shortcuts: [
      { keys: 'Tab', action: 'Complete a command, path or program name' },
      { keys: 'Up / Down', action: 'Walk back through command history' },
      { keys: 'help', action: 'List every available command' },
    ],
  },
];
