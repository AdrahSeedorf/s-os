import type { Certification, Education, Experience, Profile } from '@/types/content';

/**
 * PLACEHOLDER CONTENT
 *
 * The facts here are drawn from Seedorf's interview answers; the prose is
 * drafted and needs his review. Fields left absent are genuinely unknown —
 * `email`, `github` and `linkedin` are omitted rather than stubbed, so the UI
 * hides those actions instead of rendering links that go nowhere.
 */
export const profile: Profile = {
  name: 'Seedorf Obeng-Mireku',
  displayName: 'Seedorf',
  title: 'Software Engineer',
  location: 'Sydney, NSW, Australia',
  availability: 'seeking-internship',
  workRights: 'Open to remote, relocation and visa-sponsored roles.',

  summary:
    'Computer Science student at Western Sydney University building interactive software, with a particular interest in how applications are secured and governed. Currently seeking software engineering internships and graduate roles.',

  bio: [
    'I am a Ghanaian software developer based in Sydney, finishing a Bachelor of Computer Science at Western Sydney University.',
    'What I enjoy most is interactive software — interfaces with real state, real behaviour and real edge cases, rather than pages that only display information. S-OS, the operating system you are currently using, is the clearest example: a window manager, a virtual filesystem and a command interpreter, built to hold the rest of my work.',
    'Alongside building software I am drawn to securing it, and to the legal and compliance questions that sit around it — privacy, licensing and the rules that decide what a system is allowed to do with data.',
  ],

  focus: [
    'Interactive frontend engineering with genuine state complexity',
    'Full-stack web applications',
    'Application security and secure defaults',
    'The governance and compliance side of software',
  ],

  // PENDING: contact and profile links. See docs/S-OS-SPEC.md §1.4.
};

/**
 * PLACEHOLDER — no industry experience yet.
 *
 * Deliberately left empty rather than padded with coursework dressed up as
 * employment. The Experience application renders an honest empty state and
 * points at Projects, which is the stronger evidence for a student anyway.
 */
export const experience: readonly Experience[] = [];

export const education: readonly Education[] = [
  {
    id: 'wsu-bsc',
    institution: 'Western Sydney University',
    qualification: 'Bachelor of Science (Computer Science)',
    location: 'Sydney, NSW',
    startDate: '2024-02',
    endDate: '2027-01',
    expected: true,
    highlights: [
      'PLACEHOLDER — confirm start date, majors and any notable units.',
      'Capstone project: a management system for students in professional experience placements.',
    ],
  },
  {
    id: 'wsu-college-diploma',
    institution: 'Western Sydney University International College',
    qualification: 'Diploma in Information and Communications Technology',
    location: 'Sydney, NSW',
    startDate: '2023-02',
    endDate: '2024-01',
    expected: false,
    highlights: ['PLACEHOLDER — confirm dates and outcomes.'],
  },
];

export const certifications: readonly Certification[] = [
  // PENDING: confirm certifications beyond the ICT diploma.
];
