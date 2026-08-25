import type { PortfolioDocument } from '@/types/content';

/**
 * Files on the S-OS drives.
 *
 * `src` is omitted while a document is still being prepared. Explorer then
 * shows the entry as unavailable rather than linking to a 404 — the resume in
 * particular is the last thing that should 404 in front of a recruiter.
 */
export const documents: readonly PortfolioDocument[] = [
  {
    id: 'resume',
    name: 'Resume',
    fileName: 'Resume.pdf',
    kind: 'resume',
    description: 'Curriculum vitae — software engineering internship and graduate roles.',
    src: '/documents/seedorf-obeng-mireku-resume.pdf',
    sizeBytes: 21_382,
    updated: '2026-08',
  },
  {
    // The same words, rendered plainly.
    //
    // Applicant tracking systems read the text layer and mangle anything with
    // columns, banded headers or coloured rules. Rather than compromise the
    // document a person reads, there are two — generated from one source file,
    // so they cannot drift apart and start contradicting each other.
    id: 'resume-ats',
    name: 'Resume (plain text layout)',
    fileName: 'Resume-Plain.pdf',
    kind: 'resume',
    description:
      'The same resume in a single-column layout, for application forms that parse the file automatically.',
    src: '/documents/seedorf-obeng-mireku-resume-ats.pdf',
    sizeBytes: 10_053,
    updated: '2026-08',
  },
  {
    id: 'diploma-ict',
    name: 'Diploma in Information and Communications Technology',
    fileName: 'Diploma-ICT.pdf',
    kind: 'certificate',
    description: 'Western Sydney University International College. Awarded 6 September 2024.',
    src: '/documents/wsu-ict-diploma.pdf',
    sizeBytes: 300_635,
    updated: '2024-09',
  },
  {
    id: 's-os-specification',
    name: 'S-OS Product Specification',
    fileName: 'S-OS-Specification.pdf',
    kind: 'architecture',
    description:
      'Product specification and implementation plan for S-OS: scope, architecture and roadmap.',
    relatedProjectId: 's-os',
    src: '/documents/s-os-specification.pdf',
    sizeBytes: 90_066,
    updated: '2026-08',
  },
];
