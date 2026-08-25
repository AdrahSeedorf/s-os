'use client';

import { useState, type FormEvent } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { Button, GlassPanel, TextAreaField, TextField } from '@/components/ui';
import { getProfile } from '@/lib/content';
import {
  isValid,
  validateContact,
  type ContactErrors,
  type ContactPayload,
} from '@/lib/contact/validation';
import { useNotificationStore } from '@/stores/notificationStore';
import { AppScreen, AppSection, ExternalAction } from './shared/AppLayout';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

const EMPTY: ContactPayload = { name: '', email: '', subject: '', message: '', company: '' };

/**
 * The Contact application.
 *
 * Uses the same validator as the API route, so the message shown while typing
 * is exactly what the server would say. The direct links are shown alongside
 * the form rather than behind it — if the form ever fails, the visitor should
 * not have to go looking for another way to reach him.
 */
export function ContactApp() {
  const profile = getProfile();
  const notify = useNotificationStore((state) => state.notify);

  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const set = (field: keyof ContactPayload, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear the error for a field as soon as it is edited. Correcting a
    // mistake and still being told about it is a small, constant irritation.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const found = validateContact(values);
    setErrors(found);
    if (!isValid(found)) return;

    setStatus('sending');
    setFailureMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setStatus('sent');
        setValues(EMPTY);
        notify({
          title: 'Message sent',
          description: 'Thanks — I will get back to you.',
          tone: 'success',
        });
        return;
      }

      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        errors?: ContactErrors;
      };

      if (body.errors) {
        setErrors(body.errors);
        setStatus('idle');
        return;
      }

      setStatus('failed');
      setFailureMessage(body.error ?? 'The message could not be sent.');
      notify({
        title: 'Message not sent',
        description: 'Use one of the direct links instead.',
        tone: 'error',
      });
    } catch {
      setStatus('failed');
      setFailureMessage('The network request failed.');
      notify({
        title: 'Message not sent',
        description: 'Check your connection, or use a direct link.',
        tone: 'error',
      });
    }
  };

  const hasDirectLinks = Boolean(profile.email ?? profile.github ?? profile.linkedin);

  return (
    <AppScreen>
      <header className="flex flex-col gap-1.5">
        <h2 className="text-[16px] font-semibold">Get in touch</h2>
        <p className="text-muted text-[12px]">
          Messages come straight to my inbox. I reply to everything that is not a recruiter
          template.
        </p>
      </header>

      {status === 'sent' ? (
        <GlassPanel className="border-status-stable/40 flex items-start gap-3 border p-4">
          <Check size={16} aria-hidden="true" className="text-status-stable mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-medium">Message sent.</p>
            <p className="text-muted mt-0.5 text-[12px]">
              Thanks for getting in touch — I will reply as soon as I can.
            </p>
          </div>
        </GlassPanel>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Name"
          value={values.name}
          onChange={(event) => set('name', event.target.value)}
          {...(errors.name === undefined ? {} : { error: errors.name })}
          required
        />

        <TextField
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => set('email', event.target.value)}
          {...(errors.email === undefined ? {} : { error: errors.email })}
          hint="So I have somewhere to reply."
          required
        />

        <TextField
          label="Subject"
          value={values.subject}
          onChange={(event) => set('subject', event.target.value)}
          {...(errors.subject === undefined ? {} : { error: errors.subject })}
        />

        <TextAreaField
          label="Message"
          rows={6}
          value={values.message}
          onChange={(event) => set('message', event.target.value)}
          {...(errors.message === undefined ? {} : { error: errors.message })}
          required
        />

        {/*
          Honeypot. Hidden from people by position rather than `display: none`,
          which some bots check for — and marked aria-hidden with tabIndex -1 so
          it is genuinely unreachable for anyone using a keyboard or a screen
          reader rather than merely invisible.
        */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px]">
          <label htmlFor="sos-contact-company">Company (leave this empty)</label>
          <input
            id="sos-contact-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company ?? ''}
            onChange={(event) => set('company', event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            iconStart={<Send size={14} />}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </Button>

          {status === 'failed' && failureMessage ? (
            <p role="alert" className="text-status-danger text-[12px]">
              {failureMessage}
            </p>
          ) : null}
        </div>
      </form>

      <AppSection title="Direct">
        {hasDirectLinks ? (
          <div className="flex flex-wrap items-center gap-2">
            {profile.email ? <CopyableEmail email={profile.email} /> : null}
            <ExternalAction href={profile.github} label="GitHub" />
            <ExternalAction href={profile.linkedin} label="LinkedIn" />
          </div>
        ) : (
          <p className="text-muted text-[12px]">
            Profile links are being added — the form above is the way to reach me for now.
          </p>
        )}
      </AppSection>
    </AppScreen>
  );
}

/**
 * Email address with a copy button.
 *
 * A `mailto:` link alone is a gamble — it opens whatever mail client the
 * machine thinks it has, which on a work computer is often nothing. Copying
 * always works.
 */
function CopyableEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const notify = useNotificationStore((state) => state.notify);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      notify({ title: 'Email address copied', tone: 'success', duration: 2500 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({ title: 'Could not copy', description: email, tone: 'error' });
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`mailto:${email}`}
        className="sos-glass hover:bg-glass-strong inline-flex h-9 items-center rounded-md px-3.5 font-mono text-[12.5px] transition-colors"
      >
        {email}
      </a>
      <Button
        size="sm"
        onClick={copy}
        iconStart={copied ? <Check size={13} /> : <Copy size={13} />}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
