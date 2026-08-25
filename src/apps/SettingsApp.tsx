'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { Badge, Button, GlassPanel } from '@/components/ui';
import { SOUNDS, SOUND_IDS } from '@/lib/audio/design';
import { play, shutdown } from '@/lib/audio/engine';
import { useSound } from '@/lib/audio/useSound';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { AppScreen, AppSection } from './shared/AppLayout';

/**
 * Settings.
 *
 * Three preferences, each of which is an accessibility control before it is a
 * personalisation. High contrast in particular had no user-facing switch
 * anywhere until this existed — a built feature that nobody could reach,
 * which is the same as an unbuilt one.
 *
 * Every control states what it does and what the current value is in text,
 * because a toggle whose state is carried only by its colour is exactly the
 * pattern this application exists to offer an alternative to.
 */
export function SettingsApp() {
  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const volume = usePreferencesStore((state) => state.volume);
  const motion = usePreferencesStore((state) => state.motion);
  const contrast = usePreferencesStore((state) => state.contrast);

  const setSoundEnabled = usePreferencesStore((state) => state.setSoundEnabled);
  const setVolume = usePreferencesStore((state) => state.setVolume);
  const setMotion = usePreferencesStore((state) => state.setMotion);
  const setContrast = usePreferencesStore((state) => state.setContrast);
  const reset = usePreferencesStore((state) => state.reset);

  const sound = useSound();
  const systemPrefersReducedMotion = useReducedMotion();

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);

    if (next) {
      // Demonstrate what was just enabled. Passing enabled explicitly because
      // the store update has not reached this closure yet.
      play('toggle', { enabled: true, volume });
    } else {
      // Turning sound off should also release the audio device, not just stop
      // making noise through it.
      shutdown();
    }
  };

  return (
    <AppScreen>
      <header className="flex flex-col gap-1">
        <h2 className="text-[16px] font-semibold">Settings</h2>
        <p className="text-muted text-[12px]">
          Sound, motion and contrast. Saved in this browser; nothing leaves it.
        </p>
      </header>

      <AppSection title="Sound">
        <GlassPanel className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-[13px] font-medium">System sounds</p>
              <p className="text-muted text-[11.5px]">
                {soundEnabled
                  ? 'On — windows, buttons and the sign-in chime.'
                  : 'Off. Sound is off by default, and stays off until you ask for it.'}
              </p>
            </div>

            <Button
              variant={soundEnabled ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggleSound}
              aria-pressed={soundEnabled}
              iconStart={soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            >
              {soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sos-volume" className="text-[12.5px]">
              Volume
              <span className="text-muted ml-2 font-mono text-[11px]">
                {Math.round(volume * 100)}%
              </span>
            </label>
            <input
              id="sos-volume"
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(volume * 100)}
              disabled={!soundEnabled}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
              // Preview on release rather than on every step, or dragging the
              // slider fires a burst of overlapping tones.
              onPointerUp={() => play('click', { enabled: soundEnabled, volume })}
              onKeyUp={() => play('click', { enabled: soundEnabled, volume })}
              className="accent-accent-500 w-full disabled:opacity-40"
            />
          </div>

          {soundEnabled ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted text-[11px] font-semibold tracking-[0.1em] uppercase">
                Preview
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SOUND_IDS.map((id) => (
                  <Button
                    key={id}
                    size="sm"
                    variant="ghost"
                    onClick={() => play(id, { enabled: true, volume })}
                  >
                    {SOUNDS[id].description}
                  </Button>
                ))}
              </div>
              <p className="text-muted text-[11.5px] leading-relaxed">
                Every sound is generated in the browser from an oscillator and an envelope —
                there are no audio files to download.
              </p>
            </div>
          ) : null}
        </GlassPanel>
      </AppSection>

      <AppSection title="Motion">
        <GlassPanel className="flex flex-col gap-3 p-4">
          <Choice
            label="Follow system setting"
            description={
              systemPrefersReducedMotion
                ? 'Your system currently asks for reduced motion, so animations are off.'
                : 'Your system has no preference set, so animations play normally.'
            }
            selected={motion === 'system'}
            onSelect={() => {
              setMotion('system');
              sound('toggle');
            }}
          />
          <Choice
            label="Always reduce motion"
            description="Collapses window animations and transitions to nothing."
            selected={motion === 'reduced'}
            onSelect={() => {
              setMotion('reduced');
              sound('toggle');
            }}
          />
        </GlassPanel>
      </AppSection>

      <AppSection title="Contrast">
        <GlassPanel className="flex flex-col gap-3 p-4">
          <Choice
            label="Standard"
            description="Translucent glass surfaces, as designed."
            selected={contrast === 'normal'}
            onSelect={() => {
              setContrast('normal');
              sound('toggle');
            }}
          />
          <Choice
            label="High contrast"
            description="Replaces every translucent surface with a solid fill and thickens the focus ring. Translucency is the biggest contrast risk in a design like this, so this mode removes it rather than merely darkening it."
            selected={contrast === 'high'}
            onSelect={() => {
              setContrast('high');
              sound('toggle');
            }}
          />
        </GlassPanel>
      </AppSection>

      <AppSection title="Reset">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={() => {
              reset();
              shutdown();
            }}
          >
            Restore defaults
          </Button>
          <p className="text-muted text-[11.5px]">
            Sound off, volume 40%, motion following your system, standard contrast.
          </p>
        </div>
      </AppSection>
    </AppScreen>
  );
}

/**
 * One option in a group.
 *
 * A button with `aria-pressed` rather than a radio: these apply immediately
 * and independently rather than being submitted, and a radio group implies a
 * form that has to be confirmed.
 */
function Choice({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex w-full items-start gap-3 rounded-sm border p-3 text-left',
        'transition-colors duration-(--sos-duration-fast)',
        selected
          ? 'border-accent-500/60 bg-glass-active'
          : 'border-glass-border hover:bg-glass',
      ].join(' ')}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium">
          {label}
          {selected ? <Badge tone="accent">Selected</Badge> : null}
        </span>
        <span className="text-muted text-[11.5px] leading-relaxed">{description}</span>
      </span>
    </button>
  );
}
