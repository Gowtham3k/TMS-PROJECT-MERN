import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Bell, Globe, Moon, Sun, Save, ArrowLeft, Camera, Trash2, Upload, Shield, Lock, Megaphone, Send, Search, UserPlus, Edit, Mail, Phone, Building2, Layers, Key, X, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    // User Context 
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userRole = storedUser.role || 'USER';
    const userId = storedUser._id || storedUser.id || 'guest';
    const userName = storedUser.name || 'User';
    const userEmail = storedUser.email || 'support@tms.com';

    const [activeTab, setActiveTab] = useState(
        (location.state?.tab === 'security' && userRole === 'STAFF') ? 'profile' : (location.state?.tab || 'profile')
    );

    // Sync activeTab when navigating via sidebar state
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state?.tab]);
    const hideTabs = location.state?.hideTabs;
    const { theme, toggleTheme, language, setLanguage, t } = useApp();

    const [notifPreferences, setNotifPreferences] = useState({
        email: true,
        push: true
    });

    // Password States
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false, temp: false });

    // Broadcast States
    const [broadcast, setBroadcast] = useState({ title: '', message: '' });

    // Photo Logic
    const defaultAvatar = `https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff&size=128`;
    const [avatar, setAvatar] = useState(localStorage.getItem(`profilePhoto_${userId}`) || defaultAvatar);

    // Profile Info States
    const [bio, setBio] = useState(localStorage.getItem(`userBio_${userId}`) || '');
    const [name, setName] = useState(localStorage.getItem(`userName_${userId}`) || userName);
    const [email, setEmail] = useState(localStorage.getItem(`userEmail_${userId}`) || userEmail);

    // Global User Management States (Super Admin Only)
    const [users, setUsers] = useState([]);
    const [masterData, setMasterData] = useState({ departments: [], programmes: [] });
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '', email: '', password: '', role: 'USER',
        department: '', phoneNumber: '', programme: ''
    });

    const rolesList = ['USER', 'STAFF', 'ADMIN', 'SUPER_ADMIN', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer', 'Civil Staff', 'Electrical Staff'];

    const tabs = [
        { id: 'profile', label: t('profile_settings'), icon: User },
        { id: 'security', label: t('security'), icon: Shield },
        { id: 'user_mgmt', label: t('global_directory'), icon: Layers, roles: ['SUPER_ADMIN'] },
        { id: 'broadcast', label: t('broadcast'), icon: Megaphone, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'display', label: t('display_language'), icon: Globe },
    ].filter(tab => {
        if (userRole === 'STAFF' && tab.id === 'security') return false;
        if (tab.roles && !tab.roles.includes(userRole)) return false;
        return true;
    });

    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setAvatar(base64String);
                localStorage.setItem(`profilePhoto_${userId}`, base64String);
                alert('Photo updated successfully!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoRemove = () => {
        if (window.confirm('Are you sure you want to remove your profile photo?')) {
            setAvatar(defaultAvatar);
            localStorage.removeItem(`profilePhoto_${userId}`);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const updateData = {
                bio,
                avatar
            };
            if (isSuperAdmin) {
                updateData.name = name;
                updateData.email = email;
            }
            
            const res = await api.put('/api/auth/profile', updateData);
            
            // Update local storage with new user data
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            alert('Changes saved successfully!');
        } catch (err) {
            console.error('Error saving changes:', err);
            alert(err.response?.data?.msg || 'Error saving changes');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('New passwords do not match');
            return;
        }
        try {
            await api.put('/api/auth/change-password', {
                oldPassword: passwords.current,
                newPassword: passwords.new
            });
            alert('Password updated successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            alert(err.response?.data?.msg || 'Error updating password');
        }
    };

    const fetchAllUsers = async () => {
        try {
            const [usersRes, masterRes] = await Promise.all([
                api.get('/api/auth/users'),
                api.get('/api/master-data')
            ]);
            setUsers(usersRes.data);
            setFilteredUsers(usersRes.data);
            setMasterData({
                departments: masterRes.data.filter(d => d.type === 'DEPARTMENT'),
                programmes: masterRes.data.filter(d => d.type === 'PROGRAMME')
            });
        } catch (err) {
            console.error('Error fetching global users:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'user_mgmt' && isSuperAdmin) {
            fetchAllUsers();
        }
        if (activeTab === 'notifications') {
            fetchProfile();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setNotifPreferences({
                email: res.data.emailNotifications,
                push: res.data.pushNotifications
            });
            setName(res.data.name);
            setEmail(res.data.email);
            setBio(res.data.bio || '');
            setAvatar(res.data.avatar || defaultAvatar);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const updateNotifSetting = async (key, val) => {
        const newPrefs = { ...notifPreferences, [key]: val };
        setNotifPreferences(newPrefs);
        try {
            await api.put('/api/auth/profile', {
                emailNotifications: newPrefs.email,
                pushNotifications: newPrefs.push
            });
        } catch (err) {
            console.error('Error updating notification setting:', err);
        }
    };

    useEffect(() => {
        const q = searchQuery.toLowerCase();
        if (users.length > 0) {
            setFilteredUsers(users.filter(u =>
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.role || '').toLowerCase().includes(q) ||
                (u.department || '').toLowerCase().includes(q)
            ));
        }
    }, [searchQuery, users]);

    const handleOpenUserModal = (userToEdit = null) => {
        if (userToEdit) {
            setEditingUser(userToEdit);
            setUserFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                password: '',
                role: userToEdit.role,
                department: userToEdit.department || '',
                phoneNumber: userToEdit.phoneNumber || '',
                programme: userToEdit.programme || ''
            });
        } else {
            setEditingUser(null);
            setUserFormData({
                name: '', email: '', password: '', role: 'USER',
                department: '', phoneNumber: '', programme: ''
            });
        }
        setShowUserModal(true);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/api/auth/users/${editingUser._id}`, userFormData);
                alert('Account updated successfully!');
            } else {
                await api.post('/api/auth/register', userFormData);
                alert('New system user registered!');
            }
            setShowUserModal(false);
            fetchAllUsers();
        } catch (err) {
            alert(err.response?.data?.msg || 'Action failed');
        }
    };

    const handleUserDelete = async (id) => {
        if (window.confirm('DANGER: Permanently delete this account? This cannot be undone.')) {
            try {
                await api.delete(`/api/auth/users/${id}`);
                alert('Account purged.');
                fetchAllUsers();
            } catch (err) {
                alert('Deletion failed');
            }
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/notifications/broadcast', broadcast);
            alert('Broadcast sent to all users!');
            setBroadcast({ title: '', message: '' });
        } catch (err) {
            alert('Error sending broadcast');
        }
    };

    const triggerUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {!hideTabs && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('settings')}</h1>
                </div>
            )}

            {hideTabs && activeTab !== 'user_mgmt' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'var(--card-bg-solid)', border: '1px solid var(--border-light)', padding: 8, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('profile')}</h1>
                </div>
            )}

            <div style={{
                display: hideTabs ? 'block' : 'grid',
                gridTemplateColumns: hideTabs ? '1fr' : '280px 1fr',
                gap: 32,
                maxWidth: (hideTabs && activeTab !== 'user_mgmt') ? 800 : 'none',
                margin: (hideTabs && activeTab !== 'user_mgmt') ? '0 auto' : '0'
            }}>
                {/* Settings Sidebar */}
                {!hideTabs && (
                    <div className="white-card" style={{ padding: '12px', height: 'fit-content' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '12px 16px',
                                            borderRadius: 10,
                                            border: 'none',
                                            background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                                            color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                                            fontWeight: activeTab === tab.id ? 600 : 400,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Icon size={20} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Settings Content */}
                <div className="white-card">
                    {activeTab === 'profile' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: 24 }}>{t('profile_info')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                                    <div style={{ position: 'relative' }}>
                                        <img src={avatar} style={{ width: 100, height: 100, borderRadius: 50, border: '4px solid var(--border-light)', objectFit: 'cover' }} alt="Avatar" />
                                        <button
                                            onClick={triggerUpload}
                                            style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', color: 'white', border: '3px solid var(--card-bg-solid)', borderRadius: 20, padding: 6, cursor: 'pointer' }}
                                        >
                                            <Camera size={16} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button className="btn" onClick={triggerUpload} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', cursor: 'pointer' }}>
                                            <Upload size={16} /> {t('upload_photo')}
                                        </button>
                                        {avatar !== defaultAvatar && (
                                            <button className="btn" onClick={handlePhotoRemove} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer' }}>
                                                <Trash2 size={16} /> {t('remove_photo')}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 10 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 13, fontWeight: 500 }}>{t('full_name')}</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={!isSuperAdmin}
                                            style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 13, fontWeight: 500 }}>{t('email_address')}</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={!isSuperAdmin}
                                            style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontSize: 13, fontWeight: 500 }}>{t('bio')}</label>
                                        {bio && (
                                            <button
                                                onClick={() => setBio('')}
                                                style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                <Trash2 size={12} /> {t('remove_bio')}
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder={t('bio') + '...'}
                                        style={{ padding: '10px 16px', borderRadius: 8, minHeight: 100, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
                                <button onClick={handleSaveChanges} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Save size={18} /> {t('save_changes')}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h3>{t('password_and_security')}</h3>
                                <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg-main)', borderRadius: 20, color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                                    ID: {userId}
                                </span>
                            </div>

                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500 }}>{t('current_password')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPass.current ? "text" : "password"}
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            style={{ width: '100%', padding: '10px 16px', paddingRight: 45, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                            placeholder={t('enter_current_password')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                            style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                        >
                                            {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500 }}>{t('new_password')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPass.new ? "text" : "password"}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            style={{ width: '100%', padding: '10px 16px', paddingRight: 45, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                            placeholder={t('new_password')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                            style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                        >
                                            {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500 }}>{t('confirm_password')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPass.confirm ? "text" : "password"}
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            style={{ width: '100%', padding: '10px 16px', paddingRight: 45, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                            placeholder={t('repeat_new_password')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                            style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                        >
                                            {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ marginTop: 20 }}>
                                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Lock size={18} /> {t('change_password')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'broadcast' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <Megaphone size={24} color="#3b82f6" />
                                <div>
                                    <h3 style={{ margin: 0 }}>{t('system_broadcast')}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{t('broadcast_desc')}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500 }}>{t('subject_title')}</label>
                                    <input
                                        type="text"
                                        value={broadcast.title}
                                        onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                                        style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                        placeholder="E.g., Server Maintenance"
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500 }}>{t('message_content')}</label>
                                    <textarea
                                        value={broadcast.message}
                                        onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                                        style={{ padding: '10px 16px', borderRadius: 8, minHeight: 120, background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                                        placeholder={t('message_placeholder')}
                                        required
                                    />
                                </div>
                                <div style={{ marginTop: 20 }}>
                                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Send size={18} /> {t('send_to_all_users')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: 24 }}>{t('notifications')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: 12 }}>
                                    <div>
                                        <h4 style={{ fontSize: 15 }}>{t('email_notif')}</h4>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('notif_desc')}</p>
                                    </div>
                                    <div
                                        onClick={() => updateNotifSetting('email', !notifPreferences.email)}
                                        style={{
                                            width: 44, height: 24,
                                            background: notifPreferences.email ? '#3b82f6' : '#cbd5e1',
                                            borderRadius: 12, position: 'relative', cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            left: notifPreferences.email ? 22 : 2,
                                            top: 2, width: 20, height: 20,
                                            background: 'white', borderRadius: '50%',
                                            transition: 'all 0.3s'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'display' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: 24 }}>{t('display_language')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                {/* Dark Mode Toggle */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                        {theme === 'dark' ? <Moon size={24} color="#3b82f6" /> : <Sun size={24} color="#f59e0b" />}
                                        <div>
                                            <h4 style={{ fontSize: 15, fontWeight: 600 }}>{t('theme_mode')}</h4>
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('theme_desc')}</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={toggleTheme}
                                        style={{
                                            width: 50, height: 26, background: theme === 'dark' ? '#3b82f6' : '#cbd5e1',
                                            borderRadius: 15, position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', left: theme === 'dark' ? 26 : 2, top: 2,
                                            width: 22, height: 22, background: 'white', borderRadius: '50%', transition: 'all 0.3s'
                                        }}></div>
                                    </div>
                                </div>

                                {/* Language Selector */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                        <Globe size={24} color="#3b82f6" />
                                        <div>
                                            <h4 style={{ fontSize: 15, fontWeight: 600 }}>{t('app_language')}</h4>
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('lang_desc')}</p>
                                        </div>
                                    </div>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        style={{ padding: '8px 12px', borderRadius: 8, outline: 'none', minWidth: 120, background: 'var(--card-bg-solid)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="en">English</option>
                                        <option value="ta">Tamil (தமிழ்)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'user_mgmt' && isSuperAdmin && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 20 }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{t('system_user_mgmt')}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{t('user_mgmt_desc')}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder={t('search_directory')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ padding: '10px 16px', paddingLeft: 40, borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)', width: 220, fontSize: 13 }}
                                        />
                                        <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-secondary)' }} />
                                    </div>
                                    <button onClick={() => handleOpenUserModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13 }}>
                                        <UserPlus size={16} /> {t('add_member')}
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-main)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'rgba(59, 130, 246, 0.05)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                                        <tr>
                                            <th style={{ padding: '16px 20px' }}>{t('identity')}</th>
                                            <th style={{ padding: '16px 20px' }}>{t('auth_role')}</th>
                                            <th style={{ padding: '16px 20px' }}>{t('department')}</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'right' }}>{t('options')}</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: 13 }}>
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} style={{ borderTop: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <Mail size={10} /> {u.email}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{
                                                        padding: '3px 10px',
                                                        borderRadius: 20,
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        background: u.role === 'SUPER_ADMIN' ? '#fef2f2' : u.role === 'ADMIN' ? '#eff6ff' : u.role === 'STAFF' ? '#f0fdf4' : 'var(--card-bg-solid)',
                                                        color: u.role === 'SUPER_ADMIN' ? '#991b1b' : u.role === 'ADMIN' ? '#1d4ed8' : u.role === 'STAFF' ? '#15803d' : 'var(--text-secondary)',
                                                        border: `1px solid ${u.role === 'SUPER_ADMIN' ? '#fee2e2' : u.role === 'ADMIN' ? '#dbeafe' : u.role === 'STAFF' ? '#dcfce7' : 'var(--border-light)'}`
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                                                    {u.department || '—'}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                        <button onClick={() => handleOpenUserModal(u)} style={{ padding: 6, background: '#eff6ff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                                            <Edit size={14} color="#3b82f6" />
                                                        </button>
                                                        {u.role !== 'SUPER_ADMIN' && (
                                                            <button onClick={() => handleUserDelete(u._id)} style={{ padding: 6, background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                                                <Trash2 size={14} color="#ef4444" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {showUserModal && (
                                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                                    <div className="modal-content" style={{ maxWidth: 550 }}>
                                        <div style={{ padding: '30px 34px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{editingUser ? t('edit_profile') : t('new_system_member')}</h2>
                                                <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
                                            </div>
                                            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                                <div style={{ display: 'flex', gap: 16 }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <label style={{ fontSize: 13, fontWeight: 700 }}>{t('identity_name')}</label>
                                                        <input type="text" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} required />
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <label style={{ fontSize: 13, fontWeight: 700 }}>{t('phone_optional')}</label>
                                                        <input type="text" value={userFormData.phoneNumber} onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })} style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    <label style={{ fontSize: 13, fontWeight: 700 }}>{t('email_access')}</label>
                                                    <input type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} required />
                                                </div>
                                                <div style={{ display: 'flex', gap: 16 }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <label style={{ fontSize: 13, fontWeight: 700 }}>{t('security_role')}</label>
                                                        <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                                                            {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                                                        </select>
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <label style={{ fontSize: 13, fontWeight: 700 }}>{t('assigned_dept')}</label>
                                                        <select value={userFormData.department} onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })} style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                                                            <option value="">None / General</option>
                                                            {masterData.departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                {!editingUser && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <label style={{ fontSize: 13, fontWeight: 700 }}>{t('temp_password')}</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type={showPass.temp ? "text" : "password"}
                                                                value={userFormData.password}
                                                                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                                                style={{ width: '100%', padding: '11px 14px', paddingLeft: 40, paddingRight: 45, borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                                                                required
                                                            />
                                                            <Key size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-secondary)' }} />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPass({ ...showPass, temp: !showPass.temp })}
                                                                style={{ position: 'absolute', right: 12, top: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                                            >
                                                                {showPass.temp ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <button type="submit" className="btn btn-primary" style={{ padding: 14, marginTop: 10, fontWeight: 700 }}>
                                                    {editingUser ? t('update_directory') : t('finalize_reg')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
