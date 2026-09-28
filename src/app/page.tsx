import { BootManager } from '@/os/boot/BootManager';
import { MonitorFrame } from '@/os/shell/MonitorFrame';
import { Shell } from '@/os/shell/Shell';

/**
 * S-OS.
 *
 * The MonitorFrame wraps everything, boot sequence included — the metaphor is
 * weaker if the machine only appears to be on a screen after you have logged
 * into it. The BootManager owns the session lifecycle and mounts the shell
 * once the visitor has entered, through boot and login or straight past both
 * via a deep link. Shell then picks the desktop or the mobile presentation.
 */
export default function SosPage() {
  return (
    <MonitorFrame>
      <BootManager>
        <Shell />
      </BootManager>
    </MonitorFrame>
  );
}
