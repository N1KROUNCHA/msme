import React, { useState, useEffect } from 'react';
import { Book, UserPlus, ArrowUpCircle, ArrowDownCircle, AlertCircle, CheckCircle, ShieldAlert, History, User, Trash2 } from 'lucide-react';
import axios from 'axios';

const LedgerView = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', amount: '', type: 'credit', desc: '' });
    const userId = localStorage.getItem('userId');

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://127.0.0.1:5000/api/ledger/customers/${userId}`);
            setCustomers(res.data);
        } catch (err) {
            console.error("Ledger Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5000/api/ledger/add', {
                userId,
                customerName: formData.name,
                customerPhone: formData.phone,
                amount: Number(formData.amount),
                type: formData.type,
                desc: formData.desc
            });
            setFormData({ name: '', phone: '', amount: '', type: 'credit', desc: '' });
            setShowAddForm(false);
            fetchLedger();
        } catch (err) {
            console.error("Submit Error:", err);
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm("Are you sure you want to delete this account and all its history?")) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/ledger/${id}`);
            setSelectedCustomer(null);
            fetchLedger();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const sendWhatsApp = (customer, type, amount) => {
        const phone = customer.customerPhone;
        if (!phone) {
            alert("Please add a phone number to send WhatsApp updates.");
            return;
        }

        const cleanPhone = phone.replace(/\D/g, '');
        let message = '';

        if (type === 'update') {
            message = `Hello ${customer.customerName},\n\nThis is a friendly reminder of your current ledger balance with us.\n\n*Total Outstanding Balance:* ₹${customer.totalUdhaar}\n\nKindly clear the dues at your earliest convenience. Thank you!`;
        } else {
            const entryType = type === 'payment' ? '✅ Payment Received' : '🔴 New Udhaar (Debt)';
            message = `Hello ${customer.customerName},\n\nA new entry has been recorded in your ledger:\n\n*${entryType}:* ₹${amount}\n*Current Total Balance:* ₹${customer.totalUdhaar}\n\nThank you for choosing us!`;
        }

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const getRiskColor = (prob) => {
        if (prob > 0.8) return '#10b981';
        if (prob > 0.5) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="ledger-container" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Book color="#6366f1" size={28} /> AI Digital Ledger (Udhaar)
                    </h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Smart credit management with recovery probability analysis</p>
                </div>
                <button onClick={() => setShowAddForm(true)} className="primary-btn" style={{ width: 'auto', display: 'flex', gap: '8px' }}>
                    <UserPlus size={18} /> New Account
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>TOTAL OUTSTANDING (UDHAAR)</label>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px', color: '#ef4444' }}>
                        ₹{customers.reduce((acc, c) => acc + c.totalUdhaar, 0)}
                    </div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>TOTAL CUSTOMERS</label>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>
                        {customers.length}
                    </div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#166534' }}>RECOVERY SCORE (AI)</label>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px', color: '#10b981' }}>
                        {customers.length > 0 ? (customers.reduce((acc, c) => acc + c.recoveryProbability, 0) / customers.length * 100).toFixed(0) : 0}%
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Customer List */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                    <div style={{ padding: '1.2rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>All Accounts</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{customers.length} total</span>
                    </div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {customers.map((c, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedCustomer(c)}
                                style={{
                                    padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                    background: selectedCustomer?._id === c._id ? '#f5f7ff' : 'transparent',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{c.customerName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.customerPhone || 'No link'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '800', color: c.totalUdhaar > 0 ? '#ef4444' : '#10b981' }}>₹{c.totalUdhaar}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: getRiskColor(c.recoveryProbability) }}>
                                        {Math.round(c.recoveryProbability * 100)}% Recoverable
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Details / History */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                    {selectedCustomer ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{selectedCustomer.customerName}</h3>
                                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>{selectedCustomer.customerPhone || 'No phone number provided'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleDeleteAccount(selectedCustomer._id)}
                                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                        title="Delete Account"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>CREDIT STATUS</div>
                                        <div style={{ fontWeight: '800', color: selectedCustomer.status === 'Active' ? '#f59e0b' : '#10b981' }}>{selectedCustomer.status}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem' }}>
                                <button
                                    onClick={() => {
                                        setFormData({ name: selectedCustomer.customerName, phone: selectedCustomer.customerPhone, amount: '', type: 'payment', desc: 'Repayment' });
                                        setShowAddForm(true);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
                                        borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    <CheckCircle size={18} /> Record Payment
                                </button>
                                <button
                                    onClick={() => {
                                        setFormData({ name: selectedCustomer.customerName, phone: selectedCustomer.customerPhone, amount: '', type: 'credit', desc: '' });
                                        setShowAddForm(true);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '12px', background: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3',
                                        borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    <ShieldAlert size={18} /> Add New Debt
                                </button>
                            </div>

                            {/* AI Analysis Section */}
                            <div style={{ background: '#eef2ff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #dbeafe', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} color="#6366f1" /> AI Recovery Analysis
                                </h4>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                                            {selectedCustomer.recoveryProbability > 0.7
                                                ? "Customer has a consistent repayment history. Low risk for balance expansion."
                                                : "Warning: High debt-to-payment ratio detected. Suggest halting further credit until current balance is cleared."}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: getRiskColor(selectedCustomer.recoveryProbability) }}>
                                            {(selectedCustomer.recoveryProbability * 100).toFixed(0)}%
                                        </div>
                                        <small style={{ fontSize: '0.65rem', color: '#64748b' }}>RECOVERY PROB</small>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} /> History</h4>
                                <button
                                    onClick={() => sendWhatsApp(selectedCustomer, 'update', '0')}
                                    style={{ fontSize: '0.8rem', background: '#25D366', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    WhatsApp Reminder
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                {selectedCustomer.transactions.slice().reverse().map((t, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{t.desc || 'General Entry'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(t.date).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: t.type === 'credit' ? '#ef4444' : '#10b981' }}>
                                                {t.type === 'credit' ? '+' : '-'} ₹{t.amount}
                                            </div>
                                            <button
                                                onClick={() => sendWhatsApp(selectedCustomer, t.type, t.amount)}
                                                style={{ fontSize: '0.65rem', border: '1px solid #25D366', color: '#25D366', background: 'white', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}
                                            >
                                                Share via WA
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <User size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                            Select a customer to view Udhaar details and AI analysis.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Form Modal Overlay */}
            {showAddForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <h3 style={{ marginTop: 0 }}>{formData.name ? `Update ${formData.name}` : 'New Ledger Account'}</h3>
                        <form onSubmit={handleSubmit}>
                            {!selectedCustomer && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Customer Name</label>
                                    <input
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>WhatsApp Number</label>
                                <input
                                    required
                                    placeholder="Enter 10-digit number"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
                                    <input
                                        type="number" required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Type</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="credit">He took Udhaar</option>
                                        <option value="payment">He paid back</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description</label>
                                <input
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    placeholder="Milk, Eggs, etc."
                                    value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => {
                                    setShowAddForm(false);
                                    setFormData({ name: '', phone: '', amount: '', type: 'credit', desc: '' });
                                }} className="secondary-btn">Cancel</button>
                                <button type="submit" className="primary-btn">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LedgerView;
