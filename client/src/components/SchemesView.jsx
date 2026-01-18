import React, { useState, useEffect } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import FundingAdvisor from './FundingAdvisor';

const SchemesView = () => {
    const [schemes, setSchemes] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' or 'funding'
    const userCategory = localStorage.getItem('userCategory') || 'Micro';

    useEffect(() => {
        const fetchSchemesAndNews = async () => {
            try {
                const schemeRes = await fetch(`http://127.0.0.1:5000/api/schemes?category=${userCategory}`);
                const schemeData = await schemeRes.json();
                setSchemes(schemeData.schemes || []);
                setNews(schemeData.news || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchSchemesAndNews();
    }, [userCategory]);

    if (loading) return <div className="loading">Analyzing {userCategory} Support Schemes...</div>;

    return (
        <div className="view-container">
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="header-text">
                    <h2 style={{ margin: 0 }}>Support & Funding</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Curated opportunities for {userCategory} enterprises.</p>
                </div>
                <div className="tab-pills" style={{ background: '#f1f5f9', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                    <button
                        className={`pill-btn ${activeTab === 'schemes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schemes')}
                        style={{
                            padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'schemes' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'schemes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 500
                        }}
                    >
                        Government Schemes
                    </button>
                    <button
                        className={`pill-btn ${activeTab === 'funding' ? 'active' : ''}`}
                        onClick={() => setActiveTab('funding')}
                        style={{
                            padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'funding' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'funding' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 500
                        }}
                    >
                        Funding Advisor
                    </button>
                </div>
            </div>

            {activeTab === 'funding' ? (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <FundingAdvisor />
                </div>
            ) : (
                <div className="schemes-layout">
                    {news.length > 0 && (
                        <div className="news-banner" style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #dbeafe' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={18} /> Latest MSME Updates
                            </h4>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {news.map((n, idx) => (
                                    <a key={idx} href={n.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#1d4ed8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <ChevronRight size={14} /> {n.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="schemes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {schemes.map((s, idx) => (
                            <div key={idx} className="scheme-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', top: '15px', right: '15px',
                                    background: s.isLive ? '#dcfce7' : '#f1f5f9',
                                    color: s.isLive ? '#166534' : '#64748b',
                                    padding: '2px 8px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700'
                                }}>
                                    {s.isLive ? 'LIVE' : 'ELIBILITY MATCH'}
                                </div>
                                <h3 style={{ marginTop: 0, fontSize: '1.1rem', paddingRight: '60px' }}>{s.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#475569', minHeight: '3rem' }}>{s.desc || s.benefit}</p>
                                <div style={{ marginTop: '1rem', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Eligibility: </span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>{s.eligibility}</span>
                                </div>
                                <button className="secondary-btn" style={{ width: '100%', marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    View Full Details <ExternalLink size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ChevronRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default SchemesView;
