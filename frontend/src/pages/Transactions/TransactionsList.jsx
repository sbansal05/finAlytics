import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

export default function TransactionList() {
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                setLoading(true);
                const res = await axios.get(`${apiUrl}/api/v1/transaction`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(res.data.transactions);
                setLoading(false);
            } catch (error) {
                setError("Failed to load transactions");
                setLoading(false);
            }
        }
        if (token) {
            fetchTransactions()
        }
    }, [token]);

    if (loading) {
        return <p>
            Loading Transactions...
        </p>
    }
    if (error) {
        return <p style={{color: "red"}}>{error}</p>
    }
    if (!transactions.length) {
        return <p>
            No transactions found
        </p>
    }

    return (
        <div>
            <h2>Your Transactions</h2>
            <ul>
                {transactions.map((tx) => (
                    <li ket={tx._id}>
                        {tx.description} - ${tx.amount} on {new Date(tx.date).toLocalDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}