import type { Project } from '@/types/content';

/**
 * The portfolio, listed as a program inside itself.
 *
 * This is not a novelty entry. For a candidate without industry experience,
 * a window manager, virtual filesystem and command interpreter written from
 * scratch is stronger evidence of engineering ability than another CRUD app,
 * so S-OS is treated as the flagship and documented accordingly.
 */
export const sOs: Project = {
  id: 's-os',
  displayName: 'S-OS',
  executable: 'S-OS.exe',
  icon: 'sos',
  version: '0.1.0',
  status: 'in-development',
  category: 'systems',
  featured: true,
  desktopShortcut: true,

  tagline:
    'A browser-based desktop operating system that serves as my portfolio — and is itself the largest project in it.',

  overview:
    'S-OS is a fictional desktop operating system built with Next.js and TypeScript. Visitors boot it, log in, and explore my work as installed programs, documents and system information. Underneath the metaphor are real primitives: a window manager with independent lifecycle and focus handling, a virtual filesystem traversed by both the file explorer and the terminal, a command interpreter, and a search index — all reading from a single typed content model.',

  problem:
    'A conventional portfolio asks a reviewer to take claims about engineering ability on trust: a grid of project cards demonstrates that I can style a page, not that I can design a system. I wanted the portfolio itself to be the evidence, without making the career information any harder to find.',

  solution:
    'I built the portfolio as an operating system, then added a deliberate escape hatch. Recruiter Mode, reachable from the login screen, the desktop and the Start menu, presents the professional summary in one clean window; every project also exists as a server-rendered, indexable URL that can be shared directly. The creative layer never gates the professional layer — a reviewer who wants the resume in ten seconds gets it, and a reviewer who wants to explore can.',

  role: 'Sole designer and developer — product definition, visual design system, architecture, implementation, accessibility and deployment.',

  technologies: [
    'typescript',
    'nextjs',
    'react',
    'tailwind',
    'zustand',
    'css',
    'accessibility',
    'vitest',
    'software-architecture',
    'git',
    'vercel',
  ],

  features: [
    'Window manager: open, close, minimise, maximise, restore, focus, drag and resize, with correct z-ordering across multiple simultaneous windows',
    'Boot sequence and simulated login with guest, demo and Recruiter Mode entry paths',
    'Virtual filesystem shared by File Explorer, My Computer, the Start menu and the terminal',
    'Interactive terminal with a registered command table, history and tab completion',
    'Unified search across projects, applications, skills and documents',
    'Recruiter Mode: a fast professional route that bypasses the OS metaphor entirely',
    'A separate mobile shell rather than a shrunken desktop',
    'Full keyboard operability, including moving and resizing windows without a mouse',
  ],

  architecture:
    'The system separates into four layers: the OS shell (boot, desktop, window manager, taskbar), applications, a content layer, and shared UI primitives. Applications are registered in an application registry and mounted lazily on first launch, so a visitor who never opens the terminal never downloads it. Crucially, applications know nothing about being inside a window — which is exactly why the same components render full-screen in the mobile shell — and they never import content data directly, reaching it through a single accessor module instead. An ESLint rule enforces that boundary, because it is the seam that will let a database replace the flat files later without touching a single application.',

  challenges: [
    {
      challenge:
        'Dragging a window updates its position up to sixty times a second. Holding that in React Context would re-render every consumer — every other window, the taskbar and the desktop — on every frame.',
      solution:
        'Window state lives in a Zustand store, subscribed to with selectors, so a drag re-renders only the window being dragged. Position is applied as a transform during the gesture and committed to the store on release, which avoids layout thrash while keeping state clean.',
    },
    {
      challenge:
        'A JavaScript desktop shell is close to invisible to search engines, and produces an empty preview when the link is pasted into LinkedIn or a job application.',
      solution:
        'Recruiter Mode and every project also exist as server-rendered routes with real metadata and Open Graph images. The desktop reads the same content client-side. Two presentations, one source of truth — which also gives every window a shareable URL.',
    },
    {
      challenge:
        'An operating-system metaphor is a natural enemy of accessibility. Draggable windows, translucent surfaces and icon-only controls are exactly the patterns that fail WCAG.',
      solution:
        'Accessibility was treated as a build constraint rather than a final milestone. Windows are labelled dialogs with managed focus, can be moved and resized entirely by keyboard, and every translucent surface is contrast-tested. A high-contrast mode replaces translucency with solid fills, and reduced-motion preferences collapse animation durations at the design-token level, so the correct behaviour happens whether or not a component author remembered to check.',
    },
    {
      challenge:
        'Several of my projects are still in progress, and an operating system full of programs that open into nothing would read as emptier than a plain page.',
      solution:
        'Project status is a first-class field — Stable, Beta, In Development, Planned — and unfinished entries carry a real build log of what is done and what is next. Only finished work earns a desktop shortcut. Being visibly mid-build is more credible than pretending otherwise.',
    },
  ],

  lessons: [
    'Designing the data model first made most later decisions obvious: because every navigation surface reads one registry, adding a project makes it appear on the desktop, in the explorer, in search and in the terminal without new code.',
    'A linting rule is a more reliable architectural boundary than an intention.',
    'The most valuable feature in the whole system is the one that lets a visitor skip the whole system.',
  ],

  buildLog: {
    done: [
      'Milestone 0 — toolchain, design token system, accessible UI primitives, test setup',
      'Milestone 1 — content model, accessor layer and virtual filesystem',
    ],
    next: [
      'Milestone 2 — S-OS brand system, wallpaper and program icons',
      'Milestone 3 — boot sequence and login',
      'Milestone 4 — window manager',
      'Milestone 5 — desktop and taskbar',
    ],
    updated: '2026-08-10',
  },

  screenshots: [],
  links: {},
  embeddable: false,
  dateStarted: '2026-08',
};
