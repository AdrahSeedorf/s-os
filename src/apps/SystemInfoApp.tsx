'use client';

import { Badge, GlassPanel } from '@/components/ui';
import { SosMark } from '@/components/brand';
import { site } from '@/lib/config/site';
import { getCapabilities, getSystemInfo } from '@/lib/content/systemInfo';
import { getProjects } from '@/lib/content';
import { PROJECT_STATUS_LABEL, type ProjectStatus } from '@/types/content';
import type { BadgeTone } from '@/components/ui';
import { ProgramIcon } from '@/components/icons';
import { useWindowStore } from '@/stores/windowStore';
import { SHORTCUT_GROUPS } from '@/lib/content/shortcuts';
import { AppScreen, AppSection, PropertyList } from './shared/AppLayout';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  stable: 'stable',
  beta: 'beta',
  'in-development': 'dev',
  planned: 'planned',
};

/**
 * System Information.
 *
 * The joke and the substance are the same thing: every value here is counted
 * from the content registry at render, so the specification of the machine is
 * literally a specification of the portfolio.
 */
export function SystemInfoApp() {
  const specs = getSystemInfo();
  const capabilities = getCapabilities();
  const projects = getProjects();
  const openApp = useWindowStore((state) => state.openApp);

  return (
    <AppScreen>
      <header className="flex items-center gap-4">
        <SosMark size={52} />
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[17px] font-semibold">{site.name}</h2>
          <p className="text-muted text-[12px]">{site.fullName}</p>
        </div>
      </header>

      <AppSection title="System">
        <GlassPanel className="p-4">
          <PropertyList
            items={specs.map((spec) => ({ label: spec.label, value: spec.value }))}
          />
        </GlassPanel>
      </AppSection>

      <AppSection title="Capabilities">
        <div className="flex flex-wrap gap-1.5">
          {capabilities.map((capability) => (
            <Badge key={capability.label} tone="accent">
              {capability.label} · {capability.count}
            </Badge>
          ))}
        </div>
      </AppSection>

      {/* Documented here because F6, Escape and Alt+arrows are otherwise
          invisible. An operating system that claims full keyboard operability
          owes the visitor a list of what the keys actually are. */}
      <AppSection title="Keyboard shortcuts">
        <div className="flex flex-col gap-4">
          {SHORTCUT_GROUPS.map((group) => (
            <GlassPanel key={group.title} className="flex flex-col gap-2 p-4">
              <h4 className="text-muted text-[10px] font-semibold tracking-[0.14em] uppercase">
                {group.title}
              </h4>
              <dl className="flex flex-col gap-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={`${group.title}-${shortcut.keys}`}
                    className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"
                  >
                    <dt className="shrink-0 sm:w-40">
                      <kbd className="bg-inset border-glass-border text-secondary rounded-xs border px-1.5 py-0.5 font-mono text-[11px]">
                        {shortcut.keys}
                      </kbd>
                    </dt>
                    <dd className="text-secondary min-w-0 text-[12.5px]">
                      {shortcut.action}
                      {shortcut.note ? (
                        <span className="text-muted block text-[11.5px] leading-relaxed">
                          {shortcut.note}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </GlassPanel>
          ))}
        </div>
      </AppSection>

      <AppSection title="Installed programs">
        <ul className="flex flex-col gap-1">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => openApp('project', { projectId: project.id })}
                className="hover:bg-glass-strong flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors"
              >
                <ProgramIcon icon={project.icon} size={18} />
                <span className="flex-1 truncate font-mono text-[12px]">
                  {project.executable}
                </span>
                <span className="text-disabled shrink-0 font-mono text-[11px]">
                  v{project.version}
                </span>
                <Badge tone={STATUS_TONE[project.status]}>
                  {PROJECT_STATUS_LABEL[project.status]}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      </AppSection>
    </AppScreen>
  );
}
