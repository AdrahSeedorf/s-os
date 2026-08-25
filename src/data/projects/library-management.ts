import type { Project } from '@/types/content';

/**
 * The Library Management System.
 *
 * The one project here that is mostly other people's code — or rather, a
 * first-year version of Seedorf's own, treated as legacy. It is the only entry
 * that evidences the part of the job that is repair rather than construction,
 * which is why it earns a featured slot despite being the smallest.
 */
export const libraryManagement: Project = {
  id: 'library-management',
  displayName: 'Library Management System',
  executable: 'LibraryManager.jar',
  icon: 'library',
  version: '1.0.0',
  status: 'stable',
  category: 'university',
  featured: true,
  desktopShortcut: true,

  tagline:
    'A first-year Java assignment treated as legacy code: eleven defects, each reproduced by running the program before it was fixed, each pinned by a regression test.',

  overview:
    'A console application managing a book catalogue, a patron register, loans and a reservation queue, persisted to CSV. The application itself is modest. What the repository documents is the repair: every defect was found by compiling and running the program rather than by reading it, each one has a test that fails against the original commit, and the history carries one commit per fix explaining the failure it caused rather than the line it changed. Against the original commit 8 of 36 shell cases passed; against the current code all 41 JUnit tests pass.',

  problem:
    'Inherited code that appears to work is the normal condition of professional software, and reading it is not how you find out what is wrong with it. This program ran, printed a menu and accepted input — and silently destroyed six books and five patrons every time someone started it and chose Exit.',

  solution:
    'Reproduce first, then fix. Every defect was demonstrated with a concrete before-and-after before a line changed, which is what makes each fix verifiable by someone who was not there. The rules were then consolidated: four methods on the model classes existed but were never called because the manager re-implemented all of them inline, so every loan rule existed twice and the copies had drifted. That drift was the direct cause of one of the defects.',

  role: 'Sole developer — original assignment, then the full defect audit, repair, test suite, Maven conversion and CI.',

  technologies: [
    'java',
    'maven',
    'junit',
    'legacy-code',
    'testing',
    'ci-cd',
    'git',
    'github',
  ],

  features: [
    'Book catalogue, patron register, loans with due and return dates, and a reservation queue',
    'Quote-aware CSV reading and writing, so a comma in a title no longer corrupts the file',
    'Input handling that survives non-numeric text and end of input, making the program scriptable',
    'Loan rules enforced in one place rather than duplicated between the model and the manager',
    '41 JUnit tests — a console suite that drives the menus as a person would and checks both output and files, plus a model suite',
    'GitHub Actions running the suite on JDK 17 and 21, and running the packaged jar against a copy of the data to check it round-trips',
  ],

  challenges: [
    {
      challenge:
        'The program read the patron file under a name that differed only in case from the file on disk. It worked on the machine it was written on and failed completely anywhere else.',
      solution:
        'Fixed the name, and added a test that runs against the real filenames. macOS being case-insensitive by default is precisely the kind of environmental difference that a test on one developer machine will never catch, and CI on Linux now does.',
    },
    {
      challenge:
        'The return path never checked who held a book, and the loan file was written but never read — so it could not have checked. A patron who had borrowed nothing could return someone else’s book and finish on minus one books borrowed, written straight back to the patron file.',
      solution:
        'Loans are now read back and ownership is verified before a return is accepted. The negative count had been guarded against in an unused model method all along; the manager’s inline copy had simply drifted away from it, which is the concrete argument for not duplicating a rule.',
    },
    {
      challenge:
        'A defect list is easy to write and hard to trust. A reader has no reason to believe eleven bugs existed rather than eleven refactors being described dramatically.',
      solution:
        'Each defect carries its reproduction — the exception and line number, or the before-and-after record counts — and each has a test that fails when checked out against the original commit. The claim is falsifiable, which is the only kind worth making in a portfolio.',
    },
  ],

  lessons: [
    'Running the program found every defect. Reading it had found none of them, twice.',
    'A rule implemented in two places is not duplicated code, it is two rules that will eventually disagree — and the disagreement is what reaches the user.',
    'One commit per fix, named for the failure rather than the change, turns a git history into documentation that a reviewer can actually follow.',
  ],

  screenshots: [],
  links: {
    github: 'https://github.com/AdrahSeedorf/library-management',
  },
  // Dates are taken from the repository history rather than from memory. For
  // the projects that began as coursework the real start is earlier, but an
  // approximate date nobody can check is worth less than a precise one that
  // anyone can.
  dateStarted: '2026-08',
  dateCompleted: '2026-08',
};
