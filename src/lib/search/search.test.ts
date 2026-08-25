import { describe, expect, it } from 'vitest';
import { getSearchIndex, scoreEntry, search, searchGrouped } from './index';
import { hasIcon } from '@/components/icons';
import { getApp } from '@/os/registry/applications';

const index = getSearchIndex();

describe('index integrity', () => {
  it('covers every content type', () => {
    const kinds = new Set(index.map((entry) => entry.kind));
    expect(kinds).toEqual(new Set(['application', 'project', 'skill', 'document', 'location']));
  });

  it('gives every entry a unique id', () => {
    const ids = index.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves every icon', () => {
    const missing = index.filter((entry) => !hasIcon(entry.icon)).map((entry) => entry.id);
    expect(missing).toEqual([]);
  });

  it('points every entry at a real application', () => {
    for (const entry of index) {
      expect(getApp(entry.appId), `${entry.id} → ${entry.appId}`).toBeDefined();
    }
  });
});

describe('matching', () => {
  it('finds an application by name', () => {
    const results = search('terminal');
    expect(results[0]?.id).toBe('app:terminal');
  });

  it('finds a project by its executable name', () => {
    const results = search('Hotel734.exe');
    expect(results.some((result) => result.id === 'project:hotel-734')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(search('TERMINAL')[0]?.id).toBe(search('terminal')[0]?.id);
  });

  it('ignores surrounding whitespace', () => {
    expect(search('  terminal  ')[0]?.id).toBe('app:terminal');
  });

  it('returns nothing for an empty query', () => {
    expect(search('')).toEqual([]);
    expect(search('   ')).toEqual([]);
  });

  it('returns nothing for a query that matches nothing', () => {
    expect(search('zzzzqqqq')).toEqual([]);
  });

  it('respects the result limit', () => {
    expect(search('s', { limit: 3 })).toHaveLength(3);
  });
});

describe('cross-content matching', () => {
  // The behaviour the brief asked for: searching a technology should surface
  // the work that used it, not just the skill entry. Projects inherit their
  // technologies' names as keywords, so this needs no duplicated data.
  it('finds projects by a technology they use', () => {
    const results = search('TypeScript');

    expect(results.some((result) => result.id === 'skill:typescript')).toBe(true);
    expect(results.some((result) => result.id === 'project:s-os')).toBe(true);
  });

  it('finds the resume', () => {
    expect(search('resume').some((result) => result.kind === 'document')).toBe(true);
  });

  it('finds a filesystem location', () => {
    expect(search('Projects').some((result) => result.kind === 'location')).toBe(true);
  });
});

describe('ranking', () => {
  it('ranks an exact title match above a substring match', () => {
    const exact = index.find((entry) => entry.title === 'Skills');
    const partial = index.find(
      (entry) => entry.title.includes('Skill') && entry.title !== 'Skills',
    );

    if (exact && partial) {
      expect(scoreEntry(exact, 'Skills')).toBeGreaterThan(scoreEntry(partial, 'Skills'));
    }
  });

  it('ranks a title prefix above a keyword hit', () => {
    const entry = index.find((item) => item.id === 'app:terminal');
    expect(entry).toBeDefined();
    if (!entry) return;

    expect(scoreEntry(entry, 'term')).toBeGreaterThan(scoreEntry(entry, 'navigate'));
  });

  it('returns results in descending score order', () => {
    const scores = search('s').map((result) => result.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('scores zero for a non-match', () => {
    const entry = index[0];
    expect(entry).toBeDefined();
    if (entry) expect(scoreEntry(entry, 'zzzzqqqq')).toBe(0);
  });
});

describe('grouping', () => {
  it('groups results by kind without losing any', () => {
    const flat = search('s', { limit: 20 });
    const grouped = searchGrouped('s', { limit: 20 });

    const total = grouped.reduce((sum, group) => sum + group.results.length, 0);
    expect(total).toBe(flat.length);
  });

  it('labels every group', () => {
    for (const group of searchGrouped('project')) {
      expect(group.label.length).toBeGreaterThan(0);
    }
  });
});
