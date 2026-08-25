import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import axe, { type Result } from 'axe-core';
import { Desktop } from '@/os/shell/Desktop';
import { MobileShell } from '@/os/mobile/MobileShell';
import { LoginScreen } from '@/os/boot/LoginScreen';
import { DesktopGrid } from '@/os/shell/DesktopGrid';
import { Taskbar } from '@/os/shell/Taskbar';
import { AboutApp } from '@/apps/AboutApp';
import { SkillsApp } from '@/apps/SkillsApp';
import { ResumeApp } from '@/apps/ResumeApp';
import { SystemInfoApp } from '@/apps/SystemInfoApp';
import { RecruiterApp } from '@/apps/RecruiterApp';
import { ContactApp } from '@/apps/ContactApp';
import { ProjectsApp } from '@/apps/ProjectsApp';
import { ProjectApp } from '@/apps/ProjectApp';
import { ExplorerApp } from '@/apps/ExplorerApp';
import { TerminalApp } from '@/apps/TerminalApp';
import { resetWindowStore, useWindowStore } from '@/stores/windowStore';

/**
 * Automated accessibility checks.
 *
 * axe cannot judge whether a label is a *good* label, and it will never catch
 * a focus order that makes no sense — those parts of the audit are done by
 * hand and pinned in keyboard.test.tsx. What this does catch is the whole
 * class of regression that is invisible in review: an aria attribute that is
 * not permitted on its element, a control that loses its accessible name, a
 * landmark that stops being a landmark.
 *
 * Colour contrast is disabled here and checked properly by
 * `tools/audit/contrast.py`, which composites the translucent surfaces. axe
 * in jsdom has no real backdrop to measure against and would report noise.
 */

function describeViolations(violations: readonly Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .slice(0, 3)
        .map((node) => `      ${node.html.slice(0, 140).replace(/\s+/g, ' ')}`)
        .join('\n');
      return `  [${violation.impact}] ${violation.id}: ${violation.help}\n${nodes}`;
    })
    .join('\n');
}

async function expectNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
    rules: { 'color-contrast': { enabled: false } },
  });

  expect(results.violations, `\n${describeViolations(results.violations)}`).toEqual([]);
}

beforeEach(() => {
  resetWindowStore();
});

describe('shells', () => {
  it('desktop with no windows open', async () => {
    const { container } = render(<Desktop />);
    await expectNoViolations(container);
  });

  it('desktop with windows open', async () => {
    useWindowStore.getState().openApp('about');
    useWindowStore.getState().openApp('terminal');

    const { container } = render(<Desktop />);
    await expectNoViolations(container);
  });

  it('mobile shell', async () => {
    const { container } = render(<MobileShell />);
    await expectNoViolations(container);
  });

  it('login screen', async () => {
    const { container } = render(<LoginScreen />);
    await expectNoViolations(container);
  });

  it('desktop grid', async () => {
    const { container } = render(<DesktopGrid />);
    await expectNoViolations(container);
  });

  it('taskbar', async () => {
    const { container } = render(<Taskbar />);
    await expectNoViolations(container);
  });
});

describe('applications', () => {
  const cases: readonly [string, () => React.ReactElement][] = [
    ['Recruiter Mode', () => <RecruiterApp />],
    ['About', () => <AboutApp />],
    ['Skills', () => <SkillsApp />],
    ['Resume', () => <ResumeApp />],
    ['System Information', () => <SystemInfoApp />],
    ['Contact', () => <ContactApp />],
    ['Projects', () => <ProjectsApp />],
    ['Project', () => <ProjectApp windowId="w" params={{ projectId: 's-os' }} />],
    ['File Explorer', () => <ExplorerApp windowId="w" params={{}} />],
    ['Terminal', () => <TerminalApp windowId="w" params={{}} />],
  ];

  for (const [name, factory] of cases) {
    it(name, async () => {
      const { container } = render(factory());
      await expectNoViolations(container);
    });
  }
});

describe('structure', () => {
  it('gives the desktop a top-level heading', () => {
    // Without one, a screen-reader user navigating by heading starts at a
    // window title and never learns what they are inside.
    const { container } = render(<Desktop />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('makes the skip-link target focusable', () => {
    // A fragment link only moves focus if the target can hold it. Without
    // tabIndex the page scrolls and the keyboard stays at the top, which is
    // the exact thing the skip link exists to prevent.
    const { container } = render(<Desktop />);
    const link = container.querySelector<HTMLAnchorElement>('a[href^="#"]');
    expect(link).not.toBeNull();

    const targetId = link?.getAttribute('href')?.slice(1) ?? '';
    const target = container.querySelector(`#${targetId}`);

    expect(target, `no element with id "${targetId}"`).not.toBeNull();
    expect(target?.getAttribute('tabindex')).toBe('-1');
  });
});
