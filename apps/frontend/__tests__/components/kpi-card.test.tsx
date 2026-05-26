import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  ReferenceDot: () => null,
}));

import { KPICard } from '@/components/shared/kpi-card';

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="Open Positions" value={42} />);
    expect(screen.getByText('Open Positions')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders positive trend', () => {
    render(<KPICard label="Hires" value={100} change={15} />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    render(<KPICard label="Time to Fill" value="32 days" change={-8} />);
    expect(screen.getByText('-8%')).toBeInTheDocument();
  });
});
