import { snapshot as staticSnapshot } from '@/data';
import {
  PROJECT_CATEGORY_LABEL,
  SKILL_CATEGORY_LABEL,
  SKILL_LEVEL_ORDER,
} from '@/types/content';
import type {
  Certification,
  ContentSnapshot,
  Education,
  Experience,
  PortfolioDocument,
  Profile,
  Project,
  ProjectCategory,
  ProjectId,
  ProjectStatus,
  Skill,
  SkillCategory,
  SkillId,
} from '@/types/content';

/**
 * The content accessor layer — the single seam between S-OS and its data.
 *
 * Applications must not import from `@/data` directly; an ESLint rule enforces
 * it. Everything here is synchronous over an in-memory snapshot, which stays
 * true in V2: the server will load the snapshot from a database and hand it to
 * the client shell, and these functions will not change.
 */

let active: ContentSnapshot = staticSnapshot;

/** Swap the backing snapshot. Used by tests, and by V2's database loader. */
export function setContentSnapshot(next: ContentSnapshot): void {
  active = next;
}

export function resetContentSnapshot(): void {
  active = staticSnapshot;
}

export function getSnapshot(): ContentSnapshot {
  return active;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export function getProfile(): Profile {
  return active.profile;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function getProjects(): readonly Project[] {
  return active.projects;
}

export function getProjectById(id: ProjectId): Project | undefined {
  return active.projects.find((project) => project.id === id);
}

/**
 * Recruiter Mode's shortlist. Planned work is excluded regardless of the
 * `featured` flag — the strongest-work section is the one place where an
 * unstarted project would actively mislead.
 */
export function getFeaturedProjects(): readonly Project[] {
  return active.projects.filter((project) => project.featured && project.status !== 'planned');
}

/** Projects with a desktop shortcut, in registry order. */
export function getDesktopProjects(): readonly Project[] {
  return active.projects.filter((project) => project.desktopShortcut);
}

export function getProjectsByStatus(status: ProjectStatus): readonly Project[] {
  return active.projects.filter((project) => project.status === status);
}

export function getProjectsByCategory(category: ProjectCategory): readonly Project[] {
  return active.projects.filter((project) => project.category === category);
}

export interface ProjectCategoryGroup {
  readonly category: ProjectCategory;
  readonly label: string;
  readonly projects: readonly Project[];
}

/**
 * Projects grouped for the explorer's folder view. Empty categories are
 * dropped, so a category can be added to the type without producing an empty
 * folder until something actually lives in it.
 */
export function getProjectsGroupedByCategory(): readonly ProjectCategoryGroup[] {
  const groups = new Map<ProjectCategory, Project[]>();

  for (const project of active.projects) {
    const existing = groups.get(project.category);
    if (existing) {
      existing.push(project);
    } else {
      groups.set(project.category, [project]);
    }
  }

  return [...groups.entries()].map(([category, projects]) => ({
    category,
    label: PROJECT_CATEGORY_LABEL[category],
    projects,
  }));
}

/** Projects that demonstrate a given skill. Derived, never stored — which is
 *  why the Skills application can never disagree with a project page. */
export function getProjectsUsingSkill(skillId: SkillId): readonly Project[] {
  return active.projects.filter((project) => project.technologies.includes(skillId));
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function getSkills(): readonly Skill[] {
  return active.skills;
}

export function getSkillById(id: SkillId): Skill | undefined {
  return active.skills.find((skill) => skill.id === id);
}

/** Resolve a project's technology ids to skills, preserving authored order.
 *  Unknown ids are dropped rather than rendered as broken chips; the content
 *  integrity test is what stops them existing in the first place. */
export function getSkillsForProject(project: Project): readonly Skill[] {
  return project.technologies
    .map((id) => getSkillById(id))
    .filter((skill): skill is Skill => skill !== undefined);
}

export interface SkillCategoryGroup {
  readonly category: SkillCategory;
  readonly label: string;
  readonly skills: readonly Skill[];
}

/** Skills grouped by category and sorted strongest first within each group. */
export function getSkillsGroupedByCategory(): readonly SkillCategoryGroup[] {
  const groups = new Map<SkillCategory, Skill[]>();

  for (const skill of active.skills) {
    const existing = groups.get(skill.category);
    if (existing) {
      existing.push(skill);
    } else {
      groups.set(skill.category, [skill]);
    }
  }

  return [...groups.entries()].map(([category, skills]) => ({
    category,
    label: SKILL_CATEGORY_LABEL[category],
    skills: [...skills].sort(
      (a, b) => SKILL_LEVEL_ORDER.indexOf(a.level) - SKILL_LEVEL_ORDER.indexOf(b.level),
    ),
  }));
}

// ---------------------------------------------------------------------------
// Experience, education, certifications
// ---------------------------------------------------------------------------

/** Most recent first. */
export function getExperience(): readonly Experience[] {
  return [...active.experience].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getEducation(): readonly Education[] {
  return [...active.education].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getCertifications(): readonly Certification[] {
  return active.certifications;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export function getDocuments(): readonly PortfolioDocument[] {
  return active.documents;
}

export function getDocumentById(id: string): PortfolioDocument | undefined {
  return active.documents.find((document) => document.id === id);
}

export function getResume(): PortfolioDocument | undefined {
  return active.documents.find((document) => document.kind === 'resume');
}

/** True when a document has a file behind it. Callers use this to decide
 *  between an active link and a disabled state. */
export function isDocumentAvailable(document: PortfolioDocument): boolean {
  return typeof document.src === 'string' && document.src.length > 0;
}
