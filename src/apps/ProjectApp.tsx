'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lock, MonitorPlay } from 'lucide-react';
import { Badge, Button, GlassPanel, Tabs, type TabDefinition } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import { getProjectById, getSkillsForProject } from '@/lib/content';
import {
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type Project,
  type ProjectStatus,
} from '@/types/content';
import type { BadgeTone } from '@/components/ui';
import { useWindowStore } from '@/stores/windowStore';
import type { AppProps } from '@/os/registry/applications';
import { AppSection, EmptyState, ExternalAction, PropertyList } from './shared/AppLayout';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  stable: 'stable',
  beta: 'beta',
  'in-development': 'dev',
  planned: 'planned',
};

/**
 * A project, presented as an installed program.
 *
 * Tabbed rather than one long scroll, because the audiences differ: a
 * recruiter reads the overview and stops, an engineer goes straight to
 * architecture and challenges. Tabs let both get what they came for without
 * scrolling past the other's content.
 *
 * Sections with no content are not rendered at all — an unfinished project
 * shows Overview and Build Log, and simply has no Architecture tab, rather
 * than an Architecture tab that says "coming soon".
 */
export function ProjectApp({ params }: AppProps) {
  const project = getProjectById(params['projectId'] ?? '');
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          title="That program is not installed."
          detail="It may have been removed, or the link may be out of date."
        />
      </div>
    );
  }

  const tabs: TabDefinition[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab project={project} />,
    },
    {
      id: 'engineering',
      label: 'Engineering',
      available: project.architecture !== undefined || project.challenges.length > 0,
      content: <EngineeringTab project={project} />,
    },
    {
      id: 'screenshots',
      label: 'Screenshots',
      available: project.screenshots.length > 0,
      content: <ScreenshotsTab project={project} />,
    },
    {
      id: 'build-log',
      label: 'Build log',
      available: project.buildLog !== undefined,
      content: <BuildLogTab project={project} />,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <ProjectHeader project={project} />
      <Tabs
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        label={`${project.displayName} sections`}
      />
    </div>
  );
}

