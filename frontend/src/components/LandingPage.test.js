import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../LandingPage';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock components used in LandingPage
jest.mock('../Header', () => () => <div data-testid="header-component">Header</div>);
jest.mock('../UserFooter', () => () => <div data-testid="footer-component">Footer</div>);

describe('LandingPage Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  test('renders landing page with header and footer', () => {
    render(<LandingPage />);
    
    expect(screen.getByTestId('header-component')).toBeInTheDocument();
    expect(screen.getByText('Take Control of Your Finances')).toBeInTheDocument();
    expect(screen.getByText('Why Choose FinanceTrack?')).toBeInTheDocument();
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Track Expenses')).toBeInTheDocument();
    expect(screen.getByText('Manage Budgets')).toBeInTheDocument();
    expect(screen.getByText('Save Smarter')).toBeInTheDocument();
  });

  test('login form is hidden by default', () => {
    render(<LandingPage />);
    
    expect(screen.queryByText('Login to Your Account')).not.toBeInTheDocument();
  });

  test('clicking Get Started button shows login form', () => {
    render(<LandingPage />);
    
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('clicking Close button hides login form', () => {
    render(<LandingPage />);
    
    // First show the form
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    // Then close it
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Login to Your Account')).not.toBeInTheDocument();
  });

  test('handles input changes in login form', () => {
    render(<LandingPage />);
    
    // Show the form
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    // Get form inputs
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    // Change input values
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Check if values were updated
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login for regular user', async () => {
    // Mock successful login response
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        role: 'user'
      }
    });
    
    render(<LandingPage />);
    
    // Show the form
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    // Fill the form
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      // Check if axios was called with correct data
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        {
          email: 'user@example.com',
          password: 'password123',
        },
        {
          withCredentials: true,
        }
      );
      
      // Check if token was stored in localStorage
      expect(localStorage.getItem('token')).toBe('fake-token');
      
      // Check if navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/user-home');
    });
  });

  test('handles successful login for admin user', async () => {
    // Mock successful login response for admin
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'admin-token',
        role: 'admin'
      }
    });
    
    render(<LandingPage />);
    
    // Show the form
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    // Fill the form
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'adminpass' } });
    
    // Submit the form
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      // Check if navigation occurred to admin page
      expect(mockNavigate).toHaveBeenCalledWith('/admin-home');
    });
  });

  test('handles login error', async () => {
    // Mock error response
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    
    render(<LandingPage />);
    
    // Show the form
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    // Fill the form
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    // Submit the form
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles network error during login', async () => {
    // Mock network error
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    
    render(<LandingPage />);
    
    // Show the form
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    // Fill the form
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    
    // Submit the form
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      // Check if generic error message is displayed
      expect(screen.getByText('An error occurred during login.')).toBeInTheDocument();
    });
  });
});
