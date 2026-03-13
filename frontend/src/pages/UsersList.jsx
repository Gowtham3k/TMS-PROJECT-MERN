import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, UserPlus, Edit, Trash2, X, AlertCircle, Phone, Mail, Building2, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

const UsersList = () => {
    const { t } = useApp();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'USER',
        department: '', phoneNumber: '', programme: ''
    });

    const roles = [
        'USER', 'STAFF', 'ADMIN', 'SUPER_ADMIN',
        'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'
    ];

    const fetchData = async () => {
        try {
            const [usersRes, masterRes] = await Promise.all([
                api.get('/api/auth/users'),
                api.get('/api/master-data')
            ]);

            setUsers(usersRes.data);
            setFilteredUsers(usersRes.data);
            setDepartments(masterRes.data.filter(d => d.type === 'DEPARTMENT'));
            setProgrammes(masterRes.data.filter(d => d.type === 'PROGRAMME'));
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const q = searchQuery.toLowerCase();
        setFilteredUsers(users.filter(u =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.department || '').toLowerCase().includes(q) ||
            (u.role || '').toLowerCase().includes(q)
        ));
    }, [searchQuery, users]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                department: user.department || '',
                phoneNumber: user.phoneNumber || '',
                programme: user.programme || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '', email: '', password: '', role: 'USER',
                department: '', phoneNumber: '', programme: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/api/auth/users/${editingUser._id}`, formData);
                alert('User profile updated!');
            } else {
                await api.post('/api/auth/register', formData);
                alert('New user registered!');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently remove this user account?')) {
            try {
                await api.delete(`/api/auth/users/${id}`);
                alert('Account deleted.');
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Deletion failed');
            }
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{t('user_management')}</h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>{t('manage_users_desc')}</p>
                </div>
                <div style={{ display: 'flex', gap: 15 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '10px 16px', paddingLeft: 40, borderRadius: 12, border: '1px solid #e2e8f0', width: 280, background: 'white' }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                    </div>
                    <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12 }}>
                        <UserPlus size={18} /> {t('add_member')}
                    </button>
                </div>
            </header>

            <div className="white-card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>User Identity</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Position</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Contact</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Affiliation</th>
                            <th style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '18px 24px' }}>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.name}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Mail size={12} /> {u.email}
                                    </div>
                                </td>
                                <td style={{ padding: '18px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        background: u.role === 'SUPER_ADMIN' ? '#fef2f2' : u.role === 'ADMIN' ? '#eff6ff' : u.role === 'STAFF' ? '#f0fdf4' : '#f8fafc',
                                        color: u.role === 'SUPER_ADMIN' ? '#991b1b' : u.role === 'ADMIN' ? '#1d4ed8' : u.role === 'STAFF' ? '#15803d' : '#64748b',
                                        border: `1px solid ${u.role === 'SUPER_ADMIN' ? '#fee2e2' : u.role === 'ADMIN' ? '#dbeafe' : u.role === 'STAFF' ? '#dcfce7' : '#e2e8f0'}`
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '18px 24px', fontSize: 13, color: '#475569' }}>
                                    {u.phoneNumber ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Phone size={14} color="#94a3b8" /> {u.phoneNumber}
                                        </div>
                                    ) : 'No phone linked'}
                                </td>
                                <td style={{ padding: '18px 24px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{u.department || 'General'}</div>
                                    {u.programme && <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.programme}</div>}
                                </td>
                                <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleOpenModal(u)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                                            <Edit size={16} color="#3b82f6" />
                                        </button>
                                        {u.role !== 'SUPER_ADMIN' && (
                                            <button onClick={() => handleDelete(u._id)} style={{ padding: 8, background: '#fef2f2', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                                                <Trash2 size={16} color="#ef4444" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 600 }}>
                        <div style={{ padding: '36px 40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 800 }}>{editingUser ? 'Update Profile' : 'Register Member'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={28} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Full Name</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }} required />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Phone Number</label>
                                        <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }} required />
                                </div>

                                <div style={{ display: 'flex', gap: 20 }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Access Role</label>
                                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }}>
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Primary Department</label>
                                        <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }}>
                                            <option value="">Select Dept...</option>
                                            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Active Programme</label>
                                    <select value={formData.programme} onChange={(e) => setFormData({ ...formData, programme: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }}>
                                        <option value="">Select Programme...</option>
                                        {programmes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                                        {editingUser ? 'Update Password (leave blank to keep current)' : 'Account Password'}
                                    </label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0' }} required={!editingUser} />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ padding: 16, marginTop: 10, fontSize: 16, fontWeight: 800 }}>
                                    {editingUser ? 'Save Updates' : 'Confirm Registration'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersList;
