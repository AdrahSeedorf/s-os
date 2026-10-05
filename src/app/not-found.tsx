import type { Metadata } from 'next';
import { DialogAction, SystemDialog } from '@/components/system/SystemDialog';

export const metadata: Metadata = {
  title: 'Page not found',
  // A 404 that gets indexed is a 404 competing with the real pages for the
  // same search terms. Next sends the right status code; this makes the
  // intent explicit for crawlers that index on content rather than status.
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * Reached two ways: a mistyped or stale URL under the document routes, and a
 * deep link into a project that no longer exists. Both deserve the same
 * thing — a clear statement that the path is wrong, and three real routes
 * onward rather than a dead end with a joke on it.
 *
 * Deliberately not a boot-failure screen. A mistyped URL is the visitor's
 * slip, not a fault in the system, and dressing it up as a crash tells a
 * recruiter the site is broken.
 */
export default function NotFound() {
  return (
    <SystemDialog
      code="404"
      title="The system cannot find the path specified."
      message="That address does not match any program, project or document in S-OS. It may have been renamed, or the link may be out of date."
    >
      <DialogAction href="/" primary>
        Launch S-OS
      </DialogAction>
      <DialogAction href="/recruiter">Overview</DialogAction>
      <DialogAction href="/projects">All projects</DialogAction>
    </SystemDialog>
  );
}
