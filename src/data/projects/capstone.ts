import type { Project } from '@/types/content';

/**
 * The capstone.
 *
 * The only entry in the portfolio with a client, a team and a delivery
 * lifecycle behind it — which makes it the only evidence here for the half of
 * the job that is not writing code. Everything else Seedorf has built is solo
 * and self-directed.
 *
 * Written from the repository, not from memory: the commit count, the module
 * boundaries and the test totals are all read from the source. Publication is
 * still withheld — the work was delivered to a sponsor and is not his to
 * publish — so the entry describes it in detail and links to nothing. The
 * content-integrity test enforces that: a project with a publication note may
 * not carry a repository link or a demo.
 */
export const capstone: Project = {
  id: 'capstone-management-system',
  displayName: 'Capstone Management System',
  executable: 'CapstoneManager.exe',
  icon: 'capstone',
  version: '1.0.0',
  status: 'stable',
  category: 'university',
  // Featured, despite linking to nothing. It is the only project here with a
  // client, a team and a delivery lifecycle behind it, and a shortlist of five
  // solo projects would misrepresent what Seedorf has actually done.
  featured: true,
  desktopShortcut: false,

  tagline:
    'A web platform for running final-year computer science projects end to end — clients submitting work, projects allocated to student groups, supervisors evaluating them. Delivered to a sponsor by a team of four across a full agile engagement.',

  overview:
    'The sponsor coordinates final-year projects between four groups of people who barely overlap: external clients who propose the work, student teams who deliver it, supervisors who assess them, and coordinators who run the unit. The system models all four as first-class roles, each with its own authenticated dashboard, over a 39-model schema covering proposals, expressions of interest, group formation, presentations, peer review and marking. Roughly 25,000 lines of TypeScript, 348 commits, delivered from requirements gathering through to final handover.',

  problem:
    'The sponsor was running this on a legacy system that had aged badly — and parts of it had been taken offline by their own cybersecurity team. That is an unusually clear brief: the replacement had to be modern, and its security posture was not a nice-to-have but the reason the project existed.',

  solution:
    'A role-based web application replacing the legacy system, built in sprints against requirements that came from the client rather than from a specification. The process mattered as much as the software: requirements changed during the engagement and were renegotiated with the sponsor in review meetings rather than assumed. Every dashboard sits behind session-checked middleware that redirects on the wrong role, so an admin route is not merely hidden from a student — it is refused.',

  role:
    'Team lead across a team of four — coordinated the work, organised and ran the client meetings, and built mainly the interface with some backend behind it. I owned the supervisor module and was the largest contributor to the repository, with 124 of its 348 commits.',

  team: {
    size: 4,
    contribution:
      'Led the team and the client relationship, and owned the supervisor module end to end — around 7,000 lines across the supervisor dashboard, evaluations, peer-review matrix, presentation marking, projects and teams, plus its Playwright end-to-end suite.',
  },

  technologies: [
    'typescript',
    'nextjs',
    'react',
    'prisma',
    'postgresql',
    'authentication',
    'tailwind',
    'testing',
    'ci-cd',
    'project-management',
    'git',
    'github',
  ],

  features: [
    'Four authenticated roles — admin, coordinator, supervisor and client — each with its own dashboard and its own login route, plus a separate student path',
    'Client project proposals, expressions of interest, and allocation of approved projects to student groups',
    'Supervisor evaluation with a weighted peer-review matrix, draft saving, and a supervisor override guarded against totals exceeding 100%',
    'Presentation scheduling, marking and publishing, with locking so marks cannot move after release',
    'Role-based route protection in middleware, so an unauthorised dashboard redirects rather than merely hiding its navigation',
    '39-model schema covering proposals, groups, evaluations, peer review, presentations and per-student scoring',
    '61 Jest suites and 19 Playwright end-to-end specs, both run in GitHub Actions on every push',
  ],

  architecture:
    'A Next.js App Router application over Prisma and serverless Postgres, partitioned by role rather than by layer: each of admin, coordinator, supervisor and client owns a dashboard tree and an API surface. That split was a team decision as much as an architectural one — four people, one codebase and one semester, so each of us owned a module with a boundary instead of four people editing the same screens.',

  challenges: [
    {
      challenge:
        'Requirements came from a client rather than a specification, and changed during the engagement.',
      solution:
        'Review meetings with the sponsor at the end of each sprint, with something they could react to every time. Presenting to a client at intervals changes what gets built — a decision that cannot be explained in a meeting is usually one that was not made for a good reason.',
    },
    {
      challenge:
        'Peer review has to turn subjective per-student ratings into a defensible mark, and supervisors need to be able to overrule it without producing an impossible total.',
      solution:
        'A contribution matrix that derives each student’s share from the current scores rather than a stale snapshot, with an explicit supervisor override that validates the total stays within bounds. The end-to-end tests cover the draft-and-recalculate workflow, because that is where a marking system quietly goes wrong.',
    },
    {
      challenge:
        'A marking system fails badly and silently: a wrong total is not an exception, it is a number that looks fine.',
      solution:
        'End-to-end tests through the real interface rather than unit tests around the arithmetic — login, evaluate, save a draft, recalculate, submit. Playwright runs them in CI against a built application, which is the only way to catch a calculation that is right in isolation and wrong in the flow.',
    },
  ],

  lessons: [
    'Requirements from a real client are a moving target, and the process that survives that is not the one with the most detailed plan up front.',
    'Being the person who organises the meetings is not overhead. It is how you learn what the client actually wants, which is information nobody else on the team has.',
    'The most useful line in the brief was why the old system had failed. A replacement that does not understand what went wrong last time is a rewrite waiting to fail the same way.',
    'Partitioning a codebase along team boundaries is a real architectural constraint on a fixed deadline, not a compromise — merge conflicts cost more than a slightly imperfect module split.',
  ],

  screenshots: [],
  links: {},
  dateStarted: '2026-03',
  dateCompleted: '2026-06',

  publicationNote:
    'Delivered to an external project sponsor, so the source code and screenshots are not mine to publish. I am happy to walk through the architecture, my own module and the delivery process in an interview.',
};
