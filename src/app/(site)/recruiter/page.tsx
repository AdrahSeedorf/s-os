import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/config/site';
import {
  getEducation,
  getExperience,
  getFeaturedProjects,
  getProfile,
  getSkillsForProject,
  getSkillsGroupedByCategory,
} from '@/lib/content';
import { AVAILABILITY_LABEL, PROJECT_STATUS_LABEL } from '@/types/content';
import { formatMonth } from '@/lib/utils/dates';

/**
 * The professional overview, as a plain web page.
 *
 * This is the URL to paste into a job application: it renders on the server,
 * needs no JavaScript to read, and produces a proper preview when shared. The
 * Recruiter Mode window inside S-OS shows the same content — one source, two
 * presentations.
 */
export const metadata: Metadata = {
  title: 'Professional Overview',
  description: getProfile().summary,
  alternates: { canonical: `${site.url}/recruiter` },
  openGraph: {
    title: `${getProfile().name} — ${getProfile().title}`,
    description: getProfile().summary,
    url: `${site.url}/recruiter`,
  },
};

export default function RecruiterPage() {
  const profile = getProfile();
  const featured = getFeaturedProjects();
  const education = getEducation();
  const experience = getExperience();

  const headlineSkills = getSkillsGroupedByCategory()
    .flatMap((group) => group.skills)
    .filter((skill) => skill.level === 'experienced' || skill.level === 'proficient');

  return (
    <>
      {/*
        Structured data, so a search engine can read this as a person rather
        than as a wall of text. Generated from the same content registry, so it
        cannot disagree with what the page says.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            jobTitle: profile.title,
            description: profile.summary,
            address: { '@type': 'PostalAddress', addressLocality: profile.location },
            url: site.url,
            ...(profile.email ? { email: profile.email } : {}),
            ...((profile.github ?? profile.linkedin)
              ? { sameAs: [profile.github, profile.linkedin].filter(Boolean) }
              : {}),
            alumniOf: education.map((entry) => ({
              '@type': 'EducationalOrganization',
              name: entry.institution,
            })),
            knowsAbout: headlineSkills.map((skill) => skill.name),
          }),
        }}
      />

      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-tight font-semibold">{profile.name}</h1>
          <p className="text-accent-200 text-[16px]">{profile.title}</p>
          <p className="text-muted text-[13px]">
            {profile.location} · {AVAILABILITY_LABEL[profile.availability]}
          </p>
          <p className="text-secondary mt-2 text-[14px] leading-relaxed">{profile.summary}</p>
          {profile.workRights ? (
            <p className="text-muted text-[12.5px]">{profile.workRights}</p>
          ) : null}
        </header>

        <Section title="Technical skills">
          <p className="text-secondary text-[13px] leading-relaxed">
            {headlineSkills.map((skill) => skill.name).join(' · ')}
          </p>
        </Section>

        <Section title="Featured projects">
          <ul className="flex flex-col gap-5">
            {featured.map((project) => (
              <li key={project.id} className="flex flex-col gap-1.5">
                <h3 className="text-[15px] font-semibold">
                  <Link
                    href={`/projects/${project.id}`}
                    className="hover:text-accent-200 transition-colors"
                  >
                    {project.displayName}
                  </Link>
                </h3>
                <p className="text-muted text-[11.5px]">
                  {PROJECT_STATUS_LABEL[project.status]} ·{' '}
                  {getSkillsForProject(project)
                    .slice(0, 6)
                    .map((skill) => skill.name)
                    .join(', ')}
                </p>
                <p className="text-secondary text-[13px] leading-relaxed">{project.tagline}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Experience">
          {experience.length === 0 ? (
            <p className="text-secondary text-[13px] leading-relaxed">
              No industry experience yet — currently studying. The projects above are the work
              to judge.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {experience.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-1">
                  <h3 className="text-[14px] font-medium">
                    {entry.role} — {entry.organisation}
                  </h3>
                  <p className="text-muted text-[11.5px]">
                    {formatMonth(entry.startDate)} –{' '}
                    {entry.endDate ? formatMonth(entry.endDate) : 'Present'}
                  </p>
                  <p className="text-secondary text-[13px] leading-relaxed">{entry.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Education">
          <ul className="flex flex-col gap-4">
            {education.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5">
                <h3 className="text-[14px] font-medium">{entry.qualification}</h3>
                <p className="text-secondary text-[13px]">{entry.institution}</p>
                <p className="text-muted text-[11.5px]">
                  {formatMonth(entry.startDate)} –{' '}
                  {entry.endDate ? formatMonth(entry.endDate) : 'Present'}
                  {entry.expected ? ' (expected)' : ''}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Contact">
          <ul className="flex flex-col gap-1.5 text-[13px]">
            {profile.email ? (
              <li>
                <a href={`mailto:${profile.email}`} className="text-accent-300 hover:underline">
                  {profile.email}
                </a>
              </li>
            ) : null}
            {profile.github ? (
              <li>
                <a
                  href={profile.github}
                  rel="noopener noreferrer me"
                  className="text-accent-300 hover:underline"
                >
                  GitHub
                </a>
              </li>
            ) : null}
            {profile.linkedin ? (
              <li>
                <a
                  href={profile.linkedin}
                  rel="noopener noreferrer me"
                  className="text-accent-300 hover:underline"
                >
                  LinkedIn
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/?app=contact" className="text-accent-300 hover:underline">
                Send a message
              </Link>
            </li>
          </ul>
        </Section>
      </article>
    </>
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
