import type { ProjectId } from './content';

/**
 * The S-OS virtual filesystem.
 *
 * File Explorer, My Computer, the Start menu's All Programs tree, the search
 * index and the terminal's `cd`/`ls` all traverse this one structure. That is
 * the whole point: adding a project to the registry makes it appear in every
 * navigation surface at once, because there is only one surface underneath.
 *
 * Paths are stored with forward slashes ("C:/Projects/Full-Stack") and are
 * rendered with backslashes at the display layer. Storing the display form
 * would mean escaping every path literal in the codebase for the sake of one
 * cosmetic detail in the terminal prompt.
 */

export type FsPath = string;

export type FsNodeKind = 'drive' | 'folder' | 'file';

/** What opening a file actually does. Discriminated so the shell can dispatch
 *  without inspecting names or extensions. */
export type FsTarget =
  | { readonly type: 'app'; readonly appId: string }
  | { readonly type: 'project'; readonly projectId: ProjectId }
  | { readonly type: 'document'; readonly documentId: string }
  | { readonly type: 'external'; readonly url: string }
  /** A file with no action — Recycle Bin curios and similar. */
  | { readonly type: 'inert' };

interface FsNodeBase {
  readonly id: string;
  readonly name: string;
  readonly path: FsPath;
  /** Key into the icon registry (Milestone 2). */
  readonly icon: string;
  /** Shown in Explorer's details view and as an accessible description. */
  readonly description?: string;
}

export interface FsDrive extends FsNodeBase {
  readonly kind: 'drive';
  /** "C:", "D:" — the letter is part of the path, this is for display. */
  readonly letter: string;
  readonly children: readonly FsNode[];
}

export interface FsFolder extends FsNodeBase {
  readonly kind: 'folder';
  readonly children: readonly FsNode[];
}

export interface FsFile extends FsNodeBase {
  readonly kind: 'file';
  readonly target: FsTarget;
  /** Displayed in the details view. Synthetic for generated entries. */
  readonly modified?: string;
  readonly sizeLabel?: string;
}

export type FsNode = FsDrive | FsFolder | FsFile;

export type FsContainer = FsDrive | FsFolder;

export function isContainer(node: FsNode): node is FsContainer {
  return node.kind === 'drive' || node.kind === 'folder';
}

export function isFile(node: FsNode): node is FsFile {
  return node.kind === 'file';
}

/** The root of the tree — what My Computer shows. */
export interface FileSystem {
  readonly drives: readonly FsDrive[];
  /** Flat path → node map, built once, so lookup and search do not re-walk. */
  readonly index: ReadonlyMap<FsPath, FsNode>;
}
