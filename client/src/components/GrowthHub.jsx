import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertTriangle, Users, Bot, Zap, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const GrowthHub = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://127.0.0.1:5000/api/growth/insights/${userId}`);
            setInsights(res.data);
        } catch (err) {
            console.error("Growth Insights Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [userId]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <RefreshCw className="animate-spin" size={48} color="#6366f1" />
            <p style={{ color: '#64748b' }}>AI is crunching your transaction history for growth patterns...</p>
        </div>
    );

    const chartData = {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [{
            label: 'Profit Trend (30 Days)',
            data: insights?.forecast.monthlyTrend || [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div className="growth-hub-container" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Merchant Growth Hub <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px' }}>LIVE INSIGHTS</span>
                    </h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Data-driven strategies powered by Deep Learning</p>
                </div>
                <button onClick={fetchInsights} className="secondary-btn" style={{ width: 'auto', display: 'flex', gap: '8px' }}>
                    <RefreshCw size={16} /> Refresh Brain
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column: Forecasting & Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Cashflow Prediction Card */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Tomorrow's Profit Forecast</label>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    ₹{insights?.forecast.nextDayProfit}
                                    <ArrowUpRight color="#10b981" size={32} />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>Confidence: {insights?.forecast.confidence}</span>
                            </div>
                            <div style={{ background: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
                                <TrendingUp color="#6366f1" size={24} />
                            </div>
                        </div>
                        <div style={{ height: '200px' }}>
                            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: false } } }} />
                        </div>
                    </div>

                    {/* Stock & Revenue Growth Tips */}
                    <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', borderRadius: '20px', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8' }}>
                            <Zap size={20} /> AI Strategic Growth Tip
                        </h4>
                        <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                            {insights?.growthTip}
                        </p>
                    </div>
                </div>

                {/* Growth Strategy: Pricing Optimizer */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', marginTop: '2rem' }}>
                    <h4 style={{ margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target size={20} color="#6366f1" /> Dynamic Pricing Optimizer
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>AI-suggested price adjustments for maximum margin:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        {[
                            { name: 'Amul Milk 500ml', current: 28, suggested: 30, reason: 'High Local Demand' },
                            { name: 'Maggi Noodles 70g', current: 14, suggested: 12, reason: 'Inventory Liquidation' },
                            { name: 'Britannia Biscuits', current: 40, suggested: 42, reason: 'Low Competitor Stock' }
                        ].map((p, i) => (
                            <div key={i} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px' }}>{p.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>₹{p.current}</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>₹{p.suggested}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6366f1', background: '#eef2ff', padding: '4px', borderRadius: '6px' }}>{p.reason}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button className="secondary-btn" style={{ fontSize: '0.8rem', width: 'auto' }}>Apply All Optimization Suggetions</button>
                    </div>
                </div>

                {/* Right Column: Actions & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Stockout Risk Alerts */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={20} color="#f59e0b" /> Critical Stockout Risks
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {insights?.stockRisks.length > 0 ? insights.stockRisks.map((p, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Current: {p.currentStock} units</div>
                                    </div>
                                    <button className="primary-btn" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.75rem', background: '#f59e0b' }}>Restock</button>
                                </div>
                            )) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No immediate stock risks. Your inventory is healthy!</p>
                            )}
                        </div>
                    </div>

                    {/* Collaborative Network Matches */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} color="#6366f1" /> Collaborative Network
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Neighbors with surplus items you need:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {insights?.collaboration.length > 0 ? insights.collaboration.map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ width: '32px', height: '32px', background: '#eef2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <RefreshCw size={16} color="#6366f1" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{c.neighbor}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Has surplus: {c.product}</div>
                                    </div>
                                    <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>Connect</button>
                                </div>
                            )) : (
                                <p style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>Join a Merchant Cluster to see neighboring stock pooling options.</p>
                            )}
                        </div>
                    </div>

                    {/* AI Advisor Badge */}
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eef2ff', color: '#6366f1', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <Bot size={18} /> Deep Learning Consultant Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthHub;
