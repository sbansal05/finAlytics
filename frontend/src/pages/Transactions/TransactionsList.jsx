import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Layout from "../../components/Layout.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import "../../styles/global.css";
import "./TransactionsList.css";
const apiUrl = import.meta.env.VITE_API_URL;

export default function TransactionsList() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");

  useEffect(() => {
    async function fetchData() {
      const headers = { headers: { Authorization: `Bearer ${token}` }};
      // Get transactions
      const txRes = await axios.get(`${apiUrl}/api/v1/transaction`, headers);
      setTransactions(txRes.data.transactions);

      // For category filter dropdown: gather all unique categories
      const catSet = new Set(txRes.data.transactions.map(tx => tx.category));
      setCategories([...catSet]);

      // For account filter dropdown
      const accRes = await axios.get(`${apiUrl}/api/v1/account`, headers);
      setAccounts(accRes.data.accounts);
    }
    if(token) fetchData();
  }, [token]);

  // Filtering logic
  const filteredTx = transactions.filter(tx => {
    const matchSearch = (tx.description?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchCategory = !categoryFilter || tx.category === categoryFilter;
    const matchAccount = !accountFilter || tx.accountId === accountFilter;
    return matchSearch && matchCategory && matchAccount;
  });

  return (
    <Layout>
      <section className="transactions-section">
        <div className="transactions-header-row">
          <span className="transactions-title">Transactions</span>
          <button className="add-transaction-btn">
            Add Transaction
          </button>
        </div>
        <div className="transactions-filters-row">
          <input
            className="transactions-search-input"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="transactions-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="transactions-select"
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value)}
          >
            <option value="">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc._id} value={acc._id}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Amount</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.map(tx => (
                <tr key={tx._id}>
                  <td>
                    {new Date(tx.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={{ fontWeight: 700 }}>{tx.description}</td>
                  <td>
                    <span className="category-pill">{tx.category}</span>
                  </td>
                  <td>
                    {accounts.find(acc => acc._id === tx.accountId)?.name || ""}
                  </td>
                  <td>
                    <span className={tx.amount >= 0 ? "amount-positive" : "amount-negative"}>
                      {tx.amount >= 0 ? "$" : "-$"}
                      {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn">Edit</button>
                    <button className="action-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
