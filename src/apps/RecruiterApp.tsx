'use client';

import { Download, Mail, ArrowUpRight } from 'lucide-react';
import { Badge, Button, GlassPanel } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import {
  getDemoUrl,
  getEducation,
  getExperience,
  getFeaturedProjects,
  getProfile,
  getResume,
  getSkillsForProject,
  getSkillsGroupedByCategory,
  isDocumentAvailable,
} from '@/lib/content';
import { AVAILABILITY_LABEL, PROJECT_STATUS_LABEL, type ProjectStatus } from '@/types/content';
import type { BadgeTone } from '@/components/ui';
import { useWindowStore } from '@/stores/windowStore';
import { AppScreen, AppSection, EmptyState, ExternalAction, Stat } from './shared/AppLayout';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  stable: 'stable',
  beta: 'beta',
  'in-development': 'dev',
  planned: 'planned',
};

/**
 * Recruiter Mode — the professional fast track.
 *
 * The single most important screen in S-OS, and the one place where the
 * operating-system metaphor gets out of the way entirely. Everything a hiring
 * decision needs is here in reading order: who, what, proof, background, and
 * how to make contact. No exploration required, nothing hidden behind a
 * double-click.
 *
 * The design target is that someone can answer "should I keep reading?" in
 * under twenty seconds, which is why the header is a scannable strip of facts
 * rather than a paragraph.
 */
export function RecruiterApp() {
  const profile = getProfile();
  const featured = getFeaturedProjects();
  const education = getEducation();
  const experience = getExperience();
  const resume = getResume();
  const openApp = useWindowStore((state) => state.openApp);

  // The strongest claims only. A recruiter skimming does not read four
  // categories of tooling; they want to know the top of the stack.
  const headlineSkills = getSkillsGroupedByCategory()
    .flatMap((group) => group.skills)
    .filter((skill) => skill.level === 'experienced' || skill.level === 'proficient')
    .slice(0, 10);

  return (
    <AppScreen>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[22px] leading-tight font-semibold">{profile.name}</h2>
            <p className="text-accent-200 text-[14px]">{profile.title}</p>
          </div>
          <Badge tone="accent" dot>
            {AVAILABILITY_LABEL[profile.availability]}
          </Badge>
        </div>

        <p className="text-secondary max-w-2xl text-[13.5px] leading-relaxed">
          {profile.summary}
        </p>

        <GlassPanel className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          <Stat label="Location" value={profile.location} />
          <Stat
            label="Education"
            value={education[0] ? education[0].institution : 'See below'}
          />
          <Stat
            label="Graduating"
            value={education[0]?.endDate ? formatMonth(education[0].endDate) : '—'}
          />
          <Stat label="Projects" value={`${featured.length} featured`} />
        </GlassPanel>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            iconStart={<Download size={14} />}
            onClick={() => openApp('resume')}
            disabled={resume === undefined}
          >
            View Resume
          </Button>
          <ExternalAction href={profile.github} label="GitHub" />
          <ExternalAction href={profile.linkedin} label="LinkedIn" />
          <Button
            variant="secondary"
            iconStart={<Mail size={14} />}
            onClick={() => openApp('contact')}
          >
            Contact
          </Button>
        </div>

        {/* Stated rather than quietly omitted. A recruiter who cannot find a
            GitHub link assumes there is nothing to see; one who is told it is
            coming knows to ask. */}
        {!profile.github && !profile.linkedin ? (
          <p className="text-muted text-[11.5px]">
            Profile links are being added — use Contact in the meantime.
          </p>
        ) : null}
      </header>

      <AppSection title="Technical skills">
        <div className="flex flex-wrap gap-1.5">
          {headlineSkills.map((skill) => (
            <Badge key={skill.id} tone="accent">
              {skill.name}
            </Badge>
          ))}
        </div>
        <button
          type="button"
          onClick={() => openApp('skills')}
          className="text-accent-300 hover:text-accent-200 mt-1 self-start text-[12px] underline underline-offset-2"
        >
          See all skills and the projects behind them
        </button>
      </AppSection>

      <AppSection
        title="Featured projects"
        action={
          <button
            type="button"
            onClick={() => openApp('projects')}
            className="text-accent-300 hover:text-accent-200 text-[11.5px] underline underline-offset-2"
          >
            All projects
          </button>
        }
      >
        {featured.length === 0 ? (
          <EmptyState title="No featured projects yet." />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {featured.map((project) => {
              const technologies = getSkillsForProject(project);

              return (
                <li key={project.id}>
                  <GlassPanel className="flex gap-3.5 p-4">
                    <ProgramIcon icon={project.icon} size={38} className="mt-0.5 shrink-0" />

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[13.5px] font-semibold">{project.displayName}</h4>
                        <Badge tone={STATUS_TONE[project.status]} dot>
                          {PROJECT_STATUS_LABEL[project.status]}
                        </Badge>
                      </div>

                      <p className="text-secondary text-[12.5px] leading-relaxed">
                        {project.tagline}
                      </p>

                      {technologies.length > 0 ? (
                        <p className="text-muted text-[11.5px]">
                          {technologies
                            .slice(0, 6)
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
                        <ExternalAction href={getDemoUrl(project)} label="Live demo" />
                      </div>
                    </div>
                  </GlassPanel>
                </li>
              );
            })}
          </ul>
        )}
      </AppSection>

      <AppSection title="Experience">
        {experience.length === 0 ? (
          <EmptyState
            title="No industry experience yet."
            detail="Currently studying. The projects above are the work to judge."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {experience.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1">
                <p className="text-[13px] font-medium">
                  {entry.role} — {entry.organisation}
                </p>
                <p className="text-muted text-[11.5px]">
                  {formatMonth(entry.startDate)} –{' '}
                  {entry.endDate ? formatMonth(entry.endDate) : 'Present'}
                </p>
                <p className="text-secondary text-[12.5px] leading-relaxed">{entry.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </AppSection>

      <AppSection title="Education">
        <ul className="flex flex-col gap-3">
          {education.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5">
              <p className="text-[13px] font-medium">{entry.qualification}</p>
              <p className="text-secondary text-[12.5px]">{entry.institution}</p>
              <p className="text-muted text-[11.5px]">
                {formatMonth(entry.startDate)} –{' '}
                {entry.endDate ? formatMonth(entry.endDate) : 'Present'}
                {entry.expected ? ' (expected)' : ''}
              </p>
            </li>
          ))}
        </ul>
      </AppSection>

      <AppSection title="Resume">
        {resume && isDocumentAvailable(resume) ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => openApp('resume')}>
              View in S-OS
            </Button>
            <ExternalAction href={resume.src} label="Download PDF" />
          </div>
        ) : (
          <EmptyState
            title="The resume is being finalised."
            detail="Use Contact and I will send the current version directly."
          />
        )}
      </AppSection>
    </AppScreen>
  );
}

/** "2027-01" → "January 2027". Month precision, because that is all the
 *  content model claims to know. */
function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
