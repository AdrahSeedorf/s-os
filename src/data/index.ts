import type { ContentSnapshot } from '@/types/content';
import { certifications, education, experience, profile } from './profile';
import { skills } from './skills';
import { projects } from './projects';
import { documents } from './documents';

/**
 * The V1 content snapshot, assembled from static files at module load.
 *
 * In V2 the server will build this same shape from a database and hand it to
 * the client shell. Because every application reads through `@/lib/content`
 * rather than importing these files, that change lands here and nowhere else.
 */
export const snapshot: ContentSnapshot = {
  profile,
  skills,
  projects,
  experience,
  education,
  certifications,
  documents,
};
