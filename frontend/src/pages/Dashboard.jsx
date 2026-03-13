import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserDashboard from '../components/dashboards/UserDashboard';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';
import StaffDashboard from '../components/dashboards/StaffDashboard';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/complaints/stats', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    if (!user) return <div style={{ padding: 40, textAlign: 'center' }}>Loading user data...</div>;

    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isUser = user.role === 'USER';
    const isSpecializedStaff = user.role !== 'ADMIN' && !isSuperAdmin && !isUser;

    if (isUser) return <UserDashboard stats={stats} user={user} />;
    if (isSpecializedStaff) return <StaffDashboard stats={stats} user={user} />;

    if (isSuperAdmin) return <SuperAdminDashboard stats={stats} user={user} />;

    return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <h2>Access Restrained</h2>
            <p>Please contact admin if you believe this is an error.</p>
        </div>
    );
};

export default Dashboard;
