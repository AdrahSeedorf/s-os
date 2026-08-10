import { describe, expect, it } from 'vitest';
import {
  getDesktopProjects,
  getDocuments,
  getEducation,
  getFeaturedProjects,
  getProjectById,
  getProjects,
  getProjectsGroupedByCategory,
  getProjectsUsingSkill,
  getResume,
  getSkillById,
  getSkills,
  getSkillsForProject,
  getSkillsGroupedByCategory,
  isDocumentAvailable,
} from './index';
import { SKILL_LEVEL_ORDER } from '@/types/content';

/**
 * Content integrity.
 *
 * These are the tests that make the data files safe to edit by hand. A typo in
 * a technology id or a duplicated project id fails here rather than silently
 * dropping content from the Skills application or colliding in the filesystem
 * index — which is the whole justification for editing typed files instead of
 * building an admin panel.
 */
describe('content integrity', () => {
  it('gives every project a unique id', () => {
    const ids = getProjects().map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every skill a unique id', () => {
    const ids = getSkills().map((skill) => skill.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves every project technology against the skills registry', () => {
    const unknown: string[] = [];

    for (const project of getProjects()) {
      for (const technology of project.technologies) {
        if (!getSkillById(technology)) {
          unknown.push(`${project.id} → ${technology}`);
        }
      }
    }

    expect(unknown).toEqual([]);
  });

  it('gives every project a unique executable name', () => {
    const executables = getProjects().map((project) => project.executable);
    expect(new Set(executables).size).toBe(executables.length);
  });

  it('gives every project a tagline and a role', () => {
    for (const project of getProjects()) {
      expect(project.tagline.length).toBeGreaterThan(0);
      expect(project.role.length).toBeGreaterThan(0);
    }
  });

  it('requires alt text on every screenshot', () => {
    for (const project of getProjects()) {
      for (const screenshot of project.screenshots) {
        expect(screenshot.alt.length).toBeGreaterThan(0);
      }
    }
  });

  it('gives unfinished projects a build log so they still say something', () => {
    const unfinished = getProjects().filter(
      (project) => project.status === 'in-development' || project.status === 'planned',
    );

    for (const project of unfinished) {
      expect(project.buildLog, `${project.id} needs a build log`).toBeDefined();
    }
  });

  it('never grants a desktop shortcut to unfinished work', () => {
    for (const project of getDesktopProjects()) {
      expect(['stable', 'beta', 'in-development']).toContain(project.status);
      expect(project.status).not.toBe('planned');
    }
  });

  it('withholds source and demo links from projects with a publication restriction', () => {
    const restricted = getProjects().filter((project) => project.publicationNote !== undefined);

    for (const project of restricted) {
      expect(project.links.github).toBeUndefined();
      expect(project.links.live).toBeUndefined();
    }
  });
});

describe('project accessors', () => {
  it('finds a project by id and returns undefined for an unknown one', () => {
    expect(getProjectById('s-os')?.displayName).toBe('S-OS');
    expect(getProjectById('does-not-exist')).toBeUndefined();
  });

  it('excludes planned work from the featured shortlist', () => {
    for (const project of getFeaturedProjects()) {
      expect(project.featured).toBe(true);
      expect(project.status).not.toBe('planned');
    }
  });

  it('groups projects without producing empty categories', () => {
    const groups = getProjectsGroupedByCategory();

    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.projects.length).toBeGreaterThan(0);
      expect(group.label.length).toBeGreaterThan(0);
    }
  });

  it('accounts for every project exactly once across the groups', () => {
    const grouped = getProjectsGroupedByCategory().flatMap((group) => group.projects);
    expect(grouped).toHaveLength(getProjects().length);
  });

  it('derives skill evidence from projects rather than storing it', () => {
    const users = getProjectsUsingSkill('typescript');
    expect(users.map((project) => project.id)).toContain('s-os');
  });

  it('resolves a project’s technologies to skills in authored order', () => {
    const project = getProjectById('s-os');
    expect(project).toBeDefined();
    if (!project) return;

    const resolved = getSkillsForProject(project);
    expect(resolved).toHaveLength(project.technologies.length);
    expect(resolved[0]?.id).toBe(project.technologies[0]);
  });
});

describe('skill accessors', () => {
  it('sorts each category strongest first', () => {
    for (const group of getSkillsGroupedByCategory()) {
      const ranks = group.skills.map((skill) => SKILL_LEVEL_ORDER.indexOf(skill.level));
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it('accounts for every skill exactly once across the groups', () => {
    const grouped = getSkillsGroupedByCategory().flatMap((group) => group.skills);
    expect(grouped).toHaveLength(getSkills().length);
  });
});

describe('education and documents', () => {
  it('orders education most recent first', () => {
    const dates = getEducation().map((entry) => entry.startDate);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('exposes a resume entry', () => {
    expect(getResume()).toBeDefined();
  });

  it('reports a document with no file as unavailable rather than linking to a 404', () => {
    for (const document of getDocuments()) {
      if (document.src === undefined) {
        expect(isDocumentAvailable(document)).toBe(false);
      }
    }
  });
});
