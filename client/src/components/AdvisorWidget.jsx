import React, { useState, useEffect } from 'react';
import { Lightbulb, Target, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const AdvisorWidget = ({ metrics }) => {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                // 1. Fetch profile
                const profileRes = await fetch(`http://127.0.0.1:5000/api/auth/profile/${userId}`);
                const user = await profileRes.json();

                // 2. Fetch Growth Insights (LSTM / Collaboration)
                let growthContext = {};
                try {
                    const growthRes = await fetch(`http://127.0.0.1:5000/api/growth/insights/${userId}`);
                    if (growthRes.ok) {
                        const growthData = await growthRes.json();
                        growthContext = {
                            forecast_profit: growthData.forecast?.nextDayProfit || 0,
                            stock_risks_count: growthData.stockRisks?.length || 0,
                            collaboration_score: growthData.collaboration?.length > 0 ? "High (Cluster Active)" : "Low (Independent)"
                        };
                    }
                } catch (gErr) { console.warn("Growth insights fetch failed for advisor"); }

                // 3. Fetch Roadmap with enriched context
                const res = await fetch('http://127.0.0.1:8000/agent/roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        business_type: user.businessType || 'Retail',
                        sector: user.sector || 'General',
                        size: user.size || 'Micro',
                        goals: user.growthGoals || ['Increase Monthly Sales'],
                        metrics: {
                            monthly_sales: metrics?.monthlySales || 0,
                            monthly_expenses: metrics?.operatingExpenses || 0,
                            net_profit: metrics?.profit || 0,
                            ...growthContext
                        }
                    })
                });

                if (!res.ok) throw new Error("AI Service roadmap failed");
                const data = await res.json();
                setRoadmap(data);
                setError(false);
            } catch (err) {
                console.error("Roadmap Agent Error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [userId, metrics]);

    if (loading) return (
        <div className="card-placeholder" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ height: '20px', background: '#f1f5f9', width: '60%', borderRadius: '4px', margin: '0 auto' }}></div>
                <div style={{ height: '15px', background: '#f8fafc', width: '90%', borderRadius: '4px', margin: '0 auto' }}></div>
                <div style={{ height: '15px', background: '#f8fafc', width: '80%', borderRadius: '4px', margin: '0 auto' }}></div>
            </div>
            <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.8rem' }}>AI Consultant is thinking...</p>
        </div>
    );

    if (error || !roadmap) return (
        <div className="advisor-widget" style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fed7aa' }}>
            <h3 style={{ color: '#c2410c', margin: 0, fontSize: '1rem' }}>Business Advisor Offline</h3>
            <p style={{ fontSize: '0.85rem', color: '#9a3412', marginTop: '5px' }}>Start the AI Service (run_ai.bat) to get personalized roadmaps.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '10px', background: 'white', border: '1px solid #fed7aa', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Retry</button>
        </div>
    );

    return (
        <div className="advisor-widget" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderRadius: '16px', border: '1px solid #dbeafe', padding: '1.5rem', height: '100%' }}>
            <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '10px' }}>
                    <Lightbulb color="white" size={20} />
                </div>
                <h3 style={{ margin: 0, color: '#1e40af' }}>AI Business Advisor</h3>
            </div>

            <h4 style={{ color: '#1e3a8a', marginBottom: '1.2rem', fontSize: '1.05rem', lineHeight: '1.4' }}>{roadmap.title}</h4>

            <div className="roadmap-steps" style={{ display: 'grid', gap: '15px' }}>
                {(roadmap.milestones || []).map((step, idx) => (
                    <div key={idx} className="step-item" style={{ display: 'flex', gap: '15px', position: 'relative' }}>
                        <div className="step-number" style={{
                            minWidth: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800'
                        }}>
                            {step.step}
                        </div>
                        <div className="step-info">
                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>{step.task}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{step.details}</div>
                        </div>
                        {idx < (roadmap.milestones.length - 1) && (
                            <div style={{ position: 'absolute', left: '14px', top: '28px', bottom: '-15px', width: '1px', borderLeft: '2px dashed #dbeafe' }}></div>
                        )}
                    </div>
                ))}
            </div>

            {roadmap.recommendation && (
                <div className="expert-recommendation" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <Sparkles size={16} /> Expert Recommendation
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                        "{roadmap.recommendation}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdvisorWidget;
