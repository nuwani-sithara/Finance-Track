import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../stylesheet/Register.css";
import Header from "./UserHeader";
import Footer from "./UserFooter";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", formData, {
                withCredentials: true, // 👈 Add this to handle cookies and authentication
            });
    
            console.log("Registration successful:", response.data);
            navigate("/user-login");
        } catch (error) {
            console.error("Error registering user:", error.response ? error.response.data : error.message);
            setError(error.response ? error.response.data.message : "Error registering user. Please try again.");
        }
    };
    

    return (
        <>
            <Header />
            <div className="register-container">
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default Register;