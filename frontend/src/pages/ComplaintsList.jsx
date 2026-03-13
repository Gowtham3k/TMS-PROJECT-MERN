import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Search, Filter, Clock, CheckCircle,
    MoreVertical, X, User, MapPin, Tag,
    Activity, AlertTriangle, Send, Calendar,
    ExternalLink, Trash2, Edit, Star, Shield,
    ArrowRight, MessageSquare, Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const ComplaintsList = () => {
    const { t } = useApp();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateNote, setUpdateNote] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [assigneeId, setAssigneeId] = useState('');

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/api/complaints');
            setComplaints(res.data);
            setFilteredComplaints(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStaff = async () => {
        if (!isAdmin) return;
        try {
            const res = await api.get('/api/complaints/staff');
            setStaffList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchComplaints();
        fetchStaff();
    }, []);

    useEffect(() => {
        let results = complaints.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (statusFilter !== 'All') {
            results = results.filter(c => c.status === statusFilter);
        }

        setFilteredComplaints(results);
    }, [searchQuery, statusFilter, complaints]);

    const handleOpenDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setUpdateStatus(complaint.status);
        setUpdateNote('');
        setAssigneeId(complaint.assignedTo?._id || '');
        setShowModal(true);
    };

    const handleOpenRating = (complaint) => {
        setSelectedComplaint(complaint);
        setShowRatingModal(true);
    };

    const submitFeedback = async () => {
        try {
            await api.put(`/api/complaints/${selectedComplaint._id}/feedback`, { rating, feedback });
            setShowRatingModal(false);
            fetchComplaints();
            alert(t('rating_submitted'));
        } catch (err) {
            alert(t('rating_error'));
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await api.put(`/api/complaints/${selectedComplaint._id}/status`, { status: updateStatus, note: updateNote });
            setShowModal(false);
            fetchComplaints();
            alert(t('status_updated_success'));
        } catch (err) {
            alert(t('status_update_error'));
        }
    };

    const handleAssign = async () => {
        if (!assigneeId) return alert(t('select_staff_err'));
        try {
            await api.put(`/api/complaints/${selectedComplaint._id}/assign`, { adminId: assigneeId });
            setShowModal(false);
            fetchComplaints();
            alert(t('ticket_assigned_success'));
        } catch (err) {
            alert(t('ticket_assign_error'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('delete_confirm_modal'))) return;
        try {
            await api.delete(`/api/complaints/${id}`);
            setShowModal(false);
            fetchComplaints();
            alert(t('ticket_deleted_success'));
        } catch (err) {
            alert(t('ticket_delete_error'));
        }
    };

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return { color: '#f59e0b', bg: '#fff7ed', icon: Clock };
            case 'on hold': return { color: '#ef4444', bg: '#fef2f2', icon: AlertTriangle };
            case 'in progress': return { color: '#3b82f6', bg: '#eff6ff', icon: Activity };
            case 'resolved': return { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle };
            case 'closed': return { color: '#64748b', bg: '#f1f5f9', icon: Shield };
            default: return { color: '#64748b', bg: '#f8fafc', icon: Clock };
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{user.role === 'USER' ? t('my_tickets') : t('support_queue')}</h1>
                    <p style={{ color: '#64748b', marginTop: 4 }}>{t('manage_track_subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={t('search_complaints_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '12px 16px', paddingLeft: 44, borderRadius: 12, border: '1.5px solid #e2e8f0', width: 320, background: 'white', outline: 'none' }}
                        />
                        <Search size={20} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                {['All', 'Pending', 'On Hold', 'In Progress', 'Resolved', 'Closed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            background: statusFilter === status ? '#3b82f6' : 'white',
                            color: statusFilter === status ? 'white' : '#64748b',
                            boxShadow: statusFilter === status ? '0 4px 10px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                            transition: '0.2s'
                        }}
                    >
                        {t(status.toLowerCase().replace(' ', '_'))}
                    </button>
                ))}
            </div>

            <div className="white-card" style={{ padding: 0, borderRadius: 20, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('ticket_details_lbl')}</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('category_lbl')}</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('status_lbl')}</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('priority_lbl')}</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('date_lbl')}</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('assigned_to_lbl')}</th>
                            <th style={{ padding: '18px 24px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComplaints.length > 0 ? filteredComplaints.map((c, i) => {
                            const statusStyle = getStatusStyle(c.status);
                            const StatusIcon = statusStyle.icon;
                            return (
                                <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#faffff'}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', cursor: 'pointer' }} onClick={() => handleOpenDetails(c)}>{c.title}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                                                <MapPin size={12} /> {c.location} • {t('room_no')} {c.roomNo}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: 14 }}>{c.type}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: statusStyle.color, background: statusStyle.bg, padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, width: 'fit-content' }}>
                                            <StatusIcon size={14} /> {t(c.status.toLowerCase().replace(' ', '_'))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#3b82f6' : '#64748b' }}>
                                            {t(c.priority.toLowerCase())}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                                        {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={14} color="#64748b" />
                                            </div>
                                            <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{c.assignedTo?.name || t('waiting_for_staff')}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="btn" style={{ padding: 10, background: '#eff6ff', borderRadius: 10, border: 'none' }} onClick={() => handleOpenDetails(c)}>
                                                <Activity size={18} color="#3b82f6" />
                                            </button>
                                            {c.status === 'Resolved' && !c.rating && user.role === 'USER' && (
                                                <button className="btn" style={{ padding: 10, background: '#f0fdf4', borderRadius: 10, border: 'none' }} onClick={() => handleOpenRating(c)}>
                                                    <Star size={18} color="#10b981" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="7" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>{t('no_tickets_found')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Comprehensive Detail Modal */}
            {showModal && selectedComplaint && (
                <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="modal-content" style={{ maxWidth: 850, padding: 0, borderRadius: 28, overflow: 'hidden' }}>
                        <div style={{ background: '#0f172a', padding: '32px 40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{t('detail_modal_title')}</h1>
                                <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>{t('ticket_id')}: #CMP-{selectedComplaint._id.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: 10, borderRadius: 12, cursor: 'pointer', color: 'white' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>{t('issue_info')}</h4>
                                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>{selectedComplaint.title}</h2>
                                    <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15 }}>{selectedComplaint.description}</p>
                                </div>

                                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Activity size={16} /> {t('res_timeline')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        {selectedComplaint.timeline.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: 12, height: 12, borderRadius: 6,
                                                        background: idx === selectedComplaint.timeline.length - 1 ? '#3b82f6' : '#cbd5e1',
                                                        boxShadow: idx === selectedComplaint.timeline.length - 1 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
                                                    }}></div>
                                                    {idx !== selectedComplaint.timeline.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', margin: '4px 0' }}></div>}
                                                </div>
                                                <div style={{ flex: 1, paddingBottom: 10 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t(item.status.toLowerCase().replace(' ', '_'))}</span>
                                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(item.timestamp || item.date).toLocaleString()}</span>
                                                    </div>
                                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{item.note}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="white-card" style={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>{t('assignment_info_lbl')}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={24} color="#64748b" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{selectedComplaint.assignedTo?.name || t('waiting_for_staff')}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{t('tech_staff_desc')}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b' }}>{t('location')}</span>
                                            <span style={{ fontWeight: 600 }}>{selectedComplaint.location}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b' }}>{t('priority_lbl')}</span>
                                            <span style={{ fontWeight: 700, color: '#ef4444' }}>{t(selectedComplaint.priority.toLowerCase())}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b' }}>{t('sla_est')}</span>
                                            <span style={{ fontWeight: 600 }}>{selectedComplaint.priority === 'High' ? t('sla_4h') : t('sla_24h')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="white-card" style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', boxShadow: 'none' }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0369a1', marginBottom: 12 }}>{t('attachments_lbl')}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'white', borderRadius: 12, border: '1px solid #dbeafe', cursor: 'pointer' }}>
                                        <MessageSquare size={18} color="#3b82f6" />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a' }}>technical_spec.png</span>
                                    </div>
                                </div>

                                {(['ADMIN', 'SUPER_ADMIN'].includes(user.role) || (user.role !== 'USER')) && (
                                    <>
                                        {isAdmin && (
                                            <div className="white-card" style={{ border: '1px solid #e2e8f0', boxShadow: 'none', marginBottom: 20 }}>
                                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>{t('assign_resolver_lbl')}</h4>
                                                <select
                                                    value={assigneeId}
                                                    onChange={(e) => setAssigneeId(e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e2e8f0', marginBottom: 12, outline: 'none', fontSize: 14 }}
                                                >
                                                    <option value="">{t('select_staff_placeholder')}</option>
                                                    {staffList.map(item => (
                                                        <option key={item._id} value={item._id}>{item.name} ({item.role})</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ width: '100%', padding: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                    onClick={handleAssign}
                                                >
                                                    {t('assign_specialist_btn')}
                                                </button>
                                            </div>
                                        )}

                                        <div className="white-card" style={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>{t('update')} {t('status_lbl')}</h4>
                                            <select
                                                value={updateStatus}
                                                onChange={(e) => setUpdateStatus(e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e2e8f0', marginBottom: 12, outline: 'none', fontSize: 14 }}
                                            >
                                                <option value="Pending">{t('pending')}</option>
                                                <option value="On Hold">{t('on_hold')}</option>
                                                <option value="In Progress">{t('in_progress')}</option>
                                                <option value="Resolved">{t('completed')}</option>
                                                <option value="Closed">{t('closed')}</option>
                                            </select>
                                            <textarea
                                                placeholder={t('add_update_note_placeholder')}
                                                value={updateNote}
                                                onChange={(e) => setUpdateNote(e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e2e8f0', minHeight: 80, marginBottom: 16, outline: 'none', fontSize: 13 }}
                                            ></textarea>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ flex: 1, padding: '12px' }}
                                                    onClick={handleUpdateStatus}
                                                >
                                                    {t('update')} {t('status_lbl')}
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '12px', background: '#fee2e2', color: '#ef4444', borderRadius: 10, border: 'none' }}
                                                    onClick={() => handleDelete(selectedComplaint._id)}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedComplaint.status === 'Resolved' && user.role === 'USER' && (
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: 16, borderRadius: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                        onClick={() => { setShowModal(false); setShowRatingModal(true); }}
                                    >
                                        <Star size={20} /> {t('rate_resolution')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 450, padding: 40, borderRadius: 24 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>{t('rate_service')}</h2>
                        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 32 }}>{t('rate_experience_desc')}</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', transform: rating >= s ? 'scale(1.2)' : 'scale(1)', transition: '0.2s' }}>
                                    <Star size={36} fill={rating >= s ? '#f59e0b' : 'none'} color={rating >= s ? '#f59e0b' : '#cbd5e1'} />
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder={t('service_feedback_placeholder')}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            style={{ width: '100%', padding: 16, borderRadius: 12, border: '1.5px solid #e2e8f0', minHeight: 100, marginBottom: 24, fontSize: 14, outline: 'none' }}
                        ></textarea>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn" style={{ flex: 1, padding: 14, background: '#f1f5f9', color: '#475569', borderRadius: 12 }} onClick={() => setShowRatingModal(false)}>{t('skip')}</button>
                            <button className="btn btn-primary" style={{ flex: 1, padding: 14, borderRadius: 12 }} onClick={submitFeedback}>{t('submit_feedback')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintsList;
