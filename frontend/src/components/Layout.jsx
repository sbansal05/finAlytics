import React from "react";
import { NavLink } from "react-router-dom";
import "./Layout.css"
export default function Layout({ children }) {
  return (
    <div className="layout-container"> {/* flex container */}
      <nav className="sidebar">
        <div className="sidebar-logo">Finance Dashboard</div>
        <ul className="sidebar-nav">
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
          <li><NavLink to="/transactions" className={({ isActive }) => isActive ? "active" : ""}>Transactions</NavLink></li>
          <li><NavLink to="/accounts" className={({ isActive }) => isActive ? "active" : ""}>Accounts</NavLink></li>
          <li><NavLink to="/budgets" className={({ isActive }) => isActive ? "active" : ""}>Budgets</NavLink></li>
          <li><NavLink to="/goals" className={({ isActive }) => isActive ? "active" : ""}>Goals</NavLink></li>
        </ul>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
