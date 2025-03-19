import React from "react";
import "../stylesheet/UserHeader.css";
import logoImage from "../assets/logo1.png"; // Adjust the path to your PNG file

export default function UserHeader() {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-name">
                    <img src={logoImage} alt="FinanceTrack Logo" className="logo-icon" />
                </div>
                <nav className="nav-menu">
                    <a href="/user-home" className="nav-link">Home</a>
                    <a href="#features" className="nav-link">Transactions</a>
                    <a href="#about" className="nav-link">Budgets</a>
                    <a href="#contact" className="nav-link">Goals</a>
                    <a href="#contact" className="nav-link">Notifications</a>

                    <a href="#login" className="nav-link login-button">Logout</a>
                </nav>
            </div>
        </header>
    );
}