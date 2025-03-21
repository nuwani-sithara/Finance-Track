import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AdminCategoryManagement from '../components/AdminCategoryManagement';

// Mock the child components to focus on testing AdminCategoryManagement
jest.mock('../AdminSidebar', () => () => null);
jest.mock('../AdminFooter', () => () => null);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AdminCategoryManagement Component', () => {
  let mockAxios;
  
  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const mockCategories = [
    { _id: '1', name: 'Electronics', color: '#FF0000' },
    { _id: '2', name: 'Books', color: '#00FF00' }
  ];

  test('renders component with sidebar and footer', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    
    render(<AdminCategoryManagement />);
    
    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-footer')).toBeInTheDocument();
  });

  test('fetches and displays categories on load', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });
  });

  test('handles API error when fetching categories', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAxios.onGet('http://localhost:5000/api/categories').reply(500, { message: 'Server error' });
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('adds a new category successfully', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    mockAxios.onPost('http://localhost:5000/api/categories').reply(201, { 
      _id: '3', 
      name: 'Clothing', 
      color: '#0000FF' 
    });
    
    render(<AdminCategoryManagement />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Category Name/i), {
      target: { value: 'Clothing' }
    });
    
    fireEvent.change(screen.getByLabelText(/Category Color/i), {
      target: { value: '#0000FF' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Category'));
    
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({
        name: 'Clothing',
        color: '#0000FF'
      });
    });
  });

  test('edits an existing category', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    mockAxios.onPut('http://localhost:5000/api/categories/1').reply(200, {
      _id: '1',
      name: 'Updated Electronics',
      color: '#FF0000'
    });
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    
    // Click edit button on first category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Form should be populated with category data
    expect(screen.getByLabelText(/Category Name/i).value).toBe('Electronics');
    
    // Update the name
    fireEvent.change(screen.getByLabelText(/Category Name/i), {
      target: { value: 'Updated Electronics' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Category'));
    
    await waitFor(() => {
      expect(mockAxios.history.put.length).toBe(1);
      expect(JSON.parse(mockAxios.history.put[0].data)).toEqual({
        name: 'Updated Electronics',
        color: '#FF0000'
      });
    });
  });

  test('cancels editing a category', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    
    // Click edit button on first category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Form should be populated with category data
    expect(screen.getByLabelText(/Category Name/i).value).toBe('Electronics');
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Form should be reset
    expect(screen.getByLabelText(/Category Name/i).value).toBe('');
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  test('deletes a category', async () => {
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    mockAxios.onDelete('http://localhost:5000/api/categories/1').reply(200, {});
    
    render(<AdminCategoryManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    
    // Click delete button on first category
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockAxios.history.delete.length).toBe(1);
      expect(mockAxios.history.delete[0].url).toBe('http://localhost:5000/api/categories/1');
    });
  });

  test('handles API error when adding a category', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAxios.onGet('http://localhost:5000/api/categories').reply(200, mockCategories);
    mockAxios.onPost('http://localhost:5000/api/categories').reply(500, { message: 'Server error' });
    
    render(<AdminCategoryManagement />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Category Name/i), {
      target: { value: 'Clothing' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Category'));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
});
