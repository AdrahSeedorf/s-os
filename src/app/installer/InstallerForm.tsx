'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Badge, Button, GlassPanel, TextAreaField, TextField } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  EMPTY_DRAFT,
  generateProjectFile,
  slugify,
  suggestExecutable,
  validateDraft,
  type ProjectDraft,
} from '@/lib/installer/generate';
import {
  DEMO_KIND_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
} from '@/types/content';
import type { ProjectCategory, ProjectStatus } from '@/types/content';

interface Props {
  existingIds: readonly string[];
  knownIcons: readonly string[];
  knownSkills: readonly { id: string; name: string }[];
}

type WriteState = 'idle' | 'writing' | 'written' | 'failed';

export function InstallerForm({ existingIds, knownIcons, knownSkills }: Props) {
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT);
  const [writeState, setWriteState] = useState<WriteState>('idle');
  const [writeMessage, setWriteMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof ProjectDraft>(field: K, value: ProjectDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setWriteState('idle');
  };

  const problems = useMemo(
    () =>
      validateDraft(draft, {
        existingIds,
        knownIcons,
        knownSkills: knownSkills.map((skill) => skill.id),
      }),
    [draft, existingIds, knownIcons, knownSkills],
  );

  const generated = useMemo(() => generateProjectFile(draft), [draft]);

  /**
   * Error props for a field.
   *
   * Returns the prop object rather than the message, because with
   * exactOptionalPropertyTypes an `error?: string` prop will not accept
   * `string | undefined` — the property has to be absent, not undefined.
   */
  const errorProps = (field: keyof ProjectDraft): { error?: string } => {
    const message = problems.find((problem) => problem.field === field)?.message;
    return message === undefined ? {} : { error: message };
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated.contents);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const write = async () => {
    setWriteState('writing');

    try {
      const response = await fetch('/api/installer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const body = (await response.json()) as { path?: string; error?: string };

      if (response.ok) {
        setWriteState('written');
        setWriteMessage(`Written to ${body.path}. Registered in projects/index.ts.`);
      } else {
        setWriteState('failed');
        setWriteMessage(body.error ?? 'The file could not be written.');
      }
    } catch {
      setWriteState('failed');
      setWriteMessage('The request failed. Is the dev server still running?');
    }
  };

  return (
    <div className="from-base via-raised to-base min-h-screen bg-linear-160 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-semibold">S-OS Project Installer</h1>
            <Badge tone="dev" dot>
              Development only
            </Badge>
          </div>
          <p className="text-muted text-[12.5px]">
            Generates the same typed data file you would write by hand. This page does not exist
            in a production build.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassPanel className="flex flex-col gap-4 p-5">
            <TextField
              label="Display name"
              value={draft.displayName}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((current) => ({
                  ...current,
                  displayName: value,
                  // Only auto-fill while the author has not typed their own.
                  id: current.id || slugify(value),
                  executable: current.executable || suggestExecutable(value),
                }));
              }}
              {...errorProps('displayName')}
              required
            />

            <TextField
              label="Id"
              value={draft.id}
              onChange={(event) => set('id', event.target.value)}
              hint="Used in the filename and the URL."
              {...errorProps('id')}
            />

            <TextField
              label="Executable"
              value={draft.executable}
              onChange={(event) => set('executable', event.target.value)}
              hint="Shown on the desktop icon."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Status"
                value={draft.status}
                onChange={(value) => set('status', value as ProjectStatus)}
                options={Object.entries(PROJECT_STATUS_LABEL)}
              />
              <Select
                label="Category"
                value={draft.category}
                onChange={(value) => set('category', value as ProjectCategory)}
                options={Object.entries(PROJECT_CATEGORY_LABEL)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Icon"
                value={draft.icon}
                onChange={(value) => set('icon', value)}
                options={knownIcons.map((icon) => [icon, icon])}
                {...errorProps('icon')}
              />
              <TextField
                label="Version"
                value={draft.version}
                onChange={(event) => set('version', event.target.value)}
              />
            </div>

            <TextField
              label="Tagline"
              value={draft.tagline}
              onChange={(event) => set('tagline', event.target.value)}
              hint="One sentence. Used in search, cards and link previews."
              {...errorProps('tagline')}
              required
            />

            <TextAreaField
              label="Overview"
              rows={4}
              value={draft.overview}
              onChange={(event) => set('overview', event.target.value)}
              {...errorProps('overview')}
              required
            />

            <TextAreaField
              label="My role"
              rows={2}
              value={draft.role}
              onChange={(event) => set('role', event.target.value)}
              hint="What you personally built. Reviewers always ask."
              {...errorProps('role')}
              required
            />

            <TextAreaField
              label="Problem"
              rows={3}
              value={draft.problem}
              onChange={(event) => set('problem', event.target.value)}
              hint="Optional."
            />

            <TextAreaField
              label="Approach"
              rows={3}
              value={draft.solution}
              onChange={(event) => set('solution', event.target.value)}
              hint="Optional."
            />

            <ListField
              label="Technologies"
              hint="Skill ids from skills.ts, comma separated."
              value={draft.technologies}
              onChange={(value) => set('technologies', value)}
              {...errorProps('technologies')}
            />

            <ListField
              label="Features"
              hint="One per line."
              multiline
              value={draft.features}
              onChange={(value) => set('features', value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Started"
                value={draft.dateStarted}
                onChange={(event) => set('dateStarted', event.target.value)}
                hint="YYYY-MM"
                {...errorProps('dateStarted')}
                required
              />
              <TextField
                label="Completed"
                value={draft.dateCompleted}
                onChange={(event) => set('dateCompleted', event.target.value)}
                hint="YYYY-MM, or empty"
                {...errorProps('dateCompleted')}
              />
            </div>

            <TextField
              label="GitHub URL"
              value={draft.github}
              onChange={(event) => set('github', event.target.value)}
            />
            {/* The demo is asked as one question with one answer, mirroring the
                content model. Fields for the other kinds are not rendered at
                all, so it is impossible to fill in a video size for a live
                site and wonder why it was ignored. */}
            <Select
              label="Demo"
              value={draft.demoKind}
              onChange={(value) => set('demoKind', value as ProjectDraft['demoKind'])}
              options={[
                ['none', 'Source only — nothing to run'],
                ['live', DEMO_KIND_LABEL.live],
                ['video', DEMO_KIND_LABEL.video],
              ]}
            />

            {draft.demoKind === 'live' ? (
              <>
                <TextField
                  label="Live demo URL"
                  value={draft.demoUrl}
                  onChange={(event) => set('demoUrl', event.target.value)}
                  {...errorProps('demoUrl')}
                  required
                />
                <TextField
                  label="Demo note"
                  value={draft.demoNote}
                  onChange={(event) => set('demoNote', event.target.value)}
                  hint="Sign-in details, or what to try first. Optional."
                />
                <Checkbox
                  label="Demo can be embedded in an S-OS window"
                  checked={draft.demoEmbeddable}
                  onChange={(value) => set('demoEmbeddable', value)}
                />
              </>
            ) : null}

            {draft.demoKind === 'video' ? (
              <>
                <TextField
                  label="Recording path"
                  value={draft.videoSrc}
                  onChange={(event) => set('videoSrc', event.target.value)}
                  hint="For example /demos/hotel-manager.mp4"
                  {...errorProps('videoSrc')}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Width"
                    value={draft.videoWidth}
                    onChange={(event) => set('videoWidth', event.target.value)}
                    hint="Pixels"
                    {...errorProps('videoWidth')}
                    required
                  />
                  <TextField
                    label="Height"
                    value={draft.videoHeight}
                    onChange={(event) => set('videoHeight', event.target.value)}
                    hint="Pixels"
                    {...errorProps('videoHeight')}
                    required
                  />
                </div>
                <TextField
                  label="Caption"
                  value={draft.videoCaption}
                  onChange={(event) => set('videoCaption', event.target.value)}
                  hint="What the recording shows. Optional."
                />
              </>
            ) : null}

            <TextAreaField
              label="Publication restriction"
              rows={2}
              value={draft.publicationNote}
              onChange={(event) => set('publicationNote', event.target.value)}
              hint="Set this if the code cannot be published. Source and demo links must then be empty."
              {...errorProps('publicationNote')}
            />

            <div className="flex flex-col gap-2">
              <Checkbox
                label="Featured — appears in Recruiter Mode"
                checked={draft.featured}
                onChange={(value) => set('featured', value)}
              />
              <Checkbox
                label="Desktop shortcut"
                checked={draft.desktopShortcut}
                onChange={(value) => set('desktopShortcut', value)}
                {...errorProps('desktopShortcut')}
              />
            </div>
          </GlassPanel>

          <div className="flex flex-col gap-4">
            <GlassPanel className="flex flex-col gap-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[12px]">{generated.path}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={copy}
                    iconStart={copied ? <Check size={13} /> : <Copy size={13} />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={write}
                    disabled={problems.length > 0 || writeState === 'writing'}
                    iconStart={<Download size={13} />}
                  >
                    {writeState === 'writing' ? 'Writing…' : 'Write file'}
                  </Button>
                </div>
              </div>

              {problems.length > 0 ? (
                <ul className="text-status-danger flex flex-col gap-1 text-[11.5px]">
                  {problems.map((problem) => (
                    <li key={`${problem.field}-${problem.message}`}>{problem.message}</li>
                  ))}
                </ul>
              ) : null}

              {writeState !== 'idle' && writeMessage ? (
                <p
                  className={cn(
                    'text-[11.5px]',
                    writeState === 'failed' ? 'text-status-danger' : 'text-status-stable',
                  )}
                >
                  {writeMessage}
                </p>
              ) : null}
            </GlassPanel>

            <GlassPanel tone="inset" className="min-h-0 flex-1 overflow-auto p-4">
              <pre className="text-secondary font-mono text-[11.5px] whitespace-pre-wrap">
                {generated.contents}
              </pre>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-secondary text-[12px] font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="sos-inset text-primary h-9 rounded-sm px-2 text-[13px]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error ? <span className="text-status-danger text-[11px]">{error}</span> : null}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  error,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}) {
  return (
    <label className="flex items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4"
      />
      <span className="flex flex-col">
        <span className="text-secondary text-[12.5px]">{label}</span>
        {error ? <span className="text-status-danger text-[11px]">{error}</span> : null}
      </span>
    </label>
  );
}

function ListField({
  label,
  hint,
  value,
  onChange,
  error,
  multiline = false,
}: {
  label: string;
  hint?: string;
  value: readonly string[];
  onChange: (value: string[]) => void;
  error?: string;
  multiline?: boolean;
}) {
  const separator = multiline ? '\n' : ', ';
  const text = value.join(separator);

  const parse = (raw: string) =>
    raw
      .split(multiline ? /\n/ : /,/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  return multiline ? (
    <TextAreaField
      label={label}
      rows={4}
      value={text}
      onChange={(event) => onChange(parse(event.target.value))}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
    />
  ) : (
    <TextField
      label={label}
      value={text}
      onChange={(event) => onChange(parse(event.target.value))}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
    />
  );
}
