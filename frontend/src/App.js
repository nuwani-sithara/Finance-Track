import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import ManageBudget from "./components/ManageBudget";
import UserHome from "./components/UserHome";
import TransactionManagement from "./components/TransactionManagement";
import GoalsList from "./components/GoalsList";
import GoalForm from "./components/GoalForm";
import FinancialReports from "./components/FinancialReports";
import Notifications from "./components/Notifications";
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode
import AdminHome from "./components/AdminHome";
import AdminCategoryManagement from "./components/AdminCategoryManagement";
import AdminReports from "./components/AdminReports";
import AdminTransactions from "./components/AdminTransactions";
import AdminUsers from "./components/AdminUsers";
// import CurrencyList from "./components/CurrencyList";

// Function to decode JWT token
const decodeToken = (token) => {
  try {
    return jwtDecode(token); // Use jwtDecode instead of jwt_decode
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// ProtectedRoute Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token"); // Get JWT token from localStorage
  const decodedToken = token ? decodeToken(token) : null; // Decode the token
  const isAuthenticated = !!decodedToken; // Check if user is authenticated
  const userRole = decodedToken?.role; // Get user role from decoded token

  // If user is not authenticated, redirect to login (LandingPage)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user role is not allowed, redirect to a fallback route (e.g., UserHome)
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/user-home" replace />;
  }

  // If user is authenticated and has the correct role, render the children
  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes for Users */}
          <Route
            path="/user-home"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-budget"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ManageBudget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-transaction"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <TransactionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals-list"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <GoalsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goal-form"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <GoalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-reports"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <FinancialReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes for Admins Only */}
          <Route
            path="/admin-home"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHome /> {/* Example admin-only component */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-category-manage"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCategoryManagement /> {/* Example admin-only component */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports /> {/* Example admin-only component */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-transactions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTransactions /> {/* Example admin-only component */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers /> {/* Example admin-only component */}
              </ProtectedRoute>
            }
          />

         

          {/* Fallback Route for Invalid Paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;