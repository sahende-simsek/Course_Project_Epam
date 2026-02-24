import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginForm from '../../../src/frontend/components/LoginForm';

describe('LoginForm accessibility', () => {
  test('has accessible form elements', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /login-form/i })).toBeTruthy();
  });
});
