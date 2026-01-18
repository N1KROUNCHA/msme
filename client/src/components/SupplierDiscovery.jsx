import React, { useState } from 'react';
import { Search, Loader2, Truck, Globe, MapPin } from 'lucide-react';

const SupplierDiscovery = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/agent/supplier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (!res.ok) throw new Error("AI Service unreachabe");
            const data = await res.json();
            setResult(data.answer);
        } catch (err) {
            console.error("Supplier Search Error:", err);
            setResult("Sorry, I couldn't find any suppliers for that category. Ensure the AI service is running at :8000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="supplier-discovery" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{ background: '#10b981', padding: '10px', borderRadius: '12px' }}>
                    <Truck color="white" size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>Supplier Discovery</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>AI-powered global & local vendor search</p>
                </div>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search for suppliers (e.g. 'Cotton yarn' or 'CCTV distributors')..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }}
                    />
                </div>
                <button type="submit" disabled={loading} className="primary-btn" style={{ width: 'auto', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981' }}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                </button>
            </form>

            {result && (
                <div className="discovery-results" style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '800', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                        <Globe size={18} /> Discovery Result
                    </div>
                    <div style={{ color: '#14532d', fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                        {result.replace("SIMULATION MODE: ", "")}
                    </div>
                </div>
            )}

            {!result && !loading && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '16px' }}>
                    <MapPin size={48} style={{ margin: '0 auto 15px', opacity: 0.1 }} />
                    <p style={{ maxWidth: '300px', margin: '0 auto' }}>Enter a product category or raw material to find the best supply chain partners.</p>
                </div>
            )}
        </div>
    );
};

export default SupplierDiscovery;
