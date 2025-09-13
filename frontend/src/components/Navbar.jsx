import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "1em", background: "#eee" }}>
      <Link to="/dashboard" style={{ marginRight: "1em" }}>Dashboard</Link>
      <Link to="/transactions" style={{ marginRight: "1em" }}>Transactions</Link>
      <Link to="/accounts" style={{ marginRight: "1em" }}>Accounts</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