function ProjectHeader({ project }: { project: Project }) {
  const openApp = useWindowStore((state) => state.openApp);
  const restricted = project.publicationNote !== undefined;

  return (
    <header className="border-glass-border flex shrink-0 flex-col gap-3 border-b p-5">
      <div className="flex items-start gap-4">
        <ProgramIcon icon={project.icon} size={46} className="mt-0.5 shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] font-semibold">{project.displayName}</h2>
            <Badge tone={STATUS_TONE[project.status]} dot>
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
          </div>

          <p className="text-muted font-mono text-[11.5px]">
            {project.executable} · v{project.version} ·{' '}
            {PROJECT_CATEGORY_LABEL[project.category]}
          </p>

          <p className="text-secondary mt-1 text-[12.5px] leading-relaxed">{project.tagline}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {project.embeddable && project.links.live ? (
          <Button
            variant="primary"
            size="sm"
            iconStart={<MonitorPlay size={13} />}
            onClick={() =>
              openApp('demo-viewer', {
                url: project.links.live ?? '',
                title: project.displayName,
              })
            }
          >
            Launch demo
          </Button>
        ) : null}

        <ExternalAction href={project.links.live} label="Live demo" />
        <ExternalAction href={project.links.github} label="Source code" />
        <ExternalAction href={project.links.docs} label="Documentation" />

        {/* When publication is restricted there are no links to show, so the
            restriction itself is shown in their place. Silently rendering no
            buttons would read as "there is nothing here". */}
        {restricted ? (
          <span className="text-status-dev flex items-center gap-1.5 text-[11.5px]">
            <Lock size={12} aria-hidden="true" />
            Source withheld
          </span>
        ) : null}
      </div>
    </header>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const technologies = getSkillsForProject(project);
  const openApp = useWindowStore((state) => state.openApp);

  return (
    <div className="flex flex-col gap-6 p-5">
      {project.publicationNote ? (
        <p className="text-status-dev border-status-dev/40 bg-status-dev/5 rounded-r-sm border-l-2 py-2 pl-3 text-[12px] leading-relaxed">
          {project.publicationNote}
        </p>
      ) : null}

      <AppSection title="Overview">
        <p className="text-secondary text-[13px] leading-relaxed">{project.overview}</p>
      </AppSection>

      {project.problem ? (
        <AppSection title="The problem">
          <p className="text-secondary text-[13px] leading-relaxed">{project.problem}</p>
        </AppSection>
      ) : null}

      {project.solution ? (
        <AppSection title="The approach">
          <p className="text-secondary text-[13px] leading-relaxed">{project.solution}</p>
        </AppSection>
      ) : null}

      <AppSection title="Details">
        <GlassPanel className="p-4">
          <PropertyList
            items={[
              { label: 'My role', value: project.role },
              ...(project.team
                ? [
                    {
                      label: 'Team',
                      value: `${project.team.size} people — ${project.team.contribution}`,
                    },
                  ]
                : []),
              { label: 'Started', value: formatMonth(project.dateStarted) },
              ...(project.dateCompleted
                ? [{ label: 'Completed', value: formatMonth(project.dateCompleted) }]
                : []),
              { label: 'Status', value: PROJECT_STATUS_LABEL[project.status] },
            ]}
          />
        </GlassPanel>
      </AppSection>

      {technologies.length > 0 ? (
        <AppSection title="Built with">
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((skill) => (
              <button key={skill.id} type="button" onClick={() => openApp('skills')}>
                <Badge tone="accent">{skill.name}</Badge>
              </button>
            ))}
          </div>
        </AppSection>
      ) : null}

      {project.features.length > 0 ? (
        <AppSection title="Features">
          <ul className="flex flex-col gap-1.5">
            {project.features.map((feature) => (
              <li
                key={feature}
                className="text-secondary flex items-start gap-2.5 text-[12.5px]"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent-400 mt-1.5 size-1.5 shrink-0 rounded-full"
                />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </AppSection>
      ) : null}
    </div>
  );
}

function EngineeringTab({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-6 p-5">
      {project.architecture ? (
        <AppSection title="Architecture">
          <p className="text-secondary text-[13px] leading-relaxed">{project.architecture}</p>
        </AppSection>
      ) : null}

      {project.challenges.length > 0 ? (
        <AppSection title="Challenges">
          <ul className="flex flex-col gap-4">
            {project.challenges.map((entry) => (
              <li key={entry.challenge}>
                <GlassPanel className="flex flex-col gap-2.5 p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-status-dev text-[10px] font-semibold tracking-[0.14em] uppercase">
                      Problem
                    </span>
                    <p className="text-secondary text-[12.5px] leading-relaxed">
                      {entry.challenge}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-status-stable text-[10px] font-semibold tracking-[0.14em] uppercase">
                      Solution
                    </span>
                    <p className="text-secondary text-[12.5px] leading-relaxed">
                      {entry.solution}
                    </p>
                  </div>
                </GlassPanel>
              </li>
            ))}
          </ul>
        </AppSection>
      ) : null}

      {project.lessons.length > 0 ? (
        <AppSection title="What I took from it">
          <ul className="flex flex-col gap-1.5">
            {project.lessons.map((lesson) => (
              <li
                key={lesson}
                className="text-secondary flex items-start gap-2.5 text-[12.5px]"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent-400 mt-1.5 size-1.5 shrink-0 rounded-full"
                />
                <span className="leading-relaxed">{lesson}</span>
              </li>
            ))}
          </ul>
        </AppSection>
      ) : null}
    </div>
  );
}

function ScreenshotsTab({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-5 p-5">
      {project.screenshots.map((screenshot) => (
        <figure key={screenshot.src} className="flex flex-col gap-2">
          {/* Explicit dimensions are required by the content model, which is
              what lets next/image reserve the space and avoid the layout shift
              that a gallery would otherwise cause on load. */}
          <Image
            src={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
            className="border-glass-border rounded-md border"
          />
          {screenshot.caption ? (
            <figcaption className="text-muted text-[11.5px]">{screenshot.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

function BuildLogTab({ project }: { project: Project }) {
  const log = project.buildLog;
  if (!log) return null;

  return (
    <div className="flex flex-col gap-6 p-5">
      <p className="text-muted text-[12px]">
        This project is still being built. Last updated {formatMonth(log.updated)}.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <AppSection title="Done">
          {log.done.length === 0 ? (
            <p className="text-disabled text-[12px]">Nothing recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {log.done.map((item) => (
                <li
                  key={item}
                  className="text-secondary flex items-start gap-2.5 text-[12.5px]"
                >
                  <span
                    aria-hidden="true"
                    className="bg-status-stable mt-1.5 size-1.5 shrink-0 rounded-full"
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </AppSection>

        <AppSection title="Next">
          {log.next.length === 0 ? (
            <p className="text-disabled text-[12px]">Nothing planned yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {log.next.map((item) => (
                <li
                  key={item}
                  className="text-secondary flex items-start gap-2.5 text-[12.5px]"
                >
                  <span
                    aria-hidden="true"
                    className="bg-status-dev mt-1.5 size-1.5 shrink-0 rounded-full"
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </AppSection>
      </div>
    </div>
  );
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}
