'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge, GlassPanel } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { getProjectsUsingSkill, getSkillsGroupedByCategory } from '@/lib/content';
import { SKILL_LEVEL_LABEL, type Skill, type SkillLevel } from '@/types/content';
import { useWindowStore } from '@/stores/windowStore';
import { AppScreen } from './shared/AppLayout';

const LEVEL_TONE: Record<SkillLevel, string> = {
  experienced: 'text-status-stable',
  proficient: 'text-accent-300',
  'working-knowledge': 'text-status-beta',
  learning: 'text-status-dev',
};

/**
 * Skills, presented as a Device Manager tree.
 *
 * Two deliberate choices carried over from the content model:
 *
 * No percentages. "React 85%" means nothing to a reviewer and is trivially
 * inflated; named levels force a claim someone could actually test.
 *
 * Evidence, not assertion. Expanding a skill lists the projects that used it,
 * derived by reversing the project→technology relationship rather than stored
 * separately — so the claim and the proof cannot drift apart.
 */
export function SkillsApp() {
  const groups = getSkillsGroupedByCategory();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppScreen>
      <header className="flex flex-col gap-1.5">
        <h2 className="text-[16px] font-semibold">Installed technologies</h2>
        <p className="text-muted text-[12px]">
          Levels are claims, not scores. Expand a technology to see the work behind it.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <section key={group.category} className="flex flex-col gap-1.5">
            <h3 className="text-muted text-[11px] font-semibold tracking-[0.14em] uppercase">
              {group.label}
            </h3>

            <GlassPanel className="divide-glass-border divide-y overflow-hidden">
              {group.skills.map((skill) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  expanded={expanded === skill.id}
                  onToggle={() =>
                    setExpanded((current) => (current === skill.id ? null : skill.id))
                  }
                />
              ))}
            </GlassPanel>
          </section>
        ))}
      </div>

      <footer className="text-disabled flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {(Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[]).map((level) => (
          <span key={level} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('text-[13px] leading-none', LEVEL_TONE[level])}
            >
              ●
            </span>
            {SKILL_LEVEL_LABEL[level]}
          </span>
        ))}
      </footer>
    </AppScreen>
  );
}

function SkillRow({
  skill,
  expanded,
  onToggle,
}: {
  skill: Skill;
  expanded: boolean;
  onToggle: () => void;
}) {
  const projects = getProjectsUsingSkill(skill.id);
  const openApp = useWindowStore((state) => state.openApp);
  const hasDetail = projects.length > 0 || skill.note !== undefined;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasDetail}
        aria-expanded={hasDetail ? expanded : undefined}
        className={cn(
          'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors',
          hasDetail ? 'hover:bg-glass-strong' : 'cursor-default',
        )}
      >
        {hasDetail ? (
          <ChevronRight
            size={13}
            aria-hidden="true"
            className={cn(
              'text-muted shrink-0 transition-transform duration-(--sos-duration-fast)',
              expanded && 'rotate-90',
            )}
          />
        ) : (
          <span aria-hidden="true" className="w-[13px] shrink-0" />
        )}

        <span className="flex-1 text-[12.5px]">{skill.name}</span>

        <span className={cn('shrink-0 text-[11px]', LEVEL_TONE[skill.level])}>
          {SKILL_LEVEL_LABEL[skill.level]}
        </span>

        {projects.length > 0 ? (
          <Badge>{projects.length === 1 ? '1 project' : `${projects.length} projects`}</Badge>
        ) : null}
      </button>

      {expanded && hasDetail ? (
        <div className="flex flex-col gap-2.5 px-3.5 pb-3.5 pl-9">
          {skill.note ? (
            <p className="text-secondary text-[12px] leading-relaxed">{skill.note}</p>
          ) : null}

          {projects.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => openApp('project', { projectId: project.id })}
                    className="sos-glass hover:bg-glass-strong flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition-colors"
                  >
                    <ProgramIcon icon={project.icon} size={14} />
                    {project.displayName}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-disabled text-[11.5px]">No published project uses this yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
