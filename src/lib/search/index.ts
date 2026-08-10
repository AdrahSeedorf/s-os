import {
  getDocuments,
  getProjects,
  getSkills,
  getSkillsForProject,
  isDocumentAvailable,
} from '@/lib/content';
import { buildFileSystem } from '@/lib/content/filesystem';
import { getLaunchableApps } from '@/os/registry/applications';
import {
  PROJECT_CATEGORY_LABEL,
  SKILL_CATEGORY_LABEL,
  SKILL_LEVEL_LABEL,
} from '@/types/content';

/**
 * The S-OS search index.
 *
 * One index over everything: applications, projects, skills, documents and
 * filesystem locations. The Start menu queries it, and so will the terminal —
 * neither maintains its own idea of what exists.
 *
 * The payoff shows up in the case the brief specifically asked about: typing
 * "AWS" should surface the cloud project, the cloud skill and the
 * certification. That works here because a project carries technology ids that
 * resolve to skills, so a project inherits its technologies' names as
 * keywords without anyone writing them twice.
 */

export type SearchKind = 'application' | 'project' | 'skill' | 'document' | 'location';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  /** Shown beneath the title in results. */
  subtitle: string;
  icon: string;
  /** What launching this result does. */
  appId: string;
  params?: Record<string, string>;
  /** Extra terms that should match but are not displayed. */
  keywords: readonly string[];
  /** Nudges more useful result types up when scores are otherwise equal. */
  weight: number;
}

export interface SearchResult extends SearchEntry {
  score: number;
}

export const SEARCH_KIND_LABEL: Readonly<Record<SearchKind, string>> = {
  application: 'Program',
  project: 'Project',
  skill: 'Skill',
  document: 'Document',
  location: 'Location',
};

let cached: readonly SearchEntry[] | null = null;

export function buildSearchIndex(): readonly SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const app of getLaunchableApps()) {
    entries.push({
      id: `app:${app.id}`,
      kind: 'application',
      title: app.name,
      subtitle: app.description,
      icon: app.icon,
      appId: app.id,
      keywords: [app.id, app.title],
      weight: 3,
    });
  }

  for (const project of getProjects()) {
    // A project inherits the names of its technologies, so searching a stack
    // finds the work that used it — without duplicating the list.
    const technologies = getSkillsForProject(project).map((skill) => skill.name);

    entries.push({
      id: `project:${project.id}`,
      kind: 'project',
      title: project.displayName,
      subtitle: project.tagline,
      icon: project.icon,
      appId: 'project',
      params: { projectId: project.id },
      keywords: [
        project.executable,
        project.id,
        PROJECT_CATEGORY_LABEL[project.category],
        ...technologies,
        ...project.features,
      ],
      weight: 4,
    });
  }

  for (const skill of getSkills()) {
    entries.push({
      id: `skill:${skill.id}`,
      kind: 'skill',
      title: skill.name,
      subtitle: `${SKILL_LEVEL_LABEL[skill.level]} · ${SKILL_CATEGORY_LABEL[skill.category]}`,
      icon: 'skill',
      appId: 'skills',
      keywords: [skill.id, SKILL_CATEGORY_LABEL[skill.category], skill.note ?? ''],
      weight: 2,
    });
  }

  for (const document of getDocuments()) {
    entries.push({
      id: `document:${document.id}`,
      kind: 'document',
      title: document.name,
      subtitle: isDocumentAvailable(document)
        ? (document.description ?? document.fileName)
        : 'Not yet available',
      icon: document.kind === 'resume' ? 'resume' : 'document',
      appId: document.kind === 'resume' ? 'resume' : 'documents',
      keywords: [document.fileName, document.kind],
      weight: document.kind === 'resume' ? 5 : 2,
    });
  }

  // Folders and drives, so search doubles as a way to jump into Explorer.
  const fs = buildFileSystem();
  for (const node of fs.index.values()) {
    if (node.kind === 'file') continue;

    entries.push({
      id: `location:${node.path}`,
      kind: 'location',
      title: node.name,
      subtitle: node.description ?? node.path,
      icon: node.icon,
      appId: 'explorer',
      params: { path: node.path },
      keywords: [node.path],
      weight: 1,
    });
  }

  return entries;
}

export function getSearchIndex(): readonly SearchEntry[] {
  cached ??= buildSearchIndex();
  return cached;
}

/** Test hook, and the seam V2 uses when content comes from a database. */
export function resetSearchIndex(): void {
  cached = null;
}

/**
 * Score one entry against a query.
 *
 * Deliberately simple: an exact title match beats a title prefix, which beats
 * a title substring, which beats a keyword or subtitle hit. A fuzzy matcher
 * would be more impressive and worse — on an index of a hundred entries it
 * mostly produces confident wrong answers, and a portfolio's search needs to
 * be predictable rather than clever.
 *
 * Returns 0 for no match.
 */
export function scoreEntry(entry: SearchEntry, query: string): number {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return 0;

  const title = entry.title.toLowerCase();

  if (title === needle) return 100 + entry.weight;
  if (title.startsWith(needle)) return 70 + entry.weight;
  if (title.includes(needle)) return 50 + entry.weight;

  // Word-boundary hits in the title rank above incidental substring matches.
  if (title.split(/\s+/).some((word) => word.startsWith(needle))) return 60 + entry.weight;

  for (const keyword of entry.keywords) {
    const value = keyword.toLowerCase();
    if (value === needle) return 45 + entry.weight;
    if (value.includes(needle)) return 30 + entry.weight;
  }

  if (entry.subtitle.toLowerCase().includes(needle)) return 15 + entry.weight;

  return 0;
}

export interface SearchOptions {
  limit?: number;
}

export function search(query: string, options: SearchOptions = {}): readonly SearchResult[] {
  const limit = options.limit ?? 12;
  if (query.trim().length === 0) return [];

  return getSearchIndex()
    .map((entry) => ({ ...entry, score: scoreEntry(entry, query) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/** Results grouped by kind, preserving score order within each group. */
export function searchGrouped(
  query: string,
  options: SearchOptions = {},
): readonly { kind: SearchKind; label: string; results: readonly SearchResult[] }[] {
  const results = search(query, options);
  const groups = new Map<SearchKind, SearchResult[]>();

  for (const result of results) {
    const existing = groups.get(result.kind);
    if (existing) existing.push(result);
    else groups.set(result.kind, [result]);
  }

  return [...groups.entries()].map(([kind, entries]) => ({
    kind,
    label: SEARCH_KIND_LABEL[kind],
    results: entries,
  }));
}
