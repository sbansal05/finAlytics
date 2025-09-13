import React, { useState, useEffect } from "react";

const AccountForm = ({ initialData = { id: null, name: "", type: "", balance: 0 }, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initialData);
    setError("");
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: 
         name === "balance" 
           ? (value === "" ? "" : Number(value))
           : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name) {
      setError("Name is required");
      return;
    }
    if (!form.type) {
      setError("Account type is required");
      return;
    }

    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
      <h3>{form.id ? "Edit Account" : "Add New Account"}</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>

      <div>
        <label>Type:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      <div>
        <label>Balance:</label>
        <input
          name="balance"
          type="number"
          step="1"
          value={form.balance === "" ? "" : form.balance}
          onChange={handleChange}
        />
      </div>

      <button type="submit">{form.id ? "Update Account" : "Add Account"}</button>
      {onCancel && (
        <button type="button" onClick={onCancel} style={{ marginLeft: "1em" }}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default AccountForm;
