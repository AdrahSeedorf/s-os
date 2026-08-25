import type { Project } from '@/types/content';

/**
 * The EV Network Toolkit.
 *
 * Featured because of its findings rather than its size. Several of them are
 * negative results about Seedorf's own earlier coursework, which is a harder
 * and more useful thing to publish than another list of features.
 */
export const evNetworkToolkit: Project = {
  id: 'ev-network-toolkit',
  displayName: 'EV Network Toolkit',
  executable: 'evnet.exe',
  icon: 'ev-network',
  version: '0.3.0',
  status: 'beta',
  category: 'systems',
  featured: true,
  desktopShortcut: true,

  tagline:
    'A C++17 engine for routing agents across a network where they compete for limited capacity, trading money against time. EV charging is the case study; the core never mentions vehicles.',

  overview:
    'Where should an electric vehicle charge, and where should the next charging station go, when the answer depends not only on distance and price but on how many other vehicles had the same idea? The toolkit answers both questions over the same network model: five routing planners, a discrete-event simulator with queues that actually drain, and a siting algorithm that places new capacity against simulated load. It ships with three datasets — a Sydney metro graph, the Hume corridor between Sydney and Melbourne, and a network derived from OpenStreetMap with real road distances.',

  problem:
    'This is the merge of two university projects that solved adjacent halves of one problem and could not talk to each other. The metro study asked where to charge and treated vehicles as independent, routing to the cheapest charger with no idea whether there would be a two-hour queue on arrival. The corridor study asked when to stop and balanced queues while knowing nothing about price. They disagreed on network shape, method, scarce resource and even units — kilowatt-hours and dollars against kilometres of range and hours.',

  solution:
    'One graph model, one demand type, one objective function that prices time explicitly, and five planners that can therefore be compared on the same axis. Four of them are greedy and score only the next stop; the fifth searches the joint routing-and-charging problem with Dijkstra over a composite node-and-charge state. Replacing the inherited static congestion model with a discrete-event clock is what turned the comparison into something trustworthy — and immediately showed that the old model had been wrong by three orders of magnitude.',

  role: 'Sole developer — merged the two inherited codebases, designed the unified model, wrote the simulator, the optimal planner, the ingestion pipeline and the analysis.',

  technologies: [
    'cpp',
    'cmake',
    'algorithms',
    'discrete-event-simulation',
    'catch2',
    'testing',
    'ci-cd',
    'python',
    'software-architecture',
    'git',
    'github',
  ],

  features: [
    'Five comparable planners: farthest-progress, cheapest, minimum-wait, generalised cost, and an optimal search over (node, charge) state',
    'Discrete-event simulator with per-station queues, release-time profiles, per-stop overhead and measured rather than estimated waits',
    'Congestion-aware siting that places new stations against simulated load',
    'Ingestion pipeline building networks from OpenStreetMap and OSRM, with real road distances replacing straight-line estimates',
    'A geometric validator that rejects distances shorter than the great-circle line between their endpoints',
    'Rendered light and dark network maps showing where load actually concentrates',
    'CSV export of time series and per-trip records, which is how the analysis scripts drive the engine',
    '74 tests, run in CI on GCC and Clang across Linux and macOS, Debug and Release, with warnings as errors',
  ],

  architecture:
    'The core is domain-agnostic on purpose. Router, Policy, Allocator and Siting contain no reference to vehicles or electricity; the EV-specific parts are the unit conversions and the data schema. The shape underneath — agents traversing a network, competing for scarce capacity at nodes, trading money against time — also fits ambulance station siting, clinic capacity planning and evacuation routing with shelter limits. Feasibility is modelled once and shared by every planner, so a disagreement between planners is a genuine disagreement about what "best" means rather than an artefact of two different models.',

  challenges: [
    {
      challenge:
        'The inherited congestion model was static: it estimated waiting time from a utilisation ratio without any notion of when vehicles actually arrived.',
      solution:
        'A discrete-event clock with queues that drain, replacing estimated waits with measured ones. The static model turned out to overstate waits by up to 1,500 times. Both engines are still selectable from the command line, because being able to reproduce the old answer is what makes the correction credible.',
    },
    {
      challenge:
        'Lookahead in the planner improved results in testing and then made them worse, inconsistently, depending on the dataset.',
      solution:
        'Measuring across a saturation sweep showed the effect is real and conditional: lookahead helps while the network is calm and hurts once it is busy, because a plan made on current queue lengths is stale by the time the vehicle arrives. The finding is documented as a limit on the method rather than tuned away.',
    },
    {
      challenge:
        'Two distances inherited from the original coursework were geometrically impossible — shorter than the straight line between their own coordinates.',
      solution:
        'A validator that checks every edge against the great-circle distance between its endpoints, run as part of the dataset tests. It also caught an ingestion bug where a charger power rating was being read as a capacity count.',
    },
  ],

  lessons: [
    'The most valuable results here are the ones that contradict the work they came from. A portfolio of things that went well is less informative than one finding that says the earlier model was wrong by three orders of magnitude.',
    'Policy choice is worth almost nothing until a network saturates, which means most of the argument about which strategy is best is an argument about an operating point nobody stated.',
    'Building the second compiler into CI paid for itself immediately: Clang caught a C++20-only lambda capture and an unused constant that GCC accepted in silence.',
  ],

  buildLog: {
    done: [
      'Stage 1 — merged both inherited codebases into one graph model, one demand type, one objective and four comparable policies',
      'Stage 2 — discrete-event clock, draining queues, measured waits, CSV export, and the optimal planner over (node, charge) state',
      'Stage 3 — real coordinates for all 36 places, geometric validation, rendered maps, and the OpenStreetMap and OSRM ingestion pipeline',
    ],
    next: [
      'Stage 4 — a second dataset from a different domain, to demonstrate the core is genuinely domain-agnostic',
      'Record a terminal session of the planner comparison for the S-OS demo tab',
    ],
    updated: '2026-08-18',
  },

  screenshots: [],
  links: {
    github: 'https://github.com/AdrahSeedorf/ev-charging',
  },
  dateStarted: '2026-08',
};
