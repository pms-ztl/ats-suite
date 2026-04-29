import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/shared/stat-card';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Users" value={1234} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders with size="md" using larger text', () => {
    const { container } = render(<StatCard label="Revenue" value="$50K" size="md" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50K')).toBeInTheDocument();
    // md size applies p-4 instead of p-3
    expect(container.firstChild).toHaveClass('p-4');
  });

  it('renders with change value', () => {
    render(<StatCard label="Growth" value="85%" change={12} />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });
});
