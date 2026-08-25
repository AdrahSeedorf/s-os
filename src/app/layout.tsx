import type { Metadata, Viewport } from 'next';
/**
 * Two families only, shipped as npm packages rather than fetched from Google
 * Fonts at build time. Three reasons:
 *   1. the build has no external dependency and works offline,
 *   2. the exact font files are pinned in the lockfile,
 *   3. no visitor request ever reaches a Google server, which keeps the
 *      privacy story simple.
 * Inter carries the UI; JetBrains Mono carries the terminal and anywhere a
 * value should read as machine output. Variable weights, so one file each.
 */
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { allowIndexing, site } from '@/lib/config/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.owner} — ${site.title} | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  creator: site.owner,
  keywords: [
    site.owner,
    'software engineer',
    'Sydney',
    'portfolio',
    'Next.js',
    'TypeScript',
    'graduate software engineer',
  ],
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.owner} — ${site.title}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.owner} — ${site.title}`,
    description: site.description,
  },
  // Noindex until explicitly allowed. See allowIndexing for why the default
  // matters more than the feature.
  robots: allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0d14',
  width: 'device-width',
  initialScale: 1,
  // The desktop shell needs a fixed viewport, but capping user zoom is an
  // accessibility failure. Zoom stays enabled; the shell adapts instead.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
