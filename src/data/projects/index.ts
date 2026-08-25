import type { Project } from '@/types/content';
import { sOs } from './s-os';
import { adrahFarms } from './adrah-farms';
import { evNetworkToolkit } from './ev-network-toolkit';
import { libraryManagement } from './library-management';
import { hotel734 } from './hotel-734';
import { nineBoardTicTacToe } from './nine-board-tictactoe';
import { hiddenTruths } from './hidden-truths';
import { capstone } from './capstone';

/**
 * The installed-programs registry.
 *
 * Adding a project is: create the file, add it here. It then appears on the
 * desktop, in All Programs, in File Explorer, in search and as a terminal
 * command, because every one of those surfaces reads this list rather than
 * keeping its own.
 *
 * Order is authored, not alphabetical — it is the order a reviewer should
 * meet the work in. Strongest evidence first, then breadth, then the entries
 * that are honest about being early.
 */
export const projects: readonly Project[] = [
  sOs,
  adrahFarms,
  evNetworkToolkit,
  libraryManagement,
  nineBoardTicTacToe,
  hotel734,
  hiddenTruths,
  capstone,
];
