import type { Project } from '@/types/content';

/**
 * ADRAH Farms — the largest project here after S-OS itself.
 *
 * Written from the repository rather than from memory: the milestone table,
 * the four architectural rules and the test count all come from the codebase
 * as it stands, so the status shown here can be checked against the source.
 */
export const adrahFarms: Project = {
  id: 'adrah-farms',
  displayName: 'ADRAH Farms',
  executable: 'AdrahFarms.exe',
  icon: 'adrah-farms',
  version: '0.3.0',
  status: 'in-development',
  category: 'full-stack',
  featured: true,
  desktopShortcut: false,

  tagline:
    'A production platform for a commercial layer poultry farm in Ghana, built on an append-only ledger so its numbers can always be reproduced.',

  overview:
    'ADRAH Farms is the operating system for a working poultry business — sites and houses, flock placement, the population ledger, daily records, feed, health, costing and eventually sales. It is built for people entering data on a phone in a poultry house, on a connection that is not always good, and for an owner who needs to trust the figure on the dashboard months later. Four of eighteen milestones are complete: foundations, authentication and role-based access, organisation and site structure, and flocks with the population ledger.',

  problem:
    'Farm software usually stores the current bird count in a column that someone can edit. Within months that number disagrees with its own mortality history and its own sales records, and at that point nobody can say which is true — every report built on top of it is suspect. The same applies to stock on hand, and to money held as a floating-point number of cedis.',

  solution:
    'Nothing that matters is stored as a mutable figure. Population and stock are the signed sum of an append-only event ledger, so the current number is always reproducible from first principles, and a correction is a new adjustment event carrying a reason code and an author rather than an edit to history. Money is whole pesewas throughout. Quantities carry their unit and refuse to cross dimensions. Authorisation is one server-side gate. All four rules are enforced by tests rather than by intention, which is the only version of an architectural rule that survives three years of changes.',

  role: 'Sole designer and developer — data model, architecture, security model, implementation and testing.',

  technologies: [
    'typescript',
    'nextjs',
    'react',
    'prisma',
    'postgresql',
    'sql',
    'authentication',
    'tailwind',
    'event-sourcing',
    'testing',
    'software-architecture',
    'git',
  ],

  features: [
    'Append-only population ledger — placements, mortality, culls, sales and transfers, with population derived rather than stored',
    'Role-based access control with a single server-side gate that throws rather than returning false',
    'Credentials authentication with Argon2id hashing, database-backed sign-in throttling and immediate revocation despite JWT sessions',
    'Site scoping applied inside queries rather than filtered afterwards',
    'Species-agnostic core — organisation, site, production unit, animal group — so adding pigs or fish is new rows, not a migration',
    'Integer-pesewa money with exact apportioning across flocks and orders',
    'Units of measure that throw on a cross-dimension conversion',
    'Audit log recording who changed what, with secrets stripped',
  ],

  architecture:
    'The domain core is deliberately unnamed: nothing in it says Flock, Chicken, House or Egg. The hierarchy is Organisation, Site, ProductionUnit, AnimalGroup, and a species profile supplies the words the interface shows, while a production-type profile decides which record types apply — layers get egg records and lighting programmes, broilers get weight sampling. Breed curves, healthy mortality rates and vaccination ages are configuration set on veterinary advice, never constants in code: the metrics module computes, it does not prescribe. One service is the only writer to the population ledger, which is what makes the derived-not-stored rule enforceable rather than aspirational.',

  challenges: [
    {
      challenge:
        'Auth.js requires JWT sessions when using a credentials provider. A signed token cannot be deleted server-side the way a session row can, so a deactivated user would keep working until their token expired.',
      solution:
        'The JWT callback re-reads the user from the database on every request and returns null the moment they are deactivated. That restores immediate revocation and keeps roles current without forcing a re-login, at the cost of a query per request — the right trade for a system where dismissing someone has to take effect now.',
    },
    {
      challenge:
        'Splitting a cost across flocks by naive division loses money on every split, and the losses accumulate quietly until a report is wrong by an amount nobody can trace.',
      solution:
        'Allocation functions distribute an amount so that the parts always sum exactly to the original, with the remainder assigned deterministically. Money is integer pesewas everywhere, and there is no path in the codebase where a monetary value is a float.',
    },
    {
      challenge:
        'A farm system that is only usable on a good connection is not usable on a farm, and hiding a navigation link is not access control.',
      solution:
        'Authorisation lives in one function called by every server action and route handler before it touches data, and it throws — so a forgotten conditional cannot leak access. Site scoping is applied within the query rather than filtering results afterwards, which means a scoping mistake returns nothing rather than returning too much.',
    },
  ],

  lessons: [
    'Deriving a figure instead of storing it costs a little performance and buys the ability to answer "why is this number what it is" forever. The cache that makes it fast is safe to delete and rebuild, which is the point.',
    'Writing the core without domain nouns felt like over-engineering until the second species was discussed, and then it was the reason that conversation was short.',
    'A rule enforced by a test is an architectural decision; a rule written in a README is a preference.',
  ],

  buildLog: {
    done: [
      'Milestone 0 — schema, domain core, design tokens, CI',
      'Milestone 1 — authentication, RBAC, rate limiting, the authorisation gate',
      'Milestone 2 — organisations, sites, production units, site scoping, audit log',
      'Milestone 3 — flock placement, the population ledger and the flock timeline',
      '135 tests covering the ledger, money, units, metrics, RBAC, scoping and audit',
    ],
    next: [
      'Milestone 4 — the daily record, the core mobile data-entry screen',
      'Milestone 5 — rearing: chick arrival, brooding, weight and uniformity',
      'Milestone 6 — feed and inventory',
      'Milestone 7 — health programmes, vaccination scheduling and medication',
      'Milestones 1 to 8 must be live before the first chicks arrive',
    ],
    updated: '2026-08-21',
  },

  screenshots: [],
  links: {
    github: 'https://github.com/AdrahSeedorf/farm',
  },
  dateStarted: '2026-08',
};
