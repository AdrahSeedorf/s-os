import type { Metadata } from 'next';
import { site } from '@/lib/config/site';
import { getProfile } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What S-OS collects, what it does not, and how long anything is kept. No cookies, no analytics, no tracking.',
  alternates: { canonical: `${site.url}/privacy` },
};

/**
 * The privacy page.
 *
 * Written from the code rather than from a template. Every claim here is
 * checkable against a specific file — the contact route, the rate limiter,
 * the preferences store — and that is the point: a privacy policy made of
 * boilerplate describes a site nobody built.
 *
 * It is short because there is genuinely little to say. That is worth stating
 * plainly rather than padding around.
 */
export default function PrivacyPage() {
  const profile = getProfile();
  const updated = 'October 2026';

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[26px] leading-tight font-semibold">Privacy</h1>
        <p className="text-secondary text-[14px] leading-relaxed">
          {site.name} sets no cookies, runs no analytics and embeds no third-party
          trackers. The only personal information it ever receives is what you
          type into the contact form, and only if you choose to send it.
        </p>
        <p className="text-muted text-[12px]">Last updated {updated}.</p>
      </header>

      <Section title="What the contact form collects">
        <p>
          If you send a message, the form submits three things: the name you
          enter, the email address you enter, and the message itself. The email
          address is used to reply to you and nothing else.
        </p>
        <p>
          The message is delivered by{' '}
          <Outbound href="https://resend.com/legal/privacy-policy">Resend</Outbound>, an
          email service, and arrives in a personal inbox. Resend processes the
          message in order to deliver it and is subject to its own privacy
          policy. The message is not stored in any database — {site.name} has no
          database.
        </p>
      </Section>

      <Section title="What happens to your IP address">
        <p>
          When a message is submitted, the server reads the IP address the
          request arrived from in order to limit how many messages can be sent
          in a short window. This is to stop automated abuse of the form.
        </p>
        <p>
          The address is held in the server&rsquo;s memory for ten minutes and
          then discarded. It is never written to a database, never written to a
          log file, and never attached to the message that reaches the inbox.
        </p>
      </Section>

      <Section title="What stays in your browser">
        <p>
          {site.name} remembers four preferences — whether sound is on, the
          volume, your motion preference and your contrast preference — using
          your browser&rsquo;s local storage. These never leave your device and
          are not readable by anyone else. Clearing site data removes them, and{' '}
          <strong className="text-primary font-medium">Settings → Restore defaults</strong>{' '}
          inside S-OS does the same.
        </p>
        <p>
          This is local storage rather than cookies, which means the values are
          never sent to a server with your requests. There is no cookie banner
          on this site because there are no cookies to consent to.
        </p>
      </Section>

      <Section title="Hosting">
        <p>
          The site is hosted on Vercel, which processes standard request data
          such as IP address and user agent in order to serve pages and protect
          its infrastructure. That processing is Vercel&rsquo;s and is covered
          by its own privacy policy. No analytics product is installed on top of
          it.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          If you have sent a message and would like it deleted, email{' '}
          {profile.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="text-accent-300 hover:underline"
            >
              {profile.email}
            </a>
          ) : (
            'the address on the contact page'
          )}{' '}
          and it will be removed from the inbox. Since nothing else is retained,
          there is nothing further to request.
        </p>
      </Section>

      <footer className="border-glass-border border-t pt-6">
        <p className="text-muted text-[12.5px] leading-relaxed">
          This page describes how this site behaves, as built. If any of it
          changes — an analytics tool, a form that stores submissions — this
          page changes first.
        </p>
      </footer>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      <div className="text-secondary flex flex-col gap-3 text-[13.5px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/** External links get the usual hardening; a privacy page that leaks a
 *  referrer would be a poor advertisement for itself. */
function Outbound({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-300 hover:underline"
    >
      {children}
    </a>
  );
}
