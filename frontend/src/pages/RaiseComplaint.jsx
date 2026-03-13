import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Send, Upload, X, FileText, CheckCircle2,
    AlertTriangle, MapPin, Building, Tag, Info,
    ShieldAlert, ArrowLeft, Calendar, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const RaiseComplaint = () => {
    const navigate = useNavigate();
    const { t } = useApp();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        location: '',
        department: '',
        programme: '',
        block: '',
        roomNo: '',
        priority: 'Medium',
        date: new Date().toISOString().split('T')[0]
    });

    const [masterData, setMasterData] = useState({
        departments: [],
        programmes: [],
        categories: [],
        locations: [],
        priorities: [],
        blocks: [],
        rooms: []
    });

    const [filePreview, setFilePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [ticketsCount, setTicketsCount] = useState(1);
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/settings');
                if (res.data.isSystemUnderMaintenance === true) {
                    // Allow admins to skip maintenance? 
                    // Following user request: users shouldn't be able to raise.
                    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
                        setIsMaintenance(true);
                    }
                }
            } catch (err) {
                console.error('Error checking maintenance status:', err);
            }
        };
        checkMaintenance();
        const fetchMasterData = async () => {
            console.log("Fetching Master Data...");
            try {
                const res = await axios.get('http://localhost:5000/api/master-data', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                const data = res.data || [];
                console.log(`Total Master Data items received: ${data.length}`);

                // Robust filtering with case insensitivity
                const filteredCats = data.filter(i => String(i.type).toUpperCase() === 'CATEGORY');
                const filteredDepts = data.filter(i => String(i.type).toUpperCase() === 'DEPARTMENT');
                const filteredProgs = data.filter(i => String(i.type).toUpperCase() === 'PROGRAMME');
                const filteredBlocks = data.filter(i => String(i.type).toUpperCase() === 'BLOCK');
                const filteredRooms = data.filter(i => String(i.type).toUpperCase() === 'ROOM');

                console.log("Filtered Groups:", {
                    categories: filteredCats.length,
                    departments: filteredDepts.length,
                    programmes: filteredProgs.length,
                    blocks: filteredBlocks.length,
                    rooms: filteredRooms.length
                });

                setMasterData({
                    departments: filteredDepts,
                    programmes: filteredProgs,
                    categories: filteredCats,
                    locations: data.filter(i => String(i.type).toUpperCase() === 'LOCATION'),
                    priorities: data.filter(i => String(i.type).toUpperCase() === 'PRIORITY'),
                    blocks: filteredBlocks,
                    rooms: filteredRooms
                });

                // Get stats
                axios.get('http://localhost:5000/api/complaints/stats', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                }).then(sRes => setTicketsCount(sRes.data.total + 1)).catch(() => { });

                if (data.length > 0) {
                    let userDept = null;
                    if (user.department) {
                        const targetDept = String(user.department).toLowerCase().trim();
                        userDept = filteredDepts.find(d =>
                            String(d.name).toLowerCase().trim() === targetDept ||
                            String(d.shortName).toLowerCase().trim() === targetDept
                        );
                    }

                    const initialDept = userDept ? userDept.name : (filteredDepts.length > 0 ? filteredDepts[0].name : '');
                    const initialCat = filteredCats.length > 0 ? filteredCats[0].name : '';

                    setFormData(prev => ({
                        ...prev,
                        type: prev.type || initialCat,
                        department: initialDept,
                    }));
                }
            } catch (err) {
                console.error('Error in fetchMasterData:', err);
            }
        };
        fetchMasterData();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFilePreview({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/complaints', formData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setSubmitting(false);
            alert('Your support request has been raised successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setSubmitting(false);
            const msg = err.response?.data?.msg || err.response?.data || 'Error raising complaint. Please check your network connection.';
            alert(msg);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '20px auto', animation: 'fadeIn 0.5s ease-out' }}>
            <button
                onClick={() => navigate('/dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}
            >
                <ArrowLeft size={18} /> {t('back_to_dashboard')}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                <div style={{ background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{t('raise_new_title')}</h1>
                            <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                                {t('ticket_id_lbl')}: #CMP-{(2500 + ticketsCount)}
                            </div>
                        </div>
                        <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>{t('raise_new_desc')}</p>
                    </div>

                    {isMaintenance ? (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 20,
                            padding: '40px 20px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 20
                        }}>
                            <div style={{ background: '#fee2e2', padding: 20, borderRadius: '50%', color: '#ef4444' }}>
                                <ShieldAlert size={48} />
                            </div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#991b1b' }}>{t('system_off')}</h2>
                            <p style={{ color: '#b91c1c', fontSize: 16, maxWidth: 400, lineHeight: 1.6 }}>
                                {t('maintenance_active_msg')}
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    marginTop: 10,
                                    padding: '12px 24px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('back_to_dashboard')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                                    <Info size={16} /> {t('subject_title')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('subject_placeholder')}
                                    style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 15, outline: 'none' }}
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <Tag size={16} /> {t('complaint_type')}
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>{masterData.categories.length > 0 ? t('select_category') : t('no_categories_added') || 'No categories available'}</option>
                                        {masterData.categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <Calendar size={16} /> {t('incident_date')}
                                    </label>
                                    <input
                                        type="date"
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 15, outline: 'none' }}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <ShieldAlert size={16} /> {t('priority')}
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        required
                                    >
                                        <option value="Low">{t('low')}</option>
                                        <option value="Medium">{t('medium')}</option>
                                        <option value="High">{t('high')}</option>
                                        <option value="Emergency">{t('emergency')}</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <Building size={16} /> {t('department')}
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value, programme: '', block: '', roomNo: '' })}
                                    >
                                        {(!user.department || user.role !== 'USER') && <option value="">{t('department')}</option>}
                                        {masterData.departments
                                            .filter(d => {
                                                if (user.role !== 'USER' || !user.department) return true;
                                                const uDept = String(user.department).toLowerCase().trim();
                                                return String(d.name).toLowerCase().trim() === uDept ||
                                                    String(d.shortName).toLowerCase().trim() === uDept;
                                            })
                                            .map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <Layers size={16} /> {t('programmes')}
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                                        value={formData.programme}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, programme: val, block: '', roomNo: '' });
                                        }}
                                        disabled={!formData.department}
                                    >
                                        <option value="">{t('programmes')}</option>
                                        {masterData.programmes
                                            .filter(p => {
                                                const parent = p.parentId;
                                                const pName = String(parent?.name || '').toLowerCase().trim();
                                                const selectedDept = String(formData.department || '').toLowerCase().trim();
                                                return pName === selectedDept;
                                            })
                                            .map(p => <option key={p._id} value={p.name}>{p.name}</option>)
                                        }
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <MapPin size={16} /> {t('location_block')}
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                                        value={formData.block}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, block: val, location: val, roomNo: '' });
                                        }}
                                        required
                                        disabled={!formData.department}
                                    >
                                        <option value="">{t('block')}</option>
                                        {masterData.blocks
                                            .filter(b => {
                                                const parent = b.parentId;
                                                const pName = String(parent?.name || '').toLowerCase().trim();
                                                const selectedDept = String(formData.department || '').toLowerCase().trim();
                                                return pName === selectedDept;
                                            })
                                            .map(b => <option key={b._id} value={b.name}>{b.name}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569', minHeight: 42 }}>
                                        <MapPin size={16} /> {t('room_no')}
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                                        value={formData.roomNo}
                                        onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                        required
                                        disabled={!formData.block}
                                    >
                                        <option value="">{t('room')}</option>
                                        {masterData.rooms
                                            .filter(r => {
                                                const parent = r.parentId;
                                                const pName = String(parent?.name || '').toLowerCase().trim();
                                                const selectedBlock = String(formData.block || '').toLowerCase().trim();
                                                return pName === selectedBlock;
                                            })
                                            .map(r => <option key={r._id} value={r.name}>{r.name}</option>)
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                                    <FileText size={16} /> {t('description')}
                                </label>
                                <textarea
                                    placeholder={t('desc_placeholder')}
                                    style={{ width: '100%', padding: '16px 20px', borderRadius: 12, minHeight: 140, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 15, outline: 'none', lineHeight: 1.6 }}
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="file-upload">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                                    <Upload size={16} /> {t('attachment_lbl')}
                                </label>
                                {filePreview ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#f0fdf4', borderRadius: 12, border: '1.5px dashed #16a34a' }}>
                                        <div style={{ background: '#16a34a', color: 'white', padding: 10, borderRadius: 10 }}>
                                            <FileText size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#166534' }}>{filePreview.name}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: '#15803d' }}>{filePreview.size} • Ready for upload</p>
                                        </div>
                                        <button onClick={() => setFilePreview(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '32px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
                                            <Upload size={32} />
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{t('drop_file_hint')}</p>
                                            <p style={{ margin: 0, fontSize: 11 }}>{t('max_file_size')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '18px', fontSize: 18, fontWeight: 800,
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
                                    background: submitting ? '#94a3b8' : '#3b82f6', border: 'none',
                                    borderRadius: 16, boxShadow: '0 8px 20px -5px rgba(59, 130, 246, 0.4)',
                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? t('processing') : <><CheckCircle2 size={24} /> {t('submit_request')}</>}
                            </button>
                        </form>
                    )}
                </div>

                {/* Information Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="white-card" style={{ background: '#0f172a', color: 'white', padding: 28 }}>
                        <h4 style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <AlertTriangle size={20} color="#f59e0b" /> {t('response_time_sla')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ opacity: 0.7 }}>{t('urgent_priority')}</span>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>2 {t('hours')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ opacity: 0.7 }}>{t('high_priority')}</span>
                                <span style={{ fontWeight: 700, color: '#f97316' }}>4 {t('hours')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ opacity: 0.7 }}>{t('medium_priority')}</span>
                                <span style={{ fontWeight: 700, color: '#3b82f6' }}>24 {t('hours')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="white-card" style={{ padding: 28, border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t('quality_guarantee')}</h4>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                                <CheckCircle2 size={16} color="#10b981" />
                                <span>{t('quality_verif')}</span>
                            </li>
                            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                                <CheckCircle2 size={16} color="#10b981" />
                                <span>{t('quality_escalation')}</span>
                            </li>
                            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                                <CheckCircle2 size={16} color="#10b981" />
                                <span>{t('quality_log')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaiseComplaint;
