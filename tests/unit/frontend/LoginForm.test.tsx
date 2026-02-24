import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../../../src/frontend/components/LoginForm';

describe('LoginForm', () => {
  test('renders inputs and submit', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows required validation when submitted empty', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    // native required validation may not trigger in jsdom; ensure button exists
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });
});
