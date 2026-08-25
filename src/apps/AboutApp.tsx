'use client';

import { Badge, GlassPanel } from '@/components/ui';
import { Avatar } from '@/components/brand';
import { getEducation, getProfile, getSkillsGroupedByCategory } from '@/lib/content';
import { AVAILABILITY_LABEL } from '@/types/content';
import { AppScreen, AppSection, PropertyList } from './shared/AppLayout';

/**
 * About Seedorf.
 *
 * Styled after a System Properties dialog rather than a conventional About Me
 * page: the profile is presented as the specification of the machine you are
 * using. The framing is playful; every value in it is literally true.
 */
export function AboutApp() {
  const profile = getProfile();
  const education = getEducation();
  const groups = getSkillsGroupedByCategory();

  const primaryLanguages = groups
    .find((group) => group.category === 'languages')
    ?.skills.slice(0, 5)
    .map((skill) => skill.name)
    .join(', ');

  const frameworks = groups
    .find((group) => group.category === 'frontend')
    ?.skills.slice(0, 4)
    .map((skill) => skill.name)
    .join(', ');

  return (
    <AppScreen>
      <header className="flex items-center gap-4">
        <div className="border-accent-400/40 size-16 shrink-0 overflow-hidden rounded-full border">
          <Avatar size={64} />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold">{profile.name}</h2>
          <p className="text-accent-200 text-[13px]">{profile.title}</p>
          <Badge tone="accent" dot>
            {AVAILABILITY_LABEL[profile.availability]}
          </Badge>
        </div>
      </header>

      <AppSection title="User profile">
        <GlassPanel className="p-4">
          <PropertyList
            items={[
              { label: 'User', value: profile.displayName },
              { label: 'Role', value: profile.title },
              { label: 'Location', value: profile.location },
              ...(profile.workRights
                ? [{ label: 'Work rights', value: profile.workRights }]
                : []),
              {
                label: 'Education',
                value: education[0]
                  ? `${education[0].qualification}, ${education[0].institution}`
                  : '—',
              },
              ...(primaryLanguages ? [{ label: 'Languages', value: primaryLanguages }] : []),
              ...(frameworks ? [{ label: 'Frameworks', value: frameworks }] : []),
              { label: 'Status', value: AVAILABILITY_LABEL[profile.availability] },
            ]}
          />
        </GlassPanel>
      </AppSection>

      <AppSection title="Background">
        <div className="flex flex-col gap-3">
          {profile.bio.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className="text-secondary text-[13px] leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </AppSection>

      <AppSection title="Current focus">
        <ul className="flex flex-col gap-1.5">
          {profile.focus.map((item) => (
            <li key={item} className="text-secondary flex items-start gap-2.5 text-[12.5px]">
              <span
                aria-hidden="true"
                className="bg-accent-400 mt-1.5 size-1.5 shrink-0 rounded-full"
              />
              {item}
            </li>
          ))}
        </ul>
      </AppSection>
    </AppScreen>
  );
}
