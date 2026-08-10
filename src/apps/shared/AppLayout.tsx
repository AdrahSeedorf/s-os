import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Layout primitives shared by every content application.
 *
 * None of these know anything about windows. That is the constraint that lets
 * the same applications render full-screen in the mobile shell without a
 * rewrite — an app receives a box and fills it, and whether that box has a
 * title bar is somebody else's problem.
 */

/** The scroll container every application body sits in. */
export function AppScreen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex h-full flex-col gap-6 overflow-auto p-6', className)}>
      {children}
    </div>
  );
}

export function AppSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * A System-Properties-style list of labelled values.
 *
 * A description list rather than a table: these are name/value pairs, not
 * tabular data, and <dl> gives a screen reader the relationship for free.
 */
export function PropertyList({
  items,
}: {
  items: readonly { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-x-5 gap-y-2 sm:grid-cols-[minmax(7rem,auto)_1fr]">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted text-[12px]">{item.label}</dt>
          <dd className="text-secondary mb-1.5 text-[12.5px] sm:mb-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Shown where content is genuinely missing.
 *
 * S-OS has real gaps — no industry experience yet, no resume file, several
 * unfinished projects — and every one of them is stated plainly rather than
 * hidden. A visible empty state reads as honest; a section that silently
 * disappears reads as evasive once someone notices.
 */
export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="border-glass-border rounded-md border border-dashed px-4 py-5 text-center">
      <p className="text-secondary text-[12.5px]">{title}</p>
      {detail ? <p className="text-muted mt-1 text-[11.5px]">{detail}</p> : null}
    </div>
  );
}

/**
 * A link to somewhere outside S-OS.
 *
 * Returns null when the URL is absent, which is how every missing profile link
 * disappears rather than rendering a button that goes nowhere. `noreferrer` is
 * set alongside `noopener` because these open in a new tab.
 */
export function ExternalAction({
  href,
  label,
  icon,
}: {
  href: string | undefined;
  label: string;
  icon?: ReactNode;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="sos-glass hover:bg-glass-strong inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-[13px] font-medium transition-colors"
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {label}
      <ExternalLink size={12} aria-hidden="true" className="text-muted" />
    </a>
  );
}

/** A short label above a value, for scannable at-a-glance strips. */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-disabled text-[10px] font-semibold tracking-[0.12em] uppercase">
        {label}
      </span>
      <span className="text-secondary text-[12.5px]">{value}</span>
    </div>
  );
}
