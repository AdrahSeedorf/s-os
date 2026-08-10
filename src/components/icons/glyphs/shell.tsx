import type { ReactNode } from 'react';
import { IconFrame, ink, type GlyphProps } from '../Icon';

/**
 * Drives, folders and file types.
 *
 * Each family shares one silhouette and varies only by a small badge. That is
 * how real desktops stay scannable: you recognise "folder" from the shape at a
 * glance, then read the badge for which folder. Drawing five unrelated folder
 * illustrations would be prettier and much harder to scan.
 */

// ---------------------------------------------------------------------------
// Drives
// ---------------------------------------------------------------------------

function DriveBody({ badge }: { badge?: ReactNode }) {
  return (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" fill={ink.base} />
      <rect x="2.5" y="6" width="19" height="4.5" rx="2.5" fill={ink.tint} opacity="0.28" />
      <circle cx="18.5" cy="14.5" r="1.1" fill={ink.tint} />
      {badge}
    </>
  );
}

export function DriveSystemGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <DriveBody
        badge={
          <>
            <rect
              x="5"
              y="12.5"
              width="7.5"
              height="1.6"
              rx="0.8"
              fill={ink.deep}
              opacity="0.75"
            />
            <rect
              x="5"
              y="15.2"
              width="4.5"
              height="1.6"
              rx="0.8"
              fill={ink.deep}
              opacity="0.5"
            />
          </>
        }
      />
    </IconFrame>
  );
}

export function DriveProjectsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <DriveBody
        badge={
          <g fill={ink.deep} opacity="0.75">
            <rect x="5" y="12.6" width="3.2" height="3.2" rx="0.7" />
            <rect x="9" y="12.6" width="3.2" height="3.2" rx="0.7" />
          </g>
        }
      />
    </IconFrame>
  );
}

export function DriveExperienceGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <DriveBody
        badge={
          <g fill={ink.deep} opacity="0.75">
            <rect x="5" y="13.4" width="7.5" height="2.6" rx="0.7" />
            <rect x="7.4" y="12.2" width="2.7" height="1.4" rx="0.6" />
          </g>
        }
      />
    </IconFrame>
  );
}

export function DriveSkillsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <DriveBody
        badge={
          <g fill={ink.deep} opacity="0.75">
            <rect x="5" y="14.6" width="1.9" height="1.9" rx="0.5" />
            <rect x="7.6" y="13.4" width="1.9" height="3.1" rx="0.5" />
            <rect x="10.2" y="12.2" width="1.9" height="4.3" rx="0.5" />
          </g>
        }
      />
    </IconFrame>
  );
}

export function DriveDocumentsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <DriveBody
        badge={
          <g fill={ink.deep} opacity="0.75">
            <rect x="5.4" y="12.2" width="5.6" height="4.4" rx="0.7" />
            <rect x="6.6" y="13.4" width="3.2" height="0.9" rx="0.45" fill={ink.tint} />
            <rect x="6.6" y="14.9" width="2.2" height="0.9" rx="0.45" fill={ink.tint} />
          </g>
        }
      />
    </IconFrame>
  );
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

function FolderBody({ badge }: { badge?: ReactNode }) {
  return (
    <>
      <path
        d="M2.5 7.5A1.5 1.5 0 0 1 4 6h4.6a1.5 1.5 0 0 1 1.06.44l1 1H20a1.5 1.5 0 0 1 1.5 1.5v1H2.5z"
        fill={ink.folderDeep}
      />
      <rect x="2.5" y="8.5" width="19" height="9.5" rx="1.8" fill={ink.folder} />
      <rect
        x="2.5"
        y="8.5"
        width="19"
        height="3.4"
        rx="1.8"
        fill={ink.folderTint}
        opacity="0.35"
      />
      {badge}
    </>
  );
}

export function FolderGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody />
    </IconFrame>
  );
}

function folderBadge(children: ReactNode) {
  return (
    <g fill={ink.folderDeep} opacity="0.62">
      {children}
    </g>
  );
}

export function FolderSystemGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody
        badge={folderBadge(
          <>
            <rect x="9.4" y="12.3" width="5.2" height="4" rx="0.8" />
            <rect x="11.3" y="11.2" width="1.4" height="1.4" rx="0.4" />
          </>,
        )}
      />
    </IconFrame>
  );
}

export function FolderProgramsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody
        badge={folderBadge(
          <>
            <rect x="8.6" y="12.2" width="3" height="3" rx="0.6" />
            <rect x="12.4" y="12.2" width="3" height="3" rx="0.6" />
          </>,
        )}
      />
    </IconFrame>
  );
}

export function FolderProjectsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody
        badge={folderBadge(
          <path
            d="M9.4 12.4 7.6 14.2l1.8 1.8M14.6 12.4l1.8 1.8-1.8 1.8"
            fill="none"
            stroke={ink.folderDeep}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />,
        )}
      />
    </IconFrame>
  );
}

export function FolderEducationGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody badge={folderBadge(<path d="M12 11.4 16.6 13.6 12 15.8 7.4 13.6z" />)} />
    </IconFrame>
  );
}

