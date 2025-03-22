import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AdminTransactions from '../../components/AdminTransactions';

// Mock axios
jest.mock('axios');

// Mock components used in AdminTransactions
jest.mock('../../components/AdminSidebar', () => () => <div data-testid="admin-sidebar" />);
jest.mock('../../components/AdminFooter', () => () => <div data-testid="admin-footer" />);

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
      date: '2023-01-15T00:00:00.000Z'
    },
    {
      _id: '2',
      userId: { username: 'testuser2' },
      type: 'expense',
      amount: 50,
      category: 'Food',
      date: '2023-01-20T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response for fetching transactions
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  test('renders AdminTransactions component with sidebar and footer', async () => {
    render(<AdminTransactions />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Oversee Transactions')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/admin',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('displays transactions in the table', async () => {
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.getByText('testuser2')).toBeInTheDocument();
      expect(screen.getByText('$1000')).toBeInTheDocument();
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
  });

  test('handles error when fetching transactions fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('opens edit modal when edit button is clicked', async () => {
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Edit')[0]);
    
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('closes edit modal when cancel button is clicked', async () => {
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit Transaction')).not.toBeInTheDocument();
  });

  test('updates transaction when form is submitted', async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Edit')[0]);
    
    // Change amount in the form
    const amountInput = screen.getByLabelText('Amount:');
    fireEvent.change(amountInput, { target: { value: '2000' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/1',
        expect.objectContaining({
          _id: '1',
          amount: '2000'
        }),
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after update
    });
  });

  test('deletes transaction when delete button is clicked', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } });
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Delete')[0]).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Delete')[0]);
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/1',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after delete
    });
  });

  test('handles error when deleting transaction fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.delete.mockRejectedValueOnce(new Error('Delete error'));
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Delete')[0]).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Delete')[0]);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting transaction:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles error when updating transaction fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.put.mockRejectedValueOnce(new Error('Update error'));
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating transaction:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles transactions with unknown users', async () => {
    const transactionsWithUnknownUser = [
      {
        _id: '3',
        userId: null, // null userId
        type: 'expense',
        amount: 75,
        category: 'Utilities',
        date: '2023-01-25T00:00:00.000Z'
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: transactionsWithUnknownUser });
    
    render(<AdminTransactions />);
    
    await waitFor(() => {
      expect(screen.getByText('Unknown User')).toBeInTheDocument();
      expect(screen.getByText('$75')).toBeInTheDocument();
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
  });
});
