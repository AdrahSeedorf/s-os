'use client';

import { useEffect } from 'react';
import { Power } from 'lucide-react';
import { SosMark } from '@/components/brand';
import { Button } from '@/components/ui';
import { site } from '@/lib/config/site';
import { useSystemStore } from '@/stores/systemStore';

/** Shown briefly between shutdown and the powered-off screen. */
export function ShuttingDownScreen() {
  const completeShutdown = useSystemStore((state) => state.completeShutdown);

  useEffect(() => {
    const timer = setTimeout(completeShutdown, 1100);
    return () => clearTimeout(timer);
  }, [completeShutdown]);

  return (
    <div
      className="bg-void fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6"
      role="status"
    >
      <SosMark size={56} className="opacity-60" />
      <p className="text-muted font-mono text-[12px]">Shutting down {site.name}…</p>
    </div>
  );
}

/**
 * The powered-off state.
 *
 * A real dead-screen would be a dead end, so this offers an obvious way back
 * on. Shutting down a portfolio is a joke the visitor should be able to undo
 * without reaching for the reload button.
 */
export function PoweredOffScreen() {
  const powerOn = useSystemStore((state) => state.powerOn);

  return (
    <div className="bg-void fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <SosMark size={44} className="opacity-25" />
        <p className="text-disabled text-[12px]">
          {site.name} is powered off. It was nice having you.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        iconStart={<Power size={16} />}
        onClick={() => powerOn({ quick: true })}
        autoFocus
      >
        Power on
      </Button>
    </div>
  );
}
