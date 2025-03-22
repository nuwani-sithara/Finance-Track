import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import UserLogin from "../components/UserLogin";
import { useNavigate } from "react-router-dom";

// Mock axios and useNavigate
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("UserLogin Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>
    );
  });

  test("renders the UserLogin component correctly", () => {
    expect(screen.getByText("Login to Your Account")).toBeInTheDocument();
  });

  test("displays the logo and heading", () => {
    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
    expect(screen.getByText("Login to Your Account")).toBeInTheDocument();
  });

  test("allows user input for email and password", () => {
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("handles login success and redirects to the correct page", async () => {
    axios.post.mockResolvedValue({
      data: { token: "testToken", role: "user" },
    });

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const loginButton = screen.getByText("Login");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("testToken");
      expect(mockNavigate).toHaveBeenCalledWith("/user-home");
    });
  });

  test("handles login failure and shows an error message", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const loginButton = screen.getByText("Login");

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("has a link to the signup page", () => {
    const signupLink = screen.getByText("Sign up");
    expect(signupLink.closest("a")).toHaveAttribute("href", "/register");
  });
});
