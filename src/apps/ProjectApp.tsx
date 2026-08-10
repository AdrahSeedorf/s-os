import { Badge } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import { getProjectById, getSkillsForProject } from '@/lib/content';
import {
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type ProjectStatus,
} from '@/types/content';
import type { BadgeTone } from '@/components/ui';
import type { AppProps } from '@/os/registry/applications';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  stable: 'stable',
  beta: 'beta',
  'in-development': 'dev',
  planned: 'planned',
};

/**
 * A project, presented as an installed program.
 *
 * The full application — screenshots, architecture, challenges, demo viewer —
 * is Milestone 8. This is the shape of it, enough to prove that a project
 * window is driven entirely by the content registry and knows nothing about
 * the window it lives in.
 */
export function ProjectApp({ params }: AppProps) {
  const project = getProjectById(params['projectId'] ?? '');

  if (!project) {
    return (
      <div className="text-muted flex h-full items-center justify-center p-8 text-[13px]">
        That program is not installed.
      </div>
    );
  }

  const technologies = getSkillsForProject(project);

  return (
    <article className="flex h-full flex-col gap-5 overflow-auto p-6">
      <header className="flex items-start gap-4">
        <ProgramIcon icon={project.icon} size={52} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">{project.displayName}</h2>
          <p className="text-muted font-mono text-[11.5px]">
            {project.executable} · v{project.version} ·{' '}
            {PROJECT_CATEGORY_LABEL[project.category]}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge tone={STATUS_TONE[project.status]} dot>
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
          </div>
        </div>
      </header>

      <p className="text-secondary text-[13px] leading-relaxed">{project.overview}</p>

      {project.publicationNote ? (
        <p className="text-status-dev border-status-dev/40 border-l-2 pl-3 text-[12px] leading-relaxed">
          {project.publicationNote}
        </p>
      ) : null}

      <Field label="My role">{project.role}</Field>

      {technologies.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
            Technologies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((skill) => (
              <Badge key={skill.id} tone="accent">
                {skill.name}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {project.buildLog ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
            Build log
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <LogColumn title="Done" items={project.buildLog.done} tone="text-status-stable" />
            <LogColumn title="Next" items={project.buildLog.next} tone="text-status-dev" />
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </h3>
      <p className="text-secondary text-[12.5px] leading-relaxed">{children}</p>
    </section>
  );
}

function LogColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className={`text-[11px] font-semibold ${tone}`}>{title}</p>
      {items.length === 0 ? (
        <p className="text-disabled text-[12px]">Nothing recorded yet.</p>
      ) : (
        <ul className="text-secondary flex list-disc flex-col gap-1 pl-4 text-[12px]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
