import { BootManager } from '@/os/boot/BootManager';
import { Desktop } from '@/os/shell/Desktop';

/**
 * S-OS.
 *
 * The BootManager owns the session lifecycle and mounts the desktop only once
 * the visitor has entered — through boot and login, or straight past both via
 * a deep link.
 */
export default function SosPage() {
  return (
    <BootManager>
      <Desktop />
    </BootManager>
  );
}
