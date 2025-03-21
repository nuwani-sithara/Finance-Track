import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaList, FaChartLine, FaSignOutAlt, FaUsers, FaMoneyCheckAlt } from "react-icons/fa"; // Icons from react-icons
import logoImage from "../assets/logo1.png"; // Import your logo image
import "../stylesheet/AdminSidebar.css"; // Import your stylesheet

const AdminSidebar = () => {
  const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data (adjust based on your auth method)
        localStorage.removeItem("token"); 
        sessionStorage.removeItem("userSession"); 
        
        // Redirect to login page
        navigate("/user-login");
    };

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logoImage} alt="Admin Logo" className="logo-image" />
      </div>

      {/* Sidebar Title */}
      <h2>Admin Panel</h2>

      {/* Sidebar Links */}
      <ul>
        <li>
          <Link to="/admin-home" className="sidebar-link">
            <FaHome className="sidebar-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin-category-manage" className="sidebar-link">
            <FaList className="sidebar-icon" /> Manage Categories
          </Link>
        </li>
        <li>
          <Link to="/admin-reports" className="sidebar-link">
            <FaChartLine className="sidebar-icon" /> Reports
          </Link>
        </li>
        <li>
          <Link to="/admin-users" className="sidebar-link">
            <FaUsers className="sidebar-icon" /> Users
          </Link>
        </li>
        <li>
          <Link to="/admin-transactions" className="sidebar-link">
            <FaMoneyCheckAlt className="sidebar-icon" /> Transactions
          </Link>
        </li>
      </ul>

      {/* Logout Button */}
      <div className="logout-section">
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="sidebar-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;