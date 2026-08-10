import { Badge } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import type { AppProps } from '@/os/registry/applications';
import { getApp } from '@/os/registry/applications';

interface PlaceholderAppProps extends AppProps {
  milestone: string;
}

/**
 * Stands in for an application that has not been built yet.
 *
 * Deliberately honest rather than a convincing empty shell. A visitor who
 * opens Terminal before Milestone 9 should be told it is not finished, not
 * left wondering whether they broke it — and the same rule governs how
 * unfinished projects are presented everywhere else in S-OS.
 */
export function PlaceholderApp({ params, milestone }: PlaceholderAppProps) {
  const appId = params['appId'] ?? '';
  const app = getApp(appId);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <ProgramIcon icon={app?.icon ?? 'document'} size={48} className="opacity-70" />

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-[15px] font-semibold">{app?.name ?? 'Application'}</h2>
        {app ? <p className="text-muted max-w-sm text-[12.5px]">{app.description}</p> : null}
      </div>

      <Badge tone="dev" dot>
        Arrives in {milestone}
      </Badge>
    </div>
  );
}
