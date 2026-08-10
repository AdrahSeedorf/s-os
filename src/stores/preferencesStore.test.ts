import { beforeEach, describe, expect, it } from 'vitest';
import { defaultPreferences, usePreferencesStore } from './preferencesStore';

const state = () => usePreferencesStore.getState();
const STORAGE_KEY = 's-os:preferences';

beforeEach(() => {
  window.localStorage.clear();
  usePreferencesStore.setState({ ...defaultPreferences, hydrated: false });
});

describe('defaults', () => {
  it('starts muted', () => {
    // Non-negotiable: browsers block autoplay anyway, and unexpected audio in
    // an open-plan office is how a portfolio loses a reader.
    expect(state().soundEnabled).toBe(false);
  });

  it('defers to the operating system for motion', () => {
    expect(state().motion).toBe('system');
  });

  it('treats the first visit as a first boot', () => {
    expect(state().hasBootedBefore).toBe(false);
  });
});

describe('persistence', () => {
  it('writes changes to localStorage', () => {
    state().setContrast('high');

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '{}')).toMatchObject({ contrast: 'high' });
  });

  it('restores stored preferences on hydrate', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ soundEnabled: true, contrast: 'high', hasBootedBefore: true }),
    );

    state().hydrate();

    expect(state().soundEnabled).toBe(true);
    expect(state().contrast).toBe('high');
    expect(state().hasBootedBefore).toBe(true);
    expect(state().hydrated).toBe(true);
  });

  it('hydrates only once', () => {
    state().hydrate();
    state().setContrast('high');
    state().hydrate();

    expect(state().contrast).toBe('high');
  });
});

describe('untrusted stored data', () => {
  // localStorage is user-editable and may hold data from an older schema. A
  // bad value must fall back to the default rather than put the OS into a
  // state the type system says is impossible.
  it('survives malformed JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    state().hydrate();
    expect(state().contrast).toBe('normal');
  });

  it('ignores values of the wrong type', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ soundEnabled: 'yes please' }));
    state().hydrate();
    expect(state().soundEnabled).toBe(false);
  });

  it('ignores unrecognised enum values', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ motion: 'interpretive-dance' }));
    state().hydrate();
    expect(state().motion).toBe('system');
  });

  it('clamps volume into range', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: 99 }));
    state().hydrate();
    expect(state().volume).toBe(1);
  });

  it('keeps valid fields when a sibling is invalid', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ contrast: 'high', motion: 'nonsense' }),
    );
    state().hydrate();

    expect(state().contrast).toBe('high');
    expect(state().motion).toBe('system');
  });
});

describe('boot marker', () => {
  it('records the first boot and then stops writing', () => {
    state().markBooted();
    expect(state().hasBootedBefore).toBe(true);

    window.localStorage.removeItem(STORAGE_KEY);
    state().markBooted();

    // Already marked, so nothing was written a second time.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
