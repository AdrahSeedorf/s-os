import { describe, expect, it } from 'vitest';
import {
  buildFileSystem,
  getBreadcrumbs,
  getNode,
  listChildren,
  parentPath,
  resolvePath,
  toDisplayPath,
} from './filesystem';
import { getProjects } from './index';
import { isFile } from '@/types/filesystem';

const fs = buildFileSystem();

describe('filesystem structure', () => {
  it('exposes the five portfolio drives', () => {
    expect(fs.drives.map((drive) => drive.letter)).toEqual(['C:', 'D:', 'E:', 'F:', 'G:']);
  });

  it('indexes every node by its path', () => {
    for (const [path, node] of fs.index) {
      expect(node.path).toBe(path);
    }
  });

  it('gives every node a unique path', () => {
    const paths = [...fs.index.keys()];
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('places every project on the Projects drive', () => {
    const projectFiles = [...fs.index.values()].filter(
      (node) => isFile(node) && node.target.type === 'project',
    );

    expect(projectFiles).toHaveLength(getProjects().length);
    for (const node of projectFiles) {
      expect(node.path.startsWith('D:/')).toBe(true);
    }
  });

  it('names project files after their executable, not their display name', () => {
    const node = getNode(fs, 'D:/Systems & Tooling/S-OS.exe');
    expect(node?.name).toBe('S-OS.exe');
  });

  it('omits the Work History folder while there is no experience to show', () => {
    const names = listChildren(fs, 'E:').map((node) => node.name);
    expect(names).not.toContain('Work History');
    expect(names).toContain('Education');
  });
});

describe('traversal', () => {
  it('lists the children of a folder', () => {
    expect(listChildren(fs, 'C:').map((node) => node.name)).toEqual(['System', 'Programs']);
  });

  it('returns an empty list for files and unknown paths', () => {
    expect(listChildren(fs, 'D:/Systems & Tooling/S-OS.exe')).toEqual([]);
    expect(listChildren(fs, 'Z:/nowhere')).toEqual([]);
  });

  it('builds a breadcrumb trail from the drive down', () => {
    const trail = getBreadcrumbs(fs, 'D:/Systems & Tooling/S-OS.exe');
    expect(trail.map((node) => node.name)).toEqual([
      'Projects (D:)',
      'Systems & Tooling',
      'S-OS.exe',
    ]);
  });

  it('reports the parent of a path, and nothing above a drive', () => {
    expect(parentPath('D:/Systems & Tooling/S-OS.exe')).toBe('D:/Systems & Tooling');
    expect(parentPath('D:')).toBeUndefined();
  });
});

describe('path resolution', () => {
  it('resolves a relative child', () => {
    expect(resolvePath(fs, 'C:', 'System')).toBe('C:/System');
  });

  it('resolves an absolute path regardless of where it starts', () => {
    expect(resolvePath(fs, 'G:', 'C:/System')).toBe('C:/System');
  });

  it('accepts backslashes, because the prompt displays them', () => {
    expect(resolvePath(fs, 'C:', 'System\\About Seedorf')).toBe('C:/System/About Seedorf');
  });

  it('walks up with .. and stays put with .', () => {
    expect(resolvePath(fs, 'C:/System', '..')).toBe('C:');
    expect(resolvePath(fs, 'C:/System', '.')).toBe('C:/System');
  });

  it('never climbs above a drive root', () => {
    expect(resolvePath(fs, 'C:', '../../..')).toBe('C:');
  });

  it('is forgiving about case, like a real shell', () => {
    expect(resolvePath(fs, 'C:', 'system')).toBe('C:/System');
  });

  it('returns undefined for a path that does not exist', () => {
    expect(resolvePath(fs, 'C:', 'Nowhere')).toBeUndefined();
  });
});

describe('display formatting', () => {
  it('renders stored paths with backslashes', () => {
    expect(toDisplayPath('C:/System/About Seedorf')).toBe('C:\\System\\About Seedorf');
  });
});
