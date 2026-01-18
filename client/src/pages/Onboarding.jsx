import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Target, ChevronRight, CheckCircle, TrendingUp } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const userId = localStorage.getItem('userId');
    const [formData, setFormData] = useState({
        businessName: localStorage.getItem('businessName') || '',
        businessType: 'Retail',
        sector: 'Food & Beverage',
        location: 'India',
        size: 'Micro',
        annualTurnover: '',
        goals: []
    });

    const goalsOptions = [
        "Increase Monthly Sales",
        "Reduce Operational Costs",
        "Digital Marketing Expansion",
        "Improve Inventory Turnaround",
        "Export to Global Markets",
        "Hire More Staff"
    ];

    const handleGoalToggle = (goal) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal]
        }));
    };

    const handleComplete = async () => {
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId || currentUserId === 'null' || currentUserId === 'undefined') {
            alert("Session Error: Please login again.");
            navigate('/login');
            return;
        }

        try {
            const url = `http://127.0.0.1:5000/api/auth/profile/${currentUserId}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    onboardingComplete: true
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('onboardingComplete', 'true');
                localStorage.setItem('userSector', data.user.sector);
                localStorage.setItem('userLocation', data.user.location);
                localStorage.setItem('userCategory', data.user.size);
                localStorage.setItem('businessType', data.user.businessType);
                localStorage.setItem('businessName', data.user.businessName);

                alert("Profile Saved Successfully! Welcome aboard.");
                navigate('/dashboard');
            } else {
                alert(`Error: ${data.msg || "Failed to update profile"}`);
            }
        } catch (err) {
            console.error("Onboarding Submission Error:", err);
            alert("Network Error: Could not connect to the backend server.");
        }
    };

    return (
        <div className="onboarding-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
            <div className="onboarding-card" style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', maxWidth: '500px', width: '100%' }}>

                <div className="progress-bar" style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '4px', flex: 1, background: step >= i ? '#6366f1' : '#e2e8f0', borderRadius: '2px' }} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="step-content">
                        <h2 style={{ marginBottom: '0.5rem' }}>Welcome to MSME Growth! 🚀</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Tell us about your business to personalize your dashboard.</p>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Business Name</label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                placeholder="e.g. Acme Retailers"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Business Type</label>
                            <select
                                value={formData.businessType}
                                onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="Retail">Retail / Wholesale</option>
                                <option value="Service">Service Provider</option>
                                <option value="Manufacturing">Manufacturing</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Sector</label>
                            <select
                                value={formData.sector}
                                onChange={e => setFormData({ ...formData, sector: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="Food & Beverage">Food & Beverage</option>
                                <option value="Textiles">Textiles & Apparel</option>
                                <option value="Electronics">Electronics & Hardware</option>
                                <option value="Pharmacy">Pharmacy & Healthcare</option>
                                <option value="General">Other / General</option>
                            </select>
                        </div>

                        <button onClick={() => setStep(2)} className="primary-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <h2 style={{ marginBottom: '0.5rem' }}>Scale & Location 📍</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>This helps us find the right government schemes for you.</p>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Business Size</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {['Micro', 'Small', 'Medium'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFormData({ ...formData, size: s })}
                                        style={{
                                            padding: '10px', borderRadius: '8px', border: '2px solid',
                                            background: formData.size === s ? '#eef2ff' : 'white',
                                            borderColor: formData.size === s ? '#6366f1' : '#e2e8f0',
                                            color: formData.size === s ? '#6366f1' : '#64748b',
                                            cursor: 'pointer', fontWeight: '600'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Location (City)</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                placeholder="e.g. Mumbai"
                            />
                        </div>

                        <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(1)} className="secondary-btn" style={{ flex: 1 }}>Back</button>
                            <button onClick={() => setStep(3)} className="primary-btn" style={{ flex: 1 }}>Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content">
                        <h2 style={{ marginBottom: '0.5rem' }}>Growth Goals 🎯</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Select what you want to achieve.</p>

                        <div className="goals-grid" style={{ display: 'grid', gap: '10px', marginBottom: '2rem' }}>
                            {goalsOptions.map(g => (
                                <div
                                    key={g}
                                    onClick={() => handleGoalToggle(g)}
                                    style={{
                                        padding: '12px', borderRadius: '12px', border: '1px solid',
                                        borderColor: formData.goals.includes(g) ? '#6366f1' : '#e2e8f0',
                                        background: formData.goals.includes(g) ? '#eef2ff' : 'white',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%', border: '2px solid',
                                        borderColor: formData.goals.includes(g) ? '#6366f1' : '#cbd5e1',
                                        background: formData.goals.includes(g) ? '#6366f1' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {formData.goals.includes(g) && <CheckCircle size={14} color="white" />}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{g}</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleComplete} className="primary-btn" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            Launch Dashboard <TrendingUp size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
