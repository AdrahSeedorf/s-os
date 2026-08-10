'use client';

import { LogOut, Power, RotateCcw } from 'lucide-react';
import { Badge, Button, GlassPanel } from '@/components/ui';
import { useSystemStore } from '@/stores/systemStore';

const SESSION_LABEL = {
  guest: 'Guest session',
  demo: 'Signed in as guest',
  recruiter: 'Recruiter Mode',
} as const;

/**
 * Temporary session controls for Milestone 3.
 *
 * These move into the Start menu's power section in Milestone 6. They exist
 * now so the log off, restart and shutdown transitions can be exercised
 * without a taskbar to hang them from.
 */
export function SessionBar() {
  const session = useSystemStore((state) => state.session);
  const pendingAppId = useSystemStore((state) => state.pendingAppId);
  const logOff = useSystemStore((state) => state.logOff);
  const restart = useSystemStore((state) => state.restart);
  const shutdown = useSystemStore((state) => state.shutdown);

  return (
    <GlassPanel tone="strong" className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-2.5">
        <Badge tone="accent" dot>
          {session ? SESSION_LABEL[session] : 'No session'}
        </Badge>
        {pendingAppId ? (
          <span className="text-muted font-mono text-[11px]">
            queued: {pendingAppId} (opens in Milestone 5)
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" iconStart={<LogOut size={13} />} onClick={logOff}>
          Log off
        </Button>
        <Button variant="ghost" size="sm" iconStart={<RotateCcw size={13} />} onClick={restart}>
          Restart
        </Button>
        <Button variant="ghost" size="sm" iconStart={<Power size={13} />} onClick={shutdown}>
          Shut down
        </Button>
      </div>
    </GlassPanel>
  );
}
