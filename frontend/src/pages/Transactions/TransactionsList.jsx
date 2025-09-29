import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import TransactionForm from "./TransactionForm.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import "../../styles/global.css";
import "./TransactionsList.css";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl);
export default function TransactionsList() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [editingTx, setEditingTx] = useState(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  async function fetchData() {
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const txRes = await axios.get(`${apiUrl}/v1/transaction`, headers);
      setTransactions(txRes.data.transactions || []);
      const catSet = new Set((txRes.data.transactions || []).map(tx => tx.category));
      setCategories([...catSet]);
      const accRes = await axios.get(`${apiUrl}/v1/account`, headers);
      setAccounts(accRes.data.accounts || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  const filteredTx = transactions.filter(tx => {
    const matchSearch = (tx.description?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchCategory = !categoryFilter || tx.category === categoryFilter;
    const matchAccount = !accountFilter || tx.accountId === accountFilter;
    return matchSearch && matchCategory && matchAccount;
  });

  function handleAdd() {
    setEditingTx({
      amount: "",
      description: "",
      category: "",
      accountId: "",
      date: new Date().toISOString().split('T')[0],
      type: "expense"
    });
  }

  function handleEdit(tx) {
    setEditingTx({
      ...tx,
      date: tx.date ? tx.date.split("T")[0] : new Date().toISOString().split('T')[0],
    });
  }

  function handleModalClose() {
    setEditingTx(null);
    fetchData();
  }

  async function handleDelete(txId) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axios.delete(`${apiUrl}/v1/transaction/${txId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction");
    }
  }

  return (
    <section className="transactions-section">
      <div className="transactions-header-row">
        <span className="transactions-title">Transactions</span>
        <button className="add-transaction-btn" onClick={handleAdd}>
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
                  {new Date(tx.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </td>
                <td style={{ fontWeight: 700 }}>{tx.description}</td>
                <td>
                  <span className="category-pill">{tx.category}</span>
                </td>
                <td>
                  {accounts.find(acc => acc._id === tx.accountId)?.name || "Unknown"}
                </td>
                <td>
                  <span className={tx.amount >= 0 ? "amount-positive" : "amount-negative"}>
                    {tx.amount >= 0 ? "$" : "-$"}
                    {Math.abs(tx.amount).toFixed(2)}
                  </span>
                </td>
                <td>
                  <button className="action-btn" onClick={() => handleEdit(tx)}>Edit</button>
                  <button className="action-btn" onClick={() => handleDelete(tx._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingTx && (
        <TransactionForm
          initialData={editingTx}
          accounts={accounts}
          categories={categories}
          onClose={handleModalClose}
          token={token}
          apiUrl={apiUrl}
        />
      )}
    </section>
  );
}
