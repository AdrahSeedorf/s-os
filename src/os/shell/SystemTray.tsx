'use client';

import { Contrast, Volume2, VolumeX, Wifi } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { useClock } from '@/lib/hooks/useClock';
import { usePreferencesStore } from '@/stores/preferencesStore';

/**
 * The notification area.
 *
 * Only controls that do something. A battery indicator or a fake network
 * meter would sell the illusion a little harder and would also be a small lie
 * told in an interface a recruiter is reading — the network glyph here is
 * explicitly decorative and carries no accessible name.
 */
export function SystemTray() {
  const clock = useClock();

  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const setSoundEnabled = usePreferencesStore((state) => state.setSoundEnabled);
  const contrast = usePreferencesStore((state) => state.contrast);
  const setContrast = usePreferencesStore((state) => state.setContrast);

  return (
    <div className="flex items-center gap-0.5 pr-1 pl-2">
      <Wifi size={14} aria-hidden="true" className="text-muted mr-1" />

      <IconButton
        label={soundEnabled ? 'Mute system sound' : 'Enable system sound'}
        variant="chrome"
        size="sm"
        aria-pressed={soundEnabled}
        onClick={() => setSoundEnabled(!soundEnabled)}
      >
        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </IconButton>

      <IconButton
        label={contrast === 'high' ? 'Use standard contrast' : 'Use high contrast'}
        variant="chrome"
        size="sm"
        aria-pressed={contrast === 'high'}
        onClick={() => setContrast(contrast === 'high' ? 'normal' : 'high')}
      >
        <Contrast size={14} />
      </IconButton>

      {clock ? (
        <div className="px-2 text-right leading-tight">
          <p className="text-[12px] tabular-nums">
            <time dateTime={clock.iso}>{clock.time}</time>
          </p>
          <p className="text-muted text-[10px]">{shortDate(clock.date)}</p>
        </div>
      ) : (
        // Reserves the space the clock will occupy, so the tray does not jump
        // sideways the moment the client works out what time it is.
        <div className="w-[74px] px-2" aria-hidden="true" />
      )}
    </div>
  );
}

/** "Monday, 10 August 2026" → "10 Aug 2026", to fit the tray. */
function shortDate(value: string): string {
  const withoutWeekday = value.includes(', ') ? (value.split(', ')[1] ?? value) : value;
  return withoutWeekday.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
    (month) => month.slice(0, 3),
  );
}
