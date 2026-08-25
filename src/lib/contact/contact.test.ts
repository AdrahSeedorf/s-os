import { beforeEach, describe, expect, it } from 'vitest';
import {
  LIMITS,
  isValid,
  looksAutomated,
  normaliseContact,
  validateContact,
} from './validation';
import { rateLimit, resetRateLimit } from './rateLimit';

const good = {
  name: 'Jane Recruiter',
  email: 'jane@company.com',
  subject: 'Internship opportunity',
  message: 'We have a graduate role open and your portfolio caught my eye.',
};

describe('validation', () => {
  it('accepts a complete message', () => {
    expect(isValid(validateContact(good))).toBe(true);
  });

  it('requires a name', () => {
    expect(validateContact({ ...good, name: '  ' }).name).toBeDefined();
  });

  it('requires an email', () => {
    expect(validateContact({ ...good, email: '' }).email).toBeDefined();
  });

  it('rejects obviously malformed addresses', () => {
    for (const email of ['nope', 'no@', '@nope.com', 'a b@c.com', 'a@b']) {
      expect(validateContact({ ...good, email }).email, email).toBeDefined();
    }
  });

  it('accepts ordinary addresses', () => {
    for (const email of ['a@b.co', 'first.last@company.com.au', 'first+tag@sub.example.org']) {
      expect(validateContact({ ...good, email }).email, email).toBeUndefined();
    }
  });

  it('treats the subject as optional', () => {
    expect(validateContact({ ...good, subject: '' }).subject).toBeUndefined();
  });

  it('requires a message of reasonable length', () => {
    expect(validateContact({ ...good, message: 'hi' }).message).toBeDefined();
  });

  it('rejects a message longer than the limit', () => {
    const message = 'x'.repeat(LIMITS.message.max + 1);
    expect(validateContact({ ...good, message }).message).toBeDefined();
  });

  it('ignores surrounding whitespace when measuring', () => {
    expect(
      validateContact({ ...good, message: `   ${'x'.repeat(9)}   ` }).message,
    ).toBeDefined();
  });

  it('reports every problem at once rather than one at a time', () => {
    const errors = validateContact({ name: '', email: 'nope', message: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name']);
  });
});

describe('honeypot', () => {
  it('flags a filled honeypot', () => {
    expect(looksAutomated({ ...good, company: 'Acme' })).toBe(true);
  });

  it('ignores an empty or whitespace honeypot', () => {
    expect(looksAutomated({ ...good, company: '' })).toBe(false);
    expect(looksAutomated({ ...good, company: '   ' })).toBe(false);
    expect(looksAutomated(good)).toBe(false);
  });
});

describe('normalisation', () => {
  it('trims every field', () => {
    const result = normaliseContact({ ...good, name: '  Jane  ', email: ' jane@company.com ' });
    expect(result.name).toBe('Jane');
    expect(result.email).toBe('jane@company.com');
  });

  it('supplies a default subject', () => {
    expect(normaliseContact({ ...good, subject: '' }).subject).toBe('Message from S-OS');
  });

  it('drops the honeypot from the delivered payload', () => {
    const result = normaliseContact({ ...good, company: 'bot' });
    expect('company' in result).toBe(false);
  });
});

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it('allows the first few requests', () => {
    expect(rateLimit('1.1.1.1').allowed).toBe(true);
    expect(rateLimit('1.1.1.1').allowed).toBe(true);
    expect(rateLimit('1.1.1.1').allowed).toBe(true);
  });

  it('blocks once the limit is reached', () => {
    for (let index = 0; index < 3; index += 1) rateLimit('1.1.1.1');

    const result = rateLimit('1.1.1.1');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('tracks callers separately', () => {
    for (let index = 0; index < 3; index += 1) rateLimit('1.1.1.1');
    expect(rateLimit('2.2.2.2').allowed).toBe(true);
  });

  it('lets a caller back in once the window passes', () => {
    const start = 1_000_000;
    for (let index = 0; index < 3; index += 1) rateLimit('1.1.1.1', start);

    expect(rateLimit('1.1.1.1', start).allowed).toBe(false);
    expect(rateLimit('1.1.1.1', start + 11 * 60 * 1000).allowed).toBe(true);
  });

  it('does not retain expired entries', () => {
    const start = 1_000_000;
    rateLimit('expired', start);

    // Any later call sweeps entries whose window has closed, so the map does
    // not grow forever on a long-lived instance.
    rateLimit('other', start + 11 * 60 * 1000);
    expect(rateLimit('expired', start + 11 * 60 * 1000).allowed).toBe(true);
  });
});
