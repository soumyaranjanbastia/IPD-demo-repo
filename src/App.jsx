import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Users, FileText, Calendar, Settings as SettingsIcon, Bell, Search, Menu, UserPlus, LogOut, Shield, Bed, Pill, TestTube, CreditCard, LogOut as DischargeIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import Consultations from './pages/Consultations';
import IPD from './pages/IPD';
import Pharmacy from './pages/Pharmacy';
import Lab from './pages/Lab';
import Billing from './pages/Billing';
import Discharge from './pages/Discharge';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Emergency from './pages/Emergency';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { ROLES, hasPermission } from './rbac';
import { ProtectedRoute } from './components/ProtectedRoute';

function Sidebar({ role }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Activity size={28} />
        <span>HMS Pro</span>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Core Modules
        </p>
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <Activity size={20} />
          <span>Dashboard</span>
        </Link>
        {hasPermission(role, 'patients', 'read') && (
          <Link to="/patients" className={`nav-item ${isActive('/patients')}`}>
            <Users size={20} />
            <span>Patient Mgmt</span>
          </Link>
        )}
        {hasPermission(role, 'opd', 'create') && (
          <Link to="/registration" className={`nav-item ${isActive('/registration')}`}>
            <UserPlus size={20} />
            <span>Registration</span>
          </Link>
        )}
        {hasPermission(role, 'appointment', 'read') && (
          <Link to="/appointments" className={`nav-item ${isActive('/appointments')}`}>
            <Calendar size={20} />
            <span>Appointments</span>
          </Link>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Clinical & Care
        </p>
        {hasPermission(role, 'emergency', 'read') && (
          <Link to="/emergency" className={`nav-item ${isActive('/emergency')}`}>
            <AlertTriangle size={20} color="hsl(var(--danger))" />
            <span style={{ color: 'hsl(var(--danger))' }}>Emergency</span>
          </Link>
        )}
        {hasPermission(role, 'consultation', 'read') && (
          <Link to="/consultations" className={`nav-item ${isActive('/consultations')}`}>
            <FileText size={20} />
            <span>Consultations</span>
          </Link>
        )}
        {hasPermission(role, 'ipd', 'read') && (
          <Link to="/ipd" className={`nav-item ${isActive('/ipd')}`}>
            <Bed size={20} />
            <span>IPD & Wards</span>
          </Link>
        )}
        {hasPermission(role, 'pharmacy', 'read') && (
          <Link to="/pharmacy" className={`nav-item ${isActive('/pharmacy')}`}>
            <Pill size={20} />
            <span>Pharmacy</span>
          </Link>
        )}
        {hasPermission(role, 'lab', 'read') && (
          <Link to="/lab" className={`nav-item ${isActive('/lab')}`}>
            <TestTube size={20} />
            <span>Laboratory</span>
          </Link>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Financial & Exit
        </p>
        {hasPermission(role, 'billing', 'read') && (
          <Link to="/billing" className={`nav-item ${isActive('/billing')}`}>
            <CreditCard size={20} />
            <span>Billing</span>
          </Link>
        )}
        {hasPermission(role, 'discharge', 'read') && (
          <Link to="/discharge" className={`nav-item ${isActive('/discharge')}`}>
            <DischargeIcon size={20} />
            <span>Discharge</span>
          </Link>
        )}
      </div>
      
      <div style={{ marginTop: 'auto' }}>
        {(role === 'SUPER_ADMIN' || role === 'HOSPITAL_ADMIN') && (
          <Link to="/audit" className={`nav-item ${isActive('/audit')}`}>
            <Shield size={20} />
            <span>Audit Logs</span>
          </Link>
        )}
        <Link to="/notifications" className={`nav-item ${isActive('/notifications')}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </Link>
        <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}

function Header({ role, setRole }) {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search patient UHID, Name..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Inter', fontSize: '0.9rem', width: '200px' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className="role-selector" style={{ background: 'var(--bg-primary)', padding: '4px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <Shield size={16} color="var(--primary-color)" style={{ marginLeft: '8px' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ROLE:</span>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Inter', fontWeight: 500, color: 'var(--primary-color)', cursor: 'pointer', paddingRight: '8px' }}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Bell size={20} color="var(--text-primary)" />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'hsl(var(--danger))', width: '8px', height: '8px', borderRadius: '50%' }}></span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--accent-color)))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {role.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

import { GlobalProvider, useGlobal } from './context/GlobalState';

function AppContent() {
  const [role, setRole] = useState('SUPER_ADMIN');

  return (
    <Router>
      <div className="app-container">
          <Sidebar role={role} />
          <main className="main-content">
            <Header role={role} setRole={setRole} />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard role={role} />} />
                <Route path="/patients" element={
                  <ProtectedRoute role={role} module="patients" action="read">
                    <Patients role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/registration" element={
                  <ProtectedRoute role={role} module="opd" action="create">
                    <PatientRegistration role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/consultations" element={
                  <ProtectedRoute role={role} module="consultation" action="read">
                    <Consultations role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/ipd" element={
                  <ProtectedRoute role={role} module="ipd" action="read">
                    <IPD role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/pharmacy" element={
                  <ProtectedRoute role={role} module="pharmacy" action="read">
                    <Pharmacy role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/lab" element={
                  <ProtectedRoute role={role} module="lab" action="read">
                    <Lab role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute role={role} module="billing" action="read">
                    <Billing role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/discharge" element={
                  <ProtectedRoute role={role} module="discharge" action="read">
                    <Discharge role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute role={role} module="appointment" action="read">
                    <Appointments role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/emergency" element={
                  <ProtectedRoute role={role} module="emergency" action="read">
                    <Emergency role={role} />
                  </ProtectedRoute>
                } />
                <Route path="/audit" element={<AuditLogs role={role} />} />
                <Route path="/notifications" element={<Notifications role={role} />} />
                <Route path="/settings" element={<Settings role={role} />} />
                <Route path="*" element={<div className="card animate-fade-in"><h2>Module UI is still being built...</h2></div>} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
}
