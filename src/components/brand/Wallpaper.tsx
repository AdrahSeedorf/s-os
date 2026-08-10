import { cn } from '@/lib/utils/cn';
import { S_CURVE_PATH } from './SosMark';

/**
 * The S-OS desktop wallpaper.
 *
 * Built as an inline SVG rather than an image for three reasons: it is a few
 * hundred bytes instead of a few hundred kilobytes, it is resolution
 * independent from a phone to a 5K display, and it re-themes from the design
 * tokens without exporting new assets.
 *
 * The wallpaper is not a logo placement. It uses the same S curve that sits
 * inside the mark, but unbounded and at scale, so the environment reads as the
 * brand rather than as a badge stuck on a background.
 */

export interface WallpaperProps {
  /** Dims and blurs the field. Used behind the login screen so the form on
   *  top keeps its contrast. */
  dimmed?: boolean;
  className?: string;
}

export function Wallpaper({ dimmed = false, className }: WallpaperProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <linearGradient id="sos-wall-field" x1="0" y1="0" x2="0.65" y2="1">
            <stop offset="0%" stopColor="var(--sos-bg-raised)" />
            <stop offset="55%" stopColor="var(--sos-bg-base)" />
            <stop offset="100%" stopColor="var(--sos-bg-void)" />
          </linearGradient>

          <linearGradient id="sos-wall-s" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--sos-accent-300)" />
            <stop offset="60%" stopColor="var(--sos-accent-500)" />
            <stop offset="100%" stopColor="var(--sos-accent-800)" />
          </linearGradient>

          <radialGradient id="sos-wall-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--sos-accent-400)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--sos-accent-400)" stopOpacity="0" />
          </radialGradient>

          {/*
            The filter region has to be generously larger than the shape.
            A Gaussian blur spreads roughly 3× its standard deviation, and the
            group this applies to is scaled 6.4×, so a region sized to the
            path's own bounding box clips the bloom and leaves a visible
            rectangular seam across the wallpaper.
          */}
          <filter id="sos-wall-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        <rect width="1600" height="900" fill="url(#sos-wall-field)" />

        {/* Ambient light behind the form, so the S appears to emit rather than
            sit on top. */}
        <ellipse cx="1080" cy="470" rx="560" ry="430" fill="url(#sos-wall-glow)" />

        {/*
          The mark's S curve, scaled from its 100-unit grid to fill the field.
          Drawn twice: a wide blurred pass for the bloom, a crisp pass on top.

          Sits right of centre and is held well below full opacity. Desktop
          icons occupy the left of the screen, and a wallpaper that competes
          with its own icon labels is a wallpaper that has to be replaced.
        */}
        <g transform="translate(790 190) scale(5.6)" opacity="0.62">
          <path
            d={S_CURVE_PATH}
            fill="none"
            stroke="url(#sos-wall-s)"
            strokeWidth="13"
            strokeLinecap="round"
            filter="url(#sos-wall-blur)"
            opacity="0.5"
          />
          <path
            d={S_CURVE_PATH}
            fill="none"
            stroke="url(#sos-wall-s)"
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>

        {/* A faint technical grid, only in the lower left, where desktop icons
            do not sit. Texture without contrast cost. */}
        <g stroke="var(--sos-accent-300)" strokeOpacity="0.06" strokeWidth="1">
          {Array.from({ length: 12 }, (_, index) => (
            <line
              key={`h${index}`}
              x1="0"
              y1={340 + index * 48}
              x2="620"
              y2={340 + index * 48}
            />
          ))}
          {Array.from({ length: 13 }, (_, index) => (
            <line key={`v${index}`} x1={index * 48} y1="340" x2={index * 48} y2="900" />
          ))}
        </g>

        {/* Vignette. Desktop icon labels sit top-left, and this buys them
            contrast without darkening the whole field. */}
        <rect width="1600" height="900" fill="url(#sos-wall-vignette)" />
        <defs>
          <radialGradient id="sos-wall-vignette" cx="0.5" cy="0.45" r="0.75">
            <stop offset="55%" stopColor="var(--sos-bg-void)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--sos-bg-void)" stopOpacity="0.62" />
          </radialGradient>
        </defs>
      </svg>

      {dimmed ? <div className="bg-void/55 absolute inset-0 backdrop-blur-md" /> : null}
    </div>
  );
}
