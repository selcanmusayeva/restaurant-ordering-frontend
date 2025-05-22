import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '../Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Input helperText="This is a helper text" />);
    expect(screen.getByText('This is a helper text')).toBeInTheDocument();
    expect(screen.getByText('This is a helper text')).toHaveClass('text-gray-500');
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" />);
    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('renders with left and right icons', () => {
    const leftIcon = <span data-testid="left-icon">🔍</span>;
    const rightIcon = <span data-testid="right-icon">✓</span>;
    
    render(
      <Input 
        leftIcon={leftIcon} 
        rightIcon={rightIcon}
        placeholder="Search"
      />
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toHaveClass('pl-10');
  });

  it('handles fullWidth prop', () => {
    render(<Input fullWidth />);
    expect(screen.getByRole('textbox').parentElement?.parentElement).toHaveClass('w-full');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('generates unique id when not provided', () => {
    render(<Input label="Test Input" />);
    const input = screen.getByLabelText('Test Input');
    expect(input.id).toMatch(/^input-/);
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Test Input" />);
    const input = screen.getByLabelText('Test Input');
    expect(input.id).toBe('custom-id');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('handles required state', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });
}); 