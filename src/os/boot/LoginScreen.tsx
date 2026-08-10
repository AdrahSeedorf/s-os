'use client';

import { useState, type FormEvent } from 'react';
import {
  Accessibility,
  ArrowRight,
  Contrast,
  Power,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react';
import { SosWordmark, Wallpaper } from '@/components/brand';
import { ProgramIcon } from '@/components/icons';
import { Badge, Button, GlassPanel, IconButton, TextField } from '@/components/ui';
import { useClock } from '@/lib/hooks/useClock';
import { getProfile } from '@/lib/content';
import { DEMO_CREDENTIALS, useSystemStore } from '@/stores/systemStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

/**
 * One of the alternative ways in.
 *
 * A native button rather than a glass panel with a click handler: it has to be
 * reachable by Tab, activate on Enter and Space, and announce itself as a
 * button. Those are the routes recruiters actually take, so they are the last
 * place to be clever with markup.
 */
function EntryCard({
  icon,
  title,
  description,
  onSelect,
}: {
  icon: string;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="sos-glass hover:bg-glass-strong focus-visible:border-accent-400 flex items-center gap-3 rounded-md p-4 text-left transition-colors"
    >
      <ProgramIcon icon={icon} size={32} />
      <span className="flex flex-col">
        <span className="text-[13px] font-medium">{title}</span>
        <span className="text-muted text-[11px]">{description}</span>
      </span>
    </button>
  );
}

/**
 * The S-OS login screen.
 *
 * The governing constraint is that this screen must never be an obstacle. It
 * offers three equivalent ways in — demo credentials, guest, and Recruiter
 * Mode — and the credentials are pre-filled and visible rather than hidden as
 * a puzzle. Nothing here protects anything; every route leads to the same
 * public portfolio.
 */
export function LoginScreen() {
  const profile = getProfile();
  const clock = useClock();

  const enterDesktop = useSystemStore((state) => state.enterDesktop);
  const attemptLogin = useSystemStore((state) => state.attemptLogin);
  const loginError = useSystemStore((state) => state.loginError);
  const clearLoginError = useSystemStore((state) => state.clearLoginError);
  const shutdown = useSystemStore((state) => state.shutdown);
  const restart = useSystemStore((state) => state.restart);

  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const setSoundEnabled = usePreferencesStore((state) => state.setSoundEnabled);
  const contrast = usePreferencesStore((state) => state.contrast);
  const setContrast = usePreferencesStore((state) => state.setContrast);
  const motion = usePreferencesStore((state) => state.motion);
  const setMotion = usePreferencesStore((state) => state.setMotion);

  const [username, setUsername] = useState<string>(DEMO_CREDENTIALS.username);
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    attemptLogin(username, password);
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-auto">
      <Wallpaper dimmed />

      <div className="relative flex min-h-full flex-col">
        <header className="flex items-start justify-between gap-6 p-6 md:p-8">
          <SosWordmark size="md" showFullName />

          {/* Rendered only once mounted: the server has no idea what time it
              is where the visitor is, and guessing causes a hydration error. */}
          {clock ? (
            <div className="text-right">
              <p className="text-[26px] leading-none font-light tracking-tight tabular-nums">
                <time dateTime={clock.iso}>{clock.time}</time>
              </p>
              <p className="text-muted mt-1.5 text-[12px]">{clock.date}</p>
            </div>
          ) : null}
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-8">
          <div className="flex w-full max-w-lg flex-col gap-4">
            <GlassPanel tone="strong" className="flex flex-col items-center gap-5 p-7">
              <div className="border-accent-400/40 bg-accent-800/40 flex size-20 items-center justify-center rounded-full border">
                {/* Placeholder until a real avatar exists. A generic mark is
                    better than a broken image or an empty circle. */}
                <ProgramIcon icon="about" size={40} />
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center">
                <h1 className="text-[19px] font-semibold">{profile.displayName}</h1>
                <p className="text-muted text-[12.5px]">{profile.title}</p>
                <Badge tone="accent" dot>
                  {profile.location}
                </Badge>
              </div>

              <form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
                <TextField
                  label="Username"
                  value={username}
                  autoComplete="off"
                  onChange={(event) => {
                    setUsername(event.target.value);
                    clearLoginError();
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  autoComplete="off"
                  {...(loginError === null ? {} : { error: loginError })}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearLoginError();
                  }}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  block
                  iconEnd={<ArrowRight size={15} />}
                >
                  Sign in
                </Button>

                <p className="text-disabled text-center text-[11px]">
                  Demo credentials are filled in for you —{' '}
                  <span className="font-mono">{DEMO_CREDENTIALS.username}</span> /{' '}
                  <span className="font-mono">{DEMO_CREDENTIALS.password}</span>
                </p>
              </form>
            </GlassPanel>

            {/* The two routes that matter most, given equal visual weight to
                the sign-in form rather than being tucked underneath it. */}
            <div className="grid gap-3 sm:grid-cols-2">
              <EntryCard
                icon="recruiter"
                title="Recruiter Mode"
                description="Everything professional, in one window"
                onSelect={() => enterDesktop('recruiter')}
              />
              <EntryCard
                icon="sos"
                title="Continue as Guest"
                description="Explore the full system"
                onSelect={() => enterDesktop('guest')}
              />
            </div>
          </div>
        </main>

        <footer className="flex items-center justify-between gap-4 p-6 md:p-8">
          <div className="flex items-center gap-1">
            <IconButton
              label={soundEnabled ? 'Mute system sound' : 'Enable system sound'}
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </IconButton>

            <IconButton
              label={contrast === 'high' ? 'Use standard contrast' : 'Use high contrast'}
              onClick={() => setContrast(contrast === 'high' ? 'normal' : 'high')}
              aria-pressed={contrast === 'high'}
            >
              <Contrast size={16} />
            </IconButton>

            <IconButton
              label={motion === 'reduced' ? 'Allow animation' : 'Reduce animation'}
              onClick={() => setMotion(motion === 'reduced' ? 'system' : 'reduced')}
              aria-pressed={motion === 'reduced'}
            >
              <Accessibility size={16} />
            </IconButton>

            {/* Decorative: there is no network state to report, and pretending
                otherwise would be a lie told in an accessible name. */}
            <span className="text-disabled ml-1 flex items-center gap-1.5 text-[11px]">
              <Wifi size={14} aria-hidden="true" />
              Connected
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={restart}>
              Restart
            </Button>
            <IconButton label="Shut down" onClick={shutdown}>
              <Power size={16} />
            </IconButton>
          </div>
        </footer>
      </div>
    </div>
  );
}
