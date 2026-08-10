import { cn } from '@/lib/utils/cn';
import { site } from '@/lib/config/site';
import { SosMark } from './SosMark';

export interface SosWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  /** Adds "Seedorf Operating System" beneath the name. Used on the boot and
   *  login screens, where the expansion is worth the vertical space. */
  showFullName?: boolean;
  className?: string;
}

const SIZES = {
  sm: { mark: 20, name: 'text-[14px]', full: 'text-[10px]', gap: 'gap-2' },
  md: { mark: 32, name: 'text-[20px]', full: 'text-[11px]', gap: 'gap-2.5' },
  lg: { mark: 56, name: 'text-[34px]', full: 'text-[13px]', gap: 'gap-4' },
} as const;

/**
 * Mark plus name lockup.
 *
 * The whole lockup carries one accessible name, so assistive technology
 * announces "S-OS" once rather than reading a logo and a heading separately.
 */
export function SosWordmark({
  size = 'md',
  showFullName = false,
  className,
}: SosWordmarkProps) {
  const scale = SIZES[size];

  return (
    <div className={cn('flex items-center', scale.gap, className)}>
      <SosMark size={scale.mark} />
      <div className="flex flex-col">
        <span className={cn(scale.name, 'leading-none font-semibold tracking-tight')}>
          {site.name}
        </span>
        {showFullName ? (
          <span
            className={cn(
              scale.full,
              'text-muted mt-1.5 leading-none font-medium tracking-[0.18em] uppercase',
            )}
          >
            {site.fullName}
          </span>
        ) : null}
      </div>
    </div>
  );
}
