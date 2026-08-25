import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileShell } from './MobileShell';
import { DOCK_APP_IDS } from './dockApps';
import { MOBILE_BREAKPOINT } from '@/lib/hooks/useMediaQuery';
import { resetWindowStore, useWindowStore } from '@/stores/windowStore';
import { resetSystemStore } from '@/stores/systemStore';
import { getApp } from '@/os/registry/applications';
import { getProfile } from '@/lib/content';

beforeEach(() => {
  resetWindowStore();
  resetSystemStore();
});

describe('the dock', () => {
  it('keeps the professional fast-tracks in reach', () => {
    // A dock that quietly lost Recruiter Mode would be a real regression, so
    // the choice is data and the test guards it.
    expect(DOCK_APP_IDS).toContain('recruiter');
    expect(DOCK_APP_IDS).toContain('resume');
    expect(DOCK_APP_IDS).toContain('contact');
  });

  it('points every slot at a real application', () => {
    for (const id of DOCK_APP_IDS) {
      expect(getApp(id), id).toBeDefined();
    }
  });

  it('stays small enough to tap', () => {
    expect(DOCK_APP_IDS.length).toBeLessThanOrEqual(5);
  });
});

describe('home screen', () => {
  it('shows who this is before anything is opened', () => {
    render(<MobileShell />);
    expect(screen.getByRole('heading', { name: getProfile().name })).toBeInTheDocument();
  });

  it('renders the dock', () => {
    render(<MobileShell />);
    expect(screen.getByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
  });

  it('launches an application through the shared window store', async () => {
    // This is the whole point of the design: launching is a store action, so
    // every "open X" button written for the desktop works here unchanged.
    const user = userEvent.setup();
    render(<MobileShell />);

    const dock = screen.getByRole('navigation', { name: 'Dock' });
    await user.click(within(dock).getByText('Recruiter'));

    expect(Object.values(useWindowStore.getState().windows)[0]?.appId).toBe('recruiter');
  });
});

describe('running an application', () => {
  it('renders the focused window full-screen with a back control', () => {
    useWindowStore.getState().openApp('about');
    render(<MobileShell />);

    expect(screen.getByRole('button', { name: 'Back to home' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Dock' })).not.toBeInTheDocument();
  });

  it('going home minimises rather than closes', async () => {
    const user = userEvent.setup();
    const id = useWindowStore.getState().openApp('about');

    render(<MobileShell />);
    await user.click(screen.getByRole('button', { name: 'Back to home' }));

    expect(useWindowStore.getState().windows[id ?? '']?.state).toBe('minimised');
    expect(screen.getByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
  });

  it('closing actually closes', async () => {
    const user = userEvent.setup();
    useWindowStore.getState().openApp('about');

    render(<MobileShell />);
    await user.click(screen.getByRole('button', { name: /^Close/ }));

    expect(Object.keys(useWindowStore.getState().windows)).toHaveLength(0);
  });

  it('offers a switcher only once more than one application is open', async () => {
    const user = userEvent.setup();
    useWindowStore.getState().openApp('about');

    const single = render(<MobileShell />);
    expect(screen.queryByRole('button', { name: /Switch app/ })).not.toBeInTheDocument();
    single.unmount();

    useWindowStore.getState().openApp('skills');
    render(<MobileShell />);

    await user.click(screen.getByRole('button', { name: /Switch app/ }));
    expect(screen.getByRole('dialog', { name: 'Open applications' })).toBeInTheDocument();
  });
});

describe('viewport detection', () => {
  it('switches on width rather than a device sniff', () => {
    // A phone in landscape and a narrow browser window have the same problem;
    // a user-agent check answers a question nobody asked.
    expect(MOBILE_BREAKPOINT).toBe(768);
  });
});
