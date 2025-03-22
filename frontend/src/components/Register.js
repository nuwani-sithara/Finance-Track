import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../stylesheet/Register.css";
import logo from "../assets/logo.png"; // Adjust the path to your logo file

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // Validate form fields
    const validateForm = () => {
        const errors = {};

        // Username validation
        if (!formData.username.trim()) {
            errors.username = "Username is required";
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Email is invalid";
        }

        // Password validation
        if (!formData.password.trim()) {
            errors.password = "Password is required";
        } else if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters long";
        } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(formData.password)) {
            errors.password =
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }

        setErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when the user starts typing
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Stop submission if validation fails
        }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", formData, {
                withCredentials: true,
            });

            console.log("Registration successful:", response.data);
            navigate("/user-login");
        } catch (error) {
            console.error("Error registering user:", error.response ? error.response.data : error.message);
            setErrorMessage(error.response ? error.response.data.message : "Error registering user. Please try again.");
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <img src={logo} alt="Logo" className="register-logo" />
                <h2>Register</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        {errors.username && <p className="error-message">{errors.username}</p>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>
                    <button type="submit" className="register-btn">Register</button>
                </form>
                <p className="login-link">Already have an account? <a href="/user-login">Login</a></p>
            </div>
        </div>
    );
};

export default Register;