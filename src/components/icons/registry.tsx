import type { ComponentType } from 'react';
import type { GlyphProps } from './Icon';
import {
  CertificateGlyph,
  DocumentGlyph,
  DriveDocumentsGlyph,
  DriveExperienceGlyph,
  DriveProjectsGlyph,
  DriveSkillsGlyph,
  DriveSystemGlyph,
  EducationGlyph,
  FolderCertificatesGlyph,
  FolderEducationGlyph,
  FolderGlyph,
  FolderProgramsGlyph,
  FolderProjectsGlyph,
  FolderSkillsGlyph,
  FolderSystemGlyph,
  FolderWorkGlyph,
  ResumeGlyph,
  SkillGlyph,
  WorkGlyph,
} from './glyphs/shell';
import {
  AboutGlyph,
  ContactGlyph,
  DemoViewerGlyph,
  DocumentsGlyph,
  ExplorerGlyph,
  ProjectsGlyph,
  RecruiterGlyph,
  SettingsGlyph,
  SkillsGlyph,
  SystemInfoGlyph,
  TerminalGlyph,
} from './glyphs/apps';
import {
  AdrahFarmsGlyph,
  CapstoneGlyph,
  EvNetworkGlyph,
  HiddenTruthsGlyph,
  Hotel734Glyph,
  LibraryGlyph,
  NineBoardGlyph,
  SosProjectGlyph,
} from './glyphs/projects';

/**
 * Icon registry.
 *
 * Content refers to icons by string key — `project.icon`, `fsNode.icon` — so
 * the data files never import a component. This is the same separation the
 * content layer uses: data describes, the shell resolves.
 *
 * A test asserts that every key referenced anywhere in the content and the
 * filesystem resolves here, so a missing icon fails the build instead of
 * silently rendering a blank square on the desktop.
 */
export type IconKey = string;

export const iconRegistry: Readonly<Record<string, ComponentType<GlyphProps>>> = {
  // Projects
  sos: SosProjectGlyph,
  capstone: CapstoneGlyph,
  'hidden-truths': HiddenTruthsGlyph,
  'hotel-734': Hotel734Glyph,
  'adrah-farms': AdrahFarmsGlyph,
  'ev-network': EvNetworkGlyph,
  library: LibraryGlyph,
  'nine-board': NineBoardGlyph,

  // Applications
  about: AboutGlyph,
  'system-info': SystemInfoGlyph,
  settings: SettingsGlyph,
  terminal: TerminalGlyph,
  explorer: ExplorerGlyph,
  recruiter: RecruiterGlyph,
  contact: ContactGlyph,
  skills: SkillsGlyph,
  projects: ProjectsGlyph,
  documents: DocumentsGlyph,
  'demo-viewer': DemoViewerGlyph,

  // Drives
  'drive-system': DriveSystemGlyph,
  'drive-projects': DriveProjectsGlyph,
  'drive-experience': DriveExperienceGlyph,
  'drive-skills': DriveSkillsGlyph,
  'drive-documents': DriveDocumentsGlyph,

  // Folders
  folder: FolderGlyph,
  'folder-system': FolderSystemGlyph,
  'folder-programs': FolderProgramsGlyph,
  'folder-projects': FolderProjectsGlyph,
  'folder-education': FolderEducationGlyph,
  'folder-work': FolderWorkGlyph,
  'folder-certificates': FolderCertificatesGlyph,
  'folder-skills': FolderSkillsGlyph,

  // Files
  document: DocumentGlyph,
  resume: ResumeGlyph,
  certificate: CertificateGlyph,
  education: EducationGlyph,
  work: WorkGlyph,
  skill: SkillGlyph,
};

export function hasIcon(key: IconKey): boolean {
  return key in iconRegistry;
}

export interface ProgramIconProps extends GlyphProps {
  icon: IconKey;
}

/**
 * Render an icon by key.
 *
 * Falls back to the generic document glyph rather than rendering nothing —
 * a missing icon should look like an unremarkable file, not like a broken
 * layout. The integrity test is what stops the fallback ever being needed.
 */
export function ProgramIcon({ icon, ...props }: ProgramIconProps) {
  const Glyph = iconRegistry[icon] ?? DocumentGlyph;
  return <Glyph {...props} />;
}
