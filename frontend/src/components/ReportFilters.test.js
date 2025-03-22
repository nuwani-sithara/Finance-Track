import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportFilters from '../ReportFilters';

describe('ReportFilters Component', () => {
  test('renders all filter inputs and button', () => {
    render(<ReportFilters onFilterChange={() => {}} />);
    
    // Check if all elements are rendered
    expect(screen.getByLabelText(/Time Period:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tag:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply Filters/i })).toBeInTheDocument();
  });

  test('has correct default values', () => {
    render(<ReportFilters onFilterChange={() => {}} />);
    
    // Check default values
    expect(screen.getByLabelText(/Time Period:/i)).toHaveValue('monthly');
    expect(screen.getByLabelText(/Category:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Tag:/i)).toHaveValue('');
  });

  test('updates state when inputs change', () => {
    render(<ReportFilters onFilterChange={() => {}} />);
    
    // Change time period
    fireEvent.change(screen.getByLabelText(/Time Period:/i), { target: { value: 'weekly' } });
    expect(screen.getByLabelText(/Time Period:/i)).toHaveValue('weekly');
    
    // Change category
    fireEvent.change(screen.getByLabelText(/Category:/i), { target: { value: 'Food' } });
    expect(screen.getByLabelText(/Category:/i)).toHaveValue('Food');
    
    // Change tag
    fireEvent.change(screen.getByLabelText(/Tag:/i), { target: { value: 'Groceries' } });
    expect(screen.getByLabelText(/Tag:/i)).toHaveValue('Groceries');
  });

  test('calls onFilterChange with correct parameters when form is submitted', () => {
    const mockOnFilterChange = jest.fn();
    render(<ReportFilters onFilterChange={mockOnFilterChange} />);
    
    // Change values
    fireEvent.change(screen.getByLabelText(/Time Period:/i), { target: { value: 'yearly' } });
    fireEvent.change(screen.getByLabelText(/Category:/i), { target: { value: 'Entertainment' } });
    fireEvent.change(screen.getByLabelText(/Tag:/i), { target: { value: 'Movies' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Apply Filters/i }));
    
    // Check if onFilterChange was called with the correct parameters
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      timePeriod: 'yearly',
      category: 'Entertainment',
      tag: 'Movies'
    });
  });

  test('prevents default form submission behavior', () => {
    const mockOnFilterChange = jest.fn();
    const mockPreventDefault = jest.fn();
    render(<ReportFilters onFilterChange={mockOnFilterChange} />);
    
    // Get the form and simulate submit event
    const form = screen.getByRole('form');
    fireEvent.submit(form, { preventDefault: mockPreventDefault });
    
    // Check if preventDefault was called
    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
  });

  test('handles empty string inputs correctly', () => {
    const mockOnFilterChange = jest.fn();
    render(<ReportFilters onFilterChange={mockOnFilterChange} />);
    
    // Change time period but leave other fields empty
    fireEvent.change(screen.getByLabelText(/Time Period:/i), { target: { value: 'daily' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Apply Filters/i }));
    
    // Check if onFilterChange was called with the correct parameters
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      timePeriod: 'daily',
      category: '',
      tag: ''
    });
  });
});
