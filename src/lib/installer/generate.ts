import type { ProjectCategory, ProjectDemo, ProjectStatus } from '@/types/content';

/**
 * The Project Installer's code generator.
 *
 * Turns a filled-in form into the same typed data file you would write by
 * hand. Pure, so the escaping — the only part with any real risk in it — is
 * tested rather than trusted.
 *
 * This is the compromise reached in the interview: Seedorf wanted to add
 * projects through a form, and a public admin panel would have meant auth, a
 * database and a live failure mode on a portfolio. A dev-only generator gives
 * the same ergonomics, and the deployed site still has no write path at all.
 */

export interface ProjectDraft {
  id: string;
  displayName: string;
  executable: string;
  icon: string;
  version: string;
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  desktopShortcut: boolean;
  /** 'none' is a real answer, not a missing one — most projects are source-only. */
  demoKind: ProjectDemo['kind'] | 'none';
  demoUrl: string;
  demoEmbeddable: boolean;
  demoNote: string;
  videoSrc: string;
  /** Kept as strings because that is what an input yields; parsed at generation
   *  time so the form can show a validation message instead of emitting NaN. */
  videoWidth: string;
  videoHeight: string;
  videoCaption: string;
  tagline: string;
  overview: string;
  problem: string;
  solution: string;
  role: string;
  technologies: string[];
  features: string[];
  lessons: string[];
  github: string;
  docs: string;
  dateStarted: string;
  dateCompleted: string;
  publicationNote: string;
}

export const EMPTY_DRAFT: ProjectDraft = {
  id: '',
  displayName: '',
  executable: '',
  icon: 'document',
  version: '1.0.0',
  status: 'in-development',
  category: 'full-stack',
  featured: false,
  desktopShortcut: false,
  demoKind: 'none',
  demoUrl: '',
  demoEmbeddable: false,
  demoNote: '',
  videoSrc: '',
  videoWidth: '',
  videoHeight: '',
  videoCaption: '',
  tagline: '',
  overview: '',
  problem: '',
  solution: '',
  role: '',
  technologies: [],
  features: [],
  lessons: [],
  github: '',
  docs: '',
  dateStarted: '',
  dateCompleted: '',
  publicationNote: '',
};

/** "Hotel Management System" → "hotel-management-system". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Hotel Management System" → "HotelManager.exe" is a judgement call, so this
 *  only offers a reasonable default the author can overwrite. */
export function suggestExecutable(displayName: string): string {
  const pascal = displayName
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join('');

  return pascal ? `${pascal}.exe` : '';
}

/**
 * A TypeScript string literal.
 *
 * JSON.stringify rather than manual quoting: prose is full of apostrophes and
 * the odd quotation mark, and hand-rolled escaping is exactly the sort of
 * thing that works on every example you try and breaks on the first real
 * sentence someone writes.
 */
function str(value: string): string {
  return JSON.stringify(value);
}

function strArray(values: readonly string[], indent = '    '): string {
  const clean = values.map((value) => value.trim()).filter(Boolean);
  if (clean.length === 0) return '[]';

  return `[\n${clean.map((value) => `${indent}  ${str(value)},`).join('\n')}\n${indent}]`;
}

/** camelCase export name for the project constant. */
export function exportName(id: string): string {
  const parts = slugify(id).split('-').filter(Boolean);
  const [first, ...rest] = parts;
  if (!first) return 'project';

  return first + rest.map((word) => word[0]?.toUpperCase() + word.slice(1)).join('');
}

export interface GeneratedFiles {
  /** Path relative to the repository root. */
  path: string;
  contents: string;
  /** Human instructions for the one step the generator does not do. */
  registryImport: string;
  registryEntry: string;
}

/**
 * The `demo` property, or nothing at all.
 *
 * Source-only projects omit the key entirely rather than writing
 * `demo: undefined`, which keeps the generated file identical to one written by
 * hand and keeps `exactOptionalPropertyTypes` happy.
 */
function demoLiteral(draft: ProjectDraft): string {
  if (draft.demoKind === 'live') {
    const lines = [
      `    kind: 'live',`,
      `    url: ${str(draft.demoUrl.trim())},`,
      `    embeddable: ${String(draft.demoEmbeddable)},`,
    ];
    if (draft.demoNote.trim()) lines.push(`    note: ${str(draft.demoNote.trim())},`);

    return `  demo: {\n${lines.join('\n')}\n  },`;
  }

  if (draft.demoKind === 'video') {
    const lines = [`    kind: 'video',`, `    src: ${str(draft.videoSrc.trim())},`];
    lines.push(`    width: ${String(Number(draft.videoWidth))},`);
    lines.push(`    height: ${String(Number(draft.videoHeight))},`);
    if (draft.videoCaption.trim()) lines.push(`    caption: ${str(draft.videoCaption.trim())},`);

    return `  demo: {\n${lines.join('\n')}\n  },`;
  }

  return '';
}

