import { lazy, type ComponentType } from 'react';
import type { Size, WindowConstraints } from '@/types/window';
import { DEFAULT_CONSTRAINTS } from '@/types/window';

/**
 * Applications are code-split, one chunk each.
 *
 * The metadata below — name, icon, description, default size — stays in the
 * main bundle, because the Start menu, search, Explorer and the terminal all
 * need to *describe* every program without running any of them. Only the
 * component is deferred, and only until the moment a window opens.
 *
 * This was not true until the M15 audit: every application was imported
 * eagerly, so a visitor who never opened the terminal downloaded it anyway,
 * along with the contact form, the file explorer and everything else. The
 * S-OS project page claimed otherwise, which made it a documentation bug as
 * well as a performance one.
 */
const RecruiterApp = lazy(async () => ({ default: (await import('@/apps/RecruiterApp')).RecruiterApp }));
const ProjectsApp = lazy(async () => ({ default: (await import('@/apps/ProjectsApp')).ProjectsApp }));
const ProjectApp = lazy(async () => ({ default: (await import('@/apps/ProjectApp')).ProjectApp }));
const AboutApp = lazy(async () => ({ default: (await import('@/apps/AboutApp')).AboutApp }));
const SkillsApp = lazy(async () => ({ default: (await import('@/apps/SkillsApp')).SkillsApp }));
const ResumeApp = lazy(async () => ({ default: (await import('@/apps/ResumeApp')).ResumeApp }));
const ExplorerApp = lazy(async () => ({ default: (await import('@/apps/ExplorerApp')).ExplorerApp }));
const DocumentsApp = lazy(async () => ({ default: (await import('@/apps/DocumentsApp')).DocumentsApp }));
const TerminalApp = lazy(async () => ({ default: (await import('@/apps/TerminalApp')).TerminalApp }));
const SystemInfoApp = lazy(async () => ({ default: (await import('@/apps/SystemInfoApp')).SystemInfoApp }));
const ContactApp = lazy(async () => ({ default: (await import('@/apps/ContactApp')).ContactApp }));
const DemoViewerApp = lazy(async () => ({ default: (await import('@/apps/DemoViewerApp')).DemoViewerApp }));
const SettingsApp = lazy(async () => ({ default: (await import('@/apps/SettingsApp')).SettingsApp }));

/**
 * The application registry.
 *
 * Every program declares itself here: its name, icon, default window size and
 * the component that renders its contents. The shell never imports an
 * application directly — it looks one up by id — which is what lets the
 * desktop, Start menu, Explorer, search and terminal all launch programs
 * without knowing anything about them.
 *
 * Adding an application to S-OS is adding an entry to this array.
 */

export interface AppProps {
  /** The window this instance is rendered in, so an application can name its
   *  own window or read its arguments. */
  windowId: string;
  params: Readonly<Record<string, string>>;
}

export interface AppDefinition {
  id: string;
  name: string;
  /** Shown in the title bar when the window is not titled dynamically. */
  title: string;
  icon: string;
  description: string;
  component: ComponentType<AppProps>;
  defaultSize: Size;
  constraints?: Partial<WindowConstraints>;
  /**
   * Whether several windows of this application may be open at once.
   *
   * False for almost everything: opening Terminal twice should focus the
   * terminal you already have, not give you a second one to lose track of.
   * Project windows are the exception — comparing two projects side by side is
   * a reasonable thing to want.
   */
  allowMultiple?: boolean;
  /** Hidden from the Start menu and All Programs. Used for windows that are
   *  always opened by something else, like an individual project. */
  hidden?: boolean;
  /** Gets an icon on the desktop. Reserved for the handful of things a
   *  visitor should not have to go looking for. */
  desktopShortcut?: boolean;
  /** Pinned to the taskbar, left of the running windows. */
  pinned?: boolean;
}

