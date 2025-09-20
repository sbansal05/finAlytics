import React, { useState } from "react";
import "./Layout.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button
          className="sidebar-close-btn"
          onClick={closeSidebar}
          aria-label="Close Sidebar"
        >
          ×
        </button>

        <div className="sidebar-logo">Finance Dashboard</div>
        <ul className="sidebar-nav" onClick={closeSidebar}>
          <li><a href="/dashboard" className="active">Dashboard</a></li>
          <li><a href="/transactions">Transactions</a></li>
          <li><a href="/accounts">Accounts</a></li>
          <li><a href="/budgets">Budgets</a></li>
          <li><a href="/goals">Goals</a></li>
        </ul>
      </div>

      <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        {children}
      </main>
    </>
  );
}
