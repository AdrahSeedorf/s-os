import type { Project } from '@/types/content';

/**
 * PLACEHOLDER — closest to completion of the non-S-OS projects, so the most
 * likely first candidate for a desktop shortcut once it ships.
 */
export const dateGenerator: Project = {
  id: 'date-generator',
  displayName: 'Date Generator',
  executable: 'DateGen.exe',
  icon: 'date-generator',
  version: '0.8.0',
  status: 'in-development',
  category: 'full-stack',
  featured: true,
  desktopShortcut: false,

  tagline: 'An AI-assisted web app that generates date ideas for couples.',

  overview:
    'PLACEHOLDER — a web application that suggests date ideas for couples, generated with assistance from a language model. Roughly three-quarters complete. Awaiting confirmation of stack, model provider and deployment.',

  role: 'Sole developer.',

  technologies: [],
  features: [],
  challenges: [],
  lessons: [],

  buildLog: {
    done: ['PLACEHOLDER — confirm what is already working'],
    next: ['PLACEHOLDER — confirm the remaining 25%', 'Deploy and capture screenshots'],
    updated: '2026-08-10',
  },

  screenshots: [],
  links: {},
  dateStarted: '2026-01',
};
