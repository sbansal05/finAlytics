import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post("http://localhost:4000/api/v1/auth/signup", formData);
      if (res.data.token) {
        login(res.data.token);
        navigate("/dashboard");
      } else {
        setError("Signup failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <h2>Signup</h2>
        {error && <div className="error-msg">{error}</div>}
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" value={formData.email} onChange={handleChange} required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        <button type="submit">Sign Up</button>
      </form>
      <button
        type="button"
        onClick={() => navigate("/login")}
        style={{
          marginTop: "1rem",
          background: "transparent",
          color: "#3399ff",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          fontSize: "1rem"
        }}
      >
        Already have an account? Log In
      </button>

    </div>
  );
}
