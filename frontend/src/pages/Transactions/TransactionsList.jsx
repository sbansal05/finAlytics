import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import './TransactionsList.css';

const apiUrl = import.meta.env.VITE_API_URL;

export default function TransactionsList() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [transRes, summaryRes] = await Promise.all([
          axios.get(`${apiUrl}/api/v1/transaction`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/v1/transaction/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTransactions(transRes.data.transactions);
        setSummary(summaryRes.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load transactions or summary");
        setLoading(false);
      }
    }
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ type: "", category: "", startDate: "", endDate: "" });
  };

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axios.delete(`${apiUrl}/api/v1/transaction/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch {
      alert("Failed to delete transaction");
    }
  }

  if (loading) return <p>Loading Transactions...</p>;

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container">
      <Link to="/transactions/add">
        <button>Add Transaction</button>
      </Link>

      <h2>Summary</h2>
      <div>
        <p>Total Income: ${summary.income.toFixed(2)}</p>
        <p>Total Expenses: ${Math.abs(summary.expense).toFixed(2)}</p>
        <p>
          <strong>Net Balance: ${summary.net.toFixed(2)}</strong>
        </p>
      </div>

      <h2>Filter Transactions</h2>
      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
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
        />

        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />

        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />

        <button onClick={handleResetFilters}>Reset Filters</button>
      </div>

      <h2>Recent Transactions ({transactions.length})</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx._id}>
              {tx.description} - ${Math.abs(tx.amount)} on {new Date(tx.date).toLocaleDateString()}
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
