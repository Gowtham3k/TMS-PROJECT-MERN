import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Database, ListChecks, Users, FileText, Settings, LogOut, Plus, Shield, Power } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useApp();
    const user = JSON.parse(localStorage.getItem('user')) || { role: 'USER' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ transition: 'all 0.3s ease' }}>
            <div className="logo" style={{ marginBottom: 50, display: 'flex', alignItems: 'center', width: '100%' }}>
                <NavLink to="/home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '1px' }}>TMS</span>
                </NavLink>
            </div>

            <nav onClick={() => setIsOpen && setIsOpen(false)} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Home size={22} /> {t('home')}
                </NavLink>

                {user.role !== 'ADMIN' && (
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutGrid size={22} /> {t('dashboard')}
                    </NavLink>
                )}

                {user.role === 'SUPER_ADMIN' && (
                    <NavLink to="/master_data" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Database size={22} /> {t('master_data')}
                    </NavLink>
                )}

                {user.role === 'SUPER_ADMIN' && (
                    <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Shield size={22} /> {t('audit_logs')}
                    </NavLink>
                )}

                {user.role === 'SUPER_ADMIN' && (
                    <NavLink to="/system-control" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Power size={22} /> {t('system_control')}
                    </NavLink>
                )}

                <NavLink to="/complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ListChecks size={22} /> {t('complaints')}
                </NavLink>

                {user.role !== 'STAFF' && (
                    <NavLink to="/raise" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Plus size={22} /> {t('raise_complaint')}
                    </NavLink>
                )}

                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={22} /> {t('user_management')}
                    </NavLink>
                )}

                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'USER') && (
                    <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={22} /> {t('reports')}
                    </NavLink>
                )}

                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={22} /> {t('settings')}
                </NavLink>
            </nav>

            <div
                className="nav-item"
                onClick={handleLogout}
                style={{
                    marginTop: 'auto',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 20,
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)'
                }}
            >
                <LogOut size={22} /> {t('logout')}
            </div>
        </div>
    );
};

export default Sidebar;
