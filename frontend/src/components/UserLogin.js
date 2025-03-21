import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa"; // Icons
import "../stylesheet/UserLogin.css";
import logo from "../assets/logo.png"; // Adjust the path to your logo file

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
        <div className="login-page">
            <div className="login-container">
                {/* Add the logo here */}
                <img src={logo} alt="Logo" className="login-logo" />
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
            </div>
        </div>
    );
}