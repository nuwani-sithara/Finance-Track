import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import ManageBudget from "../components/ManageBudget"; // Adjust path as needed

jest.mock("axios");

const mockBudgets = [
  { _id: "1", category: "Food", amount: 200, month: "March", notifications: true },
  { _id: "2", category: "Transport", amount: 100, month: "April", notifications: false },
];

const mockCategories = [
  { _id: "1", name: "Food" },
  { _id: "2", name: "Transport" },
];

const mockNotifications = [
  { _id: "1", message: "Budget limit reached!", read: false, createdAt: "2025-03-22T10:00:00Z" },
];

describe("ManageBudget Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "mockedToken");
  });

  test("renders the component properly", async () => {
    axios.get.mockResolvedValueOnce({ data: mockBudgets });
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    axios.get.mockResolvedValueOnce({ data: mockCategories });

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Budget Management")).toBeInTheDocument();
    });
  });

  test("fetches and displays budgets correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: mockBudgets });
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: mockCategories });

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Food")).toBeInTheDocument();
      expect(screen.getByText("Amount: $200")).toBeInTheDocument();
      expect(screen.getByText("Transport")).toBeInTheDocument();
    });
  });

  test("fetches and displays categories correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: mockCategories });

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Select Category")).toBeInTheDocument();
      expect(screen.getByText("Food")).toBeInTheDocument();
      expect(screen.getByText("Transport")).toBeInTheDocument();
    });
  });

  test("fetches and displays notifications correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    axios.get.mockResolvedValueOnce({ data: mockCategories });

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Budget limit reached!")).toBeInTheDocument();
    });
  });

  test("adds a new budget successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: mockBudgets });
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    axios.get.mockResolvedValueOnce({ data: mockCategories });
    axios.post.mockResolvedValueOnce({ data: { message: "Budget added successfully" } });

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Budget Management")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole("combobox", { name: /category/i }), { target: { value: "Food" } });
    fireEvent.change(screen.getByPlaceholderText("Amount"), { target: { value: "300" } });
    fireEvent.change(screen.getByRole("combobox", { name: /month/i }), { target: { value: "April" } });

    fireEvent.click(screen.getByText("Add Budget"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/budgets",
        { category: "Food", amount: 300, month: "April", notifications: true },
        { headers: { Authorization: "Bearer mockedToken" } }
      );
    });
  });

  test("deletes a budget successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: mockBudgets });
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    axios.get.mockResolvedValueOnce({ data: mockCategories });
    axios.delete.mockResolvedValueOnce({});

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Food")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:5000/api/budgets/1",
        { headers: { Authorization: "Bearer mockedToken" } }
      );
    });
  });

  test("handles API error while fetching budgets", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: mockCategories });

    render(<ManageBudget />);

    await waitFor(() => {
      expect(screen.getByText("Budget Management")).toBeInTheDocument();
    });
  });
});
