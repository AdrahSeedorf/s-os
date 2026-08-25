import { BootManager } from '@/os/boot/BootManager';
import { Shell } from '@/os/shell/Shell';

/**
 * S-OS.
 *
 * The BootManager owns the session lifecycle and mounts the shell only once
 * the visitor has entered — through boot and login, or straight past both via
 * a deep link. Shell then picks the desktop or the mobile presentation.
 */
export default function SosPage() {
  return (
    <BootManager>
      <Shell />
    </BootManager>
  );
}
