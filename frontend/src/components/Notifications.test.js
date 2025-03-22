import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import Notifications from "../components/Notifications"; // Adjust path as needed

jest.mock("axios");

const mockNotifications = [
  { _id: "1", message: "New message received", read: false, createdAt: "2025-03-22T10:00:00Z" },
  { _id: "2", message: "Your order has been shipped", read: true, createdAt: "2025-03-21T15:30:00Z" },
];

describe("Notifications Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "mockedToken");
  });

  test("displays loading state initially", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Notifications />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders notifications when fetched successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("New message received")).toBeInTheDocument();
      expect(screen.getByText("Your order has been shipped")).toBeInTheDocument();
    });
  });

  test("displays 'No notifications found' when there are no notifications", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText("No notifications found.")).toBeInTheDocument();
    });
  });

  test("marks a notification as read when button is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: mockNotifications });
    axios.put.mockResolvedValueOnce({});
    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText("New message received")).toBeInTheDocument();
    });

    const markAsReadButton = screen.getByText("Mark as Read");
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:5000/api/notifications/1",
        null,
        { headers: { Authorization: "Bearer mockedToken" } }
      );
    });
  });

  test("handles API error while fetching notifications", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));
    render(<Notifications />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByText("No notifications found.")).toBeInTheDocument();
    });
  });
});
