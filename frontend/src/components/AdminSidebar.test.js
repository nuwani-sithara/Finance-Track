import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import * as router from "react-router-dom";

// Mock the useNavigate hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock the logo import
jest.mock("../../assets/logo1.png", () => "mock-logo-path");

describe("AdminSidebar Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Setup the mock for useNavigate
    router.useNavigate.mockImplementation(() => mockNavigate);
    
    // Clear any previous mock calls
    mockNavigate.mockClear();
    
    // Clear localStorage and sessionStorage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  test("renders the sidebar with logo and title", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Check for logo
    const logoElement = screen.getByAltText("Admin Logo");
    expect(logoElement).toBeInTheDocument();
    expect(logoElement.src).toContain("mock-logo-path");
    
    // Check for title
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  test("renders all navigation links with correct routes", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Check all navigation links
    const links = [
      { text: "Dashboard", path: "/admin-home" },
      { text: "Manage Categories", path: "/admin-category-manage" },
      { text: "Reports", path: "/admin-reports" },
      { text: "Users", path: "/admin-users" },
      { text: "Transactions", path: "/admin-transactions" },
    ];
    
    links.forEach(link => {
      const linkElement = screen.getByText(link.text);
      expect(linkElement).toBeInTheDocument();
      expect(linkElement.closest("a")).toHaveAttribute("href", link.path);
    });
  });

  test("logout button is present and functional", () => {
    // Set some values in storage to verify they get cleared
    localStorage.setItem("token", "test-token");
    sessionStorage.setItem("userSession", "test-session");
    
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Find and click logout button
    const logoutButton = screen.getByText("Logout");
    expect(logoutButton).toBeInTheDocument();
    
    fireEvent.click(logoutButton);
    
    // Verify storage items were cleared
    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("userSession")).toBeNull();
    
    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith("/user-login");
  });

  test("renders all sidebar icons", () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Check that we have the expected number of icons
    // 5 navigation links + 1 logout button = 6 icons
    const sidebarIcons = document.querySelectorAll(".sidebar-icon");
    expect(sidebarIcons.length).toBe(6);
  });

  test("sidebar has the correct CSS class", () => {
    const { container } = render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    const sidebarElement = container.querySelector(".admin-sidebar");
    expect(sidebarElement).toBeInTheDocument();
  });
});
