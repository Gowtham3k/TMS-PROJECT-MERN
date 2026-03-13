import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bell, Check, Info, AlertTriangle, X } from 'lucide-react';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [show, setShow] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user.id || user._id;
            const unread = res.data.filter(n => !n.isReadBy.includes(userId)).length;
            setNotifications(res.data);
            setUnreadCount(unread);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/read/${id}`, {});
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShow(!show)}
                style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <div className="white-card shadow-lg" style={{ position: 'absolute', top: 50, right: 0, width: 340, maxHeight: 450, overflowY: 'auto', zIndex: 1001, padding: 0, border: '1px solid var(--border-light)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontWeight: 800 }}>Notifications</h4>
                        <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                    </div>
                    <div>
                        {notifications.length > 0 ? notifications.map(n => {
                            const user = JSON.parse(localStorage.getItem('user'));
                            const userId = user.id || user._id;
                            const isRead = n.isReadBy.includes(userId);
                            return (
                                <div
                                    key={n._id}
                                    onClick={() => markAsRead(n._id)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        background: isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                        transition: 'background 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    {!isRead && <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: 3, background: '#3b82f6' }}></div>}
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: n.type === 'BROADCAST' ? '#fff7ed' : '#eff6ff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {n.type === 'BROADCAST' ? <AlertTriangle size={18} color="#f59e0b" /> : <Info size={18} color="#3b82f6" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{n.title}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: 10, color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                                No notifications yet
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
