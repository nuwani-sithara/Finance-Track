import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHome from '../components/AdminUsers';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock components
jest.mock('../components/AdminSidebar', () => () => <div data-testid="admin-sidebar">Admin Sidebar</div>);
jest.mock('../components/AdminFooter', () => () => <div data-testid="admin-footer">Admin Footer</div>);

describe('AdminHome Component', () => {
  const mockNavigate = jest.fn();
  const mockUsers = [
    { _id: '1', username: 'user1', email: 'user1@example.com', role: 'user' },
    { _id: '2', username: 'admin1', email: 'admin1@example.com', role: 'admin' },
  ];
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.setItem('token', 'fake-token');
    
    // Mock successful API responses
    axios.get.mockResolvedValue({ data: mockUsers });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  test('renders the admin dashboard with sidebar and footer', async () => {
    render(<AdminHome />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
  });
  
  test('fetches and displays users on initial load', async () => {
    render(<AdminHome />);
    
    // Verify axios was called with correct parameters
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/users', {
      headers: { Authorization: 'Bearer fake-token' }
    });
    
    // Wait for users to be displayed
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('admin1')).toBeInTheDocument();
    });
  });
  
  test('opens edit form when edit button is clicked', async () => {
    render(<AdminHome />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Find and click the first edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if edit form is displayed
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user1@example.com')).toBeInTheDocument();
  });
  
  test('updates user when edit form is submitted', async () => {
    render(<AdminHome />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Modify user data
    const usernameInput = screen.getByDisplayValue('user1');
    fireEvent.change(usernameInput, { target: { value: 'updatedUser1' } });
    
    // Submit form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        expect.objectContaining({ username: 'updatedUser1' }),
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
    
    // Verify users are fetched again after update
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
  
  test('deletes user when delete button is clicked', async () => {
    render(<AdminHome />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Find and click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
    
    // Verify users are fetched again after deletion
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
  
  test('handles API error when fetching users', async () => {
    // Mock API error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch users'));
    
    render(<AdminHome />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  test('handles API error when deleting user', async () => {
    // Setup successful initial load
    render(<AdminHome />);
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Mock API error for delete
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete user'));
    
    // Find and click delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  test('handles API error when updating user', async () => {
    // Setup successful initial load
    render(<AdminHome />);
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Mock API error for update
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.put.mockRejectedValueOnce(new Error('Failed to update user'));
    
    // Submit form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  test('closes edit form when cancel button is clicked', async () => {
    render(<AdminHome />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify form is open
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Verify form is closed
    await waitFor(() => {
      expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
    });
  });
  
  test('changes role in edit form', async () => {
    render(<AdminHome />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    
    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Change role
    const roleSelect = screen.getByDisplayValue('user');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    
    // Submit form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Verify API call with updated role
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        expect.objectContaining({ role: 'admin' }),
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });
});
