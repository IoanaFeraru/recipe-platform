import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/UI/Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-[var(--color-primary)]');
  });

  it('should render danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-[var(--color-danger)]');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={onClick}>Disabled</Button>);

    await user.click(screen.getByText('Disabled'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render as icon-only button', () => {
    render(<Button iconOnly>X</Button>);
    const button = screen.getByText('X');
    expect(button).toHaveClass('w-10');
    expect(button).toHaveClass('h-10');
  });

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });

  it('should support type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should render children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
