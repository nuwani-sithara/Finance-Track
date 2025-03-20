import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminHome from '../AdminHome';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Mock the dependencies
jest.mock('axios');
jest.mock('jwt-decode');
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar">Sidebar</div>);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer">Footer</div>);
jest.mock('../assets/background2.jpg', () => 'background-image-mock.jpg');
jest.mock('react-icons/fa', () => ({
  FaUsers: () => <div data-testid="icon-users">Users Icon</div>,
  FaMoneyCheckAlt: () => <div data-testid="icon-money">Money Icon</div>,
  FaChartLine: () => <div data-testid="icon-chart">Chart Icon</div>,
  FaListAlt: () => <div data-testid="icon-list">List Icon</div>,
}));

describe('AdminHome Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'fake-token');
  });

  test('renders AdminHome component with default username when no token exists', async () => {
    // Mock localStorage to return null for token
    Storage.prototype.getItem = jest.fn(() => null);
    
    render(<AdminHome />);
    
    // Check if the component renders with default username
    expect(screen.getByText(/Hi, user!/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome back to your dashboard/i)).toBeInTheDocument();
  });

  test('renders AdminHome component with username from API', async () => {
    // Mock JWT decode
    jwtDecode.mockReturnValue({ id: '123' });
    
    // Mock axios response
    axios.get.mockResolvedValue({
      data: { username: 'TestAdmin' }
    });
    
    render(<AdminHome />);
    
    // Initially should show default
    expect(screen.getByText(/Hi, user!/i)).toBeInTheDocument();
    
    // After API call resolves, should show the username
    await waitFor(() => {
      expect(screen.getByText(/Hi, TestAdmin!/i)).toBeInTheDocument();
    });
    
    // Verify API was called with correct parameters
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/api/users/123',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
  });

  test('handles API error gracefully', async () => {
    // Mock JWT decode
    jwtDecode.mockReturnValue({ id: '123' });
    
    // Mock axios to throw an error
    axios.get.mockRejectedValue(new Error('API Error'));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AdminHome />);
    
    // Should still render with default username
    await waitFor(() => {
      expect(screen.getByText(/Hi, user!/i)).toBeInTheDocument();
    });
    
    // Should log the error
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching user details:',
      expect.any(Error)
    );
  });

  test('renders all dashboard feature cards', () => {
    render(<AdminHome />);
    
    // Check if all feature cards are rendered
    expect(screen.getByText(/Manage Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Categories/i)).toBeInTheDocument();
    
    // Check if icons are rendered
    expect(screen.getByTestId('icon-users')).toBeInTheDocument();
    expect(screen.getByTestId('icon-money')).toBeInTheDocument();
    expect(screen.getByTestId('icon-chart')).toBeInTheDocument();
    expect(screen.getByTestId('icon-list')).toBeInTheDocument();
  });

  test('renders sidebar and footer components', () => {
    render(<AdminHome />);
    
    // Check if sidebar and footer are rendered
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
  });

  test('renders background image', () => {
    render(<AdminHome />);
    
    // Check if the background image is rendered
    const image = screen.getByAltText('Card');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'background-image-mock.jpg');
    expect(image).toHaveClass('card-image');
  });
});
