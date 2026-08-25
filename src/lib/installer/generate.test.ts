import { describe, expect, it } from 'vitest';
import {
  EMPTY_DRAFT,
  exportName,
  generateProjectFile,
  slugify,
  suggestExecutable,
  validateDraft,
  type ProjectDraft,
} from './generate';
import { iconRegistry } from '@/components/icons';
import { getProjects, getSkills } from '@/lib/content';

const options = {
  existingIds: getProjects().map((project) => project.id),
  knownIcons: Object.keys(iconRegistry),
  knownSkills: getSkills().map((skill) => skill.id),
};

const draft: ProjectDraft = {
  ...EMPTY_DRAFT,
  id: 'weather-station',
  displayName: 'Weather Station',
  executable: 'WeatherStation.exe',
  icon: 'document',
  version: '1.0.0',
  status: 'stable',
  category: 'full-stack',
  tagline: 'A weather dashboard.',
  overview: 'It shows the weather.',
  role: 'Sole developer.',
  technologies: ['typescript', 'nextjs'],
  features: ['Live updates'],
  dateStarted: '2026-02',
};

describe('demo generation', () => {
  it('omits the demo entirely for a source-only project', () => {
    expect(generateProjectFile(draft).contents).not.toContain('demo:');
  });

  it('writes a live demo with its embeddability decision', () => {
    const { contents } = generateProjectFile({
      ...draft,
      demoKind: 'live',
      demoUrl: 'https://weather.example.com',
      demoEmbeddable: true,
      demoNote: 'Sign in as guest.',
    });

    expect(contents).toContain("kind: 'live'");
    expect(contents).toContain('url: "https://weather.example.com"');
    expect(contents).toContain('embeddable: true');
    expect(contents).toContain('note: "Sign in as guest."');
    expect(contents).not.toContain('src:');
  });

  it('writes a recording with numeric dimensions, not strings', () => {
    const { contents } = generateProjectFile({
      ...draft,
      demoKind: 'video',
      videoSrc: '/demos/weather.mp4',
      videoWidth: '1280',
      videoHeight: '720',
    });

    expect(contents).toContain("kind: 'video'");
    expect(contents).toContain('width: 1280,');
    expect(contents).toContain('height: 720,');
    expect(contents).not.toContain('width: "1280"');
    expect(contents).not.toContain('embeddable:');
  });

  it('rejects a live demo without a real URL', () => {
    const problems = validateDraft({ ...draft, demoKind: 'live', demoUrl: 'weather.example' }, options);
    expect(problems.map((problem) => problem.field)).toContain('demoUrl');
  });

  it('rejects a recording without dimensions', () => {
    const problems = validateDraft(
      { ...draft, demoKind: 'video', videoSrc: '/demos/weather.mp4' },
      options,
    );
    const fields = problems.map((problem) => problem.field);

    expect(fields).toContain('videoWidth');
    expect(fields).toContain('videoHeight');
  });

  it('refuses a demo on a publication-restricted project', () => {
    const problems = validateDraft(
      {
        ...draft,
        demoKind: 'live',
        demoUrl: 'https://weather.example.com',
        publicationNote: 'Owned by the university.',
      },
      options,
    );

    expect(problems.map((problem) => problem.field)).toContain('publicationNote');
  });
});

describe('slugs and names', () => {
  it('slugifies a display name', () => {
    expect(slugify('Hotel Management System')).toBe('hotel-management-system');
  });

  it('strips punctuation and collapses separators', () => {
    expect(slugify('  Seedorf’s   Great  Idea!! ')).toBe('seedorf-s-great-idea');
  });

  it('suggests an executable name', () => {
    expect(suggestExecutable('Hotel Management System')).toBe('HotelManagementSystem.exe');
  });

  it('derives a camelCase export name', () => {
    expect(exportName('hotel-management-system')).toBe('hotelManagementSystem');
  });
});

