import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaWallet, FaArrowUp, FaArrowDown, FaHistory, FaCog, FaBullseye, FaChartLine, FaBell } from "react-icons/fa"; // Icons
import "../stylesheet/UserHome.css";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";

export default function UserHome() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsername(userResponse.data.username);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setTransactions(data);

        let income = 0;
        let expenses = 0;

        data.forEach((transaction) => {
          if (transaction.type === "income") {
            income += transaction.amount;
          } else if (transaction.type === "expense") {
            expenses += transaction.amount;
          }
        });

        setTotalIncome(income);
        setTotalExpenses(expenses);
        setTotalBalance(income - expenses);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchUserDetails();
    fetchTransactions();
  }, []);

  return (
    <>
      <UserHeader />
      <div className="home-container">
        <header className="header">
          <h1>Personal Finance Tracker</h1>
          <p>Welcome back, {username || "user"}!</p>
        </header>

        {/* Financial Overview */}
        <div className="financial-overview">
          <div className="overview-card">
            <FaWallet className="overview-icon" />
            <h2>Total Balance</h2>
            <p>${totalBalance.toFixed(2)}</p>
          </div>
          <div className="overview-card">
            <FaArrowUp className="overview-icon" />
            <h2>Income (This Month)</h2>
            <p>${totalIncome.toFixed(2)}</p>
          </div>
          <div className="overview-card">
            <FaArrowDown className="overview-icon" />
            <h2>Expenses (This Month)</h2>
            <p>-${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h2><FaHistory className="section-icon" /> Recent Transactions</h2>
          <ul>
            {transactions.slice(-3).reverse().map((transaction) => (
              <li key={transaction._id}>
                <span className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</span>
                <span className="transaction-description">{transaction.description}</span>
                <span
                  className={`transaction-amount ${transaction.type === "income" ? "positive" : "negative"}`}
                >
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2><FaCog className="section-icon" /> Quick Actions</h2>
          <div className="action-btns">
            <button className="action-btn" onClick={() => navigate("/manage-budget")}>
              <FaChartLine className="action-icon" /> Manage Budget
            </button>
            <button className="action-btn" onClick={() => navigate("/manage-transaction")}>
              <FaWallet className="action-icon" /> Manage Transaction
            </button>
            <button className="action-btn" onClick={() => navigate("/goal-form")}>
              <FaBullseye className="action-icon" /> Make Goals
            </button>
            <button className="action-btn" onClick={() => navigate("/financial-reports")}>
              <FaChartLine className="action-icon" /> Financial Reports
            </button>
            <button className="action-btn" onClick={() => navigate("/notifications")}>
              <FaBell className="action-icon" /> Notifications
            </button>
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
}