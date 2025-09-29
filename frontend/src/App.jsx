import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./context/PrivateRoute";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import TransactionsList from "./pages/Transactions/TransactionsList";
import TransactionForm from "./pages/Transactions/TransactionForm";
import Layout from "./components/Layout";
import Accounts from "./pages/Accounts/Accounts";
import Budgets from "./pages/Budgets/Budgets";
import Goals from "./pages/Goals/Goals";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<TransactionsList />} />
            <Route path="transactions/add" element={<TransactionForm />} />
            <Route path="transactions/edit/:id" element={<TransactionForm />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
