import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Goals() {
  const { token } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: ""
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function startEdit(goal) {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? goal.deadline.slice(0,10) : ""  // format for input[type=date]
    });
  }

  function handleCancel() {
    setEditingGoal(null);
    setForm({
      title: "",
      targetAmount: "",
      currentAmount: "",
      deadline: ""
    });
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
      handleCancel();
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

  return (
    <div>
      <h1>Goals</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Goal Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="targetAmount"
          type="number"
          placeholder="Target Amount"
          value={form.targetAmount}
          onChange={handleChange}
          required
        />
        <input
          name="currentAmount"
          type="number"
          placeholder="Current Amount"
          value={form.currentAmount}
          onChange={handleChange}
        />
        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingGoal ? "Update" : "Add"} Goal</button>
        {editingGoal && (
          <button type="button" onClick={handleCancel} style={{ marginLeft: "1em" }}>
            Cancel
          </button>
        )}
      </form>

      <ul>
        {goals.map(goal => (
          <li key={goal._id}>
            <strong>{goal.title}</strong> — Progress: ${goal.currentAmount || 0} / ${goal.targetAmount} — Deadline:{" "}
            {goal.deadline ? goal.deadline.slice(0, 10) : "N/A"}
            <button onClick={() => startEdit(goal)} style={{ marginLeft: "1em" }}>
              Edit
            </button>
            <button onClick={() => handleDelete(goal._id)} style={{ marginLeft: "0.5em" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
