import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TransactionManagement from '../TransactionManagement';

// Mock axios
jest.mock('axios');

// Mock child components
jest.mock('../UserHeader', () => () => <div data-testid="user-header">Header</div>);
jest.mock('../UserFooter', () => () => <div data-testid="user-footer">Footer</div>);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TransactionManagement Component', () => {
  const mockTransactions = [
    {
      _id: '1',
      type: 'expense',
      amount: 50,
      category: 'Food',
      tags: [{ name: 'lunch' }, { name: 'work' }],
      recurring: false,
      date: '2023-01-01T00:00:00.000Z',
      description: 'Lunch at work'
    },
    {
      _id: '2',
      type: 'income',
      amount: 1000,
      category: 'Salary',
      tags: [{ name: 'monthly' }, { name: 'work' }],
      recurring: true,
      recurrencePattern: 'monthly',
      endDate: '2023-12-31T00:00:00.000Z',
      date: '2023-01-15T00:00:00.000Z',
      description: 'Monthly salary'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful API response for fetching transactions
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  test('renders component with header and footer', async () => {
    render(<TransactionManagement />);
    
    expect(screen.getByTestId('user-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-footer')).toBeInTheDocument();
    expect(screen.getByText('Transaction Management')).toBeInTheDocument();
  });

  test('fetches and displays transactions on mount', async () => {
    render(<TransactionManagement />);
    
    // Verify axios was called with correct parameters
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/transactions', {
      headers: { Authorization: 'Bearer fake-token' }
    });
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });
    
    // Check transaction details are displayed
    expect(screen.getByText('Amount: $50')).toBeInTheDocument();
    expect(screen.getByText('Amount: $1000')).toBeInTheDocument();
    expect(screen.getByText('lunch')).toBeInTheDocument();
    expect(screen.getByText('monthly')).toBeInTheDocument();
  });

  test('filters transactions based on search term', async () => {
    render(<TransactionManagement />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search by tag...');
    fireEvent.change(searchInput, { target: { value: 'lunch' } });
    
    // Should show Food transaction but not Salary
    await waitFor(() => {
      expect(screen.getByText('Lunch at work')).toBeInTheDocument();
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument();
    });
  });

  test('handles form input changes correctly', async () => {
    render(<TransactionManagement />);
    
    // Change form inputs
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '75' } });
    fireEvent.change(screen.getByPlaceholderText('Tags (comma separated, e.g., vacation, work)'), 
      { target: { value: 'test,tag' } });
    
    // Select category
    const categorySelect = screen.getByDisplayValue('Select Category');
    fireEvent.change(categorySelect, { target: { value: 'Food' } });
    
    // Toggle recurring checkbox
    const recurringCheckbox = screen.getByLabelText('Recurring');
    fireEvent.click(recurringCheckbox);
    
    // Check if recurrence pattern selector appears
    expect(screen.getByDisplayValue('Daily')).toBeInTheDocument();
    
    // Select recurrence pattern
    const patternSelect = screen.getByDisplayValue('Daily');
    fireEvent.change(patternSelect, { target: { value: 'weekly' } });
    
    // Verify form state through UI elements
    expect(screen.getByPlaceholderText('Amount').value).toBe('75');
    expect(screen.getByDisplayValue('weekly')).toBeInTheDocument();
  });

  test('submits new transaction successfully', async () => {
    axios.post.mockResolvedValue({ data: { ...mockTransactions[0], _id: '3' } });
    
    render(<TransactionManagement />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '25' } });
    
    const categorySelect = screen.getByDisplayValue('Select Category');
    fireEvent.change(categorySelect, { target: { value: 'Food' } });
    
    fireEvent.change(screen.getByPlaceholderText('Description'), 
      { target: { value: 'Test transaction' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions',
        expect.objectContaining({
          amount: 25,
          category: 'Food',
          description: 'Test transaction'
        }),
        expect.any(Object)
      );
    });
    
    // Verify transactions are refreshed
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('edits transaction successfully', async () => {
    axios.put.mockResolvedValue({ data: { ...mockTransactions[0], amount: 75 } });
    
    render(<TransactionManagement />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    
    // Click edit button on first transaction
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify form is populated with transaction data
    expect(screen.getByPlaceholderText('Amount').value).toBe('50');
    
    // Change amount
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '75' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Update Transaction'));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/1',
        expect.objectContaining({
          amount: 75,
        }),
        expect.any(Object)
      );
    });
  });

  test('deletes transaction successfully', async () => {
    axios.delete.mockResolvedValue({ data: { success: true } });
    
    render(<TransactionManagement />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    
    // Click delete button on first transaction
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/transactions/1',
        expect.any(Object)
      );
    });
    
    // Verify transactions are refreshed
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('handles API errors gracefully', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<TransactionManagement />);
    
    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('cancels editing mode', async () => {
    render(<TransactionManagement />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    
    // Click edit button on first transaction
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify we're in edit mode
    expect(screen.getByText('Update Transaction')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify we're back to add mode
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
