# Content

Everything S-OS knows about Seedorf lives in this folder. Nothing outside it should contain a fact about him.

Applications never import these files. They read through `@/lib/content`, and an ESLint rule enforces it — that boundary is what will let a database replace these files later without touching a single application.

---

## Adding a project

Three steps, about five minutes.

**1. Drop the screenshots in** `public/projects/<project-id>/`.

**2. Copy an existing project file** in `projects/` and edit the values:

```ts
// src/data/projects/my-project.ts
import type { Project } from '@/types/content';

export const myProject: Project = {
  id: 'my-project',
  displayName: 'My Project',
  executable: 'MyProject.exe', // the name shown on the desktop icon
  icon: 'my-project',
  version: '1.0.0',
  status: 'stable', // stable | beta | in-development | planned
  category: 'full-stack',
  featured: true, // appears in Recruiter Mode
  desktopShortcut: true, // appears on the desktop

  tagline: 'One sentence. Used in search, cards and link previews.',
  overview: 'A paragraph.',
  role: 'What you personally built.',

  technologies: ['nextjs', 'typescript'], // must exist in skills.ts
  features: [],
  challenges: [],
  lessons: [],
  screenshots: [],
  links: { github: 'https://github.com/...' },
  embeddable: false,
  dateStarted: '2026-01',
};
```

**3. Register it** in `projects/index.ts`.

Push. Vercel redeploys in under a minute, and the project now appears on the desktop, in All Programs, in File Explorer, in search results and as a terminal command — because all of those read the registry rather than keeping their own list.

---

## What the type system catches for you

Run `npm run verify` before pushing. It will fail if you:

- misspell a technology id that isn't in `skills.ts`
- reuse a project id or executable name
- omit a required field, or misspell a status or category
- leave a screenshot without alt text
- give a `planned` project a desktop shortcut
- leave an unfinished project without a build log
- put a GitHub or demo link on a project marked as publication-restricted

That last group are content rules, not type rules — they live in `lib/content/content.test.ts`. Add to them whenever you find a mistake worth never making twice.

---

## Files

| File           | Contains                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| `profile.ts`   | Identity, bio, availability, contact links, education, experience, certifications |
| `skills.ts`    | The skills registry — also the controlled vocabulary for project technologies     |
| `projects/`    | One file per project, plus the registry index                                     |
| `documents.ts` | Resume, certificates and written documentation                                    |
| `index.ts`     | Assembles the `ContentSnapshot`                                                   |

---

## Conventions

**Absent means absent.** A project with no live demo omits `links.live` rather than setting it to `''`. Applications branch on presence, so a missing link hides its button instead of rendering one that goes nowhere.

**Cross-references are ids.** A project lists technology ids; the Skills application derives which projects demonstrate a skill by reversing that. Neither side keeps a list the other could contradict.

**Skill levels are claims you could defend in an interview.** An inflated "Experienced" collapses under the first technical question. An honest "Learning" next to a shipped project reads as self-aware.

**Restrictions are modelled, not hidden.** If a project can't be published, set `publicationNote`. The application shows the restriction and suppresses the source and demo actions. Don't solve a restriction by quietly deleting the project.

---

## Outstanding placeholders

Search this folder for `PLACEHOLDER` and `PENDING`. Current gaps are tracked in `docs/S-OS-SPEC.md` §1.4:

- Capstone: scope, team, role, and whether it may be published at all
- Date Generator and Hotel System: stack and completeness
- GitHub, LinkedIn, public email
- Skill level confirmation
- Resume, avatar, and all project screenshots
