import type { Project } from '@/types/content';

/**
 * The EV Network Toolkit.
 *
 * Featured because of its findings rather than its size. Several are negative
 * results about Seedorf's own earlier coursework, and the ninth is a negative
 * result about this project's own model — which is a harder and more useful
 * thing to publish than another list of features.
 */
export const evNetworkToolkit: Project = {
  id: 'ev-network-toolkit',
  displayName: 'EV Network Toolkit',
  executable: 'evnet.exe',
  icon: 'ev-network',
  version: '1.0.0',
  status: 'stable',
  category: 'systems',
  featured: true,
  desktopShortcut: true,

  tagline:
    'A C++17 engine for routing agents across a network where they compete for limited capacity, trading a scarce resource against time — proven domain-agnostic by running the same code over EV charging and over truck drivers under fatigue law.',

  overview:
    'Where should an electric vehicle charge, and where should the next charging station go, when the answer depends not only on distance and price but on how many other vehicles had the same idea? The toolkit answers both over one network model: five routing planners, a discrete-event simulator with queues that drain, and congestion-aware siting. Everything the engine needs to know about what kind of agent it is routing passes through a single Domain interface — which is how the same code now also routes heavy-vehicle drivers under the Heavy Vehicle National Law across the Hume corridor’s real rest areas. Around 7,700 lines of C++ and 105 tests.',

  problem:
    'This began as the merge of two university projects that solved adjacent halves of one problem and could not talk to each other. The metro study asked where to charge and treated vehicles as independent, routing to the cheapest charger with no idea whether there would be a two-hour queue on arrival. The corridor study asked when to stop and balanced queues while knowing nothing about price. They disagreed on network shape, method, scarce resource and even units.',

  solution:
    'One graph model, one demand type, one objective that prices time explicitly, and five planners that can therefore be compared on the same axis. Four are greedy and score only the next stop; the fifth searches the joint routing-and-charging problem with Dijkstra over a composite node-and-charge state. Replacing the inherited static congestion model with a discrete-event clock made the comparison trustworthy — and immediately showed the old model had been wrong by three orders of magnitude. The final stage pushed every physics question behind an interface, with laws each domain must satisfy and a test asserting the engine asks the domain rather than answering for itself.',

  role: 'Sole developer — merged the two inherited codebases, designed the unified model, wrote the simulator, the optimal planner, the ingestion pipeline, the domain seam and the analysis.',

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
    'Discrete-event simulator with per-station queues, release-time profiles, per-stop overhead and measured rather than estimated waiting time',
    'A Domain interface carrying every physics question — resource cost, range, service time, admission and post-service level — with laws each implementation must satisfy',
    'Two domains proving the seam: EV charging, and solo truck drivers under the Heavy Vehicle National Law’s standard hours at 40 real southbound rest areas',
    'Congestion-aware siting that places new capacity against simulated load',
    'Ingestion from OpenStreetMap and OSRM, with a geometric validator that rejects edges shorter than the great-circle line between their own endpoints',
    'Rendered light and dark network maps showing where load actually concentrates',
    '105 tests, run in CI on GCC and Clang across Linux and macOS, Debug and Release, with warnings as errors',
  ],

  architecture:
    'The core is domain-agnostic, and now demonstrably so. Router, Policy, Allocator and Siting contain no reference to vehicles or electricity; what kind of agent is being routed arrives through one interface. The shape underneath — agents traversing a network, competing for scarce capacity at nodes, trading a resource against time — fits ambulance siting, clinic capacity and evacuation routing as readily as it fits charging. Feasibility is modelled once and shared by every planner, so a disagreement between planners is a genuine disagreement about what "best" means rather than an artefact of two different models.',

  challenges: [
    {
      challenge:
        'The inherited congestion model was static: it estimated waiting time from a utilisation ratio without any notion of when vehicles actually arrived.',
      solution:
        'A discrete-event clock with queues that drain, replacing estimated waits with measured ones. The static model turned out to overstate waits by up to 1,500 times. Both engines are still selectable from the command line, because being able to reproduce the old answer is what makes the correction credible.',
    },
    {
      challenge:
        'Claiming an engine is domain-agnostic is cheap. The only way to find out is to make it route something genuinely different.',
      solution:
        'Trucking exposed two assumptions the EV model had never stated. A full charging site has a car park, so you queue; a full truck stop has nowhere to wait and turns you away — which is what actually costs a driver their legal hours. And an EV driver chooses how much charge to take, whereas a driver’s rest is all or nothing. Both became methods on the interface rather than conditionals in the planner.',
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
        'A validator checking every edge against the great-circle distance between its endpoints, run as part of the dataset tests. It also caught an ingestion bug where a charger power rating was being read as a capacity count.',
    },
  ],

  lessons: [
    'The most valuable results here are the ones that contradict the work they came from — including this project’s own earlier stages.',
    'A second domain is the only honest test of an abstraction. Trucking found two unstated assumptions in a model I had already written up as general, and both were invisible until something refused to fit.',
    'Robustness that falls out of how a planner scores is not the same as a planner that understands the risk. The greedy planners strand almost nobody on the truck corridor, and none of them models a full car park at all.',
  ],

  screenshots: [],
  links: {
    github: 'https://github.com/AdrahSeedorf/ev-charging',
  },
  dateStarted: '2026-08',
  dateCompleted: '2026-09',
};
