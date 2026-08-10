/**
 * The S-OS content model.
 *
 * Two rules govern everything in this file:
 *
 *   1. Optional means genuinely absent, never "empty". A project with no live
 *      demo omits `links.live` rather than setting it to ''. Applications then
 *      branch on presence, so a missing GitHub URL hides the button instead of
 *      rendering one that goes nowhere.
 *
 *   2. Cross-references are ids, never duplicated objects. A project lists
 *      technology ids that must resolve against the skills registry; the Skills
 *      application derives its project evidence by reversing that relationship.
 *      Neither side maintains a list the other could contradict.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** An ISO-8601 date, `YYYY-MM` or `YYYY-MM-DD`. Stored as a string because
 *  month precision is often all that is known, and Date would imply a day. */
export type IsoDate = string;

export interface ExternalLink {
  readonly label: string;
  readonly url: string;
}

// ---------------------------------------------------------------------------
// Skills — also the controlled vocabulary for project technologies
// ---------------------------------------------------------------------------

/**
 * Deliberately not percentages.
 *
 * A number invites a comparison it cannot support: "React 85%" means nothing to
 * a reviewer and is trivially inflated. Named tiers force an honest claim, and
 * every claim is backed by the projects that demonstrate it.
 */
export type SkillLevel = 'experienced' | 'proficient' | 'working-knowledge' | 'learning';

export const SKILL_LEVEL_LABEL: Readonly<Record<SkillLevel, string>> = {
  experienced: 'Experienced',
  proficient: 'Proficient',
  'working-knowledge': 'Working Knowledge',
  learning: 'Learning',
};

/** Ordered strongest to weakest, for sorting within a category. */
export const SKILL_LEVEL_ORDER: readonly SkillLevel[] = [
  'experienced',
  'proficient',
  'working-knowledge',
  'learning',
];

export type SkillCategory =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'databases'
  | 'cloud'
  | 'security'
  | 'tools'
  | 'practices';

export const SKILL_CATEGORY_LABEL: Readonly<Record<SkillCategory, string>> = {
  languages: 'Programming Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  databases: 'Databases',
  cloud: 'Cloud',
  security: 'Security',
  tools: 'Tools & Version Control',
  practices: 'Practices',
};

export type SkillId = string;

export interface Skill {
  readonly id: SkillId;
  readonly name: string;
  readonly category: SkillCategory;
  readonly level: SkillLevel;
  /** One line shown in the Skills application. Concrete, not aspirational. */
  readonly note?: string;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

/**
 * Honest lifecycle states. `in-development` and `planned` are first-class
 * rather than something to hide: a portfolio that shows work in progress reads
 * as active, provided the incomplete entries carry a real build log.
 */
export type ProjectStatus = 'stable' | 'beta' | 'in-development' | 'planned';

export const PROJECT_STATUS_LABEL: Readonly<Record<ProjectStatus, string>> = {
  stable: 'Stable',
  beta: 'Beta',
  'in-development': 'In Development',
  planned: 'Planned',
};

export type ProjectCategory =
  'systems' | 'full-stack' | 'university' | 'security' | 'experiments';

export const PROJECT_CATEGORY_LABEL: Readonly<Record<ProjectCategory, string>> = {
  systems: 'Systems & Tooling',
  'full-stack': 'Full-Stack Development',
  university: 'University',
  security: 'Security',
  experiments: 'Experiments',
};

export interface Screenshot {
  readonly src: string;
  /** Describes what the screenshot shows, for readers who cannot see it.
   *  Required — a screenshot gallery is the least accessible part of a
   *  portfolio and the easiest to fix. */
  readonly alt: string;
  readonly caption?: string;
  readonly width: number;
  readonly height: number;
}

export interface ChallengeSolution {
  readonly challenge: string;
  readonly solution: string;
}

/** Progress record for work that is not finished. Shown in place of the
 *  feature list so an incomplete project still says something substantial. */
export interface BuildLog {
  readonly done: readonly string[];
  readonly next: readonly string[];
  readonly updated: IsoDate;
}

export interface ProjectLinks {
  readonly github?: string;
  readonly live?: string;
  readonly docs?: string;
  readonly caseStudy?: string;
}

export interface TeamContext {
  readonly size: number;
  /** What Seedorf personally built. The first thing a reviewer looks for on a
   *  group project, and the thing most portfolios leave ambiguous. */
  readonly contribution: string;
}

export type ProjectId = string;

export interface Project {
  readonly id: ProjectId;
  /** Human name, e.g. "Hotel Management System". */
  readonly displayName: string;
  /** OS-flavoured name shown on desktop icons, e.g. "HotelManager.exe". */
  readonly executable: string;
  /** Key into the program icon registry (Milestone 2). */
  readonly icon: string;
  readonly version: string;
  readonly status: ProjectStatus;
  readonly category: ProjectCategory;

