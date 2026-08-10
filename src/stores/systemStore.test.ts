import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_CREDENTIALS, resetSystemStore, useSystemStore } from './systemStore';
import { BOOT_BUDGET_MS, QUICK_BOOT_BUDGET_MS, bootLines } from '@/os/boot/bootSequence';

const state = () => useSystemStore.getState();

beforeEach(() => {
  resetSystemStore();
});

describe('session lifecycle', () => {
  it('starts powered off', () => {
    expect(state().phase).toBe('off');
    expect(state().session).toBeNull();
  });

  it('runs off → booting → login → desktop', () => {
    state().powerOn();
    expect(state().phase).toBe('booting');

    state().completeBoot();
    expect(state().phase).toBe('login');

    state().enterDesktop('guest');
    expect(state().phase).toBe('desktop');
    expect(state().session).toBe('guest');
  });

  it('shortens the boot for returning visitors', () => {
    state().powerOn({ quick: true });
    expect(state().quickBoot).toBe(true);
  });

  it('returns to login on log off, keeping the system on', () => {
    state().powerOn();
    state().completeBoot();
    state().enterDesktop('guest');
    state().logOff();

    expect(state().phase).toBe('login');
    expect(state().session).toBeNull();
  });

  it('restarts into a shortened boot rather than the full sequence', () => {
    state().powerOn();
    state().completeBoot();
    state().enterDesktop('demo');
    state().restart();

    expect(state().phase).toBe('booting');
    expect(state().quickBoot).toBe(true);
    expect(state().session).toBeNull();
  });

  it('runs desktop → shutting down → off', () => {
    state().powerOn();
    state().completeBoot();
    state().enterDesktop('guest');

    state().shutdown();
    expect(state().phase).toBe('shutting-down');

    state().completeShutdown();
    expect(state().phase).toBe('off');
  });
});

describe('guarded transitions', () => {
  it('ignores completeBoot unless actually booting', () => {
    state().completeBoot();
    expect(state().phase).toBe('off');
  });

  it('ignores completeShutdown unless actually shutting down', () => {
    state().powerOn();
    state().completeShutdown();
    expect(state().phase).toBe('booting');
  });

  it('skips boot straight to login', () => {
    state().powerOn();
    state().skipBoot();
    expect(state().phase).toBe('login');
  });

  it('does not let skipBoot drag a running desktop back to login', () => {
    state().powerOn();
    state().completeBoot();
    state().enterDesktop('guest');

    state().skipBoot();
    expect(state().phase).toBe('desktop');
  });
});

describe('entry paths', () => {
  it('accepts the demo credentials', () => {
    state().powerOn();
    state().completeBoot();

    const result = state().attemptLogin(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password);

    expect(result).toBe(true);
    expect(state().phase).toBe('desktop');
    expect(state().session).toBe('demo');
    expect(state().loginError).toBeNull();
  });

  it('is forgiving about username case and whitespace', () => {
    state().powerOn();
    state().completeBoot();
    expect(state().attemptLogin('  GUEST ', DEMO_CREDENTIALS.password)).toBe(true);
  });

  it('reports a wrong password without leaving the login screen', () => {
    state().powerOn();
    state().completeBoot();

    const result = state().attemptLogin(DEMO_CREDENTIALS.username, 'wrong');

    expect(result).toBe(false);
    expect(state().phase).toBe('login');
    expect(state().loginError).not.toBeNull();
  });

  it('clears the error once the visitor edits the form', () => {
    state().attemptLogin('nobody', 'nothing');
    expect(state().loginError).not.toBeNull();

    state().clearLoginError();
    expect(state().loginError).toBeNull();
  });

  it('queues Recruiter Mode when entered by that route', () => {
    state().enterDesktop('recruiter');
    expect(state().pendingAppId).toBe('recruiter');
  });

  it('does not queue an app for an ordinary guest', () => {
    state().enterDesktop('guest');
    expect(state().pendingAppId).toBeNull();
  });

  it('queues a deep-linked app', () => {
    state().enterDesktop('guest', { appId: 'hotel-manager' });
    expect(state().pendingAppId).toBe('hotel-manager');
  });

  it('hands the pending app over exactly once', () => {
    state().enterDesktop('recruiter');

    expect(state().consumePendingApp()).toBe('recruiter');
    expect(state().consumePendingApp()).toBeNull();
  });
});

describe('boot sequence budget', () => {
  it('stays within the 2.5 second budget', () => {
    expect(BOOT_BUDGET_MS).toBeLessThanOrEqual(2500);
  });

  it('shows every line before the sequence ends', () => {
    for (const line of bootLines) {
      expect(line.at).toBeLessThan(BOOT_BUDGET_MS);
    }
  });

  it('reveals lines in order', () => {
    const timings = bootLines.map((line) => line.at);
    expect(timings).toEqual([...timings].sort((a, b) => a - b));
  });

  it('makes the quick boot substantially shorter', () => {
    expect(QUICK_BOOT_BUDGET_MS).toBeLessThan(BOOT_BUDGET_MS / 2);
  });
});
