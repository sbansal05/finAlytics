import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import Login from "./pages/Login/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import TransactionsList from "./pages/Transactions/TransactionsList.jsx";
import TransactionForm from "./pages/Transactions/TransactionForm.jsx";
import Layout from "./components/Layout.jsx";
import Accounts from "./pages/Accounts/Accounts.jsx";
import Budgets from "./pages/Budgets/Budgets.jsx";
import Goals from "./pages/Goals/Goals.jsx";

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            token
              ? (
                  <Layout>
                    <Dashboard />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/transactions"
          element={
            token
              ? (
                  <Layout>
                    <TransactionsList />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/transactions/add"
          element={
            token
              ? (
                  <Layout>
                    <TransactionForm />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/transactions/edit/:id"
          element={
            token
              ? (
                  <Layout>
                    <TransactionForm />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/accounts"
          element={
            token
              ? (
                  <Layout>
                    <Accounts />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/budgets"
          element={
            token
              ? (
                  <Layout>
                    <Budgets />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/goals"
          element={
            token
              ? (
                  <Layout>
                    <Goals />
                  </Layout>
                )
              : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
