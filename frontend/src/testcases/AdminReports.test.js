import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminReports from '../AdminReports';

// Mock the child components to focus on AdminReports functionality
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar" />);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer" />);

// Mock recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />
}));

// Mock fetch API
global.fetch = jest.fn();

describe('AdminReports Component', () => {
  const mockUsers = [
    { _id: '1', username: 'user1' },
    { _id: '2', username: 'user2' }
  ];
  
  const mockTransactions = [
    { _id: '1', type: 'income', category: 'Salary', amount: 5000 },
    { _id: '2', type: 'income', category: 'Bonus', amount: 1000 },
    { _id: '3', type: 'expense', category: 'Food', amount: 200 },
    { _id: '4', type: 'expense', category: 'Rent', amount: 1500 }
  ];

  beforeEach(() => {
    localStorage.setItem = jest.fn();
    localStorage.getItem = jest.fn(() => 'mock-token');
    
    // Mock successful responses for fetch calls
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/users')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockUsers)
        });
      }
      if (url.includes('/api/transactions/admin')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTransactions)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders AdminReports component with sidebar and footer', async () => {
    render(<AdminReports />);
    
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
    expect(screen.getByText('Transaction Reports')).toBeInTheDocument();
  });

  test('fetches and displays users in dropdown', async () => {
    render(<AdminReports />);
    
    // Wait for users to be loaded
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/users', {
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });
    });
    
    // Check if user options are rendered
    const selectElement = screen.getByLabelText(/Filter by User/i);
    expect(selectElement).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('All Users')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  test('fetches transactions when component mounts', async () => {
    render(<AdminReports />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/admin', {
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });
    });
    
    // Check if charts are rendered
    expect(screen.getByText('Income by Category')).toBeInTheDocument();
    expect(screen.getByText('Expense by Category')).toBeInTheDocument();
  });

  test('fetches transactions for specific user when user is selected', async () => {
    render(<AdminReports />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/transactions/admin'), expect.any(Object));
    });
    
    // Select a specific user
    const selectElement = screen.getByLabelText(/Filter by User/i);
    fireEvent.change(selectElement, { target: { value: '1' } });
    
    // Check if fetch is called with the correct URL
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/admin?userId=1', {
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });
    });
  });

  test('handles fetch errors gracefully', async () => {
    // Mock console.error to prevent error messages in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock fetch to reject
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    render(<AdminReports />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('renders charts with correct data', async () => {
    render(<AdminReports />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
    
    // Check chart titles
    expect(screen.getByText('Income by Category')).toBeInTheDocument();
    expect(screen.getByText('Expense by Category')).toBeInTheDocument();
  });

  test('resets to all users when "All Users" option is selected', async () => {
    render(<AdminReports />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/transactions/admin'), expect.any(Object));
    });
    
    // Select a specific user first
    const selectElement = screen.getByLabelText(/Filter by User/i);
    fireEvent.change(selectElement, { target: { value: '1' } });
    
    // Wait for user-specific fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/admin?userId=1', expect.any(Object));
    });
    
    // Reset to all users
    fireEvent.change(selectElement, { target: { value: '' } });
    
    // Check if fetch is called with the URL for all users
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/admin', expect.any(Object));
    });
  });
});