export function FolderWorkGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody
        badge={folderBadge(
          <>
            <rect x="8.8" y="12.4" width="6.4" height="4.2" rx="0.8" />
            <rect x="10.6" y="11.3" width="2.8" height="1.4" rx="0.5" />
          </>,
        )}
      />
    </IconFrame>
  );
}

export function FolderCertificatesGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody
        badge={folderBadge(
          <>
            <circle cx="12" cy="13.5" r="2.1" />
            <path d="M10.7 15.4 10.3 17.4 12 16.5 13.7 17.4 13.3 15.4z" />
          </>,
        )}
      />
    </IconFrame>
  );
}

export function FolderSkillsGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <FolderBody
        badge={folderBadge(
          <>
            <rect x="9" y="14.4" width="1.8" height="2.2" rx="0.5" />
            <rect x="11.1" y="13" width="1.8" height="3.6" rx="0.5" />
            <rect x="13.2" y="11.8" width="1.8" height="4.8" rx="0.5" />
          </>,
        )}
      />
    </IconFrame>
  );
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

function PageBody({ accent = ink.base, children }: { accent?: string; children?: ReactNode }) {
  return (
    <>
      <path
        d="M5 3.5A1.5 1.5 0 0 1 6.5 2h6.7L19 7.8V20.5A1.5 1.5 0 0 1 17.5 22h-11A1.5 1.5 0 0 1 5 20.5z"
        fill={ink.neutralTint}
      />
      <path d="M13.2 2 19 7.8h-4.3a1.5 1.5 0 0 1-1.5-1.5z" fill={ink.neutral} />
      <rect x="5" y="9.5" width="14" height="3.4" fill={accent} />
      {children}
    </>
  );
}

export function DocumentGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <PageBody accent={ink.neutral}>
        <g fill={ink.neutral} opacity="0.5">
          <rect x="7.2" y="15" width="9.6" height="1.3" rx="0.65" />
          <rect x="7.2" y="17.6" width="6.4" height="1.3" rx="0.65" />
        </g>
      </PageBody>
    </IconFrame>
  );
}

export function ResumeGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <PageBody>
        <circle cx="9.4" cy="16.4" r="1.7" fill={ink.base} opacity="0.85" />
        <g fill={ink.base} opacity="0.5">
          <rect x="12.4" y="15.2" width="4.4" height="1.2" rx="0.6" />
          <rect x="12.4" y="17.4" width="4.4" height="1.2" rx="0.6" />
          <rect x="7.2" y="19.4" width="9.6" height="1.2" rx="0.6" />
        </g>
      </PageBody>
    </IconFrame>
  );
}

export function CertificateGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="3" y="4.5" width="18" height="12.5" rx="1.8" fill={ink.neutralTint} />
      <rect x="3" y="4.5" width="18" height="3" rx="1.8" fill={ink.base} />
      <g fill={ink.neutral} opacity="0.45">
        <rect x="5.5" y="9.4" width="9" height="1.3" rx="0.65" />
        <rect x="5.5" y="12" width="6" height="1.3" rx="0.65" />
      </g>
      <circle cx="17" cy="15.5" r="3.1" fill={ink.base} />
      <path d="M15.2 18 14.6 22 17 20.6 19.4 22 18.8 18z" fill={ink.deep} />
    </IconFrame>
  );
}

export function EducationGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 4 22.5 9 12 14 1.5 9z" fill={ink.base} />
      <path d="M12 4 22.5 9 12 14z" fill={ink.tint} opacity="0.3" />
      <path
        d="M6 11.2v4.4c0 1.9 2.7 3.4 6 3.4s6-1.5 6-3.4v-4.4"
        fill="none"
        stroke={ink.deep}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M21.4 9.6v5" stroke={ink.tint} strokeWidth="1.3" strokeLinecap="round" />
    </IconFrame>
  );
}

export function WorkGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="2.5" y="7.5" width="19" height="12" rx="2.2" fill={ink.base} />
      <rect x="2.5" y="7.5" width="19" height="3.6" rx="2.2" fill={ink.tint} opacity="0.26" />
      <path
        d="M9 7.5V6.2A1.7 1.7 0 0 1 10.7 4.5h2.6A1.7 1.7 0 0 1 15 6.2v1.3"
        fill="none"
        stroke={ink.base}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="10.4" y="12.4" width="3.2" height="2.4" rx="0.7" fill={ink.deep} />
    </IconFrame>
  );
}

export function SkillGlyph(props: GlyphProps) {
  return (
    <IconFrame {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill={ink.base} />
      <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1" fill={ink.deep} opacity="0.7" />
      <g stroke={ink.tint} strokeWidth="1.5" strokeLinecap="round">
        <path d="M9.6 6.5V4M14.4 6.5V4M9.6 17.5V20M14.4 17.5V20" />
        <path d="M6.5 9.6H4M6.5 14.4H4M17.5 9.6H20M17.5 14.4H20" />
      </g>
    </IconFrame>
  );
}
