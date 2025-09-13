import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#336AAA'];

export default function Dashboard() {
    const { token } = useContext(AuthContext);
    const { logout } = useContext(AuthContext);
    const [summary, setSummary] = useState({
        transactions: [],
        budgets: [],
        goals: [],
        accounts: []
    });
    function getExpensesByCategory(transactions) {
        const expenses = transactions.filter(tx => tx.type === "expense");
        const categoryMap = {};

        expenses.forEach(tx => {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Math.abs(tx.amount);
        });

        return Object.entries(categoryMap).map(([category, amount]) => ({ category, amount}));
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const [txRes, budgetRes, goalRes, accRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/v1/transaction`, {
                        headers: { Authorization: `Bearer ${token}`}
                    }),
                    axios.get(`${apiUrl}/api/v1/budget`, {
                        headers: { Authorization: `Bearer ${token}`} 
                    }),
                    axios.get(`${apiUrl}/api/v1/goals`, {
                        headers: { Authorization: `Bearer ${token}`}
                    }),
                    axios.get(`${apiUrl}/api/v1/account`, {
                        headers: {Authorization: `Bearer ${token}`}
                    })
                ]);
                setSummary({
                    transactions:txRes.data.transactions,
                    budgets: budgetRes.data.budgets,
                    goals: goalRes.data.goals,
                    accounts: accRes.data.accounts
                });
            } catch (error) {
                alert("Error fetching dashboard data")
            }
        }
        if (token) fetchData();
    }, [token]);

    const income = summary.transactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = summary.transactions
        .filter(tx => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const net = income - expenses;

    const expensesData = getExpensesByCategory(summary.transactions);

    return (
        <div>
            <button onClick={ logout }>Logout</button>
            <h1>Finance Dashboard</h1>

            <h2>Expense Breakdown by Category</h2>
            {expensesData.length ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                           data={expensesData}
                           dataKey="amount"
                           nameKey="category"
                           cx="50%"
                           cy="50%"
                           outerRadius={100}
                           fill="#8884d8"
                           label
                        >
                            {expensesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p>No expense data available</p>
            )}
            <h3>Summary</h3>
            <p>Total Income: ${income.toFixed(2)}</p>
            <p>Total Expenses: ${expenses.toFixed(2)}</p>
            <p>Net Balance: ${net.toFixed(2)}</p>
            
            <h2>Recent Transactions ({summary.transactions.length})</h2>
            <ul>
                {summary.transactions.slice(0, 3).map(tx => (
                    <li key={tx._id}>{tx.description} - {tx.amount}</li>
                ))}
            </ul>
            <h2>Accounts ({summary.accounts.length})</h2>
            {summary.accounts && summary.accounts.length ? (
                <ul>
                    {summary.accounts.map(acc => (
                        <li key={acc._id}>
                            {acc.name} ({acc.type}) &mdash; Balance: ${acc.balance.toFixed(2)}
                        </li>
                    ))}
                </ul>
            ) : <p>No accounts found</p>}
           
            <h2>Budgets ({summary.budgets.length})</h2>
            <ul>
                {summary.budgets.slice(0, 3).map(b => (
                    <li key={b._id}>{b.category}: ({b.amount})</li>
                ))}
            </ul>
            <h2>Goals ({summary.goals.length})</h2>
            <ul>
                {summary.goals.slice(0, 3).map(g => (
                    <li key={g._id}>{g.title}: {g.currentAmount}/{g.targetAmount}</li>
                ))}
            </ul>
        </div>
    );
}