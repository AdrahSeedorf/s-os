import type { ComponentType } from 'react';
import type { Size, WindowConstraints } from '@/types/window';
import { DEFAULT_CONSTRAINTS } from '@/types/window';
import { PlaceholderApp } from '@/apps/PlaceholderApp';
import { ProjectApp } from '@/apps/ProjectApp';
import { RecruiterApp } from '@/apps/RecruiterApp';
import { AboutApp } from '@/apps/AboutApp';
import { SkillsApp } from '@/apps/SkillsApp';
import { ResumeApp } from '@/apps/ResumeApp';
import { SystemInfoApp } from '@/apps/SystemInfoApp';
import { ProjectsApp } from '@/apps/ProjectsApp';
import { ExplorerApp } from '@/apps/ExplorerApp';
import { DocumentsApp } from '@/apps/DocumentsApp';
import { DemoViewerApp } from '@/apps/DemoViewerApp';
import { TerminalApp } from '@/apps/TerminalApp';
import { ContactApp } from '@/apps/ContactApp';

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

/**
 * Applications arriving in later milestones render a placeholder that names
 * the milestone. An honest "not built yet" is better than a convincing shell
 * with nothing behind it — and it keeps the window manager demonstrable now.
 */
function placeholder(milestone: string): ComponentType<AppProps> {
  const Component = (props: AppProps) => <PlaceholderApp {...props} milestone={milestone} />;
  Component.displayName = `Placeholder(${milestone})`;
  return Component;
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
    component: placeholder('Milestone 16'),
    defaultSize: { width: 600, height: 480 },
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