export function generateProjectFile(draft: ProjectDraft): GeneratedFiles {
  const id = slugify(draft.id || draft.displayName);
  const name = exportName(id);

  const links: string[] = [];
  if (draft.github.trim()) links.push(`    github: ${str(draft.github.trim())},`);
  if (draft.docs.trim()) links.push(`    docs: ${str(draft.docs.trim())},`);

  // Optional fields are omitted entirely rather than written as empty strings,
  // matching the content model's rule that absent means absent.
  const optional: string[] = [];
  if (draft.problem.trim()) optional.push(`  problem: ${str(draft.problem.trim())},`);
  if (draft.solution.trim()) optional.push(`  solution: ${str(draft.solution.trim())},`);

  const demo = demoLiteral(draft);

  const trailing: string[] = [];
  if (draft.dateCompleted.trim()) {
    trailing.push(`  dateCompleted: ${str(draft.dateCompleted.trim())},`);
  }
  if (draft.publicationNote.trim()) {
    trailing.push(`  publicationNote: ${str(draft.publicationNote.trim())},`);
  }

  const contents = `import type { Project } from '@/types/content';

export const ${name}: Project = {
  id: ${str(id)},
  displayName: ${str(draft.displayName.trim())},
  executable: ${str(draft.executable.trim() || suggestExecutable(draft.displayName))},
  icon: ${str(draft.icon.trim() || 'document')},
  version: ${str(draft.version.trim() || '1.0.0')},
  status: ${str(draft.status)},
  category: ${str(draft.category)},
  featured: ${String(draft.featured)},
  desktopShortcut: ${String(draft.desktopShortcut)},

  tagline: ${str(draft.tagline.trim())},
  overview: ${str(draft.overview.trim())},
${optional.length > 0 ? `${optional.join('\n')}\n` : ''}  role: ${str(draft.role.trim())},

  technologies: ${strArray(draft.technologies, '  ')},
  features: ${strArray(draft.features, '  ')},
  challenges: [],
  lessons: ${strArray(draft.lessons, '  ')},

  screenshots: [],
  links: ${links.length > 0 ? `{\n${links.join('\n')}\n  }` : '{}'},
${demo ? `${demo}\n` : ''}
  dateStarted: ${str(draft.dateStarted.trim())},
${trailing.length > 0 ? `${trailing.join('\n')}\n` : ''}};
`;

  return {
    path: `src/data/projects/${id}.ts`,
    contents,
    registryImport: `import { ${name} } from './${id}';`,
    registryEntry: `  ${name},`,
  };
}

export interface DraftProblem {
  field: keyof ProjectDraft;
  message: string;
}

/**
 * Checks the draft before generating.
 *
 * Deliberately mirrors the content-integrity tests: it is better to be told
 * "that icon does not exist" while filling in the form than to find out from a
 * failing build ten minutes later.
 */
export function validateDraft(
  draft: ProjectDraft,
  options: {
    existingIds: readonly string[];
    knownIcons: readonly string[];
    knownSkills: readonly string[];
  },
): readonly DraftProblem[] {
  const problems: DraftProblem[] = [];
  const id = slugify(draft.id || draft.displayName);

  if (!draft.displayName.trim()) {
    problems.push({ field: 'displayName', message: 'A display name is required.' });
  }

  if (!id) {
    problems.push({ field: 'id', message: 'An id is required.' });
  } else if (options.existingIds.includes(id)) {
    problems.push({ field: 'id', message: `A project with the id "${id}" already exists.` });
  }

  if (!draft.tagline.trim()) {
    problems.push({ field: 'tagline', message: 'A one-line tagline is required.' });
  }

  if (!draft.role.trim()) {
    problems.push({ field: 'role', message: 'Say what you personally built — reviewers ask.' });
  }

  if (!draft.overview.trim()) {
    problems.push({ field: 'overview', message: 'An overview is required.' });
  }

  if (!/^\d{4}-\d{2}$/.test(draft.dateStarted.trim())) {
    problems.push({ field: 'dateStarted', message: 'Use YYYY-MM, for example 2026-01.' });
  }

  if (draft.dateCompleted.trim() && !/^\d{4}-\d{2}$/.test(draft.dateCompleted.trim())) {
    problems.push({ field: 'dateCompleted', message: 'Use YYYY-MM, or leave it empty.' });
  }

  if (draft.icon.trim() && !options.knownIcons.includes(draft.icon.trim())) {
    problems.push({ field: 'icon', message: `"${draft.icon}" is not a registered icon.` });
  }

  const unknown = draft.technologies
    .map((entry) => entry.trim())
    .filter((entry) => entry && !options.knownSkills.includes(entry));

  if (unknown.length > 0) {
    problems.push({
      field: 'technologies',
      message: `Not in the skills registry: ${unknown.join(', ')}. Add them to skills.ts first.`,
    });
  }

  if (draft.status === 'planned' && draft.desktopShortcut) {
    problems.push({
      field: 'desktopShortcut',
      message: 'Planned work does not get a desktop shortcut.',
    });
  }

  if (draft.demoKind === 'live' && !/^https?:\/\//.test(draft.demoUrl.trim())) {
    problems.push({
      field: 'demoUrl',
      message: 'A live demo needs a full URL, starting with https://.',
    });
  }

  if (draft.demoKind === 'video') {
    if (!draft.videoSrc.trim()) {
      problems.push({ field: 'videoSrc', message: 'A recording needs a file path.' });
    }

    // Dimensions are required by the content model so the player reserves its
    // space; a recording that shifts the layout on load is worse than none.
    for (const field of ['videoWidth', 'videoHeight'] as const) {
      const value = Number(draft[field].trim());
      if (!Number.isInteger(value) || value <= 0) {
        problems.push({ field, message: 'Give the recording\u2019s pixel size, for example 1280.' });
      }
    }
  }

  if (draft.publicationNote.trim() && (draft.github.trim() || draft.demoKind !== 'none')) {
    problems.push({
      field: 'publicationNote',
      message: 'A publication-restricted project cannot expose source or a demo.',
    });
  }

  return problems;
}
