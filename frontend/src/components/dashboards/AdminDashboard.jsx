import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Users, CheckCircle, Clock, AlertCircle, ArrowRight, Shield, Activity, Filter, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../layout/Header';

const AdminDashboard = ({ stats, user }) => {
    const { t } = useApp();
    const navigate = useNavigate();
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/complaints', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setRecentComplaints(res.data.slice(0, 6));
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Header
                user={user}
                stats={stats}
                title={`${t('admin_console')}: ${t('welcome')}, ${user.name.split(' ')[0]}! 🔐`}
                subtitle={t('admin_subtitle')}
            />

            <div className="stats-grid">
                <div className="stat-card blue glow-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/complaints')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('total_raised')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.total || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <ListChecks size={28} />
                        </div>
                    </div>
                </div>
                <div className="stat-card orange glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('pending')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.pending || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <Clock size={28} />
                        </div>
                    </div>
                </div>
                <div className="stat-card green glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('resolved')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.resolved || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <CheckCircle size={28} />
                        </div>
                    </div>
                </div>
                <div className="stat-card teal glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('in_progress')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.inProgress || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <AlertCircle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 32 }}>
                <div className="white-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>{t('global_ticket_stream')}</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('ticket_stream_desc')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-primary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/raise')}>
                                <Plus size={16} /> {t('raise_complaint')}
                            </button>
                            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/complaints')}>{t('review_all')}</button>
                        </div>
                    </div>

                    <div style={{ padding: '8px 0' }}>
                        {!loading && recentComplaints.length > 0 ? recentComplaints.map((c, i) => (
                            <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: i === recentComplaints.length - 1 ? 'none' : '1px solid var(--border-light)', transition: 'background 0.2s' }} className="list-item-hover">
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 5, background: c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#3b82f6' : '#94a3b8' }}></div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {c.raisedBy?.name || 'External User'} • {c.department} • {new Date(c.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                        background: c.status === 'Pending' ? '#fff7ed' : c.status === 'In Progress' ? '#eff6ff' : '#f0fdf4',
                                        color: c.status === 'Pending' ? '#c2410c' : c.status === 'In Progress' ? '#1d4ed8' : '#15803d'
                                    }}>
                                        {t(c.status.toLowerCase().replace(' ', '_'))}
                                    </span>
                                    <button onClick={() => navigate('/complaints')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                                <Activity size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                <p style={{ fontWeight: 600 }}>{loading ? t('fetching_data') : t('no_activity')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="white-card">
                        <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 800 }}>{t('operation_controls')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button onClick={() => navigate('/users')} className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', textAlign: 'left', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: '#3b82f6', color: 'white', padding: 8, borderRadius: 10 }}><Users size={18} /></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{t('user_management')}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('manage_users_desc')}</p>
                                </div>
                            </button>
                            <button onClick={() => navigate('/master_data')} className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', textAlign: 'left', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: '#10b981', color: 'white', padding: 8, borderRadius: 10 }}><Shield size={18} /></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{t('system_gov')}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('system_gov_desc')}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="white-card shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)', color: 'white' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700 }}>{t('service_overview')}</h4>
                        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8, lineHeight: 1.6 }}>{t('infrastructure_integrity')}</p>
                        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 20 }}>
                            <div>
                                <p style={{ fontSize: 10, opacity: 0.6 }}>{t('uptime')}</p>
                                <p style={{ fontWeight: 800, fontSize: 18 }}>99.9%</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 10, opacity: 0.6 }}>{t('load')}</p>
                                <p style={{ fontWeight: 800, fontSize: 18 }}>{t('low_cap')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .list-item-hover:hover {
                    background: var(--bg-main) !important;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
