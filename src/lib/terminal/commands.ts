import { site } from '@/lib/config/site';
import {
  getCertifications,
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getResume,
  getSkillsGroupedByCategory,
  isDocumentAvailable,
} from '@/lib/content';
import { listChildren, resolvePath, toDisplayPath } from '@/lib/content/filesystem';
import { search } from '@/lib/search';
import { getLaunchableApps } from '@/os/registry/applications';
import { AVAILABILITY_LABEL, SKILL_LEVEL_LABEL, PROJECT_STATUS_LABEL } from '@/types/content';
import { accent, blank, error, line, muted, type Command } from './types';

/**
 * The S-OS command table.
 *
 * Around twenty commands, all of which do something real. The temptation with
 * a portfolio terminal is fifty commands that each print a paragraph; a
 * smaller table where `cd` and `ls` genuinely walk the same filesystem the
 * Explorer shows is more convincing and far less to maintain.
 *
 * Nothing here executes anything. It is a command interpreter over the content
 * registry, and the only "system" it can affect is the S-OS window manager,
 * via the effects it returns.
 */

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

/** Pads a label so two-column output lines up without a table. */
function pad(value: string, width: number): string {
  return value.length >= width ? value : value + ' '.repeat(width - value.length);
}

export const commands: readonly Command[] = [
  {
    name: 'help',
    summary: 'List available commands.',
    run: (args) => {
      const visible = commands.filter((command) => !command.hidden);

      if (args[0]) {
        const target = findCommand(args[0]);
        if (!target) return { lines: [error(`No help for '${args[0]}'.`)] };

        return {
          lines: [
            accent(target.name),
            line(target.summary),
            ...(target.usage ? [muted(`Usage: ${target.usage}`)] : []),
          ],
        };
      }

      return {
        lines: [
          accent('S-OS commands'),
          blank(),
          ...visible.map((command) => line(`  ${pad(command.name, 12)}${command.summary}`)),
          blank(),
          muted("Type 'help <command>' for detail. Tab completes, ↑ recalls history."),
        ],
      };
    },
  },

  {
    name: 'whoami',
    summary: 'Show the current user.',
    run: () => {
      const profile = getProfile();
      const education = getEducation()[0];

      return {
        lines: [
          accent(profile.name),
          line(profile.title),
          line(profile.location),
          ...(education ? [muted(`${education.qualification}, ${education.institution}`)] : []),
          blank(),
          line(profile.summary),
          blank(),
          muted(`Status: ${AVAILABILITY_LABEL[profile.availability]}`),
        ],
      };
    },
  },

  {
    name: 'about',
    summary: 'Open About Seedorf.',
    run: () => ({
      lines: [muted('Opening About Seedorf…')],
      effects: [{ type: 'open-app', appId: 'about' }],
    }),
  },

  {
    name: 'projects',
    summary: 'List installed projects.',
    usage: 'projects [status]',
    run: (args) => {
      const filter = args[0]?.toLowerCase();
      const all = getProjects();
      const matching = filter
        ? all.filter((project) => project.status.replace('-', '') === filter.replace('-', ''))
        : all;

      if (matching.length === 0) {
        return { lines: [error(`No projects with status '${filter}'.`)] };
      }

      return {
        lines: [
          accent(`${matching.length} of ${all.length} programs`),
          blank(),
          ...matching.map((project) =>
            line(
              `  ${pad(project.executable, 24)}${pad(`v${project.version}`, 10)}${PROJECT_STATUS_LABEL[project.status]}`,
            ),
          ),
          blank(),
          muted("Type 'open <name>' to launch one."),
        ],
      };
    },
  },

  {
    name: 'skills',
    summary: 'List technologies and levels.',
    run: () => {
      const groups = getSkillsGroupedByCategory();

      return {
        lines: groups.flatMap((group) => [
          accent(group.label),
          ...group.skills.map((skill) =>
            line(`  ${pad(skill.name, 24)}${SKILL_LEVEL_LABEL[skill.level]}`),
          ),
          blank(),
        ]),
      };
    },
  },

  {
    name: 'experience',
    summary: 'Show work history.',
    run: () => {
      const experience = getExperience();

      if (experience.length === 0) {
        return {
          lines: [
            line('No industry experience yet — currently studying.'),
            muted("The projects are the work to judge. Try 'projects'."),
          ],
        };
      }

      return {
        lines: experience.flatMap((entry) => [
          accent(`${entry.role} — ${entry.organisation}`),
          muted(
            `${formatMonth(entry.startDate)} – ${entry.endDate ? formatMonth(entry.endDate) : 'Present'}`,
          ),
          line(entry.summary),
          blank(),
        ]),
      };
    },
  },

  {
    name: 'education',
    summary: 'Show education and certifications.',
    run: () => {
      const education = getEducation();
      const certifications = getCertifications();

      return {
        lines: [
          ...education.flatMap((entry) => [
            accent(entry.qualification),
            line(entry.institution),
            muted(
              `${formatMonth(entry.startDate)} – ${entry.endDate ? formatMonth(entry.endDate) : 'Present'}${entry.expected ? ' (expected)' : ''}`,
            ),
            blank(),
          ]),
          ...(certifications.length > 0
            ? [
                accent('Certifications'),
                ...certifications.map((entry) => line(`  ${entry.name} — ${entry.issuer}`)),
              ]
            : []),
        ],
      };
    },
  },

  {
    name: 'resume',
    summary: 'Open the resume.',
    run: () => {
      const resume = getResume();

      if (!resume || !isDocumentAvailable(resume)) {
        return {
          lines: [
            line('The resume is being finalised.'),
            muted("Try 'open recruiter' — it covers the same ground."),
          ],
        };
      }

      return {
        lines: [muted('Opening resume…')],
        effects: [{ type: 'open-app', appId: 'resume' }],
      };
    },
  },

  {
    name: 'contact',
    summary: 'Show contact details.',
    run: () => {
      const profile = getProfile();
      const known = [
        profile.email ? `  Email     ${profile.email}` : null,
        profile.github ? `  GitHub    ${profile.github}` : null,
        profile.linkedin ? `  LinkedIn  ${profile.linkedin}` : null,
      ].filter((entry): entry is string => entry !== null);

      return {
        lines: [
          accent('Contact'),
          ...(known.length > 0
            ? known.map((entry) => line(entry))
            : [muted('  Profile links are being added.')]),
          blank(),
          muted('Opening the Contact window…'),
        ],
        effects: [{ type: 'open-app', appId: 'contact' }],
      };
    },
  },

  {
    name: 'github',
    summary: 'Open the GitHub profile.',
    run: () => {
      const url = getProfile().github;
      if (!url) return { lines: [error('No GitHub profile is registered yet.')] };

      return { lines: [muted(`Opening ${url}…`)], effects: [{ type: 'open-url', url }] };
    },
  },

  {
    name: 'linkedin',
    summary: 'Open the LinkedIn profile.',
    run: () => {
      const url = getProfile().linkedin;
      if (!url) return { lines: [error('No LinkedIn profile is registered yet.')] };

      return { lines: [muted(`Opening ${url}…`)], effects: [{ type: 'open-url', url }] };
    },
  },

  {
    name: 'ls',
    aliases: ['dir'],
    summary: 'List the current directory.',
    usage: 'ls [path]',
    run: (args, context) => {
      const target = args[0] ? resolvePath(context.fs, context.cwd, args[0]) : context.cwd;

      if (!target) {
        return { lines: [error('The system cannot find the path specified.')] };
      }

      const children = listChildren(context.fs, target);
      if (children.length === 0) return { lines: [muted('  (empty)')] };

      return {
        lines: [
          muted(`  Directory of ${toDisplayPath(target)}`),
          blank(),
          ...children.map((node) =>
            line(`  ${pad(node.kind === 'file' ? '     ' : '<DIR>', 8)}${node.name}`),
          ),
        ],
      };
    },
  },

  {
    name: 'cd',
    summary: 'Change directory.',
    usage: 'cd <path>',
    run: (args, context) => {
      if (!args[0]) return { lines: [line(toDisplayPath(context.cwd))] };

      const target = resolvePath(context.fs, context.cwd, args[0]);
      if (!target) {
        return { lines: [error('The system cannot find the path specified.')] };
      }

      const node = context.fs.index.get(target);
      if (node?.kind === 'file') {
        return { lines: [error('The directory name is invalid.')] };
      }

      return { lines: [], cwd: target };
    },
  },

  {
    name: 'pwd',
    summary: 'Print the current directory.',
    run: (_args, context) => ({ lines: [line(toDisplayPath(context.cwd))] }),
  },

  {
    name: 'open',
    summary: 'Open a program, project or path.',
    usage: 'open <name>',
    run: (args, context) => {
      const query = args.join(' ').trim();
      if (!query) return { lines: [error('Usage: open <name>')] };

      // Applications first, then projects, then the filesystem. Resolution
      // order matters: `open projects` should give the Projects browser rather
      // than a directory listing that happens to share the name.
      const app = getLaunchableApps().find(
        (entry) =>
          entry.id === query.toLowerCase() || entry.name.toLowerCase() === query.toLowerCase(),
      );

      if (app) {
        return {
          lines: [muted(`Opening ${app.name}…`)],
          effects: [{ type: 'open-app', appId: app.id }],
        };
      }

      const project = getProjects().find(
        (entry) =>
          entry.id === query.toLowerCase() ||
          entry.executable.toLowerCase() === query.toLowerCase() ||
          entry.displayName.toLowerCase() === query.toLowerCase(),
      );

      if (project) {
        return {
          lines: [muted(`Launching ${project.executable}…`)],
          effects: [{ type: 'open-app', appId: 'project', params: { projectId: project.id } }],
        };
      }

      const path = resolvePath(context.fs, context.cwd, query);
      if (path) {
        return {
          lines: [muted(`Opening ${toDisplayPath(path)}…`)],
          effects: [{ type: 'open-app', appId: 'explorer', params: { path } }],
        };
      }

      return {
        lines: [
          error(`'${query}' is not recognised as a program, project or path.`),
          muted("Try 'projects' or 'help'."),
        ],
      };
    },
  },

  {
    name: 'search',
    summary: 'Search everything in S-OS.',
    usage: 'search <query>',
    run: (args) => {
      const query = args.join(' ').trim();
      if (!query) return { lines: [error('Usage: search <query>')] };

      // The same index the Start menu uses — one search, two front ends.
      const results = search(query, { limit: 10 });
      if (results.length === 0) return { lines: [muted(`No results for '${query}'.`)] };

      return {
        lines: [
          accent(`${results.length} result${results.length === 1 ? '' : 's'} for '${query}'`),
          blank(),
          ...results.map((result) => line(`  ${pad(result.kind, 12)}${result.title}`)),
        ],
      };
    },
  },

  {
    name: 'version',
    aliases: ['ver'],
    summary: 'Show the S-OS version.',
    run: () => ({
      lines: [
        accent(`${site.name} — ${site.fullName}`),
        line(`Version ${site.version}`),
        muted(`Developed by ${getProfile().name}`),
      ],
    }),
  },

  {
    name: 'date',
    summary: 'Show the current date and time.',
    run: () => ({ lines: [line(new Date().toLocaleString())] }),
  },

  {
    name: 'clear',
    aliases: ['cls'],
    summary: 'Clear the screen.',
    run: () => ({ lines: [], effects: [{ type: 'clear' }] }),
  },

  {
    name: 'exit',
    summary: 'Close the terminal.',
    run: () => ({ lines: [muted('Goodbye.')], effects: [{ type: 'close' }] }),
  },

  // --- Easter eggs -------------------------------------------------------
  // Hidden from help. Each stays professional: someone who finds one should
  // smile, not wince on behalf of the person who wrote it.
  {
    name: 'sudo',
    hidden: true,
    summary: 'Elevate privileges.',
    run: (args) => {
      const request = args.join(' ').toLowerCase();

      if (request.includes('hire')) {
        return {
          lines: [
            accent('Permission granted.'),
            blank(),
            line('Seedorf Obeng-Mireku — available for software engineering'),
            line('internships and graduate roles in Sydney.'),
            blank(),
            muted("Type 'contact' to make it official."),
          ],
        };
      }

      return {
        lines: [error('Permission denied.'), muted('This incident will not be reported.')],
      };
    },
  },

  {
    name: 'matrix',
    hidden: true,
    summary: 'Follow the white rabbit.',
    run: () => ({
      lines: [
        accent('Wake up, recruiter…'),
        muted('01010011 00101101 01001111 01010011'),
        line('There is no spoon. There is, however, a resume.'),
      ],
    }),
  },

  {
    name: 'coffee',
    hidden: true,
    summary: 'Brew coffee.',
    run: () => ({
      lines: [
        error('418 I’m a teapot'),
        muted('S-OS does not implement the Hyper Text Coffee Pot Control Protocol.'),
      ],
    }),
  },

  {
    name: 'credits',
    hidden: true,
    summary: 'Show credits.',
    run: () => ({
      lines: [
        accent(site.fullName),
        blank(),
        line(`  Design and engineering    ${getProfile().name}`),
        line('  Built with               Next.js, TypeScript, Tailwind CSS'),
        line('  Inspired by              the Windows 7 era'),
        line('  Contains                 no Microsoft assets whatsoever'),
        blank(),
        muted('Every icon, sound and pixel here is original.'),
      ],
    }),
  },
];

export function findCommand(name: string): Command | undefined {
  const needle = name.toLowerCase();

  return commands.find(
    (command) => command.name === needle || command.aliases?.includes(needle) === true,
  );
}

/** Every name a visitor could type, for tab completion. */
export function commandNames(includeHidden = false): readonly string[] {
  return commands
    .filter((command) => includeHidden || !command.hidden)
    .flatMap((command) => [command.name, ...(command.aliases ?? [])])
    .sort();
}
