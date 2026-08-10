import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { hasIcon, iconRegistry, ProgramIcon } from './registry';
import { getProjects } from '@/lib/content';
import { buildFileSystem } from '@/lib/content/filesystem';

/**
 * Icon integrity.
 *
 * Content refers to icons by string, which is what keeps the data files free
 * of component imports — but a string reference can rot silently. These tests
 * turn a missing icon into a failed build rather than a blank square on the
 * desktop that nobody notices until a recruiter does.
 */
describe('icon registry', () => {
  it('resolves the icon of every project', () => {
    const missing = getProjects()
      .filter((project) => !hasIcon(project.icon))
      .map((project) => `${project.id} → ${project.icon}`);

    expect(missing).toEqual([]);
  });

  it('resolves the icon of every filesystem node', () => {
    const fs = buildFileSystem();
    const missing = [...fs.index.values()]
      .filter((node) => !hasIcon(node.icon))
      .map((node) => `${node.path} → ${node.icon}`);

    expect(missing).toEqual([]);
  });

  it('renders every registered glyph without error', () => {
    for (const key of Object.keys(iconRegistry)) {
      const { container, unmount } = render(<ProgramIcon icon={key} />);
      expect(container.querySelector('svg'), `${key} should render an svg`).not.toBeNull();
      unmount();
    }
  });

  it('hides icons from assistive technology unless given a title', () => {
    const { container } = render(<ProgramIcon icon="terminal" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes an accessible name when given a title', () => {
    const { getByRole } = render(<ProgramIcon icon="terminal" title="Terminal" />);
    expect(getByRole('img', { name: 'Terminal' })).toBeInTheDocument();
  });

  it('falls back to a document glyph for an unknown key', () => {
    const { container } = render(<ProgramIcon icon="not-a-real-icon" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
