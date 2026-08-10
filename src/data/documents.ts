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
    // PENDING: resume is being refined. See docs/S-OS-SPEC.md §1.4.
  },
  {
    id: 'diploma-ict',
    name: 'Diploma in Information and Communications Technology',
    fileName: 'Diploma-ICT.pdf',
    kind: 'certificate',
    description: 'Western Sydney University International College.',
    // PENDING: scanned certificate.
  },
  {
    id: 's-os-specification',
    name: 'S-OS Product Specification',
    fileName: 'S-OS-Specification.pdf',
    kind: 'architecture',
    description:
      'Product specification and implementation plan for S-OS: scope, architecture and roadmap.',
    relatedProjectId: 's-os',
    // PENDING: published copy of docs/S-OS-SPEC.md.
  },
];
