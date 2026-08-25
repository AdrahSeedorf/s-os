import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site } from '@/lib/config/site';
import {
  getDemoUrl,
  getProfile,
  getProjectById,
  getProjects,
  getSkillsForProject,
} from '@/lib/content';
import { PROJECT_CATEGORY_LABEL, PROJECT_STATUS_LABEL } from '@/types/content';
import { formatMonth } from '@/lib/utils/dates';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Every project is pre-rendered at build time, so the pages are static files
 * and adding a project to the registry adds a page with no further work.
 */
export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectById(slug);

  if (!project) return { title: 'Project not found' };

  const title = `${project.displayName} — ${getProfile().name}`;

  return {
    title: project.displayName,
    description: project.tagline,
    alternates: { canonical: `${site.url}/projects/${project.id}` },
    openGraph: {
      title,
      description: project.tagline,
      url: `${site.url}/projects/${project.id}`,
      type: 'article',
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectById(slug);

  // A real 404 rather than an empty page, so a stale link returns the right
  // status code instead of a soft 404 that search engines index anyway.
  if (!project) notFound();

  const technologies = getSkillsForProject(project);
  const demoUrl = getDemoUrl(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: project.displayName,
            description: project.tagline,
            author: { '@type': 'Person', name: getProfile().name },
            programmingLanguage: technologies.map((skill) => skill.name),
            ...(project.links.github ? { codeRepository: project.links.github } : {}),
          }),
        }}
      />

      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-muted text-[11.5px]">
            <Link href="/projects" className="hover:text-secondary transition-colors">
              Projects
            </Link>{' '}
            / {PROJECT_CATEGORY_LABEL[project.category]}
          </p>

          <h1 className="text-[26px] leading-tight font-semibold">{project.displayName}</h1>

          <p className="text-muted font-mono text-[12px]">
            {project.executable} · v{project.version} · {PROJECT_STATUS_LABEL[project.status]}
          </p>

          <p className="text-secondary mt-2 text-[14px] leading-relaxed">{project.tagline}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-[13px]">
            {project.links.github ? (
              <a
                href={project.links.github}
                rel="noopener noreferrer"
                className="text-accent-300 hover:underline"
              >
                Source code
              </a>
            ) : null}
            {demoUrl ? (
              <a
                href={demoUrl}
                rel="noopener noreferrer"
                className="text-accent-300 hover:underline"
              >
                Live demo
              </a>
            ) : null}
            <Link href={`/?app=${project.id}`} className="text-accent-300 hover:underline">
              Open in S-OS
            </Link>
          </div>
        </header>

        {project.publicationNote ? (
          <p className="text-status-dev border-status-dev/40 border-l-2 py-2 pl-3 text-[12.5px] leading-relaxed">
            {project.publicationNote}
          </p>
        ) : null}

        {/* A recording is worth having on the shareable URL too — but it is
            labelled, and never dressed up as the running application. */}
        {project.demo?.kind === 'video' ? (
          <figure className="flex flex-col gap-2">
            {/* No <track>: silent screen recording, described by the caption. */}
            <video
              controls
              preload="none"
              width={project.demo.width}
              height={project.demo.height}
              {...(project.demo.poster ? { poster: project.demo.poster } : {})}
              className="border-glass-border h-auto w-full rounded-md border"
            >
              <source src={project.demo.src} />
              Your browser cannot play this recording.
            </video>
            <figcaption className="text-muted text-[12px] leading-relaxed">
              Screen recording —{' '}
              {project.demo.caption ?? 'the application running locally, not a live deployment.'}
            </figcaption>
          </figure>
        ) : null}

        <Section title="Overview">
          <p className="text-secondary text-[13.5px] leading-relaxed">{project.overview}</p>
        </Section>

        {project.problem ? (
          <Section title="The problem">
            <p className="text-secondary text-[13.5px] leading-relaxed">{project.problem}</p>
          </Section>
        ) : null}

        {project.solution ? (
          <Section title="The approach">
            <p className="text-secondary text-[13.5px] leading-relaxed">{project.solution}</p>
          </Section>
        ) : null}

        <Section title="My role">
          <p className="text-secondary text-[13.5px] leading-relaxed">{project.role}</p>
          <p className="text-muted mt-1 text-[12px]">
            Started {formatMonth(project.dateStarted)}
            {project.dateCompleted ? ` · completed ${formatMonth(project.dateCompleted)}` : ''}
          </p>
        </Section>

        {technologies.length > 0 ? (
          <Section title="Built with">
            <p className="text-secondary text-[13px]">
              {technologies.map((skill) => skill.name).join(' · ')}
            </p>
          </Section>
        ) : null}

        {project.features.length > 0 ? (
          <Section title="Features">
            <ul className="text-secondary list-disc pl-5 text-[13px] leading-relaxed">
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.architecture ? (
          <Section title="Architecture">
            <p className="text-secondary text-[13.5px] leading-relaxed">
              {project.architecture}
            </p>
          </Section>
        ) : null}

        {project.challenges.length > 0 ? (
          <Section title="Challenges">
            <ul className="flex flex-col gap-4">
              {project.challenges.map((entry) => (
                <li key={entry.challenge} className="flex flex-col gap-1.5">
                  <p className="text-secondary text-[13px] leading-relaxed">
                    <strong className="text-primary font-medium">Problem. </strong>
                    {entry.challenge}
                  </p>
                  <p className="text-secondary text-[13px] leading-relaxed">
                    <strong className="text-primary font-medium">Solution. </strong>
                    {entry.solution}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.buildLog ? (
          <Section title="Build log">
            <p className="text-muted mb-2 text-[12px]">
              Still being built. Last updated {formatMonth(project.buildLog.updated)}.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-status-stable mb-1.5 text-[12px] font-semibold">Done</h3>
                <ul className="text-secondary list-disc pl-5 text-[12.5px] leading-relaxed">
                  {project.buildLog.done.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-status-dev mb-1.5 text-[12px] font-semibold">Next</h3>
                <ul className="text-secondary list-disc pl-5 text-[12.5px] leading-relaxed">
                  {project.buildLog.next.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        ) : null}
      </article>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
