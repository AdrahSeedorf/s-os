'use client';

import { Download, Mail } from 'lucide-react';
import { Button, GlassPanel } from '@/components/ui';
import { getResume, isDocumentAvailable } from '@/lib/content';
import { formatMonth } from '@/lib/utils/dates';
import { useWindowStore } from '@/stores/windowStore';
import { AppScreen, EmptyState, ExternalAction } from './shared/AppLayout';

/**
 * The resume viewer.
 *
 * Renders the PDF in an embedded object when one exists. The interesting case
 * is when one does not: rather than an empty frame or a broken download, the
 * application says so and offers the route that does work.
 *
 * This is the last place in S-OS that should ever 404 in front of a recruiter,
 * which is why availability is modelled in the content layer instead of being
 * assumed here.
 */
export function ResumeApp() {
  const resume = getResume();
  const openApp = useWindowStore((state) => state.openApp);

  if (!resume) {
    return (
      <AppScreen>
        <EmptyState title="No resume is registered." />
      </AppScreen>
    );
  }

  if (!isDocumentAvailable(resume)) {
    return (
      <AppScreen>
        <header className="flex flex-col gap-1.5">
          <h2 className="text-[16px] font-semibold">{resume.name}</h2>
          <p className="text-muted font-mono text-[11.5px]">{resume.fileName}</p>
        </header>

        <EmptyState
          title="The resume is being finalised."
          detail="Rather than serve an out-of-date version, this is left empty until the current one is ready."
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            iconStart={<Mail size={14} />}
            onClick={() => openApp('contact')}
          >
            Request the current version
          </Button>
          <Button variant="secondary" onClick={() => openApp('recruiter')}>
            Open Recruiter Mode instead
          </Button>
        </div>

        <p className="text-disabled text-[11.5px]">
          Recruiter Mode covers the same ground — skills, projects, education and contact
          details.
        </p>
      </AppScreen>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-glass-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex flex-col">
          <h2 className="text-[13px] font-semibold">{resume.name}</h2>
          <p className="text-muted font-mono text-[11px]">
            {/* Stated plainly. A reader who can see the date can judge it for
                themselves; a document with a hidden date invites the reader to
                assume it is current. */}
            {resume.fileName}
            {resume.updated ? ` · updated ${formatMonth(resume.updated)}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExternalAction href={resume.src} label="Open in new tab" />
          <a
            href={resume.src}
            download
            className="bg-accent-600 hover:bg-accent-500 text-primary border-accent-500/60 inline-flex h-9 items-center gap-2 rounded-md border px-3.5 text-[13px] font-medium transition-colors"
          >
            <Download size={14} aria-hidden="true" />
            Download
          </a>
        </div>
      </header>

      {/* A PDF object rather than an iframe: browsers that cannot display PDFs
          inline render the fallback instead of an empty grey rectangle. */}
      <object
        data={resume.src}
        type="application/pdf"
        className="min-h-0 flex-1"
        title={resume.name}
      >
        <GlassPanel className="m-6 flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-secondary text-[13px]">
            This browser cannot display the PDF inline.
          </p>
          <ExternalAction href={resume.src} label="Open the resume" />
        </GlassPanel>
      </object>
    </div>
  );
}
