import type { ReactNode } from 'react';

export type DialogTone = 'error' | 'warning';

/**
 * A system error dialog, outside the operating system.
 *
 * Used by the pages that fire when something has gone wrong — a bad URL, a
 * runtime failure — where the OS shell is not available to render a real
 * window. It borrows the window chrome's vocabulary so the moment still feels
 * like S-OS, but it is a plain document underneath: no window manager, no
 * store, no JavaScript required to read it.
 *
 * The rule it follows is the one every error screen should: be charming
 * second and useful first. Someone reaching this page followed a broken link,
 * possibly from a job application, and what they need is a way onward — so
 * the actions are real navigation, not a joke.
 */
export function SystemDialog({
  code,
  title,
  message,
  tone = 'error',
  children,
}: {
  /** Shown in the title bar, e.g. "404". Short enough to read at a glance. */
  code: string;
  title: string;
  message: string;
  tone?: DialogTone;
  /** The actions. Always at least one route onward. */
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-12">
      <section
        // A real heading and a real region rather than role="alertdialog":
        // nothing is being interrupted and there is nothing to dismiss, so
        // announcing it as a dialog would misdescribe the page.
        aria-labelledby="sos-dialog-title"
        className="bg-chrome border-glass-border-strong shadow-window w-full max-w-md overflow-hidden rounded-(--sos-radius-window) border backdrop-blur-(--sos-glass-blur)"
      >
        <header className="bg-glass-strong border-glass-border flex h-(--sos-titlebar-height) shrink-0 items-center gap-2 border-b px-3">
          <span
            aria-hidden="true"
            className={[
              'size-2.5 shrink-0 rounded-full',
              tone === 'error' ? 'bg-status-danger' : 'bg-status-dev',
            ].join(' ')}
          />
          <p className="text-muted font-mono text-[11.5px]">
            S-OS · Error {code}
          </p>
        </header>

        <div className="flex flex-col gap-4 p-5">
          <h1 id="sos-dialog-title" className="text-[16px] font-semibold">
            {title}
          </h1>

          <p className="text-secondary text-[13px] leading-relaxed">{message}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">{children}</div>
        </div>
      </section>
    </div>
  );
}

/**
 * An action in a system dialog.
 *
 * A plain anchor rather than the Button primitive: these pages render when
 * something has already failed, and an error screen that depends on the
 * component library and the sound engine to show a link is an error screen
 * with a second way to break.
 */
export function DialogAction({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={[
        'inline-flex h-9 items-center rounded-md px-3.5 text-[13px] font-medium',
        'transition-colors duration-(--sos-duration-fast)',
        primary
          ? 'bg-accent-600 hover:bg-accent-500 text-primary'
          : 'bg-glass hover:bg-glass-strong border-glass-border text-secondary border',
      ].join(' ')}
    >
      {children}
    </a>
  );
}
