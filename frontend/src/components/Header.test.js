import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserHeader from '../components/Header';

// Mock the logo import
jest.mock('../assets/logo1.png', () => 'mocked-logo.png');

describe('UserHeader Component', () => {
  test('renders header component correctly', () => {
    render(<UserHeader />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveClass('header');
  });

  test('displays logo with correct attributes', () => {
    render(<UserHeader />);
    const logoElement = screen.getByAltText('FinanceTrack Logo');
    expect(logoElement).toBeInTheDocument();
    expect(logoElement).toHaveAttribute('src', 'mocked-logo.png');
    expect(logoElement).toHaveClass('logo-icon');
  });

  test('renders all navigation links with correct URLs', () => {
    render(<UserHeader />);
    
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/user-home');
    
    const featuresLink = screen.getByText('Features');
    expect(featuresLink).toBeInTheDocument();
    expect(featuresLink).toHaveAttribute('href', '#features');
    
    const aboutLink = screen.getByText('About');
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '#about');
    
    const contactLink = screen.getByText('Contact');
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '#contact');
  });

  test('has correct structure with header-container', () => {
    const { container } = render(<UserHeader />);
    const headerContainer = container.querySelector('.header-container');
    expect(headerContainer).toBeInTheDocument();
    
    const logoName = container.querySelector('.logo-name');
    expect(logoName).toBeInTheDocument();
    
    const navMenu = container.querySelector('.nav-menu');
    expect(navMenu).toBeInTheDocument();
  });
});
