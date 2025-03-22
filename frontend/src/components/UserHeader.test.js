import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom"; 
import UserHeader from "../components/UserHeader"; 
import { useNavigate } from "react-router-dom";

// Mock useNavigate hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("UserHeader Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    render(
      <BrowserRouter>
        <UserHeader />
      </BrowserRouter>
    );
  });

  test("renders the header correctly", () => {
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("displays the logo", () => {
    const logo = screen.getByAltText("FinanceTrack Logo");
    expect(logo).toBeInTheDocument();
  });

  test("contains all navigation links", () => {
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Budgets")).toBeInTheDocument();
    expect(screen.getByText("Goals")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  test("logout button exists", () => {
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("logout clears authentication data and redirects", () => {
    // Mock localStorage and sessionStorage
    localStorage.setItem("token", "testToken");
    sessionStorage.setItem("userSession", "testSession");

    // Click the logout button
    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    // Verify localStorage and sessionStorage are cleared
    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("userSession")).toBeNull();

    // Verify redirection to login page
    expect(mockNavigate).toHaveBeenCalledWith("/user-login");
  });
});
