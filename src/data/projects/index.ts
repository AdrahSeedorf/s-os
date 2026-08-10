import type { Project } from '@/types/content';
import { sOs } from './s-os';
import { capstone } from './capstone';
import { dateGenerator } from './date-generator';
import { hotelManager } from './hotel-manager';
import { farmManager } from './farm-manager';

/**
 * The installed-programs registry.
 *
 * Adding a project is: create the file, add it here. It then appears on the
 * desktop, in All Programs, in File Explorer, in search and as a terminal
 * command, because every one of those surfaces reads this list rather than
 * keeping its own.
 *
 * Order is authored, not alphabetical — it is the order a reviewer should
 * meet the work in.
 */
export const projects: readonly Project[] = [
  sOs,
  capstone,
  dateGenerator,
  hotelManager,
  farmManager,
];
