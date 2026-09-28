import type { ReactNode } from 'react';

/**
 * The monitor S-OS is displayed on.
 *
 * A bezel rather than a whole workstation: no stand, no desk, no room. The
 * frame exists to say "this is a screen" in the first half-second and then
 * get out of the way, so it is deliberately thin — around ten pixels, under
 * two percent of a 1080p height. A generous mockup-style frame would look
 * better in a screenshot and cost a visitor real estate on every subsequent
 * second they spend actually using the thing.
 *
 * Three implementation notes, each load-bearing:
 *
 *   1. **The screen is a containing block.** `transform: translateZ(0)` makes
 *      `position: fixed` descendants resolve against the screen rather than
 *      the viewport. Boot, login and the power screens are all `fixed
 *      inset-0`, and without this they would paint straight over the bezel.
 *
 *   2. **The bezel is measured, not assumed.** The window manager reads the
 *      screen element's real size rather than `window.innerWidth`, so windows
 *      cannot be dragged underneath the frame.
 *
 *   3. **It collapses to nothing on small viewports.** A phone in a monitor
 *      bezel is a category error, and the pixels matter more there. Done with
 *      a media query on the token rather than a JavaScript branch, so there
 *      is no hydration mismatch and no second code path.
 */
export function MonitorFrame({ children }: { children: ReactNode }) {
  return (
    <div className="sos-monitor" data-sos-monitor>
      {/* The bezel's top edge catches light, the way a real moulded plastic
          edge does. One pixel, and the only thing selling "object" rather
          than "border". */}
      <span className="sos-monitor__highlight" aria-hidden="true" />

      <div className="sos-monitor__screen" data-sos-screen>
        {children}
      </div>

      {/* The power indicator. Static rather than pulsing: a blinking light in
          the corner of a portfolio is a distraction with no information in
          it, and it would have to be exempted from reduced-motion anyway. */}
      <span className="sos-monitor__led" aria-hidden="true" />
    </div>
  );
}
