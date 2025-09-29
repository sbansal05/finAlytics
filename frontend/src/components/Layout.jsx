import React, { useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Layout.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {sidebarOpen && (
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close Sidebar"
          >
            ×
          </button>
        )}

        <div className="sidebar-logo">finAlytics</div>

        <nav>
          <ul className="sidebar-nav" onClick={closeSidebar}>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/transactions">Transactions</a></li>
            <li><a href="/accounts">Accounts</a></li>
            <li><a href="/budgets">Budgets</a></li>
            <li><a href="/goals">Goals</a></li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <Outlet />
      </main>
    </>
  );
}
