import { describe, expect, it } from 'vitest';
import { applications, getApp } from './applications';
import { iconRegistry } from '@/components/icons';

/**
 * The application registry's contract.
 *
 * The S-OS project page makes two public claims about this file: that every
 * program declares itself here, and that applications are mounted lazily so a
 * visitor who never opens the terminal never downloads it. The second was
 * false until the M15 audit — every application was imported eagerly — so it
 * is now asserted rather than described.
 */

/** React marks a lazy component with this symbol. */
const LAZY = Symbol.for('react.lazy');

describe('code splitting', () => {
  it('defers every application', () => {
    // A static import here would quietly put the whole application back in
    // the first-load bundle, and nothing else in the build would complain.
    for (const app of applications) {
      const component = app.component as unknown as { $$typeof?: symbol };
      expect(component.$$typeof, `${app.id} is not lazily loaded`).toBe(LAZY);
    }
  });

  it('keeps the metadata eager, so programs can be described without running them', () => {
    // The Start menu, search, Explorer and the terminal all list programs
    // they have never opened. If this had to await a chunk, every one of
    // those surfaces would need a loading state for no reason.
    for (const app of applications) {
      expect(app.name, `${app.id} has no name`).toBeTruthy();
      expect(app.title, `${app.id} has no title`).toBeTruthy();
      expect(app.description, `${app.id} has no description`).toBeTruthy();
      expect(app.defaultSize.width).toBeGreaterThan(0);
      expect(app.defaultSize.height).toBeGreaterThan(0);
    }
  });
});

describe('registry integrity', () => {
  it('gives every application a unique id', () => {
    const ids = applications.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only references icons that exist', () => {
    for (const app of applications) {
      expect(iconRegistry[app.icon], `${app.id} uses unknown icon "${app.icon}"`).toBeDefined();
    }
  });

  it('finds an application by id and returns undefined for an unknown one', () => {
    expect(getApp('terminal')?.name).toBe('Terminal');
    expect(getApp('not-a-real-app')).toBeUndefined();
  });

  it('never pins or shortcuts a hidden application', () => {
    // A hidden program is one that something else opens on your behalf, so a
    // shortcut to it would be a dead end with no context.
    for (const app of applications.filter((entry) => entry.hidden)) {
      expect(app.desktopShortcut, `${app.id} is hidden but has a shortcut`).not.toBe(true);
      expect(app.pinned, `${app.id} is hidden but is pinned`).not.toBe(true);
    }
  });
});
