import { getDocuments, getProfile, getProjects, getSkills, getSnapshot } from '@/lib/content';
import { site } from '@/lib/config/site';
import { SKILL_CATEGORY_LABEL, type SkillCategory } from '@/types/content';

/**
 * The values shown in System Information.
 *
 * Derived from the content snapshot rather than typed out, so the specs cannot
 * quietly become wrong. "Programs installed: 5" is embarrassing precisely
 * because it is the kind of number nobody remembers to update — here it is
 * counted at render.
 */

export interface SystemSpec {
  label: string;
  value: string;
}

export function getSystemInfo(): readonly SystemSpec[] {
  const profile = getProfile();
  const projects = getProjects();
  const skills = getSkills();
  const snapshot = getSnapshot();

  const shipped = projects.filter(
    (project) => project.status === 'stable' || project.status === 'beta',
  );
  const inDevelopment = projects.filter((project) => project.status === 'in-development');

  return [
    { label: 'Operating system', value: site.name },
    { label: 'Full name', value: site.fullName },
    { label: 'Version', value: site.version },
    { label: 'Developer', value: profile.name },
    { label: 'System type', value: 'Developer workstation' },
    { label: 'Primary environment', value: 'Full-stack web development' },
    { label: 'Location', value: profile.location },
    { label: 'Programs installed', value: String(projects.length) },
    {
      label: 'Program status',
      // Stated honestly. A count of shipped work next to a count of work in
      // progress reads as active; hiding the second number reads as spin the
      // moment anyone opens a project.
      value: `${shipped.length} stable · ${inDevelopment.length} in development`,
    },
    { label: 'Technologies registered', value: String(skills.length) },
    { label: 'Documents', value: String(getDocuments().length) },
    { label: 'Drives mounted', value: 'C: D: E: F: G:' },
    { label: 'Education records', value: String(snapshot.education.length) },
  ];
}

/** Capability summary — skill counts per category, strongest categories first. */
export function getCapabilities(): readonly { label: string; count: number }[] {
  const counts = new Map<SkillCategory, number>();

  for (const skill of getSkills()) {
    counts.set(skill.category, (counts.get(skill.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ label: SKILL_CATEGORY_LABEL[category], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
