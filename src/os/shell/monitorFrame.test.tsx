import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MonitorFrame } from './MonitorFrame';

/**
 * The monitor frame's structural contract.
 *
 * The visual result has to be judged by eye, but two things about it are
 * invariants rather than matters of taste, and both break silently:
 *
 *   1. Everything must render *inside* the screen element. The frame's whole
 *      purpose fails if content sits beside it in the tree.
 *   2. The screen must remain a containing block. Six components inside the
 *      OS are `position: fixed` — boot, login, two power screens, the
 *      hydration placeholder and the notification stack — and every one of
 *      them would paint over the bezel if that were lost.
 */

describe('monitor frame', () => {
  it('renders the OS inside the screen, not beside it', () => {
    const { container } = render(
      <MonitorFrame>
        <div data-testid="os">S-OS</div>
      </MonitorFrame>,
    );

    const screen = container.querySelector('[data-sos-screen]');
    expect(screen).not.toBeNull();
    expect(screen?.querySelector('[data-testid="os"]')).not.toBeNull();
  });

  it('keeps the screen a containing block for fixed descendants', () => {
    // Asserted through the class rather than computed style: jsdom does not
    // resolve the stylesheet, but losing the class is the realistic
    // regression — someone restyling the frame and dropping the transform.
    const { container } = render(
      <MonitorFrame>
        <div />
      </MonitorFrame>,
    );

    expect(container.querySelector('.sos-monitor__screen')).not.toBeNull();
  });

  it('marks the decorative parts as hidden from assistive technology', () => {
    // The bezel, its highlight and the power light carry no information. A
    // screen reader announcing "image" three times before the desktop would
    // be pure noise.
    const { container } = render(
      <MonitorFrame>
        <div />
      </MonitorFrame>,
    );

    for (const selector of ['.sos-monitor__highlight', '.sos-monitor__led']) {
      expect(
        container.querySelector(selector)?.getAttribute('aria-hidden'),
        `${selector} should be hidden`,
      ).toBe('true');
    }

    // The frame itself must NOT be hidden — it contains the entire OS.
    expect(container.querySelector('.sos-monitor')?.getAttribute('aria-hidden')).toBeNull();
  });
});
