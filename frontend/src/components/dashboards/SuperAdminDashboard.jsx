import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Database, ListChecks, Users, CheckCircle, Clock, Search, Settings as SettingsIcon, FileText, Send, X, Shield, Zap, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../layout/Header';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SuperAdminDashboard = ({ stats, user }) => {
    const { t } = useApp();
    const navigate = useNavigate();
    const [allComplaints, setAllComplaints] = useState([]);
    const [filteredActivity, setFilteredActivity] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const chartRef = useRef();

    // Report Modal States
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState({ complaintId: '', title: '', recipientEmail: '' });

    const fetchAll = async () => {
        try {
            const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
            const [complaintsRes, auditRes] = await Promise.all([
                axios.get('http://localhost:5000/api/complaints', config),
                axios.get('http://localhost:5000/api/audit', config)
            ]);
            setAllComplaints(complaintsRes.data);
            setAuditLogs(auditRes.data.slice(0, 10)); // Show last 10 audit logs
            setFilteredActivity(complaintsRes.data.slice(0, 10));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // Group complaints by month
    const monthData = Array(12).fill(0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    allComplaints.forEach(c => {
        const date = new Date(c.createdAt);
        monthData[date.getMonth()]++;
    });

    const pieData = {
        labels: monthNames.filter((_, i) => monthData[i] > 0),
        datasets: [{
            data: monthData.filter(d => d > 0),
            backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#ec4899', '#06b6d4', '#475569', '#f97316', '#a855f7'
            ],
            borderWidth: 0,
            hoverOffset: 15
        }]
    };

    const barData = {
        labels: monthNames,
        datasets: [{
            label: 'System Load',
            data: monthData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6,
        }]
    };

    const handleChartClick = (event, elements) => {
        if (elements && elements.length > 0) {
            const index = elements[0].index;
            const activeLabels = monthNames.filter((_, i) => monthData[i] > 0);
            const clickedMonthLabel = activeLabels[index];
            const monthIndex = monthNames.indexOf(clickedMonthLabel);

            setSelectedMonth(clickedMonthLabel);
            const filtered = allComplaints.filter(c => new Date(c.createdAt).getMonth() === monthIndex);
            setFilteredActivity(filtered);
        } else {
            setSelectedMonth(null);
            setFilteredActivity(allComplaints.slice(0, 10));
        }
    };

    const handleReportClick = (complaint) => {
        setReportData({
            complaintId: complaint._id,
            title: `Resolution Report: ${complaint.title}`,
            recipientEmail: complaint.raisedBy?.email || ''
        });
        setIsReportModalOpen(true);
    };

    const handleSendReport = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/reports', reportData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setIsReportModalOpen(false);
            alert('Report sent successfully!');
        } catch (err) {
            alert('Error generating report');
        }
    };

    const groupedByMonth = {};
    const displayList = selectedMonth ? filteredActivity : allComplaints;

    displayList.forEach(item => {
        const date = new Date(item.createdAt);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = [];
        groupedByMonth[monthYear].push(item);
    });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Header
                user={user}
                stats={stats}
                title={`${t('master_control')}: ${t('welcome')}, ${user.name.split(' ')[0]}! 👑`}
                subtitle="High-level system governance and global infrastructure orchestration."
            />

            <div className="stats-grid">
                <div className="stat-card blue glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13 }}>{t('total_complaints')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.total || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <ListChecks size={28} />
                        </div>
                    </div>
                    <div style={{ marginTop: 15, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.8 }}>
                        <TrendingUp size={12} /> <span style={{ fontWeight: 600 }}>+12%</span> {t('volume_vs_last_month')}
                    </div>
                </div>
                <div className="stat-card orange glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13 }}>{t('pending')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.pending || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <Clock size={28} />
                        </div>
                    </div>
                    <div style={{ marginTop: 15, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.8 }}>
                        <Shield size={12} /> {t('priority_resolution')}: <span style={{ fontWeight: 600 }}>{t('active')}</span>
                    </div>
                </div>
                <div className="stat-card green glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13 }}>{t('completed')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.resolved || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <CheckCircle size={28} />
                        </div>
                    </div>
                    <div style={{ marginTop: 15, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.8 }}>
                        <CheckCircle size={12} /> <span style={{ fontWeight: 600 }}>94%</span> {t('satisfaction_rate')}
                    </div>
                </div>
                <div className="stat-card teal glow-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: 13 }}>{t('in_progress')}</p>
                            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stats.inProgress || 0}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 14 }}>
                            <Zap size={28} />
                        </div>
                    </div>
                    <div style={{ marginTop: 15, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.8 }}>
                        <Database size={12} /> {t('system_load')}: <span style={{ fontWeight: 600 }}>{t('minimal')}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 32 }}>
                <div className="white-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                                {selectedMonth ? `Analytics for ${selectedMonth}` : t('system_audit')}
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Real-time security trail and administrative activity tracking.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-primary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/raise')}>
                                <Plus size={16} /> {t('raise_complaint')}
                            </button>
                            {selectedMonth && (
                                <button className="btn" style={{ fontSize: 12, background: 'var(--bg-main)', color: 'var(--text-primary)' }} onClick={() => { setSelectedMonth(null); setFilteredActivity(allComplaints.slice(0, 10)); }}>
                                    {t('view_all')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '24px 32px' }}>
                        {selectedMonth ? (
                            Object.keys(groupedByMonth).length > 0 ? Object.keys(groupedByMonth).map(month => (
                                <div key={month} style={{ marginBottom: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{ height: 1, flex: 1, background: 'var(--border-light)' }}></div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{month}</span>
                                        <div style={{ height: 1, flex: 1, background: 'var(--border-light)' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {groupedByMonth[month].map((item) => (
                                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-main)', borderRadius: 16, alignItems: 'center', border: '1px solid var(--border-light)' }}>
                                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                    <div style={{ background: 'var(--card-bg-solid)', padding: 10, borderRadius: 12 }}>
                                                        <SettingsIcon size={20} color="#3b82f6" />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</h4>
                                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                                            Raised by {item.raisedBy?.name || 'User'} • {item.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                    <span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: 10 }}>
                                                        {t(item.status.toLowerCase().replace(' ', '_'))}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                    <Database size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                    <p style={{ fontWeight: 600 }}>{t('no_complaints_found')}</p>
                                </div>
                            )
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {auditLogs.length > 0 ? auditLogs.map((log) => (
                                    <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-main)', borderRadius: 16, alignItems: 'center', border: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <div style={{ background: 'var(--card-bg-solid)', padding: 10, borderRadius: 12 }}>
                                                <Shield size={20} color="#3b82f6" />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: 14, fontWeight: 700 }}>{log.action.replace(/_/g, ' ')}</h4>
                                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                                                    {log.details}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, fontWeight: 700 }}>{log.user?.name || 'System'}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                        <Shield size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                        <p style={{ fontWeight: 600 }}>{t('no_activity')}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate('/audit-logs')}
                                    style={{ marginTop: 12, padding: '12px', background: 'none', border: '1.5px dashed var(--border-light)', borderRadius: 12, color: 'var(--accent-blue)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                                >
                                    {t('audit_logs')} <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="white-card">
                        <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 800 }}>{t('distribution_trends')}</h3>
                        <div style={{ height: 260, display: 'flex', justifyContent: 'center' }}>
                            <Pie
                                data={pieData}
                                options={{
                                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 11, family: 'Outfit' } } } },
                                    maintainAspectRatio: false,
                                    onClick: (e, elements) => handleChartClick(e, elements)
                                }}
                            />
                        </div>
                    </div>

                    <div className="white-card">
                        <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 800 }}>{t('capacity_analysis')}</h3>
                        <div style={{ height: 180 }}>
                            <Bar
                                data={barData}
                                options={{
                                    scales: { y: { display: false }, x: { grid: { display: false } } },
                                    plugins: { legend: { display: false } },
                                    maintainAspectRatio: false
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <div>
                                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('avg_resolution')}</p>
                                <p style={{ fontWeight: 800, fontSize: 18, color: '#3b82f6' }}>4.2h</p>
                            </div>
                            <div style={{ width: 1, background: 'var(--border-light)' }}></div>
                            <div>
                                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('server_latency')}</p>
                                <p style={{ fontWeight: 800, fontSize: 18, color: '#10b981' }}>28ms</p>
                            </div>
                        </div>
                    </div>

                    <div className="white-card" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Shield size={24} />
                            <h4 style={{ fontWeight: 700 }}>{t('security_guard_active')}</h4>
                        </div>
                        <p style={{ fontSize: 12, marginTop: 10, opacity: 0.9 }}>{t('infrastructure_integrity')}</p>
                    </div>
                </div>
            </div>

            {/* Modal remains same but styled via common classes */}
            {isReportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 650 }}>
                        <div style={{ padding: '32px 40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800 }}>Generate Outcome Report</h2>
                                <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700 }}>{t('report_subject')}</label>
                                    <input type="text" value={reportData.title} onChange={(e) => setReportData({ ...reportData, title: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700 }}>{t('recipient_email')}</label>
                                    <input type="email" value={reportData.recipientEmail} onChange={(e) => setReportData({ ...reportData, recipientEmail: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: 16, marginTop: 10, fontSize: 16, fontWeight: 800 }}>{t('dispatch_report')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
