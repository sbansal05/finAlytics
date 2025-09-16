import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import "./Budgets.css";

const apiUrl = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Rent",
  "Other"
];

const MONTHS = [
  "January","February","March","April","May","June","July","August","September","October","November","December"
];

export default function Budgets() {
  const { token } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({ category: "", amount: "", month: "", year: "" });

  const [spending, setSpending] = useState({}); // { category_month: spent }

  useEffect(() => {
    fetchBudgets();
    
  }, [token]);

  async function fetchBudgets() {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/budget`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(res.data.budgets);
    } catch {
      alert("Failed to fetch budgets");
    }
  }

  function openModalForCreate() {
    setEditingBudget(null);
    setForm({
      category: "",
      amount: "",
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear().toString(),
    });
    setModalOpen(true);
  }

  function openModalForEdit(budget) {
    setEditingBudget(budget);
    // extract year and month
    // If your month field is "2025-09", split, else assume March, 2024, etc.
    let month = MONTHS[new Date().getMonth()];
    let year = new Date().getFullYear().toString();
    if (budget.month && /^\d{4}-\d{2}$/.test(budget.month)) {
      const [y, m] = budget.month.split("-");
      year = y;
      month = MONTHS[parseInt(m) - 1];
    }
    setForm({
      category: budget.category,
      amount: budget.amount,
      month,
      year,
    });
    setModalOpen(true);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function closeModal() {
    setEditingBudget(null);
    setModalOpen(false);
    setForm({ category: "", amount: "", month: MONTHS[new Date().getMonth()], year: new Date().getFullYear().toString() });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const monthNum = (MONTHS.indexOf(form.month) + 1).toString().padStart(2, "0");
    const monthString = `${form.year}-${monthNum}`; // "2025-09"
    const payload = { category: form.category, amount: Number(form.amount), month: monthString };

    try {
      if (editingBudget) {
        await axios.put(`${apiUrl}/api/v1/budget/${editingBudget._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${apiUrl}/api/v1/budget`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
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

  function getMonthYearLabel(monthStr) {
    if (!monthStr) return "";
    const parts = monthStr.split("-");
    if (parts.length === 2) {
      return `${MONTHS[parseInt(parts[1]) - 1]} ${parts[0]}`;
    }
    return monthStr;
  }

  return (
    <Layout>
      <section className="budgets-section">
        <div className="budgets-header-row">
          <span className="budgets-title">Budgets</span>
          <button className="create-budget-btn" onClick={openModalForCreate}>
            Create Budget
          </button>
        </div>
        <div>
          {budgets.map(budget => {
            // For demo: simulate spent/random
            const spent = spending[`${budget.category}_${budget.month}`] ?? Math.round(budget.amount * Math.random() * 0.7 * 100) / 100;
            const percentUsed = Math.min((spent / budget.amount) * 100, 100);
            const remaining = Math.max(0, budget.amount - spent);
            return (
              <div className="budget-card" key={budget._id}>
                <div className="budget-card-row">
                  <div>
                    <div className="budget-card-category">{budget.category}</div>
                    <div className="budget-card-month">{getMonthYearLabel(budget.month)}</div>
                  </div>
                  <div className="budget-card-editdel">
                    <button className="action-btn" onClick={() => openModalForEdit(budget)}>Edit</button>
                    <button className="action-btn" onClick={() => handleDelete(budget._id)}>Delete</button>
                  </div>
                </div>
                <div className="budget-bar-wrap">
                  <div className="budget-bar-bg">
                    <div
                      className="budget-bar-fg"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="budget-bar-labels">
                    <span>{percentUsed.toFixed(1)}% used</span>
                    <span className="budget-remain">${remaining.toFixed(2)} Remaining</span>
                  </div>
                </div>
                <div className="budget-amounts">
                  <div>
                    <span className="budget-spent">${spent.toFixed(2)}</span>
                    <span className="budget-amount-label">Spent</span>
                  </div>
                  <div>
                    <span className="budget-total">${budget.amount.toFixed(2)}</span>
                    <span className="budget-amount-label">Budget</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* MODAL FORM */}
        {modalOpen && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
            <form className="modal-form" onSubmit={handleFormSubmit}>
              <div className="modal-title">
                {editingBudget ? "Edit Budget" : "Create Budget"}
                <span className="modal-close" onClick={closeModal}>&times;</span>
              </div>
              <div className="modal-group">
                <label>Category</label>
                <select
                  required
                  className="modern-input"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  <option value="" disabled>Select Category</option>
                  {CATEGORIES.map(cat =>
                    <option key={cat} value={cat}>{cat}</option>
                  )}
                </select>
              </div>
              <div className="modal-group">
                <label>Monthly Limit</label>
                <input
                  type="number"
                  className="modern-input"
                  name="amount"
                  value={form.amount}
                  min="0"
                  step="0.01"
                  onChange={handleFormChange}
                  required
                  placeholder="Monthly Limit"
                />
              </div>
              <div className="modal-group">
                <label>Month</label>
                <select
                  required
                  className="modern-input"
                  name="month"
                  value={form.month}
                  onChange={handleFormChange}
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="modal-group">
                <label>Year</label>
                <input
                  type="number"
                  className="modern-input"
                  name="year"
                  min="2000"
                  max="2100"
                  value={form.year}
                  onChange={handleFormChange}
                  required
                  placeholder="Year"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="action-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button className="add-transaction-btn" type="submit">
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </Layout>
  );
}
