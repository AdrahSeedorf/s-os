import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { allowIndexing } from '@/lib/config/site';
import { getProjects } from '@/lib/content';

/**
 * The indexing gate.
 *
 * The default matters more than the feature: while the content is placeholder,
 * an indexed page is what appears when someone searches Seedorf's name, and it
 * lingers long after the page is fixed.
 */
describe('indexing gate', () => {
  it('is off unless explicitly enabled', () => {
    // No NEXT_PUBLIC_ALLOW_INDEXING in the test environment, so this asserts
    // the safe default rather than the enabled behaviour.
    expect(allowIndexing).toBe(false);
  });

  it('disallows every crawler while indexing is off', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(rules[0]?.disallow).toBe('/');
  });

  it('publishes no sitemap while indexing is off', () => {
    // A map of pages that all say "do not index" would be a contradiction.
    expect(sitemap()).toEqual([]);
  });

  it('omits a sitemap reference from robots while indexing is off', () => {
    expect(robots().sitemap).toBeUndefined();
  });
});

describe('sitemap shape', () => {
  it('would cover every project if enabled', () => {
    // The gate returns early, so this checks the data the sitemap is built
    // from rather than the disabled output.
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const project of projects) {
      expect(project.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
