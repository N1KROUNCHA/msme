import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const FinanceView = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeFinanceTab, setActiveFinanceTab] = useState('transactions');
    const userId = localStorage.getItem('userId');

    // New Transaction Form
    const [newTx, setNewTx] = useState({ desc: '', amount: '', type: 'Income', date: '', category: 'General' });

    const fetchTransactions = () => {
        fetch(`http://127.0.0.1:5000/api/finance/${userId}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTransactions();
    }, [userId]);

    const handleAddTransaction = (e) => {
        e.preventDefault();

        // Preserve current time to ensure sorting puts this at the top
        const selectedDate = new Date(newTx.date);
        const now = new Date();
        // If selected date is today, use current time. Otherwise default to noon.
        if (selectedDate.toDateString() === now.toDateString()) {
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        } else {
            selectedDate.setHours(12, 0, 0);
        }

        fetch('http://127.0.0.1:5000/api/finance/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newTx, date: selectedDate, userId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.transaction) {
                    alert('Transaction Recorded!');
                    setShowModal(false);
                    setNewTx({ desc: '', amount: '', type: 'Income', date: '', category: 'General' });
                    fetchTransactions(); // Refresh
                }
            })
            .catch(err => console.error(err));
    };

    // Calculate Totals using Real Data
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    if (loading) return <div className="loading">Loading Financial Data...</div>;

    return (
        <div className="view-container">
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Finance & Cashflow</h2>
                <div style={{ display: 'flex', gap: '10px' }}>

                    <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
                        <Plus size={18} style={{ marginRight: 5 }} /> Record Entry
                    </button>
                </div>
            </div>

            <>
                <div className="finance-summary">
                    <div className="f-card income">
                        <span>Total Income</span>
                        <h3>₹{totalIncome}</h3>
                    </div>
                    <div className="f-card expense">
                        <span>Total Expense</span>
                        <h3>₹{totalExpense}</h3>
                    </div>
                    <div className="f-card balance">
                        <span>Net Balance</span>
                        <h3>₹{netBalance}</h3>
                    </div>
                </div>

                <div className="finance-legend" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>📈 Understanding Your Metrics</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        <li><strong>Total Income:</strong> Sum of all money received from sales or services.</li>
                        <li><strong>Total Expense:</strong> Sum of all outgoing costs (stock, utilities, rent).</li>
                        <li><strong>Net Balance:</strong> Your actual profit/savings (Income - Expense). Keep this green!</li>
                    </ul>
                </div>

                <h3>Recent Transactions</h3>
                {transactions.length === 0 ? <p style={{ color: '#64748b', padding: '1rem' }}>No transactions recorded yet.</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t._id}>
                                    <td>
                                        {new Date(t.date).toLocaleDateString()}
                                        <div style={{ fontSize: '0.8em', color: '#64748b' }}>
                                            {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>{t.desc}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            color: t.type === 'Income' ? 'var(--success)' : 'var(--error)',
                                            fontWeight: 600
                                        }}>
                                            {t.type === 'Income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                            {t.type}
                                        </span>
                                    </td>
                                    <td>₹{t.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Record New Transaction</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleAddTransaction}>
                            <div className="form-group">
                                <label>Description</label>
                                <input required type="text" placeholder="e.g. Sold Goods" value={newTx.desc} onChange={e => setNewTx({ ...newTx, desc: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input required type="number" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })}>
                                    <option value="Income">Income (+)</option>
                                    <option value="Expense">Expense (-)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}>
                                    <option value="General">General</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input required type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} />
                            </div>
                            <button type="submit" className="primary-btn">Save Record</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceView;
