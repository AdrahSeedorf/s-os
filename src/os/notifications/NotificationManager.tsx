'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  useNotificationStore,
  type Notification,
  type NotificationTone,
} from '@/stores/notificationStore';

const TONE_STYLES: Record<NotificationTone, { border: string; icon: string }> = {
  info: { border: 'border-l-accent-400', icon: 'text-accent-300' },
  success: { border: 'border-l-status-stable', icon: 'text-status-stable' },
  error: { border: 'border-l-status-danger', icon: 'text-status-danger' },
};

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
} as const;

/**
 * Toast notifications, above the taskbar.
 *
 * The region is `polite` rather than `assertive` even for errors: the failure
 * cases here are things like a contact form not sending, where the visitor is
 * already looking at the form and being interrupted mid-sentence helps nobody.
 */
export function NotificationManager() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed right-3 bottom-[calc(var(--sos-taskbar-height)+12px)] flex w-[min(92vw,22rem)] flex-col gap-2"
      style={{ zIndex: 'var(--sos-z-notification)' }}
    >
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function Toast({ notification }: { notification: Notification }) {
  const dismiss = useNotificationStore((state) => state.dismiss);
  const Icon = TONE_ICON[notification.tone];
  const styles = TONE_STYLES[notification.tone];

  useEffect(() => {
    if (notification.duration <= 0) return;

    const timer = setTimeout(() => dismiss(notification.id), notification.duration);
    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, dismiss]);

  return (
    <div
      className={cn(
        'sos-menu pointer-events-auto flex items-start gap-2.5 rounded-md border-l-4 p-3',
        'motion-safe:animate-[sos-toast-in_var(--sos-duration-normal)_var(--ease-out-os)]',
        styles.border,
      )}
    >
      <Icon size={16} aria-hidden="true" className={cn('mt-0.5 shrink-0', styles.icon)} />

      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium">{notification.title}</p>
        {notification.description ? (
          <p className="text-muted mt-0.5 text-[11.5px] leading-relaxed">
            {notification.description}
          </p>
        ) : null}
      </div>

      <IconButton
        label="Dismiss notification"
        variant="chrome"
        size="sm"
        onClick={() => dismiss(notification.id)}
      >
        <X size={13} />
      </IconButton>
    </div>
  );
}
