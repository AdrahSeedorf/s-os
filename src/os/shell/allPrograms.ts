import { getProjectsGroupedByCategory } from '@/lib/content';
import { applications, type AppDefinition } from '@/os/registry/applications';

/**
 * All Programs, grouped into folders.
 *
 * Groups are assigned here rather than declared on each application, because
 * grouping is a property of the menu's organisation, not of the program. An
 * application that belongs in two places later is a one-line change here
 * instead of a schema change.
 *
 * Projects are inserted as a group per category, straight from the content
 * registry — so a new project appears in All Programs with no edit to this
 * file at all.
 */

export interface ProgramEntry {
  key: string;
  label: string;
  icon: string;
  appId: string;
  params?: Record<string, string>;
  description: string;
}

export interface ProgramGroup {
  key: string;
  label: string;
  entries: readonly ProgramEntry[];
}

/** Which applications live in which folder, in display order. */
const GROUPS: readonly { key: string; label: string; appIds: readonly string[] }[] = [
  {
    key: 'professional',
    label: 'Professional',
    appIds: ['recruiter', 'about', 'skills', 'resume'],
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    appIds: ['projects', 'documents'],
  },
  {
    key: 'system',
    label: 'System Tools',
    appIds: ['terminal', 'explorer', 'system-info', 'settings'],
  },
  {
    key: 'communication',
    label: 'Communication',
    appIds: ['contact'],
  },
];

export function getProgramGroups(): readonly ProgramGroup[] {
  const appGroups: ProgramGroup[] = GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    entries: group.appIds
      .map((id) => applications.find((app) => app.id === id))
      .filter((app): app is AppDefinition => app !== undefined && app.hidden !== true)
      .map((app) => ({
        key: `app:${app.id}`,
        label: app.name,
        icon: app.icon,
        appId: app.id,
        description: app.description,
      })),
  })).filter((group) => group.entries.length > 0);

  const projectGroups: ProgramGroup[] = getProjectsGroupedByCategory().map((group) => ({
    key: `projects:${group.category}`,
    label: group.label,
    entries: group.projects.map((project) => ({
      key: `project:${project.id}`,
      label: project.executable,
      icon: project.icon,
      appId: 'project',
      params: { projectId: project.id },
      description: project.tagline,
    })),
  }));

  return [...appGroups, ...projectGroups];
}

/**
 * Any application not listed in a group above.
 *
 * Returned rather than silently dropped: a test asserts this is empty, so
 * adding an application without filing it into a folder fails the build
 * instead of quietly disappearing from All Programs.
 */
export function getUngroupedApps(): readonly string[] {
  const grouped = new Set(GROUPS.flatMap((group) => group.appIds));

  return applications
    .filter((app) => app.hidden !== true && !grouped.has(app.id))
    .map((app) => app.id);
}
