import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import NotFound from './not-found';
import PrivacyPage from './(site)/privacy/page';

/**
 * The pages that run when something has gone wrong.
 *
 * These are the least-exercised screens in the system and the ones with the
 * highest cost of failure: a visitor reaches a 404 having followed a link
 * from a job application, which is the worst possible moment for a dead end.
 *
 * `error.tsx` and `global-error.tsx` are not rendered here. Both are client
 * boundaries that Next mounts itself, and the meaningful assertion about
 * global-error — that it survives the stylesheet failing — cannot be made in
 * jsdom, which has no stylesheet either way.
 */

async function expectNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
    rules: { 'color-contrast': { enabled: false } },
  });

  expect(
    results.violations.map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
}

describe('404', () => {
  it('always offers a route onward', () => {
    // The whole justification for a custom 404. A dead end here loses a
    // visitor who was actively trying to reach the portfolio.
    render(<NotFound />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.map((link) => link.getAttribute('href'))).toContain('/');
  });

  it('states what went wrong in words, not just a number', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cannot find/i);
  });

  it('is free of accessibility violations', async () => {
    const { container } = render(<NotFound />);
    await expectNoViolations(container);
  });
});

describe('privacy', () => {
  it('names the three things that actually touch personal data', () => {
    // Pinned because the page is written from the code, and the code can
    // change. If the contact form, the rate limiter or local storage change
    // behaviour, this test is the reminder that the page describes them.
    render(<PrivacyPage />);
    const text = document.body.textContent ?? '';

    expect(text).toMatch(/Resend/);
    expect(text).toMatch(/IP address/i);
    expect(text).toMatch(/local storage/i);
  });

  it('states the no-tracking position plainly', () => {
    render(<PrivacyPage />);
    const text = document.body.textContent ?? '';

    expect(text).toMatch(/no cookies/i);
    expect(text).toMatch(/analytics/i);
  });

  it('is free of accessibility violations', async () => {
    const { container } = render(<PrivacyPage />);
    await expectNoViolations(container);
  });
});

describe('no tracking, as a fact rather than a claim', () => {
  it('has no analytics or cookie writes anywhere in the source', async () => {
    // The privacy page makes a falsifiable claim. This is what falsifies it:
    // if anyone adds an analytics script or writes a cookie, the page becomes
    // a lie and this test fails before it ships.
    const { readFile, readdir } = await import('node:fs/promises');
    const { join } = await import('node:path');

    // Matched on the thing itself, not its name: two project write-ups use
    // the word "plausible" in prose, and a guard that cries wolf is a guard
    // somebody eventually deletes.
    const banned =
      /document\.cookie|gtag\(|googletagmanager\.com|plausible\.io|posthog\.com|posthog-js|mixpanel|segment\.com|vercel\/analytics/i;
    const offenders: string[] = [];

    async function walk(dir: string): Promise<void> {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(path);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(entry.name)) continue;
        if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue;

        const contents = await readFile(path, 'utf8');
        if (banned.test(contents)) offenders.push(path);
      }
    }

    await walk(join(process.cwd(), 'src'));
    expect(offenders).toEqual([]);
  });
});

