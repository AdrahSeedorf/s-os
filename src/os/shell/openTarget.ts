import type { FsNode, FsTarget } from '@/types/filesystem';
import { getDocumentById } from '@/lib/content';
import { useWindowStore } from '@/stores/windowStore';

/**
 * Turns a filesystem target into the right action.
 *
 * Every surface that can open something — Explorer, the desktop, search
 * results, the terminal's `open` command — goes through here, so "what happens
 * when you open this" is decided once rather than re-implemented per surface
 * with slightly different behaviour each time.
 */

export type OpenOutcome =
  | { kind: 'navigated'; path: string }
  | { kind: 'launched'; windowId: string }
  | { kind: 'external'; url: string }
  | { kind: 'none' };

export interface OpenOptions {
  /** Called for folders and drives, so Explorer can navigate in place rather
   *  than opening a second window. Omit to open a new Explorer window. */
  onNavigate?: (path: string) => void;
}

export function openFsNode(node: FsNode, options: OpenOptions = {}): OpenOutcome {
  if (node.kind !== 'file') {
    if (options.onNavigate) {
      options.onNavigate(node.path);
      return { kind: 'navigated', path: node.path };
    }

    const windowId = useWindowStore.getState().openApp('explorer', { path: node.path });
    return windowId ? { kind: 'launched', windowId } : { kind: 'none' };
  }

  return openFsTarget(node.target);
}

export function openFsTarget(target: FsTarget): OpenOutcome {
  const { openApp } = useWindowStore.getState();

  switch (target.type) {
    case 'app': {
      const windowId = openApp(target.appId);
      return windowId ? { kind: 'launched', windowId } : { kind: 'none' };
    }

    case 'project': {
      const windowId = openApp('project', { projectId: target.projectId });
      return windowId ? { kind: 'launched', windowId } : { kind: 'none' };
    }

    case 'document': {
      const document = getDocumentById(target.documentId);

      // The resume has its own viewer; everything else opens in Documents.
      // Deciding this here rather than in the data keeps the filesystem
      // describing what a thing *is*, not which window should show it.
      const appId = document?.kind === 'resume' ? 'resume' : 'documents';
      const windowId = openApp(appId, { documentId: target.documentId });
      return windowId ? { kind: 'launched', windowId } : { kind: 'none' };
    }

    case 'external': {
      if (typeof window !== 'undefined') {
        window.open(target.url, '_blank', 'noopener,noreferrer');
      }
      return { kind: 'external', url: target.url };
    }

    case 'inert':
      return { kind: 'none' };
  }
}
