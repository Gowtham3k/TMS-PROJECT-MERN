import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, ListChecks, Shield, Zap, Info, ArrowRight, MessageSquare, Plus, Sparkles, Activity } from 'lucide-react';
import Header from '../components/layout/Header';
import { useApp } from '../context/AppContext';

const Home = () => {
    const { t } = useApp();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingRight: 20, paddingBottom: 50 }}>
            <Header
                user={user}
                title={`${t('welcome')}, ${user.name.split(' ')[0]}! ✨`}
                subtitle={t('sub_welcome') || "Your centralized command center for all support and system operations."}
            />

            {/* Premium Hero Section */}
            <div
                className="hero-section"
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
                    borderRadius: 32,
                    padding: '60px 80px',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: 32,
                    boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {/* Background Decor */}
                <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, background: 'rgba(59, 130, 246, 0.2)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: -100, right: 100, width: 400, height: 400, background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }}></div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '65%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 100, color: '#93c5fd', fontSize: 13, fontWeight: 600, marginBottom: 24, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Sparkles size={16} /> {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') ? t('hero_sub_staff') : t('hero_sub_user')}
                    </div>
                    <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') ? t('hero_title_staff') : t('hero_title_user')}
                    </h1>
                    <p style={{ fontSize: 17, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 40, fontWeight: 500 }}>
                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF')
                            ? t('hero_desc_staff')
                            : t('hero_desc_user')}
                    </p>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button
                            className="btn"
                            style={{
                                background: 'white',
                                color: '#1e3a8a',
                                fontWeight: 800,
                                padding: '18px 40px',
                                fontSize: 16,
                                borderRadius: 16,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}
                            onClick={() => navigate((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') ? '/complaints' : '/raise')}
                        >
                            <Plus size={20} /> {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') ? t('manage_assigned') : t('submit_support')}
                        </button>
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 5, width: '30%' }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: 300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Styled Ticketing Graphic using CSS & Icons */}
                        <div style={{
                            width: 200,
                            height: 260,
                            background: 'white',
                            borderRadius: 24,
                            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                            padding: 24,
                            position: 'relative',
                            transform: 'rotate(-5deg)',
                            animation: 'float 6s ease-in-out infinite'
                        }}>
                            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: 12 }}></div>
                            <div style={{ width: '100%', height: 40, background: '#f8fafc', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', marginRight: 8 }}></div>
                                <div style={{ width: 60, height: 4, background: '#e2e8f0', borderRadius: 2 }}></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ width: '100%', height: 30, background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}></div>
                                ))}
                            </div>
                            <div style={{ position: 'absolute', bottom: 20, right: -20, background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: 12, boxShadow: '0 10px 20px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13 }}>
                                <Plus size={16} /> SUBMIT
                            </div>
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', display: 'grid', placeContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <MessageSquare color="white" size={32} />
                            </div>
                        </div>
                        {/* Glow effect behind */}
                        <div style={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', zIndex: -1 }}></div>
                    </div>
                </div>
            </div>

            {/* Dynamic Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                {/* Dashboard Card */}
                <div
                    className="feature-card"
                    style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #f1f5f9', transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <div style={{ background: '#eff6ff', color: '#3b82f6', width: 50, height: 50, borderRadius: 16, display: 'grid', placeContent: 'center', marginBottom: 24 }}>
                        <LayoutGrid size={26} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{t('adv_monitor')}</h3>
                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{t('monitor_desc')}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 700, fontSize: 14 }}>
                        {t('dashboard')} <ArrowRight size={16} />
                    </div>
                </div>

                {/* Complaints Card */}
                <div
                    className="feature-card"
                    style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #f1f5f9', transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onClick={() => navigate('/complaints')}
                >
                    <div style={{ background: '#ecfdf5', color: '#10b981', width: 50, height: 50, borderRadius: 16, display: 'grid', placeContent: 'center', marginBottom: 24 }}>
                        <ListChecks size={26} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{t('case_history')}</h3>
                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{t('case_desc')}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: 14 }}>
                        {t('track_progress')} <ArrowRight size={16} />
                    </div>
                </div>

                {/* System Status Card */}
                <div
                    className="feature-card"
                    style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #f1f5f9', transition: 'all 0.3s ease' }}
                >
                    <div style={{ background: '#fff7ed', color: '#f59e0b', width: 50, height: 50, borderRadius: 16, display: 'grid', placeContent: 'center', marginBottom: 24 }}>
                        <Activity size={26} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t('live_status')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: '#64748b' }}>{t('latency')}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Optimal (24ms)</span>
                        </div>
                        <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: '#f59e0b' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontSize: 13, color: '#64748b' }}>{t('tech_tier')}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>Tier 1 Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                    border-color: #3b82f6 !important;
                }
                .hero-section::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
                    opacity: 0.05;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default Home;
