import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/config/site';
import { getProfile, getProjectsGroupedByCategory, getSkillsForProject } from '@/lib/content';
import { PROJECT_STATUS_LABEL } from '@/types/content';

export const metadata: Metadata = {
  title: 'Projects',
  description: `Software projects by ${getProfile().name} — ${getProfile().title} in ${getProfile().location}.`,
  alternates: { canonical: `${site.url}/projects` },
};

/** The project index, readable without JavaScript. */
export default function ProjectsIndexPage() {
  const groups = getProjectsGroupedByCategory();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold">Projects</h1>
        <p className="text-secondary text-[13.5px] leading-relaxed">
          Each of these is installed as a program inside S-OS. Status is stated honestly — some
          are finished, some are still being built.
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-3">
          <h2 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
            {group.label}
          </h2>

          <ul className="flex flex-col gap-5">
            {group.projects.map((project) => (
              <li key={project.id} className="flex flex-col gap-1.5">
                <h3 className="text-[15px] font-semibold">
                  <Link
                    href={`/projects/${project.id}`}
                    className="hover:text-accent-200 transition-colors"
                  >
                    {project.displayName}
                  </Link>
                </h3>
                <p className="text-muted font-mono text-[11px]">
                  {project.executable} · v{project.version} ·{' '}
                  {PROJECT_STATUS_LABEL[project.status]}
                </p>
                <p className="text-secondary text-[13px] leading-relaxed">{project.tagline}</p>
                {project.technologies.length > 0 ? (
                  <p className="text-muted text-[11.5px]">
                    {getSkillsForProject(project)
                      .map((skill) => skill.name)
                      .join(' · ')}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
