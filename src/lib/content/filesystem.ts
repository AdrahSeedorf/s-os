import {
  PROJECT_CATEGORY_LABEL,
  SKILL_CATEGORY_LABEL,
  type ContentSnapshot,
  type Project,
} from '@/types/content';
import type { FileSystem, FsDrive, FsFile, FsFolder, FsNode, FsPath } from '@/types/filesystem';
import { getSnapshot } from './index';

/**
 * Builds the S-OS virtual filesystem from the content snapshot.
 *
 * This is the structural heart of the "one data source feeds every surface"
 * rule. File Explorer, My Computer, All Programs, the search index and the
 * terminal's `cd`/`ls` all walk this tree, so a project added to the registry
 * appears in every one of them with no further code.
 */

const SEPARATOR = '/';

export function joinPath(parent: FsPath, segment: string): FsPath {
  return parent.endsWith(SEPARATOR) ? `${parent}${segment}` : `${parent}${SEPARATOR}${segment}`;
}

/** Split a path into segments, ignoring empty ones from trailing separators. */
export function splitPath(path: FsPath): readonly string[] {
  return path.split(SEPARATOR).filter((segment) => segment.length > 0);
}

export function parentPath(path: FsPath): FsPath | undefined {
  const segments = splitPath(path);
  if (segments.length <= 1) return undefined;
  return segments.slice(0, -1).join(SEPARATOR);
}

/** Convert a stored path to the backslash form the terminal and address bar
 *  display. Storage stays forward-slashed so nothing needs escaping. */
