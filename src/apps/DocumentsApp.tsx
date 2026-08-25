'use client';

import { ExplorerApp } from './ExplorerApp';
import type { AppProps } from '@/os/registry/applications';

/**
 * Documents.
 *
 * Explorer opened at the Documents drive, not a separate application. My
 * Computer is the same trick at the root. Building three windows that each
 * duplicate a tree, a breadcrumb and a content pane would triple the code and
 * give the behaviour three places to diverge.
 */
export function DocumentsApp(props: AppProps) {
  return <ExplorerApp {...props} params={{ ...props.params, path: 'G:' }} />;
}
