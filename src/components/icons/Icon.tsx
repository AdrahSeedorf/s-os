import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface GlyphProps {
  size?: number;
  /** Accessible name. Omitted for decorative use, which is the common case —
   *  a desktop icon already has a visible text label beside it. */
  title?: string;
  className?: string;
}

interface IconFrameProps extends GlyphProps {
  children: ReactNode;
}

/**
 * Shared frame for every program icon.
 *
 * Icons are drawn on a 24-unit grid and coloured through the icon tokens
 * rather than SVG gradients. Gradient ids are document-global, so a desktop
 * rendering twenty icons would produce twenty colliding definitions; CSS
 * variables cost nothing and re-theme with the rest of the system.
 */
export function IconFrame({ size = 32, title, className, children }: IconFrameProps) {
  const decorative = title === undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      {...(decorative ? {} : { 'aria-label': title })}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Colour aliases, so a glyph reads as shape-and-role rather than shape-and-hex. */
export const ink = {
  base: 'var(--sos-icon-base)',
  tint: 'var(--sos-icon-tint)',
  deep: 'var(--sos-icon-deep)',
  folder: 'var(--sos-icon-folder)',
  folderTint: 'var(--sos-icon-folder-tint)',
  folderDeep: 'var(--sos-icon-folder-deep)',
  neutral: 'var(--sos-icon-neutral)',
  neutralTint: 'var(--sos-icon-neutral-tint)',
} as const;
