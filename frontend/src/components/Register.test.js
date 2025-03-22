import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Register from "../components/Register"; // Adjust path based on your structure

jest.mock("axios");

const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Register Component", () => {
    test("renders the register form", () => {
        renderWithRouter(<Register />);
        expect(screen.getByText("Register")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
    });

    test("shows validation errors for empty fields", async () => {
        renderWithRouter(<Register />);
        fireEvent.click(screen.getByText("Register"));
        
        expect(await screen.findByText("Username is required")).toBeInTheDocument();
        expect(await screen.findByText("Email is required")).toBeInTheDocument();
        expect(await screen.findByText("Password is required")).toBeInTheDocument();
    });

    test("shows validation error for invalid email", async () => {
        renderWithRouter(<Register />);
        fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "invalidemail" } });
        fireEvent.click(screen.getByText("Register"));

        expect(await screen.findByText("Email is invalid")).toBeInTheDocument();
    });

    test("shows validation error for weak password", async () => {
        renderWithRouter(<Register />);
        fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: "weak" } });
        fireEvent.click(screen.getByText("Register"));

        expect(await screen.findByText("Password must be at least 8 characters long")).toBeInTheDocument();
    });

    test("clears validation errors when user types", async () => {
        renderWithRouter(<Register />);
        fireEvent.click(screen.getByText("Register"));

        expect(await screen.findByText("Username is required")).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "testuser" } });

        await waitFor(() => {
            expect(screen.queryByText("Username is required")).not.toBeInTheDocument();
        });
    });

    test("submits form successfully when valid data is provided", async () => {
        axios.post.mockResolvedValue({ data: { message: "Registration successful" } });

        renderWithRouter(<Register />);
        fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "testuser" } });
        fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: "Test@1234" } });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/api/auth/register", {
                username: "testuser",
                email: "test@test.com",
                password: "Test@1234",
                role: "user",
            }, { withCredentials: true });
        });
    });

    test("displays error message when registration fails", async () => {
        axios.post.mockRejectedValue({ response: { data: { message: "User already exists" } } });

        renderWithRouter(<Register />);
        fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "testuser" } });
        fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: "Test@1234" } });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(screen.getByText("User already exists")).toBeInTheDocument();
        });
    });
});
