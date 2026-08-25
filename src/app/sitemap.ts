import type { MetadataRoute } from 'next';
import { allowIndexing, site } from '@/lib/config/site';
import { getProjects } from '@/lib/content';

/**
 * The sitemap, derived from the project registry.
 *
 * Empty while indexing is disabled: publishing a map of pages that all say
 * "do not index" would be a contradiction, and it keeps preview deployments
 * from advertising themselves.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];

  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${site.url}/recruiter`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${site.url}/projects`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...getProjects().map((project) => ({
      url: `${site.url}/projects/${project.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: project.featured ? 0.7 : 0.5,
    })),
  ];
}
