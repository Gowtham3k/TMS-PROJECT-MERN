import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ListChecks, CheckCircle, Clock, AlertCircle, Settings as SettingsIcon, Briefcase, Zap, Shield, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../layout/Header';

const StaffDashboard = ({ stats, user }) => {
    const { t } = useApp();
    const navigate = useNavigate();
    const [assignedComplaints, setAssignedComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssigned = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/complaints', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (Array.isArray(res.data)) {
                    setAssignedComplaints(res.data.slice(0, 6));
                } else {
                    setAssignedComplaints([]);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAssigned();
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Header
                user={user}
                stats={stats}
                title={`${t('support_workspace')}: ${t('welcome')}, ${user.name.split(' ')[0]}! ✨`}
                subtitle={t('staff_portal_subtitle')}
            />

            <div className="stats-grid">
                <div className="stat-card blue glow-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/complaints')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('total_raised')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.total || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <Briefcase size={28} />
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
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('completed')}</p>
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
                            <Zap size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 32 }}>
                <div className="white-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>{t('assigned_ops_log')}</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('assigned_ops_subtitle')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Briefcase size={14} /> {t('my_tasks')}
                            </button>
                            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/complaints')}>{t('view_all')}</button>
                        </div>
                    </div>

                    <div style={{ padding: '8px 0' }}>
                        {!loading && assignedComplaints.length > 0 ? assignedComplaints.map((item, i) => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', borderBottom: i === assignedComplaints.length - 1 ? 'none' : '1px solid var(--border-light)', alignItems: 'center', transition: 'background 0.2s' }} className="list-item-hover">
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 5, background: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#3b82f6' : '#94a3b8' }}></div>
                                    <div>
                                        <h4 style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</h4>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {item.type} • ID: #{item._id.slice(-6).toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                        background: item.status === 'Pending' ? '#fff7ed' : item.status === 'In Progress' ? '#eff6ff' : '#f0fdf4',
                                        color: item.status === 'Pending' ? '#c2410c' : item.status === 'In Progress' ? '#1d4ed8' : '#15803d'
                                    }}>
                                        {item.status}
                                    </span>
                                    <button onClick={() => navigate('/complaints')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                                <Shield size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                <p style={{ fontWeight: 600 }}>{loading ? t('task_data_loading') : t('no_tasks_assigned')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="white-card">
                        <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 800 }}>{t('action_center')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button onClick={() => navigate('/settings')} className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', textAlign: 'left', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: '#3b82f6', color: 'white', padding: 8, borderRadius: 10 }}><Briefcase size={18} /></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{t('my_profile_lbl')}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('profile_update_lbl')}</p>
                                </div>
                            </button>
                            <button onClick={() => navigate('/complaints')} className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', textAlign: 'left', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: '#10b981', color: 'white', padding: 8, borderRadius: 10 }}><Shield size={18} /></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{t('secure_cases')}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('res_protocols')}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="white-card shadow-lg" style={{ background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', color: 'white' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700 }}>{t('res_efficiency')}</h4>
                        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8, lineHeight: 1.6 }}>{t('res_efficiency_desc')}</p>
                        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 20 }}>
                            <div>
                                <p style={{ fontSize: 10, opacity: 0.6 }}>{t('sla_adherence')}</p>
                                <p style={{ fontWeight: 800, fontSize: 18 }}>96%</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 10, opacity: 0.6 }}>{t('resolution_score')}</p>
                                <p style={{ fontWeight: 800, fontSize: 18 }}>EXPERT</p>
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

export default StaffDashboard;
