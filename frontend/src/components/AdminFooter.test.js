import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminFooter from '../components/AdminFooter';

describe('AdminFooter Component', () => {
  test('renders without crashing', () => {
    render(<AdminFooter />);
    // If the component renders without throwing an error, the test passes
  });

  test('displays copyright text', () => {
    render(<AdminFooter />);
    const copyrightElement = screen.getByText(/2025 Admin Panel. All rights reserved./i);
    expect(copyrightElement).toBeInTheDocument();
  });

  test('displays powered by text', () => {
    render(<AdminFooter />);
    const poweredByElement = screen.getByText(/Powered by Finance Track/i);
    expect(poweredByElement).toBeInTheDocument();
  });

  test('has the correct CSS class', () => {
    const { container } = render(<AdminFooter />);
    const footerElement = container.querySelector('footer');
    expect(footerElement).toHaveClass('admin-footer');
  });
});
