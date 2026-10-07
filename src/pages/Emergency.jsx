import React, { useState } from 'react';
import { AlertTriangle, PlusCircle, Activity } from 'lucide-react';
import { useGlobal } from '../context/GlobalState';
import { hasPermission } from '../rbac';

export default function Emergency({ role }) {
  const { emergencyQueue, admitToIpd, patients } = useGlobal();
  const canRegister = hasPermission(role, 'emergency', 'create');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleRegister = (e) => {
    e.preventDefault();
    // In a real app we would call a global state action to register emergency
    alert('Emergency registration submitted.');
    setIsFormOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={24} /> Emergency & Trauma
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Triage, stabilization, and rapid admission workflow.</p>
        </div>
        {canRegister && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(!isFormOpen)} style={{ background: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}>
            <PlusCircle size={16} /> Register Emergency
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px', borderLeft: '4px solid hsl(var(--danger))' }}>
          <h3 style={{ marginBottom: '20px' }}>Emergency Triage & Registration</h3>
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Chief Complaint & Initial Assessment *</label>
                <textarea required className="input-field" rows="3" placeholder="Patient condition upon arrival..."></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Triage Level *</label>
                <select required className="input-field select-field" onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="">Select Level</option>
                  <option value="CRITICAL">CRITICAL (Red)</option>
                  <option value="URGENT">URGENT (Yellow)</option>
                  <option value="SEMI_URGENT">SEMI-URGENT (Green)</option>
                  <option value="NON_URGENT">NON-URGENT (Blue)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Arrival Mode</label>
                <select className="input-field select-field">
                  <option>Ambulance</option>
                  <option>Walk-in</option>
                  <option>Police</option>
                  <option>Referral</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Attendant Name / Contact</label>
                <input type="text" className="input-field" placeholder="Name and Phone" />
              </div>
              <div className="input-group">
                <label className="input-label">Patient UHID (If known)</label>
                <select className="input-field select-field">
                  <option value="">Unknown (John/Jane Doe)</option>
                  {patients.map(p => <option key={p.uhid} value={p.uhid}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ background: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }}>Admit to ER</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="hsl(var(--danger))" /> ER Queue & Active Cases
        </h3>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ER ID</th>
                <th>Patient</th>
                <th>Triage Level</th>
                <th>Time of Arrival</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {emergencyQueue.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.uhid || 'Unknown Patient'}</td>
                  <td>
                    <span className={`badge ${e.triage === 'CRITICAL' ? 'danger' : e.triage === 'URGENT' ? 'warning' : 'success'}`}>
                      {e.triage}
                    </span>
                  </td>
                  <td>{e.time}</td>
                  <td><span className="badge primary">{e.status}</span></td>
                  <td><button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Assess</button></td>
                </tr>
              ))}
              {emergencyQueue.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No active emergency cases.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
