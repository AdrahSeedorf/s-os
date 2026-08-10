/**
 * Single source of truth for site-level identity and metadata.
 * Referenced by layout metadata, Open Graph images, the sitemap and the
 * System Information application.
 */
export const site = {
  name: 'S-OS',
  fullName: 'Seedorf Operating System',
  owner: 'Seedorf Obeng-Mireku',
  title: 'Software Engineer',
  location: 'Sydney, NSW, Australia',
  tagline: 'A developer workstation you can explore',
  description:
    'S-OS is the portfolio of Seedorf Obeng-Mireku, a software engineer in Sydney — built as a browser-based desktop operating system. Explore projects, skills and experience as installed programs.',
  // Set once the domain is registered; used for canonical URLs and OG images.
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  locale: 'en_AU',
  version: '0.1.0',
} as const;

export type Site = typeof site;
