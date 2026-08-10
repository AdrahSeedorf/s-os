// Lucide v1 no longer ships brand marks (GitHub, LinkedIn) for trademark
// reasons, so those become custom SVGs in the Milestone 2 icon set.
import { Download, GitBranch, Terminal as TerminalIcon, X } from 'lucide-react';
import {
  Badge,
  Button,
  GlassPanel,
  IconButton,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { site } from '@/lib/config/site';

/**
 * Milestone 0 placeholder.
 *
 * This route becomes the desktop shell in Milestone 5. Until then it renders
 * the design system so the tokens, glass surfaces and control states can be
 * reviewed against real chrome rather than in the abstract.
 */
export default function FoundationPage() {
  return (
    <main className="from-base via-raised to-base min-h-screen bg-linear-160 p-8 md:p-14">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
            <Badge tone="dev" dot>
              Milestone 0
            </Badge>
          </div>
          <p className="text-secondary">
            {site.fullName} — foundation build. Design tokens, surfaces and base controls.
          </p>
        </header>

        <Section title="Surfaces">
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassPanel className="p-4">
              <p className="text-[13px] font-medium">Glass</p>
              <p className="text-muted mt-1 text-[12px]">Window bodies, cards</p>
            </GlassPanel>
            <GlassPanel tone="strong" className="p-4">
              <p className="text-[13px] font-medium">Glass strong</p>
              <p className="text-muted mt-1 text-[12px]">Menus, tray flyouts</p>
            </GlassPanel>
            <GlassPanel tone="inset" className="p-4">
              <p className="font-mono text-[13px] font-medium">Inset</p>
              <p className="text-muted mt-1 text-[12px]">Terminal, inputs</p>
            </GlassPanel>
          </div>
        </Section>

        <Section title="Controls">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" iconStart={<Download size={14} />}>
              Download Resume
            </Button>
            <Button variant="secondary" iconStart={<GitBranch size={14} />}>
              Source Code
            </Button>
            <Button variant="ghost" iconStart={<TerminalIcon size={14} />}>
              Open Terminal
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <IconButton label="Close window" variant="danger" size="sm">
              <X size={14} />
            </IconButton>
          </div>
        </Section>

        <Section title="Status">
          <div className="flex flex-wrap gap-2">
            <Badge tone="stable" dot>
              Stable
            </Badge>
            <Badge tone="beta" dot>
              Beta
            </Badge>
            <Badge tone="dev" dot>
              In Development
            </Badge>
            <Badge tone="planned" dot>
              Planned
            </Badge>
            <Badge tone="accent">TypeScript</Badge>
            <Badge>Next.js</Badge>
          </div>
        </Section>

        <Section title="Forms">
          <GlassPanel className="flex max-w-md flex-col gap-4 p-5">
            <TextField label="Name" placeholder="Jane Recruiter" required />
            <TextField
              label="Email"
              type="email"
              placeholder="jane@company.com"
              error="Enter a valid email address."
              required
            />
            <TextAreaField
              label="Message"
              rows={3}
              placeholder="A short note…"
              hint="Delivered straight to my inbox."
            />
          </GlassPanel>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
