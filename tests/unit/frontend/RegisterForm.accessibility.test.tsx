import React from 'react';
import { render, screen } from '@testing-library/react';
import RegisterForm from '../../../src/frontend/components/RegisterForm';

describe('RegisterForm accessibility', () => {
  test('renders form with labels', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
