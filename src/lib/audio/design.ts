/**
 * The S-OS sound design, as data.
 *
 * Every sound is synthesised at runtime from the descriptions below rather
 * than loaded from an audio file. Three reasons, in order of how much they
 * mattered:
 *
 *   1. Nothing to license, attribute or get wrong. A portfolio shipping
 *      sound effects of uncertain provenance is a small legal problem hiding
 *      in a small aesthetic feature.
 *   2. The whole set costs zero bytes of network. Eleven short files would
 *      have cost more than the entire application layer now does.
 *   3. It is testable. A file is an opaque blob; this is a value, and the
 *      tests below it can assert that no sound is long enough to become an
 *      obstacle or loud enough to be a shock.
 *
 * The design brief is "mechanical, not musical". Windows 7 chimed; S-OS ticks
 * and hums. Everything except the boot chime is under 200ms, because an
 * interface sound that outlasts the interaction it describes stops being
 * feedback and starts being an opinion.
 *
 * Frequencies are in hertz, times in seconds, gains in the 0..1 range before
 * the visitor's own volume preference is applied.
 */

export type SoundId =
  | 'boot'
  | 'login'
  | 'window-open'
  | 'window-close'
  | 'window-minimise'
  | 'window-maximise'
  | 'click'
  | 'toggle'
  | 'error';

export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth';

/**
 * One oscillator with an amplitude envelope.
 *
 * Attack and release are separate because the difference between a click and
 * a thud is entirely in the attack: a few milliseconds reads as mechanical,
 * anything longer reads as a swell.
 */
export interface Layer {
  readonly wave: Waveform;
  /** Starting frequency. */
  readonly from: number;
  /** Ending frequency. Equal to `from` for a steady tone; a glide otherwise. */
  readonly to: number;
  /** Peak gain before the volume preference. */
  readonly gain: number;
  /** Seconds from silence to peak. */
  readonly attack: number;
  /** Seconds from peak back to silence. */
  readonly release: number;
  /** Seconds to wait before this layer starts, for arpeggios and stacks. */
  readonly delay?: number;
}

export interface SoundDesign {
  readonly id: SoundId;
  /** What it is for, in one line. Read by the Settings preview list. */
  readonly description: string;
  readonly layers: readonly Layer[];
}

/** No sound may run longer than this. Enforced by a test. */
export const MAX_DURATION_SECONDS = 1.6;

/** Nor peak louder than this, summed across simultaneous layers. */
export const MAX_PEAK_GAIN = 0.5;

/** Total wall-clock length of a sound, including delayed layers. */
export function durationOf(design: SoundDesign): number {
  return design.layers.reduce((longest, layer) => {
    const end = (layer.delay ?? 0) + layer.attack + layer.release;
    return Math.max(longest, end);
  }, 0);
}

/**
 * The worst-case simultaneous gain.
 *
 * Summed rather than maxed, because two oscillators peaking together really
 * do add — this is the number that decides whether the boot chime is a
 * flourish or a fright at 2am in a quiet room.
 */
export function peakGainOf(design: SoundDesign): number {
  const points = design.layers.flatMap((layer) => [
    (layer.delay ?? 0) + layer.attack,
    (layer.delay ?? 0) + layer.attack + layer.release,
  ]);

  return Math.max(
    ...points.map((time) =>
      design.layers.reduce((sum, layer) => sum + gainAt(layer, time), 0),
    ),
  );
}

/** A layer's envelope value at a moment in time. Linear on both slopes. */
export function gainAt(layer: Layer, time: number): number {
  const start = layer.delay ?? 0;
  const peak = start + layer.attack;
  const end = peak + layer.release;

  if (time <= start || time >= end) return 0;
  if (time < peak) return layer.gain * ((time - start) / layer.attack);

  return layer.gain * (1 - (time - peak) / layer.release);
}

// ---------------------------------------------------------------------------
// The sounds
// ---------------------------------------------------------------------------

/**
 * A rising perfect fifth over a low pad — the one deliberately musical sound
 * in the system, because booting is the one moment that should feel like an
 * event rather than a control.
 */
