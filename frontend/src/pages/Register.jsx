import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Register = () => {
    const { t } = useApp();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER', department: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.msg || err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 100%)', padding: 20 }}>
            <div className="glass-card" style={{ padding: 40, width: '100%', maxWidth: 450, color: 'white' }}>
                <h2 style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>{t('create_account')}</h2>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>{t('join_system')}</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t('full_name')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t('email_lbl')}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t('auth_role')}</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                            >
                                <option value="USER">{t('roles')} - USER</option>
                                <option value="STAFF">{t('roles')} - STAFF</option>
                                <option value="ADMIN">{t('roles')} - ADMIN</option>
                                <option value="SUPER_ADMIN">{t('roles')} - SUPER ADMIN</option>
                            </select>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t('department')}</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                                placeholder="IT / HR"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t('password_lbl')}</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontSize: 16, marginTop: 10 }}>{t('submit')}</button>
                </form>

                <p style={{ marginTop: 24, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                    {t('already_have_account')} <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>{t('login_here')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
