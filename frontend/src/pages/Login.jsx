import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, CheckCircle2, ClipboardList, Info, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { t, language, setLanguage } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const res = await api.get('/api/settings');
                if (res.data.isSystemUnderMaintenance === true) {
                    setMaintenanceMode(true);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };
        checkMaintenance();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.msg || t('login_failed') || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#f8fafc',
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden'
        }}>
            {/* Left Section - Hero & Illustration */}
            <div className="auth-left" style={{
                flex: 1.4,
                background: 'white',
                padding: '40px 60px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRight: '1px solid #f1f5f9'
            }}>
                {/* Logo Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            background: '#3b82f6',
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: 18
                        }}>
                            TL
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>TMS</span>
                    </div>

                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b'
                    }}>
                        <User size={20} />
                    </div>
                </div>

                {/* Hero Text */}
                <div style={{ maxWidth: 500, marginBottom: 40 }}>
                    <h1 style={{ fontSize: 42, lineHeight: 1.2, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>
                        {t('system_title')}
                    </h1>
                    <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.6 }}>
                        {t('system_subtitle')}
                    </p>
                </div>

                {/* Stylized Illustration (Mimicking the image) */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: 'radial-gradient(circle at 50% 50%, #eff6ff 0%, transparent 70%)'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 500,
                        height: 350,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Main "Form" Card */}
                        <div style={{
                            width: 280,
                            height: 200,
                            background: 'white',
                            borderRadius: 24,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                            padding: 24,
                            zIndex: 2,
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            transform: 'translateX(-40px)'
                        }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>{t('illust_desc')}</div>
                            <div style={{ height: 12, width: '60%', background: '#f1f5f9', borderRadius: 4, marginBottom: 8 }}></div>
                            <div style={{ height: 12, width: '40%', background: '#f1f5f9', borderRadius: 4, marginBottom: 20 }}></div>
                            <div style={{ height: 40, width: '100%', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', marginBottom: 20 }}></div>
                            <div style={{ width: 120, height: 28, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 700 }}>
                                {t('illust_submit')}
                            </div>
                        </div>

                        {/* Clipboard Card */}
                        <div style={{
                            position: 'absolute',
                            right: 40,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 140,
                            height: 180,
                            background: '#3b82f6',
                            borderRadius: 20,
                            boxShadow: '0 15px 40px rgba(59, 130, 246, 0.2)',
                            padding: 20,
                            zIndex: 3,
                            color: 'white'
                        }}>
                            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 40, height: 15, background: '#f59e0b', borderRadius: 4 }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 16, height: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CheckCircle2 size={10} />
                                        </div>
                                        <div style={{ height: 6, width: '60%', background: 'rgba(255,255,255,0.3)', borderRadius: 3 }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Background Floating Element */}
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 60,
                            width: 100,
                            height: 120,
                            background: 'rgba(241, 245, 249, 0.5)',
                            borderRadius: 16,
                            zIndex: 1,
                            padding: 12
                        }}>
                            <div style={{ fontSize: 8, fontWeight: 700, color: '#cbd5e1', marginBottom: 8 }}>{t('illust_block')}</div>
                            {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 4, width: '80%', background: '#e2e8f0', borderRadius: 2, marginBottom: 6 }}></div>)}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div style={{ position: 'absolute', bottom: 40, right: 60 }}>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="en">English (US)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                    </select>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div style={{
                flex: 1,
                background: '#eceef1', /* Matches the slightly darker/blurred bg in image */
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 440,
                    background: 'white',
                    borderRadius: 24,
                    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.1)',
                    padding: '48px 40px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {maintenanceMode && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            background: '#fef2f2',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            borderBottom: '1px solid #fee2e2',
                            color: '#991b1b',
                            fontSize: 13,
                            fontWeight: 600
                        }}>
                            <Info size={16} color="#ef4444" />
                            {t('maintenance_active_msg')}
                        </div>
                    )}
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', marginBottom: 40, marginTop: maintenanceMode ? 20 : 0 }}>{t('login_title')}</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                        {/* Email Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <label style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>{t('email_lbl')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    placeholder={t('email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 48px',
                                        borderRadius: 12,
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    className="login-input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <label style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>{t('password_lbl')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('password_placeholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 48px 16px 48px',
                                        borderRadius: 12,
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: 15,
                                        outline: 'none'
                                    }}
                                    className="login-input"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '18px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s ease',
                                marginTop: 8
                            }}
                        >
                            {loading ? t('verifying') : t('login_title')}
                        </button>
                    </form>

                    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                            onClick={() => alert('Please contact administrator for password reset.')}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                        >
                            {t('forgot_password')}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .login-input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