describe('generated file', () => {
  it('writes to the right path', () => {
    expect(generateProjectFile(draft).path).toBe('src/data/projects/weather-station.ts');
  });

  it('declares a typed export', () => {
    const { contents } = generateProjectFile(draft);
    expect(contents).toContain("import type { Project } from '@/types/content';");
    expect(contents).toContain('export const weatherStation: Project = {');
  });

  it('escapes prose safely', () => {
    // The interesting failure mode: an apostrophe or a quotation mark in real
    // writing breaking the generated file. JSON.stringify handles both.
    const tricky = generateProjectFile({
      ...draft,
      tagline: `It's a "weather" app — with a backslash \\ in it.`,
    });

    expect(tricky.contents).toContain('\\"weather\\"');
    expect(tricky.contents).toContain("It's");
    expect(() =>
      JSON.parse(tricky.contents.match(/tagline: (".*?"),/)?.[1] ?? ''),
    ).not.toThrow();
  });

  it('omits optional fields rather than writing empty strings', () => {
    // Matches the content model: absent means absent, so a missing link hides
    // its button instead of rendering one that goes nowhere.
    const { contents } = generateProjectFile(draft);

    expect(contents).not.toContain('problem:');
    expect(contents).not.toContain('dateCompleted:');
    expect(contents).toContain('links: {}');
  });

  it('includes optional fields when they are filled in', () => {
    const { contents } = generateProjectFile({
      ...draft,
      problem: 'People needed weather.',
      github: 'https://github.com/example/weather',
      dateCompleted: '2026-06',
    });

    expect(contents).toContain('problem: "People needed weather."');
    expect(contents).toContain('github: "https://github.com/example/weather"');
    expect(contents).toContain('dateCompleted: "2026-06"');
  });

  it('renders arrays one entry per line', () => {
    const { contents } = generateProjectFile(draft);
    expect(contents).toContain('"typescript",');
    expect(contents).toContain('"nextjs",');
  });

  it('supplies the registry lines the author still has to paste', () => {
    const result = generateProjectFile(draft);
    expect(result.registryImport).toBe("import { weatherStation } from './weather-station';");
    expect(result.registryEntry).toBe('  weatherStation,');
  });
});

describe('draft validation', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(draft, options)).toEqual([]);
  });

  it('rejects a duplicate id', () => {
    const problems = validateDraft({ ...draft, id: 's-os' }, options);
    expect(problems.some((problem) => problem.field === 'id')).toBe(true);
  });

  it('requires the fields a reviewer actually reads', () => {
    const problems = validateDraft(EMPTY_DRAFT, options);
    const fields = problems.map((problem) => problem.field);

    expect(fields).toContain('displayName');
    expect(fields).toContain('tagline');
    expect(fields).toContain('role');
  });

  it('rejects an unregistered icon', () => {
    const problems = validateDraft({ ...draft, icon: 'not-a-real-icon' }, options);
    expect(problems.some((problem) => problem.field === 'icon')).toBe(true);
  });

  it('rejects technologies that are not in the skills registry', () => {
    // The same rule the content-integrity test enforces, caught while typing
    // instead of ten minutes later in a failing build.
    const problems = validateDraft({ ...draft, technologies: ['cobol'] }, options);
    expect(problems.some((problem) => problem.field === 'technologies')).toBe(true);
  });

  it('requires a YYYY-MM start date', () => {
    const problems = validateDraft({ ...draft, dateStarted: 'January 2026' }, options);
    expect(problems.some((problem) => problem.field === 'dateStarted')).toBe(true);
  });

  it('refuses a desktop shortcut for planned work', () => {
    const problems = validateDraft(
      { ...draft, status: 'planned', desktopShortcut: true },
      options,
    );
    expect(problems.some((problem) => problem.field === 'desktopShortcut')).toBe(true);
  });

  it('refuses links on a publication-restricted project', () => {
    const problems = validateDraft(
      { ...draft, publicationNote: 'Under NDA.', github: 'https://github.com/x/y' },
      options,
    );
    expect(problems.some((problem) => problem.field === 'publicationNote')).toBe(true);
  });
});
