import { ChevronRight, Download, GitBranch, Terminal as TerminalIcon, X } from 'lucide-react';
import {
  Badge,
  Button,
  GlassPanel,
  IconButton,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { site } from '@/lib/config/site';
import {
  getFeaturedProjects,
  getProjects,
  getSkillsForProject,
  getSkillsGroupedByCategory,
} from '@/lib/content';
import { buildFileSystem, listChildren, toDisplayPath } from '@/lib/content/filesystem';
import { PROJECT_STATUS_LABEL, SKILL_LEVEL_LABEL, type ProjectStatus } from '@/types/content';
import type { BadgeTone } from '@/components/ui';

/**
 * Milestone 1 review page.
 *
 * Renders the design system plus the content layer, so the data model can be
 * inspected before any of the OS is built on top of it. Becomes the desktop
 * shell in Milestone 5.
 */
export default function FoundationPage() {
  const projects = getProjects();
  const featured = getFeaturedProjects();
  const skillGroups = getSkillsGroupedByCategory();
  const fs = buildFileSystem();

  return (
    <main className="from-base via-raised to-base min-h-screen bg-linear-160 p-8 md:p-14">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
            <Badge tone="dev" dot>
              Milestone 1
            </Badge>
          </div>
          <p className="text-secondary">
            {site.fullName} — content model and virtual filesystem, over the Milestone 0 design
            system.
          </p>
        </header>

        <Section
          title="Installed programs"
          note={`${projects.length} registered · ${featured.length} featured`}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => {
              const technologies = getSkillsForProject(project);
              return (
                <GlassPanel key={project.id} className="flex flex-col gap-2.5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-mono text-[13px] font-medium">{project.executable}</p>
                      <p className="text-muted text-[11px]">
                        v{project.version} · {project.displayName}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[project.status]} dot>
                      {PROJECT_STATUS_LABEL[project.status]}
                    </Badge>
                  </div>

                  <p className="text-secondary text-[12px] leading-relaxed">
                    {project.tagline}
                  </p>

                  {technologies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {technologies.slice(0, 6).map((skill) => (
                        <Badge key={skill.id} tone="accent">
                          {skill.name}
                        </Badge>
                      ))}
                      {technologies.length > 6 ? (
                        <Badge>+{technologies.length - 6}</Badge>
                      ) : null}
                    </div>
                  ) : null}

                  {project.publicationNote ? (
                    <p className="text-status-dev border-status-dev/30 border-l-2 pl-2 text-[11px]">
                      {project.publicationNote}
                    </p>
                  ) : null}
                </GlassPanel>
              );
            })}
          </div>
        </Section>

        <Section
          title="Virtual filesystem"
          note="One tree behind Explorer, search and the terminal"
        >
          <GlassPanel tone="inset" className="p-4 font-mono text-[12px]">
            <ul className="flex flex-col gap-2">
              {fs.drives.map((drive) => (
                <li key={drive.id}>
                  <p className="text-accent-200">{drive.name}</p>
                  <ul className="mt-1 flex flex-col gap-0.5 pl-4">
                    {listChildren(fs, drive.path).map((child) => (
                      <li key={child.id} className="text-secondary flex items-center gap-1.5">
                        <ChevronRight size={11} aria-hidden="true" className="text-disabled" />
                        {toDisplayPath(child.path)}
                        {child.kind !== 'file' ? (
                          <span className="text-disabled">
                            ({listChildren(fs, child.path).length})
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Section>

        <Section title="Skills" note="Tiers, not percentages — each backed by projects">
          <div className="grid gap-3 sm:grid-cols-2">
            {skillGroups.map((group) => (
              <GlassPanel key={group.category} className="flex flex-col gap-2 p-4">
                <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {group.skills.map((skill) => (
                    <li key={skill.id} className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px]">{skill.name}</span>
                      <span className="text-muted shrink-0 text-[11px]">
                        {SKILL_LEVEL_LABEL[skill.level]}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            ))}
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

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  stable: 'stable',
  beta: 'beta',
  'in-development': 'dev',
  planned: 'planned',
};

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
          {title}
        </h2>
        {note ? <p className="text-disabled text-[11px]">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
