'use client';

import { useEffect } from 'react';
import { DialogAction, SystemDialog } from '@/components/system/SystemDialog';

/**
 * The runtime error boundary.
 *
 * Catches a failure inside the page — a bad render, a thrown effect — while
 * the root layout is still intact. Recoverable in principle, so the primary
 * action is `reset()` rather than a navigation: a transient failure is worth
 * one retry before sending someone back to the start.
 *
 * What it deliberately does not do is show the error. A stack trace means
 * nothing to a recruiter and something to an attacker, and Next.js already
 * redacts the message in production. The digest is shown instead — it is the
 * only thing that correlates this screen with a server log.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The console is the only sink there is: S-OS has no error reporting
    // service, by choice — one more third party watching visitors, for a
    // portfolio that gets a handful of hits a week, is a bad trade.
    console.error('S-OS failed to render', error);
  }, [error]);

  return (
    <SystemDialog
      code="500"
      title="A program stopped responding."
      message="Something failed while rendering this page. Trying again often clears it; if it does not, the rest of S-OS is still reachable."
    >
      <button
        type="button"
        onClick={reset}
        className="bg-accent-600 hover:bg-accent-500 text-primary inline-flex h-9 items-center rounded-md px-3.5 text-[13px] font-medium transition-colors duration-(--sos-duration-fast)"
      >
        Try again
      </button>
      <DialogAction href="/">Restart S-OS</DialogAction>
      <DialogAction href="/recruiter">Overview</DialogAction>

      {error.digest ? (
        <p className="text-disabled w-full pt-1 font-mono text-[11px]">
          Reference: {error.digest}
        </p>
      ) : null}
    </SystemDialog>
  );
}
