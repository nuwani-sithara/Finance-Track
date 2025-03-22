import React from "react";
import { render, screen } from "@testing-library/react";
import UserFooter from "../components/UserFooter"; // Adjust path as needed

describe("UserFooter Component", () => {
  test("renders the footer correctly", () => {
    render(<UserFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  test("displays company information", () => {
    render(<UserFooter />);
    expect(screen.getByText("FinanceTrack")).toBeInTheDocument();
    expect(
      screen.getByText("Take control of your finances with our easy-to-use personal finance tracker.")
    ).toBeInTheDocument();
  });

  test("displays quick links", () => {
    render(<UserFooter />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  test("displays contact details", () => {
    render(<UserFooter />);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("support@financetrack.com")).toBeInTheDocument();
    expect(screen.getByText("+94 (75) 400-9566")).toBeInTheDocument();
    expect(screen.getByText("Malabe, Sri Lanka")).toBeInTheDocument();
  });

  test("displays social media icons", () => {
    render(<UserFooter />);
    expect(screen.getByText("Follow Us")).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBe(4); // 4 social media links
  });

  test("checks copyright text", () => {
    render(<UserFooter />);
    expect(screen.getByText(/© 2025 FinanceTrack. All rights reserved./i)).toBeInTheDocument();
  });
});
