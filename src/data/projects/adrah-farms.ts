import type { Project } from '@/types/content';

/**
 * ADRAH Farms — the largest project here by a wide margin, including S-OS.
 *
 * Written from the repository rather than from its README: the README's own
 * status line still said Milestone 4 when the code had modules, routes and
 * tests for every milestone through 16 and the restore drill from 17. Where
 * the two disagreed, the code won.
 */
export const adrahFarms: Project = {
  id: 'adrah-farms',
  displayName: 'ADRAH Farms',
  executable: 'AdrahFarms.exe',
  icon: 'adrah-farms',
  version: '0.9.0',
  status: 'beta',
  category: 'full-stack',
  featured: true,
  desktopShortcut: true,

  tagline:
    'The operating system for a commercial layer poultry farm in Ghana — flocks, feed, health, costing, sales and the public website — built on an append-only ledger so every figure can be reproduced from first principles.',

  overview:
    'ADRAH Farms runs a working poultry business end to end: sites and houses, flock placement and the population ledger, the daily record, rearing and weight sampling, feed and inventory, health programmes and withdrawal periods, flock costing, egg production, biosecurity, procurement, workforce, alerts, sales and dispatch, period reporting, and a public website derived from the farm’s own data. Roughly 65,000 lines of TypeScript across 384 files, a 59-model schema, and about 1,470 tests over the domain core.',

  problem:
    'Farm software usually stores the current bird count in a column that someone can edit. Within months that number disagrees with its own mortality history and its own sales records, and at that point nobody can say which is true — every report built on top of it is suspect. The same applies to stock on hand, and to money held as a floating-point number of cedis.',

  solution:
    'Nothing that matters is stored as a mutable figure. Population and stock are the signed sum of an append-only event ledger, so the current number is always reproducible, and a correction is a new adjustment event carrying a reason code and an author rather than an edit to history. Money is whole pesewas throughout. Quantities carry their unit and refuse to cross dimensions. Authorisation is one server-side gate. All four rules are enforced by tests rather than by intention, which is the only version of an architectural rule that survives sixty-seven commits of new features.',

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
    'Append-only population and stock ledgers — placements, mortality, culls, transfers, sales and stock takes, with every current figure derived rather than stored',
    'Two sign-in paths: email and password for office staff, phone and six-digit PIN with throttling for farm workers on a phone in a poultry house',
    'Role-based access control behind a single server-side gate that throws rather than returning false, with site scoping applied inside queries rather than filtering results afterwards',
    'Health programmes with vaccination scheduling and withdrawal periods, where an unrecorded withdrawal is treated as unknown rather than as none',
    'Sales from order to dispatch to payment, with a withdrawal gate on confirmation so a treated bird cannot be sold inside its withdrawal period',
    'Flock costing down to cost per point-of-lay pullet, with exact apportioning across flocks',
    'An alert engine with fourteen live rules and per-stage mortality thresholds, derived from the ledger rather than entered',
    'A public website generated from the farm’s own data, with an enquiry inbox and an unanswered-enquiry alert',
    'Period reports exportable as two CSVs — one row per figure, each naming where it came from',
    'A restore check that proves the backup restores into something usable, rather than assuming it does',
  ],

  architecture:
    'The domain core is deliberately unnamed: nothing in it says Flock, Chicken, House or Egg. The hierarchy is Organisation, Site, ProductionUnit, AnimalGroup, and a species profile supplies the words the interface shows, while a production-type profile decides which record types apply. Breed curves, healthy mortality rates and vaccination ages are configuration set on veterinary advice, never constants in code: the metrics module computes, it does not prescribe. One service is the only writer to the population ledger, and the ledger writers must prove who owns the row before touching it — which is what makes the derived-not-stored rule enforceable rather than aspirational.',

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
        'A backup nobody has restored is not a backup. Most systems discover this on the day it matters.',
      solution:
        'A restore check that takes the backup, restores it, and asserts the result is a working database with the figures still derivable from the ledger. Proving the recovery path is the only part of a backup strategy that is actually a strategy.',
    },
    {
      challenge:
        'A farm system that is only usable on a good connection is not usable on a farm, and hiding a navigation link is not access control.',
      solution:
        'Authorisation lives in one function called by every server action and route handler before it touches data, and it throws — so a forgotten conditional cannot leak access. Farm staff sign in with a phone number and a PIN, because that is what works on a shared device with gloves on.',
    },
  ],

  lessons: [
    'Deriving a figure instead of storing it costs a little performance and buys the ability to answer "why is this number what it is" forever. Sixty-seven commits later, that decision has not needed revisiting once.',
    'Writing the core without domain nouns felt like over-engineering until the second species was discussed, and then it was the reason that conversation was short.',
    'A rule enforced by a test is an architectural decision; a rule written in a README is a preference — and the README will drift first.',
  ],

  buildLog: {
    done: [
      'Milestones 0 to 4 — schema and domain core, authentication and RBAC, organisation and sites, flocks and the population ledger, the daily record',
      'Milestones 5 to 9 — rearing and weight sampling, feed and inventory, health programmes and withdrawal periods, flock costing, egg production',
      'Milestones 10 to 13 — biosecurity, procurement, workforce with attendance and incidents, and the owner command centre with a fourteen-rule alert engine',
      'Milestones 14 to 16 — the public website and enquiry inbox, sales from order to dispatch to payment, and period reporting with CSV export',
      'Milestone 17 in progress — performance budget check and a restore drill that proves the backup restores into something usable',
      'About 1,470 tests over the domain core: the ledger, money, units, metrics, RBAC, scoping and audit',
    ],
    next: [
      'Finish Milestone 17 — accessibility pass and a security review',
      'Milestone 18 — launch, ahead of the first flock',
    ],
    updated: '2026-10-09',
  },

  screenshots: [],
  links: {
    github: 'https://github.com/AdrahSeedorf/farm',
  },
  dateStarted: '2026-08',
};
