import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RecruiterApp } from './RecruiterApp';
import { AboutApp } from './AboutApp';
import { SkillsApp } from './SkillsApp';
import { ResumeApp } from './ResumeApp';
import { SystemInfoApp } from './SystemInfoApp';
import { getFeaturedProjects, getProfile, getProjects, getSkills } from '@/lib/content';
import { getCapabilities, getSystemInfo } from '@/lib/content/systemInfo';

/**
 * These assert the promises S-OS makes about its own content, not markup
 * details. The governing requirement from the brief is that a recruiter can
 * answer a short list of questions within twenty seconds — so the test checks
 * that the answers are actually on the screen.
 */
describe('Recruiter Mode', () => {
  it('answers who, what and where without any interaction', () => {
    const profile = getProfile();
    render(<RecruiterApp />);

    expect(screen.getByText(profile.name)).toBeInTheDocument();
    expect(screen.getByText(profile.title)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(profile.location, 'i')).length).toBeGreaterThan(0);
  });

  it('states availability up front', () => {
    render(<RecruiterApp />);
    expect(screen.getByText(/seeking internship/i)).toBeInTheDocument();
  });

  it('shows the professional summary', () => {
    render(<RecruiterApp />);
    expect(screen.getByText(getProfile().summary)).toBeInTheDocument();
  });

  it('lists the featured projects', () => {
    render(<RecruiterApp />);

    for (const project of getFeaturedProjects()) {
      expect(screen.getByText(project.displayName)).toBeInTheDocument();
    }
  });

  it('never features planned work', () => {
    render(<RecruiterApp />);
    const planned = getProjects().filter((project) => project.status === 'planned');

    for (const project of planned) {
      expect(screen.queryByText(project.displayName)).not.toBeInTheDocument();
    }
  });

  it('offers a route to the resume and to contact', () => {
    render(<RecruiterApp />);

    expect(screen.getByRole('button', { name: /view resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^contact$/i })).toBeInTheDocument();
  });

  it('says so plainly when there is no industry experience', () => {
    // Better than an absent section: a missing heading reads as evasive the
    // moment a reader notices it, whereas a stated gap reads as honest.
    render(<RecruiterApp />);
    expect(screen.getByText(/no industry experience yet/i)).toBeInTheDocument();
  });

  it('shows education', () => {
    render(<RecruiterApp />);

    // Appears twice by design — once in the at-a-glance strip and once in the
    // Education section — so this asserts presence, not uniqueness.
    expect(screen.getAllByText(/Western Sydney University/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bachelor of Science/)).toBeInTheDocument();
  });
});

describe('About', () => {
  it('presents the profile as system properties', () => {
    render(<AboutApp />);

    expect(screen.getByRole('heading', { name: getProfile().name })).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders every biography paragraph', () => {
    render(<AboutApp />);

    for (const paragraph of getProfile().bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });
});

describe('Skills', () => {
  it('lists every registered technology', () => {
    render(<SkillsApp />);

    for (const skill of getSkills()) {
      expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0);
    }
  });

  it('uses named levels rather than percentages', () => {
    render(<SkillsApp />);

    expect(
      screen.getAllByText(/proficient|experienced|working knowledge|learning/i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
  });
});

describe('Resume', () => {
  it('states that the resume is unavailable rather than serving a broken file', () => {
    render(<ResumeApp />);
    expect(screen.getByText(/being finalised/i)).toBeInTheDocument();
  });

  it('offers a working alternative when the file is missing', () => {
    render(<ResumeApp />);

    expect(
      screen.getByRole('button', { name: /request the current version/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recruiter mode/i })).toBeInTheDocument();
  });
});

describe('System Information', () => {
  it('counts programs from the registry rather than hardcoding a number', () => {
    const installed = getSystemInfo().find((spec) => spec.label === 'Programs installed');
    expect(installed?.value).toBe(String(getProjects().length));
  });

  it('reports in-development work alongside shipped work', () => {
    const status = getSystemInfo().find((spec) => spec.label === 'Program status');
    expect(status?.value).toMatch(/in development/);
  });

  it('derives capability counts that add up to the skill registry', () => {
    const total = getCapabilities().reduce((sum, capability) => sum + capability.count, 0);
    expect(total).toBe(getSkills().length);
  });

  it('lists every installed program', () => {
    render(<SystemInfoApp />);
    const list = screen.getByText('Installed programs').closest('section');
    expect(list).not.toBeNull();

    if (list) {
      for (const project of getProjects()) {
        expect(within(list).getByText(project.executable)).toBeInTheDocument();
      }
    }
  });
});
