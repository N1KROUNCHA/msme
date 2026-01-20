import React, { useState, useEffect } from 'react';
import { Share2, Users, TrendingUp, Package, ShieldCheck, Zap, Activity, ShoppingCart, Flame, Megaphone } from 'lucide-react';
import axios from 'axios';

const NetworkView = () => {
    const [nodes, setNodes] = useState([]);
    const [liveEvent, setLiveEvent] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        fetchNodes();
    }, []);

    const fetchNodes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/network/nodes');
            setNodes(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch nodes", err);
        }
    };

    // Live Feed Polling (Real-Time Simulation)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/network/live-feed');
                if (res.data.event) {
                    setLiveEvent(res.data.event);
                    setLogs(prev => [res.data.event, ...prev].slice(0, 10)); // Keep last 10
                    setNodes(res.data.nodes); // Update Inventory
                }
            } catch (err) {
                console.error("Live feed error", err);
            }
        }, 3000); // 3-second heartbeat

        return () => clearInterval(interval);
    }, []);

    // Helper to get color by type
    const getNodeColor = (type) => {
        if (type.includes('Supermarket')) return '#4f46e5'; // Indigo
        if (type.includes('Medium')) return '#06b6d4'; // Cyan
        if (type.includes('Small')) return '#f59e0b'; // Amber
        return '#64748b';
    };

    return (
        <div className="view-container">
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Share2 color="#6366f1" size={28} />
                        Live Hyperlocal Network
                    </h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-Time Inventory Pooling with 5 Verified Neighbors</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 1.5s infinite' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>Live Connection Active</span>
                    </div>
                </div>
            </div>

            {/* Network Visualization */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Map / Nodes Grid */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', position: 'relative', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} color="#f59e0b" fill="#f59e0b" /> Active Cluster Protocol
                    </h3>

                    {loading ? <p>Scanning local network...</p> : (
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                            {nodes.map(node => (
                                <div key={node._id} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc',
                                    width: '180px', transition: 'all 0.3s',
                                    transform: liveEvent && liveEvent.message.includes(node.name) ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: liveEvent && liveEvent.message.includes(node.name) ? `0 0 20px ${getNodeColor(node.type)}40` : 'none',
                                    borderColor: liveEvent && liveEvent.message.includes(node.name) ? getNodeColor(node.type) : '#e2e8f0'
                                }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%', background: getNodeColor(node.type),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                                        color: 'white'
                                    }}>
                                        {node.type.includes('Supermarket') ? <ShoppingCart size={28} /> :
                                            node.type.includes('Medium') ? <Package size={28} /> :
                                                (node.lastActivity && node.lastActivity.includes('Demand')) ? <Flame size={28} /> : <Users size={28} />}
                                    </div>
                                    <div style={{ fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: '4px' }}>{node.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>{node.type.split(' ')[0]}</div>

                                    <div style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ color: '#64748b' }}>Stock:</span>
                                            <span style={{ fontWeight: '600' }}>{node.inventory.reduce((a, b) => a + b.stock, 0)} items</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Central Hub Animation */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '200px', height: '200px', borderRadius: '50%', border: '2px dashed #cbd5e1',
                        zIndex: 0, opacity: 0.2, pointerEvents: 'none'
                    }}></div>
                </div>

                {/* Live Activity Feed - DEMAND SIGNALS */}
                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} color="#ef4444" /> Cluster Demand Signals
                    </h3>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {logs.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Listening for demand pulses...</p>}
                        {logs.map(log => (
                            <div key={log.id} style={{ display: 'flex', gap: '10px', animation: 'fadeIn 0.5s ease-out' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '60px' }}>
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                                    {log.message.includes('High Demand') ? '🔥 ' : '📢 '}{log.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default NetworkView;
