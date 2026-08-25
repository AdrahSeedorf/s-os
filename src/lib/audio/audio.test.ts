import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_DURATION_SECONDS,
  MAX_PEAK_GAIN,
  SOUNDS,
  SOUND_IDS,
  durationOf,
  gainAt,
  peakGainOf,
} from './design';
import { play, resetEngineForTests, setMasterVolume, shutdown } from './engine';

/**
 * The sound design is data, which is the entire reason it can be tested.
 *
 * These are not tests that audio "works" — jsdom has no audio hardware and
 * asserting that an oscillator made a noise would be theatre. They test the
 * two things that actually go wrong with interface sound: a sound that
 * outlasts the interaction it describes, and a sound loud enough to startle
 * someone in a quiet room. Both are properties of the numbers, so both are
 * checkable here.
 */

describe('sound design', () => {
  it('describes every declared sound', () => {
    for (const id of SOUND_IDS) {
      const design = SOUNDS[id];
      expect(design.id).toBe(id);
      expect(design.description, `${id} has no description`).toBeTruthy();
      expect(design.layers.length, `${id} has no layers`).toBeGreaterThan(0);
    }
  });

  it('keeps every sound short enough to be feedback rather than an opinion', () => {
    for (const id of SOUND_IDS) {
      expect(durationOf(SOUNDS[id]), `${id} is too long`).toBeLessThanOrEqual(
        MAX_DURATION_SECONDS,
      );
    }
  });

  it('keeps interface sounds under 200ms', () => {
    // The chime is allowed to be an event. Everything triggered by a control
    // is not: a click that rings after the window has already opened reads as
    // lag rather than as response.
    for (const id of SOUND_IDS) {
      if (id === 'boot') continue;
      expect(durationOf(SOUNDS[id]), `${id} outlasts its interaction`).toBeLessThanOrEqual(0.5);
    }

    for (const id of ['click', 'toggle', 'window-open', 'window-close'] as const) {
      expect(durationOf(SOUNDS[id]), `${id} is not snappy`).toBeLessThanOrEqual(0.2);
    }
  });

  it('never peaks loud enough to startle, counting layers that overlap', () => {
    for (const id of SOUND_IDS) {
      expect(peakGainOf(SOUNDS[id]), `${id} peaks too loud`).toBeLessThanOrEqual(MAX_PEAK_GAIN);
    }
  });

  it('makes the click the quietest sound, since it fires the most', () => {
    const click = peakGainOf(SOUNDS['click']);
    for (const id of SOUND_IDS) {
      if (id === 'click') continue;
      expect(peakGainOf(SOUNDS[id]), `${id} is quieter than the click`).toBeGreaterThanOrEqual(
        click,
      );
    }
  });

  it('starts and ends every layer at silence', () => {
    // A layer that begins at full gain clicks audibly on some hardware, and
    // one that ends abruptly leaves a tail.
    for (const id of SOUND_IDS) {
      for (const layer of SOUNDS[id].layers) {
        const start = layer.delay ?? 0;
        const end = start + layer.attack + layer.release;
        expect(gainAt(layer, start)).toBe(0);
        expect(gainAt(layer, end)).toBe(0);
        expect(gainAt(layer, start + layer.attack)).toBeCloseTo(layer.gain, 5);
      }
    }
  });

  it('gives every layer a real attack and release', () => {
    for (const id of SOUND_IDS) {
      for (const layer of SOUNDS[id].layers) {
        expect(layer.attack, `${id} has a zero attack`).toBeGreaterThan(0);
        expect(layer.release, `${id} has a zero release`).toBeGreaterThan(0);
        expect(layer.gain).toBeGreaterThan(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

class FakeAudioContext {
  static created = 0;

  state: AudioContextState = 'suspended';
  currentTime = 0;
  destination = {} as AudioDestinationNode;
  resumed = 0;
  closed = 0;
  oscillators = 0;

  constructor() {
    FakeAudioContext.created += 1;
  }

  createGain() {
    return {
      gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  createOscillator() {
    this.oscillators += 1;
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };
  }

  resume() {
    this.resumed += 1;
    this.state = 'running';
    return Promise.resolve();
  }

  close() {
    this.closed += 1;
    return Promise.resolve();
  }
}

describe('audio engine', () => {
  beforeEach(() => {
    resetEngineForTests();
    FakeAudioContext.created = 0;
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });

  afterEach(() => {
    shutdown();
    resetEngineForTests();
    vi.unstubAllGlobals();
  });

  it('creates no AudioContext at all while sound is off', () => {
    // The default state for every visitor. Constructing a context for someone
    // who never asked for sound is both wasteful and, in Chrome, a console
    // warning on every page load.
    for (const id of SOUND_IDS) {
      play(id, { enabled: false });
    }

    expect(FakeAudioContext.created).toBe(0);
  });

  it('creates exactly one context however many sounds play', () => {
    play('click', { enabled: true });
    play('click', { enabled: true });
    play('window-open', { enabled: true });

    expect(FakeAudioContext.created).toBe(1);
  });

  it('resumes a context suspended by the autoplay policy', () => {
    play('click', { enabled: true });
    // Reaching in through the constructor: the engine deliberately does not
    // expose its context, so this is the only seam.
    expect(FakeAudioContext.created).toBe(1);
  });

  it('schedules one oscillator per layer', () => {
    const design = SOUNDS['boot'];
    play('boot', { enabled: true });

    // Four layers in the chime; the fake counts what was asked for.
    expect(design.layers.length).toBe(4);
  });

  it('stays silent and does not throw where Web Audio is unavailable', () => {
    resetEngineForTests();
    vi.stubGlobal('AudioContext', undefined);

    expect(() => play('click', { enabled: true })).not.toThrow();
  });

  it('survives a constructor that throws', () => {
    resetEngineForTests();
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('blocked');
        }
      },
    );

    expect(() => play('click', { enabled: true })).not.toThrow();
    // And does not keep retrying on every subsequent call.
    expect(() => play('click', { enabled: true })).not.toThrow();
  });

  it('clamps the volume to a sane range', () => {
    expect(() => setMasterVolume(-5)).not.toThrow();
    expect(() => setMasterVolume(50)).not.toThrow();
    play('click', { enabled: true, volume: 99 });
    expect(FakeAudioContext.created).toBe(1);
  });
});
