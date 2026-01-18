import React, { useState } from 'react';
import { Palette, Download, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';

const PosterGenerator = () => {
    const [title, setTitle] = useState('Mega Festival Sale');
    const [discount, setDiscount] = useState('20% OFF');
    const [color, setColor] = useState('#6366f1');

    const posterStyles = {
        padding: '2rem',
        background: `linear-gradient(135deg, ${color} 0%, #1e293b 100%)`,
        borderRadius: '20px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        aspectRatio: '1/1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '8px solid rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div className="poster-gen-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '1rem' }}>

            <div className="controls-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={20} color="#6366f1" /> Customize Ad
                </h3>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Promo Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Discount Text</label>
                    <input
                        type="text"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Brand Color</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'].map(c => (
                            <div
                                key={c}
                                onClick={() => setColor(c)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: c, cursor: 'pointer',
                                    border: color === c ? '3px solid #1e293b' : 'none'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                    <button className="primary-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Download size={18} /> Download
                    </button>
                    <button className="secondary-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Share2 size={18} /> WhatsApp
                    </button>
                </div>
            </div>

            <div className="preview-area">
                <h4 style={{ color: '#64748b', marginBottom: '1rem', textAlign: 'center' }}>Live Preview</h4>
                <div style={posterStyles}>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                    <Sparkles size={40} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', lineHeight: 1.1 }}>{title}</h1>
                    <div style={{
                        background: 'white', color: color, padding: '10px 25px', borderRadius: '50px',
                        fontWeight: '800', fontSize: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                    }}>
                        {discount}
                    </div>
                    <p style={{ marginTop: '2rem', opacity: 0.8, fontSize: '1.1rem', letterSpacing: '2px' }}>EXCLUSIVELY FOR YOU</p>

                    <div style={{ position: 'absolute', bottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', width: '80%', paddingTop: '1rem', fontSize: '0.8rem' }}>
                        VISIT OUR STORE TODAY
                    </div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <ImageIcon size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    AI-Powered Layout: Best for Instagram & WhatsApp Status
                </p>
            </div>
        </div>
    );
};

export default PosterGenerator;