export const applications: readonly AppDefinition[] = [
  {
    id: 'recruiter',
    name: 'Recruiter Mode',
    title: 'Recruiter Mode',
    icon: 'recruiter',
    description: 'Professional summary, best projects, resume and contact details.',
    component: RecruiterApp,
    defaultSize: { width: 880, height: 640 },
    desktopShortcut: true,
    pinned: true,
  },
  {
    id: 'projects',
    name: 'Projects',
    title: 'Projects',
    icon: 'projects',
    description: 'Browse installed programs by category.',
    component: ProjectsApp,
    defaultSize: { width: 840, height: 560 },
    desktopShortcut: true,
    pinned: true,
  },
  {
    id: 'project',
    name: 'Project',
    title: 'Project',
    icon: 'projects',
    description: 'An individual project.',
    component: ProjectApp,
    defaultSize: { width: 760, height: 580 },
    allowMultiple: true,
    hidden: true,
  },
  {
    id: 'about',
    name: 'About Seedorf',
    title: 'About Seedorf',
    icon: 'about',
    description: 'Profile, background and current focus.',
    component: AboutApp,
    defaultSize: { width: 660, height: 540 },
    desktopShortcut: true,
  },
  {
    id: 'skills',
    name: 'Skills',
    title: 'Skills',
    icon: 'skills',
    description: 'Installed technologies and capability levels.',
    component: SkillsApp,
    defaultSize: { width: 720, height: 560 },
  },
  {
    id: 'resume',
    name: 'Resume',
    title: 'Resume',
    icon: 'resume',
    description: 'Curriculum vitae, viewable and downloadable.',
    component: ResumeApp,
    defaultSize: { width: 720, height: 640 },
    desktopShortcut: true,
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    title: 'File Explorer',
    icon: 'explorer',
    description: 'Browse the S-OS drives.',
    component: ExplorerApp,
    defaultSize: { width: 860, height: 560 },
    pinned: true,
    allowMultiple: true,
  },
  {
    id: 'documents',
    name: 'Documents',
    title: 'Documents',
    icon: 'documents',
    description: 'Resume, certificates and written documentation.',
    component: DocumentsApp,
    defaultSize: { width: 780, height: 540 },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    title: 'S-OS Developer Console',
    icon: 'terminal',
    description: 'Navigate the portfolio by command.',
    component: TerminalApp,
    defaultSize: { width: 720, height: 460 },
    constraints: { minWidth: 420, minHeight: 260 },
    desktopShortcut: true,
    pinned: true,
  },
  {
    id: 'system-info',
    name: 'System Information',
    title: 'System Information',
    icon: 'system-info',
    description: 'S-OS specification and installed technologies.',
    component: SystemInfoApp,
    defaultSize: { width: 640, height: 560 },
  },
  {
    id: 'contact',
    name: 'Contact',
    title: 'Contact',
    icon: 'contact',
    description: 'Send a message, or find the direct links.',
    component: ContactApp,
    defaultSize: { width: 560, height: 560 },
    desktopShortcut: true,
    constraints: { maximisable: false },
  },
  {
    id: 'demo-viewer',
    name: 'Demo Viewer',
    title: 'Demo Viewer',
    icon: 'demo-viewer',
    description: 'Runs a project demo inside an S-OS window.',
    component: DemoViewerApp,
    defaultSize: { width: 900, height: 620 },
    allowMultiple: true,
    hidden: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    title: 'Settings',
    icon: 'settings',
    description: 'Sound, motion and contrast.',
    component: SettingsApp,
    defaultSize: { width: 620, height: 620 },
  },
];

const byId = new Map(applications.map((app) => [app.id, app]));

export function getApp(id: string): AppDefinition | undefined {
  return byId.get(id);
}

/** Applications a visitor can launch directly, in registry order. */
export function getLaunchableApps(): readonly AppDefinition[] {
  return applications.filter((app) => app.hidden !== true);
}

export function resolveConstraints(app: AppDefinition): WindowConstraints {
  return { ...DEFAULT_CONSTRAINTS, ...app.constraints };
}
