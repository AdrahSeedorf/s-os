import { create } from 'zustand';

/**
 * S-OS notifications.
 *
 * Used sparingly and only in response to something the visitor did. Unprompted
 * toasts on a portfolio are noise, and a system that congratulates itself for
 * opening a window is a system nobody trusts when it says something important.
 */

export type NotificationTone = 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  tone: NotificationTone;
  /** Milliseconds before auto-dismissal. Errors stay until dismissed. */
  duration: number;
}

export interface NotificationInput {
  title: string;
  description?: string;
  tone?: NotificationTone;
  duration?: number;
}

export interface NotificationState {
  notifications: Notification[];
  notify: (input: NotificationInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const DEFAULT_DURATION = 5000;
/** Older toasts are dropped rather than stacking off the screen. */
const MAX_VISIBLE = 3;

let counter = 0;

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  notify: (input) => {
    counter += 1;
    const id = `notification-${counter}`;
    const tone = input.tone ?? 'info';

    const notification: Notification = {
      id,
      title: input.title,
      tone,
      // Errors do not time out: an error the visitor missed is worse than one
      // they have to click away, and a failed contact form is exactly the case
      // where they need to know it did not send.
      duration: input.duration ?? (tone === 'error' ? 0 : DEFAULT_DURATION),
      ...(input.description === undefined ? {} : { description: input.description }),
    };

    set((state) => ({
      notifications: [...state.notifications, notification].slice(-MAX_VISIBLE),
    }));

    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((entry) => entry.id !== id),
    }));
  },

  dismissAll: () => set({ notifications: [] }),
}));

/** Test helper. */
export function resetNotifications(): void {
  counter = 0;
  useNotificationStore.setState({ notifications: [] });
}
