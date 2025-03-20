import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import AdminHome from '../AdminUsers';

// Mock axios
jest.mock('axios');

// Mock react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AdminHome Component', () => {
  const mockUsers = [
    { _id: '1', username: 'user1', email: 'user1@example.com', role: 'user' },
    { _id: '2', username: 'admin1', email: 'admin1@example.com', role: 'admin' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    axios.get.mockResolvedValue({ data: mockUsers });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  test('renders the admin dashboard with user table', async () => {
    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Check if the component renders correctly
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();

    // Wait for the users to be loaded
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/users',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });

    // Check if users are displayed in the table
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('admin1')).toBeInTheDocument();
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Find and click the edit button for the first user
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check if edit form is displayed
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    
    // Check if form fields are populated with user data
    const usernameInput = screen.getByLabelText(/Username:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    
    expect(usernameInput).toHaveValue('user1');
    expect(emailInput).toHaveValue('user1@example.com');
  });

  test('submits edit form with updated user data', async () => {
    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Modify user data
    const usernameInput = screen.getByLabelText(/Username:/i);
    fireEvent.change(usernameInput, { target: { value: 'updatedUser1' } });

    // Submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check if API was called with updated data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        expect.objectContaining({ username: 'updatedUser1' }),
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });

    // Check if users are fetched again after update
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  test('deletes a user when delete button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Find and click the delete button for the first user
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Check if API was called to delete the user
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });

    // Check if users are fetched again after deletion
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  test('closes edit form when cancel button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check if edit form is displayed
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Check if edit form is closed
    await waitFor(() => {
      expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
    });
  });

  test('handles API error when fetching users', async () => {
    // Mock API error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch users'));

    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Check if error is logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles API error when deleting a user', async () => {
    // First render with successful get
    axios.get.mockResolvedValueOnce({ data: mockUsers });
    // Then mock delete error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete user'));

    render(
      <BrowserRouter>
        <AdminHome />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Find and click the delete button for the first user
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Check if error is logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
