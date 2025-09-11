import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const { token } = useContext(AuthContext);
    const { logout } = useContext(AuthContext);
    const [summary, setSummary] = useState({
        transactions: [],
        budgets: [],
        goals: []
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [txRes, budgetRes, goalRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/v1/transaction`, {
                        headers: { Authorization: `Bearer ${token}`}
                    }),
                    axios.get(`${apiUrl}/api/v1/budget`, {
                        headers: { Authorization: `Bearer ${token}`} 
                    }),
                    axios.get(`${apiUrl}/api/v1/goals`, {
                        headers: { Authorization: `Bearer ${token}`}
                    })
                ]);
                setSummary({
                    transactions:txRes.data.transactions,
                    budgets: budgetRes.data.budgets,
                    goals: goalRes.data.goals
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
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const net = income - expenses;

    return (
        <div>
            <button onClick={ logout }>Logout</button>
            <h1>Finance Dashboard</h1>
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