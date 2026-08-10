import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, Button, IconButton, TextField } from './index';

describe('Button', () => {
  it('renders as a real button element so keyboard activation works', () => {
    render(<Button>Open Terminal</Button>);
    expect(screen.getByRole('button', { name: 'Open Terminal' })).toBeInTheDocument();
  });

  it('activates on Enter without a keyboard handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Launch</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Launch' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Launch
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Launch' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to type="button" so it cannot submit a form by accident', () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
  });

  it('hides decorative icons from assistive technology', () => {
    render(<Button iconStart={<svg data-testid="icon" />}>Download</Button>);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('IconButton', () => {
  it('always exposes an accessible name', () => {
    render(
      <IconButton label="Close window">
        <svg />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Close window' })).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('carries a text label alongside the status colour', () => {
    render(
      <Badge tone="dev" dot>
        In Development
      </Badge>,
    );
    expect(screen.getByText('In Development')).toBeInTheDocument();
  });
});

describe('TextField', () => {
  it('associates the label with the control', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('links hint and error text through aria-describedby', () => {
    render(<TextField label="Email" hint="Work address preferred." error="Invalid email." />);

    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(describedBy).toHaveLength(2);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email.');
  });

  it('omits aria-describedby when there is nothing to describe', () => {
    render(<TextField label="Name" />);
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-describedby');
  });
});
