import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../stylesheet/AdminTransactions.css";

const AdminHome = () => {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      await axios.put(`http://localhost:5000/api/transactions/${updatedTransaction._id}`, updatedTransaction, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTransactions(); // Refresh the transactions list
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  return (
    <>
      <div className="admin-container">
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
                    <th>Actions</th>
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
                          className="edit-btn"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          Edit
                        </button>
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
      </div>

      {isEditModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Transaction</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTransaction(editingTransaction);
            }}
          >
            <label>
              Type:
              <select
                value={editingTransaction.type}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    type: e.target.value,
                  })
                }
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label>
              Amount:
              <input
                type="number"
                value={editingTransaction.amount}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    amount: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Category:
              <input
                type="text"
                value={editingTransaction.category}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    category: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Date:
              <input
                type="date"
                value={new Date(editingTransaction.date).toISOString().split('T')[0]}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    date: e.target.value,
                  })
                }
              />
            </label>
            <div className="modal-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      <AdminFooter />
    </>
  );
};

export default AdminHome;