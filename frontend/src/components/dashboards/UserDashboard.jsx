import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Clock, CheckCircle, ListChecks,
    ArrowRight, Settings as SettingsIcon,
    User as UserIcon, HelpCircle, FileText,
    TrendingUp, Calendar, Zap, MessageSquare, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../api';
import Header from '../layout/Header';

const UserDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { t } = useApp();
    const [allComplaints, setAllComplaints] = useState([]);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/complaints');
            setAllComplaints(res.data);
            updateDashboard(res.data, selectedDate);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const updateDashboard = (data, date) => {
        let filtered = data;
        if (date) {
            filtered = data.filter(c => {
                const cDate = new Date(c.createdAt).toISOString().split('T')[0];
                return cDate === date;
            });
        }

        const newStats = {
            total: filtered.length,
            pending: filtered.filter(c => c.status === 'Pending').length,
            inProgress: filtered.filter(c => c.status === 'In Progress').length,
            resolved: filtered.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
        };

        setStats(newStats);
        setRecentComplaints(filtered.slice(0, 5));
    };

    useEffect(() => {
        updateDashboard(allComplaints, selectedDate);
    }, [selectedDate, allComplaints]);

    const quickActions = [
        { id: 'raise', title: 'Raise Ticket', icon: Plus, path: '/raise', color: '#3b82f6', desc: 'Create a new support ticket' },
        { id: 'view', title: 'My Tickets', icon: ListChecks, path: '/complaints', color: '#10b981', desc: 'Track resolution progress' },
        { id: 'settings', title: 'Edit Profile', icon: UserIcon, path: '/settings', color: '#6366f1', desc: 'Manage your personal info' },
        { id: 'help', title: 'Need Help?', icon: HelpCircle, path: '/support', color: '#f59e0b', desc: 'Read FAQs and guides' },
    ];

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return { color: '#f59e0b', bg: '#fff7ed', icon: Clock };
            case 'in progress': return { color: '#3b82f6', bg: '#eff6ff', icon: TrendingUp };
            case 'resolved': return { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle };
            default: return { color: '#64748b', bg: '#f8fafc', icon: HelpCircle };
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Header
                user={user}
                stats={stats}
                title={`${t('user_intelligence')}: ${t('welcome')}, ${user.name.split(' ')[0]}! ✨`}
                subtitle={t('user_portal_subtitle')}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, alignItems: 'center', gap: 12 }}>
                {selectedDate && (
                    <button
                        onClick={() => setSelectedDate('')}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '10px 18px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        {t('clear_filter')}
                    </button>
                )}
                <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => document.getElementById('dash-date-picker').showPicker()}
                >
                    <div style={{ fontSize: 13, background: 'var(--card-bg-solid)', padding: '10px 18px', borderRadius: 12, border: '1.5px solid var(--border-light)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                        <Calendar size={18} /> {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : t('filter_timeline')}
                    </div>
                    <input
                        id="dash-date-picker"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 40, opacity: stats.total === 0 && selectedDate ? 0.6 : 1 }}>
                <div className="stat-card blue glow-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/complaints')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('ticket_volume')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{stats.total}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <FileText size={28} />
                        </div>
                    </div>
                </div>
                <div className="stat-card orange glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('awaiting_triage')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{stats.pending}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <Clock size={28} />
                        </div>
                    </div>
                </div>
                <div className="stat-card teal glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('active_resolution')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{stats.inProgress}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <Zap size={28} />
                        </div>
                    </div>
                </div>
                <div className="stat-card green glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13, fontWeight: 500 }}>{t('successful_closure')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{stats.resolved}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <CheckCircle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 32 }}>
                <div className="white-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>{t('operation_log')}</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('operation_log_subtitle')}</p>
                        </div>
                        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/complaints')}>{t('review_archive')}</button>
                    </div>

                    <div style={{ padding: '8px 0' }}>
                        {loading ? (
                            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Authenticating with data server...</div>
                        ) : recentComplaints.length > 0 ? recentComplaints.map((c, i) => (
                            <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: i === recentComplaints.length - 1 ? 'none' : '1px solid var(--border-light)', transition: 'background 0.2s' }} className="list-item-hover">
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ background: 'var(--bg-main)', padding: 10, borderRadius: 12, color: 'var(--accent-blue)' }}>
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {c.type} • ID: #{c._id.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                        background: getStatusStyle(c.status).bg, color: getStatusStyle(c.status).color
                                    }}>
                                        {c.status}
                                    </span>
                                    <button onClick={() => navigate('/complaints')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                                <Shield size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                <p style={{ fontWeight: 600 }}>No active tickets recorded for this segment.</p>
                                <button className="btn btn-primary" style={{ marginTop: 20, fontSize: 12 }} onClick={() => navigate('/raise')}>Initialize Your First Ticket</button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="white-card" style={{ padding: 32 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>{t('strategic_actions')}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {quickActions.map(action => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => navigate(action.path)}
                                        className="card-vibrant"
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            gap: 12, padding: '24px 16px', background: 'var(--card-bg-solid)',
                                            borderRadius: 20, cursor: 'pointer', textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ background: `${action.color}15`, padding: 12, borderRadius: 14 }}>
                                            <Icon size={24} color={action.color} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>{t(action.id === 'raise' ? 'raise_ticket' : action.id === 'view' ? 'my_tickets' : action.id === 'settings' ? 'edit_profile' : 'need_help')}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-secondary)' }}>{action.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="white-card shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{t('instant_res_support')}</h4>
                            <p style={{ margin: '12px 0 24px', fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>Deploy critical hardware and infrastructure issues to our specialized technical squadron for immediate triage.</p>
                            <button onClick={() => navigate('/support')} className="btn" style={{ background: 'white', color: '#1e3a8a', fontWeight: 800, padding: '12px 24px', width: '100%', borderRadius: 12 }}>{t('contact_live_support')}</button>
                        </div>
                        <Zap size={100} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }} />
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

export default UserDashboard;
