"""
The resume, as data.

Written once and rendered twice — an S-OS-branded PDF for the portfolio and a
plain single-column PDF for applicant tracking systems. Two files that say
different things is the classic way a resume starts contradicting itself, so
neither renderer is allowed its own copy of the words.

Every claim here is traceable to a repository. Nothing is described as
complete, because nothing here needs to be: past-tense built-work with real
figures reads as finished, and stays true whatever milestone each project is
on when a reviewer opens it.
"""

NAME = "Seedorf Obeng-Mireku"
TITLE = "Software Engineer"
LOCATION = "Sydney, NSW, Australia"

CONTACT = [
    ("Email", "seedorfobengmireku7@gmail.com", "mailto:seedorfobengmireku7@gmail.com"),
    ("GitHub", "github.com/AdrahSeedorf", "https://github.com/AdrahSeedorf"),
    (
        "LinkedIn",
        "linkedin.com/in/seedorf-obeng-mireku",
        "https://www.linkedin.com/in/seedorf-obeng-mireku-b55379286",
    ),
]

SUMMARY = (
    "Computer Science student at Western Sydney University who builds interactive software with "
    "real state and real edge cases — a browser-based desktop environment, an event-sourced farm "
    "platform, and a C++ routing engine with a discrete-event simulator. Comfortable designing a "
    "data model first, enforcing architectural rules with tests, and working in code I did not "
    "write. Seeking software engineering internship and graduate roles."
)

EDUCATION = [
    {
        "institution": "Western Sydney University",
        "qualification": "Bachelor of Science (Computer Science)",
        "location": "Parramatta, NSW",
        "dates": "Expected January 2027",
        "points": [
            "Coursework: Data Structures and Algorithms, Object-Oriented Programming, "
            "Database Design and Development, Computer Networks, Systems Analysis and Design, "
            "Statistics.",
            "Concentration: Systems Programming.",
        ],
    },
    {
        "institution": "Western Sydney University International College",
        "qualification": "Diploma in Information and Communications Technology",
        "location": "Sydney, NSW",
        "dates": "2023 – 2024",
        "points": [],
    },
]

