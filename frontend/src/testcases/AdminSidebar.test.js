import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar';

// Mock the logo import
jest.mock('../assets/logo1.png', () => 'mocked-logo.png');

// Mock console.log to test logout functionality
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

// Wrapper component to provide router context
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdminSidebar Component', () => {
  test('renders the sidebar with logo and title', () => {
    renderWithRouter(<AdminSidebar />);
    
    // Check for logo
    const logoElement = screen.getByAltText('Admin Logo');
    expect(logoElement).toBeInTheDocument();
    expect(logoElement.src).toContain('mocked-logo.png');
    
    // Check for title
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  test('renders all navigation links with correct paths', () => {
    renderWithRouter(<AdminSidebar />);
    
    // Check all navigation links
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/admin-home');
    
    const categoriesLink = screen.getByText('Manage Categories').closest('a');
    expect(categoriesLink).toHaveAttribute('href', '/admin-category-manage');
    
    const reportsLink = screen.getByText('Reports').closest('a');
    expect(reportsLink).toHaveAttribute('href', '/admin-reports');
    
    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveAttribute('href', '/admin-users');
    
    const transactionsLink = screen.getByText('Transactions').closest('a');
    expect(transactionsLink).toHaveAttribute('href', '/admin-transactions');
  });

  test('logout button calls handleLogout function when clicked', () => {
    renderWithRouter(<AdminSidebar />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Check if console.log was called with the expected message
    expect(console.log).toHaveBeenCalledWith('User logged out');
  });

  test('renders all icons in the sidebar', () => {
    renderWithRouter(<AdminSidebar />);
    
    // The icons themselves are not easily testable directly,
    // but we can check that the parent elements that should contain icons exist
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    expect(sidebarLinks.length).toBe(5); // 5 navigation links
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  test('sidebar has the correct CSS class', () => {
    renderWithRouter(<AdminSidebar />);
    
    const sidebar = document.querySelector('.admin-sidebar');
    expect(sidebar).toBeInTheDocument();
  });
});