const boot: SoundDesign = {
  id: 'boot',
  description: 'Startup chime',
  layers: [
    { wave: 'sine', from: 196, to: 196, gain: 0.12, attack: 0.08, release: 0.9 },
    { wave: 'sine', from: 392, to: 392, gain: 0.1, attack: 0.05, release: 0.55, delay: 0.06 },
    { wave: 'sine', from: 587.33, to: 587.33, gain: 0.09, attack: 0.05, release: 0.5, delay: 0.2 },
    { wave: 'triangle', from: 783.99, to: 783.99, gain: 0.05, attack: 0.04, release: 0.45, delay: 0.34 },
  ],
};

/** The same shape, shorter and an octave up: a confirmation, not an overture. */
const login: SoundDesign = {
  id: 'login',
  description: 'Signing in',
  layers: [
    { wave: 'sine', from: 523.25, to: 523.25, gain: 0.09, attack: 0.02, release: 0.22 },
    { wave: 'sine', from: 783.99, to: 783.99, gain: 0.07, attack: 0.02, release: 0.26, delay: 0.08 },
  ],
};

/** Upward glide — something arriving. */
const windowOpen: SoundDesign = {
  id: 'window-open',
  description: 'Window opens',
  layers: [
    { wave: 'triangle', from: 320, to: 560, gain: 0.07, attack: 0.006, release: 0.11 },
  ],
};

/** The same glide reversed, slightly shorter. Symmetry is the point. */
const windowClose: SoundDesign = {
  id: 'window-close',
  description: 'Window closes',
  layers: [{ wave: 'triangle', from: 520, to: 280, gain: 0.07, attack: 0.005, release: 0.09 }],
};

const windowMinimise: SoundDesign = {
  id: 'window-minimise',
  description: 'Window minimises',
  layers: [{ wave: 'sine', from: 440, to: 220, gain: 0.06, attack: 0.005, release: 0.1 }],
};

const windowMaximise: SoundDesign = {
  id: 'window-maximise',
  description: 'Window maximises',
  layers: [{ wave: 'sine', from: 330, to: 520, gain: 0.06, attack: 0.005, release: 0.09 }],
};

/**
 * The click.
 *
 * Very short and quite quiet, because it fires more than every other sound
 * combined. A 3ms attack on a square wave is what makes it read as a
 * mechanism rather than a note.
 */
const click: SoundDesign = {
  id: 'click',
  description: 'Buttons and menu items',
  layers: [{ wave: 'square', from: 1100, to: 900, gain: 0.028, attack: 0.003, release: 0.032 }],
};

/** A click with a second, higher tick — a switch has two positions. */
const toggle: SoundDesign = {
  id: 'toggle',
  description: 'Switches and checkboxes',
  layers: [
    { wave: 'square', from: 900, to: 900, gain: 0.03, attack: 0.003, release: 0.028 },
    { wave: 'square', from: 1350, to: 1350, gain: 0.024, attack: 0.003, release: 0.03, delay: 0.05 },
  ],
};

/**
 * Deliberately not a buzzer.
 *
 * A harsh error tone is startling, and being startled by a form is worse than
 * the form failing. This is a soft falling minor third — audible as "no", not
 * as an alarm. Meaning never rests on the sound alone; every failure it
 * accompanies also states itself in text.
 */
const error: SoundDesign = {
  id: 'error',
  description: 'Something did not work',
  layers: [
    { wave: 'sine', from: 392, to: 392, gain: 0.07, attack: 0.01, release: 0.16 },
    { wave: 'sine', from: 329.63, to: 329.63, gain: 0.07, attack: 0.01, release: 0.22, delay: 0.1 },
  ],
};

export const SOUNDS: Readonly<Record<SoundId, SoundDesign>> = {
  boot,
  login,
  'window-open': windowOpen,
  'window-close': windowClose,
  'window-minimise': windowMinimise,
  'window-maximise': windowMaximise,
  click,
  toggle,
  error,
};

export const SOUND_IDS = Object.keys(SOUNDS) as readonly SoundId[];
