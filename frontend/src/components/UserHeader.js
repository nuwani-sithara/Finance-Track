import React from "react";
import "../stylesheet/UserHeader.css";
import { useNavigate } from "react-router-dom"; 
import logoImage from "../assets/logo1.png"; // Adjust the path to your PNG file

export default function UserHeader() {

    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data (adjust based on your auth method)
        localStorage.removeItem("token"); 
        sessionStorage.removeItem("userSession"); 
        
        // Redirect to login page
        navigate("/user-login");
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-name">
                    <img src={logoImage} alt="FinanceTrack Logo" className="logo-icon" />
                </div>
                <nav className="nav-menu">
                    <a href="/user-home" className="nav-link">Home</a>
                    <a href="/manage-transaction" className="nav-link">Transactions</a>
                    <a href="/manage-budget" className="nav-link">Budgets</a>
                    <a href="/goals-list" className="nav-link">Goals</a>
                    <a href="/notifications" className="nav-link">Notifications</a>

                    <button className="nav-link login-button" onClick={handleLogout}>Logout</button>
                </nav>
            </div>
        </header>
    );
}