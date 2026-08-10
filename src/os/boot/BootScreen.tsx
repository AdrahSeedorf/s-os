'use client';

import { useEffect, useRef, useState } from 'react';
import { SosMark } from '@/components/brand';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useSystemStore } from '@/stores/systemStore';
import { getBootScript } from './bootSequence';

/**
 * The S-OS startup sequence.
 *
 * Three rules, all of them about respecting the visitor's time:
 *   1. It never exceeds its budget.
 *   2. Any key, click or tap skips it immediately.
 *   3. With reduced motion it does not run at all.
 */
export function BootScreen() {
  const quickBoot = useSystemStore((state) => state.quickBoot);
  const completeBoot = useSystemStore((state) => state.completeBoot);
  const skipBoot = useSystemStore((state) => state.skipBoot);
  const reducedMotion = useReducedMotion();

  const { lines, budget } = getBootScript(quickBoot);
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reduced motion skips the sequence entirely rather than playing it
  // instantly — the point is to remove the wait, not to flash it past.
  useEffect(() => {
    if (!reducedMotion) return;
    skipBoot();
  }, [reducedMotion, skipBoot]);

  useEffect(() => {
    if (reducedMotion) return;

    const timers = lines.map((line, index) =>
      setTimeout(() => setVisibleCount(index + 1), line.at),
    );
    const finish = setTimeout(completeBoot, budget);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [lines, budget, completeBoot, reducedMotion]);

  // Any input skips. Focus moves here on mount so a keypress lands without the
  // visitor having to click the page first.
  useEffect(() => {
    containerRef.current?.focus();

    const onInput = () => skipBoot();
    window.addEventListener('keydown', onInput);
    window.addEventListener('pointerdown', onInput);

    return () => {
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('pointerdown', onInput);
    };
  }, [skipBoot]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="bg-void fixed inset-0 z-[10000] flex flex-col items-center justify-center outline-none"
      // The sequence is decorative; the meaningful announcement is the login
      // screen that follows. Reading six progress lines to a screen-reader
      // user before the actual content would be noise.
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="animate-[sos-boot-pulse_1.8s_ease-in-out_infinite]">
          <SosMark size={84} />
        </div>

        <div className="flex h-32 w-[min(90vw,30rem)] flex-col items-center gap-1.5">
          {lines.slice(0, visibleCount).map((line) => (
            <p
              key={line.text}
              className={
                line.emphasis
                  ? 'text-accent-200 text-[13px] font-medium tracking-[0.16em] uppercase'
                  : 'text-muted font-mono text-[11.5px]'
              }
            >
              {line.text}
            </p>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={skipBoot}
        className="text-disabled hover:text-secondary absolute bottom-10 text-[11px] tracking-wide transition-colors"
      >
        Press any key to skip
      </button>

      <style>{`
        @keyframes sos-boot-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.97); }
          50%      { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
