import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import UserHome from "../components/UserHome";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Mock axios and useNavigate
jest.mock("axios");
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("UserHome Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);

    localStorage.setItem("token", "testToken");
    jwtDecode.mockReturnValue({ id: "12345" });

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/users/12345")) {
        return Promise.resolve({ data: { username: "JohnDoe" } });
      }
      if (url.includes("/api/transactions")) {
        return Promise.resolve({
          data: [
            { _id: "1", type: "income", amount: 200, description: "Salary", date: "2025-03-22T10:00:00Z" },
            { _id: "2", type: "expense", amount: 50, description: "Groceries", date: "2025-03-21T10:00:00Z" },
          ],
        });
      }
      return Promise.reject(new Error("Not Found"));
    });

    render(
      <BrowserRouter>
        <UserHome />
      </BrowserRouter>
    );
  });

  test("renders the UserHome component", async () => {
    expect(screen.getByText("Personal Finance Tracker")).toBeInTheDocument();
  });

  test("displays the welcome message with username", async () => {
    await waitFor(() => expect(screen.getByText("Welcome back, JohnDoe!")).toBeInTheDocument());
  });

  test("fetches and displays financial data", async () => {
    await waitFor(() => {
      expect(screen.getByText("$150.00")).toBeInTheDocument(); // Total Balance (200 - 50)
      expect(screen.getByText("$200.00")).toBeInTheDocument(); // Income
      expect(screen.getByText("-$50.00")).toBeInTheDocument(); // Expenses
    });
  });

  test("shows recent transactions", async () => {
    await waitFor(() => {
      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
    });
  });

  test("renders quick action buttons", async () => {
    expect(screen.getByText("Manage Budget")).toBeInTheDocument();
    expect(screen.getByText("Manage Transaction")).toBeInTheDocument();
    expect(screen.getByText("Make Goals")).toBeInTheDocument();
    expect(screen.getByText("Financial Reports")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  test("navigates to different pages when quick action buttons are clicked", () => {
    fireEvent.click(screen.getByText("Manage Budget"));
    expect(mockNavigate).toHaveBeenCalledWith("/manage-budget");

    fireEvent.click(screen.getByText("Manage Transaction"));
    expect(mockNavigate).toHaveBeenCalledWith("/manage-transaction");

    fireEvent.click(screen.getByText("Make Goals"));
    expect(mockNavigate).toHaveBeenCalledWith("/goal-form");

    fireEvent.click(screen.getByText("Financial Reports"));
    expect(mockNavigate).toHaveBeenCalledWith("/financial-reports");

    fireEvent.click(screen.getByText("Notifications"));
    expect(mockNavigate).toHaveBeenCalledWith("/notifications");
  });
});
