import { IconFrame, ink, type GlyphProps } from '../Icon';
import { S_CURVE_PATH } from '@/components/brand/SosMark';

/**
 * Project icons.
 *
 * These carry more personality than the system glyphs — a desktop of
 * indistinguishable blue squares would defeat the point of installing projects
 * as programs. Each still resolves to a single clear silhouette at 24px.
 */

export function SosProjectGlyph({ size = 32, title, className }: GlyphProps) {
  const decorative = title === undefined;

  // Drawn on the mark's 100-unit grid rather than the 24-unit icon grid, so
  // the desktop shortcut is pixel-identical to the Start button and favicon.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      {...(decorative ? {} : { 'aria-label': title })}
    >
      {title ? <title>{title}</title> : null}
      <rect x="6" y="6" width="88" height="88" rx="20" fill="var(--sos-accent-600)" />
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
      <path
        d={S_CURVE_PATH}
        fill="none"
        stroke="var(--sos-accent-100)"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Capstone — a clipboard of tracked students and their placements. */
export function CapstoneGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="16" height="17" rx="2.2" fill={ink.base} />
      <rect x="6.2" y="2.6" width="11.6" height="3.6" rx="1.4" fill={ink.deep} />
      <circle cx="12" cy="4.4" r="0.9" fill={ink.tint} />
      <g fill={ink.tint} opacity="0.85">
        <circle cx="8.4" cy="10.4" r="1.4" />
        <rect x="11.4" y="9.7" width="6.2" height="1.4" rx="0.7" />
      </g>
      <g fill={ink.tint} opacity="0.55">
        <circle cx="8.4" cy="14.8" r="1.4" />
        <rect x="11.4" y="14.1" width="6.2" height="1.4" rx="0.7" />
      </g>
      <rect x="6.4" y="18" width="11.2" height="1.3" rx="0.65" fill={ink.tint} opacity="0.35" />
    </IconFrame>
  );
}

/** Date Generator — two joined marks with a generated spark. */
export function DateGeneratorGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="2.5" y="5" width="19" height="15.5" rx="2.4" fill={ink.base} />
      <rect x="2.5" y="5" width="19" height="4" rx="2.4" fill={ink.deep} />
      <g fill={ink.tint} opacity="0.9">
        <rect x="6.6" y="3.2" width="1.7" height="3.6" rx="0.85" />
        <rect x="15.7" y="3.2" width="1.7" height="3.6" rx="0.85" />
      </g>
      <path
        d="M12 18.2c-3-2-4.6-3.6-4.6-5.4A2.4 2.4 0 0 1 12 11.3a2.4 2.4 0 0 1 4.6 1.5c0 1.8-1.6 3.4-4.6 5.4z"
        fill={ink.tint}
      />
    </IconFrame>
  );
}

/** Hotel — a building with a lit reception floor. */
export function HotelManagerGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 6.4A1.8 1.8 0 0 1 5.8 4.6h12.4A1.8 1.8 0 0 1 20 6.4V21H4z" fill={ink.base} />
      <g fill={ink.tint} opacity="0.85">
        <rect x="6.6" y="7.6" width="2.6" height="2.6" rx="0.6" />
        <rect x="10.7" y="7.6" width="2.6" height="2.6" rx="0.6" />
        <rect x="14.8" y="7.6" width="2.6" height="2.6" rx="0.6" />
        <rect x="6.6" y="11.8" width="2.6" height="2.6" rx="0.6" />
        <rect x="10.7" y="11.8" width="2.6" height="2.6" rx="0.6" />
        <rect x="14.8" y="11.8" width="2.6" height="2.6" rx="0.6" />
      </g>
      <rect x="4" y="16.4" width="16" height="4.6" fill={ink.deep} />
      <rect x="10.2" y="17.6" width="3.6" height="3.4" rx="0.6" fill={ink.tint} />
    </IconFrame>
  );
}

/** Farm — a barn roof over a management grid. */
export function FarmManagerGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3.2 21 7.8v2.1H3V7.8z" fill={ink.deep} />
      <path d="M4.6 9.9h14.8V21H4.6z" fill={ink.base} />
      <path
        d="M6.6 12.2h10.8M12 12.2V21"
        stroke={ink.tint}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect x="9.8" y="15.6" width="4.4" height="5.4" rx="2.2" fill={ink.tint} opacity="0.9" />
    </IconFrame>
  );
}
