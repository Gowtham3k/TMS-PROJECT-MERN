import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Database, Plus, Search, Edit, Trash2, X,
    AlertCircle, ChevronLeft, Building2, ClipboardList,
    MapPin, AlertTriangle, Info, CheckCircle, Loader2,
    Layers, Home, Shield, Users as UsersIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const MasterData = () => {
    const { t } = useApp();
    const [allData, setAllData] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', shortName: '', description: '', type: '', parentId: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const sections = [
        { id: 'DEPARTMENT', title: t('departments'), icon: <Building2 />, color: '#3b82f6', bg: '#eff6ff' },
        { id: 'PROGRAMME', title: t('programmes'), icon: <Layers />, color: '#8b5cf6', bg: '#f5f3ff' },
        { id: 'BLOCK', title: t('blocks'), icon: <Home />, color: '#ec4899', bg: '#fdf2f8' },
        { id: 'ROOM', title: t('rooms'), icon: <MapPin />, color: '#10b981', bg: '#ecfdf5' },
        { id: 'ROLE', title: t('roles'), icon: <Shield />, color: '#f59e0b', bg: '#fffbeb' },
        { id: 'CATEGORY', title: t('categories'), icon: <ClipboardList />, color: '#06b6d4', bg: '#ecfeff' },
        { id: 'PRIORITY', title: t('priorities'), icon: <AlertTriangle />, color: '#ef4444', bg: '#fef2f2' }
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/master-data');
            setAllData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching master data:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getCount = (type) => allData.filter(item => item.type === type.toUpperCase()).length;

    const handleOpenModal = (type, item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                shortName: item.shortName || '',
                description: item.description || '',
                type: item.type,
                parentId: item.parentId?._id || item.parentId || ''
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', shortName: '', description: '', type: type, parentId: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.parentId) delete dataToSubmit.parentId;

            if (editingItem) {
                await api.put(`/api/master-data/${editingItem._id}`, dataToSubmit);
            } else {
                await api.post('/api/master-data', dataToSubmit);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this record? This action cannot be undone.')) {
            try {
                await api.delete(`/api/master-data/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Deletion failed');
            }
        }
    };

    const filteredItems = allData.filter(item =>
        item.type === activeSection &&
        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.shortName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getParentType = (currentType) => {
        switch (currentType) {
            case 'PROGRAMME': return 'DEPARTMENT';
            case 'BLOCK': return 'DEPARTMENT';
            case 'ROOM': return 'BLOCK';
            default: return null;
        }
    };

    const seedDefaultData = async () => {
        if (!window.confirm('Seed extended master data (Roles, Departments, etc.)?')) return;

        const items = [
            { type: 'ROLE', name: 'Superadmin' },
            { type: 'ROLE', name: 'Networking Staff' },
            { type: 'ROLE', name: 'Plumber' },
            { type: 'ROLE', name: 'Electrician' },
            { type: 'ROLE', name: 'Software Developer' },
            { type: 'DEPARTMENT', name: 'Computer Science', shortName: 'CSE' },
            { type: 'PROGRAMME', name: 'B.Tech CSE', shortName: 'BTECH' },
            { type: 'PROGRAMME', name: 'MCA', shortName: 'MCA' },
            { type: 'DEPARTMENT', name: 'Mechanical Engineering', shortName: 'ME' }
        ];

        try {
            setLoading(true);
            for (const item of items) {
                await api.post('/api/master-data', item);
            }
            alert('Extended data seeded!');
            fetchData();
        } catch (err) {
            alert('Seeding partially failed');
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {activeSection && (
                        <button
                            onClick={() => setActiveSection(null)}
                            style={{ background: 'white', border: '1px solid #e2e8f0', padding: 8, borderRadius: 10, cursor: 'pointer', color: '#64748b' }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>
                            {activeSection ? sections.find(s => s.id === activeSection).title : t('master_data')}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 14 }}>{t('master_data_subtitle')}</p>
                    </div>
                </div>
                {!activeSection && (
                    <button onClick={seedDefaultData} className="btn" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                        {t('quick_setup') || 'Quick Setup'}
                    </button>
                )}
            </div>

            {!activeSection ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {sections.map(s => (
                        <div
                            key={s.id}
                            className="white-card"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderLeft: `6px solid ${s.color}`,
                                padding: '24px 28px'
                            }}
                            onClick={() => setActiveSection(s.id)}
                        >
                            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                <div style={{ padding: 12, background: s.bg, color: s.color, borderRadius: 12 }}>
                                    {React.cloneElement(s.icon, { size: 28 })}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{s.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{getCount(s.id)} {t('records')}</p>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(s.id); }} style={{ background: 'white', padding: 8, borderRadius: 10, border: '1px solid #f1f5f9', cursor: 'pointer', color: s.color }}>
                                <Plus size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder={`${t('search_placeholder')}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '12px 18px', paddingLeft: 44, borderRadius: 14, border: '1px solid #e2e8f0', width: 340, outline: 'none' }}
                            />
                            <Search size={20} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                        </div>
                        <button onClick={() => handleOpenModal(activeSection)} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Plus size={20} /> {t('add_new')}
                        </button>
                    </div>

                    <div className="white-card" style={{ padding: 0, borderRadius: 20, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{t('details')}</th>
                                    {getParentType(activeSection) && <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{t('linked_to')}</th>}
                                    <th style={{ padding: '20px 24px', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                                            {item.shortName && <div style={{ fontSize: 12, color: '#94a3b8' }}>{t('alias')}: {item.shortName}</div>}
                                        </td>
                                        {getParentType(activeSection) && (
                                            <td style={{ padding: '20px 24px', color: '#64748b', fontSize: 14 }}>
                                                {item.parentId?.name || <span style={{ opacity: 0.5 }}>{t('unlinked')}</span>}
                                            </td>
                                        )}
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal(activeSection, item)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                                                    <Edit size={18} color="#3b82f6" />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} style={{ padding: 8, background: '#fef2f2', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                                                    <Trash2 size={18} color="#ef4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>{t('no_tickets_found')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 500 }}>
                        <div style={{ padding: '36px 40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 800 }}>{editingItem ? t('edit_item') : t('add_item')} {formData.type ? (formData.type.charAt(0) + formData.type.slice(1).toLowerCase()) : ''}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={28} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {getParentType(formData.type) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Linked {getParentType(formData.type).charAt(0) + getParentType(formData.type).slice(1).toLowerCase()}</label>
                                        <select
                                            value={formData.parentId}
                                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                            style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none' }}
                                            required
                                        >
                                            <option value="">{t('select_parent')}</option>
                                            {allData.filter(d => d.type === getParentType(formData.type)).map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                                        {formData.type === 'ROOM' ? t('room_number_lbl') : formData.type === 'BLOCK' ? t('block_name_lbl') : formData.type === 'PROGRAMME' ? t('programme_name_lbl') : t('field_name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none' }}
                                        placeholder={t('dept_placeholder')}
                                        required
                                    />
                                </div>
                                {(formData.type === 'DEPARTMENT' || formData.type === 'PROGRAMME') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{t('field_short_name')}</label>
                                        <input type="text" value={formData.shortName} onChange={(e) => setFormData({ ...formData, shortName: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none' }} />
                                    </div>
                                )}
                                {formData.type !== 'ROOM' && formData.type !== 'BLOCK' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{t('optional_desc_lbl')}</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none', minHeight: 80 }} />
                                    </div>
                                )}
                                <button type="submit" className="btn btn-primary" style={{ padding: 16, marginTop: 10, fontWeight: 700 }}>
                                    {editingItem ? t('save_updates') : t('confirm_registration')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterData;
