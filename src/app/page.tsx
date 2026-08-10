import { Download, GitBranch, Terminal as TerminalIcon, X } from 'lucide-react';
import {
  Badge,
  Button,
  GlassPanel,
  IconButton,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { SosMark, SosWordmark, Wallpaper } from '@/components/brand';
import { ProgramIcon, iconRegistry } from '@/components/icons';
import { BootManager } from '@/os/boot/BootManager';
import { SessionBar } from '@/os/boot/SessionBar';
import { getFeaturedProjects, getProjects, getSkillsForProject } from '@/lib/content';
import { buildFileSystem, listChildren, toDisplayPath } from '@/lib/content/filesystem';
import { PROJECT_STATUS_LABEL, type ProjectStatus } from '@/types/content';
import type { BadgeTone } from '@/components/ui';

/**
 * Milestone 3 review page.
 *
 * Wrapped in the BootManager, so reaching this content now requires powering
 * on and entering through one of the three routes. The body below becomes the
 * real desktop in Milestone 5.
 */
export default function FoundationPage() {
  return (
    <BootManager>
      <DesktopPlaceholder />
    </BootManager>
  );
}

function DesktopPlaceholder() {
  const projects = getProjects();
  const featured = getFeaturedProjects();
  const fs = buildFileSystem();
  const iconKeys = Object.keys(iconRegistry);

  return (
    <div className="relative min-h-screen">
      <Wallpaper />

      <main className="relative p-8 md:p-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <header className="flex flex-col gap-4">
            <SosWordmark size="lg" showFullName />
            <div className="flex items-center gap-3">
              <Badge tone="dev" dot>
                Milestone 3
              </Badge>
              <p className="text-secondary text-[13px]">
                Boot sequence, login and session lifecycle.
              </p>
            </div>
            <SessionBar />
          </header>

          <Section title="The mark" note="One mark, every size">
            <GlassPanel className="flex flex-wrap items-end gap-8 p-6">
              {[96, 56, 40, 32, 24, 16].map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div className="flex h-24 items-end">
                    <SosMark size={size} />
                  </div>
                  <span className="text-disabled font-mono text-[10px]">{size}px</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 items-end">
                  <SosMark size={56} glyphOnly />
                </div>
                <span className="text-disabled font-mono text-[10px]">glyph</span>
              </div>
            </GlassPanel>
          </Section>

          <Section title="Program icons" note={`${iconKeys.length} glyphs`}>
            <GlassPanel className="grid grid-cols-4 gap-4 p-6 sm:grid-cols-6 md:grid-cols-8">
              {iconKeys.map((key) => (
                <div key={key} className="flex flex-col items-center gap-1.5 text-center">
                  <ProgramIcon icon={key} size={36} />
                  <span className="text-disabled font-mono text-[9px] break-all">{key}</span>
                </div>
              ))}
            </GlassPanel>
          </Section>

          <Section
            title="Installed programs"
            note={`${projects.length} registered · ${featured.length} featured`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((project) => {
                const technologies = getSkillsForProject(project);
                return (
                  <GlassPanel key={project.id} className="flex gap-3.5 p-4">
                    <ProgramIcon icon={project.icon} size={40} className="mt-0.5" />
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-mono text-[13px] font-medium">
                            {project.executable}
                          </p>
                          <p className="text-muted text-[11px]">v{project.version}</p>
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
                          {technologies.slice(0, 5).map((skill) => (
                            <Badge key={skill.id} tone="accent">
                              {skill.name}
                            </Badge>
                          ))}
                          {technologies.length > 5 ? (
                            <Badge>+{technologies.length - 5}</Badge>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          </Section>

          <Section
            title="Virtual filesystem"
            note="One tree behind Explorer, search and terminal"
          >
            <GlassPanel tone="inset" className="p-4 font-mono text-[12px]">
              <ul className="flex flex-col gap-2.5">
                {fs.drives.map((drive) => (
                  <li key={drive.id}>
                    <p className="text-accent-200 flex items-center gap-2">
                      <ProgramIcon icon={drive.icon} size={16} />
                      {drive.name}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1 pl-6">
                      {listChildren(fs, drive.path).map((child) => (
                        <li key={child.id} className="text-secondary flex items-center gap-2">
                          <ProgramIcon icon={child.icon} size={14} />
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

          <Section title="Controls">
            <GlassPanel className="flex flex-wrap items-center gap-3 p-5">
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
            </GlassPanel>
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
    </div>
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
