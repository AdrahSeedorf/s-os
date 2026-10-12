import type { Project } from '@/types/content';

/**
 * Final Level — deliberately unpublished.
 *
 * The engineering is worth showing; the contents are not mine to publish. The
 * application contains photographs of, and private material about, a specific
 * person who did not consent to appearing in a job application. So this entry
 * carries a `publicationNote` and no links, which renders as "Source withheld"
 * rather than as an empty row a reader has to interpret.
 *
 * Renamed in October 2026. This entry was called "Hidden Truths" because the
 * two were one repository; they are now two. Hidden Truths is the V2 platform
 * this app hands off to, in its own repository, and it is not described here —
 * so the name belongs to it rather than to V1.
 *
 * Rewritten at the same time, because the repository had changed underneath
 * the entry: the AI date planner it used to lead with left for V2, and the app
 * is now deployed behind an access gate. The gate is the better story anyway —
 * real security reasoning about a real exposure, rather than defensive parsing
 * of a model response.
 */
export const finalLevel: Project = {
  id: 'final-level',
  displayName: 'Final Level',
  executable: 'FinalLevel.exe',
  icon: 'final-level',
  version: '1.2.0',
  status: 'stable',
  category: 'experiments',
  featured: false,
  desktopShortcut: false,

  tagline:
    'A cinematic narrative web application — puzzle sequence, story reveal and a replayable journey — deployed privately behind a middleware access gate that protects the media as well as the pages.',

  overview:
    'Final Level is a single-page experience that moves through a sequence of distinct screens: a welcome, a journey map, five puzzle challenges, a decryption chamber, a story sequence, and an unlocked second half containing a memory archive. Around 6,000 lines of React and TypeScript across 52 files, with animated transitions between every screen, layered audio, and progress saved across visits. It ends by handing off to a separate application, and it is deployed, because the person it was made for needed to open it on her own device — which is what made the access gate necessary.',

  problem:
    'Deploying it put real photographs, a video and the narrative itself on a public host. Page-level access checks cannot protect any of that: anything under the public directory is served by the static file handler and never runs application code, so a link to a photo is a link anyone can follow.',

  solution:
    'The gate lives in middleware, which runs before the static handler, and its matcher deliberately covers the photo, video and audio directories rather than only the pages. Opening the app once with a key in the query string sets a year-long httpOnly cookie and redirects to a clean URL, so the key never lingers in the address bar or in browser history. Anything without a valid key gets a 404 rather than a login screen — the app is indistinguishable from a domain that is not in use. With the key unset the gate disables itself entirely, so local development has no friction.',

  role: 'Sole designer and developer — concept, interaction design, animation, audio, the access model for the deployed build, and the handoff into the follow-on application.',

  technologies: [
    'typescript',
    'nextjs',
    'react',
    'framer-motion',
    'authentication',
    'tailwind',
    'css',
    'git',
  ],

  features: [
    'A multi-screen state machine with animated cinematic transitions between every step',
    'Five distinct puzzle challenges, each with its own interaction model and independently saved progress',
    'Layered audio — background music, interface sounds and effects — with a persistent mute control',
    'Partitioned save system that separates resettable puzzle progress from state that must never be erased',
    'A replayable journey that survives the tab being closed, and can be exited at any point',
    'Middleware access gate covering static media as well as pages, returning 404 rather than a login prompt',
    'A configuration-driven handoff into a separate follow-on application, which hides itself rather than failing if that application is not configured or not deployed',
    'A preflight script that reports every optional asset and variable as present or absent — and what each absence will actually do on the night — without ever printing a value',
    'A companion home-screen widget that computes its number locally rather than calling the app, so it works offline and needs no hole in the gate',
  ],

  architecture:
    'One shell component owns the screen union and renders exactly one screen inside a shared transition wrapper; every screen is otherwise independent and knows nothing about what comes before or after it. The access gate sits entirely outside the application in middleware, so no page or component has to remember to check anything. Every optional dependency — each audio file, the follow-on application, the gate itself — degrades silently and independently, so no single absence can take the experience down.',

  challenges: [
    {
      challenge:
        'Static files bypass application code. A page-level check would have protected the pages and left every photograph reachable by direct URL.',
      solution:
        'Putting the gate in middleware, and writing the matcher to exclude only the build assets that must stay reachable for the page to render at all. The media directories are deliberately not excluded — they are the entire reason the gate exists.',
    },
    {
      challenge:
        'A login page tells an attacker something worth protecting is behind it, and a key in the URL survives in history and in anything that logs a referrer.',
      solution:
        'An invalid request gets a bare 404, so the deployment looks unused. A valid key is exchanged once for an httpOnly cookie and immediately stripped from the URL by redirect, so it exists in the address bar for a single navigation.',
    },
    {
      challenge:
        'Silent degradation was the right design — the app must never fail because a file is missing — but it meant the app gave no sign that anything was absent, and the one occasion that mattered was not the occasion to find out.',
      solution:
        'A preflight script that runs on every build and lists what is missing alongside the consequence of each absence: no piano and it plays in silence, no handoff and the ending simply is not there, no access key on a deployed host and the photographs are public. It reports secrets as present or absent and never prints a value, because that output ends up in screenshots, and it always exits zero — a reminder, not a gate.',
    },
    {
      challenge:
        'Almost every pattern that makes an application feel cinematic — long transitions, audio, staged reveals, state that persists between visits — is also a pattern that makes it fragile.',
      solution:
        'Screens are a single explicit union rather than a set of booleans, so exactly one is active and an impossible combination cannot be reached. Saving is partitioned: puzzle progress is one key a reset may clear, and the one piece of state that must never be destroyed sits under a separate key no in-app reset touches.',
    },
    {
      challenge:
        'The companion widget wanted its number from the app, which would have meant either an unauthenticated endpoint punched through the gate or an access key sitting in plain text on a phone.',
      solution:
        'Neither, because the number is a date subtraction. Computing it on the device removes the endpoint, the key, the network dependency and the deployment all at once — the widget still works on a plane and will still work when the site is long gone. The cost is that changing the date means editing the file, which was the right trade for something meant to outlive the website.',
    },
  ],

  lessons: [
    'The security boundary has to sit where the request is actually served. Reasoning about what the application does is irrelevant when the thing you are protecting never reaches the application.',
    'Returning 404 instead of 401 costs nothing and removes the signal that there is anything to attack.',
    'Graceful degradation is only half a design. Something has to tell you which graces are currently being degraded, or the failure mode is an experience quietly missing a piece nobody noticed.',
    'Deciding early which piece of state must never be destroyed, and giving it its own storage key, is cheaper than any amount of care taken later.',
  ],

  screenshots: [],
  links: {},
  dateStarted: '2026-06',
  dateCompleted: '2026-10',

  publicationNote:
    'This application contains private personal material, including photographs of someone other than me. It is deployed, but behind an access gate, and the source and a demo are withheld for their privacy rather than because of any licensing restriction. I am happy to talk through the architecture and the access model in an interview.',
};
