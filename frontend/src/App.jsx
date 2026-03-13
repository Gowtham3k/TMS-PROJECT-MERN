import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintsList from './pages/ComplaintsList';
import UsersList from './pages/UsersList';
import MasterData from './pages/MasterData';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import SupportCenter from './pages/SupportCenter';
import SystemControl from './pages/SystemControl';

const PrivateRoute = ({ children, roles }) => {
  const userString = localStorage.getItem('user');
  let user = null;
  try {
    user = JSON.parse(userString);
  } catch (e) {
    user = null;
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="raise" element={<RaiseComplaint />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="users" element={<PrivateRoute roles={['ADMIN', 'SUPER_ADMIN']}><UsersList /></PrivateRoute>} />
          <Route path="master_data" element={<PrivateRoute roles={['SUPER_ADMIN']}><MasterData /></PrivateRoute>} />
          <Route path="audit-logs" element={<PrivateRoute roles={['SUPER_ADMIN']}><AuditLogs /></PrivateRoute>} />
          <Route path="system-control" element={<PrivateRoute roles={['SUPER_ADMIN']}><SystemControl /></PrivateRoute>} />
          <Route path="reports" element={<PrivateRoute roles={['USER', 'ADMIN', 'SUPER_ADMIN']}><Reports /></PrivateRoute>} />
          <Route path="faq" element={<SupportCenter />} />
          <Route path="support" element={<SupportCenter />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
