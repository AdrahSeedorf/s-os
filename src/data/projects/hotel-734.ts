import type { Project } from '@/types/content';

/**
 * 734 — a design prototype, and labelled as one.
 *
 * The temptation with a prototype this complete-looking is to describe it as a
 * hotel booking platform. It is not one yet: every reservation in it is a
 * literal in a data file. Saying so is what makes the rest of the description
 * believable.
 */
export const hotel734: Project = {
  id: 'hotel-734',
  displayName: '734 Hotel Platform',
  executable: 'Hotel734.exe',
  icon: 'hotel-734',
  version: '0.2.0',
  status: 'in-development',
  category: 'full-stack',
  featured: false,
  desktopShortcut: false,

  tagline:
    'An approved design prototype for a Ghanaian hotel — guest site, booking flow and staff dashboard — running entirely on mock data, ahead of the build.',

  overview:
    'A full hotel platform planned in three layers: a guest site, a booking engine with live availability and payment, and an admin dashboard for staff operations. This repository is the first phase — twelve routes covering the entire guest journey and the core staff screens, built to settle the look and the flows before a line of database code is written. Eight guest routes cover the home page, room listings and detail, a five-step booking flow, dining, spa, pool and events; four admin routes cover a daily operations dashboard, a filterable reservations table, a fourteen-day availability grid and a housekeeping board.',

  problem:
    'The requirements were locked but the design was not, and building the database layer first would have meant rebuilding it as soon as the client changed their mind about the booking flow — which, at that stage, they still should have been free to do.',

  solution:
    'Every screen was built against a single mock data module with the real shapes and the real quantities: six room types, twenty-plus reservations, a fourteen-day occupancy forecast. That makes the prototype clickable end to end and reviewable by a non-technical owner, while keeping the swap to a database a change of import rather than a rewrite. Two decisions were made early because they are expensive later: money is stored in minor units with an explicit currency code, so adding a second currency is a display change rather than a migration, and every image renders through one component that draws a deterministic placeholder until real photography arrives.',

  role: 'Sole designer and developer of the prototype, and author of the requirements brief it was built from.',

  technologies: ['typescript', 'nextjs', 'react', 'tailwind', 'html', 'css', 'git'],

  features: [
    'Complete guest journey: home, room listings, room detail with a sticky booking rail, and a five-step booking flow ending in confirmation',
    'Facility pages for dining, spa and gym, pool day passes, and event spaces with a quote enquiry',
    'Admin dashboard: daily KPIs, arrivals, in-house guests, a fourteen-day occupancy forecast, booking sources and exceptions',
    'Searchable and filterable reservations table with a detail drawer',
    'Room-by-day availability grid with a rate strip, and a housekeeping status board organised by floor',
    'Money handled in minor units with an explicit currency code throughout',
    'A single media component that draws a deterministic placeholder, so dropping in real photography changes nothing else',
  ],

  architecture:
    'Route groups separate the two audiences: the guest site carries the header, footer and contact button, while the admin section renders with a sidebar and none of the site chrome. All content lives in one data module and all money and date formatting in another, which is the seam the database will eventually replace.',

  // No challenges recorded: this phase was design work, and inventing an
  // engineering war story for it would be the kind of embellishment the rest
  // of this portfolio is arranged to avoid. The Engineering tab stays hidden.
  challenges: [],

  lessons: [
    'Building the whole surface on mock data first made the design conversation concrete, and made every later database decision follow from a screen that already existed rather than from a guess about one.',
    'Storing money in minor units with a currency code costs nothing on day one and saves a migration later. Storing a price as a float costs nothing on day one too, right up until it does.',
  ],

  buildLog: {
    done: [
      'Requirements brief agreed and locked',
      'Guest site — eight routes covering the full journey, on mock data',
      'Admin dashboard — four routes covering daily operations, reservations, calendar and housekeeping',
      'Pre-build checklist prepared: payment account, SMS sender ID, domain, photography shot list',
    ],
    next: [
      'Prisma schema and Postgres, replacing the mock data module',
      'Real availability logic — inventory counted against date ranges',
      'Paystack integration for mobile money and cards, with a hold job for pay-at-hotel bookings',
      'Authentication: optional guest accounts and role-based staff logins',
      'Remaining admin sections — rates, facility bookings, guests, reports, staff',
    ],
    updated: '2026-08-10',
  },

  screenshots: [],
  links: {},
  // Dates are taken from the repository history rather than from memory. For
  // the projects that began as coursework the real start is earlier, but an
  // approximate date nobody can check is worth less than a precise one that
  // anyone can.
  dateStarted: '2026-01',
};