  /** Appears in Recruiter Mode and gets a desktop shortcut. Keep to 3–5. */
  readonly featured: boolean;
  readonly desktopShortcut: boolean;

  /** One sentence. Used in search results, cards and link previews. */
  readonly tagline: string;
  readonly overview: string;
  readonly problem?: string;
  readonly solution?: string;
  /** Always populated, including for solo work — reviewers ask. */
  readonly role: string;
  readonly team?: TeamContext;

  /** Skill ids. Every entry must resolve against the skills registry; a test
   *  enforces this, so a typo fails the build rather than silently dropping a
   *  technology from the Skills application. */
  readonly technologies: readonly SkillId[];
  readonly features: readonly string[];
  readonly architecture?: string;
  readonly challenges: readonly ChallengeSolution[];
  readonly lessons: readonly string[];
  readonly buildLog?: BuildLog;

  readonly screenshots: readonly Screenshot[];
  readonly video?: string;
  readonly links: ProjectLinks;

  /**
   * May the deployed demo be shown inside an S-OS window?
   *
   * False by default. Most deployed apps send X-Frame-Options or a restrictive
   * frame-ancestors policy, and anything with a login breaks in a third-party
   * frame. Set true only after confirming the target actually renders embedded.
   */
  readonly embeddable: boolean;

  readonly dateStarted: IsoDate;
  readonly dateCompleted?: IsoDate;

  /**
   * Set when publication is restricted — university IP, an industry partner
   * agreement, an NDA. Applications show the note and suppress source and demo
   * actions. Modelling this explicitly keeps a restriction from being solved by
   * quietly deleting the project.
   */
  readonly publicationNote?: string;
}

// ---------------------------------------------------------------------------
// Profile, experience, education
// ---------------------------------------------------------------------------

export type AvailabilityStatus =
  'seeking-internship' | 'seeking-graduate' | 'open' | 'unavailable';

export const AVAILABILITY_LABEL: Readonly<Record<AvailabilityStatus, string>> = {
  'seeking-internship': 'Seeking Internship',
  'seeking-graduate': 'Seeking Graduate Role',
  open: 'Open to Opportunities',
  unavailable: 'Not Currently Available',
};

export interface Profile {
  readonly name: string;
  readonly displayName: string;
  readonly title: string;
  readonly location: string;
  readonly availability: AvailabilityStatus;
  readonly workRights?: string;
  /** Two or three sentences. The first paragraph a recruiter reads. */
  readonly summary: string;
  /** Longer narrative for the About application. */
  readonly bio: readonly string[];
  /** Three to five short statements of what he is aiming at. */
  readonly focus: readonly string[];
  readonly email?: string;
  readonly github?: string;
  readonly linkedin?: string;
  readonly website?: string;
  readonly avatar?: Screenshot;
}

export interface Experience {
  readonly id: string;
  readonly organisation: string;
  readonly role: string;
  readonly location?: string;
  readonly startDate: IsoDate;
  /** Absent means current. */
  readonly endDate?: IsoDate;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly technologies: readonly SkillId[];
}

export interface Education {
  readonly id: string;
  readonly institution: string;
  readonly qualification: string;
  readonly location?: string;
  readonly startDate: IsoDate;
  readonly endDate?: IsoDate;
  readonly expected: boolean;
  readonly highlights: readonly string[];
}

export type CertificationStatus = 'completed' | 'in-progress' | 'planned';

export interface Certification {
  readonly id: string;
  readonly name: string;
  readonly issuer: string;
  readonly status: CertificationStatus;
  readonly issued?: IsoDate;
  readonly expires?: IsoDate;
  readonly credentialUrl?: string;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export type DocumentKind = 'resume' | 'certificate' | 'case-study' | 'report' | 'architecture';

export interface PortfolioDocument {
  readonly id: string;
  readonly name: string;
  /** Rendered as a filename in Explorer, e.g. "Resume.pdf". */
  readonly fileName: string;
  readonly kind: DocumentKind;
  readonly description?: string;
  /** Absent while the document is still being prepared; Explorer then shows
   *  it as unavailable rather than serving a 404. */
  readonly src?: string;
  readonly sizeBytes?: number;
  readonly updated?: IsoDate;
  readonly relatedProjectId?: ProjectId;
}

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------

/**
 * Everything the OS knows, in one immutable object.
 *
 * In V1 this is assembled from static files at module load. In V2 the server
 * builds the same shape from a database and hands it to the client shell.
 * Because every accessor reads a snapshot rather than importing data directly,
 * that swap touches one file.
 */
export interface ContentSnapshot {
  readonly profile: Profile;
  readonly skills: readonly Skill[];
  readonly projects: readonly Project[];
  readonly experience: readonly Experience[];
  readonly education: readonly Education[];
  readonly certifications: readonly Certification[];
  readonly documents: readonly PortfolioDocument[];
}
