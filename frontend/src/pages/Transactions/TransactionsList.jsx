import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

export default function TransactionList() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const [filters, setFilters] = useState({
    accountId: "",
    type: "",
    category: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const params = {};

        if (filters.accountId) params.accountId = filters.accountId;
        if (filters.type) params.type = filters.type;
        if (filters.category) params.category = filters.category;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const res = await axios.get(`${apiUrl}/api/v1/transaction/summary/filter`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setTransactions(res.data.transactions);
        setLoading(false);
      } catch (error) {
        setError("Failed to load transactions");
        setLoading(false);
      }
    }
    if (token) {
      fetchTransactions();
    }
  }, [filters, token]);

  

useEffect(() => {
  async function fetchAccounts() {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data.accounts);
    } catch (error) {
      setError("Failed to load Account")
    }
  }
  if(token) fetchAccounts();
}, [token]);



  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function handleResetFilters() {
    setFilters({
      accountId: "",
      type: "",
      category: "",
      startDate: "",
      endDate: ""
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axios.delete(`${apiUrl}/api/v1/transaction/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(prev => prev.filter(tx => tx._id !== id));
    } catch (error) {
      alert("Failed to delete transaction");
    }
  }

  if (loading) {
    return <p>Loading Transactions...</p>;
  }
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <Link to="/transactions/add">
        <button>Add Transaction</button>
      </Link>

      <h2>Filter Transactions</h2>
      <div style={{ marginBottom: "1em" }}>
        <select
          name="accountId"
          value={filters.accountId}
          onChange={handleFilterChange}
          style={{ marginRight: '0.5em' }}
        >
          <option value="">All Accounts</option>
          {accounts.map(acc => (
            <option key={acc._id} value={acc._id}>
              {acc.name} ({acc._id})
            </option>
          ))}
        </select>

        <select name="type" value={filters.type} onChange={handleFilterChange} style={{ marginRight: "0.5em" }}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={filters.category}
          onChange={handleFilterChange}
          style={{ marginRight: "0.5em" }}
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          style={{ marginRight: "0.5em" }}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          style={{ marginRight: "0.5em" }}
        />
        <button onClick={handleResetFilters}>Reset Filters</button>
      </div>

      <h2>Your Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map(tx => (
            <li key={tx._id}>
              {tx.description} - ${Math.abs(tx.amount)} on {new Date(tx.date).toLocaleDateString()}
              {" "}
              <Link to={`/transactions/edit/${tx._id}`}>
                <button>Edit</button>
              </Link>
              <button onClick={() => handleDelete(tx._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
