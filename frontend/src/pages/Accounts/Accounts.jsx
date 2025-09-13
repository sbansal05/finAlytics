import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AccountForm from "./AccountForm.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Accounts() {
  const { token } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [token]);

  async function fetchAccounts() {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data.accounts);
    } catch {
      alert("Failed to fetch accounts");
    }
  }

  async function handleSubmit(formData) {
    setError("");

    try {
      if (formData.id) {
        // Edit existing account
        await axios.put(`${apiUrl}/api/v1/account/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new account
        await axios.post(`${apiUrl}/api/v1/account`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditingAccount(null);
      await fetchAccounts();
    } catch (err) {
      setError("Failed to save account");
    }
  }

  function handleEdit(acc) {
    setEditingAccount(acc);
    setError("");
  }

  function handleCancel() {
    setEditingAccount(null);
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
    <div>
      <h1>Your Accounts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <AccountForm
        initialData={editingAccount || { id: null, name: "", type: "", balance: 0 }}
        onSubmit={handleSubmit}
        onCancel={editingAccount ? handleCancel : null}
      />
      <h2>Existing Accounts</h2>
      {accounts.length === 0 ? (
        <p>No accounts found.</p>
      ) : (
        <ul>
          {accounts.map(acc => (
            <li key={acc._id}>
              <strong>{acc.name}</strong> ({acc.type}) — Balance: ${acc.balance.toFixed(2)}{" "}
              <button onClick={() => handleEdit(acc)}>Edit</button>
              <button onClick={() => handleDelete(acc._id)} style={{ marginLeft: "1em" }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
