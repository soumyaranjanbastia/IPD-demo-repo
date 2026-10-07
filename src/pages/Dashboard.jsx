import React from 'react';
import { Users, Activity, Bed, CheckCircle, Clock } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ role }) {
  const { patients, opdQueue, beds, discharges } = useGlobal();
  const navigate = useNavigate();

  // Permission checks based on RBAC matrix from requirements
  const canViewPatients = ['SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'].includes(role);
  const canViewBilling = ['SUPER_ADMIN', 'BILLING_EXECUTIVE'].includes(role);
  const canManageAdmissions = ['SUPER_ADMIN', 'DOCTOR', 'IPD_COORDINATOR'].includes(role);

  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const activeConsultations = opdQueue.filter(q => q.status === 'IN_PROGRESS' || q.status === 'WAITING').length;
  const pendingDischarges = discharges.length;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Overview of hospital operations. Current Access: <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{role.replace('_', ' ')}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary"><Clock size={16} /> Filter by Date</button>
          <button className="btn btn-primary"><Activity size={16} /> Generate Report</button>
        </div>
      </div>

      <div className="dashboard-stats">
        {canViewPatients && (
          <div className="card stat-card" onClick={() => navigate('/patients')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon blue"><Users size={28} /></div>
            <div className="stat-info">
              <h4>Total Patients (Today)</h4>
              <p>{patients.length}</p>
            </div>
          </div>
        )}
        
        <div className="card stat-card" onClick={() => navigate('/consultations')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon orange"><Activity size={28} /></div>
          <div className="stat-info">
            <h4>Active Consultations</h4>
            <p>{activeConsultations}</p>
          </div>
        </div>
        
        {canManageAdmissions && (
          <div className="card stat-card" onClick={() => navigate('/ipd')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon green"><Bed size={28} /></div>
            <div className="stat-info">
              <h4>Available Beds (IPD)</h4>
              <p>{availableBeds} / {beds.length}</p>
            </div>
          </div>
        )}
        
        {canViewBilling && (
          <div className="card stat-card" onClick={() => navigate('/discharge')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon red"><CheckCircle size={28} /></div>
            <div className="stat-info">
              <h4>Pending Discharges</h4>
              <p>{pendingDischarges}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Recent OPD Queue</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>UHID</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {opdQueue.slice(0, 5).map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 500 }}>{q.uhid}</td>
                    <td>{q.department}</td>
                    <td>{q.doctor}</td>
                    <td>
                      <span className={`badge ${q.status === 'WAITING' ? 'warning' : q.status === 'IN_PROGRESS' ? 'primary' : 'success'}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {opdQueue.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '12px' }}>No active queue.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['SUPER_ADMIN', 'RECEPTIONIST'].includes(role) && (
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/registration')}>
                Register New Patient
              </button>
            )}
            {['SUPER_ADMIN', 'DOCTOR'].includes(role) && (
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/consultations')}>
                Start Next Consultation
              </button>
            )}
            {['SUPER_ADMIN', 'NURSE', 'DOCTOR'].includes(role) && (
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/ipd')}>
                Ward Management
              </button>
            )}
            {['SUPER_ADMIN', 'BILLING_EXECUTIVE'].includes(role) && (
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/billing')}>
                Process Final Bill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
