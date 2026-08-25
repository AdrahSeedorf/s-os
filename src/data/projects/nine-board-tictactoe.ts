import type { Project } from '@/types/content';

/**
 * Nine-Board Tic-Tac-Toe.
 *
 * The clearest algorithms piece in the portfolio, and the natural first
 * candidate for a WebAssembly demo — its own roadmap already lists an
 * Emscripten build, and the engine does no I/O, which is what makes that
 * feasible rather than aspirational.
 */
export const nineBoardTicTacToe: Project = {
  id: 'nine-board-tictactoe',
  displayName: 'Nine-Board Tic-Tac-Toe',
  executable: 'NBTicTacToe.exe',
  icon: 'nine-board',
  version: '1.0.0',
  status: 'stable',
  category: 'systems',
  featured: false,
  desktopShortcut: false,

  tagline:
    'A C++17 engine for nine-board tic-tac-toe with four agents, including alpha-beta minimax with a Zobrist transposition table and a Monte Carlo tree search.',

  overview:
    'Nine tic-tac-toe boards sit in a 3×3 grid. Playing cell (r, c) sends your opponent to board (r, c); if that board is full they may play anywhere. The first three-in-a-row on any single board wins the whole game. That redirect rule makes the branching factor large and the position space awkward, which is what makes it a real search problem rather than a solved toy. Four agents play it: a human, a random baseline, an alpha-beta minimax and an MCTS agent, all behind one interface.',

  problem:
    'Standard tic-tac-toe is solved and uninteresting to search. The nine-board variant is not, but it has a property that quietly breaks the usual optimisation: the last cell played determines the active board, so two different move orders almost always leave you in different positions and genuine transpositions are rare.',

  solution:
    'The rules, the agents and the console output are kept strictly apart. The board and the game state do no I/O at all, which is what makes a position searchable and means a graphical front end would only need to replace the renderer. Adding a fifth agent is one class and one line in the menu; the game loop never changes.',

  role: 'Sole developer.',

  technologies: ['cpp', 'cmake', 'algorithms', 'testing', 'software-architecture', 'git'],

  features: [
    'Negamax with alpha-beta pruning, iterative deepening under a wall-clock budget so a usable move is always ready when time runs out',
    'Transposition table of one million entries keyed by Zobrist hash, with mate-score adjustment so depth-relative win scores survive storage',
    'Move ordering from the transposition table, which is where most of the pruning comes from',
    'Monte Carlo tree search: UCB1 selection, single-node expansion, light random playouts, backpropagation',
    'A tournament harness for AI-versus-AI matches and search benchmarks',
    '62 checks including apply/undo round-trips over 300 random games and Zobrist hash consistency, clean under AddressSanitizer and UndefinedBehaviorSanitizer',
  ],

  architecture:
    'One 3×3 board handles validation and win detection; the nine-board position layers the redirect rule, legal-move generation, apply and undo, and Zobrist hashing on top. Agents implement a single method that takes a position and returns a move, so the game loop is indifferent to which is playing. All console output lives in one renderer.',

  challenges: [
    {
      challenge:
        'The transposition table removed only about one percent of nodes at a fixed depth, which looked like the effort had been wasted.',
      solution:
        'Measuring it separately from iterative deepening showed where the value actually is: as a move-ordering source across deepening passes it buys a full extra ply — average depth 9 rather than 8 — for the same time budget. The right conclusion was that the table was being measured against the wrong baseline, not that it was useless.',
    },
    {
      challenge:
        'A subtly wrong transposition table is very hard to notice, because the search still returns plausible moves.',
      solution:
        'A test asserts that depth-5 scores match exactly with the table enabled and disabled. The table may change how fast a fixed-depth search runs; it must never change the result. That single invariant catches the entire class of bug.',
    },
  ],

  lessons: [
    'Keeping the rules free of input and output was not a style preference — it is the reason the position can be searched at all, and the reason a browser build is a realistic next step.',
    'An optimisation that appears to do nothing is often being measured against the wrong baseline.',
  ],

  screenshots: [],
  links: {
    github: 'https://github.com/AdrahSeedorf/NBTicTacToe',
  },
  // Dates are taken from the repository history rather than from memory. For
  // the projects that began as coursework the real start is earlier, but an
  // approximate date nobody can check is worth less than a precise one that
  // anyone can.
  dateStarted: '2026-08',
  dateCompleted: '2026-08',
};
