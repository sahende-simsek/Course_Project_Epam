import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../../../src/frontend/components/RegisterForm';

describe('RegisterForm', () => {
  test('renders inputs and submit', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});
