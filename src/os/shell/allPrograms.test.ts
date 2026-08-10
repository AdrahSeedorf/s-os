import { describe, expect, it } from 'vitest';
import { getProgramGroups, getUngroupedApps } from './allPrograms';
import { hasIcon } from '@/components/icons';
import { getApp, getLaunchableApps } from '@/os/registry/applications';
import { getProjects } from '@/lib/content';

const groups = getProgramGroups();
const entries = groups.flatMap((group) => group.entries);

describe('All Programs', () => {
  it('files every launchable application into a folder', () => {
    // Fails the build rather than letting a new application quietly vanish
    // from All Programs because nobody remembered to group it.
    expect(getUngroupedApps()).toEqual([]);
  });

  it('lists every launchable application exactly once', () => {
    const appEntries = entries.filter((entry) => entry.appId !== 'project');
    expect(appEntries).toHaveLength(getLaunchableApps().length);
  });

  it('lists every project', () => {
    const projectEntries = entries.filter((entry) => entry.appId === 'project');
    expect(projectEntries).toHaveLength(getProjects().length);
  });

  it('gives every entry a unique key', () => {
    const keys = entries.map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('resolves every icon', () => {
    const missing = entries.filter((entry) => !hasIcon(entry.icon)).map((entry) => entry.key);
    expect(missing).toEqual([]);
  });

  it('points every entry at a real application', () => {
    for (const entry of entries) {
      expect(getApp(entry.appId), `${entry.key} → ${entry.appId}`).toBeDefined();
    }
  });

  it('passes a projectId to every project entry', () => {
    for (const entry of entries.filter((item) => item.appId === 'project')) {
      expect(entry.params?.['projectId']).toBeTruthy();
    }
  });

  it('has no empty folders', () => {
    for (const group of groups) {
      expect(group.entries.length, `${group.key} is empty`).toBeGreaterThan(0);
    }
  });

  it('puts the professional programs first', () => {
    // Someone opening All Programs to find a resume should not have to scroll
    // past the experiments to reach it.
    expect(groups[0]?.key).toBe('professional');
  });
});
