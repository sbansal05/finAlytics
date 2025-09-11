import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

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
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return ;
        try {
            await axios.delete(`${apiUrl}/api/v1/transaction/${id}`, {
                headers: { Authorization: `Bearer ${token}`}
            });
            setTransactions(prev => prev.filter(tx => tx._id !== id));
        } catch (error) {
            alert("Failed to delete transaction");
        }
    }


    return (
        <div>
            <Link to="/transactions/add">
                <button>Add Transaction</button>
            </Link>
            <h2>Your Transactions</h2>
            {transactions.length === 0 ? (
            <p>No transactions found.</p>
            ) : (
                <ul>
                    {transactions.map(tx => (
                        <li key={tx._id}>
                            {tx.description} - ${tx.amount} on {new Date(tx.date).toLocaleDateString()}
                            {" "}
                            <Link to={`/transactions/edit/${tx._id}`}>
                                <button>Edit</button>
                            </Link>
                            <button onClick={() => handleDelete(tx._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
