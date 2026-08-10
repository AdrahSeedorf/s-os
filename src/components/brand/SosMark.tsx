import { cn } from '@/lib/utils/cn';

/**
 * The S-OS mark.
 *
 * A rounded tile containing the S curve. The tile is what makes the mark
 * survive at 16px — an unbounded glyph loses its silhouette in a browser tab,
 * whereas a filled container keeps a recognisable shape at any size.
 *
 * Used for the favicon, the Start button, the boot screen, the login avatar
 * frame and the taskbar. The wallpaper is not a logo placement: it uses the
 * inner S curve alone, unbounded and at scale.
 */

export interface SosMarkProps {
  /** Rendered pixel size. The mark is drawn on a 100-unit grid and scales
   *  cleanly to anything. */
  size?: number;
  /**
   * Accessible name. Omit for decorative use — the mark almost always sits
   * beside the word "S-OS", and announcing it twice is noise.
   */
  title?: string;
  /** Drops the tile and renders the S curve alone, for use where a container
   *  already exists (inside a window title bar, for instance). */
  glyphOnly?: boolean;
  className?: string;
}

/** The S curve, shared by the mark and the wallpaper so they stay siblings. */
export const S_CURVE_PATH =
  'M66 36 C 62 25, 36 24, 35 37 C 34 50, 65 47, 64 60 C 63 73, 38 74, 33 65';

export function SosMark({ size = 32, title, glyphOnly = false, className }: SosMarkProps) {
  const decorative = title === undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('shrink-0', className)}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      {...(decorative ? {} : { 'aria-label': title })}
    >
      {title ? <title>{title}</title> : null}

      {glyphOnly ? null : (
        <>
          <rect x="6" y="6" width="88" height="88" rx="20" fill="var(--sos-accent-600)" />
          {/* Aero's bright top edge, reduced to a single gradient wash. */}
          <rect
            x="6"
            y="6"
            width="88"
            height="88"
            rx="20"
            fill="url(#sos-mark-sheen)"
            opacity="0.55"
          />
          <rect
            x="7"
            y="7"
            width="86"
            height="86"
            rx="19"
            fill="none"
            stroke="var(--sos-accent-300)"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        </>
      )}

      <path
        d={S_CURVE_PATH}
        fill="none"
        stroke={glyphOnly ? 'var(--sos-accent-300)' : 'var(--sos-accent-100)'}
        strokeWidth="9"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="sos-mark-sheen" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--sos-accent-300)" stopOpacity="0.75" />
          <stop offset="55%" stopColor="var(--sos-accent-600)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--sos-accent-800)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
