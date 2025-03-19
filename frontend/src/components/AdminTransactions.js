import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../stylesheet/AdminTransactions.css";

const AdminHome = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/transactions/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTransactions(); // Refresh the transactions list
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <><div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>


        {/* Oversee Transactions Section */}
        <section className="oversee-transactions">
          <h2>Oversee Transactions</h2>
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th> {/* New column for actions */}
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.userId?.username || "Unknown User"}</td>
                    <td>{transaction.type}</td>
                    <td>${transaction.amount}</td>
                    <td>{transaction.category}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>


    </div><AdminFooter /></>
  );
};

export default AdminHome;