import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import "./Goals.css";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Goals() {
  const { token } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    fetchGoals();
  }, [token]);

  async function fetchGoals() {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data.goals);
    } catch {
      alert("Failed to fetch goals");
    }
  }

  function openCreateGoal() {
    setEditingGoal(null);
    setForm({
      title: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: "",
      description: "",
    });
    setShowModal(true);
  }

  function openEditGoal(goal) {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : "",
      description: goal.description || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setEditingGoal(null);
    setShowModal(false);
    setForm({
      title: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
      description: "",
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingGoal) {
        await axios.put(`${apiUrl}/api/v1/goals/${editingGoal._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${apiUrl}/api/v1/goals`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
      fetchGoals();
    } catch {
      alert("Failed to save goal");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await axios.delete(`${apiUrl}/api/v1/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
    } catch {
      alert("Failed to delete goal");
    }
  }

  // Progress calculations
  function progress(goal) {
    const curr = Number(goal.currentAmount) || "";
    const target = Number(goal.targetAmount) || "";
    return Math.min(100, ((curr / target) * 100).toFixed(1));
  }
  function remaining(goal) {
    return Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));
  }
  function isOverdue(goal) {
    const today = (new Date()).toISOString().slice(0, 10);
    return goal.deadline && goal.deadline.slice(0, 10) < today && Number(goal.currentAmount) < Number(goal.targetAmount);
  }

  return (
    <Layout>
      <section className="goals-section">
        <div className="goals-header-row">
          <span className="goals-title">Financial Goals</span>
          <button className="create-goal-btn" onClick={openCreateGoal}>
            Create Goal
          </button>
        </div>
        <div className="goals-grid">
          {goals.map(goal => (
            <div className="goal-card" key={goal._id}>
              <div className="goal-row">
                <div>
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-desc">{goal.description || "\u00A0"}</div>
                </div>
                <div className="goal-editdel">
                  <button className="action-btn" onClick={() => openEditGoal(goal)}>Edit</button>
                  <button className="action-btn" onClick={() => handleDelete(goal._id)}>Delete</button>
                </div>
              </div>
              <div className="goal-bar-wrap">
                <div className="goal-bar-bg">
                  <div
                    className="goal-bar-fg"
                    style={{ width: `${progress(goal)}%` }}
                  />
                </div>
                <div className="goal-bar-labels">
                  <span>{progress(goal)}% complete</span>
                  {isOverdue(goal) && <span className="goal-overdue">Overdue</span>}
                </div>
              </div>
              <div className="goal-amounts">
                <div>
                  <span className="goal-amount">${Number(goal.currentAmount).toLocaleString()}</span>
                  <span className="goal-amount-label">Current</span>
                </div>
                <div>
                  <span className="goal-amount">${Number(goal.targetAmount).toLocaleString()}</span>
                  <span className="goal-amount-label">Target</span>
                </div>
              </div>
              <div className="goal-remaining">
                <span className="goal-remain-amt">${remaining(goal).toLocaleString()} remaining</span>
              </div>
            </div>
          ))}
        </div>
        {/* MODAL FORM */}
        {showModal && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-title">
                {editingGoal ? "Edit Goal" : "Create Goal"}
                <span className="modal-close" onClick={closeModal}>&times;</span>
              </div>
              <div className="modal-group">
                <label>Goal Title</label>
                <input
                  className="modern-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modal-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  className="modern-input"
                  name="targetAmount"
                  value={form.targetAmount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modal-group">
                <label>Current Amount</label>
                <input
                  type="number"
                  className="modern-input"
                  name="currentAmount"
                  value={form.currentAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="modal-group">
                <label>Target Date</label>
                <input
                  type="date"
                  className="modern-input"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modal-group">
                <label>Description</label>
                <textarea
                  className="modern-input"
                  name="description"
                  value={form.description}
                  rows={2}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="action-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button className="create-goal-btn" type="submit">
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </Layout>
  );
}
