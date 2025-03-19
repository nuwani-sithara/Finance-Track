import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaChartLine, FaWallet, FaPiggyBank, FaSignInAlt } from "react-icons/fa"; // Icons
import "../stylesheet/LandingPage.css";
import Header from "./Header";
import UserFooter from "./UserFooter";

export default function LandingPage() {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const toggleLoginForm = () => {
        setShowLoginForm(!showLoginForm);
        setError(""); // Clear error when toggling the form
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            }, {
                withCredentials: true,
            });
            console.log("Login successful:", response.data);
            localStorage.setItem("token", response.data.token);
            navigate(response.data.role === "admin" ? "/admin-home" : "/user-home");
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            setError(error.response ? error.response.data.message : "An error occurred during login.");
        }
    };

    return (
        <>
            <Header />
            <div className="landing-page">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h2>Take Control of Your Finances</h2>
                        <p>Track your income, expenses, and savings with ease. Start managing your money smarter today.</p>
                        <button onClick={toggleLoginForm} className="cta-btn">
                            <FaSignInAlt className="cta-icon" /> Get Started
                        </button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <h2>Why Choose FinanceTrack?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <FaChartLine className="feature-icon" />
                            <h3>Track Expenses</h3>
                            <p>Easily monitor your spending and identify areas to save.</p>
                        </div>
                        <div className="feature-card">
                            <FaWallet className="feature-icon" />
                            <h3>Manage Budgets</h3>
                            <p>Create and manage budgets to achieve your financial goals.</p>
                        </div>
                        <div className="feature-card">
                            <FaPiggyBank className="feature-icon" />
                            <h3>Save Smarter</h3>
                            <p>Set savings goals and track your progress over time.</p>
                        </div>
                    </div>
                </section>

                {/* Login Form Pop-up */}
                {showLoginForm && (
                    <div className="login-popup-overlay">
                        <div className="login-popup">
                            <h2>Login to Your Account</h2>
                            {error && <p className="error-message">{error}</p>}
                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FaUser className="input-icon" /> Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">
                                        <FaLock className="input-icon" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="login-btn">
                                    <FaSignInAlt className="btn-icon" /> Login
                                </button>
                            </form>
                            <p className="signup-link">Don't have an account? <a href="/register">Sign up</a></p>
                            <button onClick={toggleLoginForm} className="close-button">Close</button>
                        </div>
                    </div>
                )}
            </div>
            <UserFooter />
        </>
    );
}