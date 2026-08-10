import { describe, expect, it } from 'vitest';
import { getDesktopItems } from './desktopItems';
import { hasIcon } from '@/components/icons';
import { getApp } from '@/os/registry/applications';
import { getProjects } from '@/lib/content';

const items = getDesktopItems();

describe('desktop items', () => {
  it('derives icons from the registry rather than a hand-kept list', () => {
    expect(items.length).toBeGreaterThan(0);
  });

  it('gives every item a unique key', () => {
    const keys = items.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('resolves every icon', () => {
    const missing = items.filter((item) => !hasIcon(item.icon)).map((item) => item.key);
    expect(missing).toEqual([]);
  });

  it('points every item at a real application', () => {
    for (const item of items) {
      expect(getApp(item.appId), `${item.key} → ${item.appId}`).toBeDefined();
    }
  });

  it('gives every item a description for assistive technology', () => {
    for (const item of items) {
      expect(item.description.length).toBeGreaterThan(0);
    }
  });

  it('names project icons after their executable', () => {
    const projectItems = items.filter((item) => item.appId === 'project');
    const executables = getProjects().map((project) => project.executable);

    for (const item of projectItems) {
      expect(executables).toContain(item.label);
    }
  });

  it('passes a projectId to every project shortcut', () => {
    for (const item of items.filter((entry) => entry.appId === 'project')) {
      expect(item.params?.['projectId']).toBeTruthy();
    }
  });

  it('keeps the desktop small enough to scan', () => {
    // A desktop is a first impression, not an inventory. If this fails,
    // something has been given a shortcut that should live in All Programs.
    expect(items.length).toBeLessThanOrEqual(12);
  });

  it('puts Recruiter Mode on the desktop', () => {
    // The single most important shortcut in the whole system: creativity must
    // never make the professional route hard to find.
    expect(items.some((item) => item.appId === 'recruiter')).toBe(true);
  });

  it('lists programs before projects', () => {
    // Recruiters need the fast-tracks; projects are what they explore after.
    const kinds = items.map((item) => (item.appId === 'project' ? 'project' : 'program'));
    const firstProject = kinds.indexOf('project');

    if (firstProject !== -1) {
      expect(kinds.slice(firstProject).every((kind) => kind === 'project')).toBe(true);
    }
  });
});
