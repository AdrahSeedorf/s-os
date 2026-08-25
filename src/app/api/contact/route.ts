import { NextResponse } from 'next/server';
import {
  isValid,
  looksAutomated,
  normaliseContact,
  validateContact,
  type ContactPayload,
} from '@/lib/contact/validation';
import { rateLimit } from '@/lib/contact/rateLimit';

/**
 * The contact endpoint — the only backend in S-OS V1.
 *
 * Delivery goes to Resend over `fetch` rather than through their SDK. The SDK
 * is perfectly good; it is also an extra dependency, an extra supply-chain
 * surface and an extra thing to keep updated, in exchange for wrapping one
 * HTTP POST. The brief said no unnecessary dependencies.
 *
 * The API key is read from the server environment and never leaves it. Nothing
 * in this file is reachable from the browser except by posting to the route.
 */

export const runtime = 'nodejs';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function clientKey(request: Request): string {
  // Vercel sets x-forwarded-for. The first entry is the client; the rest are
  // proxies, and trusting a later one would let a caller choose their own key.
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();

  return first && first.length > 0 ? first : 'unknown';
}

export async function POST(request: Request): Promise<Response> {
  let payload: Partial<ContactPayload>;

  try {
    payload = (await request.json()) as Partial<ContactPayload>;
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  // Discarded silently, with a normal success response. Telling a bot it was
  // detected only teaches whoever wrote it to try something else.
  if (looksAutomated(payload)) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateContact(payload);
  if (!isValid(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const limit = rateLimit(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const apiKey = process.env['RESEND_API_KEY'];
  const to = process.env['CONTACT_TO_EMAIL'];
  const from = process.env['CONTACT_FROM_EMAIL'];

  // Not configured yet. 503 rather than a fake success, so the form can tell
  // the visitor to use a direct link instead of leaving them believing a
  // message was sent that never existed.
  if (!apiKey || !to || !from) {
    return NextResponse.json(
      { error: 'The contact service is not configured yet.' },
      { status: 503 },
    );
  }

  const contact = normaliseContact(payload);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replying goes to the sender, not to the no-reply address the message
        // was technically sent from.
        reply_to: contact.email,
        subject: `[S-OS] ${contact.subject}`,
        text: [
          `From: ${contact.name} <${contact.email}>`,
          `Subject: ${contact.subject}`,
          '',
          contact.message,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      // The upstream body may contain account details; it is logged for the
      // owner and never returned to the caller.
      console.error('Resend rejected the message', response.status, await response.text());
      return NextResponse.json({ error: 'The message could not be sent.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (cause) {
    console.error('Contact delivery failed', cause);
    return NextResponse.json({ error: 'The message could not be sent.' }, { status: 502 });
  }
}

/** Anything other than POST is not a thing this endpoint does. */
export function GET(): Response {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
