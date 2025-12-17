import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with default size', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should have aria-label for accessibility', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label');
  });
});
