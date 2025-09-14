import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import TransactionsList from "./pages/Transactions/TransactionsList.jsx";
import TransactionForm from "./pages/Transactions/TransactionForm.jsx";
import Navbar from "./components/Navbar.jsx";
import Accounts from "./pages/Accounts/Accounts.jsx";
import Budgets from "./pages/Budgets/Budgets.jsx";


function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={token ? <TransactionsList /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions/add"
          element={token ? <TransactionForm /> : <Navigate to="/login "/>}
        />
        <Route
          path="/transactions/edit/:id"
          element={token ? <TransactionForm /> : <Navigate to="/login" />}
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard": "/login"}  />}
        />
        <Route
          path="/accounts" element={<Accounts />}
        />
        <Route
        
          path="/budgets"
          element={token ? <Budgets /> : <Navigate to="/login" />}
        />

        
      </Routes>
    </Router>
  );
}

export default App;