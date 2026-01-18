import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2, BookOpen, ShieldCheck, CreditCard } from 'lucide-react';

const PolicyExpert = () => {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: "Hello! I am your MSME Policy Expert. I can help you understand government schemes like MUDRA, PMEGP, and CGTMSE. How can I assist you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/policy', { query: input });

            const botMessage = {
                role: 'bot',
                content: res.data.answer || "I'm sorry, I couldn't find specific information on that. Could you try rephrasing?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: res.data.error === "MISSING_API_KEY"
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I'm having trouble connecting to my knowledge base. Please ensure the AI service is running.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQueries = [
        "Tell me about MUDRA loans",
        "What is PMEGP subsidy?",
        "How to handle delayed payments?",
        "CGTMSE guarantee limit 2025"
    ];

    return (
        <div className="policy-expert-container" style={{ padding: '2rem', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={32} color="#4f46e5" />
                    MSME Policy Expert
                </h1>
                <p style={{ color: '#6b7280' }}>AI-powered assistant for government schemes and compliance.</p>
            </div>

            <div className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', flex: 1, overflow: 'hidden' }}>
                {/* Main Chat Window */}
                <div className="chat-window" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <div className="messages-area" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                    background: m.role === 'user' ? '#4f46e5' : (m.isError ? '#fee2e2' : '#f3f4f6'),
                                    color: m.role === 'user' ? 'white' : (m.isError ? '#991b1b' : '#1f2937'),
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    position: 'relative'
                                }}>
                                    {m.content}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>{m.time}</span>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                                <Loader2 size={16} className="animate-spin" />
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Ask about MUDRA, PMEGP, etc..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '0 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="chat-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#eef2ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '1rem', color: '#3730a3' }}>
                            <BookOpen size={18} /> Suggested Queries
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {suggestedQueries.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    style={{ textAlign: 'left', background: 'white', border: '1px solid #e5e7eb', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                    className="suggested-q"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '1rem' }}>
                            <CreditCard size={18} /> Resources
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>• udyamregistration.gov.in</li>
                            <li>• mudra.org.in</li>
                            <li>• samadhaan.msme.gov.in</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyExpert;
