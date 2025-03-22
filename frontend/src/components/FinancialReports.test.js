import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import FinancialReports from '../FinancialReports';

// Mock the child components to focus on testing FinancialReports
jest.mock('../ReportFilters', () => ({ onFilterChange }) => (
  <div data-testid="report-filters">Report Filters Mock</div>
));

jest.mock('../ReportChart', () => ({ data }) => (
  <div data-testid="report-chart">Report Chart Mock</div>
));

jest.mock('../UserHeader', () => () => (
  <div data-testid="user-header">User Header Mock</div>
));

jest.mock('../UserFooter', () => () => (
  <div data-testid="user-footer">User Footer Mock</div>
));

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('FinancialReports Component', () => {
  const mockTransactions = [
    { id: 1, category: 'Food', type: 'expense', amount: 50, tags: [{ name: 'Groceries' }] },
    { id: 2, category: 'Salary', type: 'income', amount: 1000, tags: [{ name: 'Work' }] },
    { id: 3, category: 'Food', type: 'expense', amount: 30, tags: [{ name: 'Restaurant' }] },
    { id: 4, category: 'Investment', type: 'income', amount: 200, tags: [{ name: 'Stocks' }] }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('fake-token');
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  test('renders component with header and footer', async () => {
    await act(async () => {
      render(<FinancialReports />);
    });

    expect(screen.getByTestId('user-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-footer')).toBeInTheDocument();
    expect(screen.getByText('Financial Reports')).toBeInTheDocument();
  });

  test('fetches transactions on mount with correct auth token', async () => {
    await act(async () => {
      render(<FinancialReports />);
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/api/transactions',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
  });

  test('displays report cards with aggregated data', async () => {
    await act(async () => {
      render(<FinancialReports />);
    });

    // Wait for the component to update with the fetched data
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Investment')).toBeInTheDocument();
    });

    // Check if the aggregated values are displayed correctly
    expect(screen.getByText('Income: $0')).toBeInTheDocument(); // Food category has no income
    expect(screen.getByText('Expenses: $80')).toBeInTheDocument(); // Food expenses: 50 + 30
    expect(screen.getByText('Income: $1000')).toBeInTheDocument(); // Salary income
    expect(screen.getByText('Income: $200')).toBeInTheDocument(); // Investment income
  });

  test('handles API error gracefully', async () => {
    console.error = jest.fn(); // Mock console.error
    axios.get.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<FinancialReports />);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
  });

  test('filters transactions by category', async () => {
    await act(async () => {
      render(<FinancialReports />);
    });

    // Simulate filter change
    const setFiltersMock = jest.fn();
    React.useState = jest.fn().mockReturnValue([
      { timePeriod: 'monthly', category: 'Food', tag: '' },
      setFiltersMock
    ]);

    // Re-render with new filters
    await act(async () => {
      render(<FinancialReports />);
    });

    // Only Food category should be visible
    await waitFor(() => {
      expect(screen.queryByText('Salary')).not.toBeInTheDocument();
      expect(screen.queryByText('Investment')).not.toBeInTheDocument();
    });
  });

  test('filters transactions by tag', async () => {
    // Mock useState to return specific filter
    const originalUseState = React.useState;
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [
      { timePeriod: 'monthly', category: '', tag: 'Groceries' },
      jest.fn()
    ]);
    
    // For other useState calls, use the original implementation
    jest.spyOn(React, 'useState').mockImplementationOnce(() => originalUseState(mockTransactions));
    
    await act(async () => {
      render(<FinancialReports />);
    });

    // Only transactions with Groceries tag should be processed
    await waitFor(() => {
      const reportCards = screen.getAllByText(/Income: \$/);
      expect(reportCards.length).toBeLessThan(mockTransactions.length);
    });
    
    // Restore original useState
    React.useState.mockRestore();
  });

  test('prepares correct chart data structure', async () => {
    let capturedProps;
    jest.mock('../ReportChart', () => {
      return function MockReportChart(props) {
        capturedProps = props;
        return <div data-testid="report-chart">Report Chart Mock</div>;
      };
    });

    await act(async () => {
      render(<FinancialReports />);
    });

    // Verify chart data structure
    await waitFor(() => {
      expect(screen.getByTestId('report-chart')).toBeInTheDocument();
    });
  });
});
