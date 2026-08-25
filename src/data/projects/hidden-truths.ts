import type { Project } from '@/types/content';

/**
 * Hidden Truths — deliberately unpublished.
 *
 * The engineering is worth showing; the contents are not mine to publish. The
 * application contains photographs of, and private material about, a specific
 * person who did not consent to appearing in a job application. So this entry
 * carries a `publicationNote` and no links, which renders as "Source withheld"
 * rather than as an empty row a reader has to interpret.
 *
 * The content-integrity test enforces the rest: a project with a publication
 * note may not carry a repository link or a demo of any kind.
 */
export const hiddenTruths: Project = {
  id: 'hidden-truths',
  displayName: 'Hidden Truths',
  executable: 'HiddenTruths.exe',
  icon: 'hidden-truths',
  version: '1.1.0',
  status: 'in-development',
  category: 'experiments',
  featured: false,
  desktopShortcut: false,

  tagline:
    'A cinematic narrative web application — puzzle sequence, story reveal, and an AI date planner — built to feel like a premium narrative game rather than a website.',

  overview:
    'Hidden Truths is a single-page experience that moves through fourteen distinct screens: a welcome, a journey map, five puzzle challenges, a decryption chamber, a story sequence, and then an unlocked second half containing a memory archive and a date planner. Roughly seven thousand lines of React and TypeScript, with animated transitions between every screen, layered background music and sound effects, and progress saved across visits. The date planner calls a language model and turns the response into two structured, comparable options.',

  problem:
    'Almost every interaction pattern that makes an application feel cinematic — long transitions, audio, staged reveals, state that persists between visits — is also a pattern that makes it fragile. A transition that runs while state is changing underneath it produces a screen that is briefly wrong, and a save system that writes everything writes the things that should never be overwritten.',

  solution:
    'Screens are a single explicit union rather than a set of booleans, so exactly one is active and an impossible combination cannot be reached. Saving is deliberately partitioned: puzzle progress is one key that a reset is allowed to clear, and the one piece of state that must never be destroyed is held under a separate key that no in-app reset touches. That separation is the most important line of code in the project and it is three lines long.',

  role: 'Sole designer and developer — concept, interaction design, animation, audio, and the language-model integration.',

  technologies: [
    'typescript',
    'nextjs',
    'react',
    'framer-motion',
    'tailwind',
    'llm-integration',
    'css',
    'git',
  ],

  features: [
    'Fourteen-screen state machine with animated cinematic transitions between every step',
    'Five distinct puzzle challenges, each with its own interaction model and independent saved progress',
    'Layered audio — background music, interface sounds and effects — with a persistent mute control',
    'Partitioned save system that separates resettable puzzle progress from state that must never be erased',
    'AI date planner producing two structured, decisive options from mood, budget, setting, time, location and a free-text note',
    'Server-side API route so the model key is never exposed to the browser',
  ],

  architecture:
    'One shell component owns the screen union and renders exactly one screen inside a shared transition wrapper; every screen is otherwise independent and knows nothing about what comes before or after it. The language-model call lives in a server route rather than the client, both to keep the key out of the bundle and to keep the prompt and the parsing in one testable place.',

  challenges: [
    {
      challenge:
        'The model was asked for raw JSON and repeatedly returned it wrapped in a markdown code fence anyway, which broke parsing intermittently rather than consistently — the worst failure mode to diagnose.',
      solution:
        'The route stops trusting the instruction and defends against the observed behaviour: it strips any fencing, slices from the first brace to the last, and validates the shape before returning. A response that still does not parse produces a clear message and a 502, not a crash and not a blank screen.',
    },
    {
      challenge:
        'A generator that offers "you could do X, or maybe Y" is useless — the whole point was to remove the decision, and a suggestion containing its own branch just moves the decision somewhere else.',
      solution:
        'The system prompt forbids branching inside an option and states the rule explicitly: if the word "or" is tempting, that is a second option, not a clause. Two complete, genuinely different plans are returned instead, so the choice is between two decided things rather than between four half-decided ones.',
    },
    {
      challenge:
        'Language models invent plausible business names, and a date plan that sends someone to a restaurant that does not exist fails in the most embarrassing possible way.',
      solution:
        'The prompt separates two kinds of specificity: stable geography — rivers, parks, lookouts, neighbourhoods — may be named confidently, while a business may only be named if it is well established, and otherwise the plan describes the type of place and the area to look in. Addresses are never generated.',
    },
  ],

  lessons: [
    'Prompt engineering is interface design with a much less reliable component underneath. The rules that improved the output most were the ones that removed the model’s freedom to hedge.',
    'Deciding early which piece of state must never be destroyed, and giving it its own storage key, is cheaper than any amount of care taken later.',
    'An explicit union of screens made a fourteen-state application easier to reason about than a five-state one built from booleans.',
  ],

  buildLog: {
    done: [
      'Full narrative sequence — welcome, journey map, five challenges, decryption, story reveal, ending',
      'Save and restore across visits, with protected state held separately',
      'Layered audio system with a persistent control',
      'AI date planner, hardened against fenced and malformed model responses',
      'Post-story second half — memory archive and journey home',
    ],
    next: [
      'Extract the date planner into a standalone, publishable project with no private content',
      'Broaden the archive into the full memory model described in the vision document',
    ],
    updated: '2026-08-12',
  },

  screenshots: [],
  links: {},
  dateStarted: '2026-06',

  publicationNote:
    'This application contains private personal material, including photographs of someone other than me. The source and a demo are withheld for their privacy, not because of any licensing restriction. I am happy to talk through the architecture and the language-model integration in an interview.',
};