# Ordered by how much they demonstrate, not by recency. A reviewer who reads
# only the first entry should still have seen the strongest evidence.
PROJECTS = [
    {
        "name": "S-OS — Portfolio as an Operating System",
        "stack": "TypeScript · Next.js · React · Zustand · Tailwind · Vitest",
        "link": "github.com/AdrahSeedorf/s-os",
        "url": "https://github.com/AdrahSeedorf/s-os",
        "points": [
            "Built a browser-based desktop environment where projects are installed programs: "
            "a window manager with independent lifecycle, focus and z-ordering, drag and resize, "
            "and full keyboard operation including moving and resizing without a mouse.",
            "Wrote the window geometry, stack ordering, command interpreter and content "
            "validation as pure logic with no React or DOM dependency, making each unit-testable "
            "in isolation. 357 tests across the system.",
            "Held window state in a selector-subscribed store and applied drag as a transform, "
            "committing to state only on release — a drag re-renders one window rather than every "
            "consumer at 60fps.",
            "Derived a virtual filesystem, a search index, the Start menu and terminal navigation "
            "from one typed content registry, so adding a project surfaces it everywhere without "
            "new code. An ESLint rule enforces the boundary that will let a database replace the "
            "flat files.",
            "Server-rendered every project and a recruiter view as indexable routes with "
            "structured data and generated preview images, so a JavaScript shell is still "
            "shareable and crawlable.",
        ],
    },
    {
        "name": "ADRAH Farms — Poultry Production Platform",
        "stack": "TypeScript · Next.js · Prisma · PostgreSQL · Auth.js · Zod",
        "link": "github.com/AdrahSeedorf/farm",
        "url": "https://github.com/AdrahSeedorf/farm",
        "points": [
            "Designed a 30-model schema for a commercial layer farm in which flock population and "
            "stock are derived from an append-only event ledger rather than stored, so every "
            "figure is reproducible and a correction is a new event carrying a reason code and an "
            "author instead of an edit to history.",
            "Built role-based access control around a single server-side gate that throws rather "
            "than returning false, so a missed conditional cannot leak access, and applied site "
            "scoping inside queries rather than filtering results afterwards.",
            "Implemented credential authentication with Argon2id hashing, database-backed sign-in "
            "throttling, and immediate revocation despite JWT sessions by re-reading the user on "
            "every request.",
            "Represented money as integer minor units with apportioning that guarantees split "
            "amounts sum exactly to the original, and units of measure that throw on a "
            "cross-dimension conversion.",
            "Kept the domain core free of species nouns — organisation, site, production unit, "
            "animal group — so supporting a second species is configuration rather than a "
            "migration. 135 tests enforce the architectural rules.",
        ],
    },
    {
        "name": "EV Network Toolkit — Routing and Siting Engine",
        "stack": "C++17 · CMake · Catch2 · Python · GitHub Actions",
        "link": "github.com/AdrahSeedorf/ev-charging",
        "url": "https://github.com/AdrahSeedorf/ev-charging",
        "points": [
            "Merged two university projects with incompatible models into one engine that routes "
            "agents across a network where they compete for limited capacity at nodes, trading "
            "money against time.",
            "Implemented five comparable planners, including an optimal search over composite "
            "(node, charge) state, alongside four greedy strategies, and a discrete-event "
            "simulator with per-station queues and measured rather than estimated waiting time.",
            "Replacing the inherited static congestion model with the event-driven one showed it "
            "had overstated waits by up to 1,500x; both engines remain selectable so the "
            "correction is reproducible.",
            "Built an ingestion pipeline producing networks from OpenStreetMap and OSRM, with a "
            "geometric validator that rejects edges shorter than the great-circle distance "
            "between their own endpoints — which caught two impossible inherited distances and a "
            "charger power rating being read as a capacity count.",
            "74 tests running in CI on GCC and Clang across Linux and macOS, Debug and Release, "
            "with warnings treated as errors.",
        ],
    },
    {
        "name": "Library Management System — Legacy Code Repair",
        "stack": "Java 17 · Maven · JUnit 5 · GitHub Actions",
        "link": "github.com/AdrahSeedorf/library-management",
        "url": "https://github.com/AdrahSeedorf/library-management",
        "points": [
            "Took a working-looking console application and found eleven defects by compiling and "
            "running it rather than reading it, reproducing each with concrete evidence before "
            "changing a line.",
            "Fixed silent data loss that destroyed records on every run, a filename case mismatch "
            "that worked only on macOS, a list mutated while being indexed, and a return path "
            "that never checked who held the book and could drive a borrow count negative.",
            "Pinned every defect with a regression test — 8 of 36 cases passed against the "
            "original commit, 41 of 41 pass now — and wrote one commit per fix named for the "
            "failure it caused rather than the line it changed.",
            "Consolidated loan rules that had been implemented twice and drifted apart, which was "
            "the direct cause of one defect, and added CI running the suite on JDK 17 and 21.",
        ],
    },
    {
        "name": "Nine-Board Tic-Tac-Toe — Game Search Agents",
        "stack": "C++17 · CMake",
        "link": "github.com/AdrahSeedorf/NBTicTacToe",
        "url": "https://github.com/AdrahSeedorf/NBTicTacToe",
        "points": [
            "Implemented negamax with alpha-beta pruning, iterative deepening under a wall-clock "
            "budget, and a one-million-entry Zobrist transposition table with mate-score "
            "adjustment, reaching 1.15M nodes/sec; and a Monte Carlo tree search agent using UCT.",
            "Separated rules, agents and rendering so the game state performs no I/O, which is "
            "what makes the position searchable; adding an agent is one class and one line.",
            "62 checks including apply/undo round-trips over 300 random games, clean under "
            "AddressSanitizer and UndefinedBehaviorSanitizer, with a test asserting the "
            "transposition table changes a fixed-depth search's speed but never its result.",
        ],
    },
]

SKILLS = [
    ("Languages", "TypeScript, JavaScript, Java, C++, Python, SQL, HTML, CSS"),
    ("Frontend", "React, Next.js, Tailwind CSS, state management, accessibility (WCAG), Framer Motion"),
    ("Backend", "Node.js, REST APIs, Prisma, PostgreSQL, MySQL, authentication and authorisation"),
    ("Testing & Tooling", "Vitest, JUnit, Catch2, Git, GitHub Actions, CMake, Maven, Vercel"),
    (
        "Practices",
        "Software architecture, event sourcing, algorithms and search, working with legacy code, "
        "secure defaults",
    ),
]

ADDITIONAL = [
    ("Honours", "Third place, Regional Coding Competition — Ashanti Region, Ghana (2022)"),
    ("Languages", "English, French, Akan"),
    ("Interests", "Reading, soccer, music, cooking"),
]

PORTFOLIO_NOTE = (
    "Full case studies, architecture notes and build logs for every project above are at the "
    "portfolio link."
)
