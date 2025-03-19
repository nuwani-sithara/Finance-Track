import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../stylesheet/AdminUsers.css";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setShowEditForm(true);
  };

  const handleDeleteClick = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowEditForm(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <><div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        {/* Manage Users Section */}
        <section className="manage-users">
          <h2>Manage Users</h2>
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEditClick(user)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteClick(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Edit User Form Popup */}
        {showEditForm && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Edit User</h2>
              <form onSubmit={handleEditFormSubmit}>
                <label>
                  Username:
                  <input
                    type="text"
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                </label>
                <label>
                  Role:
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowEditForm(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>


    </div><AdminFooter /></>
  );
};

export default AdminHome;