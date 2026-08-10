# S-OS — Seedorf Operating System

A browser-based desktop operating system that doubles as the software engineering portfolio of **Seedorf Obeng-Mireku**.

Projects appear as installed programs. Skills appear as system capabilities. The resume is a document on disk. Underneath the metaphor sits a real window manager, a virtual filesystem, a command interpreter and a search index — the portfolio is itself the flagship project.

> Full product specification and roadmap: [`docs/S-OS-SPEC.md`](./docs/S-OS-SPEC.md)

---

## Status

**Milestone 0 — Foundation.** Toolchain, design tokens and base UI primitives.
`/` currently renders a design-system review page; it becomes the desktop shell in Milestone 5.

## Stack

| Concern   | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                 |
| Language  | TypeScript, `strict` + `noUncheckedIndexedAccess`  |
| Styling   | Tailwind CSS 4 over CSS custom-property tokens     |
| State     | Zustand (selector subscriptions — see below)       |
| Motion    | Motion (`motion/react`)                            |
| Icons     | Lucide for UI chrome, custom SVG for program icons |
| Testing   | Vitest + Testing Library                           |

## Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run verify     # typecheck + lint + test
npm run test:watch # tests in watch mode
npm run format     # Prettier write
```

## Architecture notes

**One data source feeds every surface.** Adding a project to the registry makes it appear on the desktop, in All Programs, in File Explorer, in search results and as a terminal command, with no further code. If a change requires content to be duplicated, the design is wrong.

**Applications never import data files directly.** Everything resolves through `src/lib/content`, enforced by an ESLint `no-restricted-imports` rule. That single seam is what lets V2 swap flat files for a database without touching a single application.

**Applications are chrome-agnostic.** An app component knows nothing about being inside a window — which is exactly why the same components render full-screen in the mobile shell.

**Zustand, not Context, for window state.** Dragging updates position up to 60 times a second. Context re-renders every consumer on every change, so one drag would re-render every window, the taskbar and the desktop. Zustand's selector subscriptions confine the re-render to the window being dragged.

**Tokens are the theme layer.** Every colour, radius, duration and metric lives in `src/styles/tokens.css`. High-contrast mode and the V1.1 themes are variable overrides on a data attribute, not component rewrites. No component may hardcode a hex value.

**Accessibility is a constraint, not a milestone.** A component that cannot be operated by keyboard is not finished.

## Directory structure

```
src/
├── app/          Next.js routes — desktop shell + server-rendered SEO routes
├── os/           The operating system: boot, shell, window manager, mobile
├── apps/         One folder per application
├── data/         Content. The only place facts live
├── lib/          content accessors, search, terminal, sound, hooks
├── stores/       Zustand stores
├── components/   Shared UI primitives and brand assets
├── styles/       Design tokens
└── types/
tools/installer/  Dev-only Project Installer (Milestone 14)
```

## Assets & licensing

S-OS takes design inspiration from the Windows 7 era but contains **no Microsoft assets** — no sounds, icons, wallpapers or logos. Every visual and audio asset is original or carries a documented licence.

## Environment

Copy `.env.example` to `.env.local`. Server-only secrets must never carry the `NEXT_PUBLIC_` prefix.
