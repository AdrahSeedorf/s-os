'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Badge, Button, GlassPanel } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { getProjects, getProjectsGroupedByCategory, getSkillsForProject } from '@/lib/content';
import { PROJECT_STATUS_LABEL, type Project, type ProjectStatus } from '@/types/content';
import type { BadgeTone } from '@/components/ui';
import { useWindowStore } from '@/stores/windowStore';
import { AppScreen, ExternalAction } from './shared/AppLayout';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  stable: 'stable',
  beta: 'beta',
  'in-development': 'dev',
  planned: 'planned',
};

type Filter = 'all' | ProjectStatus;

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'stable', label: 'Stable' },
  { id: 'beta', label: 'Beta' },
  { id: 'in-development', label: 'In Development' },
  { id: 'planned', label: 'Planned' },
];

/**
 * The Projects browser.
 *
 * Grouped by category, filterable by status. The status filter exists because
 * the honest presentation of a work-in-progress portfolio needs an answer to
 * "show me only the finished things" — a reviewer who wants that should get it
 * in one click rather than deciding the whole list is unfinished.
 */
export function ProjectsApp() {
  const [filter, setFilter] = useState<Filter>('all');
  const groups = getProjectsGroupedByCategory();
  const total = getProjects().length;

  const filtered = groups
    .map((group) => ({
      ...group,
      projects: group.projects.filter(
        (project) => filter === 'all' || project.status === filter,
      ),
    }))
    .filter((group) => group.projects.length > 0);

  const shown = filtered.reduce((sum, group) => sum + group.projects.length, 0);

  return (
    <AppScreen>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[16px] font-semibold">Installed programs</h2>
          <p className="text-muted text-[11.5px]">
            {shown} of {total} shown
          </p>
        </div>

        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setFilter(entry.id)}
              aria-pressed={filter === entry.id}
              className={cn(
                'rounded-full border px-3 py-1 text-[11.5px] transition-colors',
                filter === entry.id
                  ? 'bg-accent-600/30 border-accent-500/50 text-primary'
                  : 'border-glass-border text-muted hover:bg-glass hover:text-secondary',
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="text-muted py-8 text-center text-[12.5px]">
          Nothing with that status yet.
        </p>
      ) : (
        filtered.map((group) => (
          <section key={group.category} className="flex flex-col gap-2.5">
            <h3 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
              {group.label}
            </h3>
            <ul className="grid gap-2.5 lg:grid-cols-2">
              {group.projects.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </AppScreen>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const openApp = useWindowStore((state) => state.openApp);
  const technologies = getSkillsForProject(project);

  return (
    <GlassPanel className="flex h-full gap-3.5 p-4">
      <ProgramIcon icon={project.icon} size={36} className="mt-0.5 shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-[13px] font-semibold">{project.displayName}</h4>
          <Badge tone={STATUS_TONE[project.status]} dot>
            {PROJECT_STATUS_LABEL[project.status]}
          </Badge>
        </div>

        <p className="text-muted font-mono text-[11px]">
          {project.executable} · v{project.version}
        </p>

        <p className="text-secondary flex-1 text-[12.5px] leading-relaxed">{project.tagline}</p>

        {technologies.length > 0 ? (
          <p className="text-muted text-[11px]">
            {technologies
              .slice(0, 5)
              .map((skill) => skill.name)
              .join(' · ')}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Button
            size="sm"
            onClick={() => openApp('project', { projectId: project.id })}
            iconEnd={<ArrowUpRight size={12} />}
          >
            Open
          </Button>
          <ExternalAction href={project.links.github} label="Source" />
        </div>
      </div>
    </GlassPanel>
  );
}
