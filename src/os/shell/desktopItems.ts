import { getDesktopProjects } from '@/lib/content';
import { applications } from '@/os/registry/applications';

/**
 * What appears on the desktop.
 *
 * Derived, not authored. Applications opt in with `desktopShortcut`, projects
 * opt in with the same flag in their content file, and this function merges
 * the two. Nobody maintains a separate list of desktop icons that could drift
 * out of step with what is actually installed.
 *
 * Programs come first, then projects, because the professional fast-tracks are
 * what a recruiter needs and the projects are what they explore afterwards.
 */

export interface DesktopItem {
  /** Unique within the desktop, used for selection and keyboard focus. */
  key: string;
  label: string;
  icon: string;
  appId: string;
  params?: Record<string, string>;
  /** Read out after the label, so a screen-reader user knows what the icon
   *  opens before deciding to activate it. */
  description: string;
}

export function getDesktopItems(): readonly DesktopItem[] {
  const programs: DesktopItem[] = applications
    .filter((app) => app.desktopShortcut === true && app.hidden !== true)
    .map((app) => ({
      key: `app:${app.id}`,
      label: app.name,
      icon: app.icon,
      appId: app.id,
      description: app.description,
    }));

  const projects: DesktopItem[] = getDesktopProjects().map((project) => ({
    key: `project:${project.id}`,
    // Desktop icons use the executable name — the detail that makes a project
    // read as an installed program rather than a portfolio card.
    label: project.executable,
    icon: project.icon,
    appId: 'project',
    params: { projectId: project.id },
    description: project.tagline,
  }));

  return [...programs, ...projects];
}
