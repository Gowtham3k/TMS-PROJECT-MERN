import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Shield, Search, Calendar, User, Activity,
    Download, Filter, ChevronDown, UserPlus,
    LogOut, LogIn, Trash2, Edit3, Settings, ShieldCheck,
    MessageSquare, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useApp } from '../context/AppContext';

const AuditLogs = () => {
    const { t } = useApp();
    const user = JSON.parse(localStorage.getItem('user'));
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('All Actions');
    const [dateFilter, setDateFilter] = useState('All Dates');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/audit');
            setLogs(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        const a = action.toUpperCase();
        if (a.includes('USER')) return <UserPlus size={16} />;
        if (a.includes('LOGIN')) return <LogIn size={16} />;
        if (a.includes('LOGOUT')) return <LogOut size={16} />;
        if (a.includes('DELETE')) return <Trash2 size={16} />;
        if (a.includes('UPDATE')) return <Edit3 size={16} />;
        if (a.includes('MASTER') || a.includes('DATA')) return <Settings size={16} />;
        if (a.includes('COMPLAINT')) return <MessageSquare size={16} />;
        if (a.includes('RESOLVED')) return <CheckCircle size={16} />;
        return <Activity size={16} />;
    };

    const getActionColor = (action) => {
        const a = action.toUpperCase();
        if (a.includes('DELETE')) return { bg: '#fff1f2', text: '#e11d48', icon: '#e11d48' };
        if (a.includes('CREATE') || a.includes('RESOLVED')) return { bg: '#f0fdf4', text: '#16a34a', icon: '#16a34a' };
        if (a.includes('UPDATE') || a.includes('ASSIGN')) return { bg: '#fff7ed', text: '#f97316', icon: '#f97316' };
        if (a.includes('LOGIN') || a.includes('LOGOUT')) return { bg: '#f0f9ff', text: '#0284c7', icon: '#0284c7' };
        return { bg: '#f8fafc', text: '#64748b', icon: '#64748b' };
    };

    const exportToCSV = () => {
        const headers = ['Action', 'Details', 'User', 'Role', 'IP Address', 'Timestamp'];
        const csvRows = [headers.join(',')];

        filteredLogs.forEach(log => {
            const row = [
                log.action,
                `"${log.details.replace(/"/g, '""')}"`,
                log.user?.name || 'Unknown',
                log.user?.role || '-',
                log.ipAddress || '0.0.0.0',
                new Date(log.timestamp).toLocaleString()
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TMS_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAction = actionFilter === 'All Actions' || log.action.includes(actionFilter);

        let matchesDate = true;
        if (dateFilter !== 'All Dates') {
            const logDate = new Date(log.timestamp);
            const today = new Date();
            if (dateFilter === 'Today') {
                matchesDate = logDate.toDateString() === today.toDateString();
            } else if (dateFilter === 'Last 7 Days') {
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = logDate >= weekAgo;
            }
        }

        return matchesSearch && matchesAction && matchesDate;
    });

    const uniqueActions = ['All Actions', ...new Set(logs.map(l => l.action.split('_')[0]))];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Header
                user={user}
                title={t('audit_logs')}
                subtitle={t('security_trail_extended_desc')}
                onSearch={setSearchQuery}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            style={{ appearance: 'none', padding: '10px 40px 10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569', outline: 'none' }}
                        >
                            {uniqueActions.map(a => <option key={a} value={a}>{a === 'All Actions' ? t('all_actions') : a}</option>)}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: 13, pointerEvents: 'none', color: '#64748b' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ appearance: 'none', padding: '10px 40px 10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569', outline: 'none' }}
                        >
                            <option value="All Dates">{t('all_dates')}</option>
                            <option value="Today">{t('today')}</option>
                            <option value="Last 7 Days">{t('last_7_days')}</option>
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: 13, pointerEvents: 'none', color: '#64748b' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={fetchLogs}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {t('refresh')}
                    </button>
                    <button
                        onClick={exportToCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
                    >
                        <Download size={18} /> {t('export_csv')}
                    </button>
                </div>
            </div>

            <div className="white-card" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{t('action_type')}</th>
                                <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{t('description')}</th>
                                <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{t('performer')}</th>
                                <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{t('ip_address')}</th>
                                <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{t('timestamp')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: 80, textAlign: 'center' }}><div className="loading-spinner"></div><p style={{ marginTop: 16, color: '#64748b' }}>{t('fetching_security_logs')}</p></td></tr>
                            ) : filteredLogs.length > 0 ? filteredLogs.map(log => {
                                const actionStyle = getActionColor(log.action);
                                return (
                                    <tr key={log._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '18px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 10, background: actionStyle.bg, width: 'fit-content' }}>
                                                <span style={{ color: actionStyle.icon }}>{getActionIcon(log.action)}</span>
                                                <span style={{ fontSize: 11, fontWeight: 800, color: actionStyle.text }}>{log.action.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 24px', fontSize: 14, color: '#1e293b', maxWidth: 350 }}>{log.details}</td>
                                        <td style={{ padding: '18px 24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: 14, fontWeight: 600 }}>{log.user?.name || t('system')}</span>
                                                <span style={{ fontSize: 11, color: '#64748b' }}>{log.user?.role || t('system_service_account')}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{log.ipAddress || t('internal_ip')}</td>
                                        <td style={{ padding: '18px 24px' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: 100, textAlign: 'center' }}>
                                        <Shield size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
                                        <h3 style={{ color: '#1e293b' }}>{t('no_audit_logs_found')}</h3>
                                        <p style={{ color: '#64748b' }}>{t('no_security_events_match')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                .loading-spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default AuditLogs;
