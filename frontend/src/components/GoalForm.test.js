import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import GoalForm from '../GoalForm';

// Mock the modules
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GoalForm Component', () => {
  const mockNavigate = jest.fn();
  const mockToken = 'test-token';
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: null });
    localStorage.getItem.mockReturnValue(mockToken);
    axios.post.mockResolvedValue({ data: {} });
    axios.put.mockResolvedValue({ data: {} });
    axios.get.mockResolvedValue({ 
      data: {
        goalName: 'Test Goal',
        targetAmount: 1000,
        currentAmount: 500,
        deadline: '2023-12-31'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders create goal form correctly', () => {
    render(<GoalForm />);
    
    expect(screen.getByText('Create Goal')).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Amount:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Amount:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deadline:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Goal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /My Goals/i })).toBeInTheDocument();
  });

  test('renders edit goal form and loads goal data', async () => {
    useParams.mockReturnValue({ id: '123' });
    
    render(<GoalForm />);
    
    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/goals/123', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Goal Name:/i).value).toBe('Test Goal');
      expect(screen.getByLabelText(/Target Amount:/i).value).toBe('1000');
      expect(screen.getByLabelText(/Current Amount:/i).value).toBe('500');
      expect(screen.getByLabelText(/Deadline:/i).value).toBe('2023-12-31');
    });
  });

  test('handles input changes correctly', () => {
    render(<GoalForm />);
    
    const nameInput = screen.getByLabelText(/Goal Name:/i);
    const targetInput = screen.getByLabelText(/Target Amount:/i);
    const currentInput = screen.getByLabelText(/Current Amount:/i);
    const deadlineInput = screen.getByLabelText(/Deadline:/i);
    
    fireEvent.change(nameInput, { target: { value: 'New Goal' } });
    fireEvent.change(targetInput, { target: { value: '2000' } });
    fireEvent.change(currentInput, { target: { value: '1000' } });
    fireEvent.change(deadlineInput, { target: { value: '2024-01-01' } });
    
    expect(nameInput.value).toBe('New Goal');
    expect(targetInput.value).toBe('2000');
    expect(currentInput.value).toBe('1000');
    expect(deadlineInput.value).toBe('2024-01-01');
  });

  test('submits form to create a new goal', async () => {
    render(<GoalForm />);
    
    const nameInput = screen.getByLabelText(/Goal Name:/i);
    const targetInput = screen.getByLabelText(/Target Amount:/i);
    const currentInput = screen.getByLabelText(/Current Amount:/i);
    const deadlineInput = screen.getByLabelText(/Deadline:/i);
    const submitButton = screen.getByRole('button', { name: /Create Goal/i });
    
    fireEvent.change(nameInput, { target: { value: 'New Goal' } });
    fireEvent.change(targetInput, { target: { value: '2000' } });
    fireEvent.change(currentInput, { target: { value: '1000' } });
    fireEvent.change(deadlineInput, { target: { value: '2024-01-01' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/goals',
        {
          goalName: 'New Goal',
          targetAmount: '2000',
          currentAmount: '1000',
          deadline: '2024-01-01'
        },
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/goals-list');
    });
  });

  test('submits form to update an existing goal', async () => {
    useParams.mockReturnValue({ id: '123' });
    
    render(<GoalForm />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Goal Name:/i).value).toBe('Test Goal');
    });
    
    const nameInput = screen.getByLabelText(/Goal Name:/i);
    const submitButton = screen.getByRole('button', { name: /Update Goal/i });
    
    fireEvent.change(nameInput, { target: { value: 'Updated Goal' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/goals/123',
        expect.objectContaining({
          goalName: 'Updated Goal',
        }),
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/goals-list');
    });
  });

  test('navigates to goals list when "My Goals" button is clicked', () => {
    render(<GoalForm />);
    
    const myGoalsButton = screen.getByRole('button', { name: /My Goals/i });
    fireEvent.click(myGoalsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/goals-list');
  });

  test('handles error when fetching goal data', async () => {
    useParams.mockReturnValue({ id: '123' });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<GoalForm />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching goal:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles error when submitting form', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValueOnce(new Error('Failed to save'));
    
    render(<GoalForm />);
    
    const submitButton = screen.getByRole('button', { name: /Create Goal/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving goal:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });
});
