import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'neutral' | 'accent' | 'stable' | 'beta' | 'dev' | 'planned';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Small filled dot before the label. Decorative — the label carries meaning. */
  dot?: boolean;
  children: ReactNode;
}

const TONES: Record<BadgeTone, { chip: string; dot: string }> = {
  neutral: { chip: 'bg-glass text-secondary border-glass-border', dot: 'bg-muted' },
  accent: {
    chip: 'bg-accent-600/22 text-accent-200 border-accent-500/40',
    dot: 'bg-accent-300',
  },
  stable: {
    chip: 'bg-status-stable/16 text-status-stable border-status-stable/35',
    dot: 'bg-status-stable',
  },
  beta: {
    chip: 'bg-status-beta/16 text-status-beta border-status-beta/35',
    dot: 'bg-status-beta',
  },
  dev: { chip: 'bg-status-dev/16 text-status-dev border-status-dev/35', dot: 'bg-status-dev' },
  planned: {
    chip: 'bg-status-planned/16 text-status-planned border-status-planned/35',
    dot: 'bg-status-planned',
  },
};

/**
 * Status and metadata chip.
 *
 * Colour is always paired with a text label. Project status is the one place
 * in S-OS where colour could be mistaken for the message, and "In Development"
 * has to be legible to a colour-blind reader as plainly as to anyone else.
 */
export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const styles = TONES[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
        'text-[11px] leading-none font-medium tracking-wide whitespace-nowrap uppercase',
        styles.chip,
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', styles.dot)} />
      ) : null}
      {children}
    </span>
  );
}
