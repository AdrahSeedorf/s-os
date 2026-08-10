import { type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type GlassTone = 'default' | 'strong' | 'inset';

export interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  tone?: GlassTone;
  /** Escape hatch for semantics: section, aside, nav, header. */
  as?: ElementType;
  children?: ReactNode;
}

const TONES: Record<GlassTone, string> = {
  default: 'sos-glass',
  strong: 'sos-glass-strong',
  inset: 'sos-inset',
};

/**
 * The shared surface of S-OS. Window bodies, menus, tray flyouts and cards
 * are all this component with different tones and radii.
 *
 * Backdrop blur is expensive to composite, so the number of simultaneously
 * visible glass surfaces is a performance budget item — prefer one panel
 * containing plain children over nested panels.
 */
export function GlassPanel({
  tone = 'default',
  as: Component = 'div',
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <Component className={cn(TONES[tone], 'rounded-md', className)} {...props}>
      {children}
    </Component>
  );
}
