import type { MetadataRoute } from 'next';
import { allowIndexing, site } from '@/lib/config/site';

/**
 * robots.txt.
 *
 * Disallows everything until indexing is explicitly enabled. Belt and braces
 * alongside the noindex meta tag: the meta tag stops a page being indexed once
 * fetched, this stops well-behaved crawlers fetching it at all.
 *
 * The API route is always excluded — there is nothing there for a crawler and
 * every request costs a function invocation.
 */
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
