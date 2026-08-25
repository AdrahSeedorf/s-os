import type { Project } from '@/types/content';

/**
 * PLACEHOLDER — and blocked on a real question.
 *
 * University capstones run with an industry partner routinely carry IP or
 * confidentiality terms that restrict publishing code and screenshots. Until
 * that is confirmed, `publicationNote` is set and the source and demo links
 * are omitted, so the application shows the restriction rather than offering
 * links that should not exist.
 */
export const capstone: Project = {
  id: 'capstone-management-system',
  displayName: 'Capstone Management System',
  executable: 'CapstoneManager.exe',
  icon: 'capstone',
  version: '0.1.0',
  status: 'in-development',
  category: 'university',
  featured: true,
  desktopShortcut: false,

  tagline:
    'A management system for tracking students through professional experience placements and their associated projects.',

  overview:
    'PLACEHOLDER — a system built for Western Sydney University to manage students undertaking professional experience units, along with the projects assigned to them. Awaiting confirmation of scope, stack, team structure and publication permissions.',

  role: 'PENDING — confirm whether solo or team, and what Seedorf personally built.',

  technologies: [],
  features: [],
  challenges: [],
  lessons: [],

  buildLog: {
    done: [],
    next: [
      'Confirm project scope, stack and team structure',
      'Confirm publication permissions',
    ],
    updated: '2026-08-10',
  },

  screenshots: [],
  links: {},
  dateStarted: '2026-01',

  publicationNote:
    'Publication permissions for this university project are being confirmed. Source code and screenshots are withheld until then.',
};
