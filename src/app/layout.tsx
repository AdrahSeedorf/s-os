import type { Metadata, Viewport } from 'next';
import ReactDOM from 'react-dom';
/**
 * Two families only, self-hosted rather than fetched from Google Fonts.
 * Three reasons:
 *   1. the build has no external dependency and works offline,
 *   2. the exact font files are pinned by the lockfile and copied by
 *      `npm run fonts:sync`,
 *   3. no visitor request ever reaches a Google server, which keeps the
 *      privacy story simple.
 * Inter carries the UI; JetBrains Mono carries the terminal and anywhere a
 * value should read as machine output. Variable weights, so one file each.
 * The @font-face rules live in globals.css; the preloads are below.
 */
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

/**
 * Preload the two font files.
 *
 * `ReactDOM.preload` rather than a `<link>` in the tree: rendering the element
 * made React hoist it into <head> *and* serialise it where it was written, so
 * every preload appeared twice. The imperative form emits exactly one.
 *
 * Worth doing at all because a browser cannot discover a @font-face until it
 * has parsed the stylesheet that declares it — a round trip charged against
 * the first thing a visitor sees. crossOrigin is required even for same-origin
 * font files; without it the preload is ignored and fetched again.
 */
function preloadFonts(): void {
  for (const file of ['inter-latin-variable', 'jetbrains-mono-latin-variable']) {
    ReactDOM.preload(`/fonts/${file}.woff2`, {
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    });
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preloadFonts();

  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
