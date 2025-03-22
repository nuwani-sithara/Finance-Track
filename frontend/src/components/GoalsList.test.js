import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoalsList from '../GoalsList';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock the UserHeader and UserFooter components
jest.mock('../UserHeader', () => () => <div data-testid="user-header">Header</div>);
jest.mock('../UserFooter', () => () => <div data-testid="user-footer">Footer</div>);

describe('GoalsList Component', () => {
  const mockGoals = [
    {
      _id: '1',
      goalName: 'Buy a Car',
      targetAmount: 20000,
      currentAmount: 5000,
      deadline: '2023-12-31T00:00:00.000Z',
    },
    {
      _id: '2',
      goalName: 'Vacation',
      targetAmount: 5000,
      currentAmount: 2500,
      deadline: '2023-10-15T00:00:00.000Z',
    },
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup localStorage mock
    Storage.prototype.getItem = jest.fn(() => 'fake-token');
    
    // Setup useNavigate mock
    useNavigate.mockReturnValue(mockNavigate);
    
    // Setup axios mock for successful get request
    axios.get.mockResolvedValue({ data: mockGoals });
  });

  test('renders the component with header and footer', async () => {
    render(<GoalsList />);
    
    expect(screen.getByTestId('user-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-footer')).toBeInTheDocument();
    expect(screen.getByText('My Goals')).toBeInTheDocument();
  });

  test('fetches and displays goals', async () => {
    render(<GoalsList />);
    
    // Wait for the goals to be displayed
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/goals', {
        headers: {
          Authorization: 'Bearer fake-token',
        },
      });
      
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
      expect(screen.getByText('Target Amount: $20000')).toBeInTheDocument();
      expect(screen.getByText('Vacation')).toBeInTheDocument();
    });
  });

  test('handles API error when fetching goals', async () => {
    // Setup axios to reject the request
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<GoalsList />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching goals:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('deletes a goal when delete button is clicked', async () => {
    axios.delete.mockResolvedValueOnce({});
    
    render(<GoalsList />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
    
    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/api/goals/1', {
        headers: {
          Authorization: 'Bearer fake-token',
        },
      });
    });
  });

  test('opens edit modal when edit button is clicked', async () => {
    render(<GoalsList />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
    
    // Find all edit buttons and click the first one
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if modal is open
    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Buy a Car')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20000')).toBeInTheDocument();
  });

  test('updates a goal when edit form is submitted', async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        ...mockGoals[0],
        goalName: 'Updated Goal',
        targetAmount: 25000,
      },
    });
    
    render(<GoalsList />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
    
    // Open edit modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update form fields
    const goalNameInput = screen.getByLabelText(/Goal Name:/i);
    fireEvent.change(goalNameInput, { target: { value: 'Updated Goal' } });
    
    const targetAmountInput = screen.getByLabelText(/Target Amount:/i);
    fireEvent.change(targetAmountInput, { target: { value: '25000' } });
    
    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/goals/1',
        expect.objectContaining({
          _id: '1',
          goalName: 'Updated Goal',
          targetAmount: '25000',
        }),
        {
          headers: {
            Authorization: 'Bearer fake-token',
          },
        }
      );
    });
  });

  test('closes modal when cancel button is clicked', async () => {
    render(<GoalsList />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
    
    // Open edit modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if modal is open
    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Edit Goal')).not.toBeInTheDocument();
    });
  });

  test('navigates to goal form when Make Goals button is clicked', async () => {
    render(<GoalsList />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
    
    // Click Make Goals button
    const makeGoalsButton = screen.getByText('Make Goals');
    fireEvent.click(makeGoalsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/goal-form');
  });

  test('displays progress bar with correct width', async () => {
    render(<GoalsList />);
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Buy a Car')).toBeInTheDocument();
    });
    
    // Find progress bars
    const progressBars = document.querySelectorAll('.progress');
    
    // First goal has 5000/20000 = 25% progress
    expect(progressBars[0]).toHaveStyle('width: 25%');
    
    // Second goal has 2500/5000 = 50% progress
    expect(progressBars[1]).toHaveStyle('width: 50%');
  });
});
