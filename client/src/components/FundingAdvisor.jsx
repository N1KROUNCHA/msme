import React, { useState } from 'react';
import { Landmark, TrendingUp, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';

const FundingAdvisor = () => {
    const [loanAmount, setLoanAmount] = useState(500000);

    const recommendations = [
        {
            name: "SIDBI SMILE",
            type: "Soft Loan / Quasi-Equity",
            suitability: loanAmount >= 1000000 ? "Highly Suitable" : "Consider MUDRA instead",
            desc: "Soft loan on relatively flexible terms for manufacturing & service modernization.",
            link: "https://www.sidbi.in"
        },
        {
            name: "MUDRA Kishore",
            type: "Collateral-Free Loan",
            suitability: loanAmount <= 500000 ? "Best Match" : "Partial Funding Only",
            desc: "For micro/small enterprises needing capital between 50k and 5L.",
            link: "https://www.mudra.org.in"
        },
        {
            name: "SRI Fund",
            type: "Equity Infusion",
            suitability: "High Growth Potential required",
            desc: "Government fund-of-funds for equity infusion in growing MSMEs.",
            link: "https://www.nsic.co.in"
        }
    ];

    return (
        <div className="funding-advisor-card" style={{ padding: '1.5rem', background: '#fdfcfe', borderRadius: '16px', border: '1px solid #f3e8ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{ background: '#a855f7', padding: '8px', borderRadius: '10px' }}>
                    <Landmark color="white" size={20} />
                </div>
                <h3 style={{ margin: 0, color: '#6b21a8' }}>Funding & Lending Advisor</h3>
            </div>

            <div className="capital-need" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
                    ESTIMATED CAPITAL NEED (₹)
                </label>
                <input
                    type="range"
                    min="50000"
                    max="5000000"
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    style={{ width: '100%', marginBottom: '10px' }}
                />
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#7e22ce' }}>₹{Number(loanAmount).toLocaleString('en-IN')}</div>
            </div>

            <div className="options-list" style={{ display: 'grid', gap: '12px' }}>
                {recommendations.map((opt, idx) => (
                    <div key={idx} style={{
                        padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3e8ff', background: 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{opt.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: '600' }}>{opt.type}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Suitability</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: opt.suitability.includes('Best') || opt.suitability.includes('Highly') ? '#10b981' : '#f59e0b' }}>
                                {opt.suitability}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="primary-btn" style={{ width: '100%', marginTop: '1.5rem', background: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Get Complete Eligibility Report <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default FundingAdvisor;
