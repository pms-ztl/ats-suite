import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/status-badge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('normalizes underscores to spaces and title-cases', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('handles unknown status without crashing', () => {
    render(<StatusBadge status="something_unknown" />);
    expect(screen.getByText('Something Unknown')).toBeInTheDocument();
  });

  it('renders without crash for empty string', () => {
    const { container } = render(<StatusBadge status="" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
