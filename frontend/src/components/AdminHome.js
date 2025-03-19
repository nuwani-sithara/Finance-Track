import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../stylesheet/AdminHome.css";
import { FaUsers, FaMoneyCheckAlt, FaChartLine, FaListAlt } from "react-icons/fa";

const AdminHome = () => {
  const [adminName, setAdminName] = useState("Admin");

  // Fetch admin name (you can replace this with actual API call)
  useEffect(() => {
    // Simulate fetching admin name
    const fetchAdminName = () => {
      setTimeout(() => {
        setAdminName("John Doe"); // Replace with actual admin name
      }, 1000);
    };
    fetchAdminName();
  }, []);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="welcome-message">
          <h2>Hi, {adminName}!</h2>
          <p>Welcome back to your dashboard. Here's what's happening today.</p>
        </div>

        <div className="dashboard-features">
          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>Manage Users</h3>
            <p>View, add, edit, or remove users from the system.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaMoneyCheckAlt />
            </div>
            <h3>Manage Transactions</h3>
            <p>Monitor and manage all financial transactions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Manage Reports</h3>
            <p>Generate and analyze detailed reports.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaListAlt />
            </div>
            <h3>Manage Categories</h3>
            <p>Organize and manage product or service categories.</p>
          </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminHome;