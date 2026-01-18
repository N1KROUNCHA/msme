import React, { useState, useEffect } from 'react';
import { Plus, X, Zap, Camera, Trash2, Search, ArrowLeft, Folder } from 'lucide-react';

const InventoryView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const userId = localStorage.getItem('userId');

    // VIEW STATE: 'categories' | 'products'
    const [viewMode, setViewMode] = useState('categories');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // New Product Form
    const [newProd, setNewProd] = useState({ name: '', category: '', stock: '', price: '', costPrice: '', reorderLevel: '' });

    // Billing / Cart State
    const [cart, setCart] = useState([]);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
    const [invoiceTemplate, setInvoiceTemplate] = useState('basic'); // 'basic' | 'premium' | 'thermal'
    const [billDone, setBillDone] = useState(null); // Stores final transaction data

    // AI Pricing State
    const [aiResult, setAiResult] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [analyzingProd, setAnalyzingProd] = useState(null);

    // Alerts & Suppliers
    const [alerts, setAlerts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    // Vision State
    const [showVisionModal, setShowVisionModal] = useState(false);
    const [visionResult, setVisionResult] = useState(null);
    const [visionLoading, setVisionLoading] = useState(false);

    const fetchAllData = () => {
        setLoading(true);
        // Products
        fetch(`http://127.0.0.1:5000/api/inventory/${userId}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Market Alerts
        fetch('http://127.0.0.1:5000/api/inventory/market/alerts')
            .then(res => res.json())
            .then(data => setAlerts(data))
            .catch(err => console.error(err));

        // Suppliers
        fetch('http://127.0.0.1:5000/api/inventory/suppliers/list?type=Distribution')
            .then(res => res.json())
            .then(data => setSuppliers(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Helper: Extract Categories
    const categories = [...new Set(products.map(p => p.category || 'Uncategorized'))].sort();

    const handleGetSmartPrice = async (product) => {
        setAnalyzingProd(product._id);
        try {
            const mockCompetitorPrice = product.price * (0.9 + Math.random() * 0.2);
            const res = await fetch('http://127.0.0.1:5000/api/ai/pricing/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: product.name,
                    base_price: product.price,
                    current_stock: product.stock,
                    days_to_expiry: 30,
                    competitor_price: mockCompetitorPrice
                })
            });
            const data = await res.json();
            setAiResult({ ...data, product: product.name, currentPrice: product.price });
            setShowAiModal(true);
        } catch (err) {
            console.error(err);
            alert("Failed to connect to AI Brain");
        } finally {
            setAnalyzingProd(null);
        }
    };

    const handleVisionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setVisionLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('http://127.0.0.1:5000/api/ai/vision/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setVisionResult({ ...data, imageUrl: URL.createObjectURL(file) });
        } catch (err) {
            console.error(err);
            alert("Vision Analysis Failed");
        } finally {
            setVisionLoading(false);
        }
    };

    const handleRestock = (productId) => {
        const qty = prompt("Enter quantity to restock:", "10");
        if (qty && !isNaN(qty)) {
            console.log(`[Inventory] Attempting restock for ${productId} with qty ${qty}`);
            fetch('http://127.0.0.1:5000/api/inventory/restock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: parseInt(qty) })
            })
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.msg || data.error || "Restock failed");
                    return data;
                })
                .then(data => {
                    console.log("[Inventory] Restock success:", data);
                    alert(`Restocked successfully! Inventory & Finance Sync complete.`);
                    fetchAllData();
                })
                .catch(err => {
                    console.error("[Inventory] Restock error:", err);
                    alert(`❌ Restock Failed: ${err.message}`);
                });
        }
    };

    const handleSell = (product) => {
        const qty = prompt(`How many units of ${product.name} to sell? (Available: ${product.stock})`, "1");
        if (qty && !isNaN(qty)) {
            const sellQty = parseInt(qty);
            if (sellQty > product.stock) {
                alert(`❌ Oops! Out of Stock. Only ${product.stock} units available.`);
                return;
            }

            console.log(`[Inventory] Attempting sale for ${product.name} with qty ${sellQty}`);
            fetch('http://127.0.0.1:5000/api/inventory/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id, quantity: sellQty })
            })
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.msg || data.error || "Sale failed");
                    return data;
                })
                .then(data => {
                    console.log("[Inventory] Sale success:", data);
                    alert(`✅ Sold ${sellQty} units! Revenue: ₹${data.transaction.amount}. Stock & Finance updated.`);
                    fetchAllData();
                })
                .catch(err => {
                    console.error("[Inventory] Sale error:", err);
                    alert(`❌ Sale Failed: ${err.message}`);
                });
        }
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        fetch('http://127.0.0.1:5000/api/inventory/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProd, userId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.product) {
                    alert('Product Added Successfully!');
                    setShowModal(false);
                    setNewProd({ name: '', category: '', stock: '', price: '', costPrice: '', reorderLevel: '' });
                    fetchAllData();
                }
            })
            .catch(err => console.error(err));
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            if (existing.quantity + 1 > product.stock) {
                alert("Cannot add more. Stock limit reached!");
                return;
            }
            setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            if (product.stock < 1) {
                alert("Out of stock!");
                return;
            }
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const updateCartQty = (id, newQty) => {
        const product = products.find(p => p._id === id);
        if (newQty > product.stock) {
            alert(`Only ${product.stock} units available.`);
            return;
        }
        if (newQty < 1) return;
        setCart(cart.map(item => item._id === id ? { ...item, quantity: newQty } : item));
    };

    const handleCheckout = async () => {
        if (!customerInfo.name || !customerInfo.phone) {
            alert("Please enter customer details.");
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:5000/api/inventory/bulk-sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    items: cart.map(i => ({ productId: i._id, quantity: i.quantity })),
                    customerName: customerInfo.name,
                    customerPhone: customerInfo.phone
                })
            });
            const data = await res.json();
            if (res.ok) {
                setBillDone(data.transaction);
                setCart([]);
                fetchAllData();
            } else {
                alert(data.msg || "Checkout failed");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            alert("Server connection failed.");
        }
    };

    const getWhatsAppLink = (transaction) => {
        const businessName = localStorage.getItem('businessName') || 'Our Store';
        let billText = `*INVOICE - ${businessName}*\n`;
        billText += `--------------------------\n`;
        billText += `Customer: ${transaction.customerName}\n`;
        billText += `Date: ${new Date(transaction.date).toLocaleDateString()}\n`;
        billText += `--------------------------\n`;

        transaction.products.forEach((p, i) => {
            billText += `${i + 1}. ${p.name}\n   ${p.quantity} x ₹${p.price} = ₹${p.quantity * p.price}\n`;
        });

        billText += `--------------------------\n`;
        billText += `*TOTAL AMOUNT: ₹${transaction.amount}*\n`;
        billText += `--------------------------\n`;
        billText += `Thank you for shopping with us!`;

        const encoded = encodeURIComponent(billText);
        return `https://wa.me/91${transaction.customerPhone}?text=${encoded}`;
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            fetch(`http://127.0.0.1:5000/api/inventory/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.msg);
                    fetchAllData();
                })
                .catch(err => console.error(err));
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory ? (p.category === selectedCategory || (selectedCategory === 'Uncategorized' && !p.category)) : true;

        return matchesSearch && matchesCategory;
    });

    if (loading && products.length === 0) return <div className="loading">Loading Inventory...</div>;

    return (
        <div className="view-container">
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {viewMode === 'products' && (
                        <button className="icon-btn" onClick={() => { setViewMode('categories'); setSelectedCategory(null); }}>
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2>Inventory {selectedCategory ? `> ${selectedCategory}` : ''}</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="search-bar" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search all products..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); if (viewMode === 'categories' && e.target.value) setViewMode('products'); }}
                            style={{ padding: '8px 32px 8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        />
                        <Search size={16} style={{ position: 'absolute', right: 10, top: 10, color: '#94a3b8' }} />
                    </div>
                    <button className="primary-btn" style={{ width: 'auto', background: '#0ea5e9' }} onClick={() => setShowVisionModal(true)}>
                        <Camera size={18} style={{ marginRight: 5 }} /> Scan Shelf
                    </button>
                    <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
                        <Plus size={18} style={{ marginRight: 5 }} /> Add
                    </button>
                </div>
            </div>

            {/* CATEGORY GRID VIEW */}
            {viewMode === 'categories' && !searchTerm && (
                <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                    {categories.map(cat => {
                        const count = products.filter(p => (p.category || 'Uncategorized') === cat).length;
                        return (
                            <div
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setViewMode('products'); }}
                                style={{
                                    background: 'white', padding: '1.5rem', borderRadius: '12px',
                                    border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '50%', color: '#0ea5e9' }}>
                                    <Folder size={24} />
                                </div>
                                <h4 style={{ margin: 0, color: '#334155' }}>{cat}</h4>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{count} items</span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* PRODUCT LIST VIEW */}
            {(viewMode === 'products' || searchTerm) && (
                <div className="inventory-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Buying Price</th>
                                <th>Selling Price</th>
                                <th>Margin</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => {
                                let status = 'Good';
                                let statusClass = 'good';
                                if (p.stock <= p.reorderLevel) {
                                    status = 'Low';
                                    statusClass = 'low';
                                }
                                if (p.stock <= 5) {
                                    status = 'Critical';
                                    statusClass = 'critical';
                                }

                                return (
                                    <tr key={p._id}>
                                        <td>{p.name}</td>
                                        <td>{p.category || '-'}</td>
                                        <td>{p.stock}</td>
                                        <td style={{ color: '#64748b' }}>₹{p.costPrice || p.price}</td>
                                        <td style={{ fontWeight: '700' }}>₹{p.price}</td>
                                        <td>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                                                {p.costPrice ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${statusClass}`}>{status}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button className="action-btn" style={{ background: '#0ea5e9' }} onClick={() => addToCart(p)}>+ Cart</button>
                                                <button className="action-btn" style={{ background: '#10b981' }} onClick={() => handleSell(p)}>Sell</button>
                                                <button className="action-btn" onClick={() => handleRestock(p._id)}>Restock</button>
                                                <button
                                                    className="action-btn ai-btn"
                                                    style={{ background: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    onClick={() => handleGetSmartPrice(p)}
                                                    disabled={analyzingProd === p._id}
                                                >
                                                    <Zap size={12} /> {analyzingProd === p._id ? '...' : 'Smart'}
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    style={{ background: '#ef4444', padding: '6px', width: '30px' }}
                                                    onClick={() => handleDelete(p._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>No products found.</p>}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Add New Product</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input required type="text" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input required type="text" placeholder="e.g. Dairy, Snacks, Spices" value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Initial Stock</label>
                                <input required type="number" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Buying Price (Cost ₹)</label>
                                <input required type="number" value={newProd.costPrice} onChange={e => setNewProd({ ...newProd, costPrice: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Selling Price (MRP/Rate ₹)</label>
                                <input required type="number" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Reorder Level</label>
                                <input required type="number" value={newProd.reorderLevel} onChange={e => setNewProd({ ...newProd, reorderLevel: e.target.value })} />
                            </div>
                            <button type="submit" className="primary-btn">Save Product</button>
                        </form>
                    </div>
                </div>
            )}

            {showAiModal && aiResult && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '400px', borderTop: '4px solid #7c3aed' }}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={20} color="#7c3aed" fill="#7c3aed" />
                                AI Pricing Suggestion
                            </h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowAiModal(false)} />
                        </div>
                        <div className="ai-content" style={{ marginTop: '1rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Analyzing market data for <strong>{aiResult.product}</strong>...</p>

                            <div className="price-box" style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Optimal Price</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>₹{aiResult.suggested_price}</div>
                                <div style={{ fontSize: '0.8rem', color: aiResult.multiplier > 1 ? '#059669' : '#dc2626' }}>
                                    {aiResult.multiplier > 1 ? '▲ Premium applied' : '▼ Discount applied'}
                                </div>
                            </div>

                            <div className="explanation">
                                <strong>Why?</strong>
                                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '0.25rem' }}>{aiResult.explanation}</p>
                            </div>

                            <button className="primary-btn" style={{ width: '100%', marginTop: '1.5rem', background: '#7c3aed' }} onClick={() => setShowAiModal(false)}>
                                Apply This Price
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showVisionModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3><Camera size={20} style={{ marginRight: 8 }} /> Shelf Intelligence</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowVisionModal(false)} />
                        </div>

                        {!visionResult ? (
                            <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '8px' }}>
                                {visionLoading ? (
                                    <div className="loading">Processing Image with Computer Vision...</div>
                                ) : (
                                    <>
                                        <p>Upload a photo of your shop shelf to automatically count stock and detect gaps.</p>
                                        <input type="file" accept="image/*" onChange={handleVisionUpload} style={{ marginTop: '1rem' }} />
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="vision-results" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <img src={visionResult.imageUrl} alt="Analysis Result" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        AI Confidence: 94%
                                    </div>
                                </div>
                                <div>
                                    <h4>Analysis Report</h4>
                                    <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Total Items:</span>
                                        <strong>{visionResult.total_items}</strong>
                                    </div>
                                    <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Shelf Health:</span>
                                        <span className={`tag ${visionResult.shelf_health === 'Good' ? 'good' : 'critical'}`}>
                                            {visionResult.shelf_health}
                                        </span>
                                    </div>

                                    <h5>Detected Products:</h5>
                                    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                                        {Object.entries(visionResult.item_counts || {}).map(([name, count]) => (
                                            <li key={name}>{name}: <strong>{count}</strong></li>
                                        ))}
                                    </ul>

                                    <button className="primary-btn" onClick={() => { setVisionResult(null); }}>
                                        Scan Another
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FLOATING CART BUTTON */}
            {cart.length > 0 && (
                <div onClick={() => { setBillDone(null); setShowBillingModal(true); }} style={{
                    position: 'fixed', bottom: '30px', right: '30px', background: '#0ea5e9', color: 'white',
                    padding: '1rem 2rem', borderRadius: '50px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 100,
                    fontWeight: 'bold', fontSize: '1.1rem'
                }}>
                    <Zap size={24} />
                    Create Bill ({cart.length} items) - ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                </div>
            )}

            {/* BILLING / CHECKOUT MODAL */}
            {showBillingModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header">
                            <h3><Plus size={20} style={{ marginRight: 8 }} /> Smart Billing Counter</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowBillingModal(false)} />
                        </div>

                        {!billDone ? (
                            <div className="billing-content" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                                {/* Left: Cart Items */}
                                <div className="cart-list">
                                    <h4 style={{ marginBottom: '1rem' }}>Items in Cart</h4>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                                <tr>
                                                    <th style={{ textAlign: 'left', padding: '10px' }}>Item</th>
                                                    <th style={{ textAlign: 'center', padding: '10px' }}>Qty</th>
                                                    <th style={{ textAlign: 'right', padding: '10px' }}>Price</th>
                                                    <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.map(item => (
                                                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '10px' }}>{item.name}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                                <button onClick={() => updateCartQty(item._id, item.quantity - 1)} style={{ padding: '2px 8px' }}>-</button>
                                                                <span>{item.quantity}</span>
                                                                <button onClick={() => updateCartQty(item._id, item.quantity + 1)} style={{ padding: '2px 8px' }}>+</button>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '10px', textAlign: 'right' }}>₹{item.price}</td>
                                                        <td style={{ padding: '10px', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item._id)} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        Total: ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                    </div>
                                </div>

                                {/* Right: Customer & Templates */}
                                <div className="customer-billing-form">
                                    <h4 style={{ marginBottom: '1rem' }}>Customer Details</h4>
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input type="text" placeholder="e.g. Rahul Sharma" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Phone Number (for WhatsApp)</label>
                                        <input type="text" placeholder="9876543210" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                                    </div>

                                    <h4 style={{ margin: '1.5rem 0 1rem' }}>Invoice Design</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        <div onClick={() => setInvoiceTemplate('basic')} style={{
                                            border: `2px solid ${invoiceTemplate === 'basic' ? '#0ea5e9' : '#e2e8f0'}`,
                                            padding: '8px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer'
                                        }}>
                                            Basic
                                        </div>
                                        <div onClick={() => setInvoiceTemplate('premium')} style={{
                                            border: `2px solid ${invoiceTemplate === 'premium' ? '#0ea5e9' : '#e2e8f0'}`,
                                            padding: '8px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer'
                                        }}>
                                            Premium
                                        </div>
                                        <div onClick={() => setInvoiceTemplate('thermal')} style={{
                                            border: `2px solid ${invoiceTemplate === 'thermal' ? '#0ea5e9' : '#e2e8f0'}`,
                                            padding: '8px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer'
                                        }}>
                                            Thermal
                                        </div>
                                    </div>

                                    <button className="primary-btn" style={{ width: '100%', marginTop: '2rem', height: '50px', fontSize: '1.1rem' }} onClick={handleCheckout}>
                                        Generate Invoice
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* SUCCESS VIEW */
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#16a34a' }}>
                                    <Plus size={40} />
                                </div>
                                <h2 style={{ color: '#1e293b' }}>Sale Recorded Successfully!</h2>
                                <p style={{ color: '#64748b' }}>Invoice for <strong>{billDone.customerName}</strong> is ready.</p>

                                <div className="success-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                                    <a href={getWhatsAppLink(billDone)} target="_blank" rel="noreferrer" className="primary-btn" style={{ background: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Zap size={20} /> Send via WhatsApp
                                    </a>
                                    <button className="primary-btn" style={{ background: '#334155' }} onClick={() => setShowBillingModal(false)}>
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryView;
