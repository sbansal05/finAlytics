import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Layout from "../../components/Layout.jsx";
import "../../styles/global.css";
import "./Dashboard.css"
const apiUrl = import.meta.env.VITE_API_URL;

const ALL_CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare"
];

const CATEGORY_COLORS = [
  "#42caff",    // Food - light blue
  "#ffd66b",    // Transportation - soft yellow
  "#ff6b6b",    // Entertainment - coral/red
  "#b5c8df",    // Utilities - light grey blue
  "#63e6be",    // Shopping - mint green
  "#ff9598"     // Healthcare - soft red/pink
];

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [
          summaryRes,
          transRes,
          accountsRes,
          budgetsRes,
          goalsRes,
          catRes,
        ] = await Promise.all([
          axios.get(`${apiUrl}/api/v1/transaction/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/v1/transaction?limit=6`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/v1/account`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/v1/budget`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/v1/goals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/v1/transaction/category-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSummary(summaryRes.data);
        setTransactions(transRes.data.transactions);
        setAccounts(accountsRes.data.accounts);
        setBudgets(budgetsRes.data.budgets);
        setGoals(goalsRes.data.goals);

        const transformedCategoryData = ALL_CATEGORIES.map((cat) => {
          const found = catRes.data.find((item) => item.category.toLowerCase() === cat.toLowerCase());
          return {
            name: cat,
            value: found ? Math.abs(found.totalAmount) : 0,
          };
        });

        setCategoryData(transformedCategoryData);
        setLoading(false);
      } catch (error) {
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    }

    if (token) fetchDashboardData();
  }, [token]);

  if (loading) return <Layout><p>Loading Dashboard...</p></Layout>;
  if (error) return <Layout><p style={{ color: "red" }}>{error}</p></Layout>;

  return (
    <Layout>
      <div className="app-container">

        <div className="card-row">
          <div className="card">
            <div className="label">Total Balance</div>
            <div className="value">${summary.net.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="label">Monthly Income</div>
            <div className="value income">${summary.income.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="label">Monthly Expenses</div>
            <div className="value expense">${Math.abs(summary.expense).toFixed(2)}</div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Transactions</h2>
          <ul className="dashboard-list">
            {transactions.map((tx) => (
              <li key={tx._id}>
                <div>
                  <div className="description" style={{ fontWeight: "bold" }}>
                    {tx.description}
                  </div>
                  <small>
                    {new Date(tx.date).toLocaleDateString()} • {tx.category}
                  </small>
                </div>
                <div
                  className={`amount ${tx.amount >= 0 ? "positive" : "negative"}`}
                >
                  ${Math.abs(tx.amount).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-row">
          <div style={{ flex: 1 }}>
            <h2>Spending by Category</h2>
            {categoryData.length > 0 ? (
              <PieChart width={350} height={250}>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  
                  stroke="#23272f"
                  strokeWidth={2}
                >
                  {categoryData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    color: "#f3f6fa",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                />
              </PieChart>
            ) : (
              <p>No category data to display.</p>
            )}
          </div>
          
        </div>

        

        

        
      </div>
    </Layout>
  );
}
