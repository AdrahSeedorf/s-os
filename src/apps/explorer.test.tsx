import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExplorerApp } from './ExplorerApp';
import { ProjectsApp } from './ProjectsApp';
import { ProjectApp } from './ProjectApp';
import { DemoViewerApp } from './DemoViewerApp';
import { resetWindowStore, useWindowStore } from '@/stores/windowStore';
import { getProjects } from '@/lib/content';

beforeEach(() => {
  resetWindowStore();
});

const noParams = { windowId: 'test', params: {} };

describe('File Explorer', () => {
  // The list's accessible name carries the current location, so asserting on
  // it checks the same string a screen-reader user hears.
  const locationOf = () =>
    screen.getByRole('list', { name: /^Contents of / }).getAttribute('aria-label');

  it('opens at the system drive by default', () => {
    render(<ExplorerApp {...noParams} />);
    expect(locationOf()).toBe('Contents of C:');
  });

  it('opens at a requested path', () => {
    render(<ExplorerApp windowId="test" params={{ path: 'G:' }} />);
    expect(locationOf()).toBe('Contents of G:');
  });

  it('falls back to the root for an unknown path', () => {
    // A stale deep link should land somewhere useful rather than in an empty
    // window that looks broken.
    render(<ExplorerApp windowId="test" params={{ path: 'Z:/nowhere' }} />);
    expect(locationOf()).toBe('Contents of C:');
  });

  it('lists every drive in the sidebar', () => {
    render(<ExplorerApp {...noParams} />);
    const sidebar = screen.getByRole('navigation', { name: 'Drives' });

    for (const name of [
      'Local Disk (C:)',
      'Projects (D:)',
      'Experience (E:)',
      'Skills (F:)',
      'Documents (G:)',
    ]) {
      expect(within(sidebar).getByText(name)).toBeInTheDocument();
    }
  });

  it('navigates into a folder on double click', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp {...noParams} />);

    await user.dblClick(screen.getByText('System'));
    expect(locationOf()).toBe('Contents of C:\\System');
  });

  it('navigates with Enter as well as double click', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp {...noParams} />);

    screen.getByText('Programs').closest('button')?.focus();
    await user.keyboard('{Enter}');

    expect(locationOf()).toBe('Contents of C:\\Programs');
  });

  it('enables Back only once there is somewhere to go back to', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp {...noParams} />);

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    await user.dblClick(screen.getByText('System'));
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
  });

  it('goes back to the previous folder', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp {...noParams} />);

    await user.dblClick(screen.getByText('System'));
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(locationOf()).toBe('Contents of C:');
  });

  it('disables Up at a drive root', () => {
    render(<ExplorerApp {...noParams} />);
    expect(screen.getByRole('button', { name: 'Up one level' })).toBeDisabled();
  });

  it('filters the current folder and reports the count', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp windowId="test" params={{ path: 'D:' }} />);

    await user.type(screen.getByRole('searchbox'), 'university');
    expect(screen.getByText(/^1 item of \d+$/)).toBeInTheDocument();
  });

  it('says so when a filter matches nothing', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp windowId="test" params={{ path: 'D:' }} />);

    await user.type(screen.getByRole('searchbox'), 'zzzzqqq');
    expect(screen.getByText(/Nothing here matches/)).toBeInTheDocument();
  });

  it('opens a project file as a project window', async () => {
    const user = userEvent.setup();
    render(<ExplorerApp windowId="test" params={{ path: 'D:/Systems & Tooling' }} />);

    await user.dblClick(screen.getByText('S-OS.exe'));

    const windows = Object.values(useWindowStore.getState().windows);
    expect(windows[0]?.appId).toBe('project');
    expect(windows[0]?.params['projectId']).toBe('s-os');
  });
});

describe('Projects browser', () => {
  it('lists every project', () => {
    render(<ProjectsApp />);

    for (const project of getProjects()) {
      expect(screen.getByText(project.displayName)).toBeInTheDocument();
    }
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    render(<ProjectsApp />);

    await user.click(screen.getByRole('button', { name: 'Planned' }));

    const planned = getProjects().filter((project) => project.status === 'planned');
    const others = getProjects().filter((project) => project.status !== 'planned');

    for (const project of planned) {
      expect(screen.getByText(project.displayName)).toBeInTheDocument();
    }
    for (const project of others) {
      expect(screen.queryByText(project.displayName)).not.toBeInTheDocument();
    }
  });
});

describe('Project application', () => {
  it('shows the project it was asked for', () => {
    render(<ProjectApp windowId="test" params={{ projectId: 's-os' }} />);
    expect(screen.getByRole('heading', { name: 'S-OS' })).toBeInTheDocument();
  });

  it('reports an unknown project rather than rendering blank', () => {
    render(<ProjectApp windowId="test" params={{ projectId: 'nope' }} />);
    expect(screen.getByText(/not installed/i)).toBeInTheDocument();
  });

  it('hides sections a project has no content for', () => {
    // The capstone has no architecture write-up and no screenshots yet, so it
    // should not offer tabs that open onto nothing.
    render(<ProjectApp windowId="test" params={{ projectId: 'capstone-management-system' }} />);

    expect(screen.queryByRole('tab', { name: 'Screenshots' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Build log' })).toBeInTheDocument();
  });

  it('says the source is withheld when publication is restricted', () => {
    render(<ProjectApp windowId="test" params={{ projectId: 'capstone-management-system' }} />);
    expect(screen.getByText(/source withheld/i)).toBeInTheDocument();
  });

  it('switches tabs', async () => {
    const user = userEvent.setup();
    render(<ProjectApp windowId="test" params={{ projectId: 's-os' }} />);

    await user.click(screen.getByRole('tab', { name: 'Engineering' }));
    expect(screen.getByRole('tab', { name: 'Engineering' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('moves between tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<ProjectApp windowId="test" params={{ projectId: 's-os' }} />);

    screen.getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Engineering' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

describe('Demo Viewer', () => {
  it('explains itself when opened with no demo', () => {
    render(<DemoViewerApp {...noParams} />);
    expect(screen.getByText(/no demo to show/i)).toBeInTheDocument();
  });

  it('sandboxes the embedded frame', () => {
    const { container } = render(
      <DemoViewerApp windowId="test" params={{ url: 'https://example.com', title: 'Demo' }} />,
    );

    const frame = container.querySelector('iframe');
    expect(frame).toHaveAttribute('sandbox');
    expect(frame?.getAttribute('sandbox')).not.toContain('allow-top-navigation');
  });

  it('shows the real URL rather than a fabricated one', () => {
    render(
      <DemoViewerApp windowId="test" params={{ url: 'https://example.com', title: 'D' }} />,
    );
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});
