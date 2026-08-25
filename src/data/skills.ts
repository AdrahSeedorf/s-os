import type { Skill } from '@/types/content';

/**
 * The skills registry, which doubles as the controlled vocabulary for project
 * technologies. A project may only claim a technology that exists here, and a
 * test enforces it — so the Skills application and the project pages can never
 * disagree about what Seedorf works with.
 *
 * Levels are claims a reviewer could test in an interview. Overstating one is
 * worse than omitting it: an inflated "Experienced" collapses in the first
 * technical question, whereas an honest "Learning" alongside a shipped project
 * reads as self-aware.
 *
 * PLACEHOLDER: levels are drafted from the project inventory and need
 * Seedorf's confirmation. See docs/S-OS-SPEC.md §1.4.
 */
export const skills: readonly Skill[] = [
  // --- Languages ---------------------------------------------------------
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'languages',
    level: 'proficient',
    note: 'Primary language across web projects.',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'languages',
    level: 'working-knowledge',
    note: 'Strict-mode TypeScript throughout S-OS, including its content model.',
  },
  {
    id: 'python',
    name: 'Python',
    category: 'languages',
    level: 'proficient',
    note: 'Coursework, scripting and data handling.',
  },
  {
    id: 'java',
    name: 'Java',
    category: 'languages',
    level: 'working-knowledge',
    note: 'Object-oriented programming and data structures coursework.',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'languages',
    level: 'proficient',
    note: 'Schema design and querying for relational application data.',
  },
  {
    id: 'html',
    name: 'HTML',
    category: 'languages',
    level: 'proficient',
    note: 'Semantic markup as the basis of accessible interfaces.',
  },
  {
    id: 'css',
    name: 'CSS',
    category: 'languages',
    level: 'proficient',
    note: 'Custom-property design systems, layout, and responsive behaviour.',
  },

  {
    id: 'cpp',
    name: 'C++',
    category: 'languages',
    level: 'working-knowledge',
    note: 'Modern C++17 across two projects — a routing engine and a game-search engine.',
  },

  // --- Frontend ----------------------------------------------------------
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    level: 'working-knowledge',
    note: 'Component architecture, hooks, and render-cost awareness.',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    level: 'working-knowledge',
    note: 'App Router, server and client component boundaries, route handlers.',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    level: 'working-knowledge',
  },
  {
    id: 'zustand',
    name: 'Zustand',
    category: 'frontend',
    level: 'learning',
    note: 'Selector-based state for high-frequency updates.',
  },
  {
    id: 'accessibility',
    name: 'Web Accessibility',
    category: 'frontend',
    level: 'learning',
    note: 'WCAG contrast, keyboard operability and assistive-technology semantics.',
  },

  {
    id: 'framer-motion',
    name: 'Framer Motion',
    category: 'frontend',
    level: 'working-knowledge',
    note: 'Screen transitions and cinematic sequencing in Hidden Truths.',
  },

  // --- Backend -----------------------------------------------------------
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    level: 'working-knowledge',
  },
  {
    id: 'rest-apis',
    name: 'REST APIs',
    category: 'backend',
    level: 'working-knowledge',
  },

  {
    id: 'prisma',
    name: 'Prisma',
    category: 'backend',
    level: 'working-knowledge',
    note: 'Schema design, migrations and typed queries on the ADRAH Farms platform.',
  },
  {
    id: 'authentication',
    name: 'Authentication & Authorisation',
    category: 'backend',
    level: 'working-knowledge',
    note: 'Auth.js sessions, Argon2id hashing, and a single server-side permission gate.',
  },
  {
    id: 'llm-integration',
    name: 'LLM Integration',
    category: 'backend',
    level: 'working-knowledge',
    note: 'Prompt design and defensive response parsing against the Anthropic API.',
  },

  // --- Databases ---------------------------------------------------------
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'databases',
    level: 'working-knowledge',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'databases',
    level: 'working-knowledge',
  },

  // --- Cloud -------------------------------------------------------------
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    category: 'cloud',
    level: 'learning',
    note: 'PLACEHOLDER — confirm platform (AWS or Azure) and depth.',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'cloud',
    level: 'working-knowledge',
  },

  // --- Security ----------------------------------------------------------
  {
    id: 'ethical-hacking',
    name: 'Ethical Hacking',
    category: 'security',
    level: 'learning',
    note: 'Coursework in offensive techniques and responsible disclosure.',
  },
  {
    id: 'application-security',
    name: 'Application Security',
    category: 'security',
    level: 'learning',
    note: 'Secure defaults, secret handling, and input validation.',
  },
  {
    id: 'compliance',
    name: 'Governance & Compliance',
    category: 'security',
    level: 'learning',
    note: 'PLACEHOLDER — pending confirmation that this becomes a stated pillar.',
  },

  // --- Tools -------------------------------------------------------------
  {
    id: 'git',
    name: 'Git',
    category: 'tools',
    level: 'proficient',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'tools',
    level: 'proficient',
  },
  {
    id: 'vitest',
    name: 'Vitest',
    category: 'tools',
    level: 'learning',
  },

  {
    id: 'cmake',
    name: 'CMake',
    category: 'tools',
    level: 'working-knowledge',
    note: 'Multi-target C++ builds with sanitiser and warnings-as-errors options.',
  },
  {
    id: 'maven',
    name: 'Maven',
    category: 'tools',
    level: 'working-knowledge',
    note: 'Build, test and packaging for the Java library system.',
  },
  {
    id: 'ci-cd',
    name: 'CI Pipelines',
    category: 'tools',
    level: 'working-knowledge',
    note: 'GitHub Actions matrices across compilers, operating systems and JDK versions.',
  },
  {
    id: 'junit',
    name: 'JUnit',
    category: 'tools',
    level: 'working-knowledge',
    note: 'Regression suites driving a console application end to end.',
  },
  {
    id: 'catch2',
    name: 'Catch2',
    category: 'tools',
    level: 'working-knowledge',
    note: 'Unit and dataset tests for the C++ routing engine.',
  },

  // --- Practices ---------------------------------------------------------
  {
    id: 'project-management',
    name: 'Project Management',
    category: 'practices',
    level: 'working-knowledge',
    note: 'Scoping, milestone planning and delivery on university team projects.',
  },
  {
    id: 'software-architecture',
    name: 'Software Architecture',
    category: 'practices',
    level: 'learning',
    note: 'Separation of concerns, data-layer seams and dependency direction.',
  },
  {
    id: 'algorithms',
    name: 'Algorithms & Search',
    category: 'practices',
    level: 'working-knowledge',
    note: 'Dijkstra over composite state, alpha-beta with a transposition table, and MCTS.',
  },
  {
    id: 'event-sourcing',
    name: 'Event Sourcing',
    category: 'practices',
    level: 'working-knowledge',
    note: 'Append-only ledgers where the current figure is always derived, never stored.',
  },
  {
    id: 'discrete-event-simulation',
    name: 'Discrete-Event Simulation',
    category: 'practices',
    level: 'working-knowledge',
    note: 'A queueing simulator whose measured waits corrected a static model by 1,500x.',
  },
  {
    id: 'legacy-code',
    name: 'Working with Legacy Code',
    category: 'practices',
    level: 'working-knowledge',
    note: 'Reproducing a defect and pinning it with a test before changing a line.',
  },
  {
    id: 'testing',
    name: 'Automated Testing',
    category: 'practices',
    level: 'proficient',
    note: 'Unit, integration and regression suites in Vitest, JUnit and Catch2.',
  },
];
