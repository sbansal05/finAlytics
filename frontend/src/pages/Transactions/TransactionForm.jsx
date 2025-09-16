import React, { useState } from "react";
import axios from "axios";
import "./TransactionsList.css";

export default function TransactionForm({
  initialData,
  accounts,
  categories,
  onClose,
  token,
  apiUrl
}) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "amount" ? Number(value) : value 
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };

      if (formData._id) {
        // Edit existing transaction
        await axios.put(`${apiUrl}/api/v1/transaction/${formData._id}`, formData, { headers });
      } else {
        // Create new transaction
        await axios.post(`${apiUrl}/api/v1/transaction`, formData, { headers });
      }
      onClose(); // Close modal and refresh parent
    } catch (error) {
      setErrMsg("Failed to save transaction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-title">
          {formData._id ? "Edit Transaction" : "Add Transaction"}
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        
        {errMsg && <div className="modal-error">{errMsg}</div>}
        
        <div className="modal-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            className="modern-input"
            required
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        
        <div className="modal-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            className="modern-input"
            required
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        
        <div className="modal-group">
          <label>Category</label>
          <select
            name="category"
            className="modern-input"
            required
            value={formData.category}
            onChange={handleChange}
          >
            <option value="" disabled>Select Category</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Shopping">Shopping</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Job">Job</option>
            <option value="Clothes">Clothes</option>
            {categories.filter(cat => !['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Job', 'Clothes'].includes(cat)).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="modal-group">
          <label>Account</label>
          <select
            name="accountId"
            className="modern-input"
            required
            value={formData.accountId}
            onChange={handleChange}
          >
            <option value="" disabled>Select Account</option>
            {accounts.map(acc => (
              <option key={acc._id} value={acc._id}>{acc.name}</option>
            ))}
          </select>
        </div>
        
        <div className="modal-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            className="modern-input"
            required
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        
        <div className="modal-group">
          <label>Type</label>
          <select
            name="type"
            className="modern-input"
            required
            value={formData.type}
            onChange={handleChange}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        
        <div className="modal-actions">
          <button
            type="button"
            className="action-btn"
            style={{ background: "#31393e", color: "#ccc" }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button className="add-transaction-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : (formData._id ? "Save Changes" : "Add Transaction")}
          </button>
        </div>
      </form>
    </div>
  );
}
