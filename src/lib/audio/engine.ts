import { SOUNDS, type Layer, type SoundDesign, type SoundId } from './design';

/**
 * The Web Audio layer.
 *
 * Everything that can be decided without an AudioContext lives in `design.ts`;
 * this module is the thin, untestable-in-jsdom part that turns those values
 * into sound. Keeping the split sharp is what lets the sound design itself be
 * covered by tests.
 *
 * Three rules govern this file:
 *
 *   1. **Never construct an AudioContext until asked to make a sound.**
 *      Browsers start one suspended and Chrome logs a warning for every
 *      context created before a gesture. A muted visitor — the default —
 *      should never cause one to exist at all.
 *   2. **Never throw.** Web Audio is unavailable in older Safari, in some
 *      embedded webviews, and under strict privacy settings. A portfolio that
 *      breaks because a decorative sound failed has its priorities backwards.
 *   3. **Never block.** `play` is fire-and-forget. Nothing in the interface
 *      waits on audio.
 */

type Engine = {
  context: AudioContext;
  master: GainNode;
};

let engine: Engine | null = null;
let unavailable = false;

/** Volume is read from the store at call time rather than held here, so a
 *  change in Settings applies to the very next sound. */
let currentVolume = 0.4;

export function setMasterVolume(volume: number): void {
  currentVolume = Math.min(1, Math.max(0, volume));
  if (engine) engine.master.gain.value = currentVolume;
}

function acquire(): Engine | null {
  if (engine) return engine;
  if (unavailable || typeof window === 'undefined') return null;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!Ctor) {
    unavailable = true;
    return null;
  }

  try {
    const context = new Ctor();
    const master = context.createGain();
    master.gain.value = currentVolume;
    master.connect(context.destination);
    engine = { context, master };
    return engine;
  } catch {
    // Blocked, or too many contexts already. Stay silent forever rather than
    // retrying on every click.
    unavailable = true;
    return null;
  }
}

function scheduleLayer(engineRef: Engine, layer: Layer, startAt: number): void {
  const { context, master } = engineRef;

  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = layer.wave;

  const begin = startAt + (layer.delay ?? 0);
  const peak = begin + layer.attack;
  const end = peak + layer.release;

  oscillator.frequency.setValueAtTime(layer.from, begin);
  if (layer.to !== layer.from) {
    // Exponential rather than linear: pitch is perceived logarithmically, so a
    // linear ramp sounds like it slows down as it rises.
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(layer.to, 1), end);
  }

  // Starting from a tiny non-zero value: exponential ramps cannot touch zero,
  // and a linear attack from silence clicks on some hardware.
  envelope.gain.setValueAtTime(0.0001, begin);
  envelope.gain.linearRampToValueAtTime(layer.gain, peak);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(envelope);
  envelope.connect(master);

  oscillator.start(begin);
  oscillator.stop(end + 0.01);

  // Release the nodes rather than leaving them for the collector: a click
  // sound fires hundreds of times in a session.
  oscillator.onended = () => {
    oscillator.disconnect();
    envelope.disconnect();
  };
}

/**
 * Play a sound, if sound is on and the browser will let us.
 *
 * `enabled` is passed in rather than read from the store so this module stays
 * free of React and of the store, and so the caller cannot forget that muting
 * is the default.
 */
export function play(id: SoundId, options: { enabled: boolean; volume?: number }): void {
  if (!options.enabled) return;
  if (typeof options.volume === 'number') setMasterVolume(options.volume);

  const engineRef = acquire();
  if (!engineRef) return;

  const design: SoundDesign = SOUNDS[id];

  try {
    // Autoplay policy: a context created before any gesture starts suspended.
    // Resuming is a promise we deliberately do not await — the first sound
    // after a gesture may be dropped, and dropping a click is better than
    // queueing one that arrives after the thing it describes.
    if (engineRef.context.state === 'suspended') {
      void engineRef.context.resume().catch(() => undefined);
    }

    const startAt = engineRef.context.currentTime;
    for (const layer of design.layers) {
      scheduleLayer(engineRef, layer, startAt);
    }
  } catch {
    // A scheduling failure is not worth an error boundary.
  }
}

/**
 * Release the AudioContext.
 *
 * Called when a visitor turns sound off, so an unused context is not left
 * holding an audio device open — on some systems that alone keeps a laptop's
 * audio hardware powered.
 */
export function shutdown(): void {
  if (!engine) return;

  const { context } = engine;
  engine = null;

  void context.close().catch(() => undefined);
}

/** Test seam: forget the cached context and the unavailable flag. */
export function resetEngineForTests(): void {
  engine = null;
  unavailable = false;
  currentVolume = 0.4;
}
