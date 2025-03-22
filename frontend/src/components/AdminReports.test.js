import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminReports from '../../components/AdminReports';
import { act } from 'react-dom/test-utils';

// Mock the recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar"></div>,
  XAxis: () => <div data-testid="x-axis"></div>,
  YAxis: () => <div data-testid="y-axis"></div>,
  CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell"></div>
}));

// Mock the sidebar and footer components
jest.mock('../../components/AdminSidebar', () => () => <div data-testid="admin-sidebar"></div>);
jest.mock('../../components/AdminFooter', () => () => <div data-testid="admin-footer"></div>);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch API
global.fetch = jest.fn();

describe('AdminReports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses for users and transactions
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/users')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { _id: 'user1', username: 'User One' },
            { _id: 'user2', username: 'User Two' }
          ])
        });
      } else if (url.includes('/api/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { _id: 'tx1', type: 'income', category: 'Salary', amount: 5000 },
            { _id: 'tx2', type: 'income', category: 'Bonus', amount: 1000 },
            { _id: 'tx3', type: 'expense', category: 'Food', amount: 300 },
            { _id: 'tx4', type: 'expense', category: 'Rent', amount: 1500 }
          ])
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders the component with initial state', async () => {
    await act(async () => {
      render(<AdminReports />);
    });

    // Check if main elements are rendered
    expect(screen.getByText('Transaction Reports')).toBeInTheDocument();
    expect(screen.getByText('Filter by User:')).toBeInTheDocument();
    expect(screen.getByText('Income by Category')).toBeInTheDocument();
    expect(screen.getByText('Expense by Category')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
  });

  test('fetches and displays users in dropdown', async () => {
    await act(async () => {
      render(<AdminReports />);
    });

    // Check if fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/users', {
      headers: {
        'Authorization': 'Bearer fake-token',
      },
    });

    // Check if users are displayed in dropdown
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
    
    // Check for "All Users" option
    expect(screen.getByText('All Users')).toBeInTheDocument();
    
    // Check for user options
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
  });

  test('fetches transactions for all users initially', async () => {
    await act(async () => {
      render(<AdminReports />);
    });

    // Check if fetch was called with correct URL for all users
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/admin', {
      headers: {
        'Authorization': 'Bearer fake-token',
      },
    });
  });

  test('fetches transactions for specific user when selected', async () => {
    await act(async () => {
      render(<AdminReports />);
    });

    // Select a specific user
    const dropdown = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(dropdown, { target: { value: 'user1' } });
    });

    // Check if fetch was called with correct URL for specific user
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/transactions/user/user1', {
      headers: {
        'Authorization': 'Bearer fake-token',
      },
    });
  });

  test('renders charts with transaction data', async () => {
    await act(async () => {
      render(<AdminReports />);
    });

    // Check if charts are rendered
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('handles error when fetching users', async () => {
    // Mock fetch to simulate error
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch users'))
    );

    console.error = jest.fn(); // Mock console.error to prevent test output noise

    await act(async () => {
      render(<AdminReports />);
    });

    // Check if error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching users:', 
      expect.any(Error)
    );
  });

  test('handles error when fetching transactions', async () => {
    // Mock fetch to succeed for users but fail for transactions
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/users')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { _id: 'user1', username: 'User One' }
          ])
        });
      } else if (url.includes('/api/transactions')) {
        return Promise.reject(new Error('Failed to fetch transactions'));
      }
      return Promise.reject(new Error('Not found'));
    });

    console.error = jest.fn(); // Mock console.error to prevent test output noise

    await act(async () => {
      render(<AdminReports />);
    });

    // Check if error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching transactions:', 
      expect.any(Error)
    );
  });

  test('correctly transforms transaction data for charts', async () => {
    // Mock specific transaction data
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/users')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ _id: 'user1', username: 'User One' }])
        });
      } else if (url.includes('/api/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { _id: 'tx1', type: 'income', category: 'Salary', amount: 3000 },
            { _id: 'tx2', type: 'income', category: 'Salary', amount: 2000 },
            { _id: 'tx3', type: 'expense', category: 'Food', amount: 500 },
            { _id: 'tx4', type: 'expense', category: 'Food', amount: 300 }
          ])
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    console.log = jest.fn(); // Mock console.log to capture the chart data

    await act(async () => {
      render(<AdminReports />);
    });

    // Check if data transformation logs show correct aggregation
    await waitFor(() => {
      // The income data should be aggregated by category
      expect(console.log).toHaveBeenCalledWith(
        'Income Chart Data:',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Salary', value: 5000 })
        ])
      );

      // The expense data should be aggregated by category
      expect(console.log).toHaveBeenCalledWith(
        'Expense Chart Data:',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Food', value: 800 })
        ])
      );
    });
  });
});
