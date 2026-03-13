import React, { useState } from 'react';
import {
    HelpCircle, MessageCircle, Phone, Mail,
    Search, ChevronDown, ChevronUp, Send,
    Clock, ShieldCheck, User, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../context/AppContext';

const SupportCenter = () => {
    const { t } = useApp();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState(0);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { type: 'bot', text: 'Hello! I am your Support Assistant. How can I help you today?' }
    ]);

    const faqs = [
        { q: t('faq_1_q'), a: t('faq_1_a') },
        { q: t('faq_2_q'), a: t('faq_2_a') },
        { q: t('faq_3_q'), a: t('faq_3_a') }
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const newHistory = [...chatHistory, { type: 'user', text: chatMessage }];
        setChatHistory(newHistory);
        setChatMessage('');

        // Simulate Bot Response
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                type: 'bot',
                text: "Thank you for your message. A technical representative will be with you shortly. Your current wait time is less than 3 minutes."
            }]);
        }, 1000);
    };

    const filteredFaqs = faqs.filter(f =>
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 1200, margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: 48, padding: '40px 0' }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>{t('support_center_title')}</h1>
                <p style={{ color: '#64748b', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                    {t('support_center_subtitle')}
                </p>
                <div style={{ position: 'relative', maxWidth: 600, margin: '32px auto 0' }}>
                    <input
                        type="text"
                        placeholder="Search for help (e.g. password, hardware)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '16px 24px', paddingLeft: 56, borderRadius: 16, background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: 16, outline: 'none' }}
                    />
                    <Search size={22} style={{ position: 'absolute', left: 20, top: 15, color: '#94a3b8' }} />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, marginBottom: 60 }}>
                {/* FAQ Section */}
                <div className="white-card" style={{ padding: 40 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <HelpCircle color="#3b82f6" /> {t('faq_title')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filteredFaqs.map((faq, index) => (
                            <div key={index} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '12px 0' }}
                                >
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>{faq.q}</span>
                                    {openFaq === index ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                                </button>
                                {openFaq === index && (
                                    <p style={{ marginTop: 12, color: '#64748b', lineHeight: 1.6, fontSize: 15, animation: 'fadeInUp 0.3s ease-out' }}>
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Chat Simulation Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div className="white-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500, border: '1px solid #e2e8f0' }}>
                        <div style={{ background: '#3b82f6', color: 'white', padding: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 22, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageCircle color="#3b82f6" size={24} />
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', borderRadius: 6, border: '2px solid white' }}></div>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t('chat_title')}</h3>
                                <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{t('chat_subtitle')}</p>
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
                            {chatHistory.map((msg, i) => (
                                <div key={i} style={{ alignSelf: msg.type === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: 16,
                                        background: msg.type === 'bot' ? 'white' : '#3b82f6',
                                        color: msg.type === 'bot' ? '#334155' : 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        fontSize: 14,
                                        fontWeight: 500
                                    }}>
                                        {msg.text}
                                    </div>
                                    <p style={{ margin: '4px 0 0', fontSize: 10, color: '#94a3b8', textAlign: msg.type === 'bot' ? 'left' : 'right' }}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, background: 'white' }}>
                            <input
                                type="text"
                                placeholder={t('type_message')}
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14 }}
                            />
                            <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: 12, borderRadius: 12, cursor: 'pointer' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>

                    <div className="white-card" style={{ padding: 24, background: '#f8fafc' }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Phone size={16} color="#3b82f6" /> {t('reach_us')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Mail size={16} color="#64748b" />
                                <span style={{ fontSize: 14, color: '#475569' }}>support@tms.com</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Zap size={16} color="#64748b" />
                                <span style={{ fontSize: 14, color: '#475569' }}>Internal Ext: 4400</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportCenter;
