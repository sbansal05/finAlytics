import React, { useState, useEffect } from "react";
import "../../styles/global.css";
import "./Accounts.css";

export default function AccountForm({
  initialData,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "balance" ? Number(value) : value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
    if (!formData.id) {
      setFormData({ id: null, name: "", type: "", balance: 0 });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="modern-form"
      style={{
        background: "#23272f",
        borderRadius: 13,
        padding: "28px 35px 22px 35px",
        boxShadow: "0 3px 14px 1px #15181c70",
        maxWidth: 410,
        marginBottom: 34,
        marginTop: 10,
      }}
    >
      <div
        className="modern-form-title"
        style={{ fontWeight: 800, fontSize: "1.22rem", color: "#fff", marginBottom: 18 }}
      >
        {formData.id ? "Edit Account" : "Add New Account"}
      </div>
      <div style={{ marginBottom: 13 }}>
        <label className="modern-label" htmlFor="name">
          Name
        </label>
        <input
          className="modern-input"
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          required
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div style={{ marginBottom: 13 }}>
        <label className="modern-label" htmlFor="type">
          Type
        </label>
        <select
          className="modern-input"
          id="type"
          name="type"
          required
          value={formData.type}
          onChange={handleChange}
        >
          <option value="" disabled>
            Select Type
          </option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit</option>
        </select>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="modern-label" htmlFor="balance">
          Balance
        </label>
        <input
          className="modern-input"
          id="balance"
          name="balance"
          type="number"
          required
          value={formData.balance}
          onChange={handleChange}
        />
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            type="button"
            className="action-btn"
            style={{ background: "#31393e", color: "#ccc" }}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button className="add-account-btn" type="submit">
          {formData.id ? "Save Changes" : "Add Account"}
        </button>
      </div>
    </form>
  );
}
