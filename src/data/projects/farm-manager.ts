import type { Project } from '@/types/content';

/**
 * PLACEHOLDER — not started.
 *
 * Status `planned` keeps it out of the desktop and out of Recruiter Mode: it
 * appears only under All Programs and in the Projects explorer, where a
 * planned entry reads as a roadmap rather than as a hollow claim.
 */
export const farmManager: Project = {
  id: 'farm-manager',
  displayName: 'Farm Management System',
  executable: 'FarmManager.exe',
  icon: 'farm-manager',
  version: '0.0.0',
  status: 'planned',
  category: 'full-stack',
  featured: false,
  desktopShortcut: false,

  tagline: 'A management system for poultry farming operations.',

  overview:
    'PLACEHOLDER — planned. A system for managing poultry farming operations. Scope, stack and timeline still to be defined.',

  role: 'Sole developer.',

  technologies: [],
  features: [],
  challenges: [],
  lessons: [],

  buildLog: {
    done: [],
    next: ['Define scope and core workflows', 'Choose stack', 'Design the data model'],
    updated: '2026-08-10',
  },

  screenshots: [],
  links: {},
  dateStarted: '2026-08',
};
