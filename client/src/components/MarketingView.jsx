import React, { useState } from 'react';
import { Sparkles, Wand2, Download, Loader, Image as ImageIcon, Type, Zap } from 'lucide-react';

const MarketingView = () => {
    const [activeTab, setActiveTab] = useState('poster');
    const [loading, setLoading] = useState(false);
    const [generatedPoster, setGeneratedPoster] = useState(null);
    const [generatedCopy, setGeneratedCopy] = useState(null);

    // Poster Generation State
    const [posterForm, setPosterForm] = useState({
        prompt: '',
        businessName: localStorage.getItem('businessName') || '',
        productName: ''
    });

    // Copy Generation State
    const [copyForm, setCopyForm] = useState({
        productName: '',
        productCategory: '',
        targetAudience: 'general customers'
    });

    const handleGeneratePoster = async () => {
        if (!posterForm.prompt) {
            alert('Please enter a description for your poster');
            return;
        }

        setLoading(true);
        setGeneratedPoster(null);

        try {
            const res = await fetch('http://127.0.0.1:8000/marketing/generate-poster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: posterForm.prompt,
                    business_name: posterForm.businessName,
                    product_name: posterForm.productName
                })
            });

            const data = await res.json();

            if (data.success) {
                setGeneratedPoster(data);
            } else {
                alert(data.message || 'Failed to generate poster. Please try again.');
            }
        } catch (err) {
            console.error('Poster generation error:', err);
            alert('Failed to connect to AI service. Make sure the AI service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCopy = async () => {
        if (!copyForm.productName || !copyForm.productCategory) {
            alert('Please fill in product name and category');
            return;
        }

        setLoading(true);
        setGeneratedCopy(null);

        try {
            const res = await fetch('http://127.0.0.1:8000/marketing/optimize-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: copyForm.productName,
                    product_category: copyForm.productCategory,
                    target_audience: copyForm.targetAudience
                })
            });

            const data = await res.json();

            if (data.success) {
                setGeneratedCopy(data);
            } else {
                alert('Failed to generate copy');
            }
        } catch (err) {
            console.error('Copy generation error:', err);
            alert('Failed to connect to AI service');
        } finally {
            setLoading(false);
        }
    };

    const downloadPoster = () => {
        if (!generatedPoster) return;

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${generatedPoster.image_base64}`;
        link.download = `poster_${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="view-container">
            <div className="header-row" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={28} color="#7c3aed" />
                        AI Marketing Studio
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                        Generate professional posters using Stable Diffusion XL
                    </p>
                </div>
                <div className="tab-pills" style={{ background: '#f1f5f9', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                    <button
                        onClick={() => setActiveTab('poster')}
                        style={{
                            padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'poster' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'poster' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <ImageIcon size={16} /> Poster Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('copy')}
                        style={{
                            padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'copy' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'copy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Type size={16} /> AI Copywriter
                    </button>
                </div>
            </div>

            {activeTab === 'poster' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                    {/* Left: Input Form */}
                    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wand2 size={20} color="#7c3aed" />
                            Design Your Poster
                        </h3>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Describe Your Poster
                            </label>
                            <textarea
                                placeholder="e.g., A vibrant poster for fresh organic vegetables with green colors and a farm background"
                                value={posterForm.prompt}
                                onChange={(e) => setPosterForm({ ...posterForm, prompt: e.target.value })}
                                style={{
                                    width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px',
                                    border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical'
                                }}
                            />
                            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                Be specific about colors, style, and theme
                            </small>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Product Name (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Fresh Tomatoes"
                                value={posterForm.productName}
                                onChange={(e) => setPosterForm({ ...posterForm, productName: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Business Name
                            </label>
                            <input
                                type="text"
                                placeholder="Your Store Name"
                                value={posterForm.businessName}
                                onChange={(e) => setPosterForm({ ...posterForm, businessName: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <button
                            onClick={handleGeneratePoster}
                            disabled={loading}
                            className="primary-btn"
                            style={{
                                width: '100%', height: '50px', fontSize: '1.05rem', fontWeight: 600,
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className="spin" />
                                    Generating with AI...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Generate Poster
                                </>
                            )}
                        </button>

                        {loading && (
                            <div style={{ marginTop: '1rem', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '0.9rem', color: '#92400e' }}>
                                ⏳ This may take 20-30 seconds. Stable Diffusion XL is generating your poster...
                            </div>
                        )}
                    </div>

                    {/* Right: Preview */}
                    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0 }}>Preview</h3>

                        {generatedPoster ? (
                            <div>
                                <img
                                    src={`data:image/png;base64,${generatedPoster.image_base64}`}
                                    alt="Generated Poster"
                                    style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                                    <button
                                        onClick={downloadPoster}
                                        className="primary-btn"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Download size={18} />
                                        Download (1024x1024)
                                    </button>
                                </div>
                                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    <strong>Model:</strong> {generatedPoster.model}<br />
                                    <strong>Prompt:</strong> {generatedPoster.prompt}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px',
                                color: '#94a3b8'
                            }}>
                                <ImageIcon size={48} style={{ marginBottom: '1rem' }} />
                                <p>Your AI-generated poster will appear here</p>
                                <small>Powered by Stable Diffusion XL</small>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Copy Generator */}
                    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0 }}>AI Copywriter</h3>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Premium Basmati Rice"
                                value={copyForm.productName}
                                onChange={(e) => setCopyForm({ ...copyForm, productName: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Category</label>
                            <input
                                type="text"
                                placeholder="e.g., Groceries, Electronics"
                                value={copyForm.productCategory}
                                onChange={(e) => setCopyForm({ ...copyForm, productCategory: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label>Target Audience</label>
                            <select
                                value={copyForm.targetAudience}
                                onChange={(e) => setCopyForm({ ...copyForm, targetAudience: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="general customers">General Customers</option>
                                <option value="young professionals">Young Professionals</option>
                                <option value="families">Families</option>
                                <option value="budget shoppers">Budget Shoppers</option>
                                <option value="premium buyers">Premium Buyers</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerateCopy}
                            disabled={loading}
                            className="primary-btn"
                            style={{ width: '100%', height: '50px' }}
                        >
                            {loading ? 'Generating...' : 'Generate Copy'}
                        </button>
                    </div>

                    {/* Generated Copy */}
                    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0 }}>Generated Copy</h3>

                        {generatedCopy ? (
                            <div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Headline</label>
                                    <h2 style={{ margin: '5px 0', color: '#1e293b' }}>{generatedCopy.headline}</h2>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tagline</label>
                                    <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#475569' }}>{generatedCopy.tagline}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Selling Points</label>
                                    <ul style={{ marginTop: '10px', paddingLeft: '1.5rem' }}>
                                        {generatedCopy.selling_points.map((point, idx) => (
                                            <li key={idx} style={{ marginBottom: '8px', color: '#334155' }}>{point}</li>
                                        ))}
                                    </ul>
                                </div>

                                {generatedCopy.note && (
                                    <div style={{ marginTop: '1rem', padding: '10px', background: '#fef3c7', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e' }}>
                                        {generatedCopy.note}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <Type size={48} style={{ marginBottom: '1rem' }} />
                                <p>AI-generated marketing copy will appear here</p>
                                <small>Powered by Ollama LLM</small>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingView;
