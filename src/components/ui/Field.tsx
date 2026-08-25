'use client';

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils/cn';

const CONTROL_BASE = [
  'sos-inset w-full rounded-sm px-3 text-[13px] text-primary',
  'placeholder:text-placeholder',
  'transition-[box-shadow,border-color] duration-(--sos-duration-fast)',
  'focus:border-accent-500/70 focus:shadow-[inset_0_1px_3px_rgb(0_0_0/0.5),0_0_0_2px_rgb(38_174_230/0.28)]',
  'disabled:opacity-50',
  'aria-[invalid=true]:border-status-danger/70',
].join(' ');

interface FieldShellProps {
  label: string;
  /** Persistent helper text. Rendered before errors in the DOM. */
  hint?: string;
  error?: string;
  required?: boolean;
  children: (ids: { controlId: string; describedBy: string | undefined }) => ReactNode;
}

/**
 * Wires up the label, hint and error relationships that make a form usable
 * without sight. Callers cannot forget `aria-describedby` because the shell
 * hands the ids to the control rather than trusting them to be repeated.
 */
function FieldShell({ label, hint, error, required, children }: FieldShellProps) {
  const controlId = useId();
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={controlId} className="text-secondary text-[12px] font-medium">
        {label}
        {required ? (
          <span className="text-status-danger ml-1" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children({ controlId, describedBy })}

      {hint ? (
        <p id={hintId} className="text-muted text-[11px]">
          {hint}
        </p>
      ) : null}

      {/* Live region so a validation failure is announced, not just shown. */}
      {error ? (
        <p id={errorId} role="alert" className="text-status-danger text-[11px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'aria-describedby'
> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, hint, error, className, ...props }: TextFieldProps) {
  return (
    <FieldShell
      label={label}
      {...(hint === undefined ? {} : { hint })}
      {...(error === undefined ? {} : { error })}
      {...(props.required === undefined ? {} : { required: props.required })}
    >
      {({ controlId, describedBy }) => (
        <input
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(CONTROL_BASE, 'h-9', className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'aria-describedby'
> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextAreaField({ label, hint, error, className, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell
      label={label}
      {...(hint === undefined ? {} : { hint })}
      {...(error === undefined ? {} : { error })}
      {...(props.required === undefined ? {} : { required: props.required })}
    >
      {({ controlId, describedBy }) => (
        <textarea
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(CONTROL_BASE, 'resize-y py-2 leading-relaxed', className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}
