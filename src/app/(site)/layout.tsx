import Link from 'next/link';
import { SosWordmark } from '@/components/brand';
import { site } from '@/lib/config/site';
import { getProfile } from '@/lib/content';

/**
 * Document layout for the indexable routes.
 *
 * These pages are the other half of the S-OS design: the operating system is
 * the experience, and these are the same content as ordinary web pages that a
 * crawler can read, a link preview can summarise, and someone on a slow
 * connection can use without waiting for a desktop shell to boot.
 *
 * They are deliberately plain. A recruiter following a link from a job
 * application wants the information, and every one of these pages carries a
 * clear route into S-OS for anyone who does want the full thing.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = getProfile();

  return (
    <div className="from-base via-raised to-base min-h-screen bg-linear-160">
      <header className="border-glass-border border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" aria-label={`${site.name} home`}>
            <SosWordmark size="sm" />
          </Link>

          <nav className="flex items-center gap-4 text-[12.5px]">
            <Link
              href="/recruiter"
              className="text-secondary hover:text-primary transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/projects"
              className="text-secondary hover:text-primary transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/"
              className="bg-accent-600 hover:bg-accent-500 text-primary rounded-md px-3 py-1.5 transition-colors"
            >
              Launch S-OS
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>

      <footer className="border-glass-border mt-10 border-t">
        <div className="text-muted mx-auto flex max-w-3xl flex-col gap-1 px-5 py-6 text-[12px]">
          <p>
            {profile.name} — {profile.title}, {profile.location}
          </p>
          <p className="text-disabled">
            {site.fullName} · a portfolio built as a desktop operating system.
          </p>
        </div>
      </footer>
    </div>
  );
}
