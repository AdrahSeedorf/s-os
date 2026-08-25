'use client';

import { type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/utils/cn';
import { useSound } from '@/lib/audio/useSound';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chrome' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders before the label. Decorative only — never the sole label. */
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /** Stretches to the width of the container. */
  block?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent-600 text-primary border border-accent-500/60',
    'shadow-[inset_0_1px_0_0_rgb(255_255_255/0.22)]',
    'hover:bg-accent-500 active:bg-accent-700',
  ].join(' '),
  secondary: ['sos-glass text-primary', 'hover:bg-glass-strong active:bg-glass-active'].join(
    ' ',
  ),
  ghost: ['bg-transparent text-secondary', 'hover:bg-glass hover:text-primary'].join(' '),
  // Window title bars and taskbar controls: square, tight, low-emphasis.
  chrome: [
    'bg-transparent text-secondary rounded-xs',
    'hover:bg-glass-strong hover:text-primary active:bg-glass-active',
  ].join(' '),
  danger: [
    'bg-transparent text-secondary',
    'hover:bg-status-danger hover:text-inverse active:brightness-90',
  ].join(' '),
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[12px] gap-1.5 rounded-sm',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-md',
  lg: 'h-11 px-5 text-[14px] gap-2 rounded-md',
};

/**
 * The base interactive control for the whole OS.
 *
 * Deliberately a real <button>: S-OS has a hard keyboard-operability
 * requirement, and native buttons give Enter/Space activation, correct
 * focus order and screen-reader semantics for free.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  iconStart,
  iconEnd,
  block = false,
  className,
  type = 'button',
  children,
  onClick,
  ...props
}: ButtonProps) {
  const sound = useSound();

  return (
    <button
      type={type}
      // The click lives here rather than at each call site, so a control
      // cannot be added later and silently be the one thing that makes no
      // noise. Silent by default: useSound checks the preference.
      onClick={(event) => {
        sound('click');
        onClick?.(event);
      }}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
        'transition-colors duration-(--sos-duration-fast) ease-(--ease-out-os)',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {iconStart ? (
        <span aria-hidden="true" className="shrink-0">
          {iconStart}
        </span>
      ) : null}
      {children}
      {iconEnd ? (
        <span aria-hidden="true" className="shrink-0">
          {iconEnd}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Square icon-only control. `label` is required and becomes the accessible
 * name — an icon button without one is unusable on a screen reader, so the
 * type system enforces it rather than trusting the author to remember.
 */
export interface IconButtonProps extends Omit<ButtonProps, 'iconStart' | 'iconEnd' | 'block'> {
  label: string;
}

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-11',
};

export function IconButton({
  label,
  size = 'md',
  variant = 'ghost',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={cn('px-0', ICON_SIZES[size], className)}
      {...props}
    >
      {children}
    </Button>
  );
}
