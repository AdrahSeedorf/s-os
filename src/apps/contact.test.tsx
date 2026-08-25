import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactApp } from './ContactApp';
import { resetNotifications, useNotificationStore } from '@/stores/notificationStore';

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/^Name/), 'Jane Recruiter');
  await user.type(screen.getByLabelText(/^Email/), 'jane@company.com');
  await user.type(
    screen.getByLabelText(/^Message/),
    'We have a graduate role open and your portfolio caught my eye.',
  );
};

beforeEach(() => {
  resetNotifications();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Contact form', () => {
  it('validates before sending anything', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(<ContactApp />);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument();
  });

  it('clears a field error as soon as it is corrected', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn());

    render(<ContactApp />);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Name/), 'Jane');
    expect(screen.queryByText('Please enter your name.')).not.toBeInTheDocument();
  });

  it('posts a valid message and confirms', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchSpy);

    render(<ContactApp />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith('/api/contact', expect.anything()),
    );
    expect(await screen.findByText('Message sent.')).toBeInTheDocument();
  });

  it('raises a success notification', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );

    render(<ContactApp />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      const notifications = useNotificationStore.getState().notifications;
      expect(notifications[0]?.tone).toBe('success');
    });
  });

  it('surfaces a server failure rather than silently doing nothing', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'The contact service is not configured yet.' }),
      }),
    );

    render(<ContactApp />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('not configured');
  });

  it('shows server-side field errors on the right fields', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ errors: { email: 'That address was rejected.' } }),
      }),
    );

    render(<ContactApp />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('That address was rejected.')).toBeInTheDocument();
  });

  it('survives a network failure', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<ContactApp />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('network');
  });

  it('keeps the honeypot out of the accessibility tree', () => {
    // Hidden by position rather than display:none — some bots skip anything
    // display:none — but genuinely unreachable for keyboard and screen-reader
    // users, which is the part that matters.
    const { container } = render(<ContactApp />);
    const honeypot = container.querySelector('#sos-contact-company');

    expect(honeypot).not.toBeNull();
    expect(honeypot?.getAttribute('tabindex')).toBe('-1');
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();

    // queryByRole consults the accessibility tree and so respects aria-hidden;
    // queryByLabelText does not, and would find the field either way.
    expect(screen.queryByRole('textbox', { name: /company/i })).not.toBeInTheDocument();
  });

  it('offers a way to reach him even with no profile links registered', () => {
    render(<ContactApp />);
    expect(screen.getByText(/Profile links are being added/)).toBeInTheDocument();
  });
});
