import type { Certification, Education, Experience, Profile } from '@/types/content';

/**
 * The profile.
 *
 * The rule this file follows is the one the whole content model follows:
 * a field is either true or absent. Nothing is stubbed to keep a component
 * happy, because a component that renders an empty string looks broken while
 * one that renders nothing looks finished.
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

  email: 'seedorfobengmireku7@gmail.com',
  github: 'https://github.com/AdrahSeedorf',
  linkedin: 'https://www.linkedin.com/in/seedorf-obeng-mireku-b55379286',

  avatar: {
    src: '/brand/avatar.jpg',
    alt: 'Seedorf Obeng-Mireku',
    width: 400,
    height: 400,
  },
};

/**
 * Empty, on purpose.
 *
 * There is no industry experience yet, and padding this with coursework
 * dressed up as employment is the single most common way a student CV loses
 * credibility. The Experience application renders an honest empty state and
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
      'Coursework includes Data Structures and Algorithms, Object-Oriented Programming, Database Design and Development, Computer Networks, and Systems Analysis and Design.',
      'Concentration: Systems Programming.',
      'Capstone project: a management system for students in professional experience placements.',
    ],
  },
  {
    id: 'wsu-college-diploma',
    institution: 'Western Sydney University International College',
    qualification: 'Diploma in Information and Communications Technology',
    location: 'Sydney, NSW',
    startDate: '2023-02',
    // The date on the certificate, not an estimate. The entry previously said
    // January, which predated the award by eight months.
    endDate: '2024-09',
    expected: false,
    // No highlights recorded. An empty list renders nothing; inventing a
    // bullet to fill the space would be worse than the space.
    highlights: [],
  },
];

/**
 * Empty until there is something real to put here.
 *
 * The ICT diploma is education, not a certification, and lives above. This
 * array exists so that a certification can be added without a schema change,
 * not so that one can be implied.
 */
export const certifications: readonly Certification[] = [];
