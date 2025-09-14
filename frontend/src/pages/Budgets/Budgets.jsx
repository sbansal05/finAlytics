import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Budgets() {
  const { token } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({ category: "", amount: "", month: "" });

  useEffect(() => {
    fetchBudgets();
  }, [token]);

  async function fetchBudgets() {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/budget`, {
        headers: { Authorization: `Bearer ${token}` } // Fixed token string interpolation
      });
      setBudgets(res.data.budgets);
    } catch {
      alert("Failed to fetch budgets");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function startEdit(budget) {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      amount: budget.amount,
      month: budget.month
    });
  }

  function handleCancel() {
    setEditingBudget(null);
    setForm({ category: "", amount: "", month: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingBudget) {
        await axios.put(`${apiUrl}/api/v1/budget/${editingBudget._id}`, form, {
          headers: { Authorization: `Bearer ${token}` } // Fixed Bearer typo
        });
      } else {
        await axios.post(`${apiUrl}/api/v1/budget`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      handleCancel();
      fetchBudgets();
    } catch {
      alert("Failed to save budget");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await axios.delete(`${apiUrl}/api/v1/budget/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBudgets();
    } catch {
      alert("Failed to delete budget");
    }
  }

  return (
    <div>
      <h1>Budgets</h1>
      <form onSubmit={handleSubmit}>
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} />
        <input name="month" placeholder="Month (e.g. 2025-09)" value={form.month} onChange={handleChange} />
        <button type="submit">{editingBudget ? "Update" : "Add"} Budget</button>
        {editingBudget && <button type="button" onClick={handleCancel}>Cancel</button>} {/* Fixed typo handleCancel */}
      </form>
      <ul>
        {budgets.map(b => (  /* Fixed variable name from budget to budgets */
          <li key={b._id}>
            {b.category} - ${b.amount} - {b.month}
            <button onClick={() => startEdit(b)}>Edit</button>
            <button onClick={() => handleDelete(b._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
