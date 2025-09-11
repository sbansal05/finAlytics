import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate, useParams } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

export default function TransactionForm() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        date: "",
        category: "",
        accountId: "",
        type: ""
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        async function fetchAccounts() {
            try {
                const res = await axios.get(`${apiUrl}/api/v1/account`, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setAccounts(res.data.accounts);
            } catch (error) {
                
            }
            
        }
        if (token) fetchAccounts();
    }, [token]);

    useEffect(() => {
        if (id) {
            async function fetchTransaction() {
                try {
                    setLoading(true);
                    const res = await axios.get(`${apiUrl}/api/v1/transaction/${id}`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    setFormData({
                        description: res.data.transaction.description,
                        amount: res.data.transaction.amount,
                        date: res.data.transaction.date.slice(0, 10),
                        category: res.data.transaction.category
                    });
                    setLoading(false);
                } catch (error) {
                    setError("Failed to load transaction");
                    setLoading(false);
                }
            }
            fetchTransaction();
        }
    }, [id, token]);

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        console.log('Submit payload:', formData);

        if (
            !formData.accountId ||
            !formData.description ||
            !formData.amount ||
            !formData.date ||
            !formData.category || 
            !formData.type
        ) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                accountId: formData.accountId,
                amount: Number(formData.amount),
                description: formData.description,
                category: formData.category,
                type: formData.type,
                date: formData.date
                
            };

            if (id) {
                await axios.put(`${apiUrl}/api/v1/transaction/${id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                await axios.post(`${apiUrl}/api/v1/transaction`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            }

            setLoading(false);
            navigate("/transactions");
        } catch (error) {
            setError("Failed to save transaction");
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <h2>{id ? 'Edit': "Add"} Transaction</h2>
            {error && <p style={{ color: "red"}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Account:</label>
                    <select
                        name="accountId"
                        value={formData.accountId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Account</option>
                        {accounts.map(acc => (
                            <option key={acc._id} value={acc._id}>
                                {acc.name} ({acc.type}): Balance ${acc.balance}
                            </option>
                        ))}
                    </select>
                </div>


                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        step="1"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div>
                <label>Category:</label>
                <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                />
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Type:</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <button type="submit">{id ? "Update" : "Add"} Transaction</button>
            </form>
        </div>
    );
}