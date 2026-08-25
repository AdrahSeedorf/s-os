/**
 * Contact form validation.
 *
 * Deliberately one module, imported by both the form and the API route.
 *
 * The usual arrangement is client validation written for the user experience
 * and server validation written for safety, which drift apart until the form
 * accepts something the server rejects — and the visitor sees a generic
 * failure with no idea what they did wrong. Sharing the rules means the
 * message shown while typing is exactly the message the server would give.
 *
 * The server still validates. Client validation is a courtesy; it is not a
 * control, because anyone can post directly to the route.
 */

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /**
   * Honeypot. Hidden from people, irresistible to naive bots.
   *
   * A filled value means the submission is discarded — but the response is a
   * normal success, because telling a bot it was detected only teaches whoever
   * wrote it to try something else.
   */
  company?: string;
}

export type ContactField = 'name' | 'email' | 'subject' | 'message';

export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  name: { min: 1, max: 100 },
  email: { max: 200 },
  subject: { min: 0, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

/**
 * Pragmatic email check.
 *
 * Not RFC 5322 — a fully correct email regex is famously enormous and still
 * cannot tell you whether an address receives mail. This rejects the obvious
 * mistakes and lets everything else through, which is the right trade for a
 * contact form: a false rejection costs a real message.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

export function validateContact(payload: Partial<ContactPayload>): ContactErrors {
  const errors: ContactErrors = {};

  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const subject = (payload.subject ?? '').trim();
  const message = (payload.message ?? '').trim();

  if (name.length < LIMITS.name.min) {
    errors.name = 'Please enter your name.';
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;
  }

  if (email.length === 0) {
    errors.email = 'Please enter an email address.';
  } else if (email.length > LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    errors.email = 'That does not look like a valid email address.';
  }

  if (subject.length > LIMITS.subject.max) {
    errors.subject = `Please keep the subject under ${LIMITS.subject.max} characters.`;
  }

  if (message.length < LIMITS.message.min) {
    errors.message = `Please write at least ${LIMITS.message.min} characters.`;
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Please keep the message under ${LIMITS.message.max} characters.`;
  }

  return errors;
}

export function isValid(errors: ContactErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** True when the honeypot was filled — i.e. almost certainly not a person. */
export function looksAutomated(payload: Partial<ContactPayload>): boolean {
  return (payload.company ?? '').trim().length > 0;
}

/** Normalised payload, trimmed and with the honeypot dropped. */
export function normaliseContact(
  payload: Partial<ContactPayload>,
): Omit<ContactPayload, 'company'> {
  return {
    name: (payload.name ?? '').trim(),
    email: (payload.email ?? '').trim(),
    subject: (payload.subject ?? '').trim() || 'Message from S-OS',
    message: (payload.message ?? '').trim(),
  };
}
