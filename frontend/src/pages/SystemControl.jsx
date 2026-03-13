import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Power, ShieldAlert, CheckCircle2, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SystemControl = () => {
    const { t } = useApp();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/settings');
            if (res.data.isSystemUnderMaintenance !== undefined) {
                setMaintenanceMode(res.data.isSystemUnderMaintenance);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setLoading(false);
        }
    };

    const handleToggle = () => {
        setMaintenanceMode(!maintenanceMode);
    };

    const saveSettings = async () => {
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/settings/isSystemUnderMaintenance`,
                { value: maintenanceMode },
                { headers: { 'x-auth-token': token } }
            );
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error updating settings:', err);
            setMessage(t('failed_to_update'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="header" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('system_control')}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
                    {t('admin_subtitle')}
                </p>
            </div>

            <div className="glass-card" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <div style={{
                        background: maintenanceMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        padding: '15px',
                        borderRadius: '16px'
                    }}>
                        <Power size={32} color={maintenanceMode ? '#ef4444' : '#22c55e'} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t('system_status')}</h2>
                        <p style={{ color: maintenanceMode ? '#ef4444' : '#22c55e', fontWeight: '600' }}>
                            {maintenanceMode ? t('system_off') : t('system_on')}
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <div style={{ maxWidth: '70%' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{t('maintenance_mode')}</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                                {t('maintenance_desc')}
                            </p>
                        </div>

                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                            <input
                                type="checkbox"
                                checked={maintenanceMode}
                                onChange={handleToggle}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span className="slider round" style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: maintenanceMode ? '#ef4444' : '#374151',
                                transition: '.4s',
                                borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '26px',
                                    width: '26px',
                                    left: maintenanceMode ? '30px' : '4px',
                                    bottom: '4px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>

                {maintenanceMode && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '30px',
                        animation: 'pulse 2s infinite'
                    }}>
                        <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
                        <p style={{ color: '#fca5a5', fontSize: '14px' }}>
                            {t('maintenance_active_msg')}
                        </p>
                    </div>
                )}

                <button
                    onClick={saveSettings}
                    disabled={saving}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {t('save_status')}
                </button>

                {message && (
                    <div style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        color: (message.toLowerCase().includes('failed') || message.toLowerCase().includes('பிழை')) ? '#ef4444' : '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: '500'
                    }}>
                        {(message.toLowerCase().includes('failed') || message.toLowerCase().includes('பிழை')) ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                        {message}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
};

export default SystemControl;
