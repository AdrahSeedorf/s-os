import { describe, expect, it } from 'vitest';
import {
  getDemoUrl,
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

  it('describes every demo completely enough to render', () => {
    // The union makes the impossible states unrepresentable; this catches the
    // representable-but-useless ones, like a video with no file behind it.
    for (const project of getProjects()) {
      const demo = project.demo;
      if (!demo) continue;

      if (demo.kind === 'live') {
        expect(demo.url, `${project.id} demo needs a URL`).toMatch(/^https?:\/\//);
      } else {
        expect(demo.src, `${project.id} recording needs a file`).not.toBe('');
        expect(demo.width, `${project.id} recording needs a width`).toBeGreaterThan(0);
        expect(demo.height, `${project.id} recording needs a height`).toBeGreaterThan(0);
      }
    }
  });

  it('never advertises a demo for planned work', () => {
    // Nothing exists to demonstrate yet, so a demo here would be a fabrication.
    for (const project of getProjects()) {
      if (project.status === 'planned') expect(project.demo).toBeUndefined();
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
      expect(project.demo).toBeUndefined();
    }
  });
});

describe('documents', () => {
  it('leads with the designed resume, not the plain one', () => {
    // Registry order decides what a person is shown. If the plain-layout file
    // ever drifts to the front, Recruiter Mode starts handing out the version
    // built for a parser.
    const resume = getResume();
    expect(resume?.id).toBe('resume');
  });

  it('gives every resume a file, since that is the one link that must not 404', () => {
    const resumes = getDocuments().filter((document) => document.kind === 'resume');
    expect(resumes.length).toBeGreaterThan(0);

    for (const resume of resumes) {
      expect(isDocumentAvailable(resume), `${resume.id} has no file`).toBe(true);
    }
  });
});

describe('project accessors', () => {
  it('finds a project by id and returns undefined for an unknown one', () => {
    expect(getProjectById('s-os')?.displayName).toBe('S-OS');
    expect(getProjectById('does-not-exist')).toBeUndefined();
  });

  it('resolves a visitable URL only for a live demo', () => {
    const live = { kind: 'live', url: 'https://example.com', embeddable: false } as const;
    const video = { kind: 'video', src: '/demo.mp4', width: 1280, height: 720 } as const;
    const base = getProjectById('s-os');
    expect(base).toBeDefined();
    if (!base) return;

    expect(getDemoUrl({ ...base, demo: live })).toBe('https://example.com');
    // A recording is watched in place — offering it as a link would send a
    // reviewer to a bare .mp4 and call it the application.
    expect(getDemoUrl({ ...base, demo: video })).toBeUndefined();
    // S-OS itself is source-only: it is the site you are already looking at.
    expect(getDemoUrl(base)).toBeUndefined();
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
