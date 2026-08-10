import type { ReactNode } from 'react';
import { IconFrame, ink, type GlyphProps } from '../Icon';

/**
 * Application icons.
 *
 * Several share a window silhouette — a title bar over a body — because they
 * are windows onto information. The distinguishing detail sits inside the
 * window, which keeps the family legible while giving each app a recognisable
 * centre at 24px.
 */

function WindowBody({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.2" fill={ink.base} />
      <rect x="2.5" y="4.5" width="19" height="3.6" rx="2.2" fill={ink.tint} opacity="0.3" />
      <circle cx="5.4" cy="6.3" r="0.7" fill={ink.deep} opacity="0.6" />
      <circle cx="7.6" cy="6.3" r="0.7" fill={ink.deep} opacity="0.45" />
      {children}
    </>
  );
}

export function TerminalGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.2" fill={ink.deep} />
      <rect x="2.5" y="4.5" width="19" height="3.4" rx="2.2" fill={ink.base} />
      <path
        d="m6.4 11.4 2.6 2.4-2.6 2.4"
        fill="none"
        stroke={ink.tint}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="11.4" y="15.2" width="5.6" height="1.6" rx="0.8" fill={ink.tint} opacity="0.8" />
    </IconFrame>
  );
}

export function ExplorerGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M2.5 7.4A1.6 1.6 0 0 1 4.1 5.8h4.3l1.7 1.8h6.9"
        fill="none"
        stroke={ink.folder}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="2.5" y="8.2" width="19" height="10.4" rx="2" fill={ink.base} />
      <rect x="2.5" y="8.2" width="6.6" height="10.4" rx="2" fill={ink.deep} opacity="0.55" />
      <g fill={ink.tint} opacity="0.75">
        <rect x="4.2" y="10.6" width="3.4" height="1.2" rx="0.6" />
        <rect x="4.2" y="13" width="3.4" height="1.2" rx="0.6" />
        <rect x="11" y="10.6" width="8.4" height="1.2" rx="0.6" />
        <rect x="11" y="13" width="6" height="1.2" rx="0.6" />
        <rect x="11" y="15.4" width="7.2" height="1.2" rx="0.6" />
      </g>
    </IconFrame>
  );
}

export function AboutGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <WindowBody>
        <circle cx="12" cy="11.6" r="2.5" fill={ink.tint} />
        <path d="M7.4 18.4a4.9 4.9 0 0 1 9.2 0z" fill={ink.tint} opacity="0.8" />
      </WindowBody>
    </IconFrame>
  );
}

export function SystemInfoGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <WindowBody>
        <circle cx="8.6" cy="13.4" r="1.5" fill={ink.tint} />
        <g fill={ink.tint} opacity="0.75">
          <rect x="11.6" y="10.6" width="7.4" height="1.3" rx="0.65" />
          <rect x="11.6" y="12.9" width="7.4" height="1.3" rx="0.65" />
          <rect x="11.6" y="15.2" width="4.8" height="1.3" rx="0.65" />
        </g>
      </WindowBody>
    </IconFrame>
  );
}

export function SettingsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <WindowBody>
        <g stroke={ink.tint} strokeWidth="1.5" strokeLinecap="round">
          <path d="M5.6 11.4h12.8M5.6 15.6h12.8" />
        </g>
        <circle cx="9.4" cy="11.4" r="2" fill={ink.deep} stroke={ink.tint} strokeWidth="1.3" />
        <circle cx="15" cy="15.6" r="2" fill={ink.deep} stroke={ink.tint} strokeWidth="1.3" />
      </WindowBody>
    </IconFrame>
  );
}

export function ContactGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" fill={ink.base} />
      <path
        d="m3.4 7.2 7.5 5.6a1.8 1.8 0 0 0 2.2 0l7.5-5.6"
        fill="none"
        stroke={ink.tint}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function RecruiterGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="2.5" y="7.5" width="19" height="12" rx="2.2" fill={ink.base} />
      <rect x="2.5" y="7.5" width="19" height="3.6" rx="2.2" fill={ink.tint} opacity="0.28" />
      <path
        d="M9 7.5V6.2A1.7 1.7 0 0 1 10.7 4.5h2.6A1.7 1.7 0 0 1 15 6.2v1.3"
        fill="none"
        stroke={ink.base}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m9.6 14.6 1.9 1.9 3.5-3.6"
        fill="none"
        stroke={ink.tint}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function SkillsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <WindowBody>
        <g fill={ink.tint}>
          <rect x="5.6" y="14.8" width="3.2" height="3.4" rx="0.8" />
          <rect x="10.4" y="12.4" width="3.2" height="5.8" rx="0.8" />
          <rect x="15.2" y="10.2" width="3.2" height="8" rx="0.8" opacity="0.85" />
        </g>
      </WindowBody>
    </IconFrame>
  );
}

export function ProjectsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <g fill={ink.base}>
        <rect x="3" y="3" width="8.2" height="8.2" rx="1.8" />
        <rect x="12.8" y="3" width="8.2" height="8.2" rx="1.8" />
        <rect x="3" y="12.8" width="8.2" height="8.2" rx="1.8" />
      </g>
      <rect
        x="12.8"
        y="12.8"
        width="8.2"
        height="8.2"
        rx="1.8"
        fill={ink.deep}
        stroke={ink.tint}
        strokeWidth="1.3"
        strokeDasharray="2.4 2"
      />
    </IconFrame>
  );
}

export function DocumentsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect
        x="6.4"
        y="2.6"
        width="12.6"
        height="16"
        rx="1.8"
        fill={ink.neutral}
        opacity="0.55"
      />
      <rect x="4.4" y="4.6" width="12.6" height="16" rx="1.8" fill={ink.neutralTint} />
      <rect x="4.4" y="4.6" width="12.6" height="3.2" rx="1.8" fill={ink.base} />
      <g fill={ink.neutral} opacity="0.55">
        <rect x="6.6" y="10.4" width="8.2" height="1.3" rx="0.65" />
        <rect x="6.6" y="13" width="8.2" height="1.3" rx="0.65" />
        <rect x="6.6" y="15.6" width="5.4" height="1.3" rx="0.65" />
      </g>
    </IconFrame>
  );
}

export function DemoViewerGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.2" fill={ink.base} />
      <rect x="2.5" y="4.5" width="19" height="4.4" rx="2.2" fill={ink.deep} />
      <rect x="7.4" y="5.9" width="11.6" height="1.8" rx="0.9" fill={ink.tint} opacity="0.55" />
      <circle cx="5.2" cy="6.8" r="0.8" fill={ink.tint} opacity="0.8" />
      <path
        d="M8.6 12.4h6.8M12 12.4v4.4"
        stroke={ink.tint}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </IconFrame>
  );
}
