import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { iconRegistry } from '@/components/icons';
import { getProjects, getSkills } from '@/lib/content';
import {
  generateProjectFile,
  validateDraft,
  type ProjectDraft,
} from '@/lib/installer/generate';

/**
 * The Project Installer's write endpoint. Development only.
 *
 * Three independent reasons this cannot run on the deployed site: the check
 * below, Vercel's filesystem being read-only, and the fact that a rebuild
 * would discard anything written anyway. The check is what makes the intent
 * explicit rather than relying on the platform to save us.
 */
export const runtime = 'nodejs';

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'data', 'projects');
const INDEX_FILE = path.join(PROJECTS_DIR, 'index.ts');

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let draft: ProjectDraft;

  try {
    draft = (await request.json()) as ProjectDraft;
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  // Re-validated here rather than trusting the form. The form is a
  // convenience; this is the thing that actually writes to the repository.
  const problems = validateDraft(draft, {
    existingIds: getProjects().map((project) => project.id),
    knownIcons: Object.keys(iconRegistry),
    knownSkills: getSkills().map((skill) => skill.id),
  });

  if (problems.length > 0) {
    return NextResponse.json(
      { error: problems[0]?.message ?? 'Invalid draft.' },
      { status: 400 },
    );
  }

  const generated = generateProjectFile(draft);
  const target = path.join(process.cwd(), generated.path);

  // Refuses to write outside the projects directory. The id is slugified, so
  // this should be unreachable — which is exactly when a guard is worth having.
  if (!path.resolve(target).startsWith(path.resolve(PROJECTS_DIR))) {
    return NextResponse.json(
      { error: 'Refusing to write outside the data directory.' },
      {
        status: 400,
      },
    );
  }

  try {
    await writeFile(target, generated.contents, { encoding: 'utf8', flag: 'wx' });
  } catch (cause) {
    const message =
      cause instanceof Error && 'code' in cause && cause.code === 'EEXIST'
        ? 'That file already exists.'
        : 'The file could not be written.';

    return NextResponse.json({ error: message }, { status: 409 });
  }

  try {
    await registerInIndex(generated.registryImport, generated.registryEntry);
  } catch {
    // The file landed; only the registry edit failed. Say so precisely rather
    // than reporting a total failure the author would have to investigate.
    return NextResponse.json(
      {
        path: generated.path,
        error: `Written, but projects/index.ts could not be updated. Add:\n${generated.registryImport}`,
      },
      { status: 207 },
    );
  }

  return NextResponse.json({ path: generated.path });
}

/**
 * Adds the import and the array entry to the project registry.
 *
 * Textual editing rather than an AST transform: the file is a fixed shape this
 * project controls, and pulling in a TypeScript parser to insert two lines
 * would be a large dependency for a development convenience.
 */
async function registerInIndex(importLine: string, entryLine: string): Promise<void> {
  const source = await readFile(INDEX_FILE, 'utf8');

  if (source.includes(importLine)) return;

  const withImport = source.replace(
    /(import .+ from '\.\/[^']+';\n)(?![\s\S]*import .+ from '\.\/)/,
    `$1${importLine}\n`,
  );

  const withEntry = withImport.replace(
    /(export const projects: readonly Project\[\] = \[\n)/,
    `$1${entryLine}\n`,
  );

  if (withEntry === source) {
    throw new Error('Could not find the insertion points in projects/index.ts');
  }

  await writeFile(INDEX_FILE, withEntry, 'utf8');
}
