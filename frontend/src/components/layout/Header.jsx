import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User as UserIcon, LogOut, Camera, Trash2, X, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationCenter from '../NotificationCenter';

const Header = ({ stats, user, onSearch, title, subtitle }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { t, notificationsEnabled } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const userObj = user || JSON.parse(localStorage.getItem('user')) || {};
    const userId = userObj._id || userObj.id || 'guest';
    const userName = userObj.name || 'User';

    const defaultAvatar = `https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff&size=128`;
    const [avatar, setAvatar] = useState(localStorage.getItem(`profilePhoto_${userId}`) || defaultAvatar);
    const [bio, setBio] = useState(localStorage.getItem(`userBio_${userId}`) || '');

    // Sync state if localStorage changes (e.g. after returning from Settings)
    useEffect(() => {
        const currentUserId = user?._id || user?.id || JSON.parse(localStorage.getItem('user'))?._id || 'guest';
        setAvatar(localStorage.getItem(`profilePhoto_${currentUserId}`) || defaultAvatar);
        setBio(localStorage.getItem(`userBio_${currentUserId}`) || '');
    }, [showProfileMenu, userId, user]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setAvatar(base64String);
                localStorage.setItem(`profilePhoto_${userId}`, base64String);
                setShowProfileMenu(false);
                window.location.reload(); // Refresh to sync photo everywhere
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoRemove = () => {
        if (window.confirm('Are you sure you want to remove your profile photo?')) {
            setAvatar(defaultAvatar);
            localStorage.removeItem(`profilePhoto_${userId}`);
            setShowProfileMenu(false);
            window.location.reload();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, position: 'relative' }}>
            <div style={{ flex: 1 }}>
                {title && <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h1>}
                {subtitle && <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: 500 }}>{subtitle}</p>}
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={handleSearch}
                        style={{
                            padding: '10px 16px', paddingLeft: 40, borderRadius: 12, border: '1px solid var(--border-light)',
                            width: 250, background: 'var(--card-bg-solid)', outline: 'none', color: 'var(--text-primary)'
                        }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>

                <NotificationCenter />

                <div style={{ position: 'relative' }}>
                    <img
                        src={avatar}
                        style={{ width: 44, height: 44, borderRadius: 22, border: '2px solid white', cursor: 'pointer', objectFit: 'cover' }}
                        alt="User" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                    />
                    {showProfileMenu && (
                        <div className="white-card shadow-lg" style={{ position: 'absolute', right: 0, top: 50, width: 220, zIndex: 1000, padding: '8px', border: '1px solid var(--border-light)' }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
                                <p style={{ fontWeight: 600, fontSize: 14 }}>{userName}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{userObj.email || 'support@tms.com'}</p>
                                {bio && (
                                    <p style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, fontStyle: 'italic', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        "{bio}"
                                    </p>
                                )}
                            </div>

                            <button onClick={() => navigate('/settings', { state: { hideTabs: true } })} className="menu-item-btn">
                                <UserIcon size={16} /> {t('profile')}
                            </button>

                            <button onClick={() => fileInputRef.current.click()} className="menu-item-btn">
                                <Camera size={16} /> {t('upload_photo')}
                            </button>

                            {avatar !== defaultAvatar && (
                                <button onClick={handlePhotoRemove} className="menu-item-btn" style={{ color: '#ef4444' }}>
                                    <Trash2 size={16} /> {t('remove_photo')}
                                </button>
                            )}

                            <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 8, paddingTop: 8 }}>
                                <button onClick={handleLogout} className="menu-item-btn" style={{ color: '#ef4444' }}>
                                    <LogOut size={16} /> {t('logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />

            <style>{`
                .menu-item-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    font-size: 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-align: left;
                }
                .menu-item-btn:hover {
                    background: var(--bg-main);
                }
                .shadow-lg {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
            `}</style>
        </header>
    );
};

export default Header;
