import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AdminTransactions from '../AdminTransactions';

// Mock axios
jest.mock('axios');

// Mock child components
jest.mock('../AdminSidebar', () => () => <div data-testid="admin-sidebar">Admin Sidebar</div>);
jest.mock('../AdminFooter', () => () => <div data-testid="admin-footer">Admin Footer</div>);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AdminTransactions Component', () => {
  const mockTransactions = [
    {
      _id: '1',
      userId: { username: 'testuser1' },
      type: 'income',
      amount: 1000,
      category: 'Salary',
      date: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      userId: { username: 'testuser2' },
      type: 'expense',
      amount: 500,
      category: 'Food',
      date: '2023-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response for transactions
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  test('renders AdminTransactions component with sidebar and footer', async () => {
    render(<AdminTransactions />);
    
    // Check if main components are rendered
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Oversee Transactions')).toBeInTheDocument();
  });

  test('fetches and displays transactions on component mount', async () => {
    render(<AdminTransactions />);
    
    // Verify axios was called with correct parameters
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/api/transactions/admin',
      {
        headers: { Authorization: 'Bearer fake-token' }
      }
    );
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.getByText('testuser2')).toBeInTheDocument();
      expect(screen.getByText('income')).toBeInTheDocument();
      expect(screen.getByText('expense')).toBeInTheDocument();
      expect(screen.getByText('$1000')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
    });
  });

  test('handles transaction deletion correctly', async () => {
    axios.delete.mockResolvedValue({ data: { message: 'Transaction deleted' } });
    
    render(<AdminTransactions />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });
    
    // Find and click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify delete API was called with correct parameters
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:5000/api/transactions/1',
      {
        headers: { Authorization: 'Bearer fake-token' }
      }
    );
    
    // Verify transactions are fetched again after deletion
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  test('handles API error when fetching transactions', async () => {
    // Setup console.error mock to prevent actual errors in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching transactions:',
        expect.any(Error)
      );
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles API error when deleting transaction', async () => {
    // Setup console.error mock
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock successful get but failed delete
    axios.get.mockResolvedValue({ data: mockTransactions });
    axios.delete.mockRejectedValueOnce(new Error('Delete API error'));
    
    render(<AdminTransactions />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });
    
    // Find and click delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting transaction:',
        expect.any(Error)
      );
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('displays "Unknown User" when userId is missing', async () => {
    const transactionsWithMissingUser = [
      {
        _id: '3',
        // userId is missing
        type: 'expense',
        amount: 300,
        category: 'Entertainment',
        date: '2023-01-03T00:00:00.000Z'
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: transactionsWithMissingUser });
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getByText('Unknown User')).toBeInTheDocument();
    });
  });
});