export function toDisplayPath(path: FsPath): string {
  return path.split(SEPARATOR).join('\\');
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function file(
  parent: FsPath,
  id: string,
  name: string,
  icon: string,
  target: FsFile['target'],
  description?: string,
): FsFile {
  return {
    id,
    name,
    path: joinPath(parent, name),
    icon,
    kind: 'file',
    target,
    ...(description === undefined ? {} : { description }),
  };
}

function folder(
  parent: FsPath,
  id: string,
  name: string,
  icon: string,
  children: (path: FsPath) => readonly FsNode[],
  description?: string,
): FsFolder {
  const path = joinPath(parent, name);
  return {
    id,
    name,
    path,
    icon,
    kind: 'folder',
    children: children(path),
    ...(description === undefined ? {} : { description }),
  };
}

/** Projects are files whose "filename" is the executable name — the detail
 *  that makes the metaphor land in Explorer's list view. */
function projectFile(parent: FsPath, project: Project): FsFile {
  return {
    id: `project-${project.id}`,
    name: project.executable,
    path: joinPath(parent, project.executable),
    icon: project.icon,
    kind: 'file',
    target: { type: 'project', projectId: project.id },
    description: project.tagline,
    sizeLabel: `v${project.version}`,
  };
}

// ---------------------------------------------------------------------------
// Drives
// ---------------------------------------------------------------------------

function buildSystemDrive(): FsDrive {
  const path = 'C:';

  return {
    id: 'drive-c',
    name: 'Local Disk (C:)',
    letter: 'C:',
    path,
    icon: 'drive-system',
    kind: 'drive',
    description: 'S-OS system files and profile information.',
    children: [
      folder(path, 'c-system', 'System', 'folder-system', (p) => [
        file(p, 'app-about', 'About Seedorf', 'about', { type: 'app', appId: 'about' }),
        file(p, 'app-system-info', 'System Information', 'system-info', {
          type: 'app',
          appId: 'system-info',
        }),
        file(p, 'app-settings', 'Settings', 'settings', { type: 'app', appId: 'settings' }),
      ]),
      folder(path, 'c-programs', 'Programs', 'folder-programs', (p) => [
        file(p, 'app-terminal', 'Terminal', 'terminal', { type: 'app', appId: 'terminal' }),
        file(p, 'app-explorer', 'File Explorer', 'explorer', {
          type: 'app',
          appId: 'explorer',
        }),
        file(p, 'app-recruiter', 'Recruiter Mode', 'recruiter', {
          type: 'app',
          appId: 'recruiter',
        }),
        file(p, 'app-contact', 'Contact', 'contact', { type: 'app', appId: 'contact' }),
      ]),
    ],
  };
}

function buildProjectsDrive(snapshot: ContentSnapshot): FsDrive {
  const path = 'D:';

  // Only categories that actually contain projects become folders, so adding a
  // category to the type does not create an empty folder in Explorer.
  const categories = [...new Set(snapshot.projects.map((project) => project.category))];

  return {
    id: 'drive-d',
    name: 'Projects (D:)',
    letter: 'D:',
    path,
    icon: 'drive-projects',
    kind: 'drive',
    description: 'Installed programs — software projects.',
    children: categories.map((category) =>
      folder(
        path,
        `projects-${category}`,
        PROJECT_CATEGORY_LABEL[category],
        'folder-projects',
        (p) =>
          snapshot.projects
            .filter((project) => project.category === category)
            .map((project) => projectFile(p, project)),
      ),
    ),
  };
}

function buildExperienceDrive(snapshot: ContentSnapshot): FsDrive {
  const path = 'E:';

  const children: FsNode[] = [
    folder(path, 'e-education', 'Education', 'folder-education', (p) =>
      snapshot.education.map((entry) =>
        file(
          p,
          `education-${entry.id}`,
          entry.qualification,
          'education',
          {
            type: 'app',
            appId: 'about',
          },
          entry.institution,
        ),
      ),
    ),
  ];

  // Only surfaced once there is something in them — an empty Work History
  // folder would advertise the gap rather than the projects that fill it.
  if (snapshot.experience.length > 0) {
    children.push(
      folder(path, 'e-work', 'Work History', 'folder-work', (p) =>
        snapshot.experience.map((entry) =>
          file(p, `experience-${entry.id}`, `${entry.role} — ${entry.organisation}`, 'work', {
            type: 'app',
            appId: 'about',
          }),
        ),
      ),
    );
  }

  if (snapshot.certifications.length > 0) {
    children.push(
      folder(path, 'e-certifications', 'Certifications', 'folder-certificates', (p) =>
        snapshot.certifications.map((entry) =>
          file(
            p,
            `certification-${entry.id}`,
            entry.name,
            'certificate',
            {
              type: 'app',
              appId: 'about',
            },
            entry.issuer,
          ),
        ),
      ),
    );
  }

  return {
    id: 'drive-e',
    name: 'Experience (E:)',
    letter: 'E:',
    path,
    icon: 'drive-experience',
    kind: 'drive',
    description: 'Education, work history and certifications.',
    children,
  };
}

function buildSkillsDrive(snapshot: ContentSnapshot): FsDrive {
  const path = 'F:';
  const categories = [...new Set(snapshot.skills.map((skill) => skill.category))];

  return {
    id: 'drive-f',
    name: 'Skills (F:)',
    letter: 'F:',
    path,
    icon: 'drive-skills',
    kind: 'drive',
    description: 'Installed technologies and capabilities.',
    children: categories.map((category) =>
      folder(path, `skills-${category}`, SKILL_CATEGORY_LABEL[category], 'folder-skills', (p) =>
        snapshot.skills
          .filter((skill) => skill.category === category)
          .map((skill) =>
            file(p, `skill-${skill.id}`, skill.name, 'skill', { type: 'app', appId: 'skills' }),
          ),
      ),
    ),
  };
}

function buildDocumentsDrive(snapshot: ContentSnapshot): FsDrive {
  const path = 'G:';

  return {
    id: 'drive-g',
    name: 'Documents (G:)',
    letter: 'G:',
    path,
    icon: 'drive-documents',
    kind: 'drive',
    description: 'Resume, certificates and written documentation.',
    children: snapshot.documents.map((document) =>
      file(
        path,
        `document-${document.id}`,
        document.fileName,
        document.kind === 'resume' ? 'resume' : 'document',
        { type: 'document', documentId: document.id },
        document.description,
      ),
    ),
  };
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function indexTree(nodes: readonly FsNode[], into: Map<FsPath, FsNode>): void {
  for (const node of nodes) {
    into.set(node.path, node);
    if (node.kind !== 'file') {
      indexTree(node.children, into);
    }
  }
}

/**
 * Build the filesystem for a snapshot. Pure — the same snapshot always
 * produces the same tree — which keeps it trivially testable.
 */
export function buildFileSystem(snapshot: ContentSnapshot = getSnapshot()): FileSystem {
  const drives: readonly FsDrive[] = [
    buildSystemDrive(),
    buildProjectsDrive(snapshot),
    buildExperienceDrive(snapshot),
    buildSkillsDrive(snapshot),
    buildDocumentsDrive(snapshot),
  ];

  const index = new Map<FsPath, FsNode>();
  indexTree(drives, index);

  return { drives, index };
}

// ---------------------------------------------------------------------------
// Traversal
// ---------------------------------------------------------------------------

export function getNode(fs: FileSystem, path: FsPath): FsNode | undefined {
  return fs.index.get(path);
}

/** Direct children of a path. An empty array for files and unknown paths, so
 *  callers never need to distinguish "no children" from "not a folder". */
export function listChildren(fs: FileSystem, path: FsPath): readonly FsNode[] {
  const node = fs.index.get(path);
  if (!node || node.kind === 'file') return [];
  return node.children;
}

/** Ancestors of a path, root first, including the node itself. Drives the
 *  Explorer breadcrumb and the terminal prompt. */
export function getBreadcrumbs(fs: FileSystem, path: FsPath): readonly FsNode[] {
  const segments = splitPath(path);
  const trail: FsNode[] = [];

  for (let i = 0; i < segments.length; i += 1) {
    const node = fs.index.get(segments.slice(0, i + 1).join(SEPARATOR));
    if (node) trail.push(node);
  }

  return trail;
}

/**
 * Resolve a path the way a shell would, supporting `.` and `..` and both
 * separators. Returns undefined when the result is not a real node, so the
 * terminal can report "The system cannot find the path specified".
 */
export function resolvePath(fs: FileSystem, from: FsPath, input: string): FsPath | undefined {
  const normalised = input.replaceAll('\\', SEPARATOR).trim();
  if (normalised.length === 0) return from;

  // A leading drive letter means the path is absolute.
  const isAbsolute = /^[a-z]:/i.test(normalised);
  const base = isAbsolute ? [] : [...splitPath(from)];

  for (const segment of splitPath(normalised)) {
    if (segment === '.') continue;
    if (segment === '..') {
      if (base.length > 1) base.pop();
      continue;
    }
    base.push(segment);
  }

  const candidate = base.join(SEPARATOR);
  if (!fs.index.has(candidate)) {
    // Retry case-insensitively — shells are forgiving, and so is this one.
    const lowered = candidate.toLowerCase();
    for (const key of fs.index.keys()) {
      if (key.toLowerCase() === lowered) return key;
    }
    return undefined;
  }

  return candidate;
}
