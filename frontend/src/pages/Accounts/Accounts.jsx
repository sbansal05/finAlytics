import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AccountForm from "./AccountForm.jsx";
import Layout from "../../components/Layout.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import "../../styles/global.css";
import "./Accounts.css";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Accounts() {
  const { token } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [token]);

  async function fetchAccounts() {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter active accounts only
      setAccounts(res.data.accounts.filter(acc => acc.isActive !== false));
    } catch {
      alert("Failed to fetch accounts");
    }
  }

  async function handleSubmit(formData) {
    setError("");
    try {
      if (formData.id) {
        await axios.put(`${apiUrl}/api/v1/account/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/api/v1/account`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditingAccount(null);
      setShowForm(false);
      await fetchAccounts();
    } catch {
      setError("Failed to save account");
    }
  }

  function handleEdit(acc) {
    setEditingAccount(acc);
    setShowForm(true);
    setError("");
  }

  function handleCancel() {
    setEditingAccount(null);
    setShowForm(false);
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      await axios.delete(`${apiUrl}/api/v1/account/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch {
      alert("Failed to delete account");
    }
  }

  return (
      <section className="accounts-section" style={{ padding: "2rem 1rem" }}>
        <div className="accounts-header-row">
          <span className="accounts-title">Accounts</span>
          <button className="add-account-btn" onClick={() => { setEditingAccount(null); setShowForm(true); }}>
            Add Account
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {showForm && (
          <AccountForm
            initialData={editingAccount || { id: null, name: "", type: "", balance: 0 }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        <div className="accounts-grid" style={{ marginTop: "1.5rem" }}>
          {accounts.length === 0 ? (
            <p style={{ color: "#ccc" }}>No accounts found.</p>
          ) : (
            accounts.map((acc) => (
              <div className="account-card" key={acc._id}>
                <div>
                  <div className="account-title">{acc.name}</div>
                  <div className="account-sub">{acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}</div>
                  <div
                    className={
                      "account-balance " + (acc.balance >= 0 ? "positive" : "negative")
                    }
                  >
                    {acc.balance < 0 ? "-" : ""}
                    ${Math.abs(acc.balance).toFixed(2)}
                  </div>
                </div>
                <div className="account-info-row" style={{ marginTop: 'auto' }}>
                  <span>Transactions: {acc.transactionCount || 0}</span>
                  <span>Type: {acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}</span>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button className="action-btn" onClick={() => handleEdit(acc)}>Edit</button>
                  <button className="action-btn" onClick={() => handleDelete(acc._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
  );
}
