'use client';

import { RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '@/components/ui';
import { EmptyState, ExternalAction } from './shared/AppLayout';
import type { AppProps } from '@/os/registry/applications';

/**
 * The Demo Viewer.
 *
 * A minimal browser frame that runs a deployed project inside an S-OS window.
 * This is the standalone S-Browser from the brief, reduced to the one job that
 * actually earns its place — a fake browser with nothing to browse would be
 * chrome for its own sake.
 *
 * It only opens projects whose content marks them `embeddable`. Most deployed
 * applications send X-Frame-Options or a restrictive frame-ancestors policy,
 * and anything behind a login breaks in a third-party frame, so embedding is
 * opt-in per project after someone has actually checked.
 */
export function DemoViewerApp({ params }: AppProps) {
  const url = params['url'] ?? '';
  const title = params['title'] ?? 'Demo';
  const [reloadKey, setReloadKey] = useState(0);

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          title="No demo to show."
          detail="This window opens a project's live demo. Launch it from a project window."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-glass-border flex shrink-0 items-center gap-2 border-b px-2 py-1.5">
        <IconButton
          label="Reload demo"
          variant="chrome"
          size="sm"
          onClick={() => setReloadKey((value) => value + 1)}
        >
          <RotateCcw size={14} />
        </IconButton>

        {/* The real URL, shown plainly. A fake address bar with a made-up
            address would undermine the one thing this window is for. */}
        <p className="sos-inset text-secondary min-w-0 flex-1 truncate rounded-sm px-2.5 py-1 font-mono text-[11.5px]">
          {url}
        </p>

        <ExternalAction href={url} label="Open in browser" />
      </header>

      <div className="relative min-h-0 flex-1">
        <iframe
          key={reloadKey}
          src={url}
          title={`${title} — live demo`}
          // Sandboxed. The demo is Seedorf's own work, but it is still a
          // third-party origin inside his portfolio, and there is no reason to
          // grant it more than it needs to render.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
          className="h-full w-full border-0 bg-white"
        />
      </div>

      <footer className="border-glass-border text-disabled flex shrink-0 items-center gap-2 border-t px-3 py-1.5 text-[11px]">
        <ShieldAlert size={12} aria-hidden="true" />
        Running in a sandboxed frame. Some sites decline to be embedded — use “Open in browser”
        if this stays blank.
      </footer>
    </div>
  );
}
